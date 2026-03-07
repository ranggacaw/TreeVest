import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

let isInitialized = false;

export const initI18n = async (locale: string = "en") => {
    if (isInitialized) {
        await i18n.changeLanguage(locale);
        return;
    }

    await i18n
        .use(
            resourcesToBackend((language: string, namespace: string) => {
                // Try to load from public/locales directory
                return fetch(`/locales/${language}/${namespace}.json`)
                    .then((response) => {
                        if (!response.ok) {
                            console.warn(
                                `Translation file not found: /locales/${language}/${namespace}.json`,
                            );
                            return null;
                        }
                        return response.json();
                    })
                    .catch((error) => {
                        console.error(
                            `Error loading translation file: /locales/${language}/${namespace}.json`,
                            error,
                        );
                        return null;
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
            ],
            interpolation: {
                escapeValue: false,
            },
            debug: process.env.NODE_ENV === "development",
        });

    isInitialized = true;
};

export default i18n;
