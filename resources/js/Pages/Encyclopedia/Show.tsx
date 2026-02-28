import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string;
    view_count: number;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    author: { id: number; name: string };
    updated_at: string;
}

interface Props {
    article: Article;
    relatedArticles: Article[];
}

export default function EncyclopediaShow({ article, relatedArticles }: Props) {
    return (
        <>
            <Head title={article.meta_title || article.title}>
                {article.meta_description && (
                    <meta name="description" content={article.meta_description} />
                )}
                {article.meta_keywords && (
                    <meta name="keywords" content={article.meta_keywords} />
                )}
            </Head>

            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link
                        href={route('encyclopedia.index')}
                        className="mb-6 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Encyclopedia
                    </Link>

                    <article className="bg-white shadow-sm sm:rounded-lg">
                        {article.featured_image && (
                            <img
                                src={article.featured_image}
                                alt={article.title}
                                className="h-96 w-full object-cover sm:rounded-t-lg"
                            />
                        )}

                        <div className="p-8">
                            <div className="mb-4">
                                {article.categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={route('encyclopedia.index')}
                                        className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 hover:bg-green-200"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>

                            <h1 className="mb-4 text-4xl font-bold text-gray-900">
                                {article.title}
                            </h1>

                            <div className="mb-6 flex items-center gap-6 text-sm text-gray-600">
                                <span>By {article.author.name}</span>
                                <span>
                                    {new Date(article.published_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span>{article.view_count} views</span>
                            </div>

                            {article.tags.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag) => (
                                            <Link
                                                key={tag.id}
                                                href={route('education.index', { tag: tag.slug })}
                                                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                                            >
                                                #{tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="prose prose-lg max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: article.content }} />
                            </div>
                        </div>
                    </article>

                    {relatedArticles.length > 0 && (
                        <div className="mt-12">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">
                                Related Entries
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {relatedArticles.map((related) => (
                                    <article
                                        key={related.id}
                                        className="flex flex-col overflow-hidden bg-white shadow-sm sm:rounded-lg"
                                    >
                                        {related.featured_image && (
                                            <img
                                                src={related.featured_image}
                                                alt={related.title}
                                                className="h-40 w-full object-cover"
                                            />
                                        )}
                                        <div className="flex flex-1 flex-col p-4">
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                                <Link
                                                    href={route('encyclopedia.show', related.slug)}
                                                    className="hover:text-indigo-600"
                                                >
                                                    {related.title}
                                                </Link>
                                            </h3>
                                            <p className="mb-3 flex-1 text-sm text-gray-600">
                                                {related.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{related.author.name}</span>
                                                <span>{related.view_count} views</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-lg bg-blue-50 p-6">
                            <h3 className="mb-2 text-lg font-semibold text-blue-900">
                                Investing Opportunity
                            </h3>
                            <p className="mb-3 text-sm text-blue-800">
                                Interested in investing in {article.title} trees? Browse our
                                marketplace to find available investment opportunities with
                                detailed ROI projections and risk assessments.
                            </p>
                            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                                View Investment Opportunities
                            </button>
                        </div>

                        <div className="rounded-lg bg-yellow-50 p-6">
                            <h3 className="mb-2 text-lg font-semibold text-yellow-900">
                                Disclaimer
                            </h3>
                            <p className="text-sm text-yellow-800">
                                This content is for educational purposes only and does not
                                constitute financial advice. All investments involve risk. Please
                                consult with a qualified financial advisor before making investment
                                decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
