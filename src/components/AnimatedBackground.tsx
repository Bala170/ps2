import { memo } from "react";

const Cloud = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute pointer-events-none select-none" style={style}>
    <svg viewBox="0 0 180 80" fill="none">
      <ellipse cx="90" cy="55" rx="80" ry="28" fill="white" fillOpacity="0.88" />
      <ellipse cx="60" cy="45" rx="40" ry="28" fill="white" fillOpacity="0.88" />
      <ellipse cx="110" cy="42" rx="35" ry="25" fill="white" fillOpacity="0.88" />
      <ellipse cx="90" cy="38" rx="50" ry="30" fill="white" fillOpacity="0.9" />
    </svg>
  </div>
);

const Star = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => (
  <div className="absolute pointer-events-none" style={{ left:`${x}%`, top:`${y}%`, width:size, height:size, animation:`star-twinkle ${2+delay}s ease-in-out ${delay}s infinite` }}>
    <svg viewBox="0 0 24 24" fill="#FAD054"><polygon points="12,2 14.8,9.2 22.6,9.2 16.3,13.8 18.7,21.4 12,16.8 5.3,21.4 7.7,13.8 1.4,9.2 9.2,9.2" /></svg>
  </div>
);

const Tree = ({ x, variant }: { x: number; variant?: "left"|"right" }) => (
  <div className="absolute bottom-0 pointer-events-none select-none" style={{ left:`${x}%`, transform:variant==="right"?"scaleX(-1)":"none", animation:`leaf-sway ${3+x*0.05}s ease-in-out infinite`, transformOrigin:"bottom center" }}>
    <svg width="56" height="90" viewBox="0 0 56 90" fill="none">
      <rect x="24" y="58" width="8" height="32" rx="4" fill="#8B6340" />
      <ellipse cx="28" cy="44" rx="24" ry="30" fill="#6DBE6A" />
      <ellipse cx="28" cy="36" rx="18" ry="24" fill="#7DCC7A" />
      <ellipse cx="28" cy="28" rx="13" ry="18" fill="#8FD98C" />
    </svg>
  </div>
);

const Sun = () => (
  <div className="absolute top-6 right-10 pointer-events-none select-none" style={{ width:64, height:64 }}>
    <div className="absolute inset-0" style={{ animation:"sun-rays 20s linear infinite" }}>
      {[0,45,90,135].map(a => <div key={a} className="absolute" style={{ top:"50%", left:"50%", width:2, height:34, background:"rgba(250,208,84,0.5)", transformOrigin:"top center", transform:`rotate(${a}deg) translateX(-50%)`, borderRadius:99 }} />)}
    </div>
    <svg viewBox="0 0 64 64" className="absolute inset-0">
      <circle cx="32" cy="32" r="22" fill="#FAD054" />
      <circle cx="32" cy="32" r="18" fill="#FFE082" />
      <circle cx="26" cy="29" r="3" fill="#E6A800" />
      <circle cx="38" cy="29" r="3" fill="#E6A800" />
      <path d="M 24 38 Q 32 44 40 38" stroke="#E6A800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const Bird = ({ delay }: { delay: number }) => (
  <div className="absolute pointer-events-none" style={{ top:`${12+delay*7}%`, left:"-60px", animation:`bird-glide ${18+delay*4}s linear ${delay*5}s infinite` }}>
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
      <path d="M16 10 Q8 2 0 6" stroke="#5C7A9E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M16 10 Q24 2 32 6" stroke="#5C7A9E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const Bubble = ({ x, delay }: { x: number; delay: number }) => (
  <div className="absolute bottom-8 rounded-full pointer-events-none" style={{ left:`${x}%`, width:12+delay*4, height:12+delay*4, background:"rgba(123,199,240,0.25)", border:"2px solid rgba(123,199,240,0.4)", animation:`bubble-rise ${3+delay}s ease-in ${delay*1.3}s infinite` }} />
);

interface Props { variant?: "sky"|"sunset"|"night"; showTrees?: boolean; }

export default memo(function AnimatedBackground({ variant="sky", showTrees=true }: Props) {
  const gradients = {
    sky: "linear-gradient(180deg, #b8e0f8 0%, #d4eefc 30%, #dff5d8 70%, #e8f5e3 100%)",
    sunset: "linear-gradient(180deg, #ffd6a5 0%, #ffb380 30%, #d4eefc 70%, #dff5d8 100%)",
    night: "linear-gradient(180deg, #1a2744 0%, #263657 40%, #3a5a8c 80%, #2d5a3a 100%)",
  };
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: gradients[variant] }}>
      <Sun />
      <Cloud style={{ top:"8%",  width:180, animation:"cloud-drift-1 55s linear 0s infinite" }} />
      <Cloud style={{ top:"18%", width:140, animation:"cloud-drift-2 70s linear 12s infinite", opacity:0.85 }} />
      <Cloud style={{ top:"6%",  width:220, animation:"cloud-drift-3 90s linear 25s infinite", opacity:0.7 }} />
      <Cloud style={{ top:"22%", width:120, animation:"cloud-drift-1 48s linear 38s infinite", opacity:0.6 }} />
      <Bird delay={0} /><Bird delay={2} /><Bird delay={4.5} />
      {[{x:15,y:5,s:14,d:0.3},{x:35,y:8,s:10,d:0.8},{x:60,y:4,s:12,d:1.5},{x:78,y:9,s:9,d:0.5},{x:48,y:14,s:11,d:1.2},{x:88,y:5,s:13,d:2.0}].map((s,i)=><Star key={i} x={s.x} y={s.y} size={s.s} delay={s.d} />)}
      {[8,22,38,55,72,87].map((x,i)=><Bubble key={i} x={x} delay={i*0.7} />)}
      <div className="absolute bottom-0 left-0 right-0" style={{ height:"38%", background:"linear-gradient(180deg, transparent 0%, rgba(180,224,160,0.35) 60%, rgba(160,210,140,0.55) 100%)" }} />
      {showTrees && (<><Tree x={2} variant="left" /><Tree x={8} /><Tree x={82} variant="right" /><Tree x={91} /><Tree x={96} variant="right" /></>)}
    </div>
  );
});