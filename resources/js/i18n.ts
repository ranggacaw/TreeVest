import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

let isInitialized = false;

export const initI18n = (locale: string = "en") => {
    if (isInitialized) {
        i18n.changeLanguage(locale);
        return i18n;
    }

    i18n
        .use(
            resourcesToBackend((language: string, namespace: string) => {
                // Load from public/locales directory with better error handling
                return fetch(`/locales/${language}/${namespace}.json`)
                    .then((response) => {
                        if (!response.ok) {
                            console.warn(
                                `i18next: Translation file not found: /locales/${language}/${namespace}.json`,
                            );
                            // Return empty object instead of null to prevent errors
                            return {};
                        }
                        return response.json();
                    })
                    .catch((error) => {
                        console.warn(
                            `i18next: Error loading translation file: /locales/${language}/${namespace}.json`,
                            error,
                        );
                        // Return empty object instead of null to prevent errors
                        return {};
                    });
            }),
        )
        .use(initReactI18next)
        .init({
            lng: locale,
            fallbackLng: "en",
            defaultNS: "translation",
            ns: [
                "translation",
                "health",
                "admin",
                "farms",
                "investments",
                "harvests",
                "education",
                "auth",
                "navigation",
                "trees",
            ],
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
                bindI18n: "languageChanged loaded",
                bindI18nStore: "added removed",
            },
            load: "languageOnly",
            // Reduced console output
            debug: false,
            saveMissing: false,
            // Better handling of missing keys
            returnEmptyString: false,
            returnNull: false,
            // Load namespaces in parallel
            partialBundledLanguages: true,
        });

    isInitialized = true;
    return i18n;
};

export default i18n;
