import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Sparkles,
  Loader2,
  CheckCircle2,
  TerminalSquare,
  Users,
  CreditCard,
  Wallet,
  Share2,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Platform } from './services/geminiService';
import { SignIn } from './SignIn';
import { useAccount, useConnect } from 'wagmi';

export default function App() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [library, setLibrary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'referral' | 'topup'>('generate');
  const [user, setUser] = useState<any>(null);
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [genType, setGenType] = useState<string>('video_script');
  const [extraInstructions, setExtraInstructions] = useState('');
  
  const APP_ID = "69f7fae163622bf8ce968643"; 

  // Load user data
  useEffect(() => {
    if (address) {
      fetch(`/api/user/${address}`)
        .then(r => r.json())
        .then(data => {
          setUser(data);
          // Check for referral in URL
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = urlParams.get('ref');
          if (refCode && !data.invitedBy) {
            fetch(`/api/user/${address}/refer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: refCode })
            })
            .then(r => r.json())
            .then(res => {
              if (res.success) {
                alert(res.message);
                // Refresh user data to get bonus credits
                fetch(`/api/user/${address}`).then(r => r.json()).then(setUser);
              }
            });
          }
        });
    } else {
      setUser(null);
    }
  }, [address]);

  // Load library from backend on mount
  useEffect(() => {
    const url = address ? `/api/scripts?address=${address}` : '/api/scripts';
    fetch(url)
      .then(r => r.json())
      .then(data => setLibrary(data))
      .catch(console.error);
  }, [address]);

  const generate = async () => {
    if (!topic) {
      console.log("No topic provided");
      return;
    }
    console.log(`Generation started [${genType}] for topic:`, topic);
    setIsLoading(true);
    try {
      let content = "";
      
      // If user has credits, call internal API directly
      if (user && user.credits > 0) {
        console.log("User has credits, calling internal generation API first...");
        
        const response = await fetch("/api/viral-gen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: genType, platform, topic, extraInstructions })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "AI 生成失敗");
        }
        content = await response.text();
        
        if (!content || content.trim().length === 0) {
          throw new Error("AI 返回了空內容，可能話題過於敏感，請重試或更換話題");
        }

        // Only spend credit AFTER successful generation
        console.log("Generation successful, spending 1 credit...");
        const spendRes = await fetch(`/api/user/${address}/spend`, { method: 'POST' });
        if (!spendRes.ok) console.warn("扣除積分失敗，但生成已完成");
        
        // Sync local credits
        setUser((prev: any) => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
      } else {
        console.log("No credits, attempting x402 payment...");
        // Check if Bankr is available only when payment is needed
        if (!(window as any).bankr) {
          alert('您的積分已用完，請安裝 Bankr 插件或使用 Bankr 瀏覽器，或至「儲值積分」分頁購買。');
          setIsLoading(false);
          return;
        }

        const response = await (window as any).bankr.x402.fetch(
          "https://x402.bankr.bot/0xc97785f7eeabaffde32436842ad4824cb4141f8b/viral-gen", 
          {
            method: "POST",
            body: JSON.stringify({ type: genType, platform, topic, extraInstructions }),
            maxPaymentUsd: 0.15 
          }
        );
        if (!response.ok) {
          console.warn("x402 payment failed:", response.status);
          alert('付費生成失敗：' + (response.body || '支付取消或網路錯誤'));
          return;
        }
        content = response.body;
      }
      
      console.log("Generation successful, saving script...");
      
      const newScript = {
        id: Math.random().toString(36).substring(7),
        userAddress: address,
        topic,
        type: genType,
        platform,
        content,
        timestamp: Date.now()
      };

      setLibrary((prev: any) => [newScript, ...prev]);
      setResult(content);
      setActiveTab('library');
      setTopic('');

      // Save it using the backend
      await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScript)
      });
    } catch (e: any) {
      console.error("Generation error:", e);
      alert(e.message || '生成出錯，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const buyCredits = async (amount: number, price: number) => {
    console.log(`Starting purchase: ${amount} credits for ${price} USDC`);
    if (!(window as any).bankr) {
      alert('未檢測到 Bankr 協議。儲值功能需要 Bankr 錢包支持。請使用 Bankr 瀏覽器或安裝相關插件。');
      return;
    }
    
    try {
      setIsLoading(true); // Re-use loading state to prevent double clicks
      // Use x402 to handle the payment to the developer wallet
      const response = await (window as any).bankr.x402.fetch(
        `https://x402.bankr.bot/0xc97785f7eeabaffde32436842ad4824cb4141f8b/buyinfo`, 
        {
          method: "POST",
          body: JSON.stringify({ action: "buy_credits", amount, address, timestamp: Date.now() }),
          maxPaymentUsd: price
        }
      );

      if (response.ok) {
        console.log("Payment successful, updating backend credits...");
        // Record on our backend
        const res = await fetch(`/api/user/${address}/topup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });
        const updatedUser = await res.json();
        setUser(updatedUser);
        alert(`🎉 恭喜！成功儲值 ${amount} 積分！`);
      } else {
        console.warn("Payment response not OK:", response.status);
        alert('支付未完成或已被取消。');
      }
    } catch (e: any) {
      console.error("Purchase error:", e);
      alert('儲值過程發生錯誤：' + (e.message || '未知錯誤'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-[#E0E0E0] font-sans">
      <header className="px-6 py-4 border-b border-[#333333] bg-[#1a1a1a] flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 50%, #8a2be2 100%)' }}>
            <span className="text-white font-black text-xl leading-none">N</span>
          </div>
          <span className="font-bold text-lg tracking-tight">VIDEO_AI</span>
        </div>
        
        <div className="flex flex-col items-end">
          {isConnected ? (
            <SignIn />
          ) : (
            <button
               onClick={() => connect({ connector: connectors[0] })}
               className="px-3 py-1.5 rounded text-sm bg-[#3a7bd5] text-white font-bold"
            >
              連接錢包
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Developer Info Card */}
        <div className="p-4 bg-[#1a1a1a] border border-[#333333] rounded-2xl flex flex-col gap-2 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TerminalSquare size={80} />
          </div>
          <div className="flex gap-2 items-center text-[#E2FF00]">
             <CheckCircle2 size={16} />
             <span className="text-xs font-bold uppercase tracking-widest">系統節點已激活</span>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Developer App ID</p>
            <code className="text-[#00d2ff] font-mono text-sm font-bold bg-black/40 px-2 py-1 rounded select-all">{APP_ID}</code>
          </div>
          
          {isConnected && (
            <div className="mt-4 pt-4 border-t border-[#333333]">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Connected Wallet</p>
              <code className="text-[#8a2be2] font-mono text-sm font-bold bg-black/40 px-2 py-1 rounded select-all">{address}</code>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-[#333333] overflow-x-auto whitespace-nowrap no-scrollbar">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`pb-2 px-1 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'generate' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff]' : 'text-gray-500'}`}
          >
            新生成
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`pb-2 px-1 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'library' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff]' : 'text-gray-500'}`}
          >
            我的腳本 ({library.length})
          </button>
          <button 
            onClick={() => setActiveTab('referral')}
            className={`pb-2 px-1 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'referral' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff]' : 'text-gray-500'}`}
          >
            分享獎勵
          </button>
          <button 
            onClick={() => setActiveTab('topup')}
            className={`pb-2 px-1 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'topup' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff]' : 'text-gray-500'}`}
          >
            儲值積分
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="flex flex-col gap-8">
            {/* User Account Info */}
            {isConnected && user && (
              <div className="p-4 bg-gradient-to-r from-[#00d2ff]/10 to-[#8a2be2]/10 border border-[#00d2ff]/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00d2ff]/20 rounded-full">
                    <Coins className="text-[#00d2ff]" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">當前剩餘積分</p>
                    <p className="text-xl font-black text-white">{user.credits} <span className="text-xs font-normal text-gray-400">CREDITS</span></p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('topup')} className="px-4 py-2 bg-[#00d2ff] text-black text-xs font-bold rounded-lg uppercase tracking-widest">
                  儲值
                </button>
              </div>
            )}

            {/* Generator Form */}
            <div className="p-6 bg-[#1a1a1a] border border-[#333333] rounded-2xl flex flex-col gap-6 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-[#00d2ff]" size={20} /> AI 影音生產大腦
              </h2>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">任務類型 Task Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'video_script', label: '影音腳本 Script', icon: <Video size={14}/> },
                    { id: 'visual_prompt', label: '視覺提示詞 Prompt', icon: <Sparkles size={14}/> },
                    { id: 'subtitle_gen', label: '行銷字幕 Subtitle', icon: <TerminalSquare size={14}/> },
                    { id: 'ai_edit_plan', label: '剪輯指南 Edit Plan', icon: <CheckCircle2 size={14}/> },
                  ].map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setGenType(t.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${genType === t.id ? 'bg-[#3a7bd5] text-white border-[#3a7bd5]' : 'bg-[#111111] text-gray-400 border-[#333333] hover:border-gray-500'}`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">目標平台 Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['tiktok', 'youtube', 'instagram', 'shorts'] as Platform[]).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setPlatform(p)}
                      className={`py-3 text-xs font-black uppercase tracking-widest rounded-lg border transition-all ${platform === p ? 'bg-[#00d2ff] text-black border-[#00d2ff]' : 'bg-[#111111] text-gray-400 border-[#333333] hover:border-gray-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">影片概念 Concept</label>
                <textarea 
                  placeholder={genType === 'visual_prompt' ? "描述你的影像主題，AI 將為你生成 Runway/Luma 專用的電影級提示詞..." : "輸入影片的核心內容，例如：個人理財教學、週末Vlog..."}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-4 min-h-[100px] focus:border-[#00d2ff] outline-none transition-all text-sm resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">補充要求 Extra (Optional)</label>
                <input 
                  type="text"
                  placeholder="例如：語氣幽默、要包含 3 個金句、英文輸出..."
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 focus:border-[#00d2ff] outline-none transition-all text-sm"
                />
              </div>

              <button 
                 onClick={generate} 
                 disabled={isLoading || !topic || !isConnected} 
                 className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (genType === 'visual_prompt' ? <Sparkles size={18} /> : <Video size={18} />)}
                {isLoading ? "正在調度 AI..." : user?.credits > 0 ? `扣除 1 積分生成 ${genType === 'visual_prompt' ? '提示詞' : '內容'}` : "付費生成 0.1 USDC"}
              </button>

              {!isConnected && <p className="text-center text-xs text-red-500 font-bold">請先連接錢包才可以使用功能</p>}
            </div>

            {/* Result Area */}
            <AnimatePresence>
              {result && (
                <motion.div 
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   className="p-6 bg-[#1a1a1a] border border-[#00d2ff]/30 rounded-2xl flex flex-col gap-4 shadow-[0_0_30px_rgba(0,210,255,0.1)]"
                >
                  <h3 className="font-bold text-[#00d2ff] text-sm uppercase tracking-widest border-b border-[#333333] pb-3">Generation Result</h3>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans max-h-[500px] overflow-y-auto">
                    {result}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="grid grid-cols-1 gap-4">
            {library.map((item) => (
              <div key={item.id} className="p-5 bg-[#1a1a1a] border border-[#333333] rounded-xl flex flex-col gap-3 hover:border-gray-600 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <span className="px-2 py-0.5 bg-[#333333] text-[#00d2ff] text-[10px] font-black uppercase tracking-widest rounded">
                      {item.platform}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch(`/api/scripts/${item.id}`, { method: 'DELETE' });
                      setLibrary(prev => prev.filter(s => s.id !== item.id));
                    }}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    刪除
                  </button>
                </div>
                <h4 className="font-bold text-white group-hover:text-[#00d2ff] transition-colors">{item.topic}</h4>
                <p className="text-sm text-gray-400 line-clamp-2 italic">"{item.content.substring(0, 100)}..."</p>
                <button 
                  onClick={() => { setResult(item.content); setActiveTab('generate'); }}
                  className="mt-2 w-full py-2 border border-[#333333] text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-white hover:text-black transition-all"
                >
                  查看完整腳本 View Full Script
                </button>
              </div>
            ))}
            {library.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <Video className="text-gray-700" size={48} />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">尚無存檔腳本</p>
                <button onClick={() => setActiveTab('generate')} className="text-[#00d2ff] text-xs font-bold underline">立刻去生成第一個</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'referral' && (
          <div className="flex flex-col gap-8">
            <div className="p-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#333333] rounded-3xl text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00d2ff]/10 blur-3xl opacity-50"></div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#8a2be2]/10 blur-3xl opacity-50"></div>
               
               <div className="w-16 h-16 bg-[#00d2ff]/20 rounded-2xl flex items-center justify-center">
                 <Users className="text-[#00d2ff]" size={32} />
               </div>
               
               <div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Viral Growth System</h2>
                 <p className="text-gray-400 mt-2 text-sm">邀請好友使用，雙方皆可獲得生成積分</p>
               </div>

               {isConnected && user ? (
                 <div className="w-full space-y-6">
                   <div className="bg-black/40 p-6 rounded-2xl border border-[#333333]">
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">你的專屬邀請連結</p>
                     <div className="flex gap-2">
                       <code className="flex-1 bg-[#1a1a1a] p-3 rounded-lg text-[#00d2ff] text-xs font-mono overflow-x-auto no-scrollbar">
                         {`${window.location.origin}?ref=${user.referralCode}`}
                       </code>
                       <button 
                         onClick={() => {
                           navigator.clipboard.writeText(`${window.location.origin}?ref=${user.referralCode}`);
                           alert('連結已複製！');
                         }}
                         className="p-3 bg-white text-black rounded-lg hover:bg-gray-200"
                       >
                         <Share2 size={18} />
                       </button>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-black/40 p-4 rounded-xl border border-[#333333]">
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">已邀請人數</p>
                       <p className="text-2xl font-black text-white mt-1">{user.invitesCount}</p>
                     </div>
                     <div className="bg-black/40 p-4 rounded-xl border border-[#333333]">
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">累計獲得積分</p>
                       <p className="text-2xl font-black text-[#00d2ff] mt-1">{user.invitesCount * 2}</p>
                     </div>
                   </div>

                   <div className="text-left text-xs bg-[#00d2ff]/5 p-4 rounded-xl border border-[#00d2ff]/20">
                     <h4 className="font-bold text-[#00d2ff] uppercase tracking-widest mb-2 flex items-center gap-1">
                       <Sparkles size={12} /> 獎勵規則
                     </h4>
                     <ul className="space-y-1 text-gray-400 list-disc list-inside">
                       <li>邀請 1 名新用戶，你獲得 <span className="text-white font-bold">2 積分</span></li>
                       <li>新用戶獲得 <span className="text-white font-bold">1 積分</span> 作為見面禮</li>
                       <li>積分可用於免費生成 AI 影音腳本</li>
                     </ul>
                   </div>
                 </div>
               ) : (
                 <p className="text-gray-500 font-bold text-sm">請先連接錢包以啟用邀請系統</p>
               )}
            </div>
          </div>
        )}

        {activeTab === 'topup' && (
          <div className="flex flex-col gap-6">
            <div className="text-center mb-4">
               <h2 className="text-2xl font-black text-white italic uppercase">Credit Store</h2>
               <p className="text-gray-400 text-sm">預先儲值更多積分，生成更流暢</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { amount: 5, price: 0.45, label: "Starter", badge: "-10%" },
                 { amount: 12, price: 1.0, label: "Pro Choice", badge: "-20%", hot: true },
                 { amount: 30, price: 2.3, label: "Viral Master", badge: "-25%" },
                 { amount: 100, price: 6.9, label: "Legendary", badge: "-35%" }
               ].map((plan) => (
                 <div key={plan.amount} className={`p-6 bg-[#1a1a1a] border rounded-3xl flex flex-col gap-4 relative overflow-hidden transition-all hover:scale-[1.02] ${plan.hot ? 'border-[#00d2ff] ring-1 ring-[#00d2ff]/50' : 'border-[#333333]'}`}>
                   {plan.hot && <span className="absolute top-3 right-[-30px] bg-[#00d2ff] text-black text-[10px] font-black px-10 py-1 rotate-45 uppercase tracking-tighter">Best Deal</span>}
                   
                   <div>
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{plan.label}</span>
                     <div className="flex items-baseline gap-1 mt-1">
                       <span className="text-3xl font-black text-white">{plan.amount}</span>
                       <span className="text-xs text-gray-400 font-bold">積分</span>
                     </div>
                   </div>

                   <div className="flex items-center justify-between mt-2 font-bold">
                     <span className="text-lg text-[#00d2ff]">${plan.price} <span className="text-[10px] text-gray-500">USDC</span></span>
                     <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white">{plan.badge}</span>
                   </div>

                   <button 
                     onClick={() => buyCredits(plan.amount, plan.price)}
                     disabled={!isConnected}
                     className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${plan.hot ? 'bg-[#00d2ff] text-black hover:bg-[#00d2ff]/80' : 'bg-white/10 text-white hover:bg-white/20'}`}
                   >
                     立即購買
                   </button>
                 </div>
               ))}
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-[#333333] flex items-center gap-4">
               <div className="p-3 bg-[#8a2be2]/20 rounded-full text-[#8a2be2]">
                 <Wallet size={20} />
               </div>
               <div className="flex-1">
                 <p className="text-xs text-white font-bold">我們支持加密貨幣支付</p>
                 <p className="text-[10px] text-gray-500">支付將通過 Base 網絡進行，安全且快速。</p>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
