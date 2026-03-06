import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { t } = useTranslation();
    const page = usePage();
    const user = page.props.auth?.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                {/* Investor Only Modules */}
                                {user.role === 'investor' && (
                                    <>
                                        <NavLink href={route('portfolio.dashboard')} active={route().current('portfolio.dashboard')}>
                                            {t('navigation.portfolio')}
                                        </NavLink>
                                        <NavLink href={route('farms.index')} active={route().current('farms.*')}>
                                            {t('navigation.marketplace')}
                                        </NavLink>
                                        <NavLink href={route('secondary-market.index')} active={route().current('secondary-market.*')}>
                                            {t('navigation.secondary_market')}
                                        </NavLink>
                                    </>
                                )}

                                {/* Farm Owner Only Modules */}
                                {user.role === 'farm_owner' && (
                                    <>
                                        <NavLink href={route('farm-owner.dashboard')} active={route().current('farm-owner.dashboard')}>
                                            {t('navigation.farm_dashboard')}
                                        </NavLink>
                                        <NavLink href={route('farms.manage.index')} active={route().current('farms.manage.*')}>
                                            {t('navigation.my_farms')}
                                        </NavLink>
                                    </>
                                )}

                                {/* Admin Only Modules */}
                                {user.role === 'admin' && (
                                    <>
                                        <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                            {t('navigation.admin_panel')}
                                        </NavLink>
                                        <NavLink href={route('admin.farms.index')} active={route().current('admin.farms.*')}>
                                            {t('navigation.farm_management')}
                                        </NavLink>
                                        <NavLink href={route('admin.translations.index')} active={route().current('admin.translations.*')}>
                                            {t('navigation.translations', 'Translations')}
                                        </NavLink>
                                    </>
                                )}

                                {/* Modules available to all authenticated users */}
                                <NavLink href={route('education.index')} active={route().current('education.*')}>
                                    {t('navigation.education')}
                                </NavLink>
                                <NavLink href={route('encyclopedia.index')} active={route().current('encyclopedia.*')}>
                                    {t('navigation.encyclopedia')}
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="me-3">
                                <LanguageSwitcher />
                            </div>
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            {t('navigation.profile')}
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            {t('auth.logout')}
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {/* Investor Only Modules */}
                        {user.role === 'investor' && (
                            <>
                                <ResponsiveNavLink href={route('portfolio.dashboard')} active={route().current('portfolio.dashboard')}>
                                    {t('navigation.portfolio')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('farms.index')} active={route().current('farms.*')}>
                                    {t('navigation.marketplace')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('secondary-market.index')} active={route().current('secondary-market.*')}>
                                    {t('navigation.secondary_market')}
                                </ResponsiveNavLink>
                            </>
                        )}

                        {/* Farm Owner Only Modules */}
                        {user.role === 'farm_owner' && (
                            <>
                                <ResponsiveNavLink href={route('farm-owner.dashboard')} active={route().current('farm-owner.dashboard')}>
                                    {t('navigation.farm_dashboard')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('farms.manage.index')} active={route().current('farms.manage.*')}>
                                    {t('navigation.my_farms')}
                                </ResponsiveNavLink>
                            </>
                        )}

                        {/* Admin Only Modules */}
                        {user.role === 'admin' && (
                            <>
                                <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                    {t('navigation.admin_panel')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.farms.index')} active={route().current('admin.farms.*')}>
                                    {t('navigation.farm_management')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.translations.index')} active={route().current('admin.translations.*')}>
                                    {t('navigation.translations', 'Translations')}
                                </ResponsiveNavLink>
                            </>
                        )}

                        {/* Modules available to all authenticated users */}
                        <ResponsiveNavLink href={route('education.index')} active={route().current('education.*')}>
                            {t('navigation.education')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('encyclopedia.index')} active={route().current('encyclopedia.*')}>
                            {t('navigation.encyclopedia')}
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                {t('navigation.profile')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                {t('auth.logout')}
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
