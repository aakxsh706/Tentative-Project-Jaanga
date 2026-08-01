import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Activity, 
  TrendingUp, 
  CalendarDays, 
  MessageSquare, 
  Music, 
  Ear,
  AlertCircle,
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';

export const PatientDashboard: React.FC = () => {
  const { api } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'symptoms' | 'therapy' | 'sleep_mood'>('symptoms');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        // Fetch latest assessment
        const assessRes = await api.get('/api/assessments/latest').catch(() => null);
        if (assessRes && assessRes.data) {
          setLatestAssessment(assessRes.data);
        }

        // Fetch logs for charts
        const logsRes = await api.get('/api/daily-logs').catch(() => null);
        if (logsRes && logsRes.data) {
          setLogs(logsRes.data);
        }
      } catch (err: any) {
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  // Mock charts if logs list is empty
  const defaultChartData = [
    { date: 'Mon', Intensity: 6, Stress: 7, Sleep: 6.5, Therapy: 20, Mood: 3 },
    { date: 'Tue', Intensity: 5, Stress: 5, Sleep: 7.2, Therapy: 30, Mood: 4 },
    { date: 'Wed', Intensity: 7, Stress: 8, Sleep: 5.5, Therapy: 15, Mood: 2 },
    { date: 'Thu', Intensity: 4, Stress: 4, Sleep: 8.0, Therapy: 45, Mood: 4 },
    { date: 'Fri', Intensity: 5, Stress: 6, Sleep: 7.0, Therapy: 0, Mood: 3 },
    { date: 'Sat', Intensity: 3, Stress: 3, Sleep: 8.5, Therapy: 50, Mood: 5 },
    { date: 'Sun', Intensity: 4, Stress: 4, Sleep: 7.8, Therapy: 40, Mood: 4 }
  ];

  const chartData = logs.length > 0 
    ? logs.map(log => ({
        date: log.log_date.split('-').slice(1).join('/'), // MM/DD
        Intensity: log.tinnitus_intensity,
        Stress: log.stress_level,
        Sleep: log.sleep_hours,
        Therapy: log.therapy_minutes_used || 0,
        Mood: log.mood_rating
      }))
    : defaultChartData;

  const totalTherapyMins = logs.reduce((sum, item) => sum + (item.therapy_minutes_used || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!latestAssessment) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans flex flex-col items-center justify-center min-h-[calc(100vh-120px)] space-y-6">
        <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Ear className="w-10 h-10 animate-pulse" />
        </div>
        <div className="text-center max-w-lg space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">Welcome to TinniCare AI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            To begin your personalized tinnitus rehabilitation journey, we first need to establish your baseline auditory profile. Completing the initial assessment takes about 2 minutes and helps calibrate your sound therapy maskers, daily diaries, and AI clinician advice.
          </p>
        </div>
        <Link to="/assessment" className="py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover-lift flex items-center gap-2 cursor-pointer">
          <PlusCircle className="w-5 h-5" /> Start Initial Assessment
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900 to-indigo-755 text-white p-8 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Your Hearing Health Portal</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Track daily symptom levels, practice sound therapy, and review clinical reports.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/assessment" className="py-2.5 px-5 bg-white hover:bg-slate-50 text-indigo-900 font-bold text-sm rounded-xl shadow-sm hover-lift flex items-center gap-1.5">
            <PlusCircle className="w-4.5 h-4.5" /> Start Assessment
          </Link>
          <Link to="/logs" className="py-2.5 px-5 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-bold text-sm border border-indigo-400/30 rounded-xl hover-lift flex items-center gap-1.5">
            <CalendarDays className="w-4.5 h-4.5" /> Log Symptoms
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <span className="p-3 rounded-xl bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-455">
            <Ear className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tinnitus Pitch</h4>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {latestAssessment?.sound_matching?.matched_frequency_hz ? `${latestAssessment.sound_matching.matched_frequency_hz} Hz` : 'Not Configured'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <span className="p-3 rounded-xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/40 dark:text-emerald-455">
            <Activity className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Volume</h4>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {latestAssessment?.sound_matching?.matched_volume_db ? `${latestAssessment.sound_matching.matched_volume_db}%` : 'Not Configured'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <span className="p-3 rounded-xl bg-amber-50 text-amber-650 dark:bg-amber-950/40 dark:text-amber-455">
            <Music className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Sound Therapy</h4>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {totalTherapyMins ? `${totalTherapyMins} mins` : '0 mins'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <span className="p-3 rounded-xl bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-455">
            <CalendarDays className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Assessment</h4>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {latestAssessment?.completed_at ? new Date(latestAssessment.completed_at).toLocaleDateString() : 'None submitted'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & AI analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-sans">Auditory & Lifestyle Analytics</h3>
              <p className="text-xs text-slate-400">Review clinical logs and daily habituation tracking correlations.</p>
            </div>
            
            {/* Chart Tab Selectors */}
            <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/55 dark:border-slate-850 shrink-0">
              <button
                onClick={() => setActiveChartTab('symptoms')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeChartTab === 'symptoms'
                    ? 'bg-indigo-650 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Symptoms
              </button>
              <button
                onClick={() => setActiveChartTab('therapy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeChartTab === 'therapy'
                    ? 'bg-indigo-655 bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Therapy Mins
              </button>
              <button
                onClick={() => setActiveChartTab('sleep_mood')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeChartTab === 'sleep_mood'
                    ? 'bg-indigo-655 bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sleep & Mood
              </button>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'symptoms' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 10]} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Intensity" name="Tinnitus Intensity (0-10)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Stress" name="Stress Level (0-10)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : activeChartTab === 'therapy' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Therapy" name="Therapy Duration (Mins)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 15]} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Sleep" name="Sleep Duration (Hours)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Mood" name="Subjective Mood (1-5)" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI recommended therapy card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950 dark:text-emerald-455">
                <Music className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-150">Acoustic Rehabilitation</h3>
            </div>
            <p className="text-xs text-slate-450 dark:text-slate-500 mb-6">
              AI recommendations compiled based on your latest auditory match profile.
            </p>

            {latestAssessment?.ai_report ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                    AI Severity Profile
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    latestAssessment.ai_report.severity_level === 'Mild' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                    latestAssessment.ai_report.severity_level === 'Moderate' ? 'bg-indigo-50 text-indigo-755 dark:bg-indigo-950/20 dark:text-indigo-400' :
                    'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {latestAssessment.ai_report.severity_level} Tinnitus Burden
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">
                    Suggested Audio Strategies
                  </span>
                  <ul className="space-y-2">
                    {latestAssessment.ai_report.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                      <li key={i} className="text-xs text-slate-655 dark:text-slate-400 flex items-start gap-1.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-center border border-slate-150/40 dark:border-slate-850">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Complete an assessment to unlock your custom AI sound therapist recommendations.
                </p>
                <Link to="/assessment" className="inline-block py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                  Generate Therapy Plan
                </Link>
              </div>
            )}
          </div>

          {latestAssessment?.ai_report && (
            <Link to="/therapy" className="w-full text-center py-3 bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-150/50 rounded-xl text-xs font-bold mt-6 block dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-indigo-400 dark:border-slate-800">
              Open Therapy Player
            </Link>
          )}
        </div>
      </div>

      {/* Floating Action / Support section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-150/45 dark:border-slate-850">
        <div className="flex gap-4 items-start">
          <span className="p-3 bg-indigo-50 text-indigo-650 rounded-xl dark:bg-indigo-950/40 dark:text-indigo-455">
            <MessageSquare className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150">Chat with AI Health Coach</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              Ask questions about tinnitus masking, diet influences, and exercises. Get instant suggestions.
            </p>
            <Link to="/chat" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
              Start chat conversation &rarr;
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <span className="p-3 bg-amber-50 text-amber-650 rounded-xl dark:bg-amber-950/40 dark:text-amber-455">
            <AlertCircle className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150">Medical Compliance Disclaimer</h4>
            <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed mt-1">
              This platform serves as clinical decision support. Daily logs and match results are shared with your clinical audiologist to refine targets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
