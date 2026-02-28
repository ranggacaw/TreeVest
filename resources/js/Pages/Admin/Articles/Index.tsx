import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface Article {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    published_at: string | null;
    view_count: number;
    created_at: string;
    updated_at: string;
    author: { id: number; name: string };
    categories: { id: number; name: string }[];
    tags: { id: number; name: string }[];
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
}

export default function AdminArticlesIndex({ articles }: Props) {
    return (
        <>
            <Head title="Manage Articles" />

            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Manage Articles
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Create and manage educational content
                            </p>
                        </div>
                        <Link
                            href={route('admin.articles.create')}
                            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Create Article
                        </Link>
                    </div>

                    <div className="mt-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Updated
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {articles.data.map((article) => (
                                    <tr key={article.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {article.title}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {article.slug}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    article.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {article.author.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {article.view_count}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(article.updated_at).toLocaleDateString(
                                                'en-US',
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('admin.articles.edit', article.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </Link>
                                                {article.status === 'draft' ? (
                                                    <form
                                                        action={route(
                                                            'admin.articles.publish',
                                                            article.id
                                                        )}
                                                        method="POST"
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Publish
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <form
                                                        action={route(
                                                            'admin.articles.unpublish',
                                                            article.id
                                                        )}
                                                        method="POST"
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                        >
                                                            Unpublish
                                                        </button>
                                                    </form>
                                                )}
                                                <form
                                                    action={route(
                                                        'admin.articles.destroy',
                                                        article.id
                                                    )}
                                                    method="POST"
                                                    onSubmit={(e) => {
                                                        if (
                                                            !confirm(
                                                                'Are you sure you want to delete this article?'
                                                            )
                                                        ) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="_method"
                                                        value="DELETE"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                </div>
            </div>
        </>
    );
}
