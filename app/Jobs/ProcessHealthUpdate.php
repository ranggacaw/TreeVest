<?php

namespace App\Jobs;

use App\Models\TreeHealthUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProcessHealthUpdate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public TreeHealthUpdate $healthUpdate
    ) {}

    public function handle(): void
    {
        $this->processPhotos();
    }

    private function processPhotos(): void
    {
        $photos = $this->healthUpdate->photos ?? [];

        if (empty($photos)) {
            return;
        }

        try {
            $manager = new ImageManager(new Driver());
            $disk = Storage::disk('public');

            foreach ($photos as $photoPath) {
                if (!$disk->exists($photoPath)) {
                    continue;
                }

                $image = $manager->read($disk->get($photoPath));
                
                $maxWidth = 1920;
                $maxHeight = 1080;
                
                if ($image->width() > $maxWidth || $image->height() > $maxHeight) {
                    $image->scaleDown($maxWidth, $maxHeight);
                    $disk->put($photoPath, (string) $image->encode());
                }

                $thumbnailPath = str_replace('/photos/', '/photos/thumbnails/', $photoPath);
                $thumbnailDir = dirname($thumbnailPath);
                
                if (!$disk->exists($thumbnailDir)) {
                    $disk->makeDirectory($thumbnailDir);
                }

                $thumbnail = $manager->read($disk->get($photoPath));
                $thumbnail->scale(300, 300);
                $disk->put($thumbnailPath, (string) $thumbnail->encode());
            }

            Log::info('Health update photos processed', [
                'health_update_id' => $this->healthUpdate->id,
                'photo_count' => count($photos),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to process health update photos', [
                'health_update_id' => $this->healthUpdate->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessHealthUpdate job failed', [
            'health_update_id' => $this->healthUpdate->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
