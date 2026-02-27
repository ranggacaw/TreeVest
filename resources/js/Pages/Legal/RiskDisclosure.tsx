import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface LegalDocument {
    title: string;
    content: string;
    version: string;
    effective_date: string;
}

export default function RiskDisclosure({ auth, document }: PageProps<{ document: LegalDocument }>) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-6 sm:pt-0">
            <Head title="Risk Disclosure" />

            <div className="w-full sm:max-w-4xl mt-6 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg mx-auto">
                <div className="prose dark:prose-invert max-w-none">
                    <h1 className="text-2xl font-bold mb-4">{document?.title || 'Risk Disclosure'}</h1>
                    <p className="text-red-600 font-semibold mb-4">Warning: All investments carry risk.</p>
                    <div dangerouslySetInnerHTML={{ __html: document?.content || 'Content not available.' }} />
                </div>
            </div>
        </div>
    );
}
