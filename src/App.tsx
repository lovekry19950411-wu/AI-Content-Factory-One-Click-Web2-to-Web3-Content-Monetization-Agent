import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Video, 
  Subtitles, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  Zap, 
  Plus, 
  Copy, 
  Trash2, 
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  MoreVertical,
  Scissors,
  Sparkles,
  MessageSquareText,
  FileVideo,
  Clapperboard,
  CheckCircle2,
  TrendingUp,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generateViralContent, 
  generateAdvice, 
  GeneratedContent, 
  ContentType, 
  Platform 
} from './services/geminiService';

type Tab = 'dashboard' | 'script' | 'editor' | 'subtitles' | 'assets' | 'logs' | 'autopilot' | 'roadmap' | 'showcase';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [library, setLibrary] = useState<GeneratedContent[]>([]);
  const [currentProject, setCurrentProject] = useState<GeneratedContent | null>(null);
  const [logs, setLogs] = useState<{timestamp: string, protocol: string, id: string, status: string}[]>([
    { timestamp: new Date().toISOString(), protocol: 'SYSTEM_BOOT', id: 'OS_KERNEL', status: 'READY' }
  ]);
  
  const APP_ID = "69f7fae163622bf8ce968643";

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch('/api/scripts');
        if (response.ok) {
          const data = await response.json();
          setLibrary(data);
          setLogs(prev => [{
            timestamp: new Date().toISOString(),
            protocol: 'DB_SYNC_SUCCESS',
            id: 'MONGODB',
            status: 'READY'
          }, ...prev]);
        }
      } catch (err) {
        console.error("Failed to fetch scripts:", err);
      }
    };
    fetchScripts();
  }, []);

  const addToLibrary = async (content: GeneratedContent) => {
    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (response.ok) {
        setLibrary(prev => [content, ...prev]);
        setCurrentProject(content);
        setLogs(prev => [{
          timestamp: new Date().toISOString(),
          protocol: 'DB_SAVE_SUCCESS',
          id: content.id,
          status: 'PERSISTED'
        }, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save script:", err);
    }
  };

  const deleteFromLibrary = async (id: string) => {
    try {
      const response = await fetch(`/api/scripts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setLibrary(prev => prev.filter(item => item.id !== id));
        setLogs(prev => [{
          timestamp: new Date().toISOString(),
          protocol: 'DB_DELETE_SUCCESS',
          id: id,
          status: 'REMOVED'
        }, ...prev]);
      }
    } catch (err) {
      console.error("Failed to delete script:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg-deep text-[#E0E0E0] font-sans selection:bg-brand/30">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-border-dim px-8 flex items-center justify-between bg-bg-nav z-30 shadow-lg">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 bg-brand rounded-md flex items-center justify-center transition-transform group-hover:scale-110">
              <Video className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">AI 影片智能製片系統 VIDEO_AI</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-text-muted">
            <button onClick={() => setActiveTab('dashboard')} className={`transition-colors hover:text-white ${activeTab === 'dashboard' ? 'text-white border-b-2 border-brand pb-5 pt-5' : 'pb-5 pt-5 border-b-2 border-transparent'}`}>控制中心</button>
            <button className="hover:text-white transition-colors">資源中心</button>
            <button className="hover:text-white transition-colors">安全防護</button>
            <button className="hover:text-white transition-colors">節點狀態</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="status-badge">狀態：已驗證已授權</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-purple-500 border border-border-dim shadow-lg shadow-brand/20"></div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border-dim bg-bg-sidebar p-6 flex flex-col justify-between shrink-0">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4">核心工作坊 Studio Core</p>
              <ul className="space-y-1.5">
                <SidebarItem icon={<LayoutDashboard size={18} />} label="控制總覽" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <SidebarItem icon={<FileText size={18} />} label="AI 腳本引擎" active={activeTab === 'script'} onClick={() => setActiveTab('script')} />
                <SidebarItem icon={<Scissors size={18} />} label="虛擬剪輯師" active={activeTab === 'editor'} onClick={() => setActiveTab('editor')} />
                <SidebarItem icon={<Subtitles size={18} />} label="字幕工作坊" active={activeTab === 'subtitles'} onClick={() => setActiveTab('subtitles')} />
                <SidebarItem icon={<Zap size={18} />} label="自動駕駛渲染" active={activeTab === 'autopilot'} onClick={() => setActiveTab('autopilot')} />
                <SidebarItem icon={<TrendingUp size={18} />} label="生產路線圖" active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} />
                <SidebarItem icon={<Clapperboard size={18} />} label="範例展示" active={activeTab === 'showcase'} onClick={() => setActiveTab('showcase')} />
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4">營運管理 Operations</p>
              <ul className="space-y-1.5">
                <SidebarItem icon={<Layers size={18} />} label="資產管理員" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
                <SidebarItem icon={<Activity size={18} />} label="系統日誌" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                <SidebarItem icon={<Settings size={18} />} label="全局配置" />
              </ul>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-border-dim">
            <p className="text-[10px] text-text-muted mb-2 font-mono uppercase tracking-wider">雲端儲存容量</p>
            <div className="h-1.5 w-full bg-border-dim rounded-full overflow-hidden">
              <div className="h-full bg-brand w-3/4 shadow-[0_0_8px_#6366f1]"></div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-bg-deep custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView appId={APP_ID} setActiveTab={setActiveTab} addToLibrary={addToLibrary} setIsLoading={setIsLoading} />}
            {activeTab === 'script' && <ScriptEngineView setIsLoading={setIsLoading} isLoading={isLoading} addToLibrary={addToLibrary} />}
            {activeTab === 'editor' && <EditorSimulationView />}
            {activeTab === 'subtitles' && <SubtitleWorkshopView />}
            {activeTab === 'autopilot' && <AutopilotView />}
            {activeTab === 'roadmap' && <RoadmapView />}
            {activeTab === 'showcase' && <ShowcaseView />}
            {activeTab === 'assets' && (
              currentProject && activeTab === 'assets' ? 
              <ProjectDetailView project={currentProject} onBack={() => setCurrentProject(null)} /> :
              <AssetManagerView library={library} onSelect={setCurrentProject} onDelete={deleteFromLibrary} />
            )}
            {activeTab === 'logs' && <LogsView logs={logs} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: any) {
  return (
    <li 
      onClick={onClick}
      className={`sidebar-item ${active ? 'active text-white' : ''} flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-white/10`}
    >
      <span className={active ? "text-brand" : "text-text-muted transition-colors group-hover:text-white"}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </li>
  );
}

// Sub-Views Implementation

function DashboardView({ appId, setActiveTab, addToLibrary, setIsLoading }: { 
  appId: string, 
  setActiveTab: (t: Tab) => void,
  addToLibrary: (c: GeneratedContent) => void,
  setIsLoading: (b: boolean) => void
}) {
  const templates = [
    { id: '1', title: "TikTok 爆款冷知識", topic: "3個你不知道的理財冷知識", platform: "tiktok" as Platform },
    { id: '2', title: "科技產品評測", topic: "iPhone 16 Pro 使用一個月後的真實感受", platform: "youtube" as Platform },
    { id: '3', title: "感性生活 Vlog", topic: "在繁忙城市中尋找寧靜的週末", platform: "instagram" as Platform },
  ];

  const handleQuickStart = async (template: typeof templates[0]) => {
    setIsLoading(true);
    setActiveTab('script');
    try {
      const content = await generateViralContent("video_script", template.platform, template.topic);
      const newAsset: GeneratedContent = {
        id: Math.random().toString(36).substring(7),
        type: "video_script",
        platform: template.platform,
        topic: template.topic,
        content: content,
        timestamp: Date.now(),
        wordCount: content.length
      };
      addToLibrary(newAsset);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      {/* Identity Header */}
      <header className="relative overflow-hidden glass-panel p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded uppercase tracking-tighter border border-green-500/20">已驗證實例 Verified Instance</span>
            <h1 className="text-3xl font-semibold tracking-tight">AI 影片智能製片中心</h1>
          </div>
          <p className="text-text-muted text-sm max-w-lg leading-relaxed">
            系統節點已激活。您現在可以訪問整合了影片生成、雲端剪輯與自動字幕的高級套件。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="id-tag">
              <span className="text-[9px] text-text-dim block uppercase font-black tracking-widest mb-1.5 underline decoration-brand/50">開發者身份 Developer Identity App ID</span>
              <code className="text-brand font-mono text-base font-bold tracking-tight select-all">{appId}</code>
            </div>
            <button onClick={() => setActiveTab('script')} className="brand-button h-full px-8 shadow-lg shadow-black/50">啟動新專案</button>
          </div>
        </div>
        <div className="relative w-full md:w-64 aspect-video rounded-2xl overflow-hidden border border-border-dim group cursor-pointer shadow-2xl shadow-brand/10" onClick={() => setActiveTab('showcase')}>
          <img src="https://picsum.photos/seed/studio/640/360" alt="製片中心預覽 Studio Preview" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0 group-hover:scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
            <Play className="w-10 h-10 text-brand fill-brand opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </header>

      {/* Featured Templates */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-text-dim uppercase tracking-widest px-4 border-l-2 border-brand">快速啟動範本 Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} onClick={() => handleQuickStart(t)} className="glass-panel p-5 hover:border-brand/40 transition-all cursor-pointer group hover:bg-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">{t.platform}</span>
                <Plus size={14} className="text-text-dim group-hover:text-brand transition-colors" />
              </div>
              <h4 className="font-bold text-sm mb-2 group-hover:text-brand transition-colors">{t.title}</h4>
              <p className="text-[10px] text-text-muted line-clamp-1">{t.topic}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="處理延遲 Processing Latency" value="8.4" unit="ms" trend="運作良好" />
        <StatCard label="雲端渲染線程 Cloud Render Threads" value="512" unit="個線程" trend="+8% 負載" />
        <StatCard label="AI 模型精度 AI Model Precision" value="99.8" unit="%" trend="Gemini 2.0" />
      </section>

      {/* Quick Access */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 hover:border-brand/30 transition-colors cursor-pointer group" onClick={() => setActiveTab('script')}>
          <h3 className="font-bold flex items-center gap-2 mb-4 group-hover:text-brand transition-colors"><Zap size={18} className="text-brand" /> AI 腳本生成器 AI Script Generator</h3>
          <p className="text-sm text-text-muted">基於最新社交趨勢數據，自動生成極具張力的影片腳本與視覺建議。</p>
        </div>
        <div className="glass-panel p-6 hover:border-brand/30 transition-colors cursor-pointer group" onClick={() => setActiveTab('editor')}>
          <h3 className="font-bold flex items-center gap-2 mb-4 group-hover:text-brand transition-colors"><Scissors size={18} className="text-brand" /> 智能虛擬剪輯師 Smart Virtual Editor</h3>
          <p className="text-sm text-text-muted">模擬影片剪輯流程，精確控制轉場風格、視覺效果與節奏節律。</p>
        </div>
      </section>
    </motion.div>
  );
}

function ScriptEngineView({ isLoading, setIsLoading, addToLibrary }: any) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const script = await generateViralContent("video_script", platform, topic);
      setResult(script);
      
      const newAsset: GeneratedContent = {
        id: Math.random().toString(36).substring(7),
        type: "video_script",
        platform: platform,
        topic: topic,
        content: script,
        timestamp: Date.now(),
        wordCount: script.length
      };
      addToLibrary(newAsset);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="text-brand" /> AI 智能腳本引擎
      </h2>
      <div className="glass-panel p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">目標平台 Target Platform</label>
            <div className="flex gap-2">
              {(['tiktok', 'youtube', 'instagram', 'shorts'] as Platform[]).map(p => (
                <button 
                  key={p} 
                  onClick={() => setPlatform(p)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${platform === p ? 'bg-brand text-black border-brand' : 'bg-transparent text-text-dim border-border-dim hover:border-text-dim'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">影片概念 / 腳本重點 Video Concept / Script Focus</label>
            <textarea 
              placeholder="輸入影片的核心內容，例如：個人理財教學、週末Vlog、科幻短片提示詞..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-bg-deep border border-border-dim rounded-xl px-4 py-4 min-h-[120px] focus:border-brand/50 outline-none transition-all font-sans text-sm resize-none"
            />
          </div>
        </div>
        <button onClick={generate} disabled={isLoading || !topic} className="brand-button w-full disabled:opacity-50 h-14">
          {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
          {isLoading ? "正在分析語義模式 Analyzing Semantic Patterns..." : "生成智能腳本 Generate Intelligent Script"}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border-dim pb-4">
            <h3 className="font-bold text-brand italic">VIDEO_SCRIPT_NODE_v1.2</h3>
            <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-colors" onClick={() => navigator.clipboard.writeText(result)}><Copy size={16} /></button>
          </div>
          <pre className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed font-sans">{result}</pre>
        </motion.div>
      )}
    </motion.div>
  );
}

function EditorSimulationView() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(24.12);
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.08;
          return next > 90 ? 0 : next;
        });
        setProgress(prev => {
          const next = prev + 0.2;
          return next > 100 ? 0 : next;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Scissors className="text-brand" /> 智能虛擬剪輯師 Smart Virtual Editor
      </h2>
      <div className="flex-1 glass-panel flex flex-col overflow-hidden bg-black/20">
        <div className="flex-1 bg-black flex items-center justify-center relative group">
          <div className="absolute top-4 left-4 flex gap-2">
            <div className={`px-2 py-1 ${isPlaying ? 'bg-brand' : 'bg-white/20'} text-black text-[9px] font-bold rounded uppercase transition-colors`}>
              {isPlaying ? '預覽渲染中 PREVIEW RENDERING' : '預覽暫停 PREVIEW PAUSED'}
            </div>
            <div className="px-2 py-1 bg-white/10 text-white text-[9px] font-bold rounded uppercase">8K 超清渲染 UPSCALE</div>
          </div>
          
          <div 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand/20 transition-all border border-white/10 group-hover:scale-110 shadow-2xl"
          >
            {isPlaying ? 
              <div className="flex gap-2"><div className="w-2 h-8 bg-brand rounded-full"></div><div className="w-2 h-8 bg-brand rounded-full"></div></div> : 
              <Play className="w-10 h-10 text-brand fill-brand ml-2" />
            }
          </div>

          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/50 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            {formatTime(currentTime)} / 00:01:30:00
          </div>

          {isPlaying && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
              <div className="w-64 h-64 border-2 border-brand rounded-full animate-ping"></div>
            </div>
          )}
        </div>

        <div className="h-56 border-t border-border-dim p-6 bg-bg-sidebar flex flex-col gap-6 select-none">
           <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                 <button className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">剪裁工具 Cut</button>
                 <button className="text-[10px] font-black text-text-dim uppercase tracking-widest hover:text-white">磁吸對齊 Snap</button>
                 <button className="text-[10px] font-black text-text-dim uppercase tracking-widest hover:text-white">變速調節 Ramping</button>
              </div>
              <div className="text-[10px] font-mono text-text-dim uppercase">渲染線程: 0x812A_ACTIVE</div>
           </div>

           <div className="flex gap-4 items-center">
              <div className="w-20 text-[9px] text-text-dim uppercase font-black tracking-widest">視訊軌 Video</div>
              <div className="flex-1 flex gap-2 h-10 bg-black/10 rounded-lg p-1 relative overflow-hidden">
                 <div className="w-[15%] h-full bg-brand/5 border border-brand/20 rounded-md"></div>
                 <div className="h-full bg-brand/20 border border-brand/40 rounded-md relative transition-all duration-100" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-brand shadow-[0_0_10px_#E2FF00] z-10"></div>
                 </div>
                 <div className="w-[20%] h-full bg-white/5 border border-white/10 rounded-md"></div>
              </div>
           </div>

           <div className="flex gap-4 items-center">
              <div className="w-20 text-[9px] text-text-dim uppercase font-black tracking-widest">音訊軌 Audio</div>
              <div className="flex-1 flex gap-2 h-8 bg-black/10 rounded-lg p-1">
                 <div className="flex-1 h-full bg-green-500/10 border border-green-500/20 rounded-md flex items-center px-4 overflow-hidden relative">
                    <div className="flex gap-0.5 items-end h-3/4 w-full">
                       {[...Array(80)].map((_, i) => (
                         <div 
                           key={i} 
                           className={`bg-green-500/40 w-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`} 
                           style={{ height: `${20 + Math.random() * (isPlaying ? 80 : 20)}%` }}
                         ></div>
                       ))}
                    </div>
                    <div className="absolute top-0 bottom-0 w-0.5 bg-green-400/50 shadow-[0_0_5px_rgba(74,222,128,0.5)]" style={{ left: `${progress}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function SubtitleWorkshopView() {
  const [subtitles, setSubtitles] = useState([
    { time: '00:00:15', text: '身分驗證成功，正在激活影音節點' },
    { time: '00:00:18', text: '正在讀取核心節點 ID: 69f7fae163622bf8ce968643' },
    { time: '00:00:22', text: '啟動全自動智能字幕流水線...' }
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Subtitles className="text-brand" /> 智能字幕工作坊
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6">
           <div className="mb-6 flex justify-between items-center">
              <p className="text-xs font-bold text-text-dim uppercase tracking-widest">時間軸對齊 Temporal Alignment</p>
              <button className="text-[10px] text-brand font-black uppercase hover:underline tracking-widest">重新同步 AI Re-Sync</button>
           </div>
           <div className="space-y-4">
              {subtitles.map((sub, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="bg-bg-deep border border-border-dim px-2 py-1 rounded text-[10px] font-mono text-text-muted mt-1">{sub.time}</div>
                  <input type="text" value={sub.text} readOnly className="flex-1 bg-transparent border-b border-border-dim py-1 text-sm outline-none focus:border-brand/40 transition-colors" />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} className="text-text-dim cursor-pointer hover:text-red-500" />
                  </div>
                </div>
              ))}
              <button className="w-full py-4 border border-dashed border-border-dim rounded-xl text-text-muted text-[10px] font-bold uppercase tracking-widest hover:border-brand/30 hover:text-brand transition-all flex items-center justify-center gap-3">
                <Plus size={14} /> 新增字幕節點 New Caption Node
              </button>
           </div>
        </div>
        <div className="glass-panel p-6 space-y-6">
           <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">視覺預設 Visual Presets</p>
           <div className="grid grid-cols-2 gap-3">
              {['動態靛藍 Dynamic Indigo', '科技板岩 Slate Tech', '極簡亮色 Minimal Light', '專業深黑 Pro Noir'].map(style => (
                <div key={style} className="aspect-video glass-panel flex items-center justify-center p-3 text-center text-[9px] font-bold cursor-pointer hover:border-brand transition-all bg-bg-sidebar">
                  {style}
                </div>
              ))}
           </div>
           <div className="space-y-4 pt-6 border-t border-border-dim">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">轉場曲線 Transition Curve</label>
              <select className="w-full bg-bg-deep border border-border-dim px-3 py-2.5 rounded-lg text-xs outline-none focus:border-brand/40">
                <option>漸入漸出 (神經網路) Ease In Out</option>
                <option>彈跳脈衝 Bounce Pulse</option>
                <option>動力學文字 Kinetic Type</option>
              </select>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function AutopilotView() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [logs]);

  const run = () => {
    setIsRunning(true);
    setProgress(0);
    setLogs(["正在初始化自動駕駛引擎 Initializing Autopilot Engine...", "連接至渲染節點 Connecting to Render Node: CLOUD_01", "核心 ID 驗證循環 App ID Verification Loop (69f7fae163622bf8ce968643)...", "驗證成功。開始影像合成 Verified. Starting Video Synthesis."]);
    
    let p = 0;
    const it = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p === 20) setLogs(prev => [...prev, "正在同步腳本數據 Syncing Script Data..."]);
      if (p === 50) setLogs(prev => [...prev, "生成 4K 視覺中間層 Generating 4K Visual Intermediates..."]);
      if (p === 80) setLogs(prev => [...prev, "套用字幕遮罩 Applying Subtitle Masks..."]);
      if (p >= 100) {
        clearInterval(it);
        setLogs(prev => [...prev, "✨ 所有節點任務完成。影片渲染成功。 ALL NODES COMPLETE."]);
        setIsRunning(false);
      }
    }, 100);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 h-full flex flex-col">
       <header className="flex items-center gap-4">
        <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-brand/20">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight italic uppercase">自動駕駛生產線 Autopilot Production Line</h2>
          <p className="text-text-muted text-sm uppercase tracking-widest font-bold text-[10px]">端到端 AI 影片生成系統 End-to-End AI Video Generation</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 glass-panel p-6 space-y-8">
          <div className="space-y-4">
             <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">輸出解析度 Output Resolution</label>
             <div className="flex gap-2">
                {['1080P', '4K', '8K'].map((r, i) => (
                  <button key={r} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${i === 1 ? 'border-brand text-brand bg-brand/5' : 'border-border-dim text-text-dim'}`}>{r}</button>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">模型複雜度 Model Complexity</label>
             <input type="range" className="w-full accent-brand h-1.5 bg-bg-deep rounded-full appearance-none cursor-pointer" />
          </div>
          <button onClick={run} disabled={isRunning} className="brand-button w-full h-14 mt-auto">
            {isRunning ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
            {isRunning ? "管線處理中 PROCESSING PIPELINE..." : "啟動全自動渲染 INITIATE FULL RENDER"}
          </button>
        </div>
        <div className="lg:col-span-3 glass-panel p-6 flex flex-col">
           <div ref={logContainerRef} className="flex-1 bg-black/40 rounded-xl p-6 font-mono text-[11px] space-y-3 overflow-y-auto border border-border-dim">
              {logs.length === 0 && <div className="h-full flex items-center justify-center text-text-dim opacity-30 italic">等待節點激活中 Awaiting node activation...</div>}
              {logs.map((l, i) => <div key={i} className="flex gap-3"><span className="text-text-dim opacity-50">[{new Date().toLocaleTimeString()}]</span> <span className={l.includes('✨') ? 'text-brand font-bold' : 'text-text-muted'}>{l}</span></div>)}
           </div>
           <div className="mt-6 h-1 w-full bg-border-dim rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-brand shadow-[0_0_10px_#6366f1]" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function AssetManagerView({ library, onSelect, onDelete }: { library: GeneratedContent[], onSelect: (c: GeneratedContent) => void, onDelete: (id: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Layers className="text-brand" /> 資產管理員 Asset Manager
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {library.length === 0 && <div className="col-span-full py-20 text-center text-text-dim italic font-medium">尚無攝製資產。啟動新專案以在此查看。</div>}
        {library.map((asset) => (
          <div key={asset.id} className="glass-panel p-5 space-y-4 hover:border-brand/30 transition-colors flex flex-col group border border-border-dim">
            <div className="flex justify-between items-start">
               <div className="px-2 py-0.5 bg-brand text-black text-[9px] font-bold rounded uppercase">腳本令牌 SCRIPT_TOKEN</div>
               <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(asset.id);
                    }}
                    className="text-text-dim hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button className="text-text-dim hover:text-white transition-colors p-1"><MoreVertical size={14} /></button>
               </div>
            </div>
            <div className="cursor-pointer flex-1" onClick={() => onSelect(asset)}>
              <h4 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-brand transition-colors">{asset.topic}</h4>
              <div className="flex-1 mt-4">
                 <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">{asset.content}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border-dim flex justify-between items-center text-[9px] font-bold text-text-dim uppercase tracking-wider">
               <span>{asset.platform}</span>
               <span className="font-mono">#{asset.id}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProjectDetailView({ project, onBack }: { project: GeneratedContent, onBack: () => void }) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  
  // Simple heuristic to split script into scenes
  const scenes = project.content.split(/鏡頭|Shot|场景/i).filter(s => s.trim().length > 20).slice(0, 10);

  useEffect(() => {
    let interval: any;
    if (isPreviewing && scenes.length > 0) {
      interval = setInterval(() => {
        setCurrentScene((prev) => (prev + 1) % scenes.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPreviewing, scenes.length]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-colors border border-border-dim"><ChevronRight size={20} className="rotate-180" /></button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{project.topic}</h2>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="text-brand">●</span> {project.platform} 製作腳本 Production Script
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsPreviewing(!isPreviewing)}
          className={`brand-button h-11 px-6 ${isPreviewing ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : ''}`}
        >
          {isPreviewing ? '停止預覽 Stop Preview' : '模擬影片揭曉 Simulate Video Reveal'}
        </button>
      </header>

      {isPreviewing ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel overflow-hidden bg-black aspect-video relative group flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentScene}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                src={`https://picsum.photos/seed/${project.id}_${currentScene}/1280/720`} 
                alt="Preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>
            <div className="absolute bottom-10 left-10 right-10 text-center">
               <AnimatePresence mode="wait">
                 <motion.p 
                  key={`text-${currentScene}`}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-white text-lg md:text-xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,1)] px-8 leading-relaxed max-w-3xl mx-auto"
                 >
                   {scenes[currentScene].trim().substring(0, 120)}...
                 </motion.p>
               </AnimatePresence>
            </div>
            <div className="absolute top-6 left-6 flex items-center gap-3">
               <div className="px-3 py-1 bg-brand text-black text-[10px] font-black uppercase rounded tracking-widest shadow-lg shadow-brand/20">神經網路渲染預覽 NEURAL_RENDER_LIVE</div>
               <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-mono rounded border border-white/10">樣本流 SAMPLE {currentScene + 1}/{scenes.length}</div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-brand/30 w-full">
               <motion.div 
                key={currentScene}
                initial={{ width: '0%' }}
                animate={{ width: '100% '}}
                transition={{ duration: 3, ease: "linear" }}
                className="h-full bg-brand shadow-[0_0_15px_#E2FF00]"
               />
            </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="glass-panel p-8 space-y-6">
              <h3 className="text-xs font-black text-text-dim uppercase tracking-widest border-l-2 border-brand px-4">Full Narrative Script</h3>
              <div className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed font-sans bg-black/20 p-6 rounded-xl border border-border-dim h-[500px] overflow-y-auto custom-scrollbar">
                {project.content}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-text-dim uppercase tracking-widest px-4 border-l-2 border-brand">Storyboard Visualization</h3>
            <div className="space-y-4">
              {scenes.map((scene, i) => (
                <div key={i} className="glass-panel overflow-hidden group">
                  <div className="aspect-video bg-bg-deep relative overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${project.id}_${i}/640/360`} 
                      alt={`Scene ${i+1}`} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[9px] font-mono rounded">SCENE_{i+1}</div>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-text-muted line-clamp-2 italic leading-relaxed">
                      {scene.trim().substring(0, 100)}...
                    </p>
                  </div>
                </div>
              ))}
              {scenes.length === 0 && (
                 <div className="glass-panel p-8 text-center text-text-dim italic text-xs">
                    Script structure too complex to auto-visualize. 
                    Manual storyboard extraction required.
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function LogsView({ logs }: { logs: any[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border-dim bg-bg-sidebar">
        <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted">System Instance Logs</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-bg-sidebar z-10">
            <tr className="text-[10px] text-text-dim uppercase font-black border-b border-border-dim">
              <th className="px-6 py-4">時間戳 Timestamp</th>
              <th className="px-6 py-4">通訊協定 Protocol</th>
              <th className="px-6 py-4">資產 ID Asset ID</th>
              <th className="px-6 py-4">執行結果 Result Status</th>
            </tr>
          </thead>
          <tbody className="text-xs text-text-muted">
            {logs.map((log, i) => (
              <tr key={i} className="border-b border-border-dim/50 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-[10px] opacity-60">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4">{log.protocol}</td>
                <td className="px-6 py-4 text-brand font-mono">{log.id}</td>
                <td className={`px-6 py-4 font-bold ${log.status === 'SUCCESS' || log.status === 'VERIFIED' ? 'text-green-500' : 'text-brand'}`}>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function RoadmapView() {
  const steps = [
    { title: "需求分析 & 趨勢捕捉", desc: "利用 AI 引擎分析當前社交媒體熱點，確定影片主題。", statusId: "Done", status: "已完成 Done", icon: <Search size={20} /> },
    { title: "全自動腳本生成", desc: "基於熱點生成結構化腳本，包含鏡頭語言與配音文稿。", statusId: "Done", status: "已完成 Done", icon: <FileText size={20} /> },
    { title: "視覺資產準備", desc: "生成 AI 繪圖提示詞並自動構建分鏡故事板。", statusId: "Done", status: "已完成 Done", icon: <Layers size={20} /> },
    { title: "智能剪輯與合成", desc: "自動匹配轉場節奏與背景音樂模擬。", statusId: "In Progress", status: "連線中 Online", icon: <Scissors size={20} /> },
    { title: "字幕與配音渲染", desc: "合成高品質 AI 配音並精確對齊字幕。", statusId: "Pending", status: "等待中 Pending", icon: <Subtitles size={20} /> },
    { title: "全網一鍵發佈", desc: "多平台矩陣分發，追蹤社交影響力。", statusId: "Ready", status: "系統就緒 Ready", icon: <ExternalLink size={20} /> }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">製作流程路線圖 Production Workflow Roadmap</h2>
        <p className="text-text-muted text-sm mt-1">從創意到流量的完整標準自動化路徑</p>
      </header>

      <div className="relative space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="glass-panel p-6 flex items-center gap-6 relative group hover:border-brand/30 transition-all">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg ${step.statusId === 'Done' ? 'bg-brand text-black' : 'bg-bg-sidebar text-text-dim border border-border-dim'}`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-lg">{step.title}</h4>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                    step.statusId === 'Done' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    step.statusId === 'In Progress' ? 'bg-brand/10 text-brand border-brand/20 animate-pulse' : 
                    'bg-white/5 text-text-dim border-white/10'
                  }`}>
                  {step.status}
                </span>
              </div>
              <p className="text-sm text-text-muted mt-1">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="absolute left-[30px] bottom-[-20px] w-0.5 h-10 bg-gradient-to-b from-brand/30 to-transparent"></div>
            )}
            <ChevronRight className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ShowcaseView() {
  const examples = [
    { id: 'ex1', title: '賽博朋克東京奧德賽 Cyberpunk Tokyo', duration: '0:30', category: '爆款短片 Viral', img: 'https://picsum.photos/seed/cyberpunk/1280/720' },
    { id: 'ex2', title: '超寫實美食空鏡 Food B-Roll', duration: '0:15', category: '商業廣告 Commercial', img: 'https://picsum.photos/seed/food/1280/720' },
    { id: 'ex3', title: '微觀世界紀錄片 Macro Documentary', duration: '0:45', category: '敘事短片 Narrative', img: 'https://picsum.photos/seed/macro/1280/720' },
    { id: 'ex4', title: '流體金屬抽象視覺 Liquid Metal', duration: '0:10', category: '特效演示 VFX Demo', img: 'https://picsum.photos/seed/liquid/1280/720' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 h-full flex flex-col">
       <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">作品展示廊 Showcase Gallery</h2>
          <p className="text-text-muted text-sm mt-1">探索由 AI 雲端節點渲染的高保真成品。</p>
        </div>
        <div className="px-3 py-1 bg-brand text-black text-[10px] font-black uppercase rounded italic">准予生產 Production Ready</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {examples.map(ex => (
          <div key={ex.id} className="glass-panel overflow-hidden group border border-border-dim hover:border-brand/30 transition-all cursor-pointer">
            <div className="aspect-video relative overflow-hidden bg-bg-deep">
               <img src={ex.img} alt={ex.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all flex items-center justify-center">
                  <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-[0_0_30px_#E2FF0050] scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 text-black fill-black ml-1" />
                  </div>
               </div>
               <div className="absolute top-4 right-4 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-mono font-bold text-white border border-white/10">{ex.duration}</div>
               <div className="absolute bottom-4 left-4 px-2 py-0.5 bg-brand text-black text-[9px] font-black uppercase rounded shadow-lg">{ex.category}</div>
            </div>
            <div className="p-6 bg-bg-card">
               <h3 className="font-bold text-lg group-hover:text-brand transition-colors mb-2 tracking-tight">{ex.title}</h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-dim font-bold uppercase tracking-wider">
                    <Cpu size={12} className="text-brand opacity-60" /> 8K 高清超取樣 UPSCALED
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-text-dim font-bold uppercase tracking-wider">
                    <Sparkles size={12} className="text-brand opacity-60" /> 神經網路增強 NEURAL ENHANCED
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, unit, trend }: any) {
  return (
    <div className="glass-panel p-6 border-b-4 border-b-brand/20">
      <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-4">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-light leading-none tracking-tight">{value}</span>
        <span className="text-xs text-text-muted mb-1 font-bold">{unit}</span>
      </div>
      <p className="mt-4 text-[10px] font-black text-brand uppercase tracking-tighter italic">{trend}</p>
    </div>
  );
}
