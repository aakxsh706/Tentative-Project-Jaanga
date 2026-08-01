import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ChevronDown, CheckCircle2, ShieldAlert, Award, Star, Activity, Ear } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: '45,000+', label: 'Assessments Conducted' },
    { value: '84%', label: 'Reporting Reduced Burden' },
    { value: '180+', label: 'Registered Audiologists' },
    { value: '4.8/5', label: 'Patient Satisfaction Rating' }
  ];

  const features = [
    {
      icon: Ear,
      title: 'Interactive Acoustic Mapping',
      desc: 'Pinpoint precise auditory frequencies and locations using browser-based Web Audio oscillators and interactive ear models.'
    },
    {
      icon: Activity,
      title: 'AI Clinical Decisions',
      desc: 'Empower clinicians with automated diagnostics support summaries, risk profiles, and patient explanation templates powered by Gemini.'
    },
    {
      icon: Award,
      title: 'Adaptive Sound Masking',
      desc: 'Receive dynamic, personalized white, pink, and brown noise spectrum mixtures tailored to your unique matching assessment.'
    }
  ];

  const faqs = [
    {
      q: "What is TinniCare AI?",
      a: "TinniCare AI is an intelligent clinical decision support and self-management platform that combines high-precision acoustic matching, daily monitoring calendars, and advanced AI language analysis (Gemini Pro) to generate custom sound rehabilitation plans and clinical notes."
    },
    {
      q: "Can this app diagnose hearing conditions?",
      a: "No. Under medical compliance rules, TinniCare AI does not diagnose hearing loss or clinical conditions. It acts as an educational and monitoring dashboard that aggregates patient logs and matching variables to help audiologists make faster, data-driven treatment plans."
    },
    {
      q: "How does the sound matching work?",
      a: "The wizard synthesizes specific sound waves directly in your web browser. By adjusting volume and frequency sliders in real time, you match the synthesizer's output with your symptoms, creating an acoustic profile."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Landing Navbar */}
      <header className="px-6 md:px-12 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none">
            <HeartPulse className="w-5 h-5" />
          </span>
          <span className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
            TinniCare <span className="text-indigo-600 font-medium">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-650 dark:text-slate-350 dark:hover:text-indigo-400">
            Sign In
          </Link>
          <Link to="/register" className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-150 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-20 flex flex-col items-center text-center max-w-5xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-xs font-bold mb-6">
          <Award className="w-3.5 h-3.5" /> Next-Gen Tinnitus Management Platform
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          Personalized Tinnitus Relief,<br />Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">Clinical AI</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-350 max-w-2xl leading-relaxed mb-10">
          Empowering patients with precision acoustic matching, daily monitoring, and custom sound therapy, while giving audiologists automated summaries and charts.
        </p>
        <div className="flex gap-4">
          <Link to="/register" className="py-4 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white font-bold shadow-lg shadow-indigo-150 dark:shadow-none hover-lift">
            Register as Patient
          </Link>
          <Link to="/login" className="py-4 px-8 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-850 hover-lift">
            Clinician Portal
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white dark:bg-slate-900 py-16 border-y border-slate-100 dark:border-slate-800">
        <div className="px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <h3 className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">
                {stat.value}
              </h3>
              <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Advanced Clinical Rehabilitation Features
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A comprehensive clinical workflow connecting patients and healthcare professionals in real time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover-lift shadow-sm">
                <span className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 inline-block mb-6">
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 dark:bg-slate-950/60 py-20 border-t border-slate-100 dark:border-slate-900">
        <div className="px-6 md:px-12 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center mb-16">
            Trusted by Patients & Audiologists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
              <div className="flex gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-sm text-slate-650 dark:text-slate-350 italic leading-relaxed mb-6">
                "The interactive pitch matcher is incredibly accurate. I was able to show my doctor exactly what I hear, and the Brown noise generator has significantly improved my sleep quality."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  JD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">John Davis</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Patient (Bilateral Tinnitus)</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
              <div className="flex gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-sm text-slate-655 dark:text-slate-350 italic leading-relaxed mb-6">
                "TinniCare AI has saved my clinic hours in documentation. The automated summaries from the questionnaire and compliance charts help me fine-tune sound plans instantly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-emerald-600 text-sm">
                  SC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Dr. Sarah Carter</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Lead Audiologist, Hearing Care Center</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex justify-between items-center text-left font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 focus:outline-none transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm text-slate-655 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Medical Disclaimer Banner */}
      <section className="bg-amber-500/10 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 py-4 px-6 border-t border-b border-amber-500/20 max-w-6xl mx-auto rounded-2xl my-8">
        <div className="flex gap-3 items-center">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-550" />
          <p className="text-xs leading-normal">
            <strong>Important Medical Disclaimer:</strong> TinniCare AI is designed to support, not replace, clinical diagnosis. The platform helps compile matching frequencies and questionnaire insights for audiologists. If you experience sudden hearing loss or severe vertigo, please consult an emergency physician immediately.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-auto text-center border-t border-slate-805">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-650 text-white">
              <HeartPulse className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-sm text-white tracking-tight">
              TinniCare AI
            </span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TinniCare AI Platform. Developed for National AI Healthcare Hackathon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
