import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle2, AlertCircle, ShieldAlert, Award, Smile, Frown, Meh, SmilePlus, Angry } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';

export const DailyLogs: React.FC = () => {
  const { api } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [intensity, setIntensity] = useState(5);
  const [stress, setStress] = useState(3);
  const [stressQ1, setStressQ1] = useState(1);
  const [stressQ2, setStressQ2] = useState(1);
  const [stressQ3, setStressQ3] = useState(1);
  const [sleep, setSleep] = useState(7.0);
  const [mood, setMood] = useState(3);
  const [medication, setMedication] = useState(false);
  const [notes, setNotes] = useState('');

  const handleStressCalc = (q1: number, q2: number, q3: number) => {
    setStressQ1(q1);
    setStressQ2(q2);
    setStressQ3(q3);
    const sum = q1 + q2 + q3;
    const calculated = Math.min(10, Math.round(sum * 1.11));
    setStress(calculated);
  };
  
  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/daily-logs');
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const todayStr = new Date().toISOString().split('T')[0];

    const payload = {
      log_date: todayStr,
      tinnitus_intensity: intensity,
      stress_level: stress,
      sleep_hours: parseFloat(sleep.toString()),
      mood_rating: mood,
      medication_taken: medication,
      therapy_minutes_used: 0, // updated dynamically when playing sounds
      notes: notes
    };

    try {
      await api.post('/api/daily-logs', payload);
      setSuccess(true);
      fetchLogs();
      setNotes('');
      setStressQ1(1);
      setStressQ2(1);
      setStressQ3(1);
      setStress(3);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not log check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mock charts if history logs list is empty
  const defaultChartData = [
    { date: '07/26', Sleep: 6.5, Intensity: 6, Stress: 7 },
    { date: '07/27', Sleep: 7.2, Intensity: 5, Stress: 5 },
    { date: '07/28', Sleep: 5.5, Intensity: 7, Stress: 8 },
    { date: '07/29', Sleep: 8.0, Intensity: 4, Stress: 4 },
    { date: '07/30', Sleep: 7.0, Intensity: 5, Stress: 6 },
    { date: '07/31', Sleep: 8.5, Intensity: 3, Stress: 3 },
    { date: '08/01', Sleep: 7.8, Intensity: 4, Stress: 4 }
  ];

  const chartData = logs.length > 0
    ? logs.slice(-7).map(log => ({
        date: log.log_date.split('-').slice(1).join('/'),
        Sleep: log.sleep_hours,
        Intensity: log.tinnitus_intensity,
        Stress: log.stress_level
      }))
    : defaultChartData;

  const moodEmojis = [
    { rating: 1, icon: Angry, label: 'Very Bad', color: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50' },
    { rating: 2, icon: Frown, label: 'Bad', color: 'text-orange-650 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/50' },
    { rating: 3, icon: Meh, label: 'Neutral', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50' },
    { rating: 4, icon: Smile, label: 'Good', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50' },
    { rating: 5, icon: SmilePlus, label: 'Excellent', color: 'text-teal-600 bg-teal-50 border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/50' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400 mb-2 uppercase tracking-wide">
          Symptom Diary
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Daily Progress Tracking</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Perform a quick 1-minute diagnostic check-in every day. Visual trend lines are generated automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Check-in Form */}
        <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-105 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-650" /> Today's Check-in
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex gap-2 items-center dark:bg-rose-955/20 dark:border-rose-900/50 dark:text-rose-455">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex gap-2 items-center dark:bg-emerald-955/20 dark:border-emerald-900/50 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Log saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tinnitus Volume */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Tinnitus Intensity
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {intensity}/10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Stress level Questionnaire Calculator */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150/40 dark:border-slate-850">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Calculated Stress Index
                </span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {stress}/10
                </span>
              </div>

              {/* Somatic Muscle Tension */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Neck/Jaw Somatic Tension</label>
                <select
                  value={stressQ1}
                  onChange={(e) => handleStressCalc(parseInt(e.target.value), stressQ2, stressQ3)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="0">0 - Relaxed / loose muscles</option>
                  <option value="1">1 - Mild stiffness or neck ache</option>
                  <option value="2">2 - Tight jaw clenching / moderate ache</option>
                  <option value="3">3 - Severe somatic muscle tension</option>
                </select>
              </div>

              {/* Mental Workload */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Mental Workload & Overwhelm</label>
                <select
                  value={stressQ2}
                  onChange={(e) => handleStressCalc(stressQ1, parseInt(e.target.value), stressQ3)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="0">0 - Peaceful / clear mind</option>
                  <option value="1">1 - Minor distraction or busy day</option>
                  <option value="2">2 - Overwhelmed by tasks or ringing</option>
                  <option value="3">3 - Intense anxiety / inability to focus</option>
                </select>
              </div>

              {/* Patience / Irritability */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Patience & Irritability</label>
                <select
                  value={stressQ3}
                  onChange={(e) => handleStressCalc(stressQ1, stressQ2, parseInt(e.target.value))}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="0">0 - Patient & content</option>
                  <option value="1">1 - Slightly impatient / annoyed</option>
                  <option value="2">2 - Easily frustrated with noise</option>
                  <option value="3">3 - Extremely irritable / angry</option>
                </select>
              </div>
            </div>

            {/* Sleep hours */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Sleep Duration
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {sleep} hrs
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Mood selector */}
            <div>
              <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Subjective Mood
              </span>
              <div className="flex justify-between gap-1.5">
                {moodEmojis.map((emoji) => {
                  const Icon = emoji.icon;
                  return (
                    <button
                      key={emoji.rating}
                      type="button"
                      onClick={() => setMood(emoji.rating)}
                      className={`flex-1 py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        mood === emoji.rating
                          ? emoji.color + ' shadow-sm ring-1 ring-indigo-500/20'
                          : 'bg-white text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-650'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] font-bold">{emoji.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medication taken toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150/40 dark:border-slate-850">
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Medication Taken</span>
                <span className="text-[10px] text-slate-400">Log compliance to your prescription.</span>
              </div>
              <input
                type="checkbox"
                checked={medication}
                onChange={(e) => setMedication(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            {/* Daily notes */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Daily Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., High-pitched whistle spiking in quiet room around 3 PM."
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-655"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? 'Saving check-in...' : 'Save Daily Check-in'}
            </button>
          </form>
        </div>

        {/* Charts & Trends */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-md font-bold text-slate-855 dark:text-slate-105 mb-2">Visual Sleep & Intensity Comparison</h3>
            <p className="text-xs text-slate-400">Analyzing sleep hours matched against subjective tinnitus spikes.</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Intensity" name="Tinnitus Intensity" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sleep" name="Sleep Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Logs List */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Check-ins</h4>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-10 bg-slate-100 dark:bg-slate-950 rounded-xl" />
                <div className="h-10 bg-slate-100 dark:bg-slate-955 rounded-xl" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No historical logs found. Check-in above to start history.</p>
            ) : (
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                {logs.slice().reverse().map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150/40 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{log.log_date}</span>
                    <div className="flex gap-4">
                      <span>Intensity: <strong className="text-indigo-650">{log.tinnitus_intensity}</strong></span>
                      <span>Sleep: <strong className="text-emerald-650">{log.sleep_hours}h</strong></span>
                      <span>Medication: <strong className={log.medication_taken ? 'text-teal-650' : 'text-slate-400'}>{log.medication_taken ? 'Yes' : 'No'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
