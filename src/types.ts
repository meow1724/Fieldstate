export type SoilType = 'sandy' | 'loam' | 'clay';
export type IrrigationMethod = 'drip' | 'sprinkler' | 'flood';
export type GrowthStage = 'initial' | 'development' | 'mid-season' | 'late-season';
export type ActionType = 'WAIT' | 'IRRIGATE' | 'INSPECT' | 'PROTECT';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

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
  referenceEt0: number; // mm/day
  cropCoefficientKc: number;
  cropEtDemand: number; // ETc = Kc * ET0 (mm/day)
  rain24h: number; // mm
  rain3d: number; // mm
  effectiveRain: number; // mm
  irrigationAppliedToday: number; // mm
  netWaterChange: number; // delta S = R + I - ETc (mm)
  soilMoisturePercent: number; // 0-100% of field capacity
  rootZoneDepletion: number; // mm
  availableWater: number; // mm
  waterStatus: 'optimal' | 'moderate' | 'dry' | 'stress' | 'saturated';
}

export interface NdviReading {
  date: string;
  observed: number;
  expected: number;
  variance: number;
  status: 'Normal' | 'Monitoring' | 'High Deviation';
  cloudCover?: number;
  satellite?: string;
  resolution?: string;
}

export interface SatelliteImageMeta {
  source: string;
  acquisitionDate: string;
  resolution: string;
  cloudCoverPercent: number;
  imageUrl: string;
  altText: string;
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
  reason: string;
  summary: string;
  detailedAnalysis: string;
  nextVerificationStep: string;
  whyChanged?: string;
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
  photoUrl?: string;
  anomalyFollowup?: boolean;
}
