import { Head, Link, useForm } from '@inertiajs/react'

interface Preference {
    value: string
    label: string
}

interface Template {
    id: number
    type: string
    channel: string
    subject: string | null
    body: string
    is_active: boolean
}

interface Props {
    template: Template
    types: Preference[]
    channels: Preference[]
}

export default function Edit({ template, types, channels }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        type: template.type,
        channel: template.channel,
        subject: template.subject || '',
        body: template.body,
        is_active: template.is_active,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('admin.notification-templates.update', template.id))
    }

    return (
        <>
            <Head title="Edit Notification Template" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Notification Template
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Modify the notification template
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
                        <div className="px-6 py-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="type"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Type
                                    </label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {types.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="channel"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Channel
                                    </label>
                                    <select
                                        id="channel"
                                        value={data.channel}
                                        onChange={(e) => setData('channel', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {channels.map((channel) => (
                                            <option key={channel.value} value={channel.value}>
                                                {channel.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.channel && (
                                        <p className="mt-1 text-sm text-red-600">{errors.channel}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="subject"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="Email subject line"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Optional: Only used for email notifications
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="body"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Body
                                </label>
                                <textarea
                                    id="body"
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    rows={10}
                                    placeholder="Notification body using Blade syntax"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.body && (
                                    <p className="mt-1 text-sm text-red-600">{errors.body}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Use Blade syntax for dynamic content (variables, conditionals, etc.)
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <Link
                                href={route('admin.notification-templates.index')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Update Template
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
