import { useEffect, useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import Companion from "../components/Companion";
import type { Screen } from "../App";

interface Props { goTo:(s:Screen)=>void; isCorrect:boolean; }
interface Particle { id:number; emoji:string; x:number; angle:number; dur:number; delay:number; }
const CONFETTI=["🎈","⭐","🌟","✨","🎊","🎉","💫","🌈","🎀","💛","💙","💚","💜","🏆"];

export default function FeedbackScreen({ goTo, isCorrect }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ setTimeout(()=>setVisible(true),60); if(isCorrect){ setParticles(Array.from({length:28},(_,i)=>({ id:i, emoji:CONFETTI[i%CONFETTI.length], x:Math.random()*100, angle:(Math.random()-0.5)*200, dur:1.2+Math.random()*0.8, delay:Math.random()*0.5 }))); } },[isCorrect]);
  return (
    <div className="w-full h-full relative overflow-y-auto flex items-start justify-center py-6">
      <AnimatedBackground />
      <div className="fixed inset-0 z-10" style={{ background:"rgba(20,12,5,0.55)", backdropFilter:"blur(4px)" }} />
      {particles.map(p=><div key={p.id} className="absolute z-20 pointer-events-none text-2xl" style={{ left:`${p.x}%`, top:"5%", "--cx":`${p.angle}px`, "--cr":`${p.angle*1.5}deg`, animation:`confetti-burst ${p.dur}s ease-out ${p.delay}s both` } as React.CSSProperties}>{p.emoji}</div>)}
      {visible&&(
        <div className="anim-bounce-in relative z-30 mx-4 rounded-[36px] overflow-hidden flex flex-col" style={{ width:"min(480px, calc(100vw - 32px))", background:"#FAF8F0", boxShadow:"0 14px 0 rgba(0,0,0,0.18), 0 28px 80px rgba(0,0,0,0.35)" }}>
          <div className="flex flex-col items-center px-8 pt-8 pb-7" style={{ background:isCorrect?"linear-gradient(135deg, #A4D9A1 0%, #7BC7F0 100%)":"linear-gradient(135deg, #FAD054 0%, #F8A4B8 100%)" }}>
            <Companion mood={isCorrect?"celebrate":"think"} size={110} />
            <div className="flex gap-3 mt-5 mb-4">{[1,2,3].map(i=><span key={i} className={`text-4xl star-pop-${i}`} style={{ display:"inline-block", filter:!isCorrect&&i>1?"grayscale(1) opacity(0.4)":"drop-shadow(0 3px 6px rgba(0,0,0,0.2))" }}>⭐</span>)}</div>
            <h2 className="text-4xl font-semibold text-center" style={{ fontFamily:"Fredoka", color:"#FFFFFF", textShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>{isCorrect?"Great Job! 🎉":"Let's Learn Together! 💡"}</h2>
            <p style={{ fontFamily:"Nunito", color:"rgba(255,255,255,0.9)", fontSize:15, marginTop:4 }}>{isCorrect?"+15 stars · Empathy Explorer badge!":"You are doing amazing — every try helps!"}</p>
          </div>
          <div className="px-6 pt-6 pb-7 flex flex-col gap-4">
            <div className="rounded-[22px] p-5" style={{ background:"#EDE9DC" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily:"Nunito", color:"#5C3D2E" }}>{isCorrect?"Why this was great ✨":"What we learned 📚"}</p>
              <p style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:15, lineHeight:1.65 }}>{isCorrect?"Asking your friend how they are feeling shows you truly care. When we notice someone is sad and reach out, it helps them feel less alone!":"Asking your friend how they feel is the kindest choice. Even a simple question can make someone feel much better!"}</p>
            </div>
            {isCorrect&&<div className="flex items-center gap-4 rounded-[20px] px-5 py-4" style={{ background:"#FAD054", boxShadow:"0 5px 0 #c8a020" }}><span style={{ fontSize:34 }}>🏅</span><div><p style={{ fontFamily:"Nunito", color:"rgba(45,27,14,0.65)", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Badge Unlocked</p><p style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:20, fontWeight:700 }}>Empathy Explorer</p></div><div className="ml-auto"><div className="rounded-full px-3 py-1 text-sm font-bold" style={{ background:"rgba(255,255,255,0.6)", fontFamily:"Fredoka", color:"#2D1B0E" }}>NEW!</div></div></div>}
            <button onClick={()=>goTo("dashboard")} className="btn-press w-full rounded-full py-5 font-semibold" style={{ fontFamily:"Fredoka", background:"#A4D9A1", color:"#1A4A18", boxShadow:"0 8px 0 #7ab877", fontSize:21 }}>🗺️  Next Adventure</button>
            <button onClick={()=>goTo("lesson")} className="btn-press w-full rounded-full py-4 font-semibold" style={{ fontFamily:"Fredoka", background:"#7BC7F0", color:"#0a3d5c", boxShadow:"0 6px 0 #5aaad0", fontSize:19 }}>🔄  Try Another Story</button>
          </div>
        </div>
      )}
    </div>
  );
}