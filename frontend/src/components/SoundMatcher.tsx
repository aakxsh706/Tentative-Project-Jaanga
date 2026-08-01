import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Music, Check, Star } from 'lucide-react';

interface SoundMatcherProps {
  frequency: number;
  setFrequency: (freq: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  soundType: string;
  setSoundType: (type: string) => void;
  similarity: number;
  setSimilarity: (sim: number) => void;
}

export const SoundMatcher: React.FC<SoundMatcherProps> = ({
  frequency,
  setFrequency,
  volume,
  setVolume,
  soundType,
  setSoundType,
  similarity,
  setSimilarity
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio Context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const modulatorNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize Audio Context on Play
  const startAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop existing nodes
    stopAudioNodes();

    // Create Gain Node for volume control
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume / 100 * 0.15, ctx.currentTime); // Limit max volume to protect ears
    gainNodeRef.current = gainNode;

    // Create Analyser Node for canvas waveform visualization
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNodeRef.current = analyserNode;

    // Generate Audio Source depending on soundType
    if (soundType === 'pure_tone') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.start();
      sourceNodeRef.current = osc;
      osc.connect(gainNode);
    } else if (soundType === 'buzzing') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency / 2, ctx.currentTime); // slightly lower octave buzzer
      
      const mod = ctx.createOscillator();
      mod.type = 'sine';
      mod.frequency.setValueAtTime(35, ctx.currentTime); // low hum modulation
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(frequency / 4, ctx.currentTime);
      
      mod.connect(modGain);
      modGain.connect(osc.frequency);
      
      osc.start();
      mod.start();
      sourceNodeRef.current = osc;
      modulatorNodeRef.current = mod;
      osc.connect(gainNode);
    } else if (soundType === 'white_noise') {
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
    } else if (soundType === 'pink_noise') {
      // Pink noise filter algorithm
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
        output[i] *= 0.11; // estimate volume adjustment
        b6 = white * 0.115926;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();
      sourceNodeRef.current = noiseNode;
      noiseNode.connect(gainNode);
    } else if (soundType === 'clicking') {
      // Create crickets / clicking pulses
      const bufferSize = 0.15 * ctx.sampleRate;
      const pulseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = pulseBuffer.getChannelData(0);
      // High frequency click pulses
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.sin(2 * Math.PI * 4500 * (i / ctx.sampleRate)) * Math.exp(-i / 800);
      }
      const clickNode = ctx.createBufferSource();
      clickNode.buffer = pulseBuffer;
      clickNode.loop = true;
      
      // Delay to make it sound like a rhythmic click
      clickNode.start();
      sourceNodeRef.current = clickNode;
      clickNode.connect(gainNode);
    }

    gainNode.connect(analyserNode);
    analyserNode.connect(ctx.destination);
    setIsPlaying(true);
    drawWaveform();
  };

  const stopAudioNodes = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (modulatorNodeRef.current) {
      try {
        (modulatorNodeRef.current as any).stop();
      } catch (e) {}
      modulatorNodeRef.current = null;
    }
  };

  const stopAudio = () => {
    stopAudioNodes();
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    drawFlatWaveform();
  };

  useEffect(() => {
    // Stop audio on unmount
    return () => {
      stopAudioNodes();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update live controls when frequency changes
  useEffect(() => {
    if (isPlaying && audioContextRef.current && sourceNodeRef.current) {
      const ctx = audioContextRef.current;
      if (soundType === 'pure_tone' && 'frequency' in sourceNodeRef.current) {
        (sourceNodeRef.current.frequency as AudioParam).setValueAtTime(frequency, ctx.currentTime);
      } else if (soundType === 'buzzing' && 'frequency' in sourceNodeRef.current) {
        (sourceNodeRef.current.frequency as AudioParam).setValueAtTime(frequency / 2, ctx.currentTime);
      }
    }
  }, [frequency, isPlaying, soundType]);

  // Update live controls when volume changes
  useEffect(() => {
    if (isPlaying && gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.setValueAtTime(volume / 100 * 0.15, ctx.currentTime);
    }
  }, [volume, isPlaying]);

  // Restart audio when soundType changes
  useEffect(() => {
    if (isPlaying) {
      startAudio();
    }
  }, [soundType]);

  // Waveform visualization
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserNodeRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#0f172a'; // dark slate
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#10b981'; // emerald-500
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    render();
  };

  const drawFlatWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  useEffect(() => {
    drawFlatWaveform();
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
      {/* Sound configuration */}
      <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Step 2: Acoustic Pitch & Level Matching</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Compare the synthesized tone below to your perceived tinnitus. Adjust the sliders until they resemble your symptoms as closely as possible.
          </p>

          {/* Sound Type Selection */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-2">
              Sound Masking Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pure_tone', label: 'Pure Tone' },
                { id: 'buzzing', label: 'Hum / Buzz' },
                { id: 'white_noise', label: 'White Noise' },
                { id: 'pink_noise', label: 'Pink Noise' },
                { id: 'clicking', label: 'Cricket Click' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSoundType(item.id)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                    soundType === item.id
                      ? 'bg-emerald-600 text-white border-emerald-650 shadow-md'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Slider (only for oscillators) */}
          {(soundType === 'pure_tone' || soundType === 'buzzing') && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Pitch Frequency
                </span>
                <span className="text-sm font-bold text-indigo-650 dark:text-indigo-400">
                  {frequency} Hz
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="12000"
                step="50"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                <span>Low (200 Hz)</span>
                <span>Mid (4000 Hz)</span>
                <span>High Ringing (12000 Hz)</span>
              </div>
            </div>
          )}

          {/* Volume Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Sound Volume level
              </span>
              <span className="text-sm font-bold text-emerald-650 dark:text-emerald-400 flex items-center gap-1">
                <Volume2 className="w-4 h-4" />
                {volume}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>Whisper</span>
              <span>Moderate</span>
              <span>Loud (Max safe limit)</span>
            </div>
          </div>
        </div>

        {/* Play/Pause control */}
        <div className="flex items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={togglePlayback}
            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-bold shadow-md transition-all ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                Stop Matching Audio
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Synthesize Matcher Audio
              </>
            )}
          </button>
        </div>
      </div>

      {/* Waveform Output & Similarity */}
      <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Real-Time Oscilloscope Waveform
          </h4>
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 h-[150px] bg-slate-950">
            <canvas
              ref={canvasRef}
              width="400"
              height="150"
              className="w-full h-full block"
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[1px]">
                <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                  <Music className="w-4 h-4" /> Synthesizer Idle
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Similarity Score */}
        <div className="mt-6">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-2">
            How closely does this sound match your tinnitus?
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSimilarity(star)}
                className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                  similarity >= star
                    ? 'bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20'
                    : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-850 dark:text-slate-650 dark:border-slate-800'
                }`}
              >
                {star}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
            <span>Rough representation (1)</span>
            <span>Identical Match (10)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
