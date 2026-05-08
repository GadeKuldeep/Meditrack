import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Pill, Activity, CalendarCheck, Users, Clock, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const mockChartData = [
  { name: 'Mon', adherence: 80 },
  { name: 'Tue', adherence: 90 },
  { name: 'Wed', adherence: 85 },
  { name: 'Thu', adherence: 100 },
  { name: 'Fri', adherence: 70 },
  { name: 'Sat', adherence: 95 },
  { name: 'Sun', adherence: 88 },
];

/**
 * Stat card component used for the top metrics row.
 */
const StatCard = ({ title, value, icon: Icon, trend, colorClass, loading }) => (
  <div className="glass-panel p-5 rounded-2xl hover-scale">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">{title}</p>
        {loading ? (
          <div className="h-9 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        ) : (
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center text-sm">
        <span className="text-emerald-500 font-medium flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          {trend}
        </span>
        <span className="text-slate-400 ml-2">vs last week</span>
      </div>
    )}
  </div>
);

/**
 * Build today's upcoming doses from medication schedules.
 */
const getTodaysDoses = (medications) => {
  if (!medications) return [];
  const now = new Date();
  const doses = [];

  medications.forEach((med) => {
    if (!med.isActive || !med.schedule) return;
    med.schedule.forEach((slot) => {
      const [hours, minutes] = slot.time.split(':').map(Number);
      const doseTime = new Date(now);
      doseTime.setHours(hours, minutes, 0, 0);
      doses.push({
        medId: med._id,
        name: med.name,
        dosage: `${med.dosage} ${med.unit}`,
        notes: med.notes || '',
        time: slot.time,
        doseDate: doseTime,
        isPast: doseTime < now,
      });
    });
  });

  // Sort by time ascending
  doses.sort((a, b) => a.doseDate - b.doseDate);
  return doses;
};

const Dashboard = () => {
  const { user } = useAuth();

  const {
    data: medications,
    isLoading,
  } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data } = await api.get('/medications');
      return data;
    },
  });

  const todaysDoses = getTodaysDoses(medications);
  const upcomingDoses = todaysDoses.filter((d) => !d.isPast);
  const takenCount = todaysDoses.filter((d) => d.isPast).length;
  const totalMeds = medications?.length ?? 0;
  const activeMeds = medications?.filter((m) => m.isActive).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your medication summary for today.</p>
        </div>
        <Link
          to="/medications"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Medications"
          value={activeMeds}
          icon={Pill}
          loading={isLoading}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
        />
        <StatCard
          title="Today's Doses"
          value={`${takenCount} / ${todaysDoses.length}`}
          icon={CalendarCheck}
          loading={isLoading}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
        />
        <StatCard
          title="Adherence Rate"
          value="85%"
          icon={Activity}
          trend="+5%"
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
        />
        <StatCard
          title="Total Medications"
          value={totalMeds}
          icon={Pill}
          loading={isLoading}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">Weekly Adherence</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '13px' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(value) => [`${value}%`, 'Adherence']}
                />
                <Area type="monotone" dataKey="adherence" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdherence)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Doses */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Doses</h3>
            <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {upcomingDoses.length} Left
            </span>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : upcomingDoses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <CalendarCheck className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All done for today!</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
              {upcomingDoses.map((dose, idx) => (
                <div
                  key={`${dose.medId}-${dose.time}`}
                  className={`relative pl-4 ${idx < upcomingDoses.length - 1 ? 'border-l-2 border-blue-200 dark:border-blue-900 pb-3' : 'pb-1'}`}
                >
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white dark:ring-slate-900"></div>
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{dose.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {dose.dosage}{dose.notes ? ` • ${dose.notes}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {dose.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Active Medications List */}
      {medications && medications.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Medications</h3>
            <Link to="/medications" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.filter((m) => m.isActive).slice(0, 6).map((med) => (
              <div key={med._id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{med.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {med.dosage} {med.unit} • {med.frequency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
