import {
  FarmProfile,
  AgronomicState,
  GrowthStageInfo,
  Recommendation,
  NdviReading,
  SoilType,
  IrrigationMethod,
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
      { stage: 'initial', stageName: 'Initial (Transplanting/Vegetative)', dayStart: 0, dayEnd: 20, kc: 1.05, description: 'Early vegetative seedling development and tillering.' },
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
    displayName: 'Orchard / Fruit Trees',
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
  mixed: {
    name: 'mixed',
    displayName: 'Mixed Vegetable',
    totalCycleDays: 90,
    defaultRootDepthM: 0.6,
    stressSensitivity: 'High',
    stages: [
      { stage: 'initial', stageName: 'Initial (Transplant/Establishment)', dayStart: 0, dayEnd: 20, kc: 0.60, description: 'Rooting and early vegetative growth.' },
      { stage: 'development', stageName: 'Development (Vegetative Growth)', dayStart: 21, dayEnd: 45, kc: 0.90, description: 'Rapid leaf development and budding.' },
      { stage: 'mid-season', stageName: 'Mid-Season (Fruiting/Heading)', dayStart: 46, dayEnd: 70, kc: 1.10, description: 'Maximum vegetative density and fruit fill.' },
      { stage: 'late-season', stageName: 'Late-Season (Harvest Phase)', dayStart: 71, dayEnd: 90, kc: 0.85, description: 'Final maturation and succession harvesting.' },
    ],
  },
};

/**
 * Calculate crop age in days from planting date
 */
