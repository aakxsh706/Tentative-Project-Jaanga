import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EarHotspots } from '../components/EarHotspots';
import { SoundMatcher } from '../components/SoundMatcher';
import { Questionnaire } from '../components/Questionnaire';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Brain, 
  Heart, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Activity,
  Music
} from 'lucide-react';

export const AssessmentWizard: React.FC = () => {
  const { api } = useAuth();
  const navigate = useNavigate();

  // Wizard Navigation Step
  const [step, setStep] = useState(1);

  // Assessment Data State
  const [earSelection, setEarSelection] = useState('both');
  const [selectedHotspots, setSelectedHotspots] = useState<string[]>([]);
  
  const [frequency, setFrequency] = useState(4000);
  const [volume, setVolume] = useState(45);
  const [soundType, setSoundType] = useState('pure_tone');
  const [similarity, setSimilarity] = useState(5);

  const [answers, setAnswers] = useState<Record<string, any>>({
    sleep: 5,
    stress: 5,
    noise_exposure: 'never',
    concentration: 'sometimes',
    mood_impact: 'none',
    duration: 'intermittent'
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedHotspots.length === 0) {
      setError("Please click at least one area on the ear diagram to locate the tinnitus.");
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const payload = {
      ear_selection: earSelection,
      ear_hotspots: selectedHotspots,
      sound_matching: {
        matched_frequency_hz: frequency,
        matched_volume_db: volume,
        sound_type: soundType,
        similarity_rating: similarity
      },
      questionnaire: {
        answers: answers
      }
    };

    try {
      const response = await api.post('/api/assessments', payload);
      setAnalysisReport(response.data.ai_report);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit assessment. Please check backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto font-sans">
      {/* Wizard Header */}
      {!analysisReport && (
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tinnitus Assessment Wizard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Map your acoustic frequencies, hotspots, and medical parameters in 3 simple steps.
          </p>

          {/* Stepper Indicators */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {[
              { num: 1, label: 'Ear Map' },
              { num: 2, label: 'Sound Match' },
              { num: 3, label: 'Screening' }
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-indigo-600 text-white shadow-md'
                    : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className={`text-xs font-semibold ${step === s.num ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                {s.num < 3 && <span className="w-8 h-[2px] bg-slate-250 dark:bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Errors */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex gap-2.5 items-center dark:bg-rose-955/20 dark:border-rose-900/50 dark:text-rose-455 max-w-2xl mx-auto">
          <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton during submission */}
      {submitting && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-6" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Analyzing Auditory Thresholds</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            Please wait. TinniCare AI is processing acoustic variables, mapping ear hotspots, and compiling customized sound therapy recommendations...
          </p>
        </div>
      )}

      {/* Steps Content */}
      {!submitting && !analysisReport && (
        <div className="space-y-6">
          {step === 1 && (
            <EarHotspots
              earSelection={earSelection}
              setEarSelection={setEarSelection}
              selectedHotspots={selectedHotspots}
              setSelectedHotspots={setSelectedHotspots}
            />
          )}

          {step === 2 && (
            <SoundMatcher
              frequency={frequency}
              setFrequency={setFrequency}
              volume={volume}
              setVolume={setVolume}
              soundType={soundType}
              setSoundType={setSoundType}
              similarity={similarity}
              setSimilarity={setSimilarity}
            />
          )}

          {step === 3 && (
            <Questionnaire
              answers={answers}
              setAnswers={setAnswers}
            />
          )}

          {/* Stepper Navigation Actions */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150/40 dark:border-slate-850">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-1.5 py-2.5 px-5 bg-white border border-slate-200 text-slate-655 hover:bg-slate-50 text-sm font-bold rounded-lg disabled:opacity-40 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 py-2.5 px-6 bg-indigo-650 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg focus:outline-none hover-lift transition-all cursor-pointer"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg focus:outline-none hover-lift transition-all cursor-pointer"
              >
                Submit & Generate AI Plan <Brain className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Output Analysis Report Dashboard */}
      {analysisReport && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Banner */}
          <div className="bg-emerald-600 text-white p-8 rounded-2xl shadow-md text-center max-w-3xl mx-auto">
            <CheckCircle className="w-12 h-12 text-white/90 mx-auto mb-4" />
            <h2 className="text-2xl font-bold tracking-tight">Assessment Submitted Successfully!</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Your AI diagnostic report and clinical summaries have been prepared.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Severity Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center">
              <span className="p-3 bg-rose-50 text-rose-600 rounded-xl dark:bg-rose-955/20 dark:text-rose-455 mb-4">
                <Activity className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Severity Score</h4>
                <p className="text-xl font-black text-rose-650 dark:text-rose-400">
                  {analysisReport.severity_level} Burden
                </p>
              </div>
              <div className="mt-4 text-xs text-slate-450 dark:text-slate-500 leading-normal">
                Indicates a moderate baseline distress requiring specialized audio masking schedules.
              </div>
            </div>

            {/* Risk factors */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-indigo-50 text-indigo-650 rounded-xl dark:bg-indigo-950 dark:text-indigo-400">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-205">Somatic & Acoustic Risk Profile</h3>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {analysisReport.risk_factors?.map((risk: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex px-3 py-1 rounded-full bg-slate-50 text-slate-655 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 text-xs font-semibold"
                  >
                    {risk}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-4 leading-normal">
                These risk tags describe parameters likely amplifying your subjective loudness rating.
              </p>
            </div>

            {/* Lifestyle and recommendations */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm md:col-span-3 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-2">Lifestyle Observations</h4>
                <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
                  {analysisReport.lifestyle_observations}
                </p>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-3 flex items-center gap-2">
                  <Music className="w-5 h-5 text-indigo-650 dark:text-indigo-400" /> Recommended Sound Masking & CBT Strategies
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysisReport.recommendations?.map((rec: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-150/40 dark:border-slate-850 rounded-xl flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                      <span className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Doctor Note clinical summary */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/30 md:col-span-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 bg-indigo-100/80 text-indigo-755 rounded-lg dark:bg-indigo-950 dark:text-indigo-300">
                  <FileText className="w-5 h-5" />
                </span>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-300">Clinician Summary Note (Shared with Doctor)</h4>
              </div>
              <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed italic bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                "{analysisReport.clinical_summary}"
              </p>
            </div>

            {/* Patient Friendly explanation */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm md:col-span-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-2">Patient-Friendly Explanation</h4>
              <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {analysisReport.patient_explanation}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 max-w-md mx-auto">
            <Link to="/dashboard" className="flex-1 py-3 px-5 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 transition-all">
              Go to Dashboard
            </Link>
            <Link to="/therapy" className="flex-1 py-3 px-5 text-center bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl text-xs hover-lift transition-all shadow-md">
              Start Sound Therapy
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
