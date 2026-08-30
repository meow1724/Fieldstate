import {
  FarmProfile,
  AgronomicState,
  GrowthStageInfo,
  Recommendation,
  NdviReading,
  SoilType,
  IrrigationMethod,
  DataProvenanceTag,
} from '../types';

export interface CropModelConfig {
  name: string;
  displayName: string;
  totalCycleDays: number;
  stages: GrowthStageInfo[];
  defaultRootDepthM: number;
  stressSensitivity: 'High' | 'Medium' | 'Low';
}

export const CROP_DATABASE: Record<string, CropModelConfig> = {
  rice: {
    name: 'rice',
    displayName: 'Rice (Paddy)',
    totalCycleDays: 120,
    defaultRootDepthM: 0.6,
    stressSensitivity: 'High',
    stages: [
      { stage: 'initial', stageName: 'Initial (Transplanting/Tillering)', dayStart: 0, dayEnd: 20, kc: 1.05, description: 'Early vegetative seedling development and tillering.' },
      { stage: 'development', stageName: 'Development (Tillering/Stem)', dayStart: 21, dayEnd: 45, kc: 1.10, description: 'Rapid leaf area growth and panicle initiation.' },
      { stage: 'mid-season', stageName: 'Mid-Season (Panicle/Flowering)', dayStart: 46, dayEnd: 85, kc: 1.15, description: 'Peak water demand during heading and flowering.' },
      { stage: 'late-season', stageName: 'Late-Season (Ripening/Maturity)', dayStart: 86, dayEnd: 120, kc: 0.90, description: 'Grain filling and dry-down before harvest.' },
    ],
  },
  corn: {
    name: 'corn',
    displayName: 'Field Corn (Maize)',
    totalCycleDays: 130,
    defaultRootDepthM: 1.2,
    stressSensitivity: 'High',
    stages: [
      { stage: 'initial', stageName: 'Initial (Emergence/V2-V4)', dayStart: 0, dayEnd: 25, kc: 0.70, description: 'Seedling emergence and early leaf collar development.' },
      { stage: 'development', stageName: 'Development (V6-V12 Rapid Growth)', dayStart: 26, dayEnd: 55, kc: 1.00, description: 'Rapid canopy closure and root deepening.' },
      { stage: 'mid-season', stageName: 'Mid-Season (Tasseling/Silking)', dayStart: 56, dayEnd: 95, kc: 1.15, description: 'Critical pollination window; highest water sensitivity.' },
      { stage: 'late-season', stageName: 'Late-Season (Dent/Black Layer)', dayStart: 96, dayEnd: 130, kc: 0.85, description: 'Grain dry down and physiological maturity.' },
    ],
  },
  wheat: {
    name: 'wheat',
    displayName: 'Winter Wheat',
    totalCycleDays: 180,
    defaultRootDepthM: 1.0,
    stressSensitivity: 'Medium',
    stages: [
      { stage: 'initial', stageName: 'Initial (Germination & Tillering)', dayStart: 0, dayEnd: 40, kc: 0.70, description: 'Early root establishment and vegetative tillering.' },
      { stage: 'development', stageName: 'Development (Stem Elongation/Jointing)', dayStart: 41, dayEnd: 80, kc: 1.00, description: 'Rapid stem elongation and boot stage.' },
      { stage: 'mid-season', stageName: 'Mid-Season (Heading & Anthesis)', dayStart: 81, dayEnd: 135, kc: 1.15, description: 'Flowering and milk stage.' },
      { stage: 'late-season', stageName: 'Late-Season (Dough/Ripening)', dayStart: 136, dayEnd: 180, kc: 0.65, description: 'Grain ripening and desiccation.' },
    ],
  },
  soybeans: {
    name: 'soybeans',
    displayName: 'Soybeans',
    totalCycleDays: 110,
    defaultRootDepthM: 0.9,
    stressSensitivity: 'Medium',
    stages: [
      { stage: 'initial', stageName: 'Initial (Emergence/V1-V3)', dayStart: 0, dayEnd: 20, kc: 0.40, description: 'Nodule formation and vegetative node accumulation.' },
      { stage: 'development', stageName: 'Development (V4-R1 Flowering)', dayStart: 21, dayEnd: 50, kc: 0.85, description: 'Canopy spread and first flower blooms.' },
      { stage: 'mid-season', stageName: 'Mid-Season (R2-R5 Pod Fill)', dayStart: 51, dayEnd: 85, kc: 1.15, description: 'Pod expansion and seed development.' },
      { stage: 'late-season', stageName: 'Late-Season (R6-R8 Maturity)', dayStart: 86, dayEnd: 110, kc: 0.50, description: 'Leaf drop and pod dry-down.' },
    ],
  },
  orchard: {
    name: 'orchard',
    displayName: 'Fruit Orchard / Almonds',
    totalCycleDays: 365,
    defaultRootDepthM: 1.5,
    stressSensitivity: 'Medium',
    stages: [
      { stage: 'initial', stageName: 'Initial (Bud Break & Bloom)', dayStart: 0, dayEnd: 60, kc: 0.65, description: 'Spring bud burst and early pollination.' },
      { stage: 'development', stageName: 'Development (Fruit Set)', dayStart: 61, dayEnd: 140, kc: 0.90, description: 'Foliage development and early fruit sizing.' },
      { stage: 'mid-season', stageName: 'Mid-Season (Fruit Maturation)', dayStart: 141, dayEnd: 240, kc: 1.05, description: 'Full canopy transpiration and fruit swelling.' },
      { stage: 'late-season', stageName: 'Late-Season (Post-Harvest/Dormancy)', dayStart: 241, dayEnd: 365, kc: 0.70, description: 'Nutrient storage and winter dormancy.' },
    ],
  },
  vineyard: {
    name: 'vineyard',
    displayName: 'Vineyard (Grapes)',
    totalCycleDays: 240,
    defaultRootDepthM: 1.8,
    stressSensitivity: 'Low',
    stages: [
      { stage: 'initial', stageName: 'Initial (Budbreak to Flowering)', dayStart: 0, dayEnd: 45, kc: 0.35, description: 'Shoot emergence and cluster development.' },
      { stage: 'development', stageName: 'Development (Fruit Set to Véraison)', dayStart: 46, dayEnd: 110, kc: 0.65, description: 'Berry growth and color change.' },
      { stage: 'mid-season', stageName: 'Mid-Season (Véraison to Harvest)', dayStart: 111, dayEnd: 180, kc: 0.75, description: 'Sugar accumulation and phenolic ripening.' },
      { stage: 'late-season', stageName: 'Late-Season (Post-Harvest Senescence)', dayStart: 181, dayEnd: 240, kc: 0.45, description: 'Carbohydrate mobilization to roots.' },
    ],
  },
};

