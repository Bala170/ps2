import AnimatedBackground from "../components/AnimatedBackground";
import Companion from "../components/Companion";
import type { Screen, ChildProfile } from "../App";
import { useLanguage } from "../lib/i18n";

const LEVELS = [
  { id:1, label:"Hello World!",    emoji:"👋", stars:3, done:true  },
  { id:2, label:"Sharing Time",    emoji:"🤝", stars:2, done:true  },
  { id:3, label:"Feelings Island", emoji:"💬", stars:0, done:false, current:true },
  { id:4, label:"Friendship Fort", emoji:"👫", stars:0, done:false },
  { id:5, label:"Help Harbour",    emoji:"🙋", stars:0, done:false },
  { id:6, label:"Patience Peak",   emoji:"⏳", stars:0, done:false },
  { id:7, label:"Star Summit",     emoji:"⭐", stars:0, done:false },
];

interface Props { goTo:(s:Screen)=>void; profile:ChildProfile; }

export default function DashboardScreen({ goTo, profile }: Props) {
  const { t } = useLanguage();
  const currentLevel = LEVELS.find(l=>l.current)!;
  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-20 flex items-center justify-between px-4 lg:px-8 pt-5 pb-4" style={{ backdropFilter:"blur(6px)" }}>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 4px 0 #c8c0a8" }}>
          <span style={{ fontSize:20 }}>🧒</span>
          <div><p style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:16, fontWeight:600, lineHeight:1 }}>{profile.name}</p><p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:11 }}>{t("Age")} {profile.age}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-2" style={{ background:"#FAD054", boxShadow:"0 4px 0 #c8a020" }}><span style={{ fontSize:16 }}>⭐</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontWeight:700, fontSize:16 }}>247</span></div>
          <div className="relative" style={{ width:46, height:46 }}>
            <svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" fill="rgba(255,255,255,0.85)" stroke="#EDE9DC" strokeWidth="4" /><circle cx="23" cy="23" r="19" fill="none" stroke="#7BC7F0" strokeWidth="5" strokeDasharray={`${(2/7)*119.4} 119.4`} strokeLinecap="round" transform="rotate(-90 23 23)" /></svg>
            <div className="absolute inset-0 flex items-center justify-center" style={{ fontFamily:"Fredoka", fontSize:12, color:"#2D1B0E", fontWeight:700 }}>2/7</div>
          </div>
          <button onClick={()=>goTo("parent")} className="btn-press flex items-center gap-2 rounded-full px-3 py-2" style={{ background:"#F8A4B8", boxShadow:"0 4px 0 #d9839a" }}><span style={{ fontSize:16 }}>🔒</span><span className="hidden sm:inline" style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:14, fontWeight:600 }}>{t("Parents")}</span></button>
        </div>
      </div>
      <div className="relative z-20 px-4 lg:px-8 mb-4">
        <div className="anim-glow rounded-[28px] p-5 flex items-center gap-4" style={{ background:"#7BC7F0", boxShadow:"0 7px 0 #5aaad0, 0 14px 28px rgba(0,0,0,0.12)" }}>
          <Companion mood="idle" size={70} />
          <div className="flex-1"><p style={{ fontFamily:"Nunito", color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>{t("Current Mission")}</p><p style={{ fontFamily:"Fredoka", color:"#FFFFFF", fontSize:22, fontWeight:600 }}>{t(currentLevel.label)} {currentLevel.emoji}</p><p style={{ fontFamily:"Nunito", color:"rgba(255,255,255,0.75)", fontSize:13 }}>{t("Skill")}: {t(profile.skill)}</p></div>
          <button onClick={()=>goTo("lesson")} className="btn-press rounded-full px-5 py-3 font-bold" style={{ background:"#FFFFFF", color:"#2D1B0E", fontFamily:"Fredoka", fontSize:17, boxShadow:"0 5px 0 rgba(0,0,0,0.15)" }}>{t("Play")} →</button>
        </div>
      </div>
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 lg:px-8 pb-6">
        <div className="relative mx-auto" style={{ maxWidth:520 }}>
          <svg className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none" style={{ width:"60%", height:"100%", overflow:"visible" }} viewBox="0 0 100 800" preserveAspectRatio="none">
            <path d="M50,0 C80,80 20,160 50,240 C80,320 20,400 50,480 C80,560 20,640 50,720" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="14" strokeLinecap="round" strokeDasharray="10 8" />
          </svg>
          <div className="flex flex-col gap-6 py-2">
            {LEVELS.map((level,i)=>{
              const isLeft=i%2===0;
              return (
                <div key={level.id} className="flex items-center anim-fade-up" style={{ justifyContent:isLeft?"flex-start":"flex-end", animationDelay:`${i*0.06}s` }}>
                  <div className="flex items-center gap-3" style={{ flexDirection:isLeft?"row":"row-reverse" }}>
                    <div className="relative">
                      {level.current&&<div className="absolute inset-0 rounded-full" style={{ animation:"node-ping 1.5s cubic-bezier(0,0,0.2,1) infinite", background:"rgba(123,199,240,0.5)" }} />}
                      <button onClick={()=>(level.done||level.current)?goTo("lesson"):undefined} className="btn-press relative flex items-center justify-center rounded-full" style={{ width:level.current?76:62, height:level.current?76:62, background:level.done?"#FAD054":level.current?"#7BC7F0":"rgba(255,255,255,0.5)", boxShadow:level.done?"0 6px 0 #c8a020":level.current?"0 7px 0 #5aaad0":"0 4px 0 rgba(255,255,255,0.4)", fontSize:level.current?30:24, cursor:level.done||level.current?"pointer":"default", flexShrink:0 }}>
                        {level.current&&<div className="absolute -top-8"><Companion mood="idle" size={40} /></div>}
                        {level.emoji}
                        {level.done&&<div className="absolute -bottom-1.5 -right-1.5 rounded-full flex items-center justify-center text-xs" style={{ width:22, height:22, background:"#A4D9A1", border:"2px solid white" }}>✓</div>}
                      </button>
                    </div>
                    <div className="rounded-2xl px-4 py-2.5" style={{ background:level.done||level.current?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.45)", boxShadow:level.done||level.current?"0 4px 0 rgba(0,0,0,0.08)":"none", backdropFilter:"blur(8px)", minWidth:130 }}>
                      <p style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:16, fontWeight:600, opacity:level.done||level.current?1:0.5 }}>{level.label}</p>
                      {level.done&&<div className="flex gap-0.5 mt-1">{[1,2,3].map(s=><span key={s} style={{ fontSize:11 }}>{s<=level.stars?"⭐":"☆"}</span>)}</div>}
                      {level.current&&<p style={{ fontFamily:"Nunito", color:"#7BC7F0", fontSize:12, fontWeight:700 }}>▶ {t("In Progress")}</p>}
                      {!level.done&&!level.current&&<p style={{ fontFamily:"Nunito", color:"#9A9080", fontSize:12 }}>🔒 {t("Locked")}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}