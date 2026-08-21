import { useEffect, useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import Companion from "../components/Companion";
import type { Screen, ChildProfile } from "../App";
import { createScenario, type Scenario } from "../lib/api";

const OPTION_STYLES = [
  { emoji:"💬", color:"#7BC7F0", shadow:"#5aaad0" },
  { emoji:"🤝", color:"#FAD054", shadow:"#c8a020" },
  { emoji:"🚶", color:"#C4B5F4", shadow:"#9b87d4" },
  { emoji:"🙌", color:"#A4D9A1", shadow:"#7ab877" },
];

interface Props { goTo:(s:Screen)=>void; profile:ChildProfile; onAnswer:(correct:boolean)=>void; }

export default function LessonScreen({ goTo, profile, onAnswer }: Props) {
  const [selected, setSelected] = useState<string|null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScenario = () => {
    setIsLoading(true);
    setError(null);
    setSelected(null);
    createScenario({
      child_id: profile.name.toLowerCase().replace(/\s+/g, "-") || "child",
      age: profile.age,
      interest: profile.interests.join(", "),
      skill_level: 2,
      target_skill: profile.skill,
      difficulty: 1,
    })
      .then(setScenario)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadScenario();
  }, [profile.age, profile.interests, profile.name, profile.skill]);

  const pick = (optionId: string) => {
    if (selected || !scenario) return;
    setSelected(optionId);
    setTimeout(() => onAnswer(optionId === scenario.best_answer), 350);
  };
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
          <p className="mt-3 leading-relaxed" style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:15 }}>
            {isLoading ? "Benny is making a special story for you..." : scenario?.context || "Your story will appear here."}
          </p>
          <div className="mt-4 rounded-2xl px-4 py-3 flex items-start gap-2" style={{ background:"rgba(250,208,84,0.25)", border:"2px solid rgba(250,208,84,0.5)" }}><span style={{ fontSize:16 }}>💡</span><p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:13, lineHeight:1.5 }}>{scenario?.image_alt || "Look at the picture and take your time."}</p></div>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-y-auto p-4 lg:pt-8 lg:pr-8 lg:pb-8">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button onClick={()=>goTo("dashboard")} className="btn-press rounded-full px-4 py-2 text-sm font-semibold" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 4px 0 #c8c0a8", fontFamily:"Fredoka", color:"#2D1B0E" }}>← Back</button>
          <div className="flex gap-2"><div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background:"#F8A4B8", boxShadow:"0 3px 0 #d9839a" }}><span style={{ fontSize:13 }}>❤️</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:14, fontWeight:700 }}>3</span></div><div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background:"#FAD054", boxShadow:"0 3px 0 #c8a020" }}><span style={{ fontSize:13 }}>⭐</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:14, fontWeight:700 }}>247</span></div></div>
        </div>
        <div className="lg:hidden rounded-[24px] p-4 mb-4 flex gap-3" style={{ background:"rgba(255,255,255,0.88)", boxShadow:"0 5px 0 #c8c0a8" }}><Companion mood="think" size={56} /><p style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:14, lineHeight:1.55 }}>{isLoading ? "Benny is making your story..." : scenario?.context || "Your story is ready!"}</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="rounded-[28px] p-4 lg:p-5 flex flex-col items-center lg:mt-8" style={{ background:"rgba(255,255,255,0.9)", boxShadow:"0 7px 0 #c8c0a8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily:"Nunito", color:"#7BC7F0" }}>Look at the picture</p>
              <span style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:12 }}>Tap the stars</span>
            </div>
            {scenario?.image_url ? (
              <div className="relative overflow-hidden rounded-2xl w-full max-w-[420px]" style={{ aspectRatio:"4 / 3", background:"#dff2ff", border:"3px solid #EDE9DC" }}>
                <img src={scenario.image_url} alt={scenario.image_alt || "A picture for this story"} className="w-full h-full object-cover" />
                {scenario.hotspots.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    type="button"
                    title={hotspot.meaning}
                    aria-label={`Explore ${hotspot.label}`}
                    className="absolute flex items-center justify-center rounded-full btn-press"
                    style={{ left:`${hotspot.x}%`, top:`${hotspot.y}%`, width:42, height:42, transform:"translate(-50%, -50%)", background:"#FFFFFF", border:"3px solid #F8A4B8", boxShadow:"0 0 0 6px rgba(248,164,184,0.35)", fontSize:21 }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl text-center w-full max-w-[420px]" style={{ aspectRatio:"4 / 3", background:"rgba(123,199,240,0.2)", border:"3px dashed #7BC7F0" }}>
                <p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:14 }}>Your picture is getting ready...</p>
              </div>
            )}
            <p className="mt-2 max-w-[420px] text-center" style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:13, lineHeight:1.45 }}>{scenario?.image_alt || "Look closely and find the important things."}</p>
          </div>
          <div>
            <div className="rounded-[28px] px-6 py-5 mb-5" style={{ background:"rgba(255,255,255,0.92)", boxShadow:"0 7px 0 #c8c0a8" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily:"Nunito", color:"#7BC7F0" }}>Your turn!</p>
              <h2 className="text-xl lg:text-2xl font-normal leading-snug" style={{ fontFamily:"Fredoka", color:"#2D1B0E" }}>{isLoading ? "Get ready..." : scenario?.question || "What would you choose? 🤔"}</h2>
              {error && <p className="mt-3 rounded-2xl px-4 py-3" style={{ background:"#FFF1F0", color:"#9B3E36", fontFamily:"Nunito", fontSize:14 }}>{error}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {scenario && Object.entries(scenario.options).map(([id, text], index)=>{ const isSel=selected===id; const style=OPTION_STYLES[index % OPTION_STYLES.length]; return <button key={id} onClick={()=>pick(id)} disabled={!!selected || isLoading} className="btn-press card-3d rounded-[28px] p-4 flex flex-col items-center gap-3 text-center" style={{ background:style.color, boxShadow:isSel?`0 2px 0 ${style.shadow}`:`0 8px 0 ${style.shadow}, 0 14px 28px rgba(0,0,0,0.1)`, transform:isSel?"translateY(6px)":undefined, opacity:selected&&!isSel?0.55:1, border:isSel?`3px solid ${style.shadow}`:"3px solid transparent", transition:"all 0.15s cubic-bezier(0.34,1.56,0.64,1)", minHeight:130 }}><div className="self-start rounded-full text-xs font-bold px-2.5 py-0.5" style={{ background:"rgba(255,255,255,0.7)", color:"#2D1B0E", fontFamily:"Fredoka", fontSize:14 }}>{id}</div><div className="flex items-center justify-center rounded-2xl" style={{ width:60, height:60, background:"rgba(255,255,255,0.45)", fontSize:32 }}>{style.emoji}</div><p style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:13, fontWeight:700, lineHeight:1.4 }}>{text}</p></button>; })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}