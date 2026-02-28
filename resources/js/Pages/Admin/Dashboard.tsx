import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface Article {
    id: number;
    title: string;
    slug: string;
    view_count: number;
    published_at: string;
    updated_at: string;
}

interface Props {
    popularArticles: Article[];
    staleArticles: Article[];
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
}

export default function Dashboard({ popularArticles, staleArticles, totalArticles, publishedArticles, draftArticles }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gray-100">
                <div className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-sm font-medium text-gray-500">Total Articles</h3>
                            <p className="mt-2 text-3xl font-semibold text-gray-900">{totalArticles}</p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-sm font-medium text-gray-500">Published</h3>
                            <p className="mt-2 text-3xl font-semibold text-green-600">{publishedArticles}</p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
                            <p className="mt-2 text-3xl font-semibold text-yellow-600">{draftArticles}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Popular Articles</h2>
                                <Link
                                    href={route('admin.articles.index')}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    View All
                                </Link>
                            </div>
                            {popularArticles.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {popularArticles.map((article) => (
                                        <li key={article.id} className="py-3">
                                            <Link
                                                href={route('admin.articles.edit', article.id)}
                                                className="block hover:bg-gray-50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 truncate">
                                                        <p className="truncate text-sm font-medium text-gray-900">
                                                            {article.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Last updated: {new Date(article.updated_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4 flex items-center text-sm text-gray-500">
                                                        <svg
                                                            className="mr-1 h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                        {article.view_count}
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No articles yet.</p>
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    <span className="text-yellow-600">⚠️</span> Stale Content
                                </h2>
                            </div>
                            {staleArticles.length > 0 ? (
                                <>
                                    <p className="mb-4 text-sm text-gray-600">
                                        These articles haven't been updated in over 6 months and may need review.
                                    </p>
                                    <ul className="divide-y divide-gray-200">
                                        {staleArticles.map((article) => (
                                            <li key={article.id} className="py-3">
                                                <Link
                                                    href={route('admin.articles.edit', article.id)}
                                                    className="block hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 truncate">
                                                            <p className="truncate text-sm font-medium text-gray-900">
                                                                {article.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Last updated: {new Date(article.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                                            Stale
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">All content is up to date.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Link
                            href={route('admin.articles.create')}
                            className="rounded-lg bg-indigo-600 p-6 text-center text-white shadow hover:bg-indigo-700"
                        >
                            <svg
                                className="mx-auto h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <p className="mt-2 font-semibold">Create New Article</p>
                        </Link>
                        <Link
                            href={route('education.index')}
                            target="_blank"
                            className="rounded-lg bg-gray-600 p-6 text-center text-white shadow hover:bg-gray-700"
                        >
                            <svg
                                className="mx-auto h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                            <p className="mt-2 font-semibold">View Education Center</p>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
