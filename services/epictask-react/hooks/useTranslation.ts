import { useState, useEffect } from "react";
import * as Localization from "expo-localization";

// Translation keys structure
// This will be expanded with actual translations in Sprint 13
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Default English translations
const translations: Translations = {
  en: {
    // Home Screen
    "home.greeting": "Hello",
    "home.tasks.title": "Upcoming Tasks",
    "home.tasks.see_all": "See All",
    "home.tasks.you_have": "You have",
    "home.tasks.today": "tasks today!",
    "home.tasks.completed": "Completed",
    "home.tasks.no_tasks": "No tasks for today. Great job!",

    // Stories
    "stories.title": "Learning Stories",
    "stories.subtitle": "Choose your adventure and earn rewards!",
    "stories.continue": "Continue Your Adventure",
    "stories.new": "New Adventures",
    "stories.completed": "Completed",
    "stories.no_stories": "No Stories Yet",
    "stories.empty_message": "New learning adventures will appear here soon!",
    "stories.in_progress": "In Progress",
    "stories.xp_earned": "XP earned",
    "stories.start_first": "Start your first story!",

    // Story Viewer
    "story.exit_confirm.title": "Exit Story",
    "story.exit_confirm.message":
      "Are you sure you want to exit? Your progress will be saved.",
    "story.exit_confirm.cancel": "Cancel",
    "story.exit_confirm.exit": "Exit",
    "story.what_will_you_do": "What will you do?",
    "story.xp_for_choice": "XP for this choice",
    "story.loading_next": "Loading next part...",
    "story.complete.title": "Story Complete!",
    "story.complete.message": "Congratulations! You've earned",

    // Payouts
    "payout.completed.title": "Payout Completed!",
    "payout.completed.message": "You've received",
    "payout.approved.title": "Payout Approved!",
    "payout.approved.message": "Your",
    "payout.approved.suffix": "tokens are on the way!",
    "payout.pending.title": "Payout Pending",
    "payout.pending.message": "request is being reviewed",
    "payout.rejected.title": "Payout Not Available",
    "payout.rejected.message": "Ask your parent for help with this payout",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.continue": "Continue",
    "common.save": "Save",
  },
};

/**
 * Hook for internationalization support
 * Currently returns English translations
 * Will be expanded in Sprint 13 with multi-language support
 */
export function useTranslation() {
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    // Get system locale
    const systemLocale = Localization.getLocales()[0]?.languageCode;

    // Check if we have translations for this locale
    // For now, default to 'en' since we only have English
    const supportedLocale =
      systemLocale && systemLocale in translations ? systemLocale : "en";
    setLocale(supportedLocale);
  }, []);

  /**
   * Translate a key to the current locale
   * @param key - Translation key (e.g., 'home.greeting')
   * @param fallback - Optional fallback text if key not found
   * @returns Translated string
   */
  const t = (key: string, fallback?: string): string => {
    const translation = translations[locale]?.[key];

    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      return fallback || key;
    }

    return translation;
  };

  /**
   * Get the current locale
   * @returns Current locale code (e.g., 'en')
   */
  const getCurrentLocale = (): string => locale;

  /**
   * Change the app locale
   * @param newLocale - Locale code to switch to
   */
  const changeLocale = (newLocale: string): void => {
    if (translations[newLocale]) {
      setLocale(newLocale);
    } else {
      console.warn(`Locale ${newLocale} not supported, staying with ${locale}`);
    }
  };

  return {
    t,
    locale,
    getCurrentLocale,
    changeLocale,
  };
}

export default useTranslation;
