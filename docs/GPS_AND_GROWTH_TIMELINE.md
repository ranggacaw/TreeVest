# 🌍 GPS Coordinates & Growth Timeline Implementation Guide

## Overview

This document explains the implementation of **GPS coordinates tracking** and **growth timeline features** for the TreeVest platform. These features enhance transparency and investor trust by providing precise tree locations and visual growth progress tracking.

---

## 1. GPS Coordinates for Trees

### Database Changes

**Migration:** `database/migrations/2026_03_14_000001_add_gps_and_qr_to_trees_table.php`

Added the following fields to the `trees` table:

| Field | Type | Description |
|-------|------|-------------|
| `latitude` | `decimal(10, 8)` | Tree's GPS latitude coordinate |
| `longitude` | `decimal(11, 8)` | Tree's GPS longitude coordinate |
| `qr_code` | `string(100)` | Unique QR code for tree identification |

**Indexes:**
- Composite index on `(latitude, longitude)` for geospatial queries
- Unique index on `qr_code`

### Model Updates

**`app/Models/Tree.php`**

Added GPS-related methods:

```php
// Check if tree has GPS coordinates
public function hasLocation(): bool
{
    return $this->latitude !== null && $this->longitude !== null;
}

// Generate Google Maps URL
public function getGoogleMapsUrl(): ?string
{
    if (! $this->hasLocation()) {
        return null;
    }

    return "https://www.google.com/maps?q={$this->latitude},{$this->longitude}";
}

// Get formatted location label
public function getLocationLabel(): string
{
    if (! $this->hasLocation()) {
        return 'Location not set';
    }

    return "{$this->latitude}, {$this->longitude}";
}

// Generate unique QR code for tree
public function generateQrCode(): string
{
    if ($this->qr_code) {
        return $this->qr_code;
    }

    // Format: TREE-{FARM_ID}-{WAREHOUSE_ID}-{RACK_ID}-{LOT_ID}-{TREE_ID}
    $qrCode = sprintf(
        'TREE-%d-%d-%d-%d-%d',
        $this->lot->rack->warehouse->farm_id ?? 0,
        $this->lot->rack->warehouse_id ?? 0,
        $this->lot->rack_id ?? 0,
        $this->lot_id ?? 0,
        $this->id
    );

    $this->update(['qr_code' => $qrCode]);

    return $qrCode;
}

// Query scope: trees with location data
public function scopeWithLocation($query)
{
    return $query->whereNotNull('latitude')->whereNotNull('longitude');
}

// Query scope: find trees near a coordinate
public function scopeNearby($query, float $lat, float $lng, float $radiusKm = 10)
{
    return $query->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->whereRaw(
            'ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) <= ?',
            [$lng, $lat, $radiusKm * 1000]
        );
}
```

### Usage Examples

```php
// Set GPS coordinates for a tree
$tree = Tree::find(1);
$tree->update([
    'latitude' => -6.1234567,
    'longitude' => 106.1234567,
]);

// Check if tree has location
if ($tree->hasLocation()) {
    $mapsUrl = $tree->getGoogleMapsUrl();
    echo "View on Google Maps: $mapsUrl";
}

// Generate QR code
$qrCode = $tree->generateQrCode();
echo "QR Code: $qrCode"; // Output: TREE-1-1-1-1-1

// Find trees near a location
$nearbyTrees = Tree::nearby(-6.123, 106.123, 5)->get(); // Within 5km
```

---

## 2. Growth Timeline Feature

### Database Schema

**Migration:** `database/migrations/2026_03_14_000002_create_tree_growth_timelines_table.php`

Created `tree_growth_timelines` table:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `bigint` | Primary key |
| `tree_id` | `bigint` | Foreign key to trees table |
| `lot_id` | `bigint` | Foreign key to lots table |
| `recorded_by` | `bigint` | Foreign key to users table (farm owner/admin) |
| `title` | `string(255)` | Timeline entry title |
| `description` | `text` | Detailed description |
| `milestone_type` | `enum` | Type of milestone (planting, pruning, flowering, harvest, etc.) |
| `photos` | `json` | Array of photo file paths |
| `tree_height_cm` | `decimal(8,2)` | Tree height measurement in cm |
| `trunk_diameter_cm` | `decimal(8,2)` | Trunk diameter measurement in cm |
| `estimated_fruit_count` | `integer` | Estimated fruit count |
| `health_status` | `enum` | Tree health status (excellent, good, fair, poor, critical) |
| `notes` | `text` | Additional notes |
| `recorded_date` | `date` | Date of the update |
| `is_visible_to_investors` | `boolean` | Whether investors can see this update |
| `timestamps` | - | Created at / Updated at |

