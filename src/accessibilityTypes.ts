export interface AccessibilitySettings {
  fontSizeLevel: number; // -1 (small), 0 (normal), 1 (large), 2 (extra large)
  highContrast: boolean; // true = high contrast mode
  dyslexicFont: boolean; // true = OpenDyslexic / clean high-readability sans
  readingGuide: boolean; // true = horizontal reading tracker bar
  reducedMotion: boolean; // true = disable all animations
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSizeLevel: 0,
  highContrast: false,
  dyslexicFont: false,
  readingGuide: false,
  reducedMotion: false,
};
