import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, MessageCircle, Mail, Phone, ExternalLink, HelpCircle } from 'lucide-react';
import BottomNav from '@/Components/Portfolio/BottomNav';

export default function Index() {
    const contactOptions = [
        {
            icon: <MessageCircle className="w-6 h-6 text-emerald-600" />,
            label: 'WhatsApp Chat',
            subLabel: 'Fast response (09:00 - 18:00)',
            value: '+62 812 3456 7890',
            action: 'Chat Sekarang',
            href: 'https://wa.me/6281234567890',
            bg: 'bg-emerald-50'
        },
        {
            icon: <Mail className="w-6 h-6 text-blue-600" />,
            label: 'Email Support',
            subLabel: 'Response within 24 hours',
            value: 'support@treevest.com',
            action: 'Kirim Email',
            href: 'mailto:support@treevest.com',
            bg: 'bg-blue-50'
        },
        {
            icon: <Phone className="w-6 h-6 text-indigo-600" />,
            label: 'Call Center',
            subLabel: 'For urgent matters only',
            value: '021-1234-5678',
            action: 'Telepon',
            href: 'tel:02112345678',
            bg: 'bg-indigo-50'
        }
    ];

    const faqs = [
        'Bagaimana cara mulai berinvestasi?',
        'Berapa lama periode investasi pohon?',
        'Kapan saya akan mendapatkan bagi hasil?',
        'Apakah investasi ini aman?',
        'Bagaimana cara menarik saldo wallet?'
    ];

    return (
        <AppShellLayout>
            <Head title="Pusat Bantuan" />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-gray-100">
                    <Link href={route('profile.edit')} className="p-2 -ml-2 text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Pusat Bantuan</h1>
                </div>

                <div className="flex-1 overflow-y-auto pb-28">
                    {/* Hero Section */}
                    <div className="bg-white px-5 py-8 text-center border-b border-gray-100">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                            <HelpCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Ada yang bisa kami bantu?</h2>
                        <p className="text-sm text-gray-500 max-w-[240px] mx-auto">Tim kami siap membantu kendala investasi Anda.</p>
                    </div>

                    {/* Contact Cards */}
                    <div className="px-5 py-6 space-y-4">
                        {contactOptions.map((opt, i) => (
                            <a 
                                key={i} 
                                href={opt.href} 
                                target="_blank" 
                                rel="noreferrer"
                                className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${opt.bg} flex items-center justify-center shrink-0`}>
                                        {opt.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900">{opt.label}</h3>
                                        <p className="text-[11px] text-gray-400 font-medium mb-2">{opt.subLabel}</p>
                                        <p className="text-xs font-bold text-gray-700">{opt.value}</p>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-xl text-gray-300">
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="h-2 bg-gray-50" />

                    {/* FAQ Quick Access */}
                    <div className="bg-white px-5 py-6">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Pertanyaan Populer</h3>
                        <div className="space-y-1">
                            {faqs.map((faq, i) => (
                                <button key={i} className="w-full flex items-center justify-between py-4 border-b border-gray-50 last:border-0 text-left active:bg-gray-50 transition-colors px-2 -mx-2 rounded-xl">
                                    <span className="text-sm text-gray-700 font-medium">{faq}</span>
                                    <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                                </button>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-3 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-2xl">
                            Lihat Semua FAQ
                        </button>
                    </div>
                </div>

                <BottomNav activeTab="profile" />
            </div>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
