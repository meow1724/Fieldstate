export type SoilType = 'sandy' | 'loam' | 'clay';
export type IrrigationMethod = 'drip' | 'sprinkler' | 'flood';
export type GrowthStage = 'initial' | 'development' | 'mid-season' | 'late-season';
export type ActionType = 'WAIT' | 'IRRIGATE' | 'INSPECT';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type DataProvenanceType = 'MEASURED' | 'CALCULATED' | 'PREDICTED' | 'ESTIMATED';

export interface DataProvenanceTag {
  type: DataProvenanceType;
  label: string;
  source: string;
  description: string;
  badgeColor: string;
}

export interface FarmProfile {
  id: string;
  name: string;
  crop: string;
  cropDisplayName: string;
  plantingDate: string; // YYYY-MM-DD
  areaHectares: number;
  soilType: SoilType;
  irrigationMethod: IrrigationMethod;
  latitude: number;
  longitude: number;
  locationName: string;
  hardinessZone: string;
  // Energy & Economic parameters
  pumpType: 'diesel' | 'electric_grid' | 'solar';
  energyTariffPerKwh: number; // e.g. $0.16/kWh or $3.80/gal diesel
  pumpingHeadMeters: number; // e.g. 35 meters lift
}

export interface GrowthStageInfo {
  stage: GrowthStage;
  stageName: string;
  dayStart: number;
  dayEnd: number;
  kc: number;
  description: string;
}

export interface AgronomicState {
  cropAgeDays: number;
  growthStage: GrowthStage;
  growthStageName: string;
  referenceEt0: number; // mm/day (Calculated via Penman-Monteith)
  cropCoefficientKc: number; // Agronomic lookup
  cropEtDemand: number; // ETc = Kc * ET0 (mm/day)
  rain24h: number; // mm (Predicted by atmospheric models)
  rain3d: number; // mm
  effectiveRain: number; // mm
  irrigationAppliedToday: number; // mm
  netWaterChange: number; // delta S = R + I - ETc (mm)
  soilMoisturePercent: number; // 0-100% of field capacity
  rootZoneDepletion: number; // mm
  availableWater: number; // mm
  waterStatus: 'optimal' | 'moderate' | 'dry' | 'stress' | 'saturated';
  // Economic & Ecological impact of today's recommendation
  potentialWaterSavedLitres: number;
  potentialCostSavedDollars: number;
  potentialCo2SavedKg: number;
  potentialPumpingKwhSaved: number;
}

export interface NdviReading {
  date: string;
  observed: number;
  expected: number;
  variance: number; // e.g. -0.14 = 14% below expected
  status: 'Normal' | 'Monitoring' | 'High Deviation';
  cloudCoverPercent?: number;
  satellite?: string;
  resolution?: string;
  isCloudGapFallback?: boolean;
}

export interface SatelliteImageMeta {
  source: string;
  acquisitionDate: string;
  resolution: string;
  cloudCoverPercent: number;
  imageUrl: string;
  altText: string;
  isCloudCovered: boolean;
}

export interface Recommendation {
  action: ActionType;
  title: string;
  badgeText: string;
  cropDemandMm: number;
  rainForecast24hMm: number;
  waterRecommendedMm: number;
  waterRecommendedLitres: number;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  reason: string;
  summary: string;
  detailedAnalysis: string;
  nextVerificationStep: string;
  whyChanged?: string;
  // Provenance highlights
  provenance: {
    demand: DataProvenanceTag;
    rain: DataProvenanceTag;
    satellite: DataProvenanceTag;
    soil: DataProvenanceTag;
  };
}

export interface WeatherDay {
  dayLabel: string;
  fullDate: string;
  condition: string;
  icon: string;
  pop: number; // %
  rainMm: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeedKmh: number;
  windDirection: string;
  et0: number;
}

export interface FieldSurvey {
  id: string;
  farmId: string;
  date: string;
  surveyor: string;
  observations: string;
  pestSpotted: boolean;
  pestNotes?: string;
  moistureCondition: 'Dry' | 'Optimal' | 'Saturated';
  anomalyFollowup?: boolean;
}

export interface FarmEconomicsSummary {
  seasonTotalWaterSavedM3: number;
  seasonTotalDollarsSaved: number;
  seasonTotalCo2SavedKg: number;
  pumpingHoursSaved: number;
  waterEfficiencyPercent: number;
}
