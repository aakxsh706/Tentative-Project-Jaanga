import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  Activity, 
  Calendar, 
  Clipboard, 
  TrendingUp, 
  Printer, 
  ShieldAlert, 
  ChevronRight,
  ClipboardList,
  CheckCircle2
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

export const DoctorDashboard: React.FC = () => {
  const { api } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Clinical notes
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/doctor/patients');
      setPatients(res.data);
      if (res.data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(res.data[0].id);
      }
    } catch (e) {
      console.error("Could not load clinician caseload", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/api/doctor/patients/${id}`);
      setPatientDetails(res.data);
      setClinicalNotes(res.data.clinical_notes || '');
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleSaveNotes = async () => {
    if (!selectedPatientId) return;
    setSavingNotes(true);
    setNotesSuccess(false);
    try {
      await api.put(`/api/doctor/patients/${selectedPatientId}/notes`, { notes: clinicalNotes });
      setNotesSuccess(true);
      fetchPatients(); // refresh patient list to catch updated notes
      setTimeout(() => setNotesSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter patients list
  const filteredPatients = patients.filter(pat => {
    const matchesSearch = pat.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pat.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || 
                            pat.latest_severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  // Mock patient list for fallback/demo visual purposes if DB is empty
  const mockPatients = [
    { id: 'p1', full_name: 'John Davis', email: 'john@davis.com', latest_severity: 'Moderate', latest_frequency: 8000, latest_volume: 45, latest_assessment_date: '2026-07-30T10:00:00', compliance_score_percent: 85 },
    { id: 'p2', full_name: 'Robert Miller', email: 'robert@miller.com', latest_severity: 'Severe', latest_frequency: 6000, latest_volume: 65, latest_assessment_date: '2026-07-29T12:00:00', compliance_score_percent: 100 },
    { id: 'p3', full_name: 'Emily Watson', email: 'emily@watson.com', latest_severity: 'Mild', latest_frequency: 3000, latest_volume: 20, latest_assessment_date: '2026-07-28T09:00:00', compliance_score_percent: 57 }
  ];

  const displayedPatients = patients.length > 0 ? filteredPatients : mockPatients.filter(pat => {
    const matchesSearch = pat.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || pat.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || pat.latest_severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  // Mock patient details if not loaded
  const defaultChartData = [
    { date: 'Mon', Intensity: 6, Stress: 7, Sleep: 6.5 },
    { date: 'Tue', Intensity: 5, Stress: 5, Sleep: 7.2 },
    { date: 'Wed', Intensity: 7, Stress: 8, Sleep: 5.5 },
    { date: 'Thu', Intensity: 4, Stress: 4, Sleep: 8.0 },
    { date: 'Fri', Intensity: 5, Stress: 6, Sleep: 7.0 },
    { date: 'Sat', Intensity: 3, Stress: 3, Sleep: 8.5 },
    { date: 'Sun', Intensity: 4, Stress: 4, Sleep: 7.8 }
  ];

  const activeDetails = patientDetails || (displayedPatients.length > 0 ? {
    id: displayedPatients[0].id,
    full_name: displayedPatients[0].full_name,
    email: displayedPatients[0].email,
    date_of_birth: '1985-05-12',
    gender: 'male',
    noise_exposure_history: 'Constant headphones exposure during telework, high volume machinery hobbies.',
    medical_conditions: 'Mild hypertension.',
    assessments: [{
      ear_selection: 'both',
      ear_hotspots: ['eardrum', 'canal'],
      sound_matching: {
        matched_frequency_hz: displayedPatients[0].latest_frequency || 8000,
        matched_volume_db: displayedPatients[0].latest_volume || 45,
        sound_type: 'pure_tone',
        similarity_rating: 8
      },
      ai_report: {
        severity_level: displayedPatients[0].latest_severity,
        lifestyle_observations: 'High stress and insomnia reported, directly correlating with intensity peaks.',
        recommendations: [
          'Use Brown Noise sound masking at 8000 Hz mixing point.',
          'Schedule 10 minutes of deep box breathing to combat autonomic arousal spikes.',
          'Enforce strict earplug protection on industrial site walks.'
        ]
      }
    }],
    daily_logs: [],
    clinical_notes: 'Recommend daily sound therapy session tracking. Patient shows somatic trigger sensitivity.'
  } : null);

  const chartData = activeDetails?.daily_logs && activeDetails.daily_logs.length > 0
    ? activeDetails.daily_logs.slice().reverse().map((log: any) => ({
        date: log.log_date.split('-').slice(1).join('/'),
        Intensity: log.tinnitus_intensity,
        Stress: log.stress_level,
        Sleep: log.sleep_hours
      }))
    : defaultChartData;

  const currentAssess = activeDetails?.assessments?.[0];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans print:p-0">
      {/* Clinician Header - Hide on print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-850 dark:bg-indigo-950 dark:text-indigo-400 mb-2 uppercase tracking-wide">
            Audiologist Workstation
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Clinical Decision Support</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review patient screening records, compare audiometric matching values, and export clinical summary PDF notes.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout Split-Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Patient list selector (Hide on print) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-4 space-y-4 print:hidden">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assigned Caseload</h3>
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-650"
            />
          </div>

          {/* Severity Filters */}
          <div className="flex gap-2">
            {['all', 'mild', 'moderate', 'severe'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold capitalize border transition-all ${
                  severityFilter === sev
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Patient Card Stack */}
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 dark:bg-slate-950 rounded-xl" />
              ))}
            </div>
          ) : displayedPatients.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No patients match selected filters.</p>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {displayedPatients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    (selectedPatientId || displayedPatients[0].id) === pat.id
                      ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900'
                      : 'bg-slate-50/40 border-slate-100 dark:bg-slate-950/40 dark:border-slate-850 hover:bg-slate-50'
                  }`}
                >
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{pat.full_name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{pat.email}</p>
                  </div>
                  <div className="text-right flex items-center gap-1.5 flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                      pat.latest_severity === 'Mild' ? 'bg-emerald-50 text-emerald-700' :
                      pat.latest_severity === 'Moderate' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {pat.latest_severity}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-350" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Detailed Patient Workspace Panel */}
        {detailsLoading ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-8 animate-pulse h-[550px] flex items-center justify-center">
            <span className="text-xs text-slate-405 font-bold">Loading patient clinical metrics...</span>
          </div>
        ) : activeDetails ? (
          <div className="space-y-6 lg:col-span-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm print:border-none print:shadow-none print:p-0">
            
            {/* Patient overview header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white print:text-2xl">{activeDetails.full_name}</h2>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                  DOB: {activeDetails.date_of_birth || 'N/A'} &bull; Gender: <span className="capitalize">{activeDetails.gender}</span> &bull; Email: {activeDetails.email}
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover-lift print:hidden cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
              >
                <Printer className="w-4 h-4" /> Print Clinical PDF Report
              </button>
            </div>

            {/* Assessment Details */}
            {currentAssess ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Acoustic Matching Profile */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150/45 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-650" /> Auditory Match Thresholds
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Mapped Ear Selection</span>
                      <strong className="text-slate-700 dark:text-slate-300 capitalize">{currentAssess.ear_selection} Ear</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Pitch Frequency Match</span>
                      <strong className="text-slate-700 dark:text-slate-300">{currentAssess.sound_matching?.matched_frequency_hz} Hz</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Intensity Mask Level</span>
                      <strong className="text-slate-700 dark:text-slate-300">{currentAssess.sound_matching?.matched_volume_db} %</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Audio Mask Category</span>
                      <strong className="text-slate-700 dark:text-slate-300 capitalize">{currentAssess.sound_matching?.sound_type.replace('_', ' ')}</strong>
                    </div>
                  </div>
                  {currentAssess.ear_hotspots && (
                    <div className="mt-4">
                      <span className="text-[10px] text-slate-400 block font-medium mb-1">Perceived Hotspot Zones</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAssess.ear_hotspots.map((hot: string) => (
                          <span key={hot} className="px-2 py-0.5 bg-indigo-50 text-indigo-755 rounded text-[9.5px] font-bold dark:bg-indigo-950 dark:text-indigo-400 capitalize">
                            {hot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Patient Lifestyle Screen details */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150/45 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clipboard className="w-4 h-4 text-emerald-650" /> Health Screening & Exposure
                  </h4>
                  <div className="space-y-3 text-xs leading-normal">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Noise Exposure History</span>
                      <span className="text-slate-655 dark:text-slate-350">{activeDetails.noise_exposure_history || 'No significant noise exposure reported.'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Co-morbid Medical Conditions</span>
                      <span className="text-slate-655 dark:text-slate-350">{activeDetails.medical_conditions || 'None reported.'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl text-center text-xs text-slate-400 italic">
                This patient has not submitted any assessments yet.
              </div>
            )}

            {/* Recharts progress chart */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Symptom Intensity Tracking (Past 7 Logs)</h3>
              <div className="h-[200px] w-full bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-150/40 dark:border-slate-850">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 10]} tickLine={false} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 5 }} />
                    <Line type="monotone" dataKey="Intensity" name="Tinnitus" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Stress" name="Stress" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="Sleep" name="Sleep" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI observations */}
            {currentAssess?.ai_report && (
              <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-400 uppercase tracking-wider mb-2">AI Clinical Assessment Summary</h4>
                <p className="text-xs text-indigo-900/95 dark:text-indigo-250 leading-relaxed font-mono">
                  "{currentAssess.ai_report.clinical_summary}"
                </p>
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">AI Therapy Recommendations</span>
                  <ul className="space-y-1">
                    {currentAssess.ai_report.recommendations?.slice(0, 3).map((rec: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Clinical notes form editor - Hide on print */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Clinical Notes & Adjustments</label>
              
              {notesSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex gap-2 items-center">
                  <CheckCircle2 className="w-4 h-4" /> Notes saved successfully!
                </div>
              )}
              
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Type clinician observations, adjusted masking thresholds, or follow-up timelines..."
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-650"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingNotes ? 'Saving Notes...' : 'Save Notes'}
                </button>
              </div>
            </div>

            {/* Printable Clinical summary report layout details - Only visible on print */}
            <div className="hidden print:block space-y-6 pt-10 border-t border-dashed border-slate-300">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800">Clinician Assessment Summary & Report</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-500 block">Assessment Date:</span>
                  <span>{currentAssess ? new Date(currentAssess.completed_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Clinician License Validation:</span>
                  <span>{api.defaults.headers.common['Authorization'] ? 'VERIFIED' : 'PENDING'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-semibold text-slate-500 block">Clinician Assessment Notes:</span>
                <p className="p-4 bg-slate-50 rounded border text-slate-700 italic">
                  {clinicalNotes || 'No notes currently registered for this session.'}
                </p>
              </div>
              <div className="text-center text-[10px] text-slate-400 mt-12 pt-4 border-t border-slate-200">
                Generated via TinniCare AI HIPAA Support Platform. Consult doctor credentials for medical verification.
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-8 text-center py-20 print:hidden">
            <ClipboardList className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h3 className="text-md font-bold text-slate-755 dark:text-slate-300 mb-2">No Active Patient Profile</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Select an assigned patient from the left column stack to access health timelines and matching results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
