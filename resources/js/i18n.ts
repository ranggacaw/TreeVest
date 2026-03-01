import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

let isInitialized = false;

export const initI18n = async (locale: string = 'en') => {
    if (isInitialized) {
        await i18n.changeLanguage(locale);
        return;
    }

    await i18n
        .use(resourcesToBackend((language: string, namespace: string) => {
            return import(`../public/locales/${language}/${namespace}.json`);
        }))
        .use(initReactI18next)
        .init({
            lng: locale,
            fallbackLng: 'en',
            defaultNS: 'translation',
            ns: ['translation'],
            interpolation: {
                escapeValue: false,
            },
        });

    isInitialized = true;
};

export default i18n;
