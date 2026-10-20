export interface VoiceLanguage {
  /** BCP-47 code used by SpeechRecognition and speechSynthesis. */
  code: string;
  label: string;
  /** Short label for the pill UI. */
  short: string;
}

export const VOICE_LANGUAGES: VoiceLanguage[] = [
  { code: "en-US", label: "English", short: "EN" },
  { code: "es-ES", label: "Español", short: "ES" },
  { code: "fr-FR", label: "Français", short: "FR" },
  { code: "de-DE", label: "Deutsch", short: "DE" },
  { code: "pt-BR", label: "Português", short: "PT" },
  { code: "it-IT", label: "Italiano", short: "IT" },
  { code: "nl-NL", label: "Nederlands", short: "NL" },
  { code: "hi-IN", label: "हिन्दी", short: "HI" },
  { code: "ja-JP", label: "日本語", short: "JA" },
  { code: "zh-CN", label: "中文", short: "ZH" },
  { code: "ar-SA", label: "العربية", short: "AR" },
  { code: "ko-KR", label: "한국어", short: "KO" },
];
