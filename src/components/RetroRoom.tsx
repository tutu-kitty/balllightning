import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Power, 
  BookOpen, 
  Play, 
  Square,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from "lucide-react";
import { audioSynth } from "../utils/audio";
import BallLightningCanvas, { Ball } from "./BallLightningCanvas";

export default function RetroRoom() {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [magneticFieldOn, setMagneticFieldOn] = useState(true);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isAudioRunning, setIsAudioRunning] = useState(false);
  const [activeBalls, setActiveBalls] = useState<Ball[]>([]);
  const [triggerLightning, setTriggerLightning] = useState(false);
  const [showNovelExcerpts, setShowNovelExcerpts] = useState(true);
  const [currentNovelPage, setCurrentNovelPage] = useState(0);
  const [activeBottomTab, setActiveBottomTab] = useState<"excerpts" | "concepts">("excerpts");
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);

  // 科幻物理概念定义 (Conceptual Knowledge of Ball Lightning)
  const ballLightningConcepts = [
    {
      title: "宏原子理论 (Macro-Atom Theory)",
      concept: "尺度大至数米乃至数公里的巨大基本粒子",
      text: "在《球状闪电》中，球状闪电并不是寻常的等离子体或静电漩涡，而是宇宙在大爆炸初期留下的巨型基本粒子——基态『宏电子』。平时以无形、无重力的『大泡泡』概率云在宇宙中漂流。"
    },
    {
      title: "量子波粒二象性 (Superposition)",
      concept: "没有发生相互作用时它是完美的概率波",
      text: "宏电子具有极其显著的波动特性：『不看它时，它是一片概率波；看它时，它是一个粒子』。当未被观测时，它就像幽灵一样能够毫无阻力地直接穿透多重墙壁，仅有一缕无序的微光边缘。"
    },
    {
      title: "观察者与波包坍缩 (Observation)",
      concept: "有意识的观测行为能干涉并决定物理状态",
      text: "一旦宏电子被意识凝视或通过感应镜头产生『交互/观测』，它不确定的概率态会因量子纠缠立刻发生『坍缩』。此时，波函数收缩为一颗轨迹精确、金光或耀蓝、能瞬间被感观捕获的稳定发光实体球体。"
    },
    {
      title: "能量选择性释放 (Selective Decay)",
      concept: "拥有独特的物质共振频率来传导巨大热量",
      text: "球状闪电衰变热能时有诡异的选择性，只和与其波长产生高能耦合的物质特定谐振。它可能瞬间把一名士兵的衣服鞋子烧成飞灰而皮肤未伤分毫，或融化所有保险箱内的金币但外层铁盒冰冷。"
    },
    {
      title: "量子幽灵存续态 (Quantum Ghosts)",
      concept: "超越常规生死极限的叠加生命形式",
      text: "被宏电子摧毁的人和物品并非真正覆灭。由于宏原子的波函数关联，他们会被整体坍缩为量子态。在不被其他人凝视的时候，他们会在这片空间内正常地生活、演奏、浇花，但在被目光触及时又瞬间遁形。"
    }
  ];

  // Excerpts from Liu Cixin's Ball Lightning novel regarding the storm and ball lightning behavior
  const novelExcerpts = [
    {
      title: "第一章：雷之夜",
      text: "在那场几乎将世界淹没的暴雨中，它出现在旧窗外。它就像一个由冷光组成的精灵，在夜空中幽幽漂浮。雨点砸在它完美的球体表面上，没有引起一丝波澜，甚至直接穿透而过。它就是终极的幽灵——球状闪电。"
    },
    {
      title: "第十二章：宏原子",
      text: "‘宏电子’在没有被激发时处于常态：它是完全隐形、仅有一缕微弱边缘的肥皂泡。只有在强大的电荷激发下，它才会散发出橙红或紫色的冷光。而那道长长的发光尾巴，是其在三维空间中留下的概率残影。"
    },
    {
      title: "第十六章：量子坍缩",
      text: "‘你看到它时，它是一个粒子；你不看它时，它是一片概率波。’ 观察者是神圣的——当鼠标或目光触碰到它的那一瞬间，它的量子不确定性坍缩成一个完美的稳定硬球，光芒骤亮，所有的无序轨迹归于绝对确定。"
    }
  ];

  const handleToggleRadio = () => {
    if (!isAudioInitialized) {
      audioSynth.init();
      setIsAudioInitialized(true);
      setIsAudioRunning(true);
    } else {
      audioSynth.toggleRadio();
      setIsAudioRunning(audioSynth.getRadioState());
    }
  };

  const handleToggleWindow = () => {
    const nextState = !isWindowOpen;
    setIsWindowOpen(nextState);
    audioSynth.setWindowOpen(nextState);
    
    // Automatically trigger thunderclaps on window opening to bring massive atmosphere!
    if (nextState) {
      setTriggerLightning(true);
    }
  };

  const handleToggleMagnet = () => {
    setMagneticFieldOn(!magneticFieldOn);
  };

  // Trigger sudden random lightning occasionally (every 10-25 seconds)
  useEffect(() => {
    let timer: number;
    const triggerRandomLightning = () => {
      if (isWindowOpen) {
        setTriggerLightning(true);
      }
      const nextInterval = 10000 + Math.random() * 15000;
      timer = window.setTimeout(triggerRandomLightning, nextInterval);
    };

    timer = window.setTimeout(triggerRandomLightning, 12000);
    return () => clearTimeout(timer);
  }, [isWindowOpen]);

  return (
    <div 
      id="retro-room-viewport"
      className="relative w-full h-screen bg-[#0A0A0B] text-[#E0E0E0] flex flex-col md:flex-row overflow-hidden font-sans select-none"
    >
      {/* Film Grain/Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')`
        }}
      />

      {/* LEFT ASPECT: Interactive Window View Frame */}
      <div 
        id="room-scenery-container"
        className={`relative flex-1 h-full transition-all duration-1000 ease-in-out flex flex-col items-center justify-center p-6 md:p-12 ${
          isWindowOpen ? "bg-[#050508]" : "bg-[#090807]"
        }`}
        style={{
          backgroundImage: !isWindowOpen 
            ? "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.08) 0%, rgba(10,10,11,0.9) 70%)"
            : "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.04) 0%, rgba(10,10,11,1.0) 80%)"
        }}
      >
        {/* Artistic 90s Interior Wall Texture Layer (Opacity changes depending on window state) */}
        <div 
          id="retro-wallpaper-overlay"
          className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none transition-opacity duration-1000"
          style={{
            backgroundImage: `radial-gradient(#000 1.5px, transparent 0)`,
            backgroundSize: "6px 6px",
            opacity: isWindowOpen ? 0.06 : 0.28
          }}
        />

        {/* WINDOW OUTLINE WITH DEEP ARTISTIC THICK BORDER (Artistic Flair spec style) */}
        <div 
          id="retro-wooden-window-frame"
          className={`relative max-w-4xl w-full aspect-[4/3] md:aspect-[16/10] border-[20px] border-[#2C2118] rounded-sm bg-[#020205] shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden transition-transform duration-1000 ${
            isWindowOpen ? "scale-[1.01]" : "scale-95"
          }`}
        >
          {/* Beige Wall surrounding frame overlay to give realistic depth */}
          <div 
            className="absolute -inset-[20px] pointer-events-none opacity-40 mix-blend-overlay bg-[#D4C3A1]"
            style={{ 
              backgroundImage: "radial-gradient(#000 1px, transparent 0)", 
              backgroundSize: "4px 4px" 
            }}
          />

          {/* Main dynamic interactive canvas rendering the storm & ball lightning */}
          <BallLightningCanvas
            isWindowOpen={isWindowOpen}
            magneticFieldOn={magneticFieldOn}
            onBallsUpdated={(balls) => setActiveBalls(balls)}
            triggerLightningFlash={triggerLightning}
            setTriggerLightningFlash={setTriggerLightning}
          />

          {/* Golden/wooden vertical window frame divider */}
          <div 
            id="window-vertical-divider"
            className="absolute top-0 bottom-0 left-1/2 w-2.5 bg-[#1F1710] -translate-x-1/2 z-10 pointers-events-none border-l border-r border-[#150F0A]"
          />

          {/* LEFT SLIDING WINDOW GLASS PANE */}
          <div 
            id="window-pane-left"
            onClick={handleToggleWindow}
            className="absolute top-0 bottom-0 left-0 w-1/2 border border-white/5 cursor-pointer transition-transform duration-1000 ease-in-out z-20"
            style={{
              transform: isWindowOpen ? "translateX(-94%)" : "translateX(0)",
              background: "linear-gradient(215deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: isWindowOpen ? "none" : "blur(1px)"
            }}
          >
            {/* Dirt/Rain flow effect lines inside glass pane */}
            <div className={`absolute inset-0 bg-transparent transition-opacity duration-1000 ${isWindowOpen ? 'opacity-0' : 'opacity-100'}`}>
              <div className="absolute top-12 left-16 w-32 h-[1px] bg-white/5 transform rotate-12" />
              <div className="absolute bottom-24 left-8 w-40 h-[1px] bg-white/5 transform -rotate-45" />
            </div>
          </div>

          {/* RIGHT SLIDING WINDOW GLASS PANE */}
          <div 
            id="window-pane-right"
            onClick={handleToggleWindow}
            className="absolute top-0 bottom-0 right-0 w-1/2 border border-white/5 cursor-pointer transition-transform duration-1000 ease-in-out z-20"
            style={{
              transform: isWindowOpen ? "translateX(94%)" : "translateX(0)",
              background: "linear-gradient(45deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: isWindowOpen ? "none" : "blur(1px)"
            }}
          >
            <div className={`absolute inset-0 bg-transparent transition-opacity duration-1000 ${isWindowOpen ? 'opacity-0' : 'opacity-100'}`}>
              <div className="absolute top-28 right-12 w-28 h-[1px] bg-white/5 transform -rotate-12" />
              <div className="absolute bottom-20 right-20 w-36 h-[1px] bg-white/5 transform rotate-45" />
            </div>
          </div>

          {/* HUD OVERLAY INSIDE THE WINDOW BOTTOM (Artistic Flair requirement) */}
          <div className="absolute bottom-0 inset-x-0 p-5 flex justify-between items-end bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-serif italic text-white/95 leading-none tracking-tight">
                Rainy Night Perspective
              </h2>
              <p className="text-[9px] font-mono opacity-60 tracking-wider">
                COORDINATES: 39.9042° N, 116.4074° E | ALTITUDE: 1,024M
              </p>
            </div>
            
            <div className="flex gap-6 border-t border-white/10 pt-2 font-mono">
              <div className="text-center">
                <div className="text-sm font-semibold text-white">0{activeBalls.length}</div>
                <div className="text-[8px] uppercase tracking-widest opacity-40">Entities</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-white">
                  {magneticFieldOn ? "94%" : "12%"}
                </div>
                <div className="text-[8px] uppercase tracking-widest opacity-40">Coherence</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-orange-400">
                  {activeBalls.some(b => b.state === "observed") ? "Observed" : "Quantum"}
                </div>
                <div className="text-[8px] uppercase tracking-widest opacity-40">State</div>
              </div>
            </div>
          </div>

          {/* NOVEL PULL-LOG FLOATING PANEL (Artistic Flair Overlay) */}
          <div className="absolute top-4 left-4 max-w-[240px] p-3.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-sm z-30 transition-all pointer-events-auto">
            <div className="text-[8px] text-orange-400 mb-1 font-mono tracking-widest">LOG: 00-1B // NOVEL COGNITION</div>
            <p className="text-[10px] leading-relaxed text-white/85 italic font-serif">
              "It drifted through the window as if the glass were merely a ghost of itself. A sphere of pure energy, carrying the secrets of the macroscopic atom."
            </p>
          </div>

          {/* INITIAL SLIDE OPEN PROMPT */}
          {!isWindowOpen && (
            <div 
              id="click-to-open-prompt"
              onClick={handleToggleWindow}
              className="absolute inset-0 flex flex-col items-center justify-center z-30 cursor-pointer bg-black/65 backdrop-blur-xs transition-all hover:bg-black/75"
            >
              <div className="w-12 h-12 rounded-full border border-orange-500/80 flex items-center justify-center text-orange-400 mb-2.5 animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                <Power className="w-5 h-5" />
              </div>
              <span className="text-orange-400 tracking-[0.25em] text-xs font-semibold animate-pulse uppercase font-mono">
                Click to open window
              </span>
              <span className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1 font-mono">
                点击推开窗户 • 步入雷雨夜景
              </span>
            </div>
          )}
        </div>

        {/* Vintage Desk Accessories area underneath the window */}
        <div 
          id="desk-furniture"
          className="w-full max-w-4xl flex items-center justify-between mt-5 border-t border-zinc-900 pt-4 transition-all duration-1005"
          style={{ opacity: isWindowOpen ? 0.7 : 1.0 }}
        >
          {/* Old 90s cassette tape radio player */}
          <div 
            id="retro-cassette-radio"
            className="bg-[#111113] rounded-sm p-2.5 flex items-center gap-3.5 border border-zinc-800 shadow-[0_8px_24px_rgba(0,0,0,0.8)] w-72"
          >
            <div className="bg-[#070709] p-2 rounded-sm border border-zinc-900 flex items-center justify-center">
              <Radio className={`w-7 h-7 ${isAudioRunning ? 'text-orange-500 animate-pulse' : 'text-zinc-600'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-[8px] uppercase tracking-[0.15em] text-zinc-500 font-mono">90s Retro Synthesizer</div>
              <div className="text-xs font-semibold text-zinc-300 truncate font-mono">
                {isAudioRunning ? "雨夜背景白噪音 (ACTIVE)" : "已静音 / STANDBY"}
              </div>
              
              {/* Retro audio wave simulation on UI */}
              <div className="flex gap-0.5 mt-1.5 h-2.5 items-end">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-orange-500 w-0.5 rounded-t-xs"
                    style={{
                      height: isAudioRunning ? `${20 + Math.sin(Date.now() * 0.012 + i) * 80}%` : '15%',
                      transition: 'height 0.1s ease-in-out'
                    }}
                  />
                ))}
              </div>
            </div>

            <button 
              id="radio-power-btn"
              onClick={handleToggleRadio}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isAudioRunning 
                  ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
              }`}
              title="Toggle Audio"
            >
              {isAudioRunning ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick instructions indicator for physical action */}
          <div className="hidden lg:flex flex-col items-end text-right text-xs text-zinc-400 italic font-serif">
            <span>"物理学的天空闪过一道量子幽灵"</span>
            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mt-1">— 《球状闪电》</span>
          </div>
        </div>
      </div>

      {/* RIGHT: High-fidelity physics telemetry dashboard and novel reading interface */}
      <div 
        id="technical-dashboard-aside"
        className="w-full md:w-96 bg-[#0E0E10] border-t md:border-t-0 md:border-l border-zinc-900 p-6 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xl relative z-10"
      >
        <div className="space-y-6">
          {/* App title and brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <h1 className="text-sm font-bold text-white uppercase tracking-[0.2em] font-mono">球状闪电观测台</h1>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              基于刘慈欣小说经典科幻概念，在雷雨呼啸的暗夜探寻闪电幽灵的多重态量子演化。
            </p>
          </div>

          {/* MAGNETIC FIELD CONTROLS (THE CORE INTERACTION CONTROLLER REQUIRED BY THE SPEC) */}
          <div className="bg-[#121215] p-4 rounded-sm border border-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-sm ${magneticFieldOn ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'}`}>
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold tracking-wider text-zinc-200 font-mono uppercase">磁场约束系统</h3>
                  <p className="text-[8px] text-zinc-500 uppercase font-mono tracking-widest">Magnetic Confinement</p>
                </div>
              </div>

              {/* RETRO TOGGLE LEVER SWITCH */}
              <button 
                id="magnet-confinement-lever"
                onClick={handleToggleMagnet}
                className={`relative w-11 h-5.5 rounded-full cursor-pointer transition-colors duration-300 ${
                  magneticFieldOn ? "bg-orange-500" : "bg-zinc-800"
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-4.5 h-4.5 bg-black rounded-full transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
                    magneticFieldOn ? "translate-x-5.5" : "translate-x-0.5"
                  }`} 
                />
              </button>
            </div>

            {/* LIVE READOUT STATS */}
            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-zinc-900 font-mono">
              <div className="bg-[#0A0A0B] p-2 rounded-sm border border-zinc-900">
                <span className="block text-[8px] text-zinc-500 uppercase tracking-widest">激发数量</span>
                <span className="text-xs font-bold text-orange-400">
                  {activeBalls.length} <span className="text-zinc-600 font-normal text-[10px]">/ 4</span>
                </span>
              </div>
              <div className="bg-[#0A0A0B] p-2 rounded-sm border border-zinc-900">
                <span className="block text-[8px] text-zinc-500 uppercase tracking-widest">物理状态</span>
                <span className={`text-xs font-bold ${magneticFieldOn ? "text-emerald-400" : "text-red-500 animate-pulse"}`}>
                  {magneticFieldOn ? "CONFINED" : "TERMINAL"}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 italic leading-relaxed">
              {magneticFieldOn 
                ? "💡 磁场开启：雷电闪烁时将持续在远空捕捉并生成球状闪电粒子。" 
                : "⚠️ 磁场关闭：停止产生新球，现有宏原子微粒将因能量耗损迅速离散消逝。"}
            </div>
          </div>

          {/* TELEMETRY DATA PANEL (THE NO-SLOP REALISTIC RETRO METRIC READOUTS) */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-pulse" />
              量子参数监控 (TELEMETRY)
            </h3>

            {activeBalls.length === 0 ? (
              <div className="p-4 rounded-sm border border-dashed border-zinc-800 bg-[#0A0A0B] text-center text-zinc-500 text-[11px] font-mono">
                {isWindowOpen 
                  ? "WAITING FOR ATMOSPHERIC EXCITATION..." 
                  : "SHUTTERS CLOSED. CURRENT READOUT EMPTY."}
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeBalls.map((b) => {
                  const stateLabels = {
                    unexcited: { label: "常态(未激发)", style: "bg-zinc-800 text-zinc-400" },
                    excited: { label: "激发本征态", style: "bg-orange-950 text-orange-400" },
                    observed: { label: "量子塌缩", style: "bg-purple-950 text-purple-200 border border-purple-800 animate-pulse font-bold" }
                  };
                  return (
                    <div 
                      key={b.id} 
                      className="bg-[#121215] p-3 rounded-sm border border-zinc-900 space-y-2 font-mono"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            b.color === 'purple' ? 'bg-purple-500' : b.color === 'blue' ? 'bg-blue-400' : 'bg-orange-500'
                          }`} />
                          宏电子 #{b.id.slice(-4).toUpperCase()}
                        </span>
                        <span className={`text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${stateLabels[b.state].style}`}>
                          {stateLabels[b.state].label}
                        </span>
                      </div>

                      {/* Display metric sliders */}
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between text-zinc-500">
                          <span>能量强度 (Beta)</span>
                          <span className="text-orange-400 font-bold">{(b.life * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-[#0A0A0B] h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full transition-all"
                            style={{ width: `${b.life * 100}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-zinc-500 mt-1">
                          <span>概率深度 (Z-Axis)</span>
                          <span className="text-zinc-300">{b.z.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-[#0A0A0B] h-1 rounded-full overflow-hidden animate-pulse">
                          <div 
                            className="bg-white/40 h-full transition-all"
                            style={{ width: `${b.z * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MANUAL EXCITATION TRIGGER & ACTION BUFFERS */}
          <div className="space-y-2">
            <button
              id="manual-trigger-instant-lightning"
              disabled={!isWindowOpen}
              onClick={() => {
                setTriggerLightning(true);
                audioSynth.playQuantumSparkle();
              }}
              className={`w-full py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isWindowOpen 
                  ? "bg-white text-black hover:bg-neutral-200 shadow-[0_4px_12px_rgba(255,255,255,0.05)]" 
                  : "bg-zinc-900 text-zinc-650 cursor-not-allowed border border-zinc-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Trigger Excitation / 激发宏原子
            </button>
          </div>
        </div>

        {/* BOTTOM: Retro novel explorer & concept index */}
        <div className="border-t border-zinc-900 pt-5 mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono tracking-[0.2em] text-zinc-400 uppercase">
              <BookOpen className="w-3.5 h-3.5 text-orange-500" />
              <span>《球状闪电》科研数据库</span>
            </div>
            
            <button
              onClick={() => setShowNovelExcerpts(!showNovelExcerpts)}
              className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 cursor-pointer font-mono"
            >
              {showNovelExcerpts ? "[ Hide ]" : "[ Show ]"}
            </button>
          </div>

          {showNovelExcerpts && (
            <div className="space-y-3 pt-1">
              {/* Retro Tab Bar */}
              <div className="flex gap-4 border-b border-zinc-900 pb-1.5">
                <button
                  onClick={() => setActiveBottomTab("excerpts")}
                  className={`text-[9.5px] font-mono uppercase tracking-widest transition-colors cursor-pointer select-none pb-0.5 ${
                    activeBottomTab === "excerpts"
                      ? "text-orange-400 font-bold border-b border-orange-500"
                      : "text-zinc-500 hover:text-zinc-300 border-b border-transparent"
                  }`}
                >
                  小说摘录 (Excerpts)
                </button>
                <button
                  onClick={() => setActiveBottomTab("concepts")}
                  className={`text-[9.5px] font-mono uppercase tracking-widest transition-colors cursor-pointer select-none pb-0.5 ${
                    activeBottomTab === "concepts"
                      ? "text-orange-400 font-bold border-b border-orange-500"
                      : "text-zinc-500 hover:text-zinc-300 border-b border-transparent"
                  }`}
                >
                  物理概念 (Concepts)
                </button>
              </div>

              {activeBottomTab === "excerpts" ? (
                <div className="bg-[#121215] border border-zinc-900 p-3.5 rounded-sm font-serif text-zinc-350 text-xs leading-relaxed space-y-2 transition-all">
                  <div className="flex justify-between text-[10px] font-sans font-medium text-orange-400 tracking-wider">
                    <span>{novelExcerpts[currentNovelPage].title}</span>
                    <span className="font-mono">
                      {currentNovelPage + 1} / {novelExcerpts.length}
                    </span>
                  </div>
                  <p className="indent-4 leading-relaxed text-zinc-300">
                    {novelExcerpts[currentNovelPage].text}
                  </p>

                  {/* Slider paginations */}
                  <div className="flex justify-between items-center pt-2 font-mono text-[9px] uppercase tracking-wider text-zinc-500 border-t border-zinc-900/60 mt-1">
                    <button
                      onClick={() => setCurrentNovelPage((p) => (p - 1 + novelExcerpts.length) % novelExcerpts.length)}
                      className="hover:text-zinc-300 cursor-pointer"
                    >
                      ◀ Prev EXCERPT
                    </button>
                    <button
                      onClick={() => setCurrentNovelPage((p) => (p + 1) % novelExcerpts.length)}
                      className="hover:text-zinc-300 cursor-pointer"
                    >
                      Next EXCERPT ▶
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Concept selection list */}
                  <div className="flex flex-wrap gap-1">
                    {ballLightningConcepts.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentConceptIndex(idx)}
                        className={`px-2 py-0.5 text-[8.5px] font-mono rounded-xs transition-all cursor-pointer ${
                          currentConceptIndex === idx
                            ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold"
                            : "bg-[#0A0A0B] text-zinc-500 border border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                        }`}
                      >
                        0{idx + 1}. {item.title.split(" ")[0]}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#121215] border border-zinc-900 p-3.5 rounded-sm space-y-1.5 transition-all">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-zinc-100 font-mono select-all">
                        {ballLightningConcepts[currentConceptIndex].title}
                      </div>
                      <div className="text-[9px] font-sans text-orange-400 font-medium select-all">
                        🔍 特性：{ballLightningConcepts[currentConceptIndex].concept}
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 text-[11.5px] leading-relaxed font-serif pt-1 border-t border-zinc-900/60">
                      {ballLightningConcepts[currentConceptIndex].text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Branding Footer from Artistic Flair template */}
          <div className="flex items-center gap-2 border-t border-zinc-900 pt-4 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shrink-0"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 font-mono">
              Macro-Atom Research Dept.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
