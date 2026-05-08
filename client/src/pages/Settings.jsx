import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Bell, Moon, Sun, Shield, LogOut,
  CheckCircle2, ChevronRight, Save
} from 'lucide-react';

const Toggle = ({ checked, onChange, label }) => (
  <label className="relative inline-flex items-center cursor-pointer gap-3">
    <div className="relative">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
    </div>
    {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
  </label>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="glass-panel rounded-2xl overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderPush, setReminderPush] = useState(true);
  const [saved, setSaved] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {user?.role}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                defaultValue={user?.email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed text-sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={isDark ? Moon : Sun}>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-slate-400">Toggle the app theme</p>
            </div>
          </div>
          <Toggle checked={isDark} onChange={toggleTheme} />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-3">
          {[
            {
              label: 'Email Reminders',
              desc: 'Receive dose reminders by email',
              value: emailNotifications,
              set: setEmailNotifications,
            },
            {
              label: 'Push Notifications',
              desc: 'Browser push alerts for upcoming doses',
              value: reminderPush,
              set: setReminderPush,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={item.value} onChange={(e) => item.set(e.target.checked)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield}>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</p>
              <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Changes
            </>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 rounded-xl font-medium transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
