import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Farm } from '@/types';

interface Props {
    farm: Farm;
    isEditable?: boolean;
}

export default function FruitCropsManagement({ farm, isEditable = false }: Props) {
    const [expandedCrops, setExpandedCrops] = useState<Record<number, boolean>>({});
    const [selectedTrees, setSelectedTrees] = useState<Record<number, number[]>>({});

    const deleteTreeForm = useForm({});
    const deleteCropForm = useForm({});
    const bulkDeleteTreesForm = useForm({});

    const toggleCrop = (id: number) => {
        setExpandedCrops(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleSelectAll = (cropId: number, treeIds: number[]) => {
        setSelectedTrees(prev => {
            const current = prev[cropId] || [];
            if (current.length === treeIds.length) {
                return { ...prev, [cropId]: [] };
            }
            return { ...prev, [cropId]: treeIds };
        });
    };

    const toggleTreeSelection = (cropId: number, treeId: number) => {
        setSelectedTrees(prev => {
            const current = prev[cropId] || [];
            if (current.includes(treeId)) {
                return { ...prev, [cropId]: current.filter(id => id !== treeId) };
            }
            return { ...prev, [cropId]: [...current, treeId] };
        });
    };

    const deleteSelectedTrees = (cropId: number) => {
        const treeIds = selectedTrees[cropId] || [];
        if (treeIds.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${treeIds.length} tree(s)?`)) {
            bulkDeleteTreesForm.delete(`${route('farm-owner.trees.bulk-destroy')}?trees=${treeIds.join(',')}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedTrees(prev => ({ ...prev, [cropId]: [] }));
                }
            });
        }
    };

    const printAllTreeIds = (crop: any) => {
        const trees = crop.trees || [];
        if (trees.length === 0) {
            alert('No trees found for this crop.');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const treeListHtml = trees.map((tree: any) => `
            <div class="label">
                <p>${crop.fruit_type?.name} - ${crop.variant}</p>
                <h1>${tree.tree_identifier}</h1>
                <div class="farm">${farm.name}</div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Labels - ${crop.variant}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: sans-serif;
                            text-align: center;
                        }
                        .label {
                            border: 3px solid black;
                            padding: 40px;
                            border-radius: 15px;
                            margin: 20px auto;
                            max-width: 80%;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            min-height: 300px;
                            break-after: page;
                        }
                        .label:last-child {
                            break-after: auto;
                        }
                        h1 { font-size: 4rem; margin: 10px 0; letter-spacing: 2px; }
                        p { font-size: 1.8rem; color: #333; margin: 0; font-weight: bold; text-transform: uppercase; }
                        .farm { font-size: 1.1rem; color: #666; margin-top: 15px; font-weight: normal; }
                        @media print {
                            @page { margin: 0; }
                            .label {
                                margin: 0 auto;
                                height: 100vh;
                                border: 3px solid black; /* Keep border for print */
                                max-width: 100%;
                                border-radius: 0;
                                width: 100vw;
                            }
                        }
                    </style>
                </head>
                <body>
                    \${treeListHtml}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Fruit Crops {farm.fruit_crops && farm.fruit_crops.length > 0 && `(${farm.fruit_crops.length})`}
                </h2>
                <Link
                    href={`${route('farm-owner.crops.create')}?farm_id=${farm.id}`}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition"
                >
                    + Add Crop
                </Link>
            </div>

            {farm.fruit_crops && farm.fruit_crops.length > 0 ? (
                <div className="space-y-4">
                    {farm.fruit_crops.map((crop: any) => (
                        <div key={crop.id} className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100/50 transition-colors"
                                onClick={() => toggleCrop(crop.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`transition-transform duration-200 ${expandedCrops[crop.id] ? 'rotate-180' : ''}`}>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{crop.variant}</p>
                                        <p className="text-xs text-gray-500">{crop.fruit_type?.name} — <span className="capitalize">{crop.harvest_cycle?.replace('_', ' ')}</span></p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Inventory: {
                                                crop.trees
                                                    ? crop.trees.filter((t: any) => t.status === 'productive').length
                                                    : (crop.productive_trees ?? 0)
                                            } productive / {
                                                crop.trees
                                                    ? crop.trees.length
                                                    : (crop.total_trees ?? 0)
                                            } total trees
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {isEditable ? (
                                        <>
                                            <Link
                                                href={route('farm-owner.crops.edit', crop.id)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-white px-2 py-1 border border-gray-200 rounded shadow-sm hover:shadow"
                                            >
                                                Edit Crop
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this crop and all its trees?')) {
                                                        deleteCropForm.delete(route('farm-owner.crops.destroy', crop.id), {
                                                            preserveScroll: true
                                                        });
                                                    }
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium bg-white px-2 py-1 border border-gray-200 rounded shadow-sm hover:shadow"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                disabled
                                                className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 border border-gray-200 rounded cursor-not-allowed opacity-50"
                                            >
                                                Edit Crop
                                            </button>
                                            <button
                                                disabled
                                                className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 border border-gray-200 rounded cursor-not-allowed opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    <Link
                                        href={`${route('farm-owner.trees.create')}?crop_id=${crop.id}`}
                                        className="inline-flex items-center px-2.5 py-1 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition shadow-sm"
                                    >
                                        + Add Tree
                                    </Link>
                                    {isEditable ? (
                                        <button
                                            type="button"
                                            onClick={() => printAllTreeIds(crop)}
                                            className="inline-flex items-center p-1 bg-white border border-gray-300 rounded text-gray-600 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition"
                                            title="Print All Tree Labels"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center p-1 bg-gray-50 border border-gray-200 rounded text-gray-400 cursor-not-allowed opacity-50"
                                            title="Print All Tree Labels"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                        </button>
                                    )}
                                    {!isEditable && !expandedCrops[crop.id] && (
                                        <span className="text-xs text-gray-400 italic">Expand for details</span>
                                    )}
                                </div>
                            </div>

                            {expandedCrops[crop.id] && (
                                <div className="pb-4 border-t border-gray-200 bg-white">
                                    <div className="px-4 py-3 bg-white">
                                        {crop.description && (
                                            <p className="text-sm text-gray-600 mb-4">{crop.description}</p>
                                        )}
                                        
                                        {crop.trees && crop.trees.length > 0 ? (
                                            <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
                                                {isEditable && selectedTrees[crop.id]?.length > 0 && (
                                                    <div className="bg-red-50 px-4 py-2 border-b border-red-200 flex items-center justify-between">
                                                        <span className="text-xs text-red-700">{selectedTrees[crop.id].length} tree(s) selected</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteSelectedTrees(crop.id)}
                                                            className="text-xs text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                                                        >
                                                            Delete Selected
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-xs divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr className="text-gray-500 uppercase tracking-wider">
                                                                {isEditable && (
                                                                    <th className="py-2.5 px-4 text-left font-medium">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedTrees[crop.id]?.length === crop.trees.length && crop.trees.length > 0}
                                                                            onChange={() => toggleSelectAll(crop.id, crop.trees.map((t: any) => t.id))}
                                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                    </th>
                                                                )}
                                                                <th className="py-2.5 px-4 text-left font-medium">Tree ID</th>
                                                                <th className="py-2.5 px-4 text-left font-medium">Age/Lifespan</th>
                                                                <th className="py-2.5 px-4 text-left font-medium">Status</th>
                                                                <th className="py-2.5 px-4 text-left font-medium">Price</th>
                                                                <th className="py-2.5 px-4 text-center font-medium">ROI</th>
                                                                <th className="py-2.5 px-4 text-right font-medium">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {crop.trees.map((tree: any) => (
                                                                <tr key={tree.id} className="text-gray-700 hover:bg-gray-50/80 transition-colors">
                                                                    {isEditable && (
                                                                        <td className="py-2 px-4">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedTrees[crop.id]?.includes(tree.id) || false}
                                                                                onChange={() => toggleTreeSelection(crop.id, tree.id)}
                                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            />
                                                                        </td>
                                                                    )}
                                                                    <td className="py-2 px-4 font-mono">{tree.tree_identifier}</td>
                                                                    <td className="py-2 px-4">{tree.age_years} / {tree.productive_lifespan_years} yrs</td>
                                                                    <td className="py-2 px-4 capitalize">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${tree.status === 'productive' ? 'bg-green-100 text-green-800' :
                                                                            tree.status === 'growing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                                                                            }`}>
                                                                            {tree.status?.replace('_', ' ')}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2 px-4">Rp {(tree.price_cents / 100).toLocaleString('id-ID')}</td>
                                                                    <td className="py-2 px-4 text-center">
                                                                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                                                                            {tree.expected_roi_percent}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2 px-4 text-right">
                                                                        {isEditable ? (
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <Link
                                                                                    href={route('farm-owner.trees.edit', tree.id)}
                                                                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                                                >
                                                                                    Edit
                                                                                </Link>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        if (confirm('Are you sure you want to delete this tree?')) {
                                                                                            deleteTreeForm.delete(route('farm-owner.trees.destroy', tree.id), {
                                                                                                preserveScroll: true
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray-400 font-medium cursor-not-allowed opacity-50">
                                                                                Edit
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-3 bg-white border border-dashed border-gray-300 rounded-md">
                                                <p className="text-xs text-gray-500">No trees setup yet. {isEditable ? "Investors can't invest without trees." : ""}</p>
                                                <Link
                                                    href={`${route('farm-owner.trees.create')}?crop_id=${crop.id}`}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Add first tree →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500 mb-3">No fruit crops have been added to this farm.</p>
                    <Link
                        href={`${route('farm-owner.crops.create')}?farm_id=${farm.id}`}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition shadow-sm"
                    >
                        + Add Your First Crop
                    </Link>
                    <p className="text-xs text-gray-400 mt-2">Crops define the variants of fruit grown (e.g., Montong Durian).</p>
                </div>
            )}
        </div>
    );
}
