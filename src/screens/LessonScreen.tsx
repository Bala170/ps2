import { useEffect, useRef, useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import Companion from "../components/Companion";
import type { Screen, ChildProfile } from "../App";
import { completeLearningSession, createScenario, startLearningSession, uploadLearningSession, type LearningSession, type Scenario } from "../lib/api";
import { useLanguage } from "../lib/i18n";

const OPTION_STYLES = [
  { emoji:"💬", color:"#7BC7F0", shadow:"#5aaad0" },
  { emoji:"🤝", color:"#FAD054", shadow:"#c8a020" },
  { emoji:"🚶", color:"#C4B5F4", shadow:"#9b87d4" },
  { emoji:"🙌", color:"#A4D9A1", shadow:"#7ab877" },
];

interface Props { goTo:(s:Screen)=>void; profile:ChildProfile; onAnswer:(correct:boolean)=>void; }

export default function LessonScreen({ goTo, profile, onAnswer }: Props) {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState<string|null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingConsent, setRecordingConsent] = useState(() => localStorage.getItem("ise-recording-consent") === "true");
  const [isRecording, setIsRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [recordingMessage, setRecordingMessage] = useState<string | null>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingBlobRef = useRef<Blob | null>(null);
  const recordingUploadedRef = useRef(false);
  const sessionRef = useRef<LearningSession | null>(null);

  const fallbackScenario: Scenario = {
    scenario_id: `fallback-${profile.skill.toLowerCase().replace(/\s+/g, "-")}`,
    question: t("Your friend looks upset after losing a game. What could you do?"),
    context: t("Your friend is sitting quietly after losing a game and looks upset."),
    options: {
      A: t("Ask your friend how they feel and offer support."),
      B: t("Laugh at your friend."),
      C: t("Walk away without saying anything."),
      D: t("Tell everyone that your friend lost."),
    },
    best_answer: "A",
    explanation: t("Asking how your friend feels and offering support shows empathy."),
    difficulty: 1,
    target_skill: profile.skill,
    image_url: null,
    image_alt: t("Look closely and notice your friend's feelings."),
    hotspots: [],
  };

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
      language,
    })
      .then(setScenario)
      .catch((requestError: Error) => {
        setScenario(fallbackScenario);
        setError(`${t("Offline practice mode")}: ${requestError.message}`);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadScenario();
    return () => { void saveRecordingOnExit(); };
  }, [language, profile.age, profile.interests, profile.name, profile.skill]);

  const startRecording = async () => {
    if (!recordingConsent || !scenario || isStartingRecording || isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingMessage(t("This browser does not support recording."));
      return;
    }
    try {
      setIsStartingRecording(true);
      setRecordingMessage(null);
      // Privacy: camera access starts only after explicit caregiver consent and a button click.
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      sessionRef.current = await startLearningSession({
        child_id: profile.name.toLowerCase().replace(/\s+/g, "-") || "child",
        scenario_id: scenario.scenario_id,
        skill: profile.skill,
        difficulty: scenario.difficulty,
        recording_enabled: true,
      });
      chunksRef.current = [];
      recordingBlobRef.current = null;
      recordingUploadedRef.current = false;
      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      stopCamera();
      const message = error instanceof DOMException && error.name === "NotAllowedError"
        ? t("Recording permission was denied. Please allow camera and microphone access.")
        : t("Recording could not start. Please check your camera and microphone.");
      setRecordingMessage(message);
    } finally {
      setIsStartingRecording(false);
    }
  };

  useEffect(() => {
    if (!isRecording || !cameraRef.current || !streamRef.current) return;
    cameraRef.current.srcObject = streamRef.current;
    cameraRef.current.play().catch(() => setRecordingMessage("Camera is ready, but the preview could not start."));
  }, [isRecording]);

  useEffect(() => {
    if (scenario && recordingConsent && !isRecording && !isStartingRecording) {
      void startRecording();
    }
  }, [scenario, recordingConsent]);

  const stopCamera = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (cameraRef.current) cameraRef.current.srcObject = null;
    setIsRecording(false);
  };

  const stopRecorderAndGetBlob = async (): Promise<Blob | null> => {
    if (recordingBlobRef.current) return recordingBlobRef.current;
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      if (!chunksRef.current.length) return null;
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      recordingBlobRef.current = blob;
      return blob;
    }
    const recording = new Promise<Blob>((resolve) => {
      recorder.addEventListener("stop", () => resolve(new Blob(chunksRef.current, { type: "video/webm" })), { once: true });
    });
    recorder.stop();
    const blob = await recording;
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (cameraRef.current) cameraRef.current.srcObject = null;
    setIsRecording(false);
    recordingBlobRef.current = blob;
    return blob;
  };

  const stopRecording = async () => {
    const blob = await stopRecorderAndGetBlob();
    setRecordingMessage(blob ? t("Recording saved. Submit your answer to upload it.") : t("No recording data was captured."));
  };

  const saveRecordingOnExit = async () => {
    const session = sessionRef.current;
    if (!session?.recording_enabled || recordingUploadedRef.current) return;
    const blob = await stopRecorderAndGetBlob();
    if (!blob) return;
    try {
      await uploadLearningSession(session.session_id, blob);
      recordingUploadedRef.current = true;
    } catch {
      // The answer flow will surface upload errors while the child can continue.
    }
  };

  const finishRecording = async (score: number) => {
    if (!scenario) return;
    if (!sessionRef.current) {
      sessionRef.current = await startLearningSession({
        child_id: profile.name.toLowerCase().replace(/\s+/g, "-") || "child",
        scenario_id: scenario.scenario_id,
        skill: profile.skill,
        difficulty: scenario.difficulty,
        recording_enabled: false,
      });
    }
    const recordingBlob = sessionRef.current.recording_enabled ? await stopRecorderAndGetBlob() : null;
    if (recordingBlob) {
      await uploadLearningSession(sessionRef.current.session_id, recordingBlob);
      recordingUploadedRef.current = true;
    }
    await completeLearningSession(sessionRef.current.session_id, score);
    stopCamera();
  };

  const pick = async (optionId: string) => {
    if (selected || !scenario) return;
    setSelected(optionId);
    const score = optionId === scenario.best_answer ? 100 : 0;
    try {
      await finishRecording(score);
    } catch {
      setRecordingMessage("Your answer was saved. The replay could not be saved this time.");
    }
    setTimeout(() => onAnswer(score === 100), 350);
  };
  return (
    <div className="w-full h-full relative flex flex-col lg:flex-row overflow-hidden">
      <AnimatedBackground showTrees={false} />
      <div className="hidden lg:flex flex-col relative z-10 overflow-y-auto" style={{ width:360, flexShrink:0, padding:"32px 24px" }}>
        <button onClick={()=>goTo("dashboard")} className="btn-press self-start rounded-full px-4 py-2 mb-6 text-sm font-semibold" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 4px 0 #c8c0a8", fontFamily:"Fredoka", color:"#2D1B0E" }}>← {t("Back")}</button>
        <div className="rounded-[28px] p-6 mb-5" style={{ background:"rgba(255,255,255,0.92)", boxShadow:"0 8px 0 #c8c0a8, 0 16px 32px rgba(0,0,0,0.09)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center rounded-2xl text-3xl" style={{ width:56, height:56, background:"#FAF8F0", border:"3px solid #EDE9DC" }}>💬</div>
            <div><p style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:19, fontWeight:600 }}>{profile.skill}</p><div className="flex items-center gap-2 mt-0.5"><div className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background:"#7BC7F0", color:"#FFFFFF", fontFamily:"Fredoka" }}>Level 1</div><span style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:12 }}>Question 2/5</span></div></div>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background:"#EDE9DC" }}><div className="h-full rounded-full" style={{ width:"40%", background:"linear-gradient(90deg, #7BC7F0, #A4D9A1)" }} /></div>
        </div>
        <div className="rounded-[28px] p-5 flex-1" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 6px 0 #c8c0a8" }}>
          <div className="flex items-center gap-2 mb-3"><span style={{ fontSize:22 }}>📖</span><p className="font-bold text-xs uppercase tracking-widest" style={{ fontFamily:"Nunito", color:"#5C3D2E" }}>{t("The Story")}</p></div>
          <p className="mt-3 leading-relaxed" style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:15 }}>
            {isLoading ? t("Benny is making a special story for you...") : scenario?.context || t("Your story will appear here.")}
          </p>
          <div className="mt-4 rounded-2xl px-4 py-3 flex items-start gap-2" style={{ background:"rgba(250,208,84,0.25)", border:"2px solid rgba(250,208,84,0.5)" }}><span style={{ fontSize:16 }}>💡</span><p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:13, lineHeight:1.5 }}>{scenario?.image_alt || "Look at the picture and take your time."}</p></div>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-y-auto p-4 lg:overflow-hidden lg:pt-4 lg:pr-6 lg:pb-4">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button onClick={()=>goTo("dashboard")} className="btn-press rounded-full px-4 py-2 text-sm font-semibold" style={{ background:"rgba(255,255,255,0.85)", boxShadow:"0 4px 0 #c8c0a8", fontFamily:"Fredoka", color:"#2D1B0E" }}>← {t("Back")}</button>
          <div className="flex gap-2"><div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background:"#F8A4B8", boxShadow:"0 3px 0 #d9839a" }}><span style={{ fontSize:13 }}>❤️</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:14, fontWeight:700 }}>3</span></div><div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background:"#FAD054", boxShadow:"0 3px 0 #c8a020" }}><span style={{ fontSize:13 }}>⭐</span><span style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:14, fontWeight:700 }}>247</span></div></div>
        </div>
        <div className="lg:hidden rounded-[24px] p-4 mb-4 flex gap-3" style={{ background:"rgba(255,255,255,0.88)", boxShadow:"0 5px 0 #c8c0a8" }}><Companion mood="think" size={56} /><p style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:14, lineHeight:1.55 }}>{isLoading ? "Benny is making your story..." : scenario?.context || "Your story is ready!"}</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start h-full">
          <div className="rounded-[28px] p-3 lg:p-4 flex flex-col items-center" style={{ background:"rgba(255,255,255,0.9)", boxShadow:"0 7px 0 #c8c0a8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily:"Nunito", color:"#7BC7F0" }}>{t("Look at the picture")}</p>
              <span style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:12 }}>{t("Tap the stars")}</span>
            </div>
            {scenario?.image_url ? (
              <div className="lesson-image-frame relative overflow-hidden rounded-2xl w-full max-w-[420px]" style={{ background:"#dff2ff", border:"3px solid #EDE9DC" }}>
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
              <div className="lesson-image-frame flex items-center justify-center rounded-2xl text-center w-full max-w-[420px]" style={{ background:"rgba(123,199,240,0.2)", border:"3px dashed #7BC7F0" }}>
                <p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:14 }}>{t("Your picture is getting ready...")}</p>
              </div>
            )}
            <p className="mt-2 max-w-[420px] text-center" style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:13, lineHeight:1.45 }}>{scenario?.image_alt || "Look closely and find the important things."}</p>
            <div className="rounded-[24px] p-3 mt-4 w-full" style={{ background:"rgba(255,255,255,0.78)", border:"2px solid rgba(123,199,240,0.45)" }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize:28 }}>🎥</span>
                <div className="flex-1">
                  <p style={{ fontFamily:"Fredoka", color:"#2D1B0E", fontSize:16, fontWeight:600 }}>{t("Record this practice?")}</p>
                  <p style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:12, lineHeight:1.4 }}>{t("Optional. A grown-up must say yes first.")}</p>
                </div>
                {!isRecording && <label className="flex items-center gap-2" style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:12, fontWeight:700 }}><input type="checkbox" checked={recordingConsent} onChange={(event) => { const enabled = event.target.checked; setRecordingConsent(enabled); localStorage.setItem("ise-recording-consent", String(enabled)); }} /> {t("Yes")}</label>}
              </div>
              {recordingConsent && !isRecording && <button type="button" onClick={startRecording} disabled={isLoading || !scenario || isStartingRecording} className="btn-press mt-3 w-full rounded-full py-3 font-bold" style={{ background:"#F8A4B8", color:"#2D1B0E", boxShadow:"0 4px 0 #d9839a", fontFamily:"Fredoka" }}>{isStartingRecording ? t("Waiting for permission...") : t("Start Recording")}</button>}
              {isRecording && <div className="mt-3">
                <div className="relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl" style={{ minHeight:82, background:"linear-gradient(135deg, #fff1f5 0%, #ffe0e9 100%)", border:"2px solid #F8A4B8" }}>
                  <span style={{ fontSize:30 }}>🎙️</span>
                  <span className="rounded-full px-3 py-1" style={{ background:"#F8A4B8", color:"#2D1B0E", fontFamily:"Fredoka", fontSize:12 }}>● {t("Recording in progress")}</span>
                  <span style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:11 }}>{t("Answer the question to stop and save")}</span>
                  <video ref={cameraRef} autoPlay muted playsInline className="hidden" aria-hidden="true" />
                </div>
                <button type="button" onClick={stopRecording} className="btn-press mt-3 w-full rounded-full py-2.5 font-bold" style={{ background:"#FAD054", color:"#2D1B0E", boxShadow:"0 4px 0 #c8a020", fontFamily:"Fredoka" }}>{t("Stop Recording")}</button>
              </div>}
              {recordingMessage && <p className="mt-2" style={{ fontFamily:"Nunito", color:"#5C3D2E", fontSize:12 }}>{recordingMessage}</p>}
            </div>
          </div>
          <div>
            <div className="rounded-[28px] px-5 py-4 mb-3" style={{ background:"rgba(255,255,255,0.92)", boxShadow:"0 7px 0 #c8c0a8" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily:"Nunito", color:"#7BC7F0" }}>{t("Your turn!")}</p>
              <h2 className="text-xl lg:text-2xl font-normal leading-snug" style={{ fontFamily:"Fredoka", color:"#2D1B0E" }}>{isLoading ? "Get ready..." : scenario?.question || "What would you choose? 🤔"}</h2>
              {error && <p className="mt-3 rounded-2xl px-4 py-3" style={{ background:"#FFF1F0", color:"#9B3E36", fontFamily:"Nunito", fontSize:14 }}>{error}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {scenario && Object.entries(scenario.options).map(([id, text], index)=>{ const isSel=selected===id; const style=OPTION_STYLES[index % OPTION_STYLES.length]; return <button key={id} onClick={()=>pick(id)} disabled={!!selected || isLoading} className="btn-press card-3d rounded-[28px] p-3 flex flex-col items-center gap-2 text-center" style={{ background:style.color, boxShadow:isSel?`0 2px 0 ${style.shadow}`:`0 6px 0 ${style.shadow}, 0 10px 20px rgba(0,0,0,0.08)`, transform:isSel?"translateY(6px)":undefined, opacity:selected&&!isSel?0.55:1, border:isSel?`3px solid ${style.shadow}`:"3px solid transparent", transition:"all 0.15s cubic-bezier(0.34,1.56,0.64,1)", minHeight:104 }}><div className="self-start rounded-full text-xs font-bold px-2.5 py-0.5" style={{ background:"rgba(255,255,255,0.7)", color:"#2D1B0E", fontFamily:"Fredoka", fontSize:14 }}>{id}</div><div className="flex items-center justify-center rounded-2xl" style={{ width:48, height:48, background:"rgba(255,255,255,0.45)", fontSize:27 }}>{style.emoji}</div><p style={{ fontFamily:"Nunito", color:"#2D1B0E", fontSize:12, fontWeight:700, lineHeight:1.3 }}>{text}</p></button>; })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}