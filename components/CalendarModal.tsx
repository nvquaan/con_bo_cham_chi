
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../utils';

interface CalendarModalProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ selectedDate, onSelect, onClose }) => {
  const [year, month, day] = selectedDate.split('-').map(Number);
  const [viewDate, setViewDate] = useState({ month: month - 1, year: year });

  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);

  const prevMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleDateClick = (d: number) => {
    const formattedDate = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onSelect(formattedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[340px] rounded-[2rem] shadow-2xl p-6 border border-slate-100 flex flex-col gap-5 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chọn lịch cày</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="p-2 hover:bg-amber-50 rounded-xl text-amber-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800 leading-none">{monthNames[viewDate.month]}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">{viewDate.year}</p>
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-amber-50 rounded-xl text-amber-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(d => (
            <div key={d} className="text-[10px] font-bold text-slate-300 text-center py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const isSelected = isSameDay(selectedDate, viewDate.year, viewDate.month, d);
            return (
              <button
                key={d}
                onClick={() => handleDateClick(d)}
                className={`
                  aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all
                  ${isSelected 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-100 scale-110' 
                    : 'text-slate-600 hover:bg-slate-50 active:scale-90'}
                `}
              >
                {d}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={() => {
            const today = new Date();
            const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            onSelect(formatted);
            onClose();
          }}
          className="mt-2 py-3 text-xs font-bold text-amber-600 border border-amber-100 rounded-xl hover:bg-amber-50 transition-colors"
        >
          QUAY VỀ HÔM NAY
        </button>
      </div>
    </div>
  );
};

export default CalendarModal;
