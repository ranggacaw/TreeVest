import { Head, router } from '@inertiajs/react'
import { useState } from 'react'

interface Preference {
    value: string
    label: string
}

interface Props {
    preferences: Record<string, Record<string, boolean>>
    types: Preference[]
    channels: Preference[]
}

export default function Notifications({ preferences, types, channels }: Props) {
    const [saving, setSaving] = useState(false)
    const [localPreferences, setLocalPreferences] = useState(preferences)

    const handleToggle = (type: string, channel: string) => {
        setLocalPreferences((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [channel]: !prev[type][channel],
            },
        }))
    }

    const handleSave = () => {
        setSaving(true)
        router.post('/settings/notifications', localPreferences, {
            onFinish: () => setSaving(false),
        })
    }

    return (
        <>
            <Head title="Notification Settings" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Notification Settings
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage which notifications you receive and how
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        {channels.map((channel) => (
                                            <th
                                                key={channel.value}
                                                className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {channel.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {types.map((type) => (
                                        <tr key={type.value}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {type.label}
                                            </td>
                                            {channels.map((channel) => (
                                                <td
                                                    key={channel.value}
                                                    className="px-6 py-4 whitespace-nowrap text-center"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleToggle(type.value, channel.value)
                                                        }
                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                            localPreferences[type.value]?.[channel.value]
                                                                ? 'bg-blue-600'
                                                                : 'bg-gray-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                localPreferences[type.value]?.[channel.value]
                                                                    ? 'translate-x-5'
                                                                    : 'translate-x-0'
                                                            }`}
                                                        />
                                                    </button>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
