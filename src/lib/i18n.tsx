import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type LanguageCode = "en" | "ta" | "te" | "ml" | "hi" | "kn" | "mr" | "bn" | "gu" | "pa" | "or" | "as" | "ur";

export const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

type TranslationKey = string;
const translations: Partial<Record<LanguageCode, Record<TranslationKey, string>>> = {
  ta: { "Tell us about you!": "உங்களைப் பற்றி சொல்லுங்கள்!", "What do you love?": "உங்களுக்கு எது பிடிக்கும்?", "Choose your first skill": "உங்கள் முதல் திறனைத் தேர்வு செய்யுங்கள்", "What's your name? 😊": "உங்கள் பெயர் என்ன? 😊", "How old are you? 🎂": "உங்கள் வயது என்ன? 🎂", "years old": "வயது", "What shall we practice today?": "இன்று எதைப் பயிற்சி செய்வோம்?", "Pick what you love!": "உங்களுக்கு பிடித்ததைத் தேர்வு செய்யுங்கள்!", "Let's Play!": "விளையாடலாம்!", "Next": "அடுத்து", "Go back": "பின்செல்", "Current Mission": "தற்போதைய பணி", "Play": "விளையாடு", "Parents": "பெற்றோர்", "Back": "பின்செல்", "Great Job!": "அருமை!", "Let's Learn Together!": "சேர்ந்து கற்போம்!", "Next Adventure": "அடுத்த சாகசம்", "Try Another Story": "மற்றொரு கதையை முயற்சி செய்", "Language": "மொழி" },
  te: { "Tell us about you!": "మీ గురించి చెప్పండి!", "What do you love?": "మీకు ఏది ఇష్టం?", "Choose your first skill": "మీ మొదటి నైపుణ్యాన్ని ఎంచుకోండి", "What's your name? 😊": "మీ పేరు ఏమిటి? 😊", "How old are you? 🎂": "మీ వయస్సు ఎంత? 🎂", "years old": "సంవత్సరాలు", "Let's Play!": "ఆడుకుందాం!", "Next": "తర్వాత", "Go back": "వెనక్కి", "Current Mission": "ప్రస్తుత మిషన్", "Play": "ఆడండి", "Parents": "తల్లిదండ్రులు", "Back": "వెనక్కి", "Great Job!": "చాలా బాగుంది!", "Let's Learn Together!": "కలిసి నేర్చుకుందాం!", "Next Adventure": "తర్వాతి సాహసం", "Try Another Story": "మరో కథ ప్రయత్నించండి", "Language": "భాష" },
  ml: { "Tell us about you!": "നിങ്ങളെക്കുറിച്ച് പറയൂ!", "What do you love?": "നിങ്ങൾക്ക് എന്താണ് ഇഷ്ടം?", "Choose your first skill": "നിങ്ങളുടെ ആദ്യ കഴിവ് തിരഞ്ഞെടുക്കൂ", "What's your name? 😊": "നിങ്ങളുടെ പേര് എന്താണ്? 😊", "How old are you? 🎂": "നിങ്ങളുടെ പ്രായം എത്ര? 🎂", "years old": "വയസ്സ്", "Let's Play!": "കളിക്കാം!", "Next": "അടുത്തത്", "Go back": "തിരികെ", "Current Mission": "നിലവിലെ ദൗത്യം", "Play": "കളിക്കുക", "Parents": "മാതാപിതാക്കൾ", "Back": "തിരികെ", "Great Job!": "വളരെ നന്നായി!", "Let's Learn Together!": "ഒരുമിച്ച് പഠിക്കാം!", "Next Adventure": "അടുത്ത സാഹസം", "Try Another Story": "മറ്റൊരു കഥ പരീക്ഷിക്കൂ", "Language": "ഭാഷ" },
  hi: { "Tell us about you!": "अपने बारे में बताइए!", "What do you love?": "आपको क्या पसंद है?", "Choose your first skill": "अपना पहला कौशल चुनें", "What's your name? 😊": "आपका नाम क्या है? 😊", "How old are you? 🎂": "आपकी उम्र कितनी है? 🎂", "years old": "वर्ष", "Let's Play!": "चलो खेलें!", "Next": "आगे", "Go back": "वापस जाएँ", "Current Mission": "वर्तमान मिशन", "Play": "खेलें", "Parents": "माता-पिता", "Back": "वापस", "Great Job!": "बहुत बढ़िया!", "Let's Learn Together!": "साथ मिलकर सीखें!", "Next Adventure": "अगला रोमांच", "Try Another Story": "एक और कहानी आज़माएँ", "Language": "भाषा" },
  kn: { "Tell us about you!": "ನಿಮ್ಮ ಬಗ್ಗೆ ಹೇಳಿ!", "What do you love?": "ನಿಮಗೆ ಏನು ಇಷ್ಟ?", "Let's Play!": "ಆಡೋಣ!", "Next": "ಮುಂದೆ", "Go back": "ಹಿಂದಕ್ಕೆ", "Parents": "ಪೋಷಕರು", "Back": "ಹಿಂದಕ್ಕೆ", "Language": "ಭಾಷೆ" },
  mr: { "Tell us about you!": "तुमच्याबद्दल सांगा!", "What do you love?": "तुम्हाला काय आवडते?", "Let's Play!": "चला खेळूया!", "Next": "पुढे", "Go back": "मागे", "Parents": "पालक", "Back": "मागे", "Language": "भाषा" },
  bn: { "Tell us about you!": "আপনার সম্পর্কে বলুন!", "What do you love?": "আপনার কী ভালো লাগে?", "Let's Play!": "চলুন খেলি!", "Next": "পরবর্তী", "Go back": "ফিরে যান", "Parents": "অভিভাবক", "Back": "ফিরে যান", "Language": "ভাষা" },
  gu: { "Tell us about you!": "તમારા વિશે કહો!", "What do you love?": "તમને શું ગમે છે?", "Let's Play!": "ચાલો રમીએ!", "Next": "આગળ", "Go back": "પાછા", "Parents": "વાલીઓ", "Back": "પાછા", "Language": "ભાષા" },
  pa: { "Tell us about you!": "ਆਪਣੇ ਬਾਰੇ ਦੱਸੋ!", "What do you love?": "ਤੁਹਾਨੂੰ ਕੀ ਪਸੰਦ ਹੈ?", "Let's Play!": "ਆਓ ਖੇਡੀਏ!", "Next": "ਅੱਗੇ", "Go back": "ਵਾਪਸ", "Parents": "ਮਾਪੇ", "Back": "ਵਾਪਸ", "Language": "ਭਾਸ਼ਾ" },
  or: { "Tell us about you!": "ଆପଣଙ୍କ ବିଷୟରେ କୁହନ୍ତୁ!", "What do you love?": "ଆପଣଙ୍କୁ କଣ ଭଲ ଲାଗେ?", "Let's Play!": "ଚାଲ ଖେଳିବା!", "Next": "ଆଗକୁ", "Go back": "ପଛକୁ", "Parents": "ଅଭିଭାବକ", "Back": "ପଛକୁ", "Language": "ଭାଷା" },
  as: { "Tell us about you!": "আপোনাৰ বিষয়ে কওক!", "What do you love?": "আপোনাৰ কি ভাল লাগে?", "Let's Play!": "আহক খেলোঁ!", "Next": "আগলৈ", "Go back": "উভতি যাওক", "Parents": "অভিভাৱক", "Back": "উভতি যাওক", "Language": "ভাষা" },
  ur: { "Tell us about you!": "اپنے بارے میں بتائیں!", "What do you love?": "آپ کو کیا پسند ہے؟", "Let's Play!": "آئیں کھیلیں!", "Next": "اگلا", "Go back": "واپس", "Parents": "والدین", "Back": "واپس", "Language": "زبان" },
};

