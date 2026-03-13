import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';
import BottomNav from '@/Components/Portfolio/BottomNav';
import {
    User,
    Settings,
    FileText,
    MessageSquare,
    Moon,
    Building2,
    Gift,
    Ticket,
    Calendar,
    ChevronRight,
    Wallet,
    ShieldCheck,
    LogOut
} from 'lucide-react';
import { useState } from 'react';
import { formatRupiah } from '@/utils/currency';

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    subLabel?: string;
    href?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
    as?: React.ElementType;
}

function MenuItem({ icon, label, subLabel, href, onClick, rightElement, destructive, as: Component = 'button' }: MenuItemProps) {
    const content = (
        <div className={`flex items-center justify-between py-4 border-b border-gray-50 last:border-0 ${destructive ? 'text-red-500' : 'text-gray-700'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-5 h-5 ${destructive ? 'text-red-500' : 'text-gray-400'}`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-[15px] font-medium leading-tight ${destructive ? 'text-red-600' : 'text-gray-800'}`}>{label}</p>
                    {subLabel && <p className="text-[12px] text-emerald-600 font-medium mt-0.5">{subLabel}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {rightElement ? rightElement : <ChevronRight className="w-5 h-5 text-gray-300" />}
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block active:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg">{content}</Link>;
    }

    return <Component onClick={onClick} className="w-full text-left active:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg">{content}</Component>;
}

function ToggleBar({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
            tabIndex={0}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${checked ? 'bg-emerald-500' : 'bg-gray-200'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </div>
    );
}

export default function Edit({ auth }: PageProps) {
    const { t } = useTranslation('profile');
    const user = auth.user;

    if (!user) {
        return null; // Or some fallback UI, but normally this page is protected
    }
    const [isSyariah, setIsSyariah] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <AppShellLayout>
            <Head title="Profil" />

            <div className="relative w-full max-w-md bg-white flex flex-col" style={{ minHeight: '100dvh' }}>

                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto pb-24">

                    {/* Header Title */}
                    <div className="px-4 py-4 text-center sticky top-0 bg-white z-10">
                        <h1 className="text-lg font-bold text-gray-900">Profil</h1>
                    </div>

                    {/* Profile Section */}
                    <div className="px-5 pt-2 pb-6 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden border-2 border-emerald-100 p-0.5">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl uppercase">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-emerald-500 text-sm font-semibold mt-0.5">Investor Agresif</p>
                        </div>
                    </div>

                    {/* Top Two Cards */}
                    <div className="px-5 grid grid-cols-2 gap-3 mb-6">
                        {/* Membership Card */}
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-[13px] font-bold text-gray-700">TreeVest Plus</span>
                            </div>
                            <button className="flex items-center justify-between w-full bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[13px] font-bold mt-2 border border-emerald-100">
                                Upgrade
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Wallet Card */}
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col justify-between group">
                            <Link href={route('investor.payouts.index')} className="h-full flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900 leading-none">Rp 0</p>
                                    <p className="text-[11px] text-blue-500 font-bold mt-1">Saldo Wallet</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Section Separator */}
                    <div className="h-2 bg-gray-50 mb-1" />

                    {/* Menu Group 1: General */}
                    <div className="px-5">
                        <MenuItem
                            icon={<User className="w-5 h-5" />}
                            label="Data Pribadi"
                            href={route('profile.edit-details')}
                        />
                        <MenuItem
                            icon={<Settings className="w-5 h-5" />}
                            label="Settings"
                            href={route('profile.account-settings')}
                        />
                        <MenuItem
                            icon={<FileText className="w-5 h-5" />}
                            label="E-Statement"
                            href={route('reports.index')}
                        />
                        <MenuItem
                            icon={<MessageSquare className="w-5 h-5" />}
                            label="Chat Support"
                            href={route('investor.support')}
                        />
                    </div>

                    {/* Section Separator */}
                    <div className="h-2 bg-gray-50 my-1" />

                    {/* Menu Group 2: Toggles */}
                    <div className="px-5">
                        <MenuItem
                            icon={<ShieldCheck className="w-5 h-5" />}
                            label="Keamanan Akun"
                            href={route('profile.2fa')}
                        />
                        <MenuItem
                            icon={<Moon className="w-5 h-5" />}
                            label="TreeVest Syariah"
                            rightElement={<ToggleBar checked={isSyariah} onChange={setIsSyariah} />}
                        />
                        <MenuItem
                            icon={<Building2 className="w-5 h-5" />}
                            label="Dark Mode"
                            rightElement={<ToggleBar checked={isDarkMode} onChange={setIsDarkMode} />}
                        />
                    </div>

                    {/* Section Separator */}
                    <div className="h-2 bg-gray-50 my-1" />

                    {/* Menu Group 3: Corporate */}
                    <div className="px-5">
                        <MenuItem
                            icon={<Building2 className="w-5 h-5" />}
                            label="TreeVest untuk Perusahaan"
                            subLabel="Buat Akun Bisnis"
                        />
                    </div>

                    {/* Section Separator */}
                    <div className="h-2 bg-gray-50 my-1" />

                    {/* Menu Group 4: Promo & Rewards */}
                    <div className="px-5">
                        <MenuItem
                            icon={<Gift className="w-5 h-5" />}
                            label="Cashback & Referral"
                            href={route('investor.wishlist.index')} // Mocked to wishlist for now as it's active
                        />
                        <MenuItem
                            icon={<Ticket className="w-5 h-5" />}
                            label="Promo & Voucher"
                        />
                        <MenuItem
                            icon={<Calendar className="w-5 h-5" />}
                            label="Systematic Investment Plan (SIP)"
                        />
                    </div>

                    {/* Logout */}
                    <div className="px-5 mt-4">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="div"
                            className="block w-full cursor-pointer"
                        >
                            <MenuItem
                                icon={<LogOut className="w-5 h-5" />}
                                label="Keluar"
                                destructive={true}
                                as="div"
                            />
                        </Link>
                    </div>

                </div>

                {/* Fixed Bottom Navigation */}
                <BottomNav activeTab="profile" />

            </div>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
