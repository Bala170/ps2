import { useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import Companion from "../components/Companion";
import type { Screen, ChildProfile } from "../App";

const INTERESTS = [
  { label:"Trains", emoji:"🚂", color:"#7BC7F0", shadow:"#5aaad0" },
  { label:"Dinosaurs", emoji:"🦕", color:"#A4D9A1", shadow:"#7ab877" },
  { label:"Space", emoji:"🚀", color:"#C4B5F4", shadow:"#9b87d4" },
  { label:"Animals", emoji:"🦁", color:"#FAD054", shadow:"#c8a020" },
  { label:"Drawing", emoji:"🎨", color:"#F8A4B8", shadow:"#d9839a" },
];

const SKILLS = [
  { label:"Sharing", emoji:"🤝", desc:"Learning to share with others" },
  { label:"Expressing Feelings", emoji:"💬", desc:"Saying how you feel inside" },
  { label:"Making Friends", emoji:"👫", desc:"Meeting and playing with new friends" },
  { label:"Asking for Help", emoji:"🙋", desc:"It's okay to ask when you need help!" },
  { label:"Taking Turns", emoji:"🔄", desc:"Waiting for your turn patiently" },
  { label:"Being Patient", emoji:"⏳", desc:"Good things come to those who wait" },
];

interface Props { goTo: (s: Screen) => void; onComplete: (p: ChildProfile) => void; }

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [interests, setInterests] = useState<string[]>([]);
  const [skill, setSkill] = useState("");

  const toggle = (label: string) =>
    setInterests(p => p.includes(label) ? p.filter(i => i !== label) : p.length < 3 ? [...p, label] : p);

  const canNext = [name.trim().length > 0, interests.length > 0, skill !== ""][step];
  const companionMood = step === 2 && skill ? "celebrate" : step === 0 ? "idle" : "think";
  const bubbleText = [
    name ? `Hi ${name}! 👋 I'm Benny!` : "What's your name? I'm Benny! 🐻",
    interests.length === 0 ? "Pick what you love!" : interests.length < 3 ? "Pick more! Or let's go →" : "Amazing picks! 🎉",
    skill ? `Let's learn ${skill}! 🌟` : "What shall we practice today?",
  ][step];

  return (
    <div className="w-full h-full relative flex overflow-hidden">
      <AnimatedBackground />
      <div className="hidden lg:flex flex-col items-center justify-center relative z-10 overflow-y-auto" style={{ width:380, flexShrink:0 }}>
        <div className="rounded-[32px] p-8 flex flex-col items-center gap-5 shadow-clay" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(12px)", maxWidth:300 }}>
          <Companion mood={companionMood} size={130} />
          <div className="relative w-full">
            <div className="rounded-[20px] px-5 py-4 text-center shadow-clay-white" style={{ background:"#FFFFFF", fontFamily:"Fredoka", color:"#3D2C1E", fontSize:17, fontWeight:500, lineHeight:1.4 }}>{bubbleText}</div>
            <div className="absolute left-1/2 -top-3" style={{ transform:"translateX(-50%)", width:0, height:0, borderLeft:"10px solid transparent", borderRight:"10px solid transparent", borderBottom:"12px solid #FFFFFF" }} />
          </div>
          <div className="flex gap-3">
            {["👤 You","❤️ Interests","🎯 Skills"].map((label,i) => (
              <div key={i} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => i < step && setStep(i)}>
                <div className="rounded-full flex items-center justify-center font-bold text-sm transition-all" style={{ width:30, height:30, background:i<step?"#A4D9A1":i===step?"#7BC7F0":"#EDE9DC", color:i<=step?"#1A4A18":"#8A8070", boxShadow:i===step?"0 4px 0 #5aaad0":i<step?"0 3px 0 #7ab877":"0 3px 0 #c8c0a8", fontFamily:"Fredoka", fontSize:13 }}>{i<step?"✓":i+1}</div>
                <span style={{ fontSize:10, fontFamily:"Nunito", color:"#6B5240", fontWeight:600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center relative z-10 overflow-y-auto py-6 px-4 lg:px-8">
        <div className="flex-1 min-h-0 flex items-center justify-center w-full">
        <div className="w-full" style={{ maxWidth:480 }}>
          <div className="lg:hidden flex flex-col items-center mb-5">
            <Companion mood={companionMood} size={90} />
            <div className="mt-2 rounded-2xl px-4 py-2 shadow-clay-white text-center" style={{ background:"#FFFFFF", fontFamily:"Fredoka", color:"#3D2C1E", fontSize:15, maxWidth:280 }}>{bubbleText}</div>
          </div>
          <div className="mb-5">
            <h1 className="text-3xl lg:text-4xl font-semibold" style={{ fontFamily:"Fredoka", color:"#2D1B0E" }}>{["Tell us about you!","What do you love?","Choose your first skill"][step]}</h1>
            <p className="mt-1 text-base" style={{ fontFamily:"Nunito", color:"#5C3D2E" }}>{["Step 1 of 3 · Let's get to know you","Step 2 of 3 · Pick up to 3 favourites","Step 3 of 3 · We'll practice this together"][step]}</p>
          </div>
          {step === 0 && (
            <div className="space-y-4 anim-fade-up">
              <div className="rounded-[28px] p-5 shadow-clay-white" style={{ background:"#FFFFFF" }}>
                <label className="block mb-2 font-bold" style={{ fontFamily:"Fredoka", color:"#5C3D2E", fontSize:17 }}>What's your name? 😊</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Type your name…" className="w-full rounded-2xl px-4 py-3 outline-none transition-all" style={{ fontFamily:"Fredoka", fontSize:22, color:"#2D1B0E", background:"#FAF8F0", border:"3px solid #EDE9DC" }} onFocus={e=>(e.target.style.borderColor="#7BC7F0")} onBlur={e=>(e.target.style.borderColor="#EDE9DC")} />
              </div>
              <div className="rounded-[28px] p-5 shadow-clay-honey" style={{ background:"#FAD054" }}>
                <p className="mb-4 font-bold" style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:17 }}>How old are you? 🎂</p>
                <div className="flex items-center justify-center gap-5">
                  <button onClick={()=>setAge(a=>Math.max(3,a-1))} className="btn-press flex items-center justify-center rounded-full text-3xl font-bold shadow-clay" style={{ width:56, height:56, background:"#FFFFFF", fontFamily:"Fredoka", color:"#2D1B0E" }}>−</button>
                  <div className="relative flex items-center overflow-hidden" style={{ width:180, height:72, borderRadius:20, background:"rgba(255,255,255,0.55)", border:"3px solid rgba(255,255,255,0.7)" }}>
                    <div className="absolute inset-y-0 left-0 w-10" style={{ background:"linear-gradient(90deg, rgba(250,208,84,0.8), transparent)", zIndex:2 }} />
                    <div className="absolute inset-y-0 right-0 w-10" style={{ background:"linear-gradient(270deg, rgba(250,208,84,0.8), transparent)", zIndex:2 }} />
                    <div className="flex items-center justify-center w-full gap-2" style={{ zIndex:1 }}>
                      {[-2,-1,0,1,2].map(off=>{ const v=age+off; const isCtr=off===0; if(v<3||v>18) return <div key={off} style={{ width:32 }} />; return <div key={off} className="flex items-center justify-center" style={{ width:32, height:56, fontFamily:"Fredoka", fontSize:isCtr?36:20, fontWeight:isCtr?700:500, color:isCtr?"#2D1B0E":"rgba(45,27,14,0.4)", transition:"all 0.2s ease" }}>{v}</div>; })}
                    </div>
                  </div>
                  <button onClick={()=>setAge(a=>Math.min(18,a+1))} className="btn-press flex items-center justify-center rounded-full text-3xl font-bold shadow-clay" style={{ width:56, height:56, background:"#FFFFFF", fontFamily:"Fredoka", color:"#2D1B0E" }}>+</button>
                </div>
                <p className="text-center mt-3 text-sm font-semibold" style={{ fontFamily:"Nunito", color:"rgba(45,27,14,0.6)" }}>years old</p>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 anim-fade-up">
              {INTERESTS.map(({label,emoji,color,shadow})=>{ const sel=interests.includes(label); return <button key={label} onClick={()=>toggle(label)} className="btn-press card-3d rounded-[28px] p-5 flex flex-col items-center gap-3" style={{ background:sel?color:"#FFFFFF", boxShadow:sel?`0 8px 0 ${shadow}`:"0 8px 0 #c8c0a8", border:sel?`3px solid ${shadow}`:"3px solid transparent", transform:sel?"translateY(4px)":undefined }}><span style={{ fontSize:48, lineHeight:1 }}>{emoji}</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:18, fontWeight:600 }}>{label}</span>{sel&&<div className="rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ width:24, height:24, background:"#2D1B0E" }}>✓</div>}</button>; })}
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-3 anim-fade-up">
              {SKILLS.map(({label,emoji,desc})=>{ const sel=skill===label; return <button key={label} onClick={()=>setSkill(label)} className="btn-press rounded-[24px] px-5 py-4 flex items-center gap-4 text-left transition-all" style={{ background:sel?"#7BC7F0":"#FFFFFF", boxShadow:sel?"0 7px 0 #5aaad0":"0 6px 0 #c8c0a8", border:sel?"3px solid #5aaad0":"3px solid transparent" }}><span style={{ fontSize:36, flexShrink:0 }}>{emoji}</span><div><p style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:19, fontWeight:600 }}>{label}</p><p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:13 }}>{desc}</p></div>{sel&&<span className="ml-auto text-2xl">✅</span>}</button>; })}
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={()=>{ if(step<2) setStep(s=>s+1); else onComplete({name,age,interests,skill}); }} disabled={!canNext} className="btn-press w-full rounded-full py-5 font-semibold" style={{ fontFamily:"Fredoka", background:canNext?"#A4D9A1":"#D8D0BC", color:canNext?"#1A4A18":"#8A8070", boxShadow:canNext?"0 8px 0 #7ab877":"0 5px 0 #b0a890", fontSize:22, cursor:canNext?"pointer":"not-allowed" }}>{step===2?"🎮  Let's Play!":"Next  →"}</button>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} className="text-center text-base font-semibold" style={{ fontFamily:"Nunito", color:"#5C3D2E" }}>← Go back</button>}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}