const extendedTranslations: Partial<Record<LanguageCode, Record<TranslationKey, string>>> = {
  ta: {
    Age: "வயது", Skill: "திறன்", "In Progress": "நடைபெறுகிறது", Locked: "பூட்டப்பட்டது", stars: "நட்சத்திரங்கள்", badge: "பேட்ஜ்", "Empathy Explorer": "பரிவு ஆராய்ச்சியாளர்", "You are doing amazing — every try helps!": "நீங்கள் அருமையாக செய்கிறீர்கள் — ஒவ்வொரு முயற்சியும் உதவும்!", "The Story": "கதை", "Look at the picture": "படத்தைப் பாருங்கள்", "Tap the stars": "நட்சத்திரங்களைத் தட்டுங்கள்", "Your picture is getting ready...": "உங்கள் படம் தயாராகிறது...", "Benny is making a special story for you...": "பென்னி உங்களுக்காக ஒரு சிறப்பு கதையை உருவாக்குகிறார்...", "Your story will appear here.": "உங்கள் கதை இங்கே தோன்றும்.", Trains: "ரயில்கள்", Dinosaurs: "டைனோசர்கள்", Space: "விண்வெளி", Animals: "விலங்குகள்", Drawing: "வரைதல்", Sharing: "பகிர்தல்", "Expressing Feelings": "உணர்வுகளை வெளிப்படுத்துதல்", "Making Friends": "நண்பர்களை உருவாக்குதல்", "Asking for Help": "உதவி கேட்பது", "Taking Turns": "முறைப்படி செய்வது", "Being Patient": "பொறுமையாக இருப்பது"
  },
  te: {
    Age: "వయస్సు", Skill: "నైపుణ్యం", "In Progress": "కొనసాగుతోంది", Locked: "లాక్ చేయబడింది", stars: "నక్షత్రాలు", badge: "బ్యాడ్జ్", "Empathy Explorer": "సానుభూతి అన్వేషకుడు", "You are doing amazing — every try helps!": "మీరు అద్భుతంగా చేస్తున్నారు — ప్రతి ప్రయత్నం సహాయపడుతుంది!", "The Story": "కథ", "Look at the picture": "చిత్రాన్ని చూడండి", "Tap the stars": "నక్షత్రాలను తాకండి", "Your picture is getting ready...": "మీ చిత్రం సిద్ధమవుతోంది...", "Benny is making a special story for you...": "బెన్నీ మీ కోసం ప్రత్యేక కథను తయారు చేస్తున్నాడు...", "Your story will appear here.": "మీ కథ ఇక్కడ కనిపిస్తుంది.", Trains: "రైళ్లు", Dinosaurs: "డైనోసార్లు", Space: "అంతరిక్షం", Animals: "జంతువులు", Drawing: "చిత్రలేఖనం", Sharing: "పంచుకోవడం", "Expressing Feelings": "భావాలను వ్యక్తపరచడం", "Making Friends": "స్నేహితులను చేసుకోవడం", "Asking for Help": "సహాయం అడగడం", "Taking Turns": "వంతులు తీసుకోవడం", "Being Patient": "ఓపికగా ఉండటం"
  },
  ml: {
    Age: "പ്രായം", Skill: "കഴിവ്", "In Progress": "പുരോഗതിയിൽ", Locked: "ലോക്ക് ചെയ്തു", stars: "നക്ഷത്രങ്ങൾ", badge: "ബാഡ്ജ്", "Empathy Explorer": "സഹാനുഭൂതി അന്വേഷകൻ", "You are doing amazing — every try helps!": "നിങ്ങൾ അത്ഭുതകരമായി ചെയ്യുന്നു — ഓരോ ശ്രമവും സഹായിക്കും!", "The Story": "കഥ", "Look at the picture": "ചിത്രം നോക്കൂ", "Tap the stars": "നക്ഷത്രങ്ങളിൽ തൊടൂ", "Your picture is getting ready...": "നിങ്ങളുടെ ചിത്രം തയ്യാറാകുന്നു...", "Benny is making a special story for you...": "ബെന്നി നിങ്ങൾക്കായി ഒരു പ്രത്യേക കഥ ഒരുക്കുന്നു...", "Your story will appear here.": "നിങ്ങളുടെ കഥ ഇവിടെ കാണാം.", Trains: "ട്രെയിനുകൾ", Dinosaurs: "ഡൈനോസറുകൾ", Space: "ബഹിരാകാശം", Animals: "മൃഗങ്ങൾ", Drawing: "വരയ്ക്കൽ", Sharing: "പങ്കിടൽ", "Expressing Feelings": "വികാരങ്ങൾ പ്രകടിപ്പിക്കൽ", "Making Friends": "സുഹൃത്തുക്കളെ ഉണ്ടാക്കൽ", "Asking for Help": "സഹായം ചോദിക്കൽ", "Taking Turns": "ഊഴം എടുക്കൽ", "Being Patient": "ക്ഷമയോടെ ഇരിക്കൽ"
  },
  hi: {
    Age: "उम्र", Skill: "कौशल", "In Progress": "चल रहा है", Locked: "लॉक है", stars: "सितारे", badge: "बैज", "Empathy Explorer": "सहानुभूति खोजकर्ता", "You are doing amazing — every try helps!": "आप बहुत अच्छा कर रहे हैं — हर कोशिश मदद करती है!", "The Story": "कहानी", "Look at the picture": "चित्र को देखें", "Tap the stars": "सितारों को दबाएँ", "Your picture is getting ready...": "आपका चित्र तैयार हो रहा है...", "Benny is making a special story for you...": "बेनी आपके लिए एक खास कहानी बना रहा है...", "Your story will appear here.": "आपकी कहानी यहाँ दिखाई देगी।", Trains: "ट्रेन", Dinosaurs: "डायनासोर", Space: "अंतरिक्ष", Animals: "जानवर", Drawing: "चित्रकारी", Sharing: "साझा करना", "Expressing Feelings": "भावनाएँ व्यक्त करना", "Making Friends": "दोस्त बनाना", "Asking for Help": "मदद माँगना", "Taking Turns": "बारी लेना", "Being Patient": "धैर्य रखना"
  }
};

interface LanguageContextValue { language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (key: TranslationKey) => string; }
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => (localStorage.getItem("ise-language") as LanguageCode) || "en");
  const setLanguage = (next: LanguageCode) => { setLanguageState(next); localStorage.setItem("ise-language", next); };
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const t = (key: TranslationKey) => translations[language]?.[key] || extendedTranslations[language]?.[key] || key;
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
