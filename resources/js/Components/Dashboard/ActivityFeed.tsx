import { formatDistanceToNow } from 'date-fns';

export interface ActivityEntry {
    type: string;
    description: string;
    actor_name: string;
    created_at: string;
}

interface ActivityFeedProps {
    activities: ActivityEntry[];
    emptyStateMessage?: string;
}

export default function ActivityFeed({ activities, emptyStateMessage = 'No recent activity.' }: ActivityFeedProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="p-8 text-center bg-sand-50 rounded-3xl border border-sand-200 border-dashed">
                <p className="text-sand-500">{emptyStateMessage}</p>
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {activities.map((activity, idx) => (
                    <li key={idx}>
                        <div className="relative pb-8">
                            {idx !== activities.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-sand-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-sand-100 text-sand-500 text-xs font-bold font-serif uppercase">
                                        {activity.actor_name.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-earth-900">
                                            <span className="font-medium">{activity.actor_name}</span> {activity.description}
                                        </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-sand-500">
                                        <time dateTime={activity.created_at}>
                                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