**Milestone Types:**
- `planting` 🌱
- `pruning` ✂️
- `fertilizing` 🌾
- `flowering` 🌸
- `fruiting` 🍎
- `pre_harvest` 📋
- `harvest` 🧺
- `post_harvest` 📦
- `health_check` 🔍
- `maintenance` 🔧
- `other` 📝

**Health Status:**
- `excellent` 🌟 (Green)
- `good` ✅ (Blue)
- `fair` ⚠️ (Yellow)
- `poor` 🔻 (Orange)
- `critical` 🚨 (Red)

### Enums

**`app/Enums/GrowthMilestoneType.php`**

Defines milestone types with labels, icons, and colors for visual representation.

**`app/Enums/TreeHealthStatus.php`**

Defines health status levels with labels, icons, and colors.

### Model

**`app/Models/TreeGrowthTimeline.php`**

Key methods:

```php
// Get photo URLs from storage
public function getPhotoUrls(): array
{
    if (! $this->photos || ! is_array($this->photos)) {
        return [];
    }

    return array_map(function ($path) {
        return Storage::disk('public')->url($path);
    }, $this->photos);
}

// Check if entry has photos
public function hasPhotos(): bool
{
    return ! empty($this->photos) && is_array($this->photos);
}

// Get first photo URL (for thumbnails)
public function getFirstPhotoUrl(): ?string
{
    $urls = $this->getPhotoUrls();
    return $urls[0] ?? null;
}
```

**Query Scopes:**

```php
// Only entries visible to investors
TreeGrowthTimeline::visibleToInvestors()->get();

// Entries for a specific tree
TreeGrowthTimeline::forTree(1)->get();

// Entries for a specific lot
TreeGrowthTimeline::forLot(1)->get();

// Entries by milestone type
TreeGrowthTimeline::byMilestoneType(GrowthMilestoneType::HARVEST)->get();

// Recent entries (default 10)
TreeGrowthTimeline::recent(20)->get();
```

### Relationships

**Tree Model** (`app/Models/Tree.php`):

```php
// All growth timeline entries
public function growthTimeline(): HasMany
{
    return $this->hasMany(TreeGrowthTimeline::class)->orderBy('recorded_date', 'desc');
}

// Only visible entries for investors
public function visibleGrowthTimeline(): HasMany
{
    return $this->hasMany(TreeGrowthTimeline::class)
        ->where('is_visible_to_investors', true)
        ->orderBy('recorded_date', 'desc');
}
```

**Lot Model** (`app/Models/Lot.php`):

```php
// All growth timeline entries for lot
public function growthTimeline(): HasMany
{
    return $this->hasMany(TreeGrowthTimeline::class)->orderBy('recorded_date', 'desc');
}

// Only visible entries
public function visibleGrowthTimeline(): HasMany
{
    return $this->hasMany(TreeGrowthTimeline::class)
        ->where('is_visible_to_investors', true)
        ->orderBy('recorded_date', 'desc');
}
```

### Usage Examples

```php
// Create a growth timeline entry
$tree = Tree::find(1);
$entry = TreeGrowthTimeline::create([
    'tree_id' => $tree->id,
    'lot_id' => $tree->lot_id,
    'recorded_by' => auth()->id(),
    'title' => 'First Flowering Observed',
    'description' => 'Tree has started flowering with approximately 50 buds visible.',
    'milestone_type' => GrowthMilestoneType::FLOWERING,
    'photos' => ['growth/tree-1-flowering-2024-03-14.jpg'],
    'tree_height_cm' => 250,
    'trunk_diameter_cm' => 15,
    'health_status' => TreeHealthStatus::EXCELLENT,
    'notes' => 'Flowers are healthy and abundant. Expect good yield this season.',
    'recorded_date' => now(),
    'is_visible_to_investors' => true,
]);

// Get visible timeline for a tree
$timeline = $tree->visibleGrowthTimeline()->get();

// Get recent updates for a lot
$recentUpdates = $lot->growthTimeline()->recent(5)->get();
```

---

## 3. React Components

### 3.1 LocationHierarchy Component

**File:** `resources/js/Components/LocationHierarchy.tsx`

**Purpose:** Display the complete hierarchical location of a tree.

**Props:**

```typescript
interface LocationHierarchyProps {
    farm: { id: number; name: string; city?: string; state?: string; country?: string };
    warehouse?: { id: number; name: string };
    rack?: { id: number; name: string };
    lot?: { id: number; name: string };
    tree?: { id: number; tree_identifier: string };
    fruitCrop?: {
        id: number;
        variant: string;
        fruit_type: { name: string };
    };
    compact?: boolean; // Compact inline view vs full card view
}
```

**Usage:**

