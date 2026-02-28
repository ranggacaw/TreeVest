import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    articles: Article[];
}

interface Props {
    categories: Category[];
}

export default function EncyclopediaIndex({ categories }: Props) {
    return (
        <>
            <Head title="Fruit Encyclopedia" />

            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Fruit Encyclopedia
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Explore our comprehensive guide to fruit varieties, cultivation,
                            and market information
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex h-full flex-col overflow-hidden bg-white shadow-sm sm:rounded-lg"
                            >
                                <div className="bg-indigo-600 p-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        {category.name}
                                    </h2>
                                    <p className="mt-2 text-indigo-100">{category.description}</p>
                                </div>

                                <div className="flex-1 p-6">
                                    {category.articles.length > 0 ? (
                                        <ul className="space-y-3">
                                            {category.articles.map((article) => (
                                                <li key={article.id}>
                                                    <Link
                                                        href={route('encyclopedia.show', article.slug)}
                                                        className="block rounded-lg border border-gray-200 p-4 transition hover:border-indigo-500 hover:shadow-md"
                                                    >
                                                        <h3 className="font-semibold text-gray-900">
                                                            {article.title}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {article.excerpt}
                                                        </p>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">
                                            No articles available yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 rounded-lg bg-blue-50 p-8">
                        <h3 className="mb-3 text-xl font-semibold text-blue-900">
                            Investing in Fruit Trees
                        </h3>
                        <p className="mb-4 text-blue-800">
                            Our encyclopedia provides detailed information about various fruit types
                            to help you make informed investment decisions. Learn about growing
                            conditions, harvest cycles, market demand, and investment potential
                            for each fruit variety.
                        </p>
                        <Link
                            href={route('education.index')}
                            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Learn About Fruit Tree Investing
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
