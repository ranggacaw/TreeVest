import { Head, Link, router } from '@inertiajs/react'

interface Template {
    id: number
    type: string
    channel: string
    subject: string | null
    is_active: boolean
}

interface Props {
    templates: {
        data: Template[]
    }
}

export default function Index({ templates }: Props) {
    return (
        <>
            <Head title="Notification Templates" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Notification Templates
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage notification templates for different types and channels
                            </p>
                        </div>

                        <Link
                            href={route('admin.notification-templates.create')}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Create Template
                        </Link>
                    </div>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Channel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templates.data.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {template.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {template.channel}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                            {template.subject || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {template.is_active ? (
                                                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('admin.notification-templates.edit', template.id)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this template?')) {
                                                        router.delete(route('admin.notification-templates.destroy', template.id))
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {templates.data.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No notification templates found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
