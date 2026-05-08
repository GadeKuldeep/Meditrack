import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import {
  Pill, Plus, Calendar, Clock, Edit2, Trash2, X,
  Search, Filter, CheckCircle2, XCircle
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * Fetch all medications for the logged-in user.
 */
const fetchMedications = async () => {
  const { data } = await api.get('/medications');
  return data;
};

// ─── MAIN PAGE ────────────────────────────────────────────────

const Medications = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // all | active | inactive

  const { data: medications, isLoading, isError } = useQuery({
    queryKey: ['medications'],
    queryFn: fetchMedications,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/medications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications'] }),
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter + search
  const filteredMeds = (medications || []).filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && med.isActive) ||
      (filterActive === 'inactive' && !med.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Medications</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your prescriptions and supplements.
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      </div>

      {/* Search + Filter Bar */}
      {medications && medications.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search medications…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                  filterActive === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Medication List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1">
                  <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to load medications</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Please check your connection and try again.</p>
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Pill className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {searchTerm || filterActive !== 'all' ? 'No medications match your filters' : 'No medications found'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {searchTerm || filterActive !== 'all'
              ? 'Try adjusting your search or filter.'
              : "You haven't added any medications to track yet."}
          </p>
          {!searchTerm && filterActive === 'all' && (
            <button
              onClick={() => { setEditTarget(null); setShowAddModal(true); }}
              className="text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-6 py-2 rounded-xl font-medium transition-colors"
            >
              Add your first medication
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeds.map((med) => (
            <MedicationCard
              key={med._id}
              med={med}
              onEdit={() => { setEditTarget(med); setShowAddModal(true); }}
              onDelete={() => handleDelete(med._id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <MedicationModal
          editData={editTarget}
          onClose={() => { setShowAddModal(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
};

// ─── MEDICATION CARD ──────────────────────────────────────────

const MedicationCard = ({ med, onEdit, onDelete }) => {
  const categoryColors = {
    Antibiotic: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    'Blood Pressure': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Vitamin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  const catClass = categoryColors[med.category] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';

  return (
    <div className="glass-panel p-5 rounded-2xl hover-scale flex flex-col relative group">
      {/* Quick Actions */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 z-10">
        <button
          onClick={onEdit}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-600 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
            {med.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {med.dosage} {med.unit}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5 flex-1">
        <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="font-medium">{med.frequency}</span>
          {med.category && (
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${catClass}`}>
              {med.category}
            </span>
          )}
        </div>

        <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1.5">
            {med.schedule?.map((s, idx) => (
              <span
                key={idx}
                className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-semibold shadow-sm border border-slate-200 dark:border-slate-600"
              >
                {s.time}
              </span>
            ))}
            {(!med.schedule || med.schedule.length === 0) && (
              <span className="text-xs text-slate-400">No schedule set</span>
            )}
          </div>
        </div>

        {med.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic px-1 line-clamp-2">
            📝 {med.notes}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
        <span>Start: {format(new Date(med.startDate), 'MMM d, yyyy')}</span>
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full font-medium ${
            med.isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {med.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {med.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

// ─── ADD / EDIT MODAL ─────────────────────────────────────────

const MedicationModal = ({ editData, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = !!editData;

  const [formData, setFormData] = useState({
    name: editData?.name || '',
    dosage: editData?.dosage || '',
    unit: editData?.unit || 'mg',
    frequency: editData?.frequency || 'Daily',
    startDate: editData?.startDate
      ? new Date(editData.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    category: editData?.category || '',
    notes: editData?.notes || '',
    isActive: editData?.isActive ?? true,
  });

  const [schedule, setSchedule] = useState(
    editData?.schedule?.map((s) => s.time) || ['08:00']
  );

  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        const { data } = await api.put(`/medications/${editData._id}`, payload);
        return data;
      }
      const { data } = await api.post('/medications', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const formattedSchedule = schedule.filter(Boolean).map((time) => ({ time }));
    mutation.mutate({ ...formData, schedule: formattedSchedule });
  };

  const handleTimeChange = (index, value) => {
    const updated = [...schedule];
    updated[index] = value;
    setSchedule(updated);
  };

  const addTimeSlot = () => setSchedule([...schedule, '12:00']);
  const removeTimeSlot = (index) => setSchedule(schedule.filter((_, i) => i !== index));

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/30">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-500" />
            {isEditing ? 'Edit Medication' : 'Add New Medication'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <form id="med-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Amoxicillin"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              {/* Dosage & Unit */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dosage *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    placeholder="500"
                    className="w-2/3 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                    value={formData.dosage}
                    onChange={(e) => updateField('dosage', e.target.value)}
                  />
                  <select
                    className="w-1/3 px-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                    value={formData.unit}
                    onChange={(e) => updateField('unit', e.target.value)}
                  >
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="mcg">mcg</option>
                    <option value="pills">pills</option>
                    <option value="drops">drops</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Antibiotic"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Frequency
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                  value={formData.frequency}
                  onChange={(e) => updateField('frequency', e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                  value={formData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>

              {/* Active toggle (edit only) */}
              {isEditing && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isActive}
                      onChange={(e) => updateField('isActive', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}

              {/* Schedule */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reminders (Schedule)
                </label>
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  {schedule.map((time, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="relative flex-1">
                        <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="time"
                          required
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                          value={time}
                          onChange={(e) => handleTimeChange(idx, e.target.value)}
                        />
                      </div>
                      {schedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(idx)}
                          className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline px-1"
                  >
                    <Plus className="w-4 h-4" /> Add another time
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows="3"
                  placeholder="Take with food…"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none text-sm"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="med-form"
            disabled={mutation.isPending}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm flex items-center gap-2 transition-colors disabled:opacity-70 text-sm"
          >
            {mutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Add Medication'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Medications;
