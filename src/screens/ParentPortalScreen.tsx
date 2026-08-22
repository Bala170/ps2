import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";
import type { Screen, ChildProfile } from "../App";
import { getTherapistRecommendation, listLearningSessions, type LearningSession, type TherapistRecommendation } from "../lib/api";
import { useLanguage } from "../lib/i18n";

interface Props { goTo:(s:Screen)=>void; profile:ChildProfile; }

const SKILL_BARS=[
  {skill:"Sharing",score:78,sessions:12,trend:"+6%"},
  {skill:"Expressions",score:55,sessions:8,trend:"+11%"},
  {skill:"Making Friends",score:40,sessions:5,trend:"+4%"},
  {skill:"Asking for Help",score:30,sessions:3,trend:"+3%"},
  {skill:"Taking Turns",score:65,sessions:9,trend:"+8%"},
];
const SKILL_COLORS:Record<string,string>={"Sharing":"#7BC7F0","Expressions":"#F8A4B8","Making Friends":"#FAD054","Asking for Help":"#C4B5F4","Taking Turns":"#A4D9A1"};
const WEEKLY=[{day:"Mon",pct:60},{day:"Tue",pct:80},{day:"Wed",pct:71},{day:"Thu",pct:50},{day:"Fri",pct:86},{day:"Sat",pct:80},{day:"Sun",pct:83}];
const SESSIONS=[{date:"Aug 19",skill:"Sharing",score:80,mins:12,status:"Completed"},{date:"Aug 18",skill:"Expressions",score:60,mins:8,status:"Completed"},{date:"Aug 17",skill:"Taking Turns",score:70,mins:10,status:"Completed"},{date:"Aug 15",skill:"Making Friends",score:45,mins:6,status:"Partial"},{date:"Aug 14",skill:"Asking for Help",score:33,mins:5,status:"Completed"}];
type Tab="overview"|"skills"|"sessions"|"settings";
const NAV=[{id:"overview" as Tab,icon:"📊",label:"Overview"},{id:"skills" as Tab,icon:"🎯",label:"Skills"},{id:"sessions" as Tab,icon:"📋",label:"Sessions"},{id:"settings" as Tab,icon:"⚙️",label:"Settings"}];