```tsx
import LocationHierarchy from '@/Components/LocationHierarchy';

// Full card view
<LocationHierarchy
    farm={investment.farm}
    warehouse={investment.warehouse}
    rack={investment.rack}
    lot={investment.lot}
    tree={investment.tree}
    fruitCrop={investment.fruit_crop}
/>

// Compact inline view
<LocationHierarchy
    farm={investment.farm}
    warehouse={investment.warehouse}
    rack={investment.rack}
    lot={investment.lot}
    compact={true}
/>
```

**Visual Output:**

```
┌─────────────────────────────────────────┐
│ 📍 Tree Location                        │
├─────────────────────────────────────────┤
│ 🏠 Farm                                 │
│    Green Valley Farm                    │
│    Bogor, West Java, Indonesia          │
│           ↓                             │
│ 🏢 Warehouse                            │
│    Block A                              │
│           ↓                             │
│ 📊 Rack                                 │
│    Row 3                                │
│           ↓                             │
│ 📦 Investment Lot                       │
│    LOT-DURIAN-001                       │
│           ↓                             │
│ 🌳 Tree                                 │
│    Tree #12                             │
│           ↓                             │
│ 🍎 Crop Type                            │
│    Durian - Musang King                 │
└─────────────────────────────────────────┘
```

### 3.2 GrowthTimeline Component

**File:** `resources/js/Components/GrowthTimeline.tsx`

**Purpose:** Display tree growth progress with photos and measurements.

**Props:**

```typescript
interface GrowthTimelineEntry {
    id: number;
    title: string;
    description?: string;
    milestone_type: {
        value: string;
        label: string;
        icon: string;
        color: string;
    };
    health_status?: {
        value: string;
        label: string;
        icon: string;
        color: string;
    };
    photos?: string[];
    tree_height_cm?: number;
    trunk_diameter_cm?: number;
    estimated_fruit_count?: number;
    notes?: string;
    recorded_date: string;
    recorded_by?: { name: string };
}

interface GrowthTimelineProps {
    entries: GrowthTimelineEntry[];
    title?: string;
    emptyMessage?: string;
}
```

**Usage:**

```tsx
import GrowthTimeline from '@/Components/GrowthTimeline';

<GrowthTimeline
    entries={tree.growth_timeline}
    title="Tree Growth Progress"
    emptyMessage="No growth updates available yet."
/>
```

**Features:**
- Vertical timeline with icons
- Photo gallery with lightbox
- Measurement badges (height, diameter, fruit count)
- Health status indicators
- Farm owner attribution

### 3.3 TreeLocationMap Component

**File:** `resources/js/Components/TreeLocationMap.tsx`

**Purpose:** Display tree location on an interactive map.

**Props:**

```typescript
interface TreeLocationMapProps {
    latitude: number;
    longitude: number;
    treeName?: string;
    height?: number; // Map height in pixels
    showDirections?: boolean;
}
```

**Usage:**

```tsx
import TreeLocationMap from '@/Components/TreeLocationMap';

<TreeLocationMap
    latitude={tree.latitude}
    longitude={tree.longitude}
    treeName={`Tree ${tree.tree_identifier}`}
    height={400}
    showDirections={true}
/>
```

**Features:**
- Embedded Google Maps (satellite view, zoom 18)
- Open in Google Maps button
- Get Directions button
- Copy coordinates button
- Fallback UI if API key not set

**Environment Variable Required:**

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

## 4. Implementation Checklist

### Backend

- [x] Add GPS coordinates to trees table
- [x] Create tree_growth_timelines table
- [x] Create GrowthMilestoneType enum
- [x] Create TreeHealthStatus enum
- [x] Create TreeGrowthTimeline model
- [x] Add GPS helper methods to Tree model
- [x] Add growthTimeline relationships to Tree and Lot models
- [x] Add QR code generation logic

### Frontend

- [x] Create LocationHierarchy component
- [x] Create GrowthTimeline component
- [x] Create TreeLocationMap component

### To-Do (Future Work)

- [ ] Create farm owner growth update form
- [ ] Create QR code scanner page
- [ ] Create admin GPS coordinate setter tool
- [ ] Add bulk GPS import from CSV
- [ ] Add growth statistics dashboard
- [ ] Add growth milestone notifications
- [ ] Integrate with Weather API for automatic alerts
- [ ] Add drone imagery integration
- [ ] Create 3D farm map visualization

---

## 5. Example Use Case: Investor Investment Detail Page

Here's how to combine all components for a complete investor experience:

