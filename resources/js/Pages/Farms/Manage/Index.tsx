import React from 'react';
import { usePage } from '@inertiajs/react';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import { Farm } from '@/types';

interface Props {
    farms: {
        data: Farm[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Index({ farms }: Props) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
                        <p className="mt-2 text-gray-600">
                            Manage your farm listings
                        </p>
                    </div>
                    <a
                        href="/farms/manage/create"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Add New Farm
                    </a>
                </div>

                {farms.data.length > 0 ? (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Farm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Capacity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Images
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {farms.data.map((farm) => (
                                    <tr key={farm.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {farm.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {farm.city}, {farm.country}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <FarmStatusBadge status={farm.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {farm.size_hectares} ha
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {farm.capacity_trees?.toLocaleString()} trees
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {farm.images?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a
                                                href={`/farms/manage/${farm.id}`}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                            >
                                                View
                                            </a>
                                            <a
                                                href={`/farms/manage/${farm.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-500">No farms yet</p>
                        <a
                            href="/farms/manage/create"
                            className="mt-4 inline-block text-green-600 hover:text-green-700"
                        >
                            Create your first farm
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
