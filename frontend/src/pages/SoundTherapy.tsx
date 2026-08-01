import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, 
  Pause, 
  Star, 
  Heart, 
  Volume2, 
  Clock, 
  Music, 
  Headphones, 
  RefreshCw,
  Ear,
  PlusCircle,
  Sparkles,
  Timer,
  Sliders
} from 'lucide-react';

export const SoundTherapy: React.FC = () => {
  const { api } = useAuth();
  const [library, setLibrary] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  
  // Sleep Timer & Calibration States
  const [pitchFreq, setPitchFreq] = useState(6000);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Timer tracking
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Audio Context refs for real-time synthesis
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  const fetchSounds = async () => {
    try {
      const libRes = await api.get('/api/therapy/library');
      const favRes = await api.get('/api/therapy/favorites');
      setFavorites(favRes.data);
      
      const assessRes = await api.get('/api/assessments/latest').catch(() => null);
      let loadedAssessment = null;
      if (assessRes && assessRes.data) {
        loadedAssessment = assessRes.data;
        setLatestAssessment(assessRes.data);
        if (assessRes.data.sound_matching?.matched_volume_db) {
          setVolume(assessRes.data.sound_matching.matched_volume_db);
        }
        if (assessRes.data.sound_matching?.matched_frequency_hz) {
          setPitchFreq(assessRes.data.sound_matching.matched_frequency_hz);
        }
      }

      const rawLibrary = libRes.data;
      const matchedFreq = loadedAssessment?.sound_matching?.matched_frequency_hz || 6000;
      const narrowBandItem = {
        id: "t-narrow-band",
        name: `Clinical Narrow-Band Masker (${matchedFreq} Hz)`,
        category: "narrow_band",
        description: `Highly targeted bandpass-filtered noise centered around your matched tinnitus frequency.`,
        audio_url: "synth:narrow_band",
        image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150",
        isRecommended: true
      };

      if (loadedAssessment && loadedAssessment.sound_matching) {
        const matchedType = loadedAssessment.sound_matching.sound_type;
        const updatedLib = rawLibrary.map((item: any) => {
          const isMatch = item.category === matchedType || 
                          (item.category === 'rain' && matchedType === 'rain_sounds') || 
                          (item.category === 'ocean' && matchedType === 'ocean_waves') ||
                          (item.category === 'meditation' && matchedType === 'zen_meditation') ||
                          (item.category === 'meditation' && matchedType === 'meditation') ||
                          (item.category === 'white_noise' && matchedType === 'white_noise') ||
                          (item.category === 'pink_noise' && matchedType === 'pink_noise');
          return {
            ...item,
            isRecommended: isMatch
          };
        });
        const fullLib = [narrowBandItem, ...updatedLib];
        setLibrary(fullLib);
        setActiveItem(narrowBandItem); // Pre-select narrow-band as default
      } else {
        setLibrary(rawLibrary);
        if (rawLibrary.length > 0) {
          setActiveItem(rawLibrary[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSounds();
    return () => {
      stopSynthesizer();
      saveTherapySession();
    };
  }, []);

  // Save session duration to DB when pausing or changing sound
  const saveTherapySession = async () => {
    if (sessionSeconds > 0) {
      const minutes = Math.ceil(sessionSeconds / 60);
      try {
        await api.post('/api/therapy/session', { duration_minutes: minutes });
        setSessionSeconds(0); // Reset timer
      } catch (e) {
        console.error("Could not save session progress:", e);
      }
    }
  };

  // Timer tick when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        saveTherapySession();
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Adjust volume of live synthesizer
  useEffect(() => {
    if (isPlaying && gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.setValueAtTime(volume / 100 * 0.25, ctx.currentTime);
    }
  }, [volume, isPlaying]);

  // Live Sound Synthesizers using browser Web Audio API
  const startSynthesizer = (item: any) => {
    stopSynthesizer();

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume / 100 * 0.25, ctx.currentTime);
    gainNodeRef.current = gainNode;

    const audioUrl = item.audio_url;

    if (audioUrl === 'synth:narrow_band') {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitchFreq, ctx.currentTime);
      filter.Q.setValueAtTime(8.0, ctx.currentTime); // narrow band

      noiseNode.connect(filter);
      filter.connect(gainNode);
      sourceNodeRef.current = noiseNode;
      filterNodeRef.current = filter;
    }
    else if (audioUrl === 'synth:white') {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();
      sourceNodeRef.current = noiseNode;
      noiseNode.connect(gainNode);
    } 
    else if (audioUrl === 'synth:brown') {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain multiplier
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();
      sourceNodeRef.current = noiseNode;
      noiseNode.connect(gainNode);
    } 
    else if (audioUrl === 'synth:pink') {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();
      sourceNodeRef.current = noiseNode;
      noiseNode.connect(gainNode);
    }
    else if (audioUrl === 'synth:rain') {
      // Modulated pink noise to simulate falling rain
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = b0 + b1 + b2;
        output[i] *= 0.15;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();
      sourceNodeRef.current = noiseNode;
      noiseNode.connect(gainNode);
    }
    else if (audioUrl === 'synth:ocean') {
      // Deep brown noise modulated with a very low frequency LFO to create ocean surf swells
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.015 * white)) / 1.015;
        lastOut = output[i];
      }
      
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();

      // Create swell modulator
      const modulator = ctx.createOscillator();
      modulator.frequency.setValueAtTime(0.08, ctx.currentTime); // 12 second swell cycle
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.3, ctx.currentTime);
      
      modulator.connect(modGain);
      // Connect to gain parameter
      modGain.connect(gainNode.gain);
      modulator.start();

      sourceNodeRef.current = noiseNode;
      noiseNode.connect(gainNode);
    }
    else {
      // Default hum / meditation drone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime); // Deep hum
      osc.start();
      sourceNodeRef.current = osc;
      osc.connect(gainNode);
    }

    gainNode.connect(ctx.destination);
    setIsPlaying(true);
  };

  const stopSynthesizer = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (filterNodeRef.current) {
      filterNodeRef.current.disconnect();
      filterNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleStartSleepTimer = (mins: number) => {
    setTimerMinutes(mins);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (mins === 0) {
      setTimeRemaining(0);
      return;
    }

    const totalSeconds = mins * 60;
    setTimeRemaining(totalSeconds);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopSynthesizer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatSleepTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Update narrow-band filter frequency in real-time
  useEffect(() => {
    if (filterNodeRef.current && audioContextRef.current) {
      filterNodeRef.current.frequency.setTargetAtTime(pitchFreq, audioContextRef.current.currentTime, 0.05);
    }
  }, [pitchFreq]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handlePlayToggle = (item: any) => {
    if (activeItem?.id === item.id) {
      if (isPlaying) {
        stopSynthesizer();
      } else {
        startSynthesizer(item);
      }
    } else {
      saveTherapySession(); // Save previous item minutes
      setActiveItem(item);
      startSynthesizer(item);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    try {
      await api.post(`/api/therapy/favorite/${item.id}`);
      fetchSounds();
    } catch (err) {
      console.error(err);
    }
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(fav => fav.id === itemId);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Headphones className="w-10 h-10 animate-bounce" />
        </div>
        <div className="text-center max-w-lg space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">Sound Therapy Calibration Required</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            To start acoustic rehabilitation, we first need to calibrate the synthesizers. Please complete your initial 2-minute assessment so we can configure the matching frequencies and recommended volumes tailored to your ears.
          </p>
        </div>
        <Link to="/assessment" className="py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover-lift flex items-center gap-2 cursor-pointer">
          <PlusCircle className="w-5 h-5" /> Calibrate Audio Matcher Now
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans flex flex-col min-h-[calc(100vh-80px)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-850 dark:bg-emerald-950 dark:text-emerald-400 mb-2 uppercase tracking-wide">
            Acoustic Rehabilitation
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Personalized Sound Library</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Listen to customized, continuous noise bands synthesized directly in your browser. Listening progress is auto-recorded to your tracking logs.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805">
          <Headphones className="w-5 h-5 text-indigo-650" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Headphones Recommended</span>
        </div>
      </div>

      {/* Calibration & Sleep Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-805 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        
        {/* Left Column: Sleep Timer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-indigo-650" />
              Sleep Timer
            </h4>
            {timeRemaining > 0 && (
              <span className="font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 rounded text-[10px] font-bold animate-pulse">
                {formatSleepTime(timeRemaining)} remaining
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Set a timer to automatically fade out and stop the maskers when you are ready to sleep.</p>
          <div className="flex gap-2">
            {[0, 15, 30, 60].map(mins => (
              <button
                key={mins}
                onClick={() => handleStartSleepTimer(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timerMinutes === mins
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-655 dark:text-slate-405 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {mins === 0 ? 'Off' : `${mins} mins`}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Custom Frequency Calibration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-650" />
              Dynamic Calibration
            </h4>
            <span className="font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 rounded text-[10px] font-bold">
              {pitchFreq} Hz
            </span>
          </div>
          <p className="text-xs text-slate-400">Fine-tune the center frequency of your Clinical Narrow-Band Masker in real-time.</p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold">1k Hz</span>
            <input
              type="range"
              min="1000"
              max="12000"
              step="100"
              value={pitchFreq}
              onChange={(e) => setPitchFreq(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[10px] text-slate-400 font-bold">12k Hz</span>
          </div>
        </div>

      </div>

      {/* Grid of Sound Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse h-[220px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-start">
          {library.map((item) => (
            <div
              key={item.id}
              onClick={() => handlePlayToggle(item)}
              className={`group p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-sm relative cursor-pointer ${
                activeItem?.id === item.id && isPlaying
                  ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover-lift'
              }`}
            >
              {/* Star Favorite Button */}
              <button
                type="button"
                onClick={(e) => handleFavoriteToggle(e, item)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <Star
                  className={`w-5 h-5 ${
                    isFavorite(item.id)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-slate-350 hover:text-amber-550'
                  }`}
                />
              </button>

              {/* Sound Details */}
              <div className="flex gap-4 items-start mb-4">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150'}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                />
                <div className="overflow-hidden">
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-slate-100 text-slate-650 rounded-md dark:bg-slate-950 dark:text-slate-400">
                      {item.category.replace('_', ' ')}
                    </span>
                    {item.isRecommended && (
                      <span className="text-[9px] font-black uppercase py-0.5 px-2 bg-emerald-500 text-white rounded-md flex items-center gap-0.5 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" /> AI Recommended
                      </span>
                    )}
                  </div>
                  <h3 className="text-md font-bold text-slate-800 dark:text-slate-150 truncate mt-1">
                    {item.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Control Action Button */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Infinite Loop
                </span>
                <span className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  activeItem?.id === item.id && isPlaying
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-indigo-600 group-hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                }`}>
                  {activeItem?.id === item.id && isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Active Player Bar at Bottom */}
      {activeItem && (
        <div className="fixed bottom-4 left-6 right-6 md:left-[280px] bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300 z-30">
          {/* Active Item Detail */}
          <div className="flex items-center gap-3">
            <img
              src={activeItem.image_url}
              alt=""
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <h4 className="text-xs font-bold truncate max-w-[150px] sm:max-w-none">{activeItem.name}</h4>
              <p className="text-[10px] text-indigo-400 font-medium capitalize">{activeItem.category.replace('_', ' ')} Masker</p>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePlayToggle(activeItem)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5 fill-white" /> : <Play className="w-4.5 h-4.5 fill-white ml-0.5" />}
            </button>
            
            <div className="text-center font-mono text-xs font-bold text-slate-400">
              {formatTimer(sessionSeconds)}
            </div>
          </div>

          {/* Volume slider control */}
          <div className="flex items-center gap-2.5 w-full sm:w-[160px]">
            <Volume2 className="w-4.5 h-4.5 text-slate-450" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] font-bold font-mono w-6 text-right">{volume}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
