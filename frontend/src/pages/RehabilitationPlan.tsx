import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Award, 
  CalendarDays, 
  Ear, 
  Music, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  PlusCircle,
  Plus
} from 'lucide-react';

export const RehabilitationPlan: React.FC = () => {
  const { api, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Manual checklists stored in local storage for persistence
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    breath1: false,
    breath2: false,
    breath3: false,
    relax1: false,
    relax2: false,
    knowledge1: false,
    knowledge2: false,
  });

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(`rehab_checks_${user?.id}`);
      if (stored) {
        setCheckedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not load stored checkboxes:", e);
    }
  };

  const handleToggle = (key: string) => {
    const updated = {
      ...checkedItems,
      [key]: !checkedItems[key]
    };
    setCheckedItems(updated);
    try {
      localStorage.setItem(`rehab_checks_${user?.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Could not save checkbox state:", e);
    }
  };

  const resetWeeklyChecklist = () => {
    const cleared = {
      breath1: false,
      breath2: false,
      breath3: false,
      relax1: false,
      relax2: false,
      knowledge1: false,
      knowledge2: false,
    };
    setCheckedItems(cleared);
    try {
      localStorage.setItem(`rehab_checks_${user?.id}`, JSON.stringify(cleared));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        // Fetch latest assessment
        const assessRes = await api.get('/api/assessments/latest').catch(() => null);
        if (assessRes && assessRes.data) {
          setLatestAssessment(assessRes.data);
        }

        // Fetch logs for progress
        const logsRes = await api.get('/api/daily-logs').catch(() => null);
        if (logsRes && logsRes.data) {
          setLogs(logsRes.data);
        }
        
        loadProgress();
      } catch (err: any) {
        setError("Could not load rehabilitation plan data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

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
        <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
          <Award className="w-10 h-10 animate-bounce" />
        </div>
        <div className="text-center max-w-lg space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">Establish Auditory Baseline First</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A weekly rehabilitation plan is tailored uniquely to your auditory pitch, diagnosed burden levels, and sleep profile. Complete your initial 2-minute assessment wizard to unlock your customized checklist.
          </p>
        </div>
        <Link to="/assessment" className="py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover-lift flex items-center gap-2 cursor-pointer">
          <PlusCircle className="w-5 h-5" /> Start Auditory Assessment
        </Link>
      </div>
    );
  }

  // Calculate stats from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const logsThisWeek = logs.filter(log => {
    const logDate = new Date(log.log_date);
    return logDate >= sevenDaysAgo;
  });

  const totalTherapyMins = logsThisWeek.reduce((sum, log) => sum + (log.therapy_minutes_used || 0), 0);
  const totalLogsCount = logsThisWeek.length;

  // Sound Therapy Goal: 100 mins
  const therapyTarget = 100;
  const therapyProgress = Math.min(100, Math.round((totalTherapyMins / therapyTarget) * 100));

  // Logs Goal: 4 logs
  const logsTarget = 4;
  const logsProgress = Math.min(100, Math.round((totalLogsCount / logsTarget) * 100));

  // Relaxation Checks Progress (breath1-3 + relax1-2 = 5 items)
  const relaxCheckedCount = [
    checkedItems.breath1,
    checkedItems.breath2,
    checkedItems.breath3,
    checkedItems.relax1,
    checkedItems.relax2
  ].filter(Boolean).length;
  const relaxProgress = Math.round((relaxCheckedCount / 5) * 100);

  // Education Progress (knowledge1-2 = 2 items)
  const eduCheckedCount = [checkedItems.knowledge1, checkedItems.knowledge2].filter(Boolean).length;
  const eduProgress = Math.round((eduCheckedCount / 2) * 100);

  // Weighted Overall Weekly Progress: 
  // - 35% sound therapy
  // - 25% logs
  // - 25% relaxation exercises
  // - 15% education study
  const overallProgress = Math.min(100, Math.round(
    (therapyProgress * 0.35) + 
    (logsProgress * 0.25) + 
    (relaxProgress * 0.25) + 
    (eduProgress * 0.15)
  ));

  // Tailor relaxation protocol names based on assessment distress
  const isHighAnxiety = latestAssessment.ai_report?.severity_level === 'Severe' || 
                        latestAssessment.ai_report?.severity_level === 'Catastrophic';

  const breathingExerciseName = isHighAnxiety 
    ? "Box Wind-Down Breathing (Calms Auditory Neural Activity)" 
    : "Focused Diaphragmatic Breathing (Reduces Tinnitus Fixation)";

  const somaticExerciseName = isHighAnxiety
    ? "Progressive Muscle Relaxation (Somatic Ringing Release)"
    : "Neck & TMJ Muscle De-tensioning Exercises";

  // Pre-selected audio detail based on assessment
  const matchedSoundType = latestAssessment.sound_matching?.sound_type || 'white_noise';
  const matchedFrequency = latestAssessment.sound_matching?.matched_frequency_hz || '6000';
  
  let suggestedTrackName = "Pure White Noise";
  if (matchedSoundType === 'brown_noise') suggestedTrackName = "Deep Brownian Masker";
  else if (matchedSoundType === 'pink_noise') suggestedTrackName = "Gentle Pink Canopy";
  else if (matchedSoundType === 'rain_sounds') suggestedTrackName = "Rainfall Masker";
  else if (matchedSoundType === 'ocean_waves') suggestedTrackName = "Ocean Surf Calmer";
  else if (matchedSoundType === 'zen_meditation') suggestedTrackName = "Zen Temple Meditation";

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-teal-900 to-teal-750 text-white p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12">
          <Award className="w-64 h-64" />
        </div>
        <div className="z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full bg-teal-500/25 border border-teal-400/30 text-teal-200 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Customized Rehab Protocol
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Your Weekly Rehabilitation Plan</h1>
          <p className="text-teal-100/80 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Calibrated using your diagnosed baseline: <strong className="text-white">{matchedFrequency} Hz</strong> ringing localized in <strong className="text-white">{latestAssessment.ear_selection}</strong> ear. Complete weekly objectives to promote auditory habituation.
          </p>
        </div>
        <button
          onClick={resetWeeklyChecklist}
          className="px-4 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition z-10"
        >
          Reset Week Progress
        </button>
      </div>

      {/* Progress Ring / Dashboard section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Progress Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-150">Weekly Habituation Progress</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500">Weighted scores of sound masking, symptom check-ins, and breathing exercises.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Circular progress path */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="8"
                  stroke="#f1f5f9"
                  className="dark:stroke-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="8"
                  stroke={overallProgress === 100 ? '#10b981' : '#0d9488'}
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - overallProgress / 100)}
                  className="transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-850 dark:text-white">{overallProgress}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</span>
              </div>
            </div>

            {overallProgress === 100 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 py-2 px-4 rounded-xl text-center flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-bold animate-bounce mt-2">
                <Award className="w-4.5 h-4.5" /> Streaks Maintained! Excellent habituation.
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">1. Masking Therapy (35%)</span>
              <span className="font-bold text-teal-600">{therapyProgress}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">2. Symptom Diary (25%)</span>
              <span className="font-bold text-teal-600">{logsProgress}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">3. Cognitive Breathing (25%)</span>
              <span className="font-bold text-teal-600">{relaxProgress}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">4. Habituation Articles (15%)</span>
              <span className="font-bold text-teal-600">{eduProgress}%</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Actionable Objectives Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-650" />
                This Week's Rehabilitation Targets
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Complete your objective actions. Automated fields update dynamically as you use the player and daily logs.</p>
            </div>

            <div className="space-y-6">
              
              {/* Objective 1: Sound Masking */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Acoustic Habituation Session</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Listen to your customized track <strong className="text-indigo-650 dark:text-indigo-400">{suggestedTrackName}</strong> for at least 100 minutes.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-32 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${therapyProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold font-mono">
                      {totalTherapyMins} / 100 mins ({therapyProgress}%)
                    </span>
                  </div>
                </div>
                <Link to="/therapy" className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 py-1.5 px-3 rounded-lg dark:bg-slate-900 dark:border-slate-800 dark:text-indigo-400 hover-lift cursor-pointer">
                  Open Player <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Objective 2: Daily Logs */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Symptom & Distress Journaling</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Submit at least 4 daily diary entries to document intensity levels, sleep, and triggers.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-32 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${logsProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold font-mono">
                      {totalLogsCount} / 4 logs ({logsProgress}%)
                    </span>
                  </div>
                </div>
                <Link to="/logs" className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-650 hover:text-emerald-700 bg-white border border-slate-200 py-1.5 px-3 rounded-lg dark:bg-slate-900 dark:border-slate-800 dark:text-emerald-400 hover-lift cursor-pointer">
                  Log Symptoms <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Objective 3: Relaxation Exercises (Breathing checks) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-655 text-teal-605" />
                  <span className="text-xs font-bold text-slate-805 dark:text-slate-250">Cognitive Neural Down-Regulation</span>
                </div>
                <p className="text-xs text-slate-450 dark:text-slate-500 leading-normal">
                  Perform the following nervous system calming protocols at home:
                </p>

                <div className="space-y-2">
                  {[
                    { key: 'breath1', label: `${breathingExerciseName} - Session 1` },
                    { key: 'breath2', label: `${breathingExerciseName} - Session 2` },
                    { key: 'breath3', label: `${breathingExerciseName} - Session 3` },
                    { key: 'relax1', label: `${somaticExerciseName} - Session 1` },
                    { key: 'relax2', label: `${somaticExerciseName} - Session 2` },
                  ].map((ex) => (
                    <button
                      key={ex.key}
                      onClick={() => handleToggle(ex.key)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        checkedItems[ex.key]
                          ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 text-slate-750 dark:text-slate-350 line-through opacity-70'
                          : 'border-slate-150 dark:border-slate-850 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20'
                      }`}
                    >
                      <span>{ex.label}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        checkedItems[ex.key] ? 'bg-teal-605 bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {checkedItems[ex.key] && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Objective 4: Knowledge Hub articles */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Education & Reframing Practice</span>
                </div>
                <p className="text-xs text-slate-450 dark:text-slate-500 leading-normal">
                  Read targeted materials in the Knowledge Hub to break emotional distress triggers:
                </p>

                <div className="space-y-2">
                  {[
                    { key: 'knowledge1', label: "Read: Tinnitus Habituation and Cognitive Reframing Guide" },
                    { key: 'knowledge2', label: "Read: Ototoxic Drugs, Dietary triggers and Sound Masking Strategy" }
                  ].map((ex) => (
                    <button
                      key={ex.key}
                      onClick={() => handleToggle(ex.key)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        checkedItems[ex.key]
                          ? 'bg-amber-50/20 dark:bg-amber-955/10 border-amber-500 text-slate-750 dark:text-slate-350 line-through opacity-70'
                          : 'border-slate-150 dark:border-slate-850 hover:border-amber-300 dark:hover:border-amber-800 text-slate-700 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20'
                      }`}
                    >
                      <span>{ex.label}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        checkedItems[ex.key] ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {checkedItems[ex.key] && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Advisory Note */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 dark:bg-indigo-950/15 dark:border-indigo-900/30 dark:text-indigo-400 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
        <div>
          <strong>Rehabilitation Compliance Notice:</strong> Tinnitus sound therapy habituation requires consistent, daily training to re-train the auditory cortex. Maskers should be set to the "mixing point" (where internal noise and the masker merge), not played at high volumes. Discuss progress trends with your doctor during monthly consultations.
        </div>
      </div>

    </div>
  );
};
export default RehabilitationPlan;
