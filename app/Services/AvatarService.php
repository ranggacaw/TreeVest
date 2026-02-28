<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AvatarService
{
    protected ImageManager $imageManager;

    protected int $maxSize = 2097152; // 2MB

    protected array $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    protected int $maxWidth = 512;

    protected int $maxHeight = 512;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver);
    }

    public function upload(User $user, UploadedFile $file): string
    {
        $this->validateFile($file);

        $image = $this->imageManager->read($file);
        $image = $image->resize($this->maxWidth, $this->maxHeight, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        $fileName = $this->generateFileName($user, 'jpg');
        $directory = "avatars/{$user->id}";

        Storage::disk('public')->makeDirectory($directory);

        $path = $directory.'/'.$fileName;
        Storage::disk('public')->put($path, $image->toJpeg(85));

        $this->deleteOldAvatar($user);

        $user->avatar_url = $path;
        $user->save();

        return $path;
    }

    public function delete(User $user): bool
    {
        if (! $user->avatar_url) {
            return false;
        }

        Storage::disk('public')->delete($user->avatar_url);

        $user->avatar_url = null;
        $user->save();

        return true;
    }

    public function getPublicUrl(string $avatarUrl): string
    {
        return Storage::disk('public')->url($avatarUrl);
    }

    protected function validateFile(UploadedFile $file): void
    {
        if ($file->getSize() > $this->maxSize) {
            throw new \InvalidArgumentException('Avatar file size must not exceed 2MB.');
        }

        if (! in_array($file->getMimeType(), $this->allowedMimeTypes)) {
            throw new \InvalidArgumentException('Avatar file must be JPEG, PNG, or WebP format.');
        }
    }

    protected function deleteOldAvatar(User $user): void
    {
        if ($user->avatar_url) {
            Storage::disk('public')->delete($user->avatar_url);
        }
    }

    protected function generateFileName(User $user, string $extension): string
    {
        return $user->id.'_'.time().'.'.$extension;
    }
}
