import { useCallback } from 'react';

interface Props {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export default function ImageUploader({ photos, onChange, maxPhotos = 5 }: Props) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      const newPhotos = [...photos, ...files].slice(0, maxPhotos);
      onChange(newPhotos);
    },
    [photos, onChange, maxPhotos]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        const newPhotos = [...photos, ...files].slice(0, maxPhotos);
        onChange(newPhotos);
      }
    },
    [photos, onChange, maxPhotos]
  );

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
          disabled={photos.length >= maxPhotos}
        />
        <label
          htmlFor="photo-upload"
          className="cursor-pointer"
        >
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">
              Drop photos here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WebP - Max 5MB each
            </p>
          </div>
        </label>
      </div>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Preview ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        {photos.length}/{maxPhotos} photos uploaded
      </p>
    </div>
  );
}
