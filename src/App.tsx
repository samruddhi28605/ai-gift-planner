import React, { useState, useEffect } from 'react';
import {
  Gift,
  Sparkles,
  Heart,
  IndianRupee,
  User,
  Calendar,
  Compass,
  RefreshCw,
  Check,
  Copy,
  Bookmark,
  BookmarkCheck,
  Share2,
  Trash2,
  Sliders,
  ChevronRight,
  Zap,
  Lightbulb,
  ShoppingBag,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface SavedPlan {
  id: string;
  date: string;
  age: string;
  relationship: string;
  budget: string;
  interests: string;
  occasion: string;
  style: string;
  result: string;
}

export default function App() {
  const [age, setAge] = useState<string>('28');
  const [relationship, setRelationship] = useState<string>('Partner');
  const [budget, setBudget] = useState<string>('2000');
  const [interests, setInterests] = useState<string>('Coffee, Photography, Board Games, Traveling');
  const [occasion, setOccasion] = useState<string>('Birthday');
  const [style, setStyle] = useState<string>('Thoughtful & Practical');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'planner' | 'history'>('planner');

  // Load saved plans from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_gift_plans');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved plans', e);
    }
  }, []);

  const relationshipOptions = [
    'Partner', 'Spouse', 'Parent', 'Friend', 'Sibling',
    'Child / Teen', 'Colleague', 'Boss', 'Self', 'Other'
  ];

  const occasionOptions = [
    'Birthday', 'Anniversary', 'Holidays / Christmas',
    'Graduation', 'Housewarming', 'Valentine\'s Day', 'Mother\'s / Father\'s Day', 'Just Because'
  ];

  const styleOptions = [
    'Thoughtful & Practical', 'Luxury & Premium', 'Tech & Gadgets',
    'Sentimental & Custom', 'Experiences & Fun', 'Eco-Friendly & Artisanal'
  ];

  const budgetPresets = ['500', '1000', '2500', '5000', '10000'];

  const quickInterestTags = [
    'Coffee & Tea', 'Books & Reading', 'Gaming', 'Cooking & Foodie',
    'Fitness & Outdoors', 'Art & Crafting', 'Music', 'Travel', 'Gardening', 'Fashion'
  ];

  const addTagToInterests = (tag: string) => {
    if (!interests) {
      setInterests(tag);
      return;
    }
    if (interests.includes(tag)) return;
    setInterests(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!age || !relationship || !budget || !interests) {
      setError('Please fill in all required fields (Age, Relationship, Budget, and Interests).');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/gift-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, relationship, budget, interests, occasion, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate gift recommendations');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePlan = () => {
    if (!result) return;
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      age,
      relationship,
      budget,
      interests,
      occasion,
      style,
      result
    };

    const updated = [newPlan, ...savedPlans];
    setSavedPlans(updated);
    setIsSaved(true);
    try {
      localStorage.setItem('ai_gift_plans', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    try {
      localStorage.setItem('ai_gift_plans', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const loadSavedPlan = (plan: SavedPlan) => {
    setAge(plan.age);
    setRelationship(plan.relationship);
    setBudget(plan.budget);
    setInterests(plan.interests);
    setOccasion(plan.occasion);
    setStyle(plan.style);
    setResult(plan.result);
    setIsSaved(true);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to render formatted text with simple Markdown parsing
  const renderFormattedResult = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-4 text-slate-800 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ') || line.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {line.replace(/^#+\s*/, '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-2xl font-black text-slate-900 mt-6 mb-3">
                {line.replace(/^#\s*/, '')}
              </h2>
            );
          }
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.replace(/^\s*[-*]\s*/, '');
            // bold matching
            const parts = content.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-2 my-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
                <p className="text-slate-700">
                  {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </p>
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }

          // Regular paragraph with bold support
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="text-slate-700">
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div id="root-container" className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header Navigation */}
      <header id="header-nav" className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2">
                AI Gift Planner
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full border border-indigo-200/60 font-medium">
                  AI Recommendations
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'planner'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Planner
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved Plans
              {savedPlans.length > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-1.5 py-0.2 rounded-full font-bold">
                  {savedPlans.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {activeTab === 'planner' ? (
          <div className="space-y-10">
            {/* Hero Banner Section */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Instant AI Gift Curation
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Find the Perfect Gift for Anyone
              </h1>
              <p className="text-slate-600 text-base sm:text-lg">
                Enter recipient details below and let the AI gift planner recommend tailored, thoughtful gift ideas with budget accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    Recipient Profile
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">* Required</span>
                </div>

                <form onSubmit={handleGenerate} className="space-y-5">
                  {/* Age Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Age / Age Group *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 28 or Toddler / Teenager"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Relationship *
                    </label>
                    <div className="relative">
                      <Heart className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                        required
                      >
                        {relationshipOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Budget Input & Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Budget (INR ₹) *
                      </label>
                      <span className="text-xs text-slate-500 font-medium">Quick select:</span>
                    </div>

                    <div className="relative mb-2">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 2000"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        min="1"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {budgetPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudget(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            budget === preset
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interests & Hobbies */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Interests & Hobbies *
                    </label>
                    <textarea
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="e.g. Photography, Hiking, Espresso, Sci-Fi movies"
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                      required
                    />

                    {/* Quick interest tags */}
                    <div className="mt-2.5">
                      <p className="text-xs text-slate-400 mb-1.5">Tap to append interest:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickInterestTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTagToInterests(tag)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-xs font-medium transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Occasion
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        {occasionOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Gift Vibe / Style */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Gift Style / Vibe
                    </label>
                    <div className="relative">
                      <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        {styleOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Error banner */}
                  {error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Gift Ideas...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Gift Recommendations
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Results Column */}
              <div className="lg:col-span-7 space-y-6">
                {loading && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6 text-center animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900">Curating Gift Ideas...</h3>
                      <p className="text-slate-500 text-xs">
                        The AI gift planner is searching for gifts matching age {age}, {relationship}, and budget ₹{budget}.
                      </p>
                    </div>
                    <div className="space-y-3 text-left pt-4 border-t border-slate-100">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-5/6" />
                      <div className="h-4 bg-slate-200 rounded w-2/3 mt-6" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </div>
                  </div>
                )}

                {!loading && !result && (
                  <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200/90 shadow-xl shadow-slate-200/50 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">Your Recommendations Will Appear Here</h3>
                      <p className="text-slate-500 text-sm">
                        Fill out the recipient details on the left and click "Generate Gift Recommendations" to see tailored suggestions.
                      </p>
                    </div>

                    <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Smart Budget Match
                        </div>
                        <p className="text-[11px] text-slate-500">Accurate price estimates designed for your budget range.</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          Personalized Touch
                        </div>
                        <p className="text-[11px] text-slate-500">Tailored specifically to their unique hobbies and style.</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                          Creative Ideas
                        </div>
                        <p className="text-[11px] text-slate-500">Includes experience and personalization advice.</p>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && result && (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6">
                    {/* Results Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Generated Recommendations
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          Gifts for {relationship} (₹{budget} Budget)
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                          title="Copy text to clipboard"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleSavePlan}
                          disabled={isSaved}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5" />
                              Save Plan
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Result Content */}
                    <div className="prose prose-slate max-w-none">
                      {renderFormattedResult(result)}
                    </div>

                    {/* Footer Refresh Note */}
                    <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Not completely satisfied with these options?</span>
                      <button
                        onClick={() => handleGenerate()}
                        className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate New Options
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* History / Saved Plans Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Saved Gift Plans</h1>
                <p className="text-sm text-slate-500 mt-1">Review your previously generated gift ideas.</p>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                + Create New Plan
              </button>
            </div>

            {savedPlans.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No Saved Plans Yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  When you generate gift recommendations, click "Save Plan" to store them here for quick access later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">{plan.date}</span>
                        <button
                          onClick={() => handleDeleteSaved(plan.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete saved plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        {plan.relationship} ({plan.age} yrs)
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-semibold">
                          ₹{plan.budget}
                        </span>
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        <strong>Interests:</strong> {plan.interests}
                      </p>
                    </div>

                    <button
                      onClick={() => loadSavedPlan(plan)}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      View Full Plan
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
