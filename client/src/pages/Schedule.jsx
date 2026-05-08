import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { CalendarClock, Clock, Pill, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Schedule = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [selectedDay, setSelectedDay] = useState(today);

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data } = await api.get('/medications');
      return data;
    },
  });

  // Build doses for selected day
  const getDosesForDay = (day) => {
    if (!medications) return [];
    const doses = [];
    medications.forEach((med) => {
      if (!med.isActive || !med.schedule) return;
      med.schedule.forEach((slot) => {
        const [h, m] = slot.time.split(':').map(Number);
        const doseTime = new Date(day);
        doseTime.setHours(h, m, 0, 0);
        doses.push({
          id: `${med._id}-${slot.time}`,
          name: med.name,
          dosage: `${med.dosage} ${med.unit}`,
          time: slot.time,
          doseTime,
          isPast: doseTime < new Date(),
        });
      });
    });
    return doses.sort((a, b) => a.doseTime - b.doseTime);
  };

  const selectedDoses = getDosesForDay(selectedDay);
  const todayDoses = getDosesForDay(today);
  const todayCompleted = todayDoses.filter((d) => d.isPast).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Schedule</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your medication timeline for the week.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
          <CalendarClock className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Today: {format(today, 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">Today's Progress</h3>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {todayCompleted} / {todayDoses.length} doses
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: todayDoses.length > 0 ? `${(todayCompleted / todayDoses.length) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{todayCompleted} completed</span>
          <span>{todayDoses.length - todayCompleted} remaining</span>
        </div>
      </div>

      {/* Week Picker */}
      <div className="glass-panel p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDay);
            const dayDoses = getDosesForDay(day);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40'
                    : isToday
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-wide">{DAYS[day.getDay()]}</span>
                <span className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}>{format(day, 'd')}</span>
                {dayDoses.length > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-blue-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doses for selected day */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          {isSameDay(selectedDay, today) ? "Today's Schedule" : format(selectedDay, 'EEEE, MMM d')}
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : selectedDoses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No doses scheduled</p>
            <p className="text-sm text-slate-400 mt-1">Add medications to see your schedule here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDoses.map((dose) => (
              <div
                key={dose.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  dose.isPast
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-60'
                    : 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/40 shadow-sm hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  dose.isPast
                    ? 'bg-slate-100 dark:bg-slate-700'
                    : 'bg-blue-100 dark:bg-blue-900/40'
                }`}>
                  <Pill className={`w-5 h-5 ${dose.isPast ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{dose.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{dose.dosage}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className={`px-2.5 py-1.5 rounded-lg ${
                    dose.isPast
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {dose.time}
                  </span>
                  {dose.isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
