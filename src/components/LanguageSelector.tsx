import { useLanguage, LANGUAGES } from "../lib/i18n";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const current = LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];
  return (
    <label className="language-selector" aria-label={t("Language")}>
      <span aria-hidden="true">🌐</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
        {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.native} · {item.label}</option>)}
      </select>
      <span className="sr-only">{current.label}</span>
    </label>
  );
}
