import { useState } from "react";
import OnboardingScreen from "./screens/OnboardingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import LessonScreen from "./screens/LessonScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import ParentPortalScreen from "./screens/ParentPortalScreen";
import LanguageSelector from "./components/LanguageSelector";
import { LanguageProvider } from "./lib/i18n";
import { createChildProfile } from "./lib/api";

export type Screen = "onboarding" | "dashboard" | "lesson" | "feedback" | "parent";
export type ChildProfile = { name: string; age: number; interests: string[]; skill: string };

const DEFAULT_PROFILE: ChildProfile = {
  name: "Jamie", age: 7, interests: ["Space", "Animals"], skill: "Expressing Feelings",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [isCorrect, setIsCorrect] = useState(false);
  const [key, setKey] = useState(0);

  const goTo = (s: Screen) => {
    setKey((k) => k + 1);
    setScreen(s);
  };

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setTimeout(() => goTo("feedback"), 300);
  };

  const handleProfileComplete = async (nextProfile: ChildProfile) => {
    setProfile(nextProfile);
    try {
      await createChildProfile({
        child_id: nextProfile.name.toLowerCase().trim().replace(/\s+/g, "-") || "child",
        age: nextProfile.age,
        interest: nextProfile.interests.join(", ") || "General",
        skill_level: 2,
        target_skill: nextProfile.skill,
        difficulty: 1,
      });
    } catch {
      // Keep the local learning flow available when the backend or Firestore is offline.
    }
    goTo("dashboard");
  };

  const isParent = screen === "parent";

  return (
    <LanguageProvider>
      <div className="w-full h-full overflow-hidden" style={{ background: isParent ? "#F1F5F9" : "#b8e0f8" }}>
        <LanguageSelector />
        <div key={key} className="w-full h-full screen-enter">
        {screen === "onboarding" && (
          <OnboardingScreen goTo={goTo} onComplete={handleProfileComplete} />
        )}
        {screen === "dashboard" && (
          <DashboardScreen goTo={goTo} profile={profile} />
        )}
        {screen === "lesson" && (
          <LessonScreen goTo={goTo} profile={profile} onAnswer={handleAnswer} />
        )}
        {screen === "feedback" && (
          <FeedbackScreen goTo={goTo} isCorrect={isCorrect} />
        )}
        {screen === "parent" && (
          <ParentPortalScreen goTo={goTo} profile={profile} />
        )}
        </div>
      </div>
    </LanguageProvider>
  );
}