export function calculateCropAge(plantingDateStr: string, targetDate = new Date()): number {
  const planting = new Date(plantingDateStr);
  const diffTime = targetDate.getTime() - planting.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

/**
 * Lookup growth stage and Kc for a specific crop and age
 */
export function getGrowthStageAndKc(cropKey: string, ageDays: number): GrowthStageInfo {
  const crop = CROP_DATABASE[cropKey.toLowerCase()] || CROP_DATABASE.corn;
  for (const stage of crop.stages) {
    if (ageDays >= stage.dayStart && ageDays <= stage.dayEnd) {
      return stage;
    }
  }
  // If beyond last stage, return late season
  return crop.stages[crop.stages.length - 1];
}

/**
 * Calculate Crop Evapotranspiration ETc = Kc * ET0 (mm/day)
 */
export function calculateEtc(et0: number, kc: number): number {
  return Number((et0 * kc).toFixed(2));
}

/**
 * Convert mm depth of water across hectares to total Litres
 * 1 mm over 1 hectare = 10,000 Litres (1 m3 = 1,000 L, 1 ha = 10,000 m2 => 0.001 m * 10,000 m2 = 10 m3 = 10,000 L)
 */
export function calculateWaterVolumeLitres(waterDepthMm: number, areaHectares: number): number {
  return Math.round(waterDepthMm * areaHectares * 10000);
}

/**
 * Soil water retention characteristics
 */
export const SOIL_CHARACTERISTICS: Record<SoilType, { name: string; availableWaterCapacityMmPerM: number; infiltrationRateMmPerHour: number; multiplier: number }> = {
  sandy: { name: 'Sandy Soil', availableWaterCapacityMmPerM: 80, infiltrationRateMmPerHour: 30, multiplier: 0.85 },
  loam: { name: 'Loam Soil', availableWaterCapacityMmPerM: 140, infiltrationRateMmPerHour: 15, multiplier: 1.0 },
  clay: { name: 'Clay Soil', availableWaterCapacityMmPerM: 180, infiltrationRateMmPerHour: 5, multiplier: 1.15 },
};

/**
 * Irrigation method efficiency
 */
export const IRRIGATION_EFFICIENCIES: Record<IrrigationMethod, { name: string; efficiency: number; description: string }> = {
  drip: { name: 'Drip Irrigation', efficiency: 0.90, description: 'Localized precision emitters with minimal evaporation or drift.' },
  sprinkler: { name: 'Sprinkler System', efficiency: 0.75, description: 'Overhead spray with moderate evaporative and wind losses.' },
  flood: { name: 'Flood / Furrow', efficiency: 0.60, description: 'Surface gravitational flooding with higher deep percolation losses.' },
};

/**
 * Deterministic Decision Engine
 */
export function evaluateFarmDecision(
  farm: FarmProfile,
  agronomic: AgronomicState,
  recentNdvi: NdviReading[] = []
): Recommendation {
  const { cropEtDemand, rain24h, soilMoisturePercent, effectiveRain } = agronomic;
  const latestNdvi = recentNdvi[0];

  // 1. Check for significant NDVI anomaly (INSPECT action)
  if (latestNdvi && latestNdvi.variance <= -0.10) {
    return {
      action: 'INSPECT',
      title: 'Inspection Recommended',
      badgeText: 'Anomaly Detected',
      cropDemandMm: cropEtDemand,
      rainForecast24hMm: rain24h,
      waterRecommendedMm: 0,
      waterRecommendedLitres: 0,
      confidence: 'High',
      reason: `Observed NDVI is consistently tracking ${latestNdvi.variance.toFixed(2)} below the expected growth trajectory.`,
      summary: `Vegetation vigor index indicates potential localized stress in the quadrant. Do not over-apply fertilizer or water blindly before visual field scouting.`,
      detailedAnalysis: `Latest Sentinel-2 observation shows an NDVI of ${latestNdvi.observed.toFixed(2)} against a modeled baseline of ${latestNdvi.expected.toFixed(2)}. This -${Math.abs(latestNdvi.variance * 100).toFixed(0)}% deviation could stem from nutrient deficiency, pest hot-spots, or drainage blockage.`,
      nextVerificationStep: 'Perform a scout survey in the northeast sector and record visual canopy color and root structure.',
    };
  }

  // 2. Check if imminent rainfall offsets demand (WAIT action)
  // If 24h rain >= ETc * 1.5 or rain >= 15mm while moisture is moderate or better
  if (rain24h >= cropEtDemand * 1.3 || (rain24h >= 10 && soilMoisturePercent >= 40)) {
    const litresSaved = calculateWaterVolumeLitres(cropEtDemand, farm.areaHectares);
    return {
      action: 'WAIT',
      title: 'Irrigation Recommendation',
      badgeText: 'WAIT',
      cropDemandMm: cropEtDemand,
      rainForecast24hMm: rain24h,
      waterRecommendedMm: 0,
      waterRecommendedLitres: 0,
      confidence: rain24h >= 20 ? 'High' : 'Medium',
      reason: `${rain24h.toFixed(1)} mm of rainfall is forecast within the next 24 hours, which exceeds the daily crop demand of ${cropEtDemand.toFixed(1)} mm/day.`,
      summary: `Postponing irrigation saves approximately ${litresSaved.toLocaleString()} litres of water today while avoiding nutrient leaching.`,
      detailedAnalysis: `Rain forecast of ${rain24h.toFixed(1)} mm will replenish soil moisture storage naturally. Daily evapotranspiration demand (${cropEtDemand.toFixed(2)} mm) will be satisfied by natural precipitation.`,
      nextVerificationStep: 'Reassess soil infiltration and runoff 12 hours after precipitation concludes.',
      whyChanged: 'Rainfall forecast probability increased, offsetting the need for supplemental application.',
    };
  }

  // 3. Check if soil water is depleted and rainfall is insufficient (IRRIGATE action)
  if (soilMoisturePercent < 55 || (rain24h < 2.0 && cropEtDemand >= 4.0)) {
    // Recommend replenishing crop demand plus a safety margin up to field capacity
    const deficitMm = Math.max(cropEtDemand, Number(((65 - soilMoisturePercent) * 0.2).toFixed(1)));
    const targetMm = Number(Math.min(25, Math.max(4.0, deficitMm)).toFixed(1));
    const efficiency = IRRIGATION_EFFICIENCIES[farm.irrigationMethod]?.efficiency || 0.8;
    const grossTargetMm = Number((targetMm / efficiency).toFixed(1));
    const targetLitres = calculateWaterVolumeLitres(targetMm, farm.areaHectares);

    return {
      action: 'IRRIGATE',
      title: 'Irrigation Required',
      badgeText: 'IRRIGATE',
      cropDemandMm: cropEtDemand,
      rainForecast24hMm: rain24h,
      waterRecommendedMm: targetMm,
      waterRecommendedLitres: targetLitres,
      confidence: 'High',
      reason: `High evapotranspirative demand (${cropEtDemand.toFixed(1)} mm/day) combined with negligible forecast rainfall (${rain24h.toFixed(1)} mm) is driving soil moisture toward the stress threshold.`,
      summary: `Apply ~${targetMm} mm (net) across ${farm.areaHectares} ha (approx. ${targetLitres.toLocaleString()} L) to maintain root-zone moisture in the optimal zone.`,
      detailedAnalysis: `Based on Penman-Monteith ET0 and mid-season crop coefficient (Kc=${agronomic.cropCoefficientKc}), daily demand is ${cropEtDemand.toFixed(2)} mm. With ${farm.irrigationMethod} efficiency at ${(efficiency * 100).toFixed(0)}%, applying ${grossTargetMm} mm gross will offset depletion.`,
      nextVerificationStep: 'Verify drip line pressure or sprinkler coverage during the early morning window to minimize wind drift.',
    };
  }

  // 4. Default: Adequate moisture and moderate weather (WAIT / MONITOR)
  return {
    action: 'WAIT',
    title: 'Moisture Adequate',
    badgeText: 'OPTIMAL',
    cropDemandMm: cropEtDemand,
    rainForecast24hMm: rain24h,
    waterRecommendedMm: 0,
    waterRecommendedLitres: 0,
    confidence: 'Medium',
    reason: `Soil moisture balance (${soilMoisturePercent.toFixed(0)}% capacity) is currently optimal for ${farm.cropDisplayName}.`,
    summary: `No immediate water application is needed today. Continue daily evapotranspiration monitoring.`,
    detailedAnalysis: `Root zone moisture provides sufficient available buffer for the next 24-48 hours.`,
    nextVerificationStep: 'Review 3-day weather trends tomorrow morning.',
  };
}

/**
 * What-If Scenario Simulator:
 * Given a base agronomic state, simulate the resulting soil moisture and net water balance when applying X mm of irrigation
 */
export function simulateIrrigationScenario(baseState: AgronomicState, appliedIrrigationMm: number) {
  const netChange = Number((baseState.effectiveRain + appliedIrrigationMm - baseState.cropEtDemand).toFixed(2));
  // 1 mm net change corresponds to ~2% moisture shift on average loam
  let newMoisturePercent = Math.round(baseState.soilMoisturePercent + netChange * 2.5);
  newMoisturePercent = Math.max(5, Math.min(100, newMoisturePercent));

  let status: 'stress' | 'optimal' | 'saturated' = 'optimal';
  let insightText = '';
  let insightIcon = 'check_circle';
  let insightColor = 'text-primary';

  if (newMoisturePercent < 35) {
    status = 'stress';
    insightIcon = 'warning';
    insightColor = 'text-secondary';
    insightText = 'Warning: Soil moisture approaching wilting point. Crop stress likely.';
  } else if (newMoisturePercent > 85) {
    status = 'saturated';
    insightIcon = 'water_drop';
    insightColor = 'text-tertiary-container';
    insightText = 'Note: Approaching field capacity. Risk of runoff or deep percolation if unexpected rain occurs.';
  } else {
    status = 'optimal';
    insightIcon = 'check_circle';
    insightColor = 'text-primary';
    insightText = appliedIrrigationMm === 0 && baseState.rain24h > 10
      ? 'Optimal range. Forecast rain offsets crop demand without unnecessary water application.'
      : 'Optimal range. This application offsets daily evapotranspirative demand effectively.';
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