function StatCard({label,value,sub,color,icon}:{label:string;value:string;sub:string;color:string;icon:string}){
  return <div className="rounded-2xl p-5 flex flex-col gap-2" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}><div className="flex items-center justify-between"><p style={{fontFamily:"Inter",color:"#64748B",fontSize:13,fontWeight:500}}>{label}</p><div className="flex items-center justify-center rounded-xl text-xl" style={{width:38,height:38,background:color+"1A"}}>{icon}</div></div><p className="text-3xl font-bold" style={{fontFamily:"Inter",color:"#0F172A"}}>{value}</p><p style={{fontFamily:"Inter",color:"#64748B",fontSize:12}}>{sub}</p></div>;
}
function CircleGauge({value,size=100,color="#4F7FF5"}:{value:number;size?:number;color?:string}){
  const r=(size-12)/2,circ=2*Math.PI*r,dash=(value/100)*circ;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth="8"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/><text x={size/2} y={size/2+6} textAnchor="middle" style={{fontFamily:"Inter",fontSize:size*0.2,fontWeight:700,fill:"#0F172A"}}>{value}%</text></svg>;
}
function CTip({active,payload,label}:{active?:boolean;payload?:{name:string;value:number}[];label?:string}){
  if(!active||!payload?.length) return null;
  return <div className="rounded-xl px-4 py-3" style={{background:"#1B2E4B",boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}><p style={{fontFamily:"Inter",color:"#94A3B8",fontSize:11,marginBottom:6}}>{label}</p>{payload.map((p,i)=><p key={i} style={{fontFamily:"Inter",color:"#FFFFFF",fontSize:14,fontWeight:600}}>{p.name}: {p.value}%</p>)}</div>;
}

export default function ParentPortalScreen({ goTo, profile }: Props) {
  const { t } = useLanguage();
  const [tab,setTab]=useState<Tab>("overview");
  const [learningSessions,setLearningSessions]=useState<LearningSession[]>([]);
  const [replaySession,setReplaySession]=useState<LearningSession|null>(null);
  const [recommendation,setRecommendation]=useState<TherapistRecommendation|null>(null);
  const [recommendationLoading,setRecommendationLoading]=useState(true);

  useEffect(()=>{
    listLearningSessions(profile.name.toLowerCase().replace(/\s+/g, "-") || "child")
      .then(setLearningSessions)
      .catch(()=>setLearningSessions([]));
  },[profile.name,tab]);
  useEffect(()=>{
    setRecommendationLoading(true);
    getTherapistRecommendation(profile.name.toLowerCase().replace(/\s+/g, "-") || "child")
      .then(setRecommendation)
      .catch(()=>setRecommendation(null))
      .finally(()=>setRecommendationLoading(false));
  },[profile.name]);
  const visibleSessions = learningSessions.length > 0 ? learningSessions : SESSIONS.map((row, index) => ({
    session_id: `sample-${index}`,
    child_id: profile.name.toLowerCase().replace(/\s+/g, "-"),
    scenario_id: `sample-${index}`,
    skill: row.skill,
    difficulty: 1,
    score: row.score,
    recording_enabled: false,
    video_storage_path: null,
    video_url: null,
    started_at: new Date(`2025-08-${19 - index}`).toISOString(),
    completed_at: new Date(`2025-08-${19 - index}`).toISOString(),
  } satisfies LearningSession));
  return (
    <div className="w-full h-full flex overflow-hidden" style={{background:"#F1F5F9",fontFamily:"Inter,Nunito,sans-serif"}}>
      <div className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden" style={{width:240,background:"#1B2E4B"}}>
        <div className="flex items-center gap-3 px-4 pt-6 pb-5 border-b" style={{borderColor:"rgba(255,255,255,0.08)",minHeight:72}}>
          <div className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{width:36,height:36,background:"#7BC7F0"}}><span style={{fontSize:18}}>🌟</span></div>
          <div><p style={{fontFamily:"Fredoka",color:"#FFFFFF",fontSize:17,fontWeight:600,lineHeight:1}}>ISE</p><p style={{color:"rgba(255,255,255,0.45)",fontSize:11}}>{t("Educators Portal")}</p></div>
        </div>
        <div className="mx-3 mt-4 mb-2 rounded-xl px-3 py-3 flex items-center gap-3" style={{background:"rgba(255,255,255,0.07)"}}>
          <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{width:32,height:32,background:"#A4D9A1"}}><span style={{fontSize:16}}>🧒</span></div>
          <div><p style={{color:"#FFFFFF",fontSize:14,fontWeight:600}}>{profile.name}</p><p style={{color:"rgba(255,255,255,0.45)",fontSize:11}}>{t("Age")} {profile.age} · {t("Week")} 3</p></div>
        </div>
        <nav className="flex-1 px-2 mt-2 flex flex-col gap-1">
          {NAV.map(item=><button key={item.id} onClick={()=>setTab(item.id)} className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left" style={{background:tab===item.id?"rgba(123,199,240,0.18)":"transparent",borderLeft:tab===item.id?"3px solid #7BC7F0":"3px solid transparent",color:tab===item.id?"#7BC7F0":"rgba(255,255,255,0.55)",fontSize:14,fontWeight:tab===item.id?600:400}}><span style={{fontSize:17,flexShrink:0}}>{item.icon}</span><span>{t(item.label)}</span></button>)}
        </nav>
        <div className="p-3 border-t" style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <button onClick={()=>goTo("dashboard")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all" style={{background:"rgba(164,217,161,0.15)",color:"#A4D9A1",fontSize:14,fontWeight:600}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(164,217,161,0.25)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(164,217,161,0.15)")}><span style={{fontSize:17,flexShrink:0}}>🎮</span><span>{t("Back")}</span></button>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{background:"#FFFFFF",borderBottom:"1px solid #E2E8F0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div><h1 style={{fontFamily:"Inter",color:"#0F172A",fontSize:20,fontWeight:700}}>{t(NAV.find(n=>n.id===tab)?.label || "Overview")}</h1><p style={{color:"#64748B",fontSize:13}}>{t("Last updated")}: {t("Today")}, 2:41 PM</p></div>
          <div className="flex items-center gap-3">
            <button className="relative flex items-center justify-center rounded-xl" style={{width:40,height:40,background:"#F8FAFC",border:"1px solid #E2E8F0"}}><span style={{fontSize:18}}>🔔</span><div className="absolute top-1.5 right-1.5 rounded-full" style={{width:8,height:8,background:"#F8A4B8",border:"2px solid #FFFFFF"}} /></button>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}><div className="flex items-center justify-center rounded-full" style={{width:28,height:28,background:"#7BC7F0"}}><span style={{fontSize:14}}>👩</span></div><span style={{fontSize:14,color:"#0F172A",fontWeight:500}}>Parent</span><span style={{fontSize:12,color:"#94A3B8"}}>▾</span></div>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {tab==="overview"&&(
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={t("Missions Completed")} value="14" sub={`↑ 3 ${t("this week")}`} color="#7BC7F0" icon="🚀" />
                <StatCard label={t("Avg. Success Rate")} value="72%" sub={`↑ 8% ${t("vs last week")}`} color="#A4D9A1" icon="✅" />
                <StatCard label={t("Total Stars Earned")} value="247" sub={t("Top 15% of peers")} color="#FAD054" icon="⭐" />
                <StatCard label={t("Focus Skill")} value={t(profile.skill.split(" ")[0])} sub={t(profile.skill)} color="#C4B5F4" icon="🎯" />
              </div>
              <div className="rounded-2xl p-5" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                <div className="flex items-center justify-between mb-4"><div><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700}}>{t("Learning Session Replays")}</p><p style={{fontFamily:"Inter",color:"#64748B",fontSize:12,marginTop:3}}>{t("Watch how")} {profile.name} {t("is practising over time.")}</p></div><button onClick={()=>setTab("sessions")} style={{fontFamily:"Inter",color:"#0369A1",fontSize:12,fontWeight:700}}>{t("View all")}</button></div>
                {learningSessions.filter((session)=>session.video_url).slice(0,3).map((session)=><div key={session.session_id} className="flex items-center gap-3 py-3" style={{borderTop:"1px solid #F1F5F9"}}><div className="flex items-center justify-center rounded-xl" style={{width:38,height:38,background:"#EFF6FF"}}>🎥</div><div className="flex-1"><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:13,fontWeight:600}}>{session.skill}</p><p style={{fontFamily:"Inter",color:"#64748B",fontSize:11}}>{new Date(session.started_at).toLocaleString()} · Score {session.score ?? "-"}%</p></div><button onClick={()=>{setReplaySession(session);setTab("sessions")}} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{background:"#EFF6FF",color:"#0369A1"}}>▶ Replay</button></div>)}
                {learningSessions.filter((session)=>session.video_url).length === 0 && <p style={{fontFamily:"Inter",color:"#94A3B8",fontSize:13}}>{t("No recordings yet. A replay will appear here after a recorded lesson.")}</p>}
              </div>
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl p-5" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                  <div className="flex items-center justify-between mb-4"><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700}}>{t("Weekly Performance")}</p><div className="rounded-lg px-3 py-1 text-xs font-semibold" style={{background:"#F0F9FF",color:"#0369A1"}}>{t("This Week")}</div></div>
                  <ResponsiveContainer width="100%" height={180}><BarChart data={WEEKLY} barSize={22} barCategoryGap="30%"><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/><XAxis dataKey="day" tick={{fontFamily:"Inter",fontSize:12,fill:"#94A3B8"}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:"Inter",fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false} unit="%" domain={[0,100]}/><Tooltip content={<CTip />} cursor={{fill:"rgba(79,127,245,0.05)"}}/><Bar dataKey="pct" radius={[6,6,0,0]} name="Score">{WEEKLY.map((e,i)=><Cell key={i} fill={e.pct>=80?"#A4D9A1":e.pct>=60?"#7BC7F0":"#FAD054"}/>)}</Bar></BarChart></ResponsiveContainer>
                </div>
                <div className="rounded-2xl p-5 flex flex-col gap-4" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                  <p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700}}>{t("At a Glance")}</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center"><CircleGauge value={72} size={96} color="#7BC7F0"/><p style={{fontFamily:"Inter",color:"#64748B",fontSize:12,marginTop:4}}>{t("Success Rate")}</p></div>
                    <div className="w-full border-t" style={{borderColor:"#F1F5F9"}}/>
                    <div className="flex flex-col items-center"><CircleGauge value={58} size={96} color="#A4D9A1"/><p style={{fontFamily:"Inter",color:"#64748B",fontSize:12,marginTop:4}}>{t("Overall Progress")}</p></div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl p-6" style={{background:"linear-gradient(135deg, #1B2E4B 0%, #2D4A72 100%)",boxShadow:"0 4px 16px rgba(27,46,75,0.3)"}}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center rounded-2xl" style={{width:48,height:48,background:"rgba(123,199,240,0.2)",border:"1px solid rgba(123,199,240,0.3)"}}><span style={{fontSize:22}}>🤖</span></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2"><p style={{fontFamily:"Inter",color:"#FFFFFF",fontSize:15,fontWeight:700}}>{t("Therapist-informed recommendation")}</p><span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{background:"rgba(164,217,161,0.25)",color:"#A4D9A1"}}>{t("Personalised")}</span></div>
                    {recommendationLoading && <p style={{fontFamily:"Inter",color:"rgba(255,255,255,0.75)",fontSize:14}}>{t("Preparing a recommendation...")}</p>}
                    {!recommendationLoading && recommendation && <>
                      <p style={{fontFamily:"Inter",color:"rgba(255,255,255,0.75)",fontSize:14,lineHeight:1.7}}>{t("Recommended support area")}: <strong style={{color:"#FAD054"}}>{t(recommendation.recommended_support_area)}</strong></p>
                      <div className="grid md:grid-cols-2 gap-3 mt-4">
                        <div className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}><p style={{color:"rgba(255,255,255,0.45)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t("Confidence")}</p><p style={{color:"#A4D9A1",fontSize:20,fontWeight:700,marginTop:2}}>{Math.round(recommendation.confidence * 100)}%</p></div>
                        <div className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}><p style={{color:"rgba(255,255,255,0.45)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t("Reason")}</p><p style={{color:"#FAD054",fontSize:13,fontWeight:700,marginTop:2}}>{recommendation.reason}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">{Object.entries(recommendation.key_indicators).slice(0, 4).map(([indicator, value]) => <span key={indicator} className="rounded-full px-3 py-1" style={{background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.8)",fontSize:11}}>{t(indicator)}: {value}</span>)}</div>
                      <p className="mt-3" style={{fontFamily:"Inter",color:"rgba(255,255,255,0.5)",fontSize:11}}>{recommendation.disclaimer}</p>
                    </>}
                    {!recommendationLoading && !recommendation && <p style={{fontFamily:"Inter",color:"rgba(255,255,255,0.75)",fontSize:14}}>{t("Complete a session to receive a personalised recommendation.")}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab==="skills"&&(
            <div className="space-y-5 max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                  <p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700,marginBottom:16}}>Skill Proficiency</p>
                  <ResponsiveContainer width="100%" height={240}><BarChart data={SKILL_BARS} layout="vertical" barSize={14}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false}/><XAxis type="number" domain={[0,100]} tick={{fontFamily:"Inter",fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false} unit="%"/><YAxis type="category" dataKey="skill" tick={{fontFamily:"Inter",fontSize:12,fill:"#0F172A"}} axisLine={false} tickLine={false} width={110}/><Tooltip content={<CTip/>} cursor={{fill:"rgba(79,127,245,0.05)"}}/><Bar dataKey="score" radius={[0,6,6,0]} name="Score">{SKILL_BARS.map(e=><Cell key={e.skill} fill={SKILL_COLORS[e.skill]??"#7BC7F0"}/>)}</Bar></BarChart></ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3">{SKILL_BARS.map(s=><div key={s.skill} className="rounded-xl px-4 py-3 flex items-center gap-4" style={{background:"#FFFFFF",border:"1px solid #E2E8F0",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}><div className="w-2 h-10 rounded-full flex-shrink-0" style={{background:SKILL_COLORS[s.skill]??"#7BC7F0"}}/><div className="flex-1"><div className="flex items-center justify-between"><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:14,fontWeight:600}}>{s.skill}</p><span style={{fontFamily:"Inter",color:"#10B981",fontSize:12,fontWeight:700}}>{s.trend}</span></div><div className="flex items-center gap-3 mt-1.5"><div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:"#F1F5F9"}}><div className="h-full rounded-full" style={{width:`${s.score}%`,background:SKILL_COLORS[s.skill]}}/></div><span style={{fontFamily:"Inter",color:"#64748B",fontSize:12,whiteSpace:"nowrap"}}>{s.score}% · {s.sessions} sessions</span></div></div></div>)}</div>
              </div>
              <div className="rounded-2xl p-5" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                <p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700,marginBottom:16}}>Daily Score Trend</p>
                <ResponsiveContainer width="100%" height={200}><LineChart data={WEEKLY}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/><XAxis dataKey="day" tick={{fontFamily:"Inter",fontSize:12,fill:"#94A3B8"}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:"Inter",fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false} unit="%" domain={[0,100]}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontFamily:"Inter",fontSize:12}}/><Line type="monotone" dataKey="pct" name="Score %" stroke="#7BC7F0" strokeWidth={3} dot={{r:5,fill:"#7BC7F0",strokeWidth:2,stroke:"#fff"}} activeDot={{r:7}}/></LineChart></ResponsiveContainer>
              </div>
            </div>
          )}
          {tab==="sessions"&&(
            <div className="max-w-5xl mx-auto space-y-5">
              {replaySession?.video_url && <div className="rounded-2xl p-5" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}><div className="flex items-center justify-between mb-3"><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700}}>Session Replay</p><button onClick={()=>setReplaySession(null)} style={{color:"#64748B",fontSize:13}}>Close</button></div><video controls className="w-full rounded-xl" src={replaySession.video_url} /></div>}
              <div className="rounded-2xl overflow-hidden" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                <div className="grid grid-cols-6 px-5 py-3" style={{background:"#F8FAFC",borderBottom:"1px solid #E2E8F0"}}>{["Date","Skill","Score","Duration","Status","Replay"].map(h=><p key={h} style={{fontFamily:"Inter",color:"#64748B",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</p>)}</div>
                {visibleSessions.map((row,i)=><div key={row.session_id} className="grid grid-cols-6 px-5 py-4 items-center" style={{borderBottom:i<visibleSessions.length-1?"1px solid #F1F5F9":"none"}}><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:14}}>{new Date(row.started_at).toLocaleDateString()}</p><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:14,fontWeight:500}}>{row.skill}</p><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:14}}>{row.score ?? "-"}%</p><p style={{fontFamily:"Inter",color:"#64748B",fontSize:14}}>Learning</p><span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit" style={{background:row.completed_at?"#DCFCE7":"#FEF3C7",color:row.completed_at?"#166534":"#92400E"}}>{row.completed_at?"Completed":"In progress"}</span>{row.video_url?<button onClick={()=>setReplaySession(row)} className="rounded-lg px-2.5 py-1 text-xs font-semibold" style={{background:"#EFF6FF",color:"#0369A1"}}>▶ Replay</button>:<span style={{fontFamily:"Inter",color:"#94A3B8",fontSize:12}}>No video</span>}</div>)}
              </div>
              <div className="flex justify-end"><button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold" style={{background:"#1B2E4B",color:"#FFFFFF"}} onMouseEnter={e=>(e.currentTarget.style.background="#2D4A72")} onMouseLeave={e=>(e.currentTarget.style.background="#1B2E4B")}>⬇ Export CSV</button></div>
            </div>
          )}
          {tab==="settings"&&(
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="rounded-2xl p-6" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                <p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700,marginBottom:16}}>Child Profile</p>
                <div className="grid sm:grid-cols-2 gap-4">{[{label:"Name",value:profile.name},{label:"Age",value:`${profile.age} years old`},{label:"Current Skill",value:profile.skill},{label:"Interests",value:profile.interests.join(", ")||"Not set"}].map(item=><div key={item.label}><label style={{fontFamily:"Inter",color:"#64748B",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{item.label}</label><div className="mt-1.5 rounded-xl px-4 py-2.5" style={{background:"#F8FAFC",border:"1px solid #E2E8F0",fontFamily:"Inter",color:"#0F172A",fontSize:14}}>{item.value}</div></div>)}</div>
              </div>
              <div className="rounded-2xl p-6" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                <p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700,marginBottom:16}}>Session Settings</p>
                <div className="space-y-4">{[{label:"Session Duration",options:["5 min","10 min","15 min","20 min"],current:"10 min"},{label:"Difficulty",options:["Beginner","Intermediate","Advanced"],current:"Beginner"},{label:"Daily Reminder",options:["Off","9:00 AM","3:00 PM","5:00 PM"],current:"3:00 PM"}].map(item=><div key={item.label} className="flex items-center justify-between"><p style={{fontFamily:"Inter",color:"#0F172A",fontSize:14,fontWeight:500}}>{item.label}</p><select defaultValue={item.current} className="rounded-xl px-3 py-2 text-sm outline-none" style={{background:"#F8FAFC",border:"1px solid #E2E8F0",fontFamily:"Inter",color:"#0F172A"}}>{item.options.map(o=><option key={o}>{o}</option>)}</select></div>)}</div>
              </div>
              <div className="rounded-2xl p-6" style={{background:"#FFFFFF",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",border:"1px solid #E2E8F0"}}>
                <p style={{fontFamily:"Inter",color:"#0F172A",fontSize:15,fontWeight:700,marginBottom:4}}>Change Target Skill</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">{["Sharing","Expressing Feelings","Making Friends","Asking for Help","Being Patient"].map(s=>{ const isActive=s===profile.skill; return <label key={s} className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer" style={{background:isActive?"#EFF6FF":"#F8FAFC",border:isActive?"1.5px solid #7BC7F0":"1.5px solid #E2E8F0"}}><input type="radio" name="skill" defaultChecked={isActive} style={{accentColor:"#7BC7F0"}}/><span style={{fontFamily:"Inter",color:"#0F172A",fontSize:14,fontWeight:isActive?600:400}}>{s}</span>{isActive&&<span className="ml-auto text-xs font-semibold" style={{color:"#0369A1"}}>Active</span>}</label>; })}</div>
              </div>
              <div className="flex gap-3 justify-end"><button className="rounded-xl px-6 py-2.5 text-sm font-semibold" style={{background:"#F1F5F9",color:"#0F172A",border:"1px solid #E2E8F0"}}>Cancel</button><button className="rounded-xl px-6 py-2.5 text-sm font-semibold" style={{background:"#1B2E4B",color:"#FFFFFF"}} onMouseEnter={e=>(e.currentTarget.style.background="#2D4A72")} onMouseLeave={e=>(e.currentTarget.style.background="#1B2E4B")}>Save Changes</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}