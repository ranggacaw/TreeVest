<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class MediaController extends Controller
{
    private const MAX_FILE_SIZE = 5242880;

    private const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    private const MAX_WIDTH = 1920;

    private const MAX_HEIGHT = 1080;

    private const THUMBNAIL_WIDTH = 400;

    private const THUMBNAIL_HEIGHT = 300;

    public function upload(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5'],
        ]);

        $file = $request->file('image');

        $this->validateImage($file);

        $filename = $this->generateFilename($file);
        $path = 'articles/'.$filename;

        $this->processAndStoreImage($file, $path);

        return response()->json([
            'url' => Storage::disk('public')->url($path),
            'path' => $path,
            'filename' => $filename,
        ]);
    }

    public function delete(Request $request)
    {
        $request->validate([
            'path' => ['required', 'string'],
        ]);

        $path = $request->input('path');

        if (! Storage::disk('public')->exists($path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        Storage::disk('public')->delete($path);

        return response()->json(['success' => true]);
    }

    private function validateImage(UploadedFile $file): void
    {
        if (! in_array($file->getMimeType(), self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException('Invalid image type. Allowed types: JPEG, PNG, GIF, WebP.');
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException('Image size exceeds 5MB limit.');
        }

        $image = Image::make($file);

        if ($image->width() > self::MAX_WIDTH || $image->height() > self::MAX_HEIGHT) {
            throw new \InvalidArgumentException(
                sprintf('Image dimensions exceed %dx%d pixels.', self::MAX_WIDTH, self::MAX_HEIGHT)
            );
        }
    }

    private function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $slug = Str::slug($file->getClientOriginalName(), '-');
        $timestamp = now()->format('YmdHis');

        return "{$slug}-{$timestamp}.{$extension}";
    }

    private function processAndStoreImage(UploadedFile $file, string $path): void
    {
        $image = Image::make($file);

        if ($image->width() > self::MAX_WIDTH || $image->height() > self::MAX_HEIGHT) {
            $image->resize(self::MAX_WIDTH, self::MAX_HEIGHT, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        $image->save(Storage::disk('public')->path($path), 85);

        $thumbnailPath = str_replace('articles/', 'articles/thumbnails/', $path);
        $thumbnail = Image::make($file);
        $thumbnail->fit(self::THUMBNAIL_WIDTH, self::THUMBNAIL_HEIGHT);
        $thumbnail->save(Storage::disk('public')->path($thumbnailPath), 80);
    }
}
