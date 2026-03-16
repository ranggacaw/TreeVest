import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import StripeProvider from './Providers/StripeProvider';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18n } from './i18n';
import ErrorBoundary from './Components/ErrorBoundary';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const locale = props.initialPage.props.locale || 'en';
        initI18n(locale);

        root.render(
            <ErrorBoundary context="app-root">
                <I18nextProvider i18n={i18n}>
                    <StripeProvider>
                        <App {...props} />
                    </StripeProvider>
                </I18nextProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
