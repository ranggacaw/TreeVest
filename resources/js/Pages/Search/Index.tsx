import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string;
    view_count: number;
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    author: { id: number; name: string };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData {
    current_page: number;
    data: Article[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface Props {
    articles: PaginationData;
    query: string;
    filters: {
        category: string | null;
        tag: string | null;
    };
}

export default function SearchIndex({ articles, query, filters }: Props) {
    return (
        <>
            <Head title={`Search: ${query}`} />

            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
                        <p className="mt-2 text-gray-600">
                            {articles.total === 0
                                ? 'No results found'
                                : `Found ${articles.total} result${articles.total !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6 rounded-lg bg-indigo-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-semibold text-indigo-900">
                                    Searching for:
                                </span>
                                <span className="ml-2 text-indigo-800">&quot;{query}&quot;</span>
                                {filters.category && (
                                    <>
                                        <span className="ml-4 text-sm font-semibold text-indigo-900">
                                            in category:
                                        </span>
                                        <span className="ml-2 text-indigo-800">
                                            {filters.category}
                                        </span>
                                    </>
                                )}
                                {filters.tag && (
                                    <>
                                        <span className="ml-4 text-sm font-semibold text-indigo-900">
                                            with tag:
                                        </span>
                                        <span className="ml-2 text-indigo-800">
                                            {filters.tag}
                                        </span>
                                    </>
                                )}
                            </div>
                            <Link
                                href={route('education.index')}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                                Clear Filters
                            </Link>
                        </div>
                    </div>

                    {articles.total > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {articles.data.map((article) => (
                                <article
                                    key={article.id}
                                    className="flex h-full flex-col overflow-hidden bg-white shadow-sm sm:rounded-lg"
                                >
                                    {article.featured_image && (
                                        <img
                                            src={article.featured_image}
                                            alt={article.title}
                                            className="h-48 w-full object-cover"
                                        />
                                    )}
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="mb-3 flex items-center gap-2">
                                            {article.categories.map((category) => (
                                                <span
                                                    key={category.id}
                                                    className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800"
                                                >
                                                    {category.name}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                            <Link
                                                href={route('education.show', article.slug)}
                                                className="hover:text-indigo-600"
                                            >
                                                {article.title}
                                            </Link>
                                        </h3>
                                        <p className="mb-4 flex-1 text-gray-600">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>{article.author.name}</span>
                                            <span>{article.view_count} views</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                            <svg
                                className="mx-auto h-16 w-16 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                No results found
                            </h3>
                            <p className="mt-2 text-gray-600">
                                We couldn't find any articles matching your search. Try
                                adjusting your search terms or filters.
                            </p>
                            <Link
                                href={route('education.index')}
                                className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Browse All Articles
                            </Link>
                        </div>
                    )}

                    {articles.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex items-center gap-2">
                                {articles.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`rounded px-3 py-2 ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
