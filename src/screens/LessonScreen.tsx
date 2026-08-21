import { useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import Companion from "../components/Companion";
import type { Screen, ChildProfile } from "../App";

const OPTIONS = [
  { id:"A", text:"Tell your friend you don't want to play right now", emoji:"🙅", color:"#7BC7F0", shadow:"#5aaad0", correct:false },
  { id:"B", text:"Ask your friend how they are feeling", emoji:"💬", color:"#FAD054", shadow:"#c8a020", correct:true },
  { id:"C", text:"Walk away quietly without saying anything", emoji:"🚶", color:"#C4B5F4", shadow:"#9b87d4", correct:false },
  { id:"D", text:"Give your friend a high five and smile", emoji:"🙌", color:"#A4D9A1", shadow:"#7ab877", correct:false },
];

interface Props { goTo:(s:Screen)=>void; profile:ChildProfile; onAnswer:(correct:boolean)=>void; }

export default function LessonScreen({ goTo, profile, onAnswer }: Props) {
  const [selected, setSelected] = useState<string|null>(null);
  const pick = (opt: typeof OPTIONS[0]) => { if(selected) return; setSelected(opt.id); setTimeout(()=>onAnswer(opt.correct),350); };
  return (
    <div className="w-full h-full relative flex flex-col lg:flex-row overflow-hidden">
      <AnimatedBackground showTrees={false} />
      <div className="hidden lg:flex flex-col relative z-10 overflow-y-auto" style={{ width:360, flexShrink:0, padding:"32px 24px" }}>
        <button onClick={()=>goTo("dashboard")} className="btn-press self-start rounded-full px-4 py-2 mb-6 text-sm font-semibold" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 4px 0 #c8c0a8", fontFamily:"Fredoka", color:"#2D1B0E" }}>← Back</button>
        <div className="rounded-[28px] p-6 mb-5" style={{ background:"rgba(255,255,255,0.92)", boxShadow:"0 8px 0 #c8c0a8, 0 16px 32px rgba(0,0,0,0.09)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center rounded-2xl text-3xl" style={{ width:56, height:56, background:"#FAF8F0", border:"3px solid #EDE9DC" }}>💬</div>
            <div><p style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:19, fontWeight:600 }}>{profile.skill}</p><div className="flex items-center gap-2 mt-0.5"><div className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background:"#7BC7F0", color:"#FFFFFF", fontFamily:"Fredoka" }}>Level 1</div><span style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:12 }}>Question 2/5</span></div></div>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background:"#EDE9DC" }}><div className="h-full rounded-full" style={{ width:"40%", background:"linear-gradient(90deg, #7BC7F0, #A4D9A1)" }} /></div>
        </div>
        <div className="rounded-[28px] p-5 flex-1" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 6px 0 #c8c0a8" }}>
          <div className="flex items-center gap-2 mb-3"><span style={{ fontSize:22 }}>📖</span><p className="font-bold text-xs uppercase tracking-widest" style={{ fontFamily:"Nunito", color:"#5C3D2E" }}>The Story</p></div>
          <Companion mood="think" size={80} />
          <p className="mt-3 leading-relaxed" style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:15 }}>You are at the playground with your friend <strong>Lily</strong>. She is sitting alone and looks sad.</p>
          <div className="mt-4 rounded-2xl px-4 py-3 flex items-start gap-2" style={{ background:"rgba(250,208,84,0.25)", border:"2px solid rgba(250,208,84,0.5)" }}><span style={{ fontSize:16 }}>💡</span><p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:13, lineHeight:1.5 }}>Think about what you'd want someone to do if <em>you</em> were feeling sad.</p></div>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-y-auto p-4 lg:pt-8 lg:pr-8 lg:pb-8">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button onClick={()=>goTo("dashboard")} className="btn-press rounded-full px-4 py-2 text-sm font-semibold" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 4px 0 #c8c0a8", fontFamily:"Fredoka", color:"#2D1B0E" }}>← Back</button>
          <div className="flex gap-2"><div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background:"#F8A4B8", boxShadow:"0 3px 0 #d9839a" }}><span style={{ fontSize:13 }}>❤️</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:14, fontWeight:700 }}>3</span></div><div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background:"#FAD054", boxShadow:"0 3px 0 #c8a020" }}><span style={{ fontSize:13 }}>⭐</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:14, fontWeight:700 }}>247</span></div></div>
        </div>
        <div className="lg:hidden rounded-[24px] p-4 mb-4 flex gap-3" style={{ background:"rgba(255,255,255,0.88)", boxShadow:"0 5px 0 #c8c0a8" }}><Companion mood="think" size={56} /><p style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:14, lineHeight:1.55 }}>Your friend <strong>Lily</strong> is sitting alone and looks sad. What do you do?</p></div>
        <div className="rounded-[28px] px-6 py-5 mb-6" style={{ background:"rgba(255,255,255,0.92)", boxShadow:"0 7px 0 #c8c0a8" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily:"Nunito", color:"#7BC7F0" }}>Your turn!</p>
          <h2 className="text-2xl lg:text-3xl font-semibold leading-tight" style={{ fontFamily:"Fredoka", color:"#2D1B0E" }}>What is the best thing to do? 🤔</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {OPTIONS.map(opt=>{ const isSel=selected===opt.id; return <button key={opt.id} onClick={()=>pick(opt)} disabled={!!selected} className="btn-press card-3d rounded-[28px] p-4 flex flex-col items-center gap-3 text-center" style={{ background:opt.color, boxShadow:isSel?`0 2px 0 ${opt.shadow}`:`0 8px 0 ${opt.shadow}, 0 14px 28px rgba(0,0,0,0.1)`, transform:isSel?"translateY(6px)":undefined, opacity:selected&&!isSel?0.55:1, border:isSel?`3px solid ${opt.shadow}`:"3px solid transparent", transition:"all 0.15s cubic-bezier(0.34,1.56,0.64,1)", minHeight:130 }}><div className="self-start rounded-full text-xs font-bold px-2.5 py-0.5" style={{ background:"rgba(255,255,255,0.7)", color:"#2D1B0E", fontFamily:"Fredoka", fontSize:14 }}>{opt.id}</div><div className="flex items-center justify-center rounded-2xl" style={{ width:60, height:60, background:"rgba(255,255,255,0.45)", fontSize:32 }}>{opt.emoji}</div><p style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:13, fontWeight:700, lineHeight:1.4 }}>{opt.text}</p></button>; })}
        </div>
      </div>
    </div>
  );
}