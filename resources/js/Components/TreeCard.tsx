import { Link } from '@inertiajs/react';
import RiskBadge from './RiskBadge';
import HarvestCycleIcon from './HarvestCycleIcon';
import WishlistToggleButton from './WishlistToggleButton';
import { formatRupiah } from '@/utils/currency';

interface Props {
    tree: any;
    isWishlisted?: boolean;
    authenticated?: boolean;
}

export default function TreeCard({ tree, isWishlisted = false, authenticated = true }: Props) {
    const crop = tree.fruit_crop;
    const farm = crop?.farm;
    const fruitType = crop?.fruit_type;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="h-48 bg-gray-200 relative">
                {farm?.image_url ? (
                    <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-green-50">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 items-center">
                    <RiskBadge rating={tree.risk_rating} />
                    <WishlistToggleButton
                        treeId={tree.id}
                        isWishlisted={isWishlisted}
                        authenticated={authenticated}
                    />
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    {fruitType?.name ?? fruitType} &bull; {crop?.variant}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={farm?.name}>
                    {farm?.name}
                </h3>
                <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            <HarvestCycleIcon cycle={crop?.harvest_cycle || 'annual'} className="w-4 h-4" />
                            <span className="capitalize">{crop?.harvest_cycle}</span>
                        </span>
                        <span className="font-medium text-green-600">ROI: {tree.expected_roi_percent}%</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-xs text-gray-500">Price / tree</div>
                            <div className="text-xl font-bold text-gray-900">{formatRupiah(tree.price_cents)}</div>
                        </div>
                        <Link
                            href={route('trees.show', tree.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
