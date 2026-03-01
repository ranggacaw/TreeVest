<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AuditEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFruitTypeRequest;
use App\Http\Requests\Admin\UpdateFruitTypeRequest;
use App\Models\FruitType;
use App\Services\AuditLogService;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FruitTypeController extends Controller
{
    public function index()
    {
        $query = FruitType::withCount('fruitCrops');

        if (request()->has('is_active') && request()->is_active !== '') {
            $query->where('is_active', request()->boolean('is_active'));
        }

        $fruitTypes = $query->orderBy('name')->paginate(20);

        return Inertia::render('Admin/FruitTypes/Index', [
            'fruitTypes' => $fruitTypes,
            'filters' => [
                'is_active' => request()->input('is_active'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/FruitTypes/Create');
    }

    public function store(StoreFruitTypeRequest $request)
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        } else {
            $data['slug'] = Str::slug($data['slug']);
        }

        $fruitType = FruitType::create($data);

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_ACTION, [
            'action' => 'fruit_type.created',
            'fruit_type_id' => $fruitType->id,
            'name' => $fruitType->name,
        ]);

        return redirect()->route('admin.fruit-types.index')->with('success', 'Fruit type created successfully.');
    }

    public function show(FruitType $fruitType)
    {
        $fruitType->load(['fruitCrops' => function ($query) {
            $query->with('farm')->orderBy('created_at', 'desc')->limit(10);
        }]);

        return Inertia::render('Admin/FruitTypes/Show', [
            'fruitType' => $fruitType,
        ]);
    }

    public function edit(FruitType $fruitType)
    {
        return Inertia::render('Admin/FruitTypes/Edit', [
            'fruitType' => $fruitType,
        ]);
    }

    public function update(UpdateFruitTypeRequest $request, FruitType $fruitType)
    {
        $data = $request->validated();

        if (isset($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        }

        $fruitType->update($data);

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_ACTION, [
            'action' => 'fruit_type.updated',
            'fruit_type_id' => $fruitType->id,
            'name' => $fruitType->name,
        ]);

        return redirect()->route('admin.fruit-types.index')->with('success', 'Fruit type updated successfully.');
    }

    public function destroy(FruitType $fruitType)
    {
        $associatedCropsCount = $fruitType->fruitCrops()->count();

        if ($associatedCropsCount > 0) {
            return back()->with('error', "Cannot delete fruit type. It has {$associatedCropsCount} associated fruit crop(s).");
        }

        $fruitTypeName = $fruitType->name;
        $fruitTypeId = $fruitType->id;

        $fruitType->delete();

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_ACTION, [
            'action' => 'fruit_type.deleted',
            'fruit_type_id' => $fruitTypeId,
            'name' => $fruitTypeName,
        ]);

        return redirect()->route('admin.fruit-types.index')->with('success', 'Fruit type deleted successfully.');
    }
}
