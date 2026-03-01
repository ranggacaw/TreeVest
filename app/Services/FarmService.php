<?php

namespace App\Services;

use App\Enums\AuditEventType;
use App\Enums\FarmStatus;
use App\Events\FarmApproved;
use App\Events\FarmReinstated;
use App\Events\FarmRejected;
use App\Events\FarmSuspended;
use App\Http\Requests\StoreFarmRequest;
use App\Http\Requests\UpdateFarmRequest;
use App\Models\Farm;
use App\Models\FarmCertification;
use App\Models\FarmImage;
use App\Models\User;
use App\Support\TransactionHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FarmService
{
    public function createFarm(User $owner, StoreFarmRequest $request): Farm
    {
        return TransactionHelper::smart(function () use ($owner, $request) {
            $farm = Farm::create([
                'owner_id' => $owner->id,
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'address' => $request->input('address'),
                'city' => $request->input('city'),
                'state' => $request->input('state'),
                'country' => $request->input('country'),
                'postal_code' => $request->input('postal_code'),
                'coordinates' => $this->createPoint(
                    $request->input('longitude'),
                    $request->input('latitude')
                ),
                'size_hectares' => $request->input('size_hectares'),
                'capacity_trees' => $request->input('capacity_trees'),
                'soil_type' => $request->input('soil_type'),
                'climate' => $request->input('climate'),
                'historical_performance' => $request->input('historical_performance'),
                'virtual_tour_url' => $request->input('virtual_tour_url'),
                'status' => FarmStatus::PENDING_APPROVAL,
            ]);

            $this->processImages($farm, $request->file('images', []));
            $this->processCertifications($farm, $request->input('certifications', []));

            AuditLogService::log($owner, AuditEventType::FARM_CREATED, [
                'farm_id' => $farm->id,
                'farm_name' => $farm->name,
            ]);

            return $farm;
        });
    }

    public function updateFarm(Farm $farm, UpdateFarmRequest $request): Farm
    {
        return TransactionHelper::smart(function () use ($farm, $request) {
            $farm->update([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'address' => $request->input('address'),
                'city' => $request->input('city'),
                'state' => $request->input('state'),
                'country' => $request->input('country'),
                'postal_code' => $request->input('postal_code'),
                'coordinates' => $this->createPoint(
                    $request->input('longitude'),
                    $request->input('latitude')
                ),
                'size_hectares' => $request->input('size_hectares'),
                'capacity_trees' => $request->input('capacity_trees'),
                'soil_type' => $request->input('soil_type'),
                'climate' => $request->input('climate'),
                'historical_performance' => $request->input('historical_performance'),
                'virtual_tour_url' => $request->input('virtual_tour_url'),
            ]);

            if ($farm->status === FarmStatus::ACTIVE) {
                $farm->requireReapproval();
            }

            if ($request->hasFile('images')) {
                $this->processImages($farm, $request->file('images', []));
            }

            if ($request->has('certifications')) {
                $this->processCertifications($farm, $request->input('certifications', []));
            }

            AuditLogService::log($farm->owner, AuditEventType::FARM_UPDATED, [
                'farm_id' => $farm->id,
                'farm_name' => $farm->name,
                'status' => $farm->status->value,
            ]);

            return $farm->fresh(['images', 'certifications']);
        });
    }

    public function deleteFarm(Farm $farm): void
    {
        TransactionHelper::smart(function () use ($farm) {
            foreach ($farm->images as $image) {
                Storage::disk('public')->delete($image->file_path);
            }

            $farm->images()->delete();
            $farm->certifications()->delete();
            $farm->delete();

            AuditLogService::log($farm->owner, AuditEventType::FARM_DELETED, [
                'farm_id' => $farm->id,
                'farm_name' => $farm->name,
            ]);
        });
    }

    public function approveFarm(Farm $farm, User $admin): Farm
    {
        $farm->approve($admin->id);

        AuditLogService::log($admin, AuditEventType::FARM_APPROVED, [
            'farm_id' => $farm->id,
            'farm_name' => $farm->name,
        ]);

        event(new FarmApproved($farm, $admin));

        return $farm->fresh();
    }

    public function rejectFarm(Farm $farm, User $admin, string $reason): Farm
    {
        $farm->reject($admin->id, $reason);

        AuditLogService::log($admin, AuditEventType::FARM_REJECTED, [
            'farm_id' => $farm->id,
            'farm_name' => $farm->name,
            'reason' => $reason,
        ]);

        event(new FarmRejected($farm, $admin, $reason));

        return $farm->fresh();
    }

    public function suspendFarm(Farm $farm, User $admin): Farm
    {
        $farm->suspend();

        AuditLogService::log($admin, AuditEventType::FARM_SUSPENDED, [
            'farm_id' => $farm->id,
            'farm_name' => $farm->name,
        ]);

        event(new FarmSuspended($farm, $admin));

        return $farm->fresh();
    }

    public function reinstateFarm(Farm $farm, User $admin): Farm
    {
        $farm->reinstate();

        AuditLogService::log($admin, AuditEventType::FARM_REINSTATED, [
            'farm_id' => $farm->id,
            'farm_name' => $farm->name,
        ]);

        event(new FarmReinstated($farm, $admin));

        return $farm->fresh();
    }

    public function getActiveFarms(Request $request)
    {
        $query = Farm::active()->with(['images', 'certifications']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('city', 'LIKE', "%{$search}%")
                    ->orWhere('country', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('country')) {
            $query->where('country', $request->input('country'));
        }

        if ($request->has('climate')) {
            $query->where('climate', $request->input('climate'));
        }

        return $query->orderBy('created_at', 'desc')->paginate(12);
    }

    public function getNearbyFarms(float $lat, float $lng, float $radiusKm = 50)
    {
        return Farm::active()
            ->selectRaw(
                'farms.*, ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) as distance',
                [$lng, $lat]
            )
            ->having('distance', '<=', $radiusKm * 1000)
            ->orderBy('distance')
            ->with(['images', 'certifications'])
            ->get();
    }

    protected function createPoint(float $lng, float $lat): string
    {
        return DB::raw("ST_GeomFromText('POINT($lng $lat)', 4326)");
    }

    protected function processImages(Farm $farm, array $images): void
    {
        foreach ($images as $index => $image) {
            if ($image->isValid()) {
                $filename = Str::uuid().'.'.$image->getClientOriginalExtension();
                $path = $image->storeAs("farms/{$farm->id}", $filename, 'public');

                FarmImage::create([
                    'farm_id' => $farm->id,
                    'file_path' => $path,
                    'original_filename' => $image->getClientOriginalName(),
                    'mime_type' => $image->getMimeType(),
                    'file_size' => $image->getSize(),
                    'is_featured' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }
    }

    protected function processCertifications(Farm $farm, array $certifications): void
    {
        $farm->certifications()->delete();

        foreach ($certifications as $cert) {
            $certData = [
                'farm_id' => $farm->id,
                'name' => $cert['name'],
                'issuer' => $cert['issuer'] ?? null,
                'certificate_number' => $cert['certificate_number'] ?? null,
                'issued_date' => $cert['issued_date'] ?? null,
                'expiry_date' => $cert['expiry_date'] ?? null,
                'notes' => $cert['notes'] ?? null,
            ];

            if (isset($cert['file']) && $cert['file']->isValid()) {
                $filename = Str::uuid().'.'.$cert['file']->getClientOriginalExtension();
                $path = $cert['file']->storeAs("farms/{$farm->id}/certifications", $filename, 'public');
                $certData['file_path'] = $path;
            }

            FarmCertification::create($certData);
        }
    }
}
