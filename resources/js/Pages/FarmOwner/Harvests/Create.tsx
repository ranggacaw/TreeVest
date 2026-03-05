import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps } from '@/types';
import { FormEvent } from 'react';

interface FruitType {
  id: number;
  name: string;
}

interface FruitCrop {
  id: number;
  variant: string;
  fruit_type: FruitType;
  farm: {
    id: number;
    name: string;
  };
}

interface Tree {
  id: number;
  tree_identifier: string;
  price_cents: number;
  expected_roi_percent: number;
  risk_rating: string;
  fruit_crop: FruitCrop;
}

interface Props extends PageProps {
  trees: Tree[];
}

export default function Create({ trees }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    tree_id: '',
    scheduled_date: '',
    estimated_yield_kg: '',
    notes: '',
  });

  // Group trees by farm name for optgroups
  const treesByFarm = trees.reduce<Record<string, { farmName: string; trees: Tree[] }>>(
    (acc, tree) => {
      const farmId = String(tree.fruit_crop.farm.id);
      if (!acc[farmId]) {
        acc[farmId] = { farmName: tree.fruit_crop.farm.name, trees: [] };
      }
      acc[farmId].trees.push(tree);
      return acc;
    },
    {},
  );

  const selectedTree = trees.find((t) => String(t.id) === data.tree_id) ?? null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('farm-owner.harvests.store'));
  };

  return (
    <AppLayout title="Schedule Harvest">
      <Head title="Schedule Harvest" />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href={route('farm-owner.harvests.index')}
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
          >
            ← Back to Harvests
          </Link>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Schedule Harvest</h1>
        <p className="mb-8 text-sm text-gray-500">
          Schedule an upcoming harvest for one of your trees.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-100 bg-white p-8 shadow-sm"
        >
          {/* Tree selector */}
          <div>
            <label
              htmlFor="tree_id"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Tree <span className="text-red-500">*</span>
            </label>
            <select
              id="tree_id"
              value={data.tree_id}
              onChange={(e) => setData('tree_id', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.tree_id
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
                }`}
              required
            >
              <option value="">Select a tree…</option>
              {Object.values(treesByFarm).map((group) => (
                <optgroup key={group.farmName} label={group.farmName}>
                  {group.trees.map((tree) => (
                    <option key={tree.id} value={tree.id}>
                      {tree.tree_identifier} —{' '}
                      {tree.fruit_crop.fruit_type.name} ({tree.fruit_crop.variant})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.tree_id && (
              <p className="mt-1 text-sm text-red-600">{errors.tree_id}</p>
            )}
            {trees.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                No investable trees found. Please add trees to your farms first.
              </p>
            )}
          </div>

          {/* Selected tree info card */}
          {selectedTree && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm">
              <p className="font-medium text-emerald-800">
                {selectedTree.tree_identifier}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-emerald-700">
                <span>Farm: {selectedTree.fruit_crop.farm.name}</span>
                <span>
                  Crop: {selectedTree.fruit_crop.fruit_type.name} —{' '}
                  {selectedTree.fruit_crop.variant}
                </span>
                <span>
                  ROI: {Number(selectedTree.expected_roi_percent).toFixed(1)}%
                </span>
                <span className="capitalize">
                  Risk: {selectedTree.risk_rating}
                </span>
              </div>
            </div>
          )}

          {/* Scheduled date */}
          <div>
            <label
              htmlFor="scheduled_date"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              id="scheduled_date"
              type="date"
              value={data.scheduled_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setData('scheduled_date', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.scheduled_date
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
                }`}
              required
            />
            {errors.scheduled_date && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
            )}
          </div>

          {/* Estimated yield */}
          <div>
            <label
              htmlFor="estimated_yield_kg"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Estimated Yield (kg){' '}
              <span className="text-gray-400 font-normal">— optional</span>
            </label>
            <div className="relative">
              <input
                id="estimated_yield_kg"
                type="number"
                min="0"
                step="0.01"
                value={data.estimated_yield_kg}
                onChange={(e) => setData('estimated_yield_kg', e.target.value)}
                placeholder="e.g. 250"
                className={`w-full rounded-lg border py-2.5 pl-3 pr-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.estimated_yield_kg
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-white'
                  }`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
                kg
              </span>
            </div>
            {errors.estimated_yield_kg && (
              <p className="mt-1 text-sm text-red-600">{errors.estimated_yield_kg}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Notes{' '}
              <span className="text-gray-400 font-normal">— optional</span>
            </label>
            <textarea
              id="notes"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              rows={4}
              placeholder="Any special instructions or observations for this harvest…"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.notes
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
                }`}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Link
              href={route('farm-owner.harvests.index')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing || trees.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Scheduling…
                </>
              ) : (
                'Schedule Harvest'
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
