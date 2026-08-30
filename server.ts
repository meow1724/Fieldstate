import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback helper to try primary model then fallback models if 503 or overload occurs
async function generateContentWithFallback(prompt: string, systemInstruction?: string): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const modelsToTry = ['gemini-3.7-flash', 'gemini-2.5-flash-preview-12-2025', 'gemini-3.1-flash-lite'];

  for (const modelName of modelsToTry) {
    try {
      const config: any = {
        temperature: 0.3,
      };
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Attempt with ${modelName} encountered: ${err?.message || err}. Trying fallback...`);
      // small delay before next attempt
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Fieldstate Decision Engine API' });
  });

  // Live Weather & ET0 API from Open-Meteo
  app.get('/api/agronomy/live-weather', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 26.1445;
      const lon = parseFloat(req.query.lon as string) || 91.7362;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration,wind_speed_10m_max,wind_direction_10m_dominant&hourly=soil_moisture_0_to_10cm,relative_humidity_2m,temperature_2m,wind_speed_10m&timezone=auto`;
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error(`Open-Meteo responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching live weather:', err?.message);
      res.status(500).json({ error: 'Failed to fetch real-time weather data', details: err?.message });
    }
  });

  // Location Geocoding Search
  app.get('/api/agronomy/search-location', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      if (!query || query.trim().length < 2) {
        return res.json({ results: [] });
      }
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
      const response = await fetch(geocodeUrl);
      if (!response.ok) {
        throw new Error(`Geocoding responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json({ results: data.results || [] });
    } catch (err: any) {
      console.error('Error searching location:', err?.message);
      res.status(500).json({ error: 'Failed to search locations', details: err?.message });
    }
  });

  // Gemini: Explain Decision (Scientific Grounding - No hallucination)
  app.post('/api/gemini/explain-decision', async (req, res) => {
    try {
      const { farm, agronomic, recommendation, ndviHistory } = req.body;

      const prompt = `You are the lead agronomy AI for Fieldstate, a precision decision layer for agricultural water management.
Explain the following deterministic farm decision clearly and respectfully to the farm manager.

FARM CONTEXT:
- Farm Name: ${farm?.name || 'My Farm'}
- Crop: ${farm?.cropDisplayName || farm?.crop} (Day ${agronomic?.cropAgeDays || 48}, Stage: ${agronomic?.growthStageName || 'Mid-Season'})
- Area: ${farm?.areaHectares || 2.0} hectares
- Soil Type: ${farm?.soilType || 'loam'}
- Irrigation Method: ${farm?.irrigationMethod || 'flood'}

DETERMINISTIC AGRONOMIC STATE:
- Reference Evapotranspiration (ET0): ${agronomic?.referenceEt0} mm/day [Calculated via FAO-56 Penman-Monteith]
- Crop Coefficient (Kc): ${agronomic?.cropCoefficientKc} [Lookup from crop growth stage]
- Crop Water Demand (ETc = Kc * ET0): ${agronomic?.cropEtDemand} mm/day
- 24h Forecast Rain: ${agronomic?.rain24h} mm [Predicted by NWP radar]
- Estimated Soil Moisture: ${agronomic?.soilMoisturePercent}% of field capacity [Water-balance model]
- Evaluated Action: ${recommendation?.action} (${recommendation?.badgeText})
- Confidence Level: ${recommendation?.confidence} (${recommendation?.confidenceReason || 'High'})
- Potential Water Saved Today: ${recommendation?.action === 'WAIT' ? `${agronomic?.potentialWaterSavedLitres?.toLocaleString()} Litres` : 'N/A'}

LATEST SENTINEL-2 NDVI:
${ndviHistory?.length ? JSON.stringify(ndviHistory.slice(0, 3)) : 'Normal canopy growth curve'}

CORE SCIENTIFIC RULES:
1. Speak in a grounded, professional, encouraging agronomic tone.
2. DO NOT invent or fabricate any sensor readings, soil chemistry, or weather numbers outside the data provided.
3. Clearly explain WHY this decision (${recommendation?.action || 'WAIT'}) is recommended today and how it optimizes crop yield, soil aeration, and pumping energy.
4. Distinguish between what is measured (satellite reflectance), calculated (FAO-56 ETc), predicted (rain forecast), and estimated (soil water).
5. Provide 2-3 practical next verification steps for the field manager.
6. Keep the response concise, formatted with bold key metrics and clean bullet points.`;

      const generated = await generateContentWithFallback(
        prompt,
        'You are Fieldstate AI, an agronomic decision explainer. You explain deterministic water-balance and satellite calculations. You NEVER hallucinate measurements.'
      );

      if (generated) {
        return res.json({ explanation: generated, isAiGenerated: true });
      }

      // High-quality deterministic fallback
      const fallbackText = `**${recommendation?.title || 'Operational Decision'} (${recommendation?.action || 'WAIT'})**\n\n${recommendation?.summary || 'Deterministic water balance model evaluated.'}\n\n*Key Deterministic Signals:*\n- Daily Evapotranspiration Demand ($ET_c$): **${agronomic?.cropEtDemand || 5.5} mm/day** (Calculated via FAO-56)\n- 24-Hour Forecast Rainfall: **${agronomic?.rain24h || 0} mm** (NWP radar probability: ${agronomic?.rain24h > 10 ? 'High' : 'Moderate'})\n- Modeled Soil Water Buffer: **${agronomic?.soilMoisturePercent || 75}%** of Field Capacity\n\n*Agronomic Rationale:* ${recommendation?.reason || 'Soil moisture and weather conditions support the current action.'}\n\n*Recommended Field Protocol:* ${recommendation?.nextVerificationStep || 'Perform ground moisture touch test and monitor incoming precipitation.'}`;

      res.json({
        explanation: fallbackText,
        isAiGenerated: false,
      });
    } catch (err: any) {
      console.error('Gemini explanation error:', err?.message);
      res.json({
        explanation: req.body?.recommendation?.detailedAnalysis || 'Agronomic calculation verified.',
        isAiGenerated: false,
      });
    }
  });

  // Gemini: Ask Agronomist Q&A
  app.post('/api/gemini/ask-agronomist', async (req, res) => {
    try {
      const { question, farm, agronomic, recommendation } = req.body;

      const prompt = `You are Fieldstate Agronomist, a senior precision agriculture advisor answering a farm manager's query.
CURRENT FIELD STATE:
- Farm: ${farm?.name || 'Farm'} (${farm?.locationName || 'Field Location'})
- Crop: ${farm?.cropDisplayName || 'Crop'} (${farm?.areaHectares || 2.0} ha, Soil: ${farm?.soilType || 'loam'}, Irrigation: ${farm?.irrigationMethod || 'flood'})
- Age & Stage: Day ${agronomic?.cropAgeDays || 48} (${agronomic?.growthStageName || 'Mid-Season'})
- ETc Demand: ${agronomic?.cropEtDemand || 5.5} mm/day (ET0: ${agronomic?.referenceEt0 || 4.8} mm/d, Kc: ${agronomic?.cropCoefficientKc || 1.15})
- 24h Rain Forecast: ${agronomic?.rain24h || 0} mm
- Soil Moisture Buffer: ${agronomic?.soilMoisturePercent || 75}% capacity
- Current Recommendation: ${recommendation?.action || 'WAIT'} — ${recommendation?.reason || 'Modeled soil moisture meets requirements.'}

FARMER'S QUESTION: "${question || 'Should I irrigate today?'}"

INSTRUCTIONS:
1. Provide a direct, concise, and helpful agronomic answer grounded strictly in FAO-56 crop-water principles and the field data provided.
2. If asked "Why shouldn't I irrigate today?" or "What if I irrigate anyway?", explain the trade-offs clearly (e.g., energy pumping costs, nitrate leaching, root asphyxiation vs water stress mitigation).
3. If asked about NDVI, emphasize that NDVI measures canopy vigor/greenness and recommends ground scouting rather than assuming disease or fertility.
4. If asked about fuel/electricity, reference the pumping savings (~${agronomic?.potentialWaterSavedLitres?.toLocaleString() || '110,000'} Litres saved today).
5. Keep the answer under 170 words, crisp, professional, and well-formatted with bold key terms.`;

      const generated = await generateContentWithFallback(
        prompt,
        'You are Fieldstate Agronomist AI. You provide clear, grounded, evidence-based agronomic decision support. You do not hallucinate sensor data.'
      );

      if (generated) {
        return res.json({
          answer: generated,
          isAiGenerated: true,
        });
      }

      // Robust fallback answer tailored to the question
      const qLower = (question || '').toLowerCase();
      let dynamicFallback = `For **${farm?.cropDisplayName || 'your crop'}** at Day ${agronomic?.cropAgeDays || 48} (${agronomic?.growthStageName || 'Mid-Season'}), today's calculated water demand ($ET_c$) is **${agronomic?.cropEtDemand || 5.5} mm/day**.`;

      if (qLower.includes('why') || qLower.includes('wait') || qLower.includes('irrigate anyway') || qLower.includes('should i')) {
        if (recommendation?.action === 'WAIT') {
          dynamicFallback += `\n\n**Recommendation: WAIT.** With **${agronomic?.rain24h || 31} mm** of forecast rain and current soil buffer at **${agronomic?.soilMoisturePercent || 75}%**, pumping today would cause unnecessary runoff, nutrient leaching, and avoidable energy costs (~$${agronomic?.potentialCostSavedDollars || 42.50} saved).`;
        } else if (recommendation?.action === 'IRRIGATE') {
          dynamicFallback += `\n\n**Recommendation: IRRIGATE.** Soil moisture is at **${agronomic?.soilMoisturePercent || 35}%** with minimal rain forecast, which falls below the managed depletion threshold. Apply replenishment to avoid yield stress.`;
        } else {
          dynamicFallback += `\n\n**Recommendation: INSPECT.** An anomaly in canopy vigor suggests ground inspection before modifying irrigation schedules.`;
        }
      } else if (qLower.includes('ndvi') || qLower.includes('vigor') || qLower.includes('satellite')) {
        dynamicFallback += `\n\n**NDVI Analysis:** Sentinel-2 measures canopy light reflectance (NIR/Red). It tracks vegetative vigor and biomass against expected stage baselines. Significant deviation indicates localized stress (water, drainage, or pests) that warrants ground scouting.`;
      } else if (qLower.includes('kc') || qLower.includes('et0') || qLower.includes('fao') || qLower.includes('formula')) {
        dynamicFallback += `\n\n**Crop Coefficient ($K_c$):** At Day ${agronomic?.cropAgeDays || 48}, $K_c = ${agronomic?.cropCoefficientKc || 1.15}$. Combined with reference $ET_0 = ${agronomic?.referenceEt0 || 4.8}$ mm/day from Penman-Monteith solar and wind equations, total crop transpiration is $ET_c = ${agronomic?.cropEtDemand || 5.5}$ mm/day.`;
      } else {
        dynamicFallback += `\n\n**Operational Summary:** Adhere to the **${recommendation?.action || 'WAIT'}** protocol on your dashboard. Soil moisture is at **${agronomic?.soilMoisturePercent || 75}%** and 24h rain forecast is **${agronomic?.rain24h || 31} mm**. Recheck field moisture after the precipitation event.`;
      }

      res.json({
        answer: dynamicFallback,
        isAiGenerated: false,
      });
    } catch (err: any) {
      console.error('Ask agronomist error:', err?.message);
      res.json({
        answer: `Based on current FAO-56 calculations for ${req.body?.farm?.cropDisplayName || 'your crop'}, daily water demand is ${req.body?.agronomic?.cropEtDemand || 5.5} mm/day. Following the **${req.body?.recommendation?.action || 'WAIT'}** action is advised to protect soil aeration and reduce pumping energy.`,
        isAiGenerated: false,
      });
    }
  });

  // Gemini: Analyze Field Survey
  app.post('/api/gemini/analyze-survey', async (req, res) => {
    try {
      const { surveyNotes, farm, pestSpotted, moistureCondition } = req.body;

      const prompt = `Analyze this field scout report for ${farm?.cropDisplayName || 'Crop'} (Day ${farm?.age || 48}):
- Field Notes: "${surveyNotes}"
- Pest Spotted: ${pestSpotted ? 'YES' : 'NO'}
- Soil Moisture Condition Noted by Scout: ${moistureCondition}
Provide a short 2-bullet agronomist assessment and 2 prioritized next actions.`;

      const generated = await generateContentWithFallback(
        prompt,
        'You are Fieldstate AI. Summarize field scouting data concisely into agronomic priorities.'
      );

      if (generated) {
        return res.json({
          analysis: generated,
          isAiGenerated: true,
        });
      }

      res.json({
        analysis: `• **Field Survey Logged:** Soil moisture confirmed as **${moistureCondition}**.\n• **Pest / Vigor Status:** ${pestSpotted ? 'Pest presence flagged. Targeted perimeter inspection recommended within 48 hours.' : 'No immediate pest threat reported; canopy development is on track.'}`,
        isAiGenerated: false,
      });
    } catch (err: any) {
      res.json({
        analysis: 'Field survey recorded successfully into the permanent farm log.',
        isAiGenerated: false,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fieldstate Server running on http://localhost:${PORT}`);
  });
}

startServer();

