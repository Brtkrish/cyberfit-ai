"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Type Definitions ---
interface FormData {
  sex: string;
  age: string;
  height: string;
  weight: string;
  goal: string;
  fitness_type: string;
  hypertension: string;
  diabetes: string;
}

interface ApiResult {
  predictions: {
    exercise: string;
    diet: string;
    equipment: string;
  };
  gemini_plan: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan'>('dashboard');
  
  const [formData, setFormData] = useState<FormData>({
    sex: "1", age: "", height: "", weight: "",
    goal: "Weight Loss", fitness_type: "Cardio Fitness",
    hypertension: "0", diabetes: "0"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setActiveTab('dashboard');

    try {
      // Ensure this URL is your LIVE Render URL
      const response = await fetch('https://cyberfit-ai.onrender.com//generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sex: parseInt(formData.sex),
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          goal: formData.goal,
          fitness_type: formData.fitness_type,
          hypertension: parseInt(formData.hypertension),
          diabetes: parseInt(formData.diabetes)
        }),
      });

      const data = await response.json();
      if (response.ok) setResult(data);
      else alert("Error: " + (data.detail || "Something went wrong"));
    } catch (error) {
      alert("Failed to connect. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    // LAYOUT FIX: flex-col for mobile, md:flex-row for desktop
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#0b1121] text-white font-sans">
      
      {/* --- LEFT PANEL (Controls) --- */}
      {/* WIDTH FIX: w-full on mobile, w-1/3 on desktop */}
      <div className="w-full md:w-1/3 bg-[#151f32] p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-gray-800 shadow-2xl z-10">
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tighter">
            CYBERFIT <span className="text-white">AI</span>
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Biometric Command Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Age" name="age" type="number" placeholder="25" onChange={handleChange} />
            <SelectGroup label="Sex" name="sex" onChange={handleChange}>
              <option value="1">Male</option>
              <option value="0">Female</option>
            </SelectGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Height (m)" name="height" type="number" step="0.01" placeholder="1.75" onChange={handleChange} />
            <InputGroup label="Weight (kg)" name="weight" type="number" step="0.1" placeholder="70" onChange={handleChange} />
          </div>
          <SelectGroup label="Goal" name="goal" onChange={handleChange}>
            <option value="Weight Loss">🔥 Weight Loss</option>
            <option value="Weight Gain">💪 Muscle Gain</option>
          </SelectGroup>
          <SelectGroup label="Training" name="fitness_type" onChange={handleChange}>
            <option value="Cardio Fitness">🏃 Cardio</option>
            <option value="Muscular Fitness">🏋️ Strength</option>
          </SelectGroup>
          <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <SelectGroup label="Hypertension" name="hypertension" onChange={handleChange}>
              <option value="0">No</option><option value="1">Yes</option>
            </SelectGroup>
            <SelectGroup label="Diabetes" name="diabetes" onChange={handleChange}>
              <option value="0">No</option><option value="1">Yes</option>
            </SelectGroup>
          </div>
          
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4 active:scale-95">
            {loading ? "PROCESSING..." : "GENERATE PROTOCOL"}
          </button>
        </form>
      </div>

      {/* --- RIGHT PANEL (Results) --- */}
      {/* WIDTH FIX: w-full on mobile, w-2/3 on desktop */}
      <div className="w-full md:w-2/3 bg-[#0b1121] relative flex flex-col min-h-[500px]">
        
        {/* Mobile-Friendly Tabs */}
        <div className="sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur border-b border-gray-800 px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex space-x-6">
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
              📊 Dashboard
            </TabButton>
            <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')}>
              📅 Blueprint
            </TabButton>
          </div>
          <div className="hidden md:block text-xs text-gray-500 uppercase tracking-widest">
            {result ? "Status: Active" : "Status: Standby"}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 relative">
          
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
              <div className="text-6xl mb-4">💠</div>
              <p className="text-center px-4">System Ready.<br/>Enter data above to initialize.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-xl font-mono text-blue-400 animate-pulse">NEURAL PROCESSING</h2>
            </div>
          )}

          {result && (
            <div className="relative z-10 max-w-4xl mx-auto pb-10">
              
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <StatCard icon="⚡" label="Focus" value={result.predictions.exercise} color="blue" />
                    <StatCard icon="🥗" label="Diet" value={result.predictions.diet} color="green" />
                    <StatCard icon="🛠" label="Gear" value={result.predictions.equipment} color="purple" />
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">AI Assessment</h3>
                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                      Based on your biometric profile, we have identified <strong>{result.predictions.exercise}</strong> as your optimal training vector. 
                      Combined with a <strong>{result.predictions.diet}</strong> nutritional strategy, this approach maximizes your probability of achieving 
                      <strong> {formData.goal}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'plan' && (
                <div className="animate-fade-in bg-[#151f32] p-4 md:p-10 rounded-2xl border border-gray-800 shadow-2xl">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={{
                      h1: ({node, ...props}: any) => <h1 className="text-2xl md:text-3xl font-bold text-blue-400 mb-6 border-b border-gray-700 pb-2" {...props} />,
                      h2: ({node, ...props}: any) => <h2 className="text-xl md:text-2xl font-semibold text-white mt-8 mb-4 flex items-center gap-2" {...props} />,
                      h3: ({node, ...props}: any) => <h3 className="text-lg font-medium text-purple-300 mt-6 mb-2" {...props} />,
                      p: ({node, ...props}: any) => <p className="text-gray-400 leading-7 mb-4 text-sm md:text-base" {...props} />,
                      ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-2 mb-6 text-gray-300 text-sm md:text-base" {...props} />,
                      li: ({node, ...props}: any) => <li className="pl-2" {...props} />,
                      strong: ({node, ...props}: any) => <strong className="text-white font-bold" {...props} />,
                      table: ({node, ...props}: any) => <div className="overflow-x-auto my-6 rounded-lg border border-gray-700"><table className="w-full text-left border-collapse min-w-[500px]" {...props} /></div>,
                      thead: ({node, ...props}: any) => <thead className="bg-gray-800/50" {...props} />,
                      tbody: ({node, ...props}: any) => <tbody className="divide-y divide-gray-800" {...props} />,
                      tr: ({node, ...props}: any) => <tr className="hover:bg-gray-800/30 transition-colors" {...props} />,
                      th: ({node, ...props}: any) => <th className="p-3 md:p-4 text-xs font-bold text-blue-300 uppercase tracking-wider whitespace-nowrap" {...props} />,
                      td: ({node, ...props}: any) => <td className="p-3 md:p-4 text-sm text-gray-400 border-r border-gray-800/50 last:border-0" {...props} />,
                    }}
                  >
                    {result.gemini_plan}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Responsive Components ---

const TabButton = ({ active, children, onClick }: {active: boolean, children: React.ReactNode, onClick: () => void}) => (
  <button onClick={onClick} className={`pb-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${active ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
    {children}
  </button>
);

const InputGroup = ({ label, ...props }: any) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">{label}</label>
    <input className="w-full bg-[#0b1120] text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-colors text-sm" {...props} />
  </div>
);

const SelectGroup = ({ label, children, ...props }: any) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">{label}</label>
    <select className="w-full bg-[#0b1120] text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-colors text-sm appearance-none" {...props}>
      {children}
    </select>
  </div>
);

// FIXED: Static colors to avoid Tailwind purging issues
const StatCard = ({ icon, label, value, color }: {icon: string, label: string, value: string, color: 'blue'|'green'|'purple'}) => {
  const colorMap = {
    blue: "border-blue-500 text-blue-400 bg-blue-500/10",
    green: "border-green-500 text-green-400 bg-green-500/10",
    purple: "border-purple-500 text-purple-400 bg-purple-500/10",
  };

  return (
    <div className={`bg-[#151f32] p-5 md:p-6 rounded-xl border-t-4 shadow-lg ${colorMap[color].split(' ')[0]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`p-2 rounded-full ${colorMap[color].split(' ')[2]}`}>
          <div className={`w-2 h-2 rounded-full bg-current ${colorMap[color].split(' ')[1]}`}></div>
        </div>
      </div>
      <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">{label}</div>
      <div className="text-lg font-bold text-white mt-1 leading-tight">{value}</div>
    </div>
  );
};