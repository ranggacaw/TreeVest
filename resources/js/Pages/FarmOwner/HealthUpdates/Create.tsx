import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import ImageUploader from '@/Components/ImageUploader';

interface Farm {
  id: number;
  name: string;
  fruit_crops: {
    id: number;
    variant: string;
    fruit_type: {
      name: string;
    };
  }[];
}

interface Props {
  farms: Farm[];
}

export default function Create({ farms }: Props) {
  const [selectedCrop, setSelectedCrop] = useState<number | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const { data, setData, post, processing, errors, transform } = useForm({
    fruit_crop_id: '',
    severity: 'low',
    update_type: 'routine',
    title: '',
    description: '',
    visibility: 'investors_only',
    photos: [] as File[],
  });

  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
    setData('photos', newPhotos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('farm-owner.health-updates.store'), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout title="Create Health Update" subtitle="Add a new health update">
      <Head title="Create Health Update" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Health Updates
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Crop
            </label>
            <select
              value={data.fruit_crop_id}
              onChange={(e) => setData('fruit_crop_id', e.target.value)}
              className="w-full rounded-lg border-gray-300"
              required
            >
              <option value="">Select a crop...</option>
              {farms.map((farm) => (
                <optgroup key={farm.id} label={farm.name}>
                  {farm.fruit_crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.fruit_type.name} - {crop.variant}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.fruit_crop_id && (
              <p className="mt-1 text-sm text-red-600">{errors.fruit_crop_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={data.severity}
                onChange={(e) => setData('severity', e.target.value)}
                className="w-full rounded-lg border-gray-300"
              >
                <option value="low">Low - Normal</option>
                <option value="medium">Medium - Attention Needed</option>
                <option value="high">High - Urgent</option>
                <option value="critical">Critical - Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Type
              </label>
              <select
                value={data.update_type}
                onChange={(e) => setData('update_type', e.target.value)}
                className="w-full rounded-lg border-gray-300"
              >
                <option value="routine">Routine Check</option>
                <option value="pest">Pest Issue</option>
                <option value="disease">Disease</option>
                <option value="damage">Physical Damage</option>
                <option value="weather_impact">Weather Impact</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              className="w-full rounded-lg border-gray-300"
              placeholder="Brief summary of the health update"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={6}
              className="w-full rounded-lg border-gray-300"
              placeholder="Detailed description of the crop health condition..."
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Max 5)
            </label>
            <ImageUploader
              photos={photos}
              onChange={handlePhotosChange}
              maxPhotos={5}
            />
            {(errors as Record<string, string>).photos && (
              <p className="mt-1 text-sm text-red-600">{(errors as Record<string, string>).photos}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="investors_only"
                  checked={data.visibility === 'investors_only'}
                  onChange={(e) => setData('visibility', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Investors Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={data.visibility === 'public'}
                  onChange={(e) => setData('visibility', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Public</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href={route('farm-owner.health-updates.index')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {processing ? 'Creating...' : 'Create Health Update'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
