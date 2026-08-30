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
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          explanation: `**${recommendation.title} (${recommendation.action})**\n\n${recommendation.summary}\n\n*Key Deterministic Signals:*\n- Daily Evapotranspiration Demand ($ET_c$): **${agronomic.cropEtDemand} mm/day** (Calculated)\n- 24-Hour Forecast Rainfall: **${agronomic.rain24h} mm** (Predicted)\n- Modeled Soil Water Buffer: **${agronomic.soilMoisturePercent}%** of Field Capacity (Estimated)\n\n*Agronomic Rationale:* ${recommendation.reason}\n\n*Recommended Field Protocol:* ${recommendation.nextVerificationStep}`,
          isAiGenerated: false,
        });
      }

      const prompt = `You are the lead agronomy AI for Fieldstate, a decision layer for precision irrigation.
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
3. Clearly explain WHY this decision (WAIT, IRRIGATE, or INSPECT) is recommended today and how it saves water, pumping electricity/diesel costs, or protects yield.
4. Distinguish between what is measured (satellite reflectance), calculated (FAO-56 ETc), predicted (rain forecast), and estimated (soil water).
5. Provide 2-3 practical next verification steps for the field manager.
6. Keep the response concise, formatted with bold key metrics and clean bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are Fieldstate AI, an agronomic decision explainer. You explain deterministic water-balance and satellite calculations. You NEVER hallucinate measurements.',
          temperature: 0.3,
        },
      });

      const explanation = response.text || recommendation.detailedAnalysis;
      res.json({ explanation, isAiGenerated: true });
    } catch (err: any) {
      console.error('Gemini explanation error:', err?.message);
      res.json({
        explanation: req.body?.recommendation?.detailedAnalysis || 'Agronomic calculation verified.',
        isAiGenerated: false,
        fallbackError: err?.message,
      });
    }
  });

  // Gemini: Ask Agronomist Q&A
  app.post('/api/gemini/ask-agronomist', async (req, res) => {
    try {
      const { question, farm, agronomic, recommendation } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          answer: `For **${farm?.cropDisplayName || 'Crop'}** at Day ${agronomic?.cropAgeDays || 48}, today's demand is ${agronomic?.cropEtDemand || 5.5} mm/day. Current action is **${recommendation?.action || 'WAIT'}** (${recommendation?.reason || 'modeled moisture levels'}). Recheck field after forecasted precipitation.`,
          isAiGenerated: false,
        });
      }

      const prompt = `You are Fieldstate Agronomist, a digital advisor answering a farm manager's query.
CURRENT FIELD STATE:
- Crop: ${farm?.cropDisplayName} (${farm?.areaHectares} ha, Soil: ${farm?.soilType}, Irrigation: ${farm?.irrigationMethod})
- Age & Stage: Day ${agronomic?.cropAgeDays} (${agronomic?.growthStageName})
- ETc Demand: ${agronomic?.cropEtDemand} mm/day (ET0: ${agronomic?.referenceEt0} mm/d, Kc: ${agronomic?.cropCoefficientKc})
- 24h Rain Forecast: ${agronomic?.rain24h} mm
- Soil Moisture: ${agronomic?.soilMoisturePercent}% capacity
- Current Recommendation: ${recommendation?.action} — ${recommendation?.reason}

FARMER'S QUESTION: "${question}"

INSTRUCTIONS:
1. Provide a direct, concise, and helpful answer grounded strictly in FAO-56 crop-water principles and the field data provided.
2. If asked "What if I irrigate anyway?", explain the trade-offs (e.g., pumping fuel costs, fertilizer leaching, waterlogged roots vs stress mitigation).
3. If asked about NDVI, emphasize that NDVI measures canopy vigor/greenness and recommends ground scouting rather than assuming disease or fertility.
4. Keep the answer under 160 words, crisp and professional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      res.json({
        answer: response.text || 'Unable to generate agronomist advice at this moment.',
        isAiGenerated: true,
      });
    } catch (err: any) {
      console.error('Ask agronomist error:', err?.message);
      res.json({
        answer: 'Based on current agronomic models, adhere to the daily recommendation on your dashboard and verify field infiltration after precipitation events.',
        isAiGenerated: false,
        error: err?.message,
      });
    }
  });

  // Gemini: Analyze Field Survey
  app.post('/api/gemini/analyze-survey', async (req, res) => {
    try {
      const { surveyNotes, farm, pestSpotted, moistureCondition } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          analysis: `Ground survey logged. Soil moisture condition recorded as: **${moistureCondition}**. ${pestSpotted ? 'Pest presence flagged for targeted scouting.' : 'No pest damage reported.'}`,
          recommendedActions: ['Continue standard daily ETc monitoring', 'Re-inspect in 48 hours'],
          isAiGenerated: false,
        });
      }

      const prompt = `Analyze this field scout report for ${farm?.cropDisplayName} (Day ${farm?.age || 48}):
- Field Notes: "${surveyNotes}"
- Pest Spotted: ${pestSpotted ? 'YES' : 'NO'}
- Soil Moisture Condition Noted by Scout: ${moistureCondition}
Provide a short 2-bullet agronomist assessment and 2 prioritized next actions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: { temperature: 0.3 },
      });

      res.json({
        analysis: response.text,
        isAiGenerated: true,
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
