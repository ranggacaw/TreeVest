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
        <div className="bg-card rounded-lg shadow-card overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-floating">
            <div className="h-48 bg-bg relative">
                {farm?.image_url ? (
                    <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-textSecondary bg-bg">
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
                <div className="text-xs text-textSecondary uppercase tracking-wide font-semibold mb-1">
                    {fruitType?.name ?? fruitType} &bull; {crop?.variant}
                </div>
                <h3 className="text-lg font-bold text-text mb-2 truncate" title={farm?.name}>
                    {farm?.name}
                </h3>
                <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-textSecondary flex items-center gap-1">
                            <HarvestCycleIcon cycle={crop?.harvest_cycle || 'annual'} className="w-4 h-4" />
                            <span className="capitalize">{crop?.harvest_cycle}</span>
                        </span>
                        <span className="font-medium text-success">ROI: {tree.expected_roi_percent}%</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-xs text-textSecondary">Price / tree</div>
                            <div className="text-xl font-bold text-text">{formatRupiah(tree.price_idr)}</div>
                        </div>
                        <Link
                            href={route('trees.show', tree.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary hover:bg-primary-dark"
                        >
                            Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
