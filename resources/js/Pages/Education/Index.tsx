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

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
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
    categories: Category[];
    filters: {
        category: string | null;
        tag: string | null;
        search: string | null;
    };
}

export default function EducationIndex({ articles, categories, filters }: Props) {
    const handleFilterChange = (filterType: string, value: string) => {
        const url = new URL(window.location.href);
        if (value) {
            url.searchParams.set(filterType, value);
        } else {
            url.searchParams.delete(filterType);
        }
        window.location.href = url.toString();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const searchInput = form.elements.namedItem('search') as HTMLInputElement;
        handleFilterChange('search', searchInput.value);
    };

    return (
        <>
            <Head title="Education Center" />

            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">Education Center</h1>
                        <p className="mt-2 text-gray-600">
                            Learn about fruit tree investing, risk management, and market trends
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                        <aside className="lg:col-span-1">
                            <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-900">Search</h2>
                                <form onSubmit={handleSearch} className="mt-4">
                                    <input
                                        type="text"
                                        name="search"
                                        defaultValue={filters.search || ''}
                                        placeholder="Search articles..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </form>

                                <h2 className="mt-6 text-lg font-semibold text-gray-900">Categories</h2>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <button
                                            onClick={() => handleFilterChange('category', '')}
                                            className={`w-full text-left ${
                                                !filters.category ? 'font-semibold text-indigo-600' : 'text-gray-700'
                                            }`}
                                        >
                                            All Categories
                                        </button>
                                    </li>
                                    {categories.map((category) => (
                                        <li key={category.id}>
                                            <button
                                                onClick={() => handleFilterChange('category', category.slug)}
                                                className={`w-full text-left ${
                                                    filters.category === category.slug
                                                        ? 'font-semibold text-indigo-600'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                {category.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>

                        <main className="lg:col-span-3">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                            <p className="mb-4 flex-1 text-gray-600">{article.excerpt}</p>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>{article.author.name}</span>
                                                <span>{article.view_count} views</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

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
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
