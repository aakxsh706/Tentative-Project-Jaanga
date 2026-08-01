import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Timer, 
  Waves, 
  Sliders, 
  Info, 
  ShieldAlert 
} from 'lucide-react';

export const SoundMasker: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState('brown'); // white, pink, brown, ocean, rain
  const [volume, setVolume] = useState(0.4);
  const [pitchMatchMode, setPitchMatchMode] = useState(false);
  const [pitchFreq, setPitchFreq] = useState(6000); // 1000 to 12000 Hz
  const [pitchVolume, setPitchVolume] = useState(0.15);
  const [timerMinutes, setTimerMinutes] = useState(0); // 0 = off, 15, 30, 60
  const [timeRemaining, setTimeRemaining] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const pitchOscRef = useRef<OscillatorNode | null>(null);
  const pitchGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const oceanIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Initialize Web Audio Context
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Generate White, Pink, or Brown Noise buffer
  const createNoiseBuffer = (ctx: AudioContext, type: string): AudioBuffer => {
    const bufferSize = 5 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        data[i] = white;
      } else if (type === 'pink') {
        // Paul Kellet's filter method for pink noise
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // scale down
        b6 = white * 0.115926;
      } else {
        // Brown / Red Noise (1/f^2) integration
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // scale output
      }
    }
    return buffer;
  };

  // Start sound synthesis
  const startSound = () => {
    const ctx = getAudioContext();
    stopSound(false); // clean up prior nodes

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (soundType === 'narrow') {
      const buffer = createNoiseBuffer(ctx, 'white');
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitchFreq, ctx.currentTime);
      filter.Q.setValueAtTime(10.0, ctx.currentTime); // high Q = narrow band

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      noiseNodeRef.current = noise;
      filterNodeRef.current = filter;

    } else if (soundType === 'ocean') {
      // Ocean synthesis using Pink Noise with lowpass filter sweep
      const buffer = createNoiseBuffer(ctx, 'pink');
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      noiseNodeRef.current = noise;

      // Sweep filter frequency to simulate waves
      let wavePhase = 0;
      oceanIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current) return;
        wavePhase += 0.05;
        const freq = 250 + Math.sin(wavePhase) * 450 + Math.cos(wavePhase * 0.5) * 100;
        filter.frequency.setTargetAtTime(Math.max(100, freq), audioCtxRef.current.currentTime, 0.1);
      }, 100);

    } else if (soundType === 'rain') {
      // Gentle rain using filtered Pink noise
      const buffer = createNoiseBuffer(ctx, 'pink');
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      noiseNodeRef.current = noise;

    } else {
      // White, Pink, or Brown noise
      const noiseType = soundType === 'white' ? 'white' : soundType === 'pink' ? 'pink' : 'brown';
      const buffer = createNoiseBuffer(ctx, noiseType);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      noise.connect(masterGain);
      noise.start();
      noiseNodeRef.current = noise;
    }

    // Pitch Matcher Oscillator if enabled
    if (pitchMatchMode) {
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitchFreq, ctx.currentTime);
      pGain.gain.setValueAtTime(pitchVolume, ctx.currentTime);

      osc.connect(pGain);
      pGain.connect(ctx.destination);
      osc.start();

      pitchOscRef.current = osc;
      pitchGainRef.current = pGain;
    }

    setIsPlaying(true);
  };

  // Stop sound synthesis
  const stopSound = (resetState = true) => {
    if (oceanIntervalRef.current) {
      clearInterval(oceanIntervalRef.current);
      oceanIntervalRef.current = null;
    }

    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); } catch (e) {}
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }

    if (filterNodeRef.current) {
      filterNodeRef.current.disconnect();
      filterNodeRef.current = null;
    }

    if (pitchOscRef.current) {
      try { pitchOscRef.current.stop(); } catch (e) {}
      pitchOscRef.current.disconnect();
      pitchOscRef.current = null;
    }

    if (resetState) {
      setIsPlaying(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setTimeRemaining(0);
    }
  };

  // Update master volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume]);

  // Update pitch frequency dynamically
  useEffect(() => {
    if (pitchOscRef.current && audioCtxRef.current) {
      pitchOscRef.current.frequency.setTargetAtTime(pitchFreq, audioCtxRef.current.currentTime, 0.05);
    }
    if (filterNodeRef.current && audioCtxRef.current) {
      filterNodeRef.current.frequency.setTargetAtTime(pitchFreq, audioCtxRef.current.currentTime, 0.05);
    }
  }, [pitchFreq]);

  // Handle timer
  const startTimer = (mins: number) => {
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
          stopSound(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSound(true);
    } else {
      startSound();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => stopSound(true);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans space-y-6">
      {/* Header card */}
      <div className="sound-masker-card bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-100 dark:border-teal-900">
              <Waves className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-sans">Ambient Tinnitus Sound Masker</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Soothing sound generators to reduce tinnitus noticeability</p>
            </div>
          </div>

          <button
            onClick={togglePlay}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer shrink-0 ${
              isPlaying 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" /> Stop Masking
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Play Masking Sound
              </>
            )}
          </button>
        </div>

        {/* Sound Type Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 my-5">
          {[
            { id: 'narrow', name: 'Narrow Band', desc: 'Targeted frequency band' },
            { id: 'brown', name: 'Brown Noise', desc: 'Deep warm rumble' },
            { id: 'pink', name: 'Pink Noise', desc: 'Soft gentle rain' },
            { id: 'white', name: 'White Noise', desc: 'Crisp static mask' },
            { id: 'ocean', name: 'Ocean Waves', desc: 'Rhythmic sea waves' },
            { id: 'rain', name: 'Gentle Rain', desc: 'Soothing rainfall' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSoundType(s.id);
                if (isPlaying) setTimeout(() => startSound(), 50);
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                soundType === s.id
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 dark:border-teal-550 text-teal-900 dark:text-teal-200'
                  : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="font-semibold text-xs">{s.name}</div>
              <div className="text-[10px] text-slate-550 dark:text-slate-400 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-750 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
              Ambient Volume
            </span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />

          {/* Sleep Timer Bar */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Timer className="w-4 h-4 text-teal-600" />
              <span>Sleep Timer:</span>
              {timeRemaining > 0 && (
                <span className="font-mono bg-teal-105 dark:bg-teal-900/60 text-teal-800 dark:text-teal-350 px-2 py-0.5 rounded text-[11px] font-bold">
                  {formatTime(timeRemaining)} remaining
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {[0, 15, 30, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => startTimer(mins)}
                  className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                    timerMinutes === mins
                      ? 'bg-teal-600 text-white font-medium shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {mins === 0 ? 'Off' : `${mins}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tinnitus Pitch Frequency Matcher Tool */}
        <div className="mt-5 border-t border-slate-200 dark:border-slate-805 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Tinnitus Pitch Frequency Tester</span>
              <span className="text-[10px] text-slate-400 font-normal">(Match your ringing frequency)</span>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={pitchMatchMode}
                onChange={(e) => {
                  setPitchMatchMode(e.target.checked);
                  if (isPlaying) setTimeout(() => startSound(), 50);
                }}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Enable Pitch Generator</span>
            </label>
          </div>

          {pitchMatchMode && (
            <div className="bg-teal-50/30 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-200/50 dark:border-teal-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                <span>Frequency Pitch:</span>
                <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-bold text-teal-700 dark:text-teal-350">
                  {pitchFreq.toLocaleString()} Hz
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="12000"
                step="50"
                value={pitchFreq}
                onChange={(e) => setPitchFreq(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-655" />
                Adjust the slider until the pitch matches your internal ringing. Keep pitch volume low for comfort.
              </p>
            </div>
          )}
        </div>

        {/* Warning Indicator */}
        <div className="mt-5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-205 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-350 flex items-start gap-2.5">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span>
            <strong>Safe Listening Advice</strong>: Sound masking should always be played at a volume slightly LOWER than your tinnitus. Never use high headphone volume for sound masking.
          </span>
        </div>
      </div>
    </div>
  );
};
export default SoundMasker;
