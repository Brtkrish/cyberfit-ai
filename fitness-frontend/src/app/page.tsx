"use client";
import React, { useState } from 'react'; // Added React import here
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const [loading, setLoading] = useState(false);
  // Fixed: Added <any> so TypeScript allows 'result.predictions' later
  const [result, setResult] = useState<any>(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [formData, setFormData] = useState({
    sex: "1", age: "", height: "", weight: "",
    goal: "Weight Loss", fitness_type: "Cardio Fitness",
    hypertension: "0", diabetes: "0"
  });

  // Fixed: Added ': any' to event 'e' to stop the red error
  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Fixed: Added ': any' here too
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setActiveTab('dashboard');

    try {
      const response = await fetch('https://cyberfit-ai.onrender.com/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sex: parseInt(formData.sex), age: parseInt(formData.age),
          height: parseFloat(formData.height), weight: parseFloat(formData.weight),
          goal: formData.goal, fitness_type: formData.fitness_type,
          hypertension: parseInt(formData.hypertension), diabetes: parseInt(formData.diabetes)
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
    <div className="flex h-screen w-full bg-[#0b1121] text-white overflow-hidden font-sans">
      
      {/* --- LEFT WINDOW: CONTROL PANEL --- */}
      <div className="w-full md:w-1/3 bg-[#151f32] p-8 flex flex-col border-r border-gray-800 shadow-2xl overflow-y-auto z-10 custom-scrollbar">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tighter">
            CYBERFIT <span className="text-white">AI</span>
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Biometric Command Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Age" name="age" type="number" onChange={handleChange} />
            <SelectGroup label="Sex" name="sex" onChange={handleChange}>
              <option value="1">Male</option><option value="0">Female</option>
            </SelectGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Height (m)" name="height" type="number" step="0.01" onChange={handleChange} />
            <InputGroup label="Weight (kg)" name="weight" type="number" step="0.1" onChange={handleChange} />
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
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4">
            {loading ? "PROCESSING..." : "GENERATE PROTOCOL"}
          </button>
        </form>
      </div>

      {/* --- RIGHT WINDOW: TABBED RESULTS --- */}
      <div className="w-full md:w-2/3 bg-[#0b1121] relative flex flex-col">
        <div className="h-20 border-b border-gray-800 flex items-center px-8 justify-between bg-[#0f172a]/50 backdrop-blur">
          <div className="flex space-x-6">
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
              📊 Dashboard
            </TabButton>
            <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')}>
              📅 Full Blueprint
            </TabButton>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">
            {result ? "Status: Active" : "Status: Standby"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <div className="text-6xl mb-4">💠</div>
              <p>System Ready. Awaiting Input.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-xl font-mono text-blue-400 animate-pulse">NEURAL PROCESSING</h2>
            </div>
          )}

          {result && (
            <div className="relative z-10 max-w-4xl mx-auto">
              
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon="⚡" label="Focus" value={result.predictions.exercise} color="blue" />
                    <StatCard icon="🥗" label="Diet" value={result.predictions.diet} color="green" />
                    <StatCard icon="🛠" label="Gear" value={result.predictions.equipment} color="purple" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">AI Assessment</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Based on your biometric profile, we have identified <strong>{result.predictions.exercise}</strong> as your optimal training vector. 
                      Combined with a <strong>{result.predictions.diet}</strong> nutritional strategy, this approach maximizes your probability of achieving 
                      <strong> {formData.goal}</strong>. Switch to the <strong>Full Blueprint</strong> tab to see your day-by-day execution plan.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'plan' && (
                <div className="animate-fade-in bg-[#151f32] p-10 rounded-2xl border border-gray-800 shadow-2xl">
                  {/* --- MARKDOWN RENDERER WITH CUSTOM STYLING --- */}
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={{
                      // Added ': any' to props to silence strict markdown errors
                      h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold text-blue-400 mb-6 border-b border-gray-700 pb-2" {...props} />,
                      h2: ({node, ...props}: any) => <h2 className="text-2xl font-semibold text-white mt-8 mb-4 flex items-center gap-2" {...props} />,
                      h3: ({node, ...props}: any) => <h3 className="text-lg font-medium text-purple-300 mt-6 mb-2" {...props} />,
                      p: ({node, ...props}: any) => <p className="text-gray-400 leading-7 mb-4" {...props} />,
                      ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-2 mb-6 text-gray-300" {...props} />,
                      li: ({node, ...props}: any) => <li className="pl-2" {...props} />,
                      strong: ({node, ...props}: any) => <strong className="text-white font-bold" {...props} />,
                      table: ({node, ...props}: any) => <div className="overflow-x-auto my-6 rounded-lg border border-gray-700"><table className="w-full text-left border-collapse" {...props} /></div>,
                      thead: ({node, ...props}: any) => <thead className="bg-gray-800/50" {...props} />,
                      tbody: ({node, ...props}: any) => <tbody className="divide-y divide-gray-800" {...props} />,
                      tr: ({node, ...props}: any) => <tr className="hover:bg-gray-800/30 transition-colors" {...props} />,
                      th: ({node, ...props}: any) => <th className="p-4 text-xs font-bold text-blue-300 uppercase tracking-wider" {...props} />,
                      td: ({node, ...props}: any) => <td className="p-4 text-sm text-gray-400 border-r border-gray-800/50 last:border-0" {...props} />,
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

// --- Components (Restored Full Logic) ---

interface TabButtonProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const TabButton = ({ active, children, onClick }: TabButtonProps) => (
  <button 
    onClick={onClick} 
    className={`pb-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${active ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'}`}
  >
    {children}
  </button>
);

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputGroup = ({ label, ...props }: InputGroupProps) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
      {label}
    </label>
    {/* Restored the full className here */}
    <input className="w-full bg-[#0b1120] text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-colors" {...props} />
  </div>
);

interface SelectGroupProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

const SelectGroup = ({ label, children, ...props }: SelectGroupProps) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
      {label}
    </label>
    {/* Restored the full className here */}
    <select className="w-full bg-[#0b1120] text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-colors" {...props}>
      {children}
    </select>
  </div>
);

interface StatCardProps {
  icon: React.ReactNode; 
  label: string;
  value: string | number; 
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  // Restored the proper structure and safelisted the color classes in a way TS accepts
  <div className={`bg-[#151f32] p-6 rounded-xl border-t-4 border-${color}-500 shadow-lg hover:bg-[#1e293b] transition-colors`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-400`}>
        {icon}
      </div>
    </div>
  </div>
);