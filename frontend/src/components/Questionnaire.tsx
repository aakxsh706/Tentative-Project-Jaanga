import React from 'react';
import { Moon, Sparkles, Smile, ShieldAlert, BookOpen, Clock, Activity, Focus } from 'lucide-react';

interface QuestionnaireProps {
  answers: Record<string, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ answers, setAnswers }) => {
  const updateAnswer = (key: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Step 3: Symptom Questionnaire</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Complete the health screening questions. These metrics help the AI customize sound masker levels and generate clinical observations.
      </p>

      <div className="space-y-8">
        {/* Category 1: Sleep */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Moon className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-355">
              1. Sleep Quality Interference
            </h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-550 mb-3">
            How frequently does tinnitus disrupt your ability to fall asleep or wake you during the night?
          </p>
          <input
            type="range"
            min="1"
            max="10"
            value={answers.sleep || 5}
            onChange={(e) => updateAnswer('sleep', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold">
            <span>No disruption (1)</span>
            <span>Current setting: {answers.sleep || 5}/10</span>
            <span>Severe Insomnia (10)</span>
          </div>
        </div>

        {/* Category 2: Stress */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-355">
              2. Subjective Stress Level
            </h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-550 mb-3">
            Rate your general anxiety or cognitive stress over the past week.
          </p>
          <input
            type="range"
            min="1"
            max="10"
            value={answers.stress || 5}
            onChange={(e) => updateAnswer('stress', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold">
            <span>Perfect Calm (1)</span>
            <span>Current setting: {answers.stress || 5}/10</span>
            <span>Extreme Anxiety (10)</span>
          </div>
        </div>

        {/* Category 3: Noise Exposure */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Activity className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-355">
              3. Loud Noise Exposure
            </h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-550 mb-4">
            How often are you exposed to loud music, machinery, headphones, or construction sounds?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {['Never', 'Occasionally', 'Always'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateAnswer('noise_exposure', opt.toLowerCase())}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                  (answers.noise_exposure || 'never') === opt.toLowerCase()
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-150'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-55 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-850'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Category 4: Concentration */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Focus className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-355">
              4. Concentration Interference
            </h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-550 mb-4">
            Does the ringing disrupt your ability to read, work, or concentrate on complex mental tasks?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {['Never', 'Sometimes', 'Always'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateAnswer('concentration', opt.toLowerCase())}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                  (answers.concentration || 'sometimes') === opt.toLowerCase()
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-150'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-55 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-850'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Category 5: Mood */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Smile className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-355">
              5. Emotional Impact
            </h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-550 mb-4">
            How heavily does the ringing affect your emotional state or general mood?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'none', label: 'Neutral / Calm' },
              { val: 'moderate', label: 'Annoyed / Frustrated' },
              { val: 'severe', label: 'Severely Distressed' }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => updateAnswer('mood_impact', opt.val)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                  (answers.mood_impact || 'none') === opt.val
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-150'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-55 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-850'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category 6: Duration */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-355">
              6. Tinnitus Duration
            </h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-550 mb-4">
            How often is the sound present?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'rare', label: 'Rare Spikes' },
              { val: 'intermittent', label: 'Intermittent' },
              { val: 'continuous', label: 'Continuous / Constant' }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => updateAnswer('duration', opt.val)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                  (answers.duration || 'intermittent') === opt.val
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-150'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-55 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-850'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
