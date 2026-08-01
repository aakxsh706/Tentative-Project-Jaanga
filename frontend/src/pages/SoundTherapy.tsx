import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Star, Heart, Volume2, Clock, Music, Headphones, RefreshCw } from 'lucide-react';

export const SoundTherapy: React.FC = () => {
  const { api } = useAuth();
  const [library, setLibrary] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  
  // Timer tracking
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Audio Context refs for real-time synthesis
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const fetchSounds = async () => {
    try {
      const libRes = await api.get('/api/therapy/library');
      setLibrary(libRes.data);
      const favRes = await api.get('/api/therapy/favorites');
      setFavorites(favRes.data);
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

    if (audioUrl === 'synth:white') {
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
    setIsPlaying(false);
  };

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
                  <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-slate-100 text-slate-600 rounded-md dark:bg-slate-950 dark:text-slate-400">
                    {item.category.replace('_', ' ')}
                  </span>
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