```tsx
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LocationHierarchy from '@/Components/LocationHierarchy';
import GrowthTimeline from '@/Components/GrowthTimeline';
import TreeLocationMap from '@/Components/TreeLocationMap';

export default function InvestmentDetail({ auth, investment }) {
    const { tree, lot, farm, warehouse, rack, fruit_crop } = investment;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Investment: ${lot.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Location Hierarchy */}
                    <LocationHierarchy
                        farm={farm}
                        warehouse={warehouse}
                        rack={rack}
                        lot={lot}
                        tree={tree}
                        fruitCrop={fruit_crop}
                    />

                    {/* GPS Map (if coordinates available) */}
                    {tree.latitude && tree.longitude && (
                        <TreeLocationMap
                            latitude={tree.latitude}
                            longitude={tree.longitude}
                            treeName={`Tree ${tree.tree_identifier}`}
                            height={400}
                            showDirections={true}
                        />
                    )}

                    {/* Growth Timeline */}
                    <GrowthTimeline
                        entries={tree.growth_timeline}
                        title="Growth Progress"
                    />

                    {/* Investment Details */}
                    {/* ... other investment info ... */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## 6. Benefits for Investors

### ✅ Complete Transparency

Investors can see:
- **Exact location** of their trees (farm → warehouse → rack → lot → tree)
- **GPS coordinates** with interactive map
- **QR code** for physical verification visits
- **Growth progress** with photos and measurements
- **Health status** updates from farm owners

### ✅ Trust Building

- Verifiable physical location
- Visual proof of growth
- Regular updates with photos
- Professional milestone tracking
- Clear chain of custody (Farm → Lot → Tree)

### ✅ Engagement

- Interactive map exploration
- Timeline storytelling
- Before/after comparisons
- Measurable growth metrics
- Direct link to farm location

---

## 7. Best Practices

### For Farm Owners

**GPS Coordinates:**
- Set coordinates when planting trees
- Use high-accuracy GPS device (±5m accuracy)
- Update if trees are relocated

**Growth Timeline:**
- Post updates at key milestones
- Include at least 1 photo per update
- Measure height and diameter consistently
- Write clear, descriptive titles
- Enable "visible to investors" for transparency

**Photo Guidelines:**
- Use good lighting (natural daylight)
- Include context (show full tree, not just closeup)
- Take photos from consistent angles
- Add scale reference (ruler, hand, person)
- Show both overview and detail shots

### For Administrators

**GPS Data Management:**
- Validate coordinates are within farm boundaries
- Check for duplicate locations (clustering)
- Monitor location accuracy
- Provide GPS entry tools for farm owners

**Timeline Moderation:**
- Review photos for quality
- Ensure appropriate content
- Verify milestone dates
- Flag inconsistencies

---

## 8. Technical Notes

### Database Indexes

Ensure these indexes exist for optimal performance:

```sql
-- Trees table
CREATE INDEX idx_trees_location ON trees(latitude, longitude);
CREATE UNIQUE INDEX idx_trees_qr_code ON trees(qr_code);

-- Growth timeline table
CREATE INDEX idx_growth_timeline_tree ON tree_growth_timelines(tree_id);
CREATE INDEX idx_growth_timeline_lot ON tree_growth_timelines(lot_id);
CREATE INDEX idx_growth_timeline_date ON tree_growth_timelines(recorded_date);
CREATE INDEX idx_growth_timeline_tree_date ON tree_growth_timelines(tree_id, recorded_date);
```

### Storage Configuration

Growth timeline photos are stored in the `public` disk:

```php
// config/filesystems.php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

Run `php artisan storage:link` to create the symbolic link.

### Geospatial Queries

For nearby tree searches, ensure MySQL has spatial functions enabled:

```sql
-- Test spatial functions
SELECT ST_Distance_Sphere(
    point(106.123, -6.123),
    point(106.124, -6.124)
) / 1000 as distance_km;
```

---

## 9. Future Enhancements

### QR Code Physical Tags

1. **Generate printable QR codes** for each tree
2. **Laminate and attach** to physical tree markers
3. **Investor visits:** Scan QR code → View tree details
4. **Verification system:** Photo upload with GPS check

### Advanced Analytics

- Growth rate charts
- Health trend graphs
- Comparative analysis (tree vs lot average)
- Predictive yield estimation
- Milestone achievement tracking

### AR/VR Integration

- AR tree visualization on-site
- Virtual farm tours (360° photos)
- 3D tree modeling from photos
- VR investor visits

---

## Summary

The GPS coordinates and growth timeline features provide:

1. **📍 Precise Location Tracking** — Know exactly where trees are planted
2. **📸 Visual Progress Documentation** — See trees grow over time
3. **📊 Measurable Growth Metrics** — Track height, diameter, fruit count
4. **🗺️ Interactive Maps** — Explore farm locations
5. **🔍 QR Code Verification** — Physical tree identification
6. **✅ Investor Trust** — Complete transparency and verifiability

These features are **fully implemented** with migrations, models, enums, and React components ready for use.
