import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Stethoscope, 
  Ear, 
  HeartPulse, 
  AlertTriangle, 
  Moon, 
  ChevronRight 
} from 'lucide-react';
import { KNOWLEDGE_TOPICS, DOCTOR_DISCLAIMER } from '../data/tinnitusKnowledgeBase';

export const KnowledgeHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('identification');

  const topicIconMap: Record<string, React.ReactNode> = {
    Ear: <Ear className="w-5 h-5" />,
    HeartPulse: <HeartPulse className="w-5 h-5" />,
    Stethoscope: <Stethoscope className="w-5 h-5" />,
    AlertTriangle: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    Moon: <Moon className="w-5 h-5" />
  };

  const activeTopicObj = KNOWLEDGE_TOPICS.find(t => t.id === selectedTopic) || KNOWLEDGE_TOPICS[0];

  const filteredQuestions = activeTopicObj.questions.filter(q => 
    q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-600 dark:text-teal-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-sans">Tinnitus Knowledge & Treatment Hub</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Evidence-based guidance on symptoms, habituation, sound therapies & doctor care</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions & remedies..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 transition"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {KNOWLEDGE_TOPICS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedTopic(cat.id)}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
              selectedTopic === cat.id
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 shadow-2xs font-semibold'
                : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${selectedTopic === cat.id ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {topicIconMap[cat.icon] || <Ear className="w-5 h-5" />}
            </div>
            <div className="text-xs truncate font-medium">{cat.title}</div>
          </button>
        ))}
      </div>

      {/* Topic Content */}
      <div className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">{activeTopicObj.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{activeTopicObj.summary}</p>
        </div>

        <div className="space-y-3">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((qItem, idx) => (
              <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 hover:border-teal-300 dark:hover:border-teal-800 transition bg-white/50 dark:bg-slate-900/30">
                <h4 className="font-semibold text-xs sm:text-sm text-slate-850 dark:text-slate-100 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" />
                  {qItem.q}
                </h4>
                <div className="text-xs text-slate-650 dark:text-slate-350 pl-6 leading-relaxed whitespace-pre-line">
                  {qItem.a}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching questions found in this category.
            </div>
          )}
        </div>
      </div>

      {/* Doctor Consult Sticky Note */}
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-805 dark:bg-rose-955/15 dark:border-rose-905/30 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2.5 leading-normal">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <strong>Clinical Advisory:</strong> {DOCTOR_DISCLAIMER.full}
        </div>
      </div>
    </div>
  );
};
export default KnowledgeHub;
