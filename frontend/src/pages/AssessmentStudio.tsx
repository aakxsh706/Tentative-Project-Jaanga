import React, { useState } from 'react';
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  RefreshCw, 
  Stethoscope, 
  FileText, 
  UserCheck 
} from 'lucide-react';

interface Option {
  value: string;
  label: string;
  score: number;
  redFlag?: boolean;
  note?: string;
}

interface SubQuestion {
  id: string;
  label: string;
  options: Option[];
}

interface AssessmentStep {
  id: string;
  title: string;
  question: string;
  options?: Option[];
  subQuestions?: SubQuestion[];
}

const ASSESSMENT_STEPS: AssessmentStep[] = [
  {
    id: 'soundType',
    title: 'Sound Characteristics & Identification',
    question: 'How would you describe the acoustic tone or sound pattern you hear?',
    options: [
      { value: 'high_ring', label: 'High-pitched ringing or squeal (like a TV CRT whistle)', score: 1 },
      { value: 'buzz_hum', label: 'Constant buzzing, humming, or electric static', score: 1 },
      { value: 'pulsatile', label: '🚨 Rhythmic beating or swooshing (syncs with heartbeat)', score: 3, redFlag: true },
      { value: 'clicking', label: 'Ticking or clicking sound (like a clock or muscle twitch)', score: 1 },
      { value: 'roaring', label: 'Low ocean roaring or rushing air sound', score: 1 }
    ]
  },
  {
    id: 'location',
    title: 'Ear Location & Duration',
    question: 'Where do you hear the sound and how long has it been present?',
    subQuestions: [
      {
        id: 'ears',
        label: 'Ear Location:',
        options: [
          { value: 'both', label: 'Both ears equally', score: 1 },
          { value: 'in_head', label: 'Inside the middle of my head', score: 1 },
          { value: 'left_only', label: 'Left ear only', score: 2, note: 'Unilateral' },
          { value: 'right_only', label: 'Right ear only', score: 2, note: 'Unilateral' }
        ]
      },
      {
        id: 'duration',
        label: 'Onset & Duration:',
        options: [
          { value: 'sudden_recent', label: '🚨 Started suddenly within the last 48-72 hours', score: 3, redFlag: true },
          { value: 'recent_weeks', label: 'Started recently (less than 3 months)', score: 1 },
          { value: 'chronic', label: 'Long term (more than 6 months)', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'concomitant',
    title: 'Accompanying Symptoms & Red Flags',
    question: 'Are you experiencing any of the following symptoms alongside your tinnitus?',
    options: [
      { value: 'sudden_hearing_loss', label: '🚨 Sudden drop in hearing clarity in one or both ears', redFlag: true, score: 3 },
      { value: 'dizziness_vertigo', label: '🚨 Dizziness, room spinning (vertigo), or loss of balance', redFlag: true, score: 3 },
      { value: 'ear_pain_fullness', label: 'Ear fullness, pressure, or earache', score: 1 },
      { value: 'tmj_jaw', label: 'Jaw popping, TMJ pain, or neck muscle tightness', score: 1 },
      { value: 'none', label: 'None of the above - tinnitus is my only symptom', score: 0 }
    ]
  },
  {
    id: 'focusStress', // distinct ID to avoid conflicting fields
    title: 'Daily & Emotional Impact (THI Scale)',
    question: 'How severely does the sound affect your daily activities and well-being?',
    subQuestions: [
      {
        id: 'sleep',
        label: 'Sleep Impact:',
        options: [
          { value: 'sleep_mild', label: 'No trouble sleeping', score: 0 },
          { value: 'sleep_mod', label: 'Takes longer to fall asleep without noise', score: 2 },
          { value: 'sleep_sev', label: 'Frequently wakes me up or causes severe insomnia', score: 4 }
        ]
      },
      {
        id: 'focus',
        label: 'Focus & Stress:',
        options: [
          { value: 'focus_mild', label: 'Noticeable only in quiet rooms', score: 1 },
          { value: 'focus_mod', label: 'Disrupts reading, work, or concentration', score: 2 },
          { value: 'focus_sev', label: 'Causes anxiety, distress, or mood changes', score: 4 }
        ]
      }
    ]
  }
];

interface GeneratedReport {
  score: number;
  severity: string;
  severityColor: string;
  redFlags: string[];
  date: string;
  doctorChecklist: string[];
}

export const AssessmentStudio: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    soundType: '',
    ears: '',
    duration: '',
    concomitant: [] as string[],
    sleep: '',
    focus: ''
  });
  const [report, setReport] = useState<GeneratedReport | null>(null);

  const handleSelect = (field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setAnswers(prev => {
      const list: string[] = prev[field] || [];
      if (value === 'none') return { ...prev, [field]: ['none'] };
      const updated = list.includes(value) 
        ? list.filter(v => v !== value) 
        : [...list.filter(v => v !== 'none'), value];
      return { ...prev, [field]: updated };
    });
  };

  const calculateReport = () => {
    let score = 0;
    const redFlags: string[] = [];

    // Check sound type
    if (answers.soundType === 'pulsatile') {
      score += 4;
      redFlags.push('Pulsatile (heartbeat-synchronous) noise perception');
    }

    // Check ears
    if (answers.ears === 'left_only' || answers.ears === 'right_only') {
      score += 2;
      redFlags.push(`Unilateral tinnitus localized in ${answers.ears === 'left_only' ? 'left' : 'right'} ear`);
    }

    // Check duration
    if (answers.duration === 'sudden_recent') {
      score += 3;
      redFlags.push('Sudden tinnitus onset within the last 48-72 hours');
    }

    // Check concomitant
    if (answers.concomitant?.includes('sudden_hearing_loss')) {
      score += 4;
      redFlags.push('Accompanying sudden hearing loss');
    }
    if (answers.concomitant?.includes('dizziness_vertigo')) {
      score += 4;
      redFlags.push('Accompanying dizziness, vertigo, or balance issues');
    }

    // Sleep & Focus
    if (answers.sleep === 'sleep_sev') score += 4;
    if (answers.sleep === 'sleep_mod') score += 2;
    if (answers.focus === 'focus_sev') score += 4;
    if (answers.focus === 'focus_mod') score += 2;

    // Severity level determination
    let severity = 'Mild';
    let severityColor = 'teal';
    if (redFlags.length > 0) {
      severity = 'Urgent Medical Review Needed';
      severityColor = 'rose';
    } else if (score >= 8) {
      severity = 'Severe Tinnitus Impact';
      severityColor = 'amber';
    } else if (score >= 4) {
      severity = 'Moderate Tinnitus Impact';
      severityColor = 'indigo';
    }

    const generatedReport: GeneratedReport = {
      score,
      severity,
      severityColor,
      redFlags,
      date: new Date().toLocaleDateString(),
      doctorChecklist: [
        `1. Perform Otoscopy to inspect the eardrum and check for earwax impaction.`,
        `2. Order a Comprehensive Audiogram testing up to 8,000-12,000 Hz.`,
        redFlags.length > 0 
          ? `3. URGENT: Evaluate identified red-flags (${redFlags.join(', ')}).` 
          : `3. Evaluate middle ear pressure via Tympanometry.`,
        `4. Discuss sound therapy options, customized masking, or Tinnitus Retraining Therapy (TRT).`,
        `5. Review existing medications to rule out ototoxic drugs.`
      ]
    };

    setReport(generatedReport);
  };

  const isStepValid = () => {
    if (currentStep === 0) return !!answers.soundType;
    if (currentStep === 1) return !!answers.ears && !!answers.duration;
    if (currentStep === 2) return answers.concomitant && answers.concomitant.length > 0;
    if (currentStep === 3) return !!answers.sleep && !!answers.focus;
    return true;
  };

  const handleNext = () => {
    if (currentStep < ASSESSMENT_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateReport();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setAnswers({
      soundType: '',
      ears: '',
      duration: '',
      concomitant: [] as string[],
      sleep: '',
      focus: ''
    });
    setReport(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {!report ? (
          <div>
            {/* Wizard Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-600 dark:text-teal-400">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-sans">AI Tinnitus Symptom & Distress Assessment</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step {currentStep + 1} of {ASSESSMENT_STEPS.length}: {ASSESSMENT_STEPS[currentStep].title}
                  </p>
                </div>
              </div>

              {/* Progress Pills */}
              <div className="flex gap-1.5">
                {ASSESSMENT_STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-8 bg-teal-605 bg-teal-600'
                        : idx < currentStep
                        ? 'w-2 bg-teal-400'
                        : 'w-2 bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Content */}
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-normal">
                {ASSESSMENT_STEPS[currentStep].question}
              </h3>

              {/* Single List Options */}
              {ASSESSMENT_STEPS[currentStep].options && (
                <div className="space-y-2.5">
                  {ASSESSMENT_STEPS[currentStep].options?.map((opt) => {
                    const isSelected = currentStep === 2 
                      ? answers.concomitant?.includes(opt.value)
                      : answers[ASSESSMENT_STEPS[currentStep].id] === opt.value;

                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (currentStep === 2) {
                            handleMultiSelect('concomitant', opt.value);
                          } else {
                            handleSelect(ASSESSMENT_STEPS[currentStep].id, opt.value);
                          }
                        }}
                        className={`w-full p-4 rounded-xl border text-left transition flex items-start justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-555 border-teal-500 text-teal-900 dark:text-teal-200 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-medium pr-4 leading-normal">{opt.label}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sub Questions */}
              {ASSESSMENT_STEPS[currentStep].subQuestions && (
                <div className="space-y-6">
                  {ASSESSMENT_STEPS[currentStep].subQuestions?.map((subQ) => (
                    <div key={subQ.id} className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {subQ.label}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {subQ.options.map((opt) => {
                          const isSelected = answers[subQ.id] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleSelect(subQ.id, opt.value)}
                              className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 shadow-2xs'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100 dark:border-slate-805">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-405 disabled:opacity-30 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 shadow-sm transition cursor-pointer animate-pulse-once"
              >
                {currentStep === ASSESSMENT_STEPS.length - 1 ? 'Generate Doctor Summary Report' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Report Page */
          <div id="printable-report" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:border-b print:pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-600 text-white rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-sans">Personalized Tinnitus Assessment Report</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Generated on {report.date} for ENT / Audiology Consultation</p>
                </div>
              </div>

              <div className="flex gap-2.5 print:hidden shrink-0">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Report
                </button>
                <button
                  onClick={resetAssessment}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 hover:bg-teal-100 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
              </div>
            </div>

            {/* Red Flag Warning */}
            {report.redFlags.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/60 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-455 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600 animate-bounce" />
                  <span>Urgent Medical Consultation Required</span>
                </div>
                <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-semibold">
                  Your assessment answers flagged symptoms that require prompt clinical examination by an ENT specialist:
                </p>
                <ul className="list-disc list-inside text-xs text-rose-800 dark:text-rose-350 space-y-1 font-medium pl-2">
                  {report.redFlags.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Impact Severity</div>
                <div className={`text-sm font-extrabold mt-1 uppercase ${
                  report.severityColor === 'rose' ? 'text-rose-600' : report.severityColor === 'amber' ? 'text-amber-600' : report.severityColor === 'indigo' ? 'text-indigo-650' : 'text-teal-600'
                }`}>
                  {report.severity}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sound Profile</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 capitalize">
                  {answers.soundType.replace('_', ' ')}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Localization</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 capitalize">
                  {answers.ears ? answers.ears.replace('_', ' ') : 'N/A'}
                </div>
              </div>
            </div>

            {/* Doctor Guide Checklist */}
            <div className="bg-teal-50/60 dark:bg-teal-950/40 p-5 rounded-xl border border-teal-200 dark:border-teal-900/60 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-teal-900 dark:text-teal-200">
                <Stethoscope className="w-5 h-5 text-teal-605" />
                <span>Recommended Checklist for Your ENT / Audiology Visit</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                We advise printing this report and discussing the following clinical diagnostic checklist with your doctor:
              </p>
              <div className="space-y-2">
                {report.doctorChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <UserCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] text-slate-450 dark:text-slate-400 text-center">
              Disclaimer: This assessment is an educational screening tool and does not replace professional clinical evaluation or audiograms.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AssessmentStudio;
