import React, { useState } from 'react';
import { FarmProfile } from '../../types';

interface ScheduleInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
}

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  isOpen,
  onClose,
  farm,
}) => {
  const [date, setDate] = useState('2026-08-25');
  const [timeWindow, setTimeWindow] = useState('07:00 - 09:00 AM');
  const [quadrant, setQuadrant] = useState('Northeast Quadrant');
  const [assignedScout, setAssignedScout] = useState('Agronomy Field Team Beta');
  const [notes, setNotes] = useState('Inspect leaf chlorosis and collect 30cm soil core samples in anomaly quadrant.');
  const [isScheduled, setIsScheduled] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduled(true);
    setTimeout(() => {
      setIsScheduled(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#cbd5e1]">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[24px]">calendar_today</span>
            <h3 className="text-[19px] font-extrabold text-[#0f172a]">Dispatch Field Scout Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748b] hover:text-[#0f172a] rounded-full"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {isScheduled ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[#059669] text-[54px]">check_circle</span>
            <h4 className="text-[20px] font-bold text-[#0f172a]">Inspection Order Dispatched</h4>
            <p className="text-[13px] text-[#475569]">
              Work order assigned to {assignedScout} for {date} ({timeWindow}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSchedule} className="flex flex-col gap-3.5 text-[13px]">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Target Field & Quadrant</label>
              <input
                type="text"
                disabled
                value={`${farm.name} · ${quadrant}`}
                className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3.5 py-2 text-[#475569]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">Inspection Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[12px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0f172a] mb-1">Time Window</label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[12px]"
                >
                  <option>06:00 - 08:00 AM (Early)</option>
                  <option>07:00 - 09:00 AM</option>
                  <option>02:00 - 04:00 PM</option>
                  <option>05:00 - 07:00 PM (Dusk)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Assigned Scout / Team</label>
              <input
                type="text"
                value={assignedScout}
                onChange={(e) => setAssignedScout(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Scout Instructions / Focus Areas</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-3"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#cbd5e1] text-[#475569] rounded-xl font-bold hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-xl font-bold shadow-xs cursor-pointer"
              >
                Dispatch Scout Order
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