export function calculateCropAge(plantingDateStr: string, targetDate = new Date()): number {
  const planting = new Date(plantingDateStr);
  const diffTime = targetDate.getTime() - planting.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

export function getGrowthStageAndKc(cropKey: string, ageDays: number): GrowthStageInfo {
  const crop = CROP_DATABASE[cropKey.toLowerCase()] || CROP_DATABASE.rice;
  for (const stage of crop.stages) {
    if (ageDays >= stage.dayStart && ageDays <= stage.dayEnd) {
      return stage;
    }
  }
  return crop.stages[crop.stages.length - 1];
}

export function calculateEtc(et0: number, kc: number): number {
  return Number((et0 * kc).toFixed(2));
}

export function calculateWaterVolumeLitres(waterDepthMm: number, areaHectares: number): number {
  // 1 mm over 1 ha = 10 m3 = 10,000 Litres
  return Math.round(waterDepthMm * areaHectares * 10000);
}

export const SOIL_CHARACTERISTICS: Record<SoilType, { name: string; availableWaterCapacityMmPerM: number; infiltrationRateMmPerHour: number; multiplier: number }> = {
  sandy: { name: 'Sandy Soil', availableWaterCapacityMmPerM: 80, infiltrationRateMmPerHour: 30, multiplier: 0.85 },
  loam: { name: 'Loam Soil', availableWaterCapacityMmPerM: 140, infiltrationRateMmPerHour: 15, multiplier: 1.0 },
  clay: { name: 'Clay Soil', availableWaterCapacityMmPerM: 180, infiltrationRateMmPerHour: 5, multiplier: 1.15 },
};

export const IRRIGATION_EFFICIENCIES: Record<IrrigationMethod, { name: string; efficiency: number; description: string }> = {
  drip: { name: 'Drip Irrigation', efficiency: 0.90, description: 'Targeted root-zone emitters with 90% application efficiency.' },
  sprinkler: { name: 'Center Pivot / Sprinkler', efficiency: 0.75, description: 'Overhead spray with 75% efficiency (wind & evaporation loss).' },
  flood: { name: 'Flood / Basin', efficiency: 0.60, description: 'Basin gravitation flooding with 60% efficiency (percolation & runoff).' },
};

/**
 * Pumping Energy & Cost Calculator (Hydraulic Physics Model)
 * Energy (kWh) = (Volume_m3 * 9.81 * Head_meters) / (3600 * Pump_Efficiency)
 */
export function calculatePumpingEnergyAndCost(
  waterVolumeM3: number,
  headMeters = 30,
  pumpType: 'diesel' | 'electric_grid' | 'solar' = 'electric_grid',
  tariffPerKwh = 0.16
): {
  energyKwh: number;
  costDollars: number;
  co2eKg: number;
} {
  const pumpEfficiency = 0.65; // standard agricultural pump efficiency
  const energyKwh = Number(((waterVolumeM3 * 9.81 * headMeters) / (3600 * pumpEfficiency)).toFixed(1));

  let costDollars = 0;
  let co2eKg = 0;

  if (pumpType === 'diesel') {
    // ~0.35 L diesel per kWh hydraulic work; $1.15/L diesel; 2.68 kg CO2e / L
    const dieselLitres = energyKwh * 0.35;
    costDollars = Number((dieselLitres * 1.25).toFixed(2));
    co2eKg = Number((dieselLitres * 2.68).toFixed(1));
  } else if (pumpType === 'solar') {
    costDollars = Number((energyKwh * 0.02).toFixed(2)); // O&M depreciation
    co2eKg = Number((energyKwh * 0.04).toFixed(1));
  } else {
    // Grid electricity (US/Global avg 0.42 kg CO2e / kWh)
    costDollars = Number((energyKwh * tariffPerKwh).toFixed(2));
    co2eKg = Number((energyKwh * 0.45).toFixed(1));
  }

  return { energyKwh, costDollars, co2eKg };
}

/**
 * Deterministic Decision Engine implementing the Fieldstate 3-signal model:
 * Weather + Satellite NDVI + FAO-56 Crop Science -> One Decision (WAIT, IRRIGATE, INSPECT)
 */
export function evaluateFarmDecision(
  farm: FarmProfile,
  agronomic: AgronomicState,
  recentNdvi: NdviReading[] = []
): Recommendation {
  const { cropEtDemand, rain24h, soilMoisturePercent } = agronomic;
  const latestNdvi = recentNdvi[0];
  const isCloudGap = Boolean(latestNdvi?.isCloudGapFallback);

  // Provenance metadata objects
  const provenance = {
    demand: {
      type: 'CALCULATED' as const,
      label: 'Calculated',
      source: 'FAO-56 Penman-Monteith ($ET_c = K_c \\times ET_0$)',
      description: `Reference ET0 (${agronomic.referenceEt0} mm) multiplied by growth stage coefficient Kc (${agronomic.cropCoefficientKc}).`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    rain: {
      type: 'PREDICTED' as const,
      label: 'Predicted',
      source: 'Open-Meteo High-Resolution NWP Radar Model',
      description: `24-hour quantitative precipitation forecast at Lat ${farm.latitude.toFixed(3)}, Lon ${farm.longitude.toFixed(3)}.`,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    satellite: {
      type: isCloudGap ? ('ESTIMATED' as const) : ('MEASURED' as const),
      label: isCloudGap ? 'Estimated (Cloud Gap)' : 'Measured',
      source: isCloudGap ? 'Lag-Interpolated Sentinel-2 Baseline' : 'ESA Copernicus Sentinel-2 Multispectral (10m)',
      description: isCloudGap
        ? 'Recent satellite passes had heavy cloud cover (>60%). System downgraded confidence and uses trailing optical baseline.'
        : `Normalized Difference Vegetation Index (NIR - Red)/(NIR + Red) aggregated over ${farm.areaHectares} ha polygon.`,
      badgeColor: isCloudGap ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-purple-100 text-purple-900 border-purple-300',
    },
    soil: {
      type: 'ESTIMATED' as const,
      label: 'Estimated Status',
      source: 'Dynamic Profile Water-Balance Model',
      description: `Root zone water storage estimate ($S_t = S_{t-1} + R + I - ET_c$). Note: Not a physical underground probe measurement.`,
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
    },
  };

  // Signal 1: Significant NDVI Drop / Anomaly (INSPECT)
  if (latestNdvi && latestNdvi.variance <= -0.09 && !isCloudGap) {
    return {
      action: 'INSPECT',
      title: 'Ground Inspection Recommended',
      badgeText: 'INSPECT',
      cropDemandMm: cropEtDemand,
      rainForecast24hMm: rain24h,
      waterRecommendedMm: 0,
      waterRecommendedLitres: 0,
      confidence: 'High',
      confidenceReason: 'Clean Sentinel-2 optical scene (<10% cloud cover) confirmed anomalous vegetative vigor decline.',
      reason: `Observed NDVI (${latestNdvi.observed.toFixed(2)}) is tracking ${(Math.abs(latestNdvi.variance) * 100).toFixed(0)}% below expected trajectory for ${farm.cropDisplayName}.`,
      summary: `Vegetation vigor drop cannot be solely resolved by blind irrigation. Ground scouting recommended before applying inputs.`,
      detailedAnalysis: `Sentinel-2 reflectance shows observed NDVI at ${latestNdvi.observed.toFixed(2)} against the modeled baseline of ${latestNdvi.expected.toFixed(2)}. This could indicate localized nutrient deficiency, weed hotspots, or pest emergence.`,
      nextVerificationStep: 'Scout quadrant parcels, check root health, and document leaf chlorosis in a field survey.',
      provenance,
    };
  }

  // Signal 2: Imminent Rainfall covers demand (WAIT)
  // If 24h Rain >= ETc * 1.2 or (Rain >= 12mm and soil not critically dry)
  if (rain24h >= cropEtDemand * 1.2 || (rain24h >= 10 && soilMoisturePercent >= 38)) {
    const avoidedLitres = calculateWaterVolumeLitres(cropEtDemand, farm.areaHectares);
    const avoidedM3 = avoidedLitres / 1000;
    const { energyKwh, costDollars, co2eKg } = calculatePumpingEnergyAndCost(
      avoidedM3,
      farm.pumpingHeadMeters || 30,
      farm.pumpType || 'electric_grid',
      farm.energyTariffPerKwh || 0.16
    );

    return {
      action: 'WAIT',
      title: 'Rain Forecast Covers Demand — Do Not Irrigate',
      badgeText: 'WAIT',
      cropDemandMm: cropEtDemand,
      rainForecast24hMm: rain24h,
      waterRecommendedMm: 0,
      waterRecommendedLitres: 0,
      confidence: isCloudGap ? 'Medium' : rain24h >= 20 ? 'High' : 'Medium',
      confidenceReason: isCloudGap
        ? 'Confidence: Medium — based primarily on weather radar model because satellite scenes were cloud-covered.'
        : 'High radar probability (>80%) and substantial forecast precipitation.',
      reason: `Forecast rain (${rain24h.toFixed(1)} mm) exceeds daily crop water demand (${cropEtDemand.toFixed(1)} mm/day).`,
      summary: `Holding irrigation today saves ~${avoidedLitres.toLocaleString()} L of water, ${energyKwh} kWh of pumping energy ($${costDollars.toFixed(2)}), and avoids fertilizer leaching.`,
      detailedAnalysis: `Atmospheric precipitation of ${rain24h.toFixed(1)} mm will satisfy profile evapotranspiration naturally. Pumping irrigation water prior to rain causes deep runoff and root waterlogging.`,
      nextVerificationStep: 'Recheck field 12 hours after precipitation event to measure actual rainfall infiltration.',
      whyChanged: 'Rainfall forecast probability increased, offsetting the need for supplemental pumping.',
      provenance,
    };
  }

  // Signal 3: Water Status Low & Negligible Rain (IRRIGATE)
  if (soilMoisturePercent < 55 || (rain24h < 2.0 && cropEtDemand >= 4.0)) {
    const deficitMm = Math.max(cropEtDemand, Number(((65 - soilMoisturePercent) * 0.25).toFixed(1)));
    const targetMm = Number(Math.min(25, Math.max(4.0, deficitMm)).toFixed(1));
    const efficiency = IRRIGATION_EFFICIENCIES[farm.irrigationMethod]?.efficiency || 0.8;
    const grossTargetMm = Number((targetMm / efficiency).toFixed(1));
    const targetLitres = calculateWaterVolumeLitres(targetMm, farm.areaHectares);

    return {
      action: 'IRRIGATE',
      title: 'Deficit Replenishment Required',
      badgeText: 'IRRIGATE',
      cropDemandMm: cropEtDemand,
      rainForecast24hMm: rain24h,
      waterRecommendedMm: targetMm,
      waterRecommendedLitres: targetLitres,
      confidence: isCloudGap ? 'Medium' : 'High',
      confidenceReason: isCloudGap
        ? 'Confidence: Medium — Water balance deficit confirmed; satellite optical confirmation pending cloud clearance.'
        : 'Water balance deficit verified with stable NDVI vigor.',
      reason: `Evapotranspiration demand (${cropEtDemand.toFixed(1)} mm/day) exceeds negligible forecast rain (${rain24h.toFixed(1)} mm). Soil moisture approaching stress threshold.`,
      summary: `Apply ~${targetMm} mm (${targetLitres.toLocaleString()} L across ${farm.areaHectares} ha) to maintain root-zone moisture in the optimal zone.`,
      detailedAnalysis: `Based on Penman-Monteith ET0 (${agronomic.referenceEt0} mm/day) and crop coefficient ($K_c=${agronomic.cropCoefficientKc}$), profile is losing ${cropEtDemand.toFixed(1)} mm daily. Applying ${grossTargetMm} mm gross accounts for ${(efficiency * 100).toFixed(0)}% system efficiency.`,
      nextVerificationStep: 'Run irrigation during early morning or evening to minimize evaporative drift loss.',
      provenance,
    };
  }

  // Signal 4: Adequate moisture baseline (WAIT / MONITOR)
  return {
    action: 'WAIT',
    title: 'Moisture Profile Adequate — Monitor',
    badgeText: 'WAIT',
    cropDemandMm: cropEtDemand,
    rainForecast24hMm: rain24h,
    waterRecommendedMm: 0,
    waterRecommendedLitres: 0,
    confidence: isCloudGap ? 'Medium' : 'High',
    confidenceReason: 'Soil buffer is optimal for current growth stage.',
    reason: `Soil moisture buffer (${soilMoisturePercent.toFixed(0)}% capacity) is adequate for current crop stage.`,
    summary: `No water application needed today. Continue standard monitoring.`,
    detailedAnalysis: `Root zone contains sufficient available water buffer for the next 24-48 hours.`,
    nextVerificationStep: 'Review 3-day weather and solar radiation tomorrow morning.',
    provenance,
  };
}

export function simulateIrrigationScenario(baseState: AgronomicState, appliedIrrigationMm: number) {
  const netChange = Number((baseState.effectiveRain + appliedIrrigationMm - baseState.cropEtDemand).toFixed(2));
  let newMoisturePercent = Math.round(baseState.soilMoisturePercent + netChange * 2.5);
  newMoisturePercent = Math.max(5, Math.min(100, newMoisturePercent));

  let status: 'stress' | 'optimal' | 'saturated' = 'optimal';
  let insightText = '';
  let insightIcon = 'check_circle';
  let insightColor = 'text-emerald-700';

  if (newMoisturePercent < 35) {
    status = 'stress';
    insightIcon = 'warning';
    insightColor = 'text-amber-600';
    insightText = 'Warning: Soil moisture approaching wilting point. Crop stress likely.';
  } else if (newMoisturePercent > 85) {
    status = 'saturated';
    insightIcon = 'water_drop';
    insightColor = 'text-cyan-700';
    insightText = 'Caution: Soil approaching saturation. High risk of runoff and nutrient leaching.';
  } else {
    status = 'optimal';
    insightIcon = 'check_circle';
    insightColor = 'text-emerald-700';
    insightText = appliedIrrigationMm === 0 && baseState.rain24h > 10
      ? 'Optimal range. Forecast rain naturally offsets crop water demand.'
      : 'Optimal range. Water application replenishes root zone without waste.';
  }

  return {
    appliedIrrigationMm,
    netChange,
    newMoisturePercent,
    status,
    insightText,
    insightIcon,
    insightColor,
  };
}
