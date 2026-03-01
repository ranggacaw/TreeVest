import ImageUploader from './ImageUploader';

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

interface FormData {
  fruit_crop_id: string;
  severity: string;
  update_type: string;
  title: string;
  description: string;
  visibility: string;
}

interface Props {
  data: FormData;
  setData: (key: keyof FormData, value: string) => void;
  errors: Partial<Record<keyof FormData | 'photos', string>>;
  farms: Farm[];
  photos: File[];
  setPhotos: (photos: File[]) => void;
  existingPhotos?: string[];
}

export default function HealthUpdateForm({
  data,
  setData,
  errors,
  farms,
  photos,
  setPhotos,
  existingPhotos = [],
}: Props) {
  return (
    <div className="space-y-6">
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

      {existingPhotos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Photos
          </label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {existingPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Existing photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {existingPhotos.length > 0 ? 'Add New Photos (Max 5)' : 'Photos (Max 5)'}
        </label>
        <ImageUploader
          photos={photos}
          onChange={setPhotos}
          maxPhotos={5}
        />
        {errors.photos && (
          <p className="mt-1 text-sm text-red-600">{errors.photos}</p>
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
    </div>
  );
}
