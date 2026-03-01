import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    icon: string
    action_url?: string | null
    read_at: string | null
    created_at: string
}

interface Props {
    notifications: {
        data: Notification[]
        current_page: number
        last_page: number
    }
    unreadCount: number
}

export default function Index({ notifications, unreadCount }: Props) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const handleMarkAsRead = (id: string) => {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true })
    }

    const handleMarkAllAsRead = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true })
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            router.delete(`/notifications/${id}`, { preserveScroll: true })
        }
    }

    const displayedNotifications = filter === 'unread'
        ? notifications.data.filter((n) => !n.read_at)
        : notifications.data

    return (
        <>
            <Head title="Notifications" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Notifications
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {unreadCount} unread
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Mark All as Read
                            </button>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg"
                            >
                                <option value="all">All</option>
                                <option value="unread">Unread</option>
                            </select>
                        </div>
                    </div>

                    {displayedNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No notifications to display</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {displayedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`bg-white rounded-lg shadow-sm border ${
                                        !notification.read_at ? 'border-blue-200 border-l-4' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 text-2xl">
                                                {notification.icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {notification.action_url ? (
                                                    <Link
                                                        href={notification.action_url}
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="block"
                                                    >
                                                        <h3 className={`font-semibold ${
                                                            !notification.read_at ? 'text-gray-900' : 'text-gray-600'
                                                        }`}>
                                                            {notification.title}
                                                        </h3>
                                                        <p className={`mt-1 text-sm ${
                                                            !notification.read_at ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                            {notification.message}
                                                        </p>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <h3 className={`font-semibold ${
                                                            !notification.read_at ? 'text-gray-900' : 'text-gray-600'
                                                        }`}>
                                                            {notification.title}
                                                        </h3>
                                                        <p className={`mt-1 text-sm ${
                                                            !notification.read_at ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                            {notification.message}
                                                        </p>
                                                    </>
                                                )}

                                                <p className="mt-2 text-xs text-gray-400">
                                                    {formatDistanceToNow(new Date(notification.created_at), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {notifications.last_page > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            {Array.from({ length: notifications.last_page }).map((_, i) => (
                                <Link
                                    key={i}
                                    href={`?page=${i + 1}`}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                        notifications.current_page === i + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {i + 1}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
