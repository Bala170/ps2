interface Props { mood?: "idle"|"celebrate"|"think"|"sad"; size?: number; }

export default function Companion({ mood="idle", size=100 }: Props) {
  const animClass = mood==="celebrate" ? "anim-celebrate" : mood==="think" ? "anim-think" : "anim-breathe";
  return (
    <div className={animClass} style={{ width:size, height:size, flexShrink:0 }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.12)" />
        <ellipse cx="50" cy="68" rx="28" ry="26" fill="#D4956A" />
        <ellipse cx="50" cy="72" rx="17" ry="14" fill="#F0C29A" />
        <circle cx="24" cy="30" r="12" fill="#C07A50" /><circle cx="24" cy="30" r="7" fill="#D4956A" />
        <circle cx="76" cy="30" r="12" fill="#C07A50" /><circle cx="76" cy="30" r="7" fill="#D4956A" />
        <ellipse cx="50" cy="42" rx="30" ry="28" fill="#D4956A" />
        {mood==="celebrate" ? (<><path d="M 36 38 Q 40 34 44 38" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M 56 38 Q 60 34 64 38" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" /></>) : (<><circle cx="40" cy="39" r="5.5" fill="#2D1B0E" /><circle cx="60" cy="39" r="5.5" fill="#2D1B0E" /><circle cx="42" cy="37" r="2" fill="white" /><circle cx="62" cy="37" r="2" fill="white" />{mood==="think" && <path d="M 36 32 Q 40 29 44 31" stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round" />}</>)}
        <ellipse cx="50" cy="48" rx="5" ry="3.5" fill="#2D1B0E" />
        {mood==="celebrate" ? <path d="M 42 54 Q 50 62 58 54" stroke="#2D1B0E" strokeWidth="2.5" fill="#E8826A" strokeLinecap="round" /> : mood==="sad" ? <path d="M 42 56 Q 50 52 58 56" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" /> : <path d="M 42 54 Q 50 60 58 54" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
        <ellipse cx="32" cy="52" rx="8" ry="5" fill="rgba(248,164,184,0.55)" />
        <ellipse cx="68" cy="52" rx="8" ry="5" fill="rgba(248,164,184,0.55)" />
        <ellipse cx="23" cy="70" rx="7" ry="14" fill="#C07A50" transform="rotate(-20 23 70)" />
        <ellipse cx="77" cy="70" rx="7" ry="14" fill="#C07A50" transform="rotate(20 77 70)" />
        <ellipse cx="17" cy="79" rx="8" ry="6" fill="#D4956A" transform="rotate(-20 17 79)" />
        <ellipse cx="83" cy="79" rx="8" ry="6" fill="#D4956A" transform="rotate(20 83 79)" />
        <ellipse cx="38" cy="90" rx="9" ry="7" fill="#C07A50" />
        <ellipse cx="62" cy="90" rx="9" ry="7" fill="#C07A50" />
        {mood==="celebrate" && <g transform="translate(42,58)"><polygon points="0,0 8,4 0,8" fill="#F8A4B8" /><polygon points="16,0 8,4 16,8" fill="#F8A4B8" /><circle cx="8" cy="4" r="3" fill="#FAD054" /></g>}
      </svg>
    </div>
  );
}