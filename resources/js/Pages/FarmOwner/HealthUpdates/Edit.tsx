import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HealthUpdateForm from '@/Components/HealthUpdateForm';

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

interface HealthUpdate {
  id: number;
  fruit_crop_id: number;
  severity: string;
  update_type: string;
  title: string;
  description: string;
  visibility: string;
  photos: string[];
}

interface Props {
  healthUpdate: HealthUpdate;
  farms: Farm[];
}

export default function Edit({ healthUpdate, farms }: Props) {
  const [photos, setPhotos] = useState<File[]>([]);

  const { data, setData, processing, errors } = useForm({
    fruit_crop_id: String(healthUpdate.fruit_crop_id),
    severity: healthUpdate.severity,
    update_type: healthUpdate.update_type,
    title: healthUpdate.title,
    description: healthUpdate.description,
    visibility: healthUpdate.visibility,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('fruit_crop_id', data.fruit_crop_id);
    formData.append('severity', data.severity);
    formData.append('update_type', data.update_type);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('visibility', data.visibility);
    formData.append('_method', 'PUT');

    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    // Use router.post with _method override for file uploads
    router.post(route('farm-owner.health-updates.update', healthUpdate.id), formData, {
      forceFormData: true,
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={route('farm-owner.health-updates.index')}
            className="text-emerald-600 hover:text-emerald-700 text-sm"
          >
            ← Back to Health Updates
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Edit Health Update
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <HealthUpdateForm
            data={data}
            setData={setData}
            errors={errors}
            farms={farms}
            photos={photos}
            setPhotos={setPhotos}
            existingPhotos={healthUpdate.photos}
          />

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
              {processing ? 'Updating...' : 'Update Health Update'}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
