<?php

namespace App\Http\Controllers\FarmOwner;

use App\Enums\GrowthMilestoneType;
use App\Enums\TreeHealthStatus;
use App\Http\Controllers\Controller;
use App\Models\Lot;
use App\Models\Tree;
use App\Models\TreeGrowthTimeline;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GrowthTimelineController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();

        // Get all growth timeline entries for farm owner's lots
        $timelines = TreeGrowthTimeline::whereHas('lot', function ($query) use ($user) {
            $query->whereHas('rack.warehouse.farm', function ($farmQuery) use ($user) {
                $farmQuery->where('owner_id', $user->id);
            });
        })
            ->with([
                'tree:id,tree_identifier',
                'lot:id,name',
                'author:id,name',
            ])
            ->orderBy('recorded_at', 'desc')
            ->paginate(20);

        return Inertia::render('FarmOwner/GrowthTimeline/Index', [
            'timelines' => $timelines->through(fn ($entry) => [
                'id' => $entry->id,
                'tree' => [
                    'id' => $entry->tree->id,
                    'identifier' => $entry->tree->tree_identifier,
                ],
                'lot' => [
                    'id' => $entry->lot->id,
                    'name' => $entry->lot->name,
                ],
                'milestone_type' => $entry->milestone_type->value,
                'milestone_type_label' => $entry->milestone_type->label(),
                'milestone_type_icon' => $entry->milestone_type->icon(),
                'milestone_type_color' => $entry->milestone_type->color(),
                'health_status' => $entry->health_status->value,
                'health_status_label' => $entry->health_status->label(),
                'title' => $entry->title,
                'visibility' => $entry->visibility,
                'recorded_at' => $entry->recorded_at,
                'author' => $entry->author ? ['name' => $entry->author->name] : null,
            ]),
        ]);
    }

    public function create(Request $request, int $lot_id)
    {
        $user = $request->user();

        // Load lot with trees and verify ownership
        $lot = Lot::with([
            'rack.warehouse.farm',
            'trees:id,tree_identifier,lot_id',
        ])->findOrFail($lot_id);

        // Authorize farm ownership
        if ($lot->rack->warehouse->farm->owner_id !== $user->id) {
            abort(403, 'Unauthorized access to this lot.');
        }

        return Inertia::render('FarmOwner/GrowthTimeline/Create', [
            'lot' => [
                'id' => $lot->id,
                'name' => $lot->name,
                'rack' => $lot->rack ? [
                    'name' => $lot->rack->name,
                    'warehouse' => $lot->rack->warehouse ? [
                        'name' => $lot->rack->warehouse->name,
                    ] : null,
                ] : null,
                'trees' => $lot->trees->map(fn ($tree) => [
                    'id' => $tree->id,
                    'identifier' => $tree->tree_identifier,
                ])->toArray(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'lot_id' => ['required', 'integer', 'exists:lots,id'],
            'tree_ids' => ['required', 'array', 'min:1'],
            'tree_ids.*' => ['required', 'integer', 'exists:trees,id'],
            'milestone_type' => ['required', Rule::enum(GrowthMilestoneType::class)],
            'health_status' => ['required', Rule::enum(TreeHealthStatus::class)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'photos' => ['nullable', 'array', 'max:10'],
            'photos.*' => ['image', 'max:5120'], // 5MB per image
            'height_cm' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'trunk_diameter_cm' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'fruit_count' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'visibility' => ['required', Rule::in(['public', 'private'])],
        ]);

        // Verify lot ownership
        $lot = Lot::with('rack.warehouse.farm')->findOrFail($validated['lot_id']);
        if ($lot->rack->warehouse->farm->owner_id !== $user->id) {
            abort(403, 'Unauthorized access to this lot.');
        }

        // Verify all trees belong to the lot
        $trees = Tree::whereIn('id', $validated['tree_ids'])
            ->where('lot_id', $lot->id)
            ->get();

        if ($trees->count() !== count($validated['tree_ids'])) {
            return back()->withErrors([
                'tree_ids' => 'Some selected trees do not belong to this lot.',
            ]);
        }

        DB::transaction(function () use ($validated, $trees, $user) {
            // Handle photo uploads
            $photoPaths = [];
            if (! empty($validated['photos'])) {
                foreach ($validated['photos'] as $photo) {
                    $path = $photo->store('growth-timeline', 'public');
                    $photoPaths[] = $path;
                }
            }

            // Create a timeline entry for each selected tree
            foreach ($trees as $tree) {
                TreeGrowthTimeline::create([
                    'tree_id' => $tree->id,
                    'lot_id' => $tree->lot_id,
                    'milestone_type' => $validated['milestone_type'],
                    'health_status' => $validated['health_status'],
                    'title' => $validated['title'],
                    'description' => $validated['description'],
                    'photos' => $photoPaths,
                    'height_cm' => $validated['height_cm'] ?? null,
                    'trunk_diameter_cm' => $validated['trunk_diameter_cm'] ?? null,
                    'fruit_count' => $validated['fruit_count'] ?? null,
                    'visibility' => $validated['visibility'],
                    'author_id' => $user->id,
                    'recorded_at' => now(),
                ]);
            }
        });

        return redirect()->route('farm-owner.growth-timeline.index')
            ->with('success', 'Growth update recorded successfully for '.count($validated['tree_ids']).' tree(s).');
    }

    public function show(int $id)
    {
        $user = request()->user();

        $timeline = TreeGrowthTimeline::with([
            'tree:id,tree_identifier',
            'lot:id,name',
            'author:id,name',
        ])->findOrFail($id);

        // Verify ownership
        $lot = $timeline->lot()->with('rack.warehouse.farm')->first();
        if ($lot->rack->warehouse->farm->owner_id !== $user->id) {
            abort(403, 'Unauthorized access to this timeline entry.');
        }

        return Inertia::render('FarmOwner/GrowthTimeline/Show', [
            'timeline' => [
                'id' => $timeline->id,
                'tree' => [
                    'id' => $timeline->tree->id,
                    'identifier' => $timeline->tree->tree_identifier,
                ],
                'lot' => [
                    'id' => $timeline->lot->id,
                    'name' => $timeline->lot->name,
                ],
                'milestone_type' => $timeline->milestone_type->value,
                'milestone_type_label' => $timeline->milestone_type->label(),
                'milestone_type_icon' => $timeline->milestone_type->icon(),
                'milestone_type_color' => $timeline->milestone_type->color(),
                'health_status' => $timeline->health_status->value,
                'health_status_label' => $timeline->health_status->label(),
                'health_status_icon' => $timeline->health_status->icon(),
                'health_status_color' => $timeline->health_status->color(),
                'title' => $timeline->title,
                'description' => $timeline->description,
                'photos' => $timeline->getPhotoUrls(),
                'height_cm' => $timeline->height_cm,
                'trunk_diameter_cm' => $timeline->trunk_diameter_cm,
                'fruit_count' => $timeline->fruit_count,
                'visibility' => $timeline->visibility,
                'recorded_at' => $timeline->recorded_at,
                'author' => $timeline->author ? ['name' => $timeline->author->name] : null,
                'created_at' => $timeline->created_at,
                'updated_at' => $timeline->updated_at,
            ],
        ]);
    }

    public function edit(int $id)
    {
        $user = request()->user();

        $timeline = TreeGrowthTimeline::with([
            'tree:id,tree_identifier',
            'lot:id,name',
        ])->findOrFail($id);

        // Verify ownership
        $lot = $timeline->lot()->with('rack.warehouse.farm')->first();
        if ($lot->rack->warehouse->farm->owner_id !== $user->id) {
            abort(403, 'Unauthorized access to this timeline entry.');
        }

        return Inertia::render('FarmOwner/GrowthTimeline/Edit', [
            'timeline' => [
                'id' => $timeline->id,
                'tree' => [
                    'id' => $timeline->tree->id,
                    'identifier' => $timeline->tree->tree_identifier,
                ],
                'lot' => [
                    'id' => $timeline->lot->id,
                    'name' => $timeline->lot->name,
                ],
                'milestone_type' => $timeline->milestone_type->value,
                'health_status' => $timeline->health_status->value,
                'title' => $timeline->title,
                'description' => $timeline->description,
                'photos' => $timeline->getPhotoUrls(),
                'height_cm' => $timeline->height_cm,
                'trunk_diameter_cm' => $timeline->trunk_diameter_cm,
                'fruit_count' => $timeline->fruit_count,
                'visibility' => $timeline->visibility,
                'recorded_at' => $timeline->recorded_at,
            ],
        ]);
    }

    public function update(Request $request, int $id)
    {
        $user = $request->user();

        $timeline = TreeGrowthTimeline::findOrFail($id);

        // Verify ownership
        $lot = $timeline->lot()->with('rack.warehouse.farm')->first();
        if ($lot->rack->warehouse->farm->owner_id !== $user->id) {
            abort(403, 'Unauthorized access to this timeline entry.');
        }

        $validated = $request->validate([
            'milestone_type' => ['required', Rule::enum(GrowthMilestoneType::class)],
            'health_status' => ['required', Rule::enum(TreeHealthStatus::class)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'new_photos' => ['nullable', 'array', 'max:10'],
            'new_photos.*' => ['image', 'max:5120'],
            'keep_photos' => ['nullable', 'array'],
            'keep_photos.*' => ['string'],
            'height_cm' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'trunk_diameter_cm' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'fruit_count' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'visibility' => ['required', Rule::in(['public', 'private'])],
        ]);

        DB::transaction(function () use ($validated, $timeline) {
            // Handle photo management
            $existingPhotos = $timeline->photos ?? [];
            $keptPhotos = $validated['keep_photos'] ?? [];

            // Delete photos that are not kept
            foreach ($existingPhotos as $photo) {
                if (! in_array($photo, $keptPhotos)) {
                    Storage::disk('public')->delete($photo);
                }
            }

            $photoPaths = $keptPhotos;

            // Upload new photos
            if (! empty($validated['new_photos'])) {
                foreach ($validated['new_photos'] as $photo) {
                    $path = $photo->store('growth-timeline', 'public');
                    $photoPaths[] = $path;
                }
            }

            $timeline->update([
                'milestone_type' => $validated['milestone_type'],
                'health_status' => $validated['health_status'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'photos' => $photoPaths,
                'height_cm' => $validated['height_cm'] ?? null,
                'trunk_diameter_cm' => $validated['trunk_diameter_cm'] ?? null,
                'fruit_count' => $validated['fruit_count'] ?? null,
                'visibility' => $validated['visibility'],
            ]);
        });

        return redirect()->route('farm-owner.growth-timeline.show', $timeline->id)
            ->with('success', 'Growth update modified successfully.');
    }

    public function destroy(int $id)
    {
        $user = request()->user();

        $timeline = TreeGrowthTimeline::findOrFail($id);

        // Verify ownership
        $lot = $timeline->lot()->with('rack.warehouse.farm')->first();
        if ($lot->rack->warehouse->farm->owner_id !== $user->id) {
            abort(403, 'Unauthorized access to this timeline entry.');
        }

        DB::transaction(function () use ($timeline) {
            // Delete associated photos
            if (! empty($timeline->photos)) {
                foreach ($timeline->photos as $photo) {
                    Storage::disk('public')->delete($photo);
                }
            }

            $timeline->delete();
        });

        return redirect()->route('farm-owner.growth-timeline.index')
            ->with('success', 'Growth update deleted successfully.');
    }
}
