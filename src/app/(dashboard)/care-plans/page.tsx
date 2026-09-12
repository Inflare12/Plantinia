'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Droplets,
  Sprout,
  Scissors,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function CarePlansPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  // New task form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('water');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPlantId, setSelectedPlantId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [tRes, pRes] = await Promise.all([
        apiClient.careTasks.list(),
        apiClient.plants.list(),
      ]);
      setTasks(tRes.tasks || []);
      setPlants(pRes.plants || []);
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const res = await apiClient.careTasks.toggle(id);
      if (res.task) {
        setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const plant = plants.find((p) => p.id === selectedPlantId);
    try {
      const res = await apiClient.careTasks.create({
        title,
        category,
        dueDate,
        plantId: selectedPlantId || undefined,
        plantName: plant ? plant.name : undefined,
      });

      setTasks((prev) => [...prev, res.task]);
      setIsModalOpen(false);
      setTitle('');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Garden Care Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated reminder checklists for watering, bio-fungicide sprays, and nutrition.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending Tasks ({tasks.filter((t) => !t.isCompleted).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading schedule...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Care Tasks</h3>
          <p className="text-xs text-slate-500 mt-1">Your plants are thriving! Schedule a reminder anytime.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggle(task.id)}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                task.isCompleted
                  ? 'bg-slate-50 dark:bg-[#121915] border-slate-200 dark:border-slate-800/60 opacity-60'
                  : 'bg-white dark:bg-[#111815] border-slate-200 dark:border-[#223129] hover:border-emerald-400'
              }`}
            >
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => {}}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold ${
                      task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    Due {task.dueDate}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  {task.plantName && (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {task.plantName}
                    </span>
                  )}
                  <span className="capitalize">{task.category}</span>
                  {task.notes && <span className="text-slate-400 italic">({task.notes})</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Care Reminder
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apply neem oil foliar spray, Fertilize with compost tea"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plant
                </label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
                >
                  <option value="">General Garden</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
                  >
                    <option value="water">Watering</option>
                    <option value="spray">Foliar Spray</option>
                    <option value="fertilize">Fertilizer</option>
                    <option value="prune">Pruning</option>
                    <option value="inspect">Pest Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
