import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string | null;
    status: 'draft' | 'published';
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
}

interface Props {
    article: Article;
    categories: Category[];
    tags: Tag[];
}

export default function AdminArticlesEdit({ article, categories, tags }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        featured_image: article.featured_image || '',
        status: article.status,
        category_ids: article.categories.map((c) => c.id),
        tag_ids: article.tags.map((t) => t.id),
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        meta_keywords: article.meta_keywords || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.articles.update', article.id));
    };

    const handleContentChange = (content: string) => {
        setData('content', content);
    };

    return (
        <>
            <Head title={`Edit: ${article.title}`} />

            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('admin.articles.index')}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            ← Back to Articles
                        </Link>
                    </div>

                    <h1 className="mb-6 text-3xl font-bold text-gray-900">
                        Edit Article
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="excerpt"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Excerpt
                                    </label>
                                    <textarea
                                        id="excerpt"
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.excerpt && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.excerpt}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Content
                                    </label>
                                    <RichTextEditor
                                        content={data.content}
                                        onChange={handleContentChange}
                                        placeholder="Start writing your article..."
                                    />
                                    {errors.content && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.content}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="featured_image"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Featured Image URL
                                    </label>
                                    <input
                                        type="url"
                                        id="featured_image"
                                        value={data.featured_image}
                                        onChange={(e) =>
                                            setData('featured_image', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.featured_image && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.featured_image}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Categories & Tags
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Categories (select at least one)
                                    </label>
                                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {categories.map((category) => (
                                            <label
                                                key={category.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={category.id}
                                                    checked={data.category_ids.includes(category.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('category_ids', [
                                                                ...data.category_ids,
                                                                category.id,
                                                            ]);
                                                        } else {
                                                            setData(
                                                                'category_ids',
                                                                data.category_ids.filter(
                                                                    (id) => id !== category.id
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {category.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.category_ids && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.category_ids}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Tags
                                    </label>
                                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {tags.map((tag) => (
                                            <label
                                                key={tag.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={tag.id}
                                                    checked={data.tag_ids.includes(tag.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('tag_ids', [
                                                                ...data.tag_ids,
                                                                tag.id,
                                                            ]);
                                                        } else {
                                                            setData(
                                                                'tag_ids',
                                                                data.tag_ids.filter(
                                                                    (id) => id !== tag.id
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    #{tag.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.tag_ids && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.tag_ids}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Publishing Options
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="status"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData(
                                                'status',
                                                e.target.value as 'draft' | 'published'
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                SEO Metadata
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="meta_title"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        id="meta_title"
                                        value={data.meta_title}
                                        onChange={(e) =>
                                            setData('meta_title', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Leave empty to use article title"
                                    />
                                    {errors.meta_title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.meta_title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="meta_description"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Meta Description
                                    </label>
                                    <textarea
                                        id="meta_description"
                                        value={data.meta_description}
                                        onChange={(e) =>
                                            setData('meta_description', e.target.value)
                                        }
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Brief description for search engines (max 160 characters)"
                                    />
                                    {errors.meta_description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.meta_description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="meta_keywords"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Meta Keywords
                                    </label>
                                    <input
                                        type="text"
                                        id="meta_keywords"
                                        value={data.meta_keywords}
                                        onChange={(e) =>
                                            setData('meta_keywords', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                    {errors.meta_keywords && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.meta_keywords}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link
                                href={route('admin.articles.index')}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Article'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
