import React from 'react';
import { DataProvenanceTag } from '../../types';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTag: DataProvenanceTag | null;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  isOpen,
  onClose,
  activeTag,
}) => {
  if (!isOpen) return null;

  const provenanceCategories = [
    {
      type: 'MEASURED',
      title: 'Measured Data',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      description: 'Direct physical observations captured by calibrated sensors or multispectral satellite payloads (e.g. Sentinel-2 Band 4 & Band 8 surface reflectance).',
      rules: 'Highest confidence. Never imputed without flagging.',
    },
    {
      type: 'CALCULATED',
      title: 'Calculated Physics',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'Deterministic mathematical and agronomic formulas (e.g. FAO-56 Penman-Monteith ET₀ equation and hydraulic pumping energy physics).',
      rules: 'Reproducible, transparent formulas with zero hallucination.',
    },
    {
      type: 'PREDICTED',
      title: 'Predicted Forecasts',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      description: 'Probabilistic numerical weather prediction models (NWP radar, 24h/7d rainfall projections, solar radiation).',
      rules: 'Carries standard meteorological uncertainty; confidence scales with precipitation probability.',
    },
    {
      type: 'ESTIMATED',
      title: 'Estimated State',
      badgeColor: 'bg-stone-100 text-stone-900 border-stone-300',
      description: 'Dynamic water-balance state models ($S_t = S_{t-1} + R + I - ET_c$) or cloud-gap interpolated baselines in the absence of in-situ capacitance probes.',
      rules: 'Explicitly labeled as an agronomic estimate rather than an in-ground probe reading.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#cbd5e1] max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a29] text-[#e6a833] flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div>
              <h3 className="text-[19px] font-extrabold text-[#0f172a]">Scientific Data Provenance Ledger</h3>
              <p className="text-[12px] text-[#64748b]">Slide 14 & 15 Standard: Transparency over Black-Box AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Highlighted active tag if clicked directly */}
        {activeTag && (
          <div className="mb-6 p-4 bg-[#f8fafc] rounded-2xl border-2 border-[#1e3a29] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${activeTag.badgeColor}`}>
                {activeTag.type}
              </span>
              <span className="text-[12px] font-bold text-[#1e3a29]">{activeTag.source}</span>
            </div>
            <p className="text-[13px] text-[#334155] leading-relaxed mt-1">{activeTag.description}</p>
          </div>
        )}

        {/* 4 Provenance Categories Breakdown */}
        <div className="flex flex-col gap-3.5">
          <h4 className="text-[14px] font-bold text-[#0f172a] uppercase tracking-wider">
            Fieldstate 4-Tier Provenance Classification
          </h4>

          {provenanceCategories.map((cat) => (
            <div key={cat.type} className="p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h5 className="text-[14px] font-extrabold text-[#0f172a]">{cat.title}</h5>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cat.badgeColor}`}>
                  {cat.type}
                </span>
              </div>
              <p className="text-[12px] text-[#475569] leading-relaxed">{cat.description}</p>
              <span className="text-[11px] text-[#1e3a29] font-bold mt-1">Rule: {cat.rules}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1e3a29] hover:bg-[#14281c] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
