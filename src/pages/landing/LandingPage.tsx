import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  GraduationCap,
  Brain,
  BookOpen,
  Activity,
  Pill,
  Users,
  Flame,
  Award,
  Clock,
  Zap,
  ChevronRight,
  Star,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Sparkles,
  Shield,
  Menu,
  X,
  Quote,
} from 'lucide-react';

/* ─────────────── intersection-observer hook ─────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────── FadeIn wrapper ─────────────── */
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string; direction?: 'up' | 'left' | 'right' }> = ({
  children, delay = 0, className = '', direction = 'up'
}) => {
  const { ref, visible } = useInView();
  const hidden =
    direction === 'left' ? 'opacity-0 -translate-x-8'
    : direction === 'right' ? 'opacity-0 translate-x-8'
    : 'opacity-0 translate-y-8';
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${visible ? 'opacity-100 translate-x-0 translate-y-0' : hidden}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ─────────────── data ─────────────── */
const features = [
  {
    icon: GraduationCap,
    title: 'Academic GPA Tracker',
    desc: 'Track your GPA and CGPA across every semester with beautiful progress charts. Set targets and hit them consistently.',
    accent: 'bg-teal-50 border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    tag: 'bg-teal-100 text-teal-700',
    tagLabel: 'Academic',
  },
  {
    icon: Brain,
    title: 'AI Nursing Tutor',
    desc: 'Instant, evidence-based answers for any nursing question. Pharmacology, pathophysiology, care plans — 24/7.',
    accent: 'bg-violet-50 border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    tag: 'bg-violet-100 text-violet-700',
    tagLabel: 'AI-Powered',
  },
  {
    icon: BookOpen,
    title: 'Flashcards & Quizzes',
    desc: 'Nursing-specific decks and adaptive quizzes with spaced-repetition built right in for maximum retention.',
    accent: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tag: 'bg-blue-100 text-blue-700',
    tagLabel: 'Study Tools',
  },
  {
    icon: Stethoscope,
    title: 'Clinical Tools Suite',
    desc: 'Dosage, IV Flow Rate, BMI, Glasgow Coma Scale, APGAR and unit converters — all clinical-grade accurate.',
    accent: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    tag: 'bg-emerald-100 text-emerald-700',
    tagLabel: 'Clinical',
  },
  {
    icon: Users,
    title: 'Nursing Community',
    desc: 'Connect with peers across institutions. Share notes, join study groups, thrive through clinical rotations together.',
    accent: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    tag: 'bg-amber-100 text-amber-700',
    tagLabel: 'Community',
  },
  {
    icon: Clock,
    title: 'Study Session Tracker',
    desc: 'Live timer that pauses when you switch tabs. Build daily streaks and accumulate study hours automatically.',
    accent: 'bg-rose-50 border-rose-200',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    tag: 'bg-rose-100 text-rose-700',
    tagLabel: 'Productivity',
  },
];

const clinicalTools = [
  { icon: Pill, label: 'Dosage Calculator', sub: 'Safe medication dosing' },
  { icon: Activity, label: 'IV Flow Rate', sub: 'Drip rate precision' },
  { icon: Brain, label: 'Glasgow Coma Scale', sub: 'Neuro assessment' },
  { icon: Sparkles, label: 'APGAR Score', sub: 'Neonatal evaluation' },
  { icon: Calculator, label: 'BMI Calculator', sub: 'Patient assessment' },
  { icon: Shield, label: 'Unit Converter', sub: 'Clinical conversions' },
];

const stats = [
  { value: '10,000+', label: 'Nursing Students', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  { value: '3,500+', label: 'Flashcards', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: '500+', label: 'Practice Quizzes', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50' },
  { value: '6', label: 'Clinical Tools', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const testimonials = [
  {
    name: 'Adaeze Okonkwo',
    school: 'University of Lagos — 400L Nursing',
    quote: 'NursaFlow transformed how I study. The AI Tutor answered my pharmacology questions at 2 AM before my exam — and I passed with distinction!',
    rating: 5,
    avatar: 'AO',
    avatarBg: 'bg-teal-500',
  },
  {
    name: 'James Mensah',
    school: 'KNUST — 300L Nursing',
    quote: 'The dosage calculator alone has saved me countless times in clinical. Plus tracking my CGPA visually keeps me motivated every day.',
    rating: 5,
    avatar: 'JM',
    avatarBg: 'bg-violet-500',
  },
  {
    name: 'Fatima Al-Hassan',
    school: 'Ahmadu Bello University — 200L Nursing',
    quote: "I love the study streak feature. It keeps me accountable. I've maintained a 47-day streak and my GPA has gone from 3.1 to 3.8!",
    rating: 5,
    avatar: 'FA',
    avatarBg: 'bg-amber-500',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    desc: 'Perfect for getting started',
    features: [
      'Dashboard & GPA Tracker',
      '50 Flashcards per month',
      '10 Quiz attempts per month',
      'Basic clinical calculators',
      'Community read access',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₦2,500',
    period: 'per month',
    desc: 'For serious nursing students',
    features: [
      'Everything in Free',
      'Unlimited Flashcards & Quizzes',
      'AI Tutor — unlimited chats',
      'All 6 clinical tools',
      'Study plans & notes',
      'Community full access',
      'Priority support',
    ],
    cta: 'Start 7-Day Free Trial',
    highlighted: true,
  },
];

/* ─────────────── MAIN COMPONENT ─────────────── */
export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans">

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-200">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Nursa<span className="text-teal-600">Flow</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Clinical Tools', href: '#clinical-tools' },
              { label: 'Community', href: '#community' },
              { label: 'Pricing', href: '#pricing' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <NavLink to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all shadow-md shadow-teal-200 hover:shadow-teal-300 hover:-translate-y-0.5 flex items-center gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors px-3 py-2">
                  Sign In
                </NavLink>
                <NavLink to="/login"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all shadow-md shadow-teal-200 hover:shadow-teal-300 hover:-translate-y-0.5">
                  Get Started Free
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pb-5 space-y-1 shadow-lg">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Clinical Tools', href: '#clinical-tools' },
              { label: 'Community', href: '#community' },
              { label: 'Pricing', href: '#pricing' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="block py-2.5 text-sm font-medium text-slate-700 hover:text-teal-600"
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {isAuthenticated ? (
                <NavLink to="/dashboard" className="block text-center py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold">
                  Go to Dashboard
                </NavLink>
              ) : (
                <>
                  <NavLink to="/login" className="block text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                    Sign In
                  </NavLink>
                  <NavLink to="/login" className="block text-center py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold">
                    Get Started Free
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-0 overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-white">
        {/* Subtle background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="py-12 lg:py-20">
              <FadeIn direction="up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-sm font-semibold mb-7">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  Built for Nursing Students
                </div>
                <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.06] mb-6 text-slate-900">
                  Your{' '}
                  <span className="relative">
                    <span className="text-teal-600">Clinical Edge</span>
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 260 10" fill="none" preserveAspectRatio="none">
                      <path d="M2 7 Q65 1 130 7 Q195 13 258 7" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
                    </svg>
                  </span>
                  {' '}Starts Here
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed mb-9 max-w-lg">
                  NursaFlow is the all-in-one academic companion for nursing students — track your GPA,
                  study smarter with AI, master clinical calculations, and connect with a thriving community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <NavLink to="/login" id="hero-cta-primary"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:-translate-y-1 transition-all">
                    Start For Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </NavLink>
                  <a href="#features" id="hero-cta-secondary"
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold text-base hover:border-teal-300 hover:text-teal-600 transition-all">
                    Explore Features
                  </a>
                </div>
                {/* Trust row */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['bg-teal-500', 'bg-violet-500', 'bg-amber-500', 'bg-blue-500'].map((c, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-[10px] text-white font-bold`}>
                        {['AO', 'JM', 'FA', 'KO'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Loved by 10,000+ nursing students</p>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right: Hero Image */}
            <FadeIn direction="right" delay={150} className="relative lg:pt-12">
              <div className="relative">
                {/* Decorative card floating top-left */}
                <div className="absolute -top-6 -left-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">18-Day Streak 🔥</div>
                    <div className="text-[11px] text-slate-400">Keep it up!</div>
                  </div>
                </div>

                {/* Main image */}
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/80 border border-slate-100">
                  <img
                    src="/nursing_hero.png"
                    alt="Nursing student studying with NursaFlow"
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Floating stat card bottom-right */}
                <div className="absolute -bottom-5 -right-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">CGPA: 3.91 ↑</div>
                    <div className="text-[11px] text-slate-400">Target: 4.00</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── STATS BANNER ─── */}
      <section className="py-16 border-y border-slate-100 bg-slate-50/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={s.label} delay={i * 80} className="text-center">
                  <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{s.label}</div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-5">
              Everything You Need
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
              Designed for the{' '}
              <span className="text-teal-600">Modern Nursing Student</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Six powerful modules working together to accelerate your journey from first year to final clinical rotation.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <FadeIn key={feat.title} delay={i * 70} className="h-full">
                  <div className={`h-full p-6 rounded-2xl border ${feat.accent} hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${feat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${feat.tag}`}>{feat.tagLabel}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CLINICAL TOOLS ─── */}
      <section id="clinical-tools" className="py-28 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image side */}
            <FadeIn direction="left" className="order-2 lg:order-1">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100">
                  <img
                    src="/nursing_clinical_tools.png"
                    alt="Nursing clinical tools including stethoscope and medical equipment"
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* floating badge */}
                <div className="absolute -bottom-5 left-8 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Clinical-Grade Accuracy</div>
                    <div className="text-xs text-slate-400">Evidence-based formulas</div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Text side */}
            <FadeIn direction="right" delay={100} className="order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-5">
                Clinical Tools Suite
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5">
                Professional Calculators{' '}
                <span className="text-emerald-600">In Your Pocket</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                From precise medication dosage calculations to neonatal APGAR scoring —
                our clinical suite covers everything every nursing student needs, built to clinical-grade accuracy.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {clinicalTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div key={tool.label} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group cursor-pointer shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Icon className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">{tool.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{tool.sub}</div>
                    </div>
                  );
                })}
              </div>
              <NavLink to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-200 hover:-translate-y-0.5">
                Try Clinical Tools
                <ChevronRight className="w-4 h-4" />
              </NavLink>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── AI TUTOR ─── */}
      <section id="ai-tutor" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <FadeIn direction="left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold mb-5">
                AI-Powered Learning
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5">
                Your Personal{' '}
                <span className="text-violet-600">Nursing AI Tutor</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Ask anything — from complex pharmacodynamics to NCLEX-style clinical reasoning.
                Get clear, evidence-based explanations instantly, any time of day or night.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Evidence-based, referenced answers',
                  'NCLEX-style reasoning explanations',
                  'Care plan generation assistance',
                  'Pharmacology drug interaction checks',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <NavLink to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-md shadow-violet-200 hover:-translate-y-0.5">
                Try AI Tutor
                <ChevronRight className="w-4 h-4" />
              </NavLink>
            </FadeIn>

            {/* Mock chat UI */}
            <FadeIn direction="right" delay={100}>
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-100/80 bg-white">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-violet-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">NursaFlow AI Tutor</div>
                    <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Online — ready to help
                    </div>
                  </div>
                </div>
                {/* Messages */}
                <div className="p-5 space-y-4 min-h-[300px] bg-slate-50/50">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-sm bg-violet-600 text-sm text-white shadow-sm">
                      What are the 5 rights of medication administration?
                    </div>
                  </div>
                  {/* AI response */}
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-slate-200 text-sm text-slate-700 shadow-sm space-y-2">
                      <p className="font-medium text-slate-800">The <strong>5 Rights of Medication Administration</strong>:</p>
                      <ol className="list-none space-y-1.5 text-xs">
                        {[
                          ['Right Patient', 'Verify with 2 identifiers'],
                          ['Right Drug', 'Check the medication order'],
                          ['Right Dose', 'Calculate carefully'],
                          ['Right Route', 'IV, PO, IM, SQ, etc.'],
                          ['Right Time', 'Follow the schedule'],
                        ].map(([right, desc], idx) => (
                          <li key={right} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                            <span><strong className="text-teal-700">{right}</strong> — {desc}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
                {/* Input */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-white">
                  <div className="flex gap-2 items-center px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-400">
                    <span className="flex-1">Ask your nursing question...</span>
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center cursor-pointer">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY / TESTIMONIALS ─── */}
      <section id="community" className="py-28 bg-teal-50/50 border-y border-teal-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Image */}
            <FadeIn direction="left" className="order-2 lg:order-1">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100">
                  <img
                    src="/nursing_community.png"
                    alt="Nursing students studying together in a community setting"
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* Floating stats */}
                <div className="absolute -top-5 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">10,000+ Students</div>
                    <div className="text-[11px] text-slate-400">Across Africa</div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Text side */}
            <FadeIn direction="right" delay={100} className="order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-5">
                Nursing Community
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5">
                Study Better,{' '}
                <span className="text-amber-500">Together</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                Join thousands of nursing students across Africa who support, inspire, and learn alongside each other.
                Share notes, join study groups, and navigate clinical rotations as a community.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Users, label: 'Study Groups', val: '200+' },
                  { icon: BookOpen, label: 'Notes Shared', val: '5,000+' },
                  { icon: Flame, label: 'Active Streaks', val: '1,200+' },
                  { icon: Award, label: 'CGPA 3.5+', val: '68% of users' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <Icon className="w-5 h-5 text-teal-500 mb-2" />
                      <div className="text-lg font-black text-slate-900">{item.val}</div>
                      <div className="text-xs text-slate-500">{item.label}</div>
                    </div>
                  );
                })}
              </div>
              <NavLink to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md shadow-amber-200 hover:-translate-y-0.5">
                Join the Community
                <ChevronRight className="w-4 h-4" />
              </NavLink>
            </FadeIn>
          </div>

          {/* Testimonials */}
          <FadeIn className="text-center mb-10">
            <h3 className="text-3xl font-black text-slate-900 mb-2">Real Students. Real Results.</h3>
            <p className="text-slate-500">Hear from students who've transformed their academic journey.</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 90}>
                <div className="h-full p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <Quote className="w-8 h-8 text-teal-200 mb-3" />
                  <div className="flex gap-1 mb-3">
                    {[...Array(t.rating)].map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.school}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-5">
              Simple Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
              Start Free.{' '}
              <span className="text-teal-600">Upgrade Anytime.</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">
              No credit card required. Upgrade to Pro when you're ready to unlock everything.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 100}>
                <div className={`relative h-full p-8 rounded-2xl border transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-teal-600 to-teal-700 border-teal-500 shadow-xl shadow-teal-200/60 text-white'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-amber-400 text-amber-900 text-xs font-black shadow-md">
                        ⭐ Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                    <p className={`text-sm mb-4 ${plan.highlighted ? 'text-teal-100' : 'text-slate-400'}`}>{plan.desc}</p>
                    <div className="flex items-end gap-2">
                      <span className={`text-4xl font-black ${plan.highlighted ? 'text-white' : 'text-teal-600'}`}>{plan.price}</span>
                      <span className={`text-sm pb-1 ${plan.highlighted ? 'text-teal-100' : 'text-slate-400'}`}>/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlighted ? 'text-teal-50' : 'text-slate-600'}`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-teal-200' : 'text-teal-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <NavLink to="/login"
                    className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${
                      plan.highlighted
                        ? 'bg-white text-teal-700 hover:bg-teal-50 shadow-md'
                        : 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50'
                    }`}>
                    {plan.cta}
                  </NavLink>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 relative overflow-hidden">
        {/* background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        <FadeIn className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-400/40 bg-white/10 text-teal-50 text-sm font-semibold mb-6">
            <Flame className="w-4 h-4 text-amber-300" />
            Join 10,000+ Nursing Students
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-5">
            Ready to Elevate Your Nursing Journey?
          </h2>
          <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto">
            Start tracking your GPA, studying smarter, and mastering clinical skills today — completely free.
          </p>
          <NavLink to="/login" id="final-cta-btn"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-teal-700 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group">
            Get Started for Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </NavLink>
          <p className="mt-5 text-xs text-teal-200">No credit card required · Set up in 60 seconds</p>
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">
                Nursa<span className="text-teal-600">Flow</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
                <a key={l} href="#" className="hover:text-teal-600 transition-colors">{l}</a>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} NursaFlow · Built for nursing excellence.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
