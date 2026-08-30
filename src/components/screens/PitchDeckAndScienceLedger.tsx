import React, { useState } from 'react';

interface PitchDeckAndScienceLedgerProps {
  onSelectJudgeScenario: (scenarioKey: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const PitchDeckAndScienceLedger: React.FC<PitchDeckAndScienceLedgerProps> = ({
  onSelectJudgeScenario,
  onNavigateToTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<'pitch' | 'claims' | 'sources' | 'differentiation'>('pitch');

  const slides = [
    {
      number: '01',
      title: 'Fieldstate — One Decision for Irrigation',
      subtitle: 'Earth Forward Track · Proof of Possible 2026',
      content: 'A decision layer for irrigation — built on weather forecasts, satellite observation, and FAO-56 crop science.',
      highlight: 'Weather + Satellite + Crop Science → One Same-Day Decision',
    },
    {
      number: '02',
      title: 'The Problem: Decisions Are Getting Harder',
      subtitle: 'Resource Convergence',
      content: '~72% of global freshwater withdrawals are used by agriculture. ~32% of global GHG emissions come from agrifood systems. 9.7B population by 2050.',
      highlight: "Farmers have more weather and satellite data than ever. What's missing is turning it into ONE same-day decision.",
    },
    {
      number: '03',
      title: 'Three Signals In, One Decision Out',
      subtitle: 'Deterministic Architecture',
      content: 'Fieldstate combines a physics-based water model with an independent satellite read on crop vigor, then has AI explain the result in plain language — it never calculates the science itself.',
      highlight: 'Decisions: WAIT · IRRIGATE · INSPECT',
    },
    {
      number: '04',
      title: 'How It Works: 4 Facts to 1 Decision',
      subtitle: 'Workflow Pipeline',
      content: '1. Farmer input (crop, planting date, location, area) → 2. Data streams (weather, Sentinel-2, crop KB) → 3. Fieldstate engine (water balance + vigor) → 4. Decision → 5. AI explanation.',
      highlight: 'Grounding in deterministic evidence without hallucination.',
    },
    {
      number: '05',
      title: 'Engine 1: Water Demand (FAO-56)',
      subtitle: 'ETc = Kc × ET0',
      content: 'ET0 = Atmospheric evaporative demand calculated via Penman-Monteith. Kc = Agronomic crop coefficient keyed by growth stage from planting date.',
      highlight: 'Worked Example: ET0 (4.8 mm/day) × Kc (1.15) = ETc ≈ 5.5 mm/day.',
    },
    {
      number: '06',
      title: 'Engine 1: Water Balance Equation',
      subtitle: 'Soil Water Profile',
      content: 'Soil Water(t) = Soil Water(t-1) + Effective Rainfall + Irrigation - ETc - Runoff/Drainage. Trailing 30-day rainfall compared to baseline.',
      highlight: 'Labels: Low Buffer · Moderate · Adequate Profile.',
    },
    {
      number: '07',
      title: 'Engine 2: Satellite Observation',
      subtitle: 'Sentinel-2 Multispectral',
      content: 'ESA Copernicus optical scenes → Cloud Filtering → Red & NIR Reflectance (B4 & B8) → NDVI (NIR - Red)/(NIR + Red) → Field-level polygon time series.',
      highlight: 'Not a fertility test · Not a disease diagnosis · Not a soil-moisture reading.',
    },
    {
      number: '08',
      title: 'Engine 2: Expected vs. Observed',
      subtitle: 'Canopy Trajectory',
      content: 'Comparing observed vigor against the expected trajectory for the specific growth stage. If observed is ~22% below baseline, it is flagged for ground inspection.',
      highlight: 'Flagged for inspection — not self-diagnosed.',
    },
    {
      number: '11',
      title: 'Where AI Fits: The Explainer',
      subtitle: 'Plain Language Grounding',
      content: 'AI explains the decision in natural language grounded in evidence. When confidence is low or cloud gap occurs, AI states the missing data honestly.',
      highlight: 'The model does not invent measurements — missing data is stated, not filled in.',
    },
    {
      number: '16',
      title: 'Impact at Scale: Why Timing Is The Lever',
      subtitle: 'Earth Forward Track',
      content: '~72% of freshwater withdrawals go to agriculture. Estimated global irrigation efficiency is only ~56% — nearly half never reaches crop uptake.',
      highlight: 'Directly reduces avoidable water use, pumping diesel/kWh costs, and carbon emissions.',
    },
  ];

  const whatSystemDoesNotClaim = [
    { claim: 'NDVI ≠ Soil Fertility', explanation: 'NDVI measures canopy light reflectance (greenness), not nitrogen or phosphorus levels.' },
    { claim: 'NDVI ≠ Soil Moisture', explanation: 'NDVI observes top-of-canopy foliage, not subterranean root-zone water content.' },
    { claim: 'NDVI Anomaly ≠ Disease Diagnosis', explanation: 'A vigor drop flags that a human scout should inspect the field; it does not diagnose fungus or virus from space.' },
    { claim: 'Weather Forecast ≠ Certainty', explanation: 'NWP radar forecasts are probabilistic; confidence scores reflect forecast uncertainty.' },
    { claim: 'Modeled Water Status ≠ Measured Sensor', explanation: 'Without in-ground capacitance probes, root water storage is an agronomic estimate.' },
    { claim: 'ETc ≠ Direct Irrigation Instruction', explanation: 'Crop demand must be paired with precipitation forecasts and soil buffer before deciding to pump.' },
    { claim: 'Satellite Coverage Has Cloud Gaps', explanation: 'Overcast optical passes trigger fallback confidence downgrades rather than hallucinating values.' },
    { claim: 'Local Agronomic Validation Required', explanation: 'Soil variations and micro-climates require ground scouting alongside digital decision support.' },
  ];

  const sourcedCitations = [
    { title: 'Global Freshwater Withdrawals (~72%)', source: 'FAO / UN-Water, 2025 AQUASTAT Water Data Snapshot' },
    { title: 'Agrifood GHG Emissions (~32%)', source: 'FAO, Greenhouse Gas Emissions from Agrifood Systems (FAOSTAT Analytical Brief, 2025)' },
    { title: 'Global Population by 2050 (9.7B)', source: 'UN DESA, World Population Prospects: 2024 Revision' },
    { title: 'Global Irrigation Efficiency (~56%)', source: 'FAO AQUASTAT, Global Irrigation Water-Use Assessment (2014 Data)' },
    { title: 'ET0 Reference Methodology', source: 'FAO Irrigation and Drainage Paper 56 — Penman-Monteith Method' },
    { title: 'Vegetation Index (NDVI) Standard', source: 'ESA Copernicus Sentinel-2 Multispectral Instrument (10m Resolution)' },
  ];

  return (
    <div className="flex-1 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#1e3a29] text-[#e6a833] text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-[#2d523b]">
              Hackathon Pitch & Science Deck
            </span>
            <span className="text-[12px] text-[#64748b]">Proof of Possible 2026 · Earth Forward Track</span>
          </div>
          <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
            Pitch Deck & Scientific Honesty Ledger
          </h2>
          <p className="text-[15px] text-[#475569] mt-0.5">
            Complete synchronized presentation pillars, scientific boundaries, and sourced FAO/UN bibliography.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#cbd5e1] shadow-xs">
          {[
            { id: 'pitch', label: 'Pitch Slides', icon: 'slideshow' },
            { id: 'differentiation', label: 'Differentiation', icon: 'compare' },
            { id: 'claims', label: 'Scientific Honesty', icon: 'verified' },
            { id: 'sources', label: 'Sourced Citations', icon: 'menu_book' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#1e3a29] text-white shadow-xs'
                  : 'text-[#475569] hover:bg-[#f1f5f9]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1-Click Interactive Judge Demo Scenarios Banner */}
      <div className="mb-6 bg-[#101b13] text-white p-5 rounded-3xl border border-[#2d4436] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#e6a833] text-[20px]">gavel</span>
            <h4 className="text-[15px] font-bold text-white">1-Click Live Judge Demo Scenarios</h4>
          </div>
          <p className="text-[12px] text-[#86a894]">
            Instantly switch the entire live app to demonstrate each core pitch scenario to hackathon judges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              onSelectJudgeScenario('north-plot-rice');
              onNavigateToTab('today');
            }}
            className="bg-[#192b1f] hover:bg-[#234e35] text-[#93c5fd] border border-[#2d523b] px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">rainy</span>
            <span>Scenario A: Rain Ahead (WAIT)</span>
          </button>

          <button
            onClick={() => {
              onSelectJudgeScenario('sector-7-wheat');
              onNavigateToTab('today');
            }}
            className="bg-[#192b1f] hover:bg-[#234e35] text-[#fca5a5] border border-[#2d523b] px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">water_drop</span>
            <span>Scenario B: Dry Deficit (IRRIGATE)</span>
          </button>

          <button
            onClick={() => {
              onSelectJudgeScenario('east-basin-corn');
              onNavigateToTab('today');
            }}
            className="bg-[#192b1f] hover:bg-[#234e35] text-[#fde047] border border-[#2d523b] px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Scenario C: NDVI Anomaly (INSPECT)</span>
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {activeCategory === 'pitch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map((slide) => (
            <div
              key={slide.number}
              className="bg-white p-6 rounded-3xl border border-[#cbd5e1] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#e6a833] bg-[#101b13] px-2.5 py-0.5 rounded font-mono">
                    SLIDE {slide.number}
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748b]">{slide.subtitle}</span>
                </div>
                <h3 className="text-[18px] font-extrabold text-[#0f172a] mb-2">{slide.title}</h3>
                <p className="text-[13px] text-[#475569] leading-relaxed">{slide.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f1f5f9] text-[12px] font-bold text-[#1e3a29] bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
                {slide.highlight}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCategory === 'differentiation' && (
        <div className="bg-white rounded-3xl border border-[#cbd5e1] p-6 md:p-8 shadow-xs">
          <h3 className="text-[20px] font-extrabold text-[#0f172a] mb-2">
            Why Fieldstate Isn't Another Farm-AI Demo (Slide 14)
          </h3>
          <p className="text-[13px] text-[#64748b] mb-6">
            Scientific rigor and deterministic calculation over black-box hallucinations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-5 rounded-2xl border border-red-200">
              <h4 className="text-[15px] font-bold text-red-900 mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-red-600">cancel</span>
                <span>Common Amateur Approaches</span>
              </h4>
              <ul className="flex flex-col gap-2.5 text-[13px] text-red-800">
                <li>✕ NDVI shown as a raw colored map, unexplained to the farmer.</li>
                <li>✕ Chatbot wrapper directly guessing irrigation amounts from weather prompts.</li>
                <li>✕ Generic, one-size-fits-all agricultural advice.</li>
                <li>✕ Crop disease "diagnosed" blindly from a single smartphone image.</li>
                <li>✕ Confidence and satellite cloud gaps left completely unstated.</li>
              </ul>
            </div>

            <div className="bg-[#ecfdf5] p-5 rounded-2xl border border-[#a7f3d0]">
              <h4 className="text-[15px] font-bold text-[#065f46] mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#059669]">check_circle</span>
                <span>The Fieldstate Scientific Approach</span>
              </h4>
              <ul className="flex flex-col gap-2.5 text-[13px] text-[#065f46]">
                <li>✓ NDVI compared against expected growth-stage trajectory curve.</li>
                <li>✓ AI only *explains* a deterministic FAO-56 decision — never computes the physics.</li>
                <li>✓ Recommendation grounded simultaneously in water balance + vigor + radar.</li>
                <li>✓ Flags anomalies for physical ground inspection; never guesses the root cause.</li>
                <li>✓ Every number labeled: Measured, Calculated, Estimated, or Predicted.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeCategory === 'claims' && (
        <div className="bg-white rounded-3xl border border-[#cbd5e1] p-6 md:p-8 shadow-xs">
          <h3 className="text-[20px] font-extrabold text-[#0f172a] mb-2">
            Scientific Honesty: What This System Does Not Claim (Slide 15)
          </h3>
          <p className="text-[13px] text-[#64748b] mb-6">
            Establishing trust with agronomists and judges by transparently defining physical boundaries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whatSystemDoesNotClaim.map((item, idx) => (
              <div key={idx} className="bg-[#f8fafc] p-4.5 rounded-2xl border border-[#e2e8f0]">
                <h4 className="text-[14px] font-extrabold text-[#1e3a29] mb-1">{item.claim}</h4>
                <p className="text-[12px] text-[#475569] leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeCategory === 'sources' && (
        <div className="bg-white rounded-3xl border border-[#cbd5e1] p-6 md:p-8 shadow-xs">
          <h3 className="text-[20px] font-extrabold text-[#0f172a] mb-2">
            Every Statistic In This Project Is Sourced (Slide 19)
          </h3>
          <p className="text-[13px] text-[#64748b] mb-6">
            Official international agricultural and meteorological references.
          </p>

          <div className="divide-y divide-[#f1f5f9]">
            {sourcedCitations.map((item, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[13px]">
                <span className="font-bold text-[#0f172a]">{item.title}</span>
                <span className="font-mono text-[12px] text-[#0284c7]">{item.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
