<?php

namespace App\Http\Controllers\FarmOwner;

use App\Events\HealthUpdateCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHealthUpdateRequest;
use App\Http\Requests\UpdateHealthUpdateRequest;
use App\Jobs\ProcessHealthUpdate;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\TreeHealthUpdate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HealthUpdateController extends Controller
{
    public function index(Request $request): Response
    {
        $farms = $request->user()->farms()->active()->with('fruitCrops')->get();

        $updates = TreeHealthUpdate::whereHas('fruitCrop.farm', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })
        ->with(['fruitCrop.farm', 'author'])
        ->orderBy('created_at', 'desc')
        ->paginate(15);

        return Inertia::render('FarmOwner/HealthUpdates/Index', [
            'healthUpdates' => $updates,
            'farms' => $farms,
        ]);
    }

    public function create(Request $request): Response
    {
        $farms = $request->user()->farms()
            ->active()
            ->with(['fruitCrops.fruitType'])
            ->get();

        return Inertia::render('FarmOwner/HealthUpdates/Create', [
            'farms' => $farms,
        ]);
    }

    public function store(StoreHealthUpdateRequest $request): RedirectResponse
    {
        $fruitCrop = FruitCrop::findOrFail($request->input('fruit_crop_id'));
        
        Gate::authorize('manage-health-updates', $fruitCrop->farm);

        $photos = $this->handlePhotoUpload($request->file('photos', []), $fruitCrop);

        $healthUpdate = TreeHealthUpdate::create([
            'fruit_crop_id' => $request->input('fruit_crop_id'),
            'author_id' => $request->user()->id,
            'severity' => $request->input('severity'),
            'update_type' => $request->input('update_type'),
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'photos' => $photos,
            'visibility' => $request->input('visibility', 'investors_only'),
        ]);

        ProcessHealthUpdate::dispatch($healthUpdate);

        event(new HealthUpdateCreated($healthUpdate));

        Log::info('Health update created', [
            'id' => $healthUpdate->id,
            'fruit_crop_id' => $healthUpdate->fruit_crop_id,
            'author_id' => $healthUpdate->author_id,
        ]);

        return redirect()->route('farm-owner.health-updates.index')
            ->with('success', 'Health update created successfully.');
    }

    public function edit(Request $request, TreeHealthUpdate $healthUpdate): Response
    {
        Gate::authorize('manage-health-updates', $healthUpdate->fruitCrop->farm);

        if (!$healthUpdate->isEditable()) {
            abort(403, 'This health update can no longer be edited.');
        }

        $healthUpdate->load(['fruitCrop.farm', 'fruitCrop.fruitType']);

        $farms = $request->user()->farms()
            ->active()
            ->with(['fruitCrops.fruitType'])
            ->get();

        return Inertia::render('FarmOwner/HealthUpdates/Edit', [
            'healthUpdate' => $healthUpdate,
            'farms' => $farms,
        ]);
    }

    public function update(UpdateHealthUpdateRequest $request, TreeHealthUpdate $healthUpdate): RedirectResponse
    {
        Gate::authorize('manage-health-updates', $healthUpdate->fruitCrop->farm);

        if (!$healthUpdate->isEditable()) {
            abort(403, 'This health update can no longer be edited.');
        }

        $updateData = $request->validated();

        if ($request->hasFile('photos')) {
            $this->deleteOldPhotos($healthUpdate);
            $updateData['photos'] = $this->handlePhotoUpload(
                $request->file('photos'),
                $healthUpdate->fruitCrop
            );
        }

        $healthUpdate->update($updateData);

        return redirect()->route('farm-owner.health-updates.index')
            ->with('success', 'Health update updated successfully.');
    }

    public function destroy(Request $request, TreeHealthUpdate $healthUpdate): RedirectResponse
    {
        Gate::authorize('manage-health-updates', $healthUpdate->fruitCrop->farm);

        if (!$healthUpdate->isEditable()) {
            abort(403, 'This health update can no longer be deleted.');
        }

        $this->deleteOldPhotos($healthUpdate);
        $healthUpdate->delete();

        return redirect()->route('farm-owner.health-updates.index')
            ->with('success', 'Health update deleted successfully.');
    }

    private function handlePhotoUpload(array $photos, FruitCrop $fruitCrop): array
    {
        if (empty($photos)) {
            return [];
        }

        $uploadedPaths = [];
        $year = now()->year;
        $month = now()->format('m');

        foreach ($photos as $photo) {
            $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();
            $path = $photo->storeAs(
                "health-updates/{$fruitCrop->id}/{$year}/{$month}",
                $filename,
                'public'
            );

            $uploadedPaths[] = $path;
        }

        return $uploadedPaths;
    }

    private function deleteOldPhotos(TreeHealthUpdate $healthUpdate): void
    {
        if (empty($healthUpdate->photos)) {
            return;
        }

        foreach ($healthUpdate->photos as $photo) {
            Storage::disk('public')->delete($photo);
            
            $thumbnailPath = str_replace('/photos/', '/photos/thumbnails/', $photo);
            Storage::disk('public')->delete($thumbnailPath);
        }
    }
}
