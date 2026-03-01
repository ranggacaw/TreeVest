import { HarvestEvent } from '@/types';

interface Props {
    harvests: HarvestEvent[];
}

export default function HarvestCalendar({ harvests }: Props) {
    if (harvests.length === 0) {
        return (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Upcoming Harvests
                    </h3>
                    <p className="text-gray-500 text-center py-8">
                        No upcoming harvests scheduled
                    </p>
                </div>
            </div>
        );
    }

    const groupedByMonth = harvests.reduce((acc, harvest) => {
        const date = new Date(harvest.harvest_date);
        const monthYear = date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(harvest);
        return acc;
    }, {} as Record<string, HarvestEvent[]>);

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upcoming Harvests
                </h3>
                <div className="space-y-4">
                    {Object.entries(groupedByMonth).map(([monthYear, monthHarvests]) => (
                        <div key={monthYear}>
                            <p className="text-sm font-medium text-gray-500 mb-2">
                                {monthYear}
                            </p>
                            <div className="space-y-2">
                                {monthHarvests.map((harvest) => (
                                    <div
                                        key={harvest.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {harvest.fruit_type} - {harvest.variant}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {harvest.farm_name} • Tree #{harvest.tree_identifier}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-900">
                                                {new Date(harvest.harvest_date).toLocaleDateString('en-MY', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                ~{harvest.estimated_yield_kg}kg
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
