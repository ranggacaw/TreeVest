# 🌳 Hierarchical Structure: Farms → Warehouses → Racks → Lots → Trees

## Overview

This document explains the **complete hierarchical structure** of the TreeVest investment platform, showing how Farms, Warehouses, Racks, Lots, Trees, and Crops are properly connected through a clear relational database architecture.

---

## 1. Main Hierarchical Structure

The logical hierarchy for the tree investment system is:

```
Farm
 └── Warehouse (Block A, Block B, etc.)
      └── Rack (Row 1, Row 2, etc.)
           └── Lot (Investment Package: LOT-DURIAN-001)
                └── Trees (Tree 1, Tree 2, Tree 3, ...)
                     └── Crop Type (Durian Musang King)
```

**Explanation:**

- A **Farm** contains multiple **Warehouses** (large sections/blocks)
- A **Warehouse** contains multiple **Racks** (smaller rows/sections)
- A **Rack** contains multiple **Lots** (investment packages)
- A **Lot** contains multiple **Trees** (individual plants)
- Each **Tree** belongs to a **FruitCrop** (plant variety)
- Each **Lot** is also linked to a **FruitCrop** (for consistency)

This hierarchy provides:
- ✅ **Clear location tracking** — Know exactly where each tree is planted
- ✅ **Investment grouping** — Lots package multiple trees for investors
- ✅ **Scalability** — Support multiple farms with organized structures
- ✅ **Transparency** — Investors can track their specific trees and locations

---

## 2. Database Schema

### 2.1 Farms Table

The **Farm** represents the main plantation location.

```sql
CREATE TABLE farms (
    id BIGINT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    size_hectares DECIMAL(10, 2),
    capacity_trees INT,
    status ENUM('pending_approval', 'active', 'suspended', 'deactivated'),
    -- ... other fields
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

**Relationships:**
- Farm **has many** Warehouses
- Farm **has many** FruitCrops
- Farm **belongs to** User (owner)

---

### 2.2 Warehouses Table

A **Warehouse** represents a large block or section inside the farm.

```sql
CREATE TABLE warehouses (
    id BIGINT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX (farm_id)
);
```

**Relationships:**
- Warehouse **belongs to** Farm
- Warehouse **has many** Racks

**Location:** `database/migrations/2026_03_13_000001_create_warehouses_table.php`

**Model:** `app/Models/Warehouse.php`

---

### 2.3 Racks Table

A **Rack** represents a smaller row or planting section within a warehouse.

```sql
CREATE TABLE racks (
    id BIGINT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    INDEX (warehouse_id)
);
```

**Relationships:**
- Rack **belongs to** Warehouse
- Rack **has many** Lots

**Location:** `database/migrations/2026_03_13_000002_create_racks_table.php`

**Model:** `app/Models/Rack.php`

---

### 2.4 Lots Table

A **Lot** is the **investment package** that investors can buy. Each lot contains multiple trees and belongs to a specific crop type.

```sql
CREATE TABLE lots (
    id BIGINT PRIMARY KEY,
    rack_id BIGINT NOT NULL,
    fruit_crop_id BIGINT NOT NULL,
    name VARCHAR(100),
    total_trees SMALLINT UNSIGNED,
    base_price_per_tree_cents BIGINT UNSIGNED,
    monthly_increase_rate DECIMAL(5, 4) DEFAULT 0.0000,
    current_price_per_tree_cents BIGINT UNSIGNED,
    cycle_started_at DATE,
    cycle_months TINYINT UNSIGNED,
    last_investment_month TINYINT UNSIGNED,
    status ENUM('active', 'harvest', 'selling', 'completed', 'cancelled') DEFAULT 'active',
    -- Harvest tracking fields
    harvest_total_fruit INT UNSIGNED NULL,
    harvest_total_weight_kg DECIMAL(8, 2) NULL,
    harvest_notes TEXT NULL,
    harvest_recorded_at TIMESTAMP NULL,
    -- Selling tracking fields
    selling_revenue_cents BIGINT UNSIGNED NULL,
    selling_proof_photo VARCHAR(255) NULL,
    selling_submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE,
    FOREIGN KEY (fruit_crop_id) REFERENCES fruit_crops(id) ON DELETE CASCADE,
    INDEX (rack_id),
    INDEX (fruit_crop_id),
    INDEX (status),
    INDEX (cycle_started_at)
);
```

**Status Lifecycle:**
1. **active** — Lot is open for investments
2. **harvest** — Trees are being harvested
3. **selling** — Harvested fruits are being sold
4. **completed** — Investment cycle complete, profits distributed
5. **cancelled** — Lot cancelled (rare case)

**Relationships:**
- Lot **belongs to** Rack
- Lot **belongs to** FruitCrop
- Lot **has many** Trees
- Lot **has many** Investments

**Location:** `database/migrations/2026_03_13_000003_create_lots_table.php`

**Model:** `app/Models/Lot.php`

---

### 2.5 Trees Table

Each **Tree** is an individual investable unit. Trees belong to both a **Lot** (for investment grouping) and a **FruitCrop** (for plant type).

```sql
CREATE TABLE trees (
    id BIGINT PRIMARY KEY,
    fruit_crop_id BIGINT NOT NULL,
    lot_id BIGINT NULL,  -- Added via migration
    tree_identifier VARCHAR(255),
    price_cents INT,
    expected_roi_percent DECIMAL(5, 2),
    age_years INT DEFAULT 0,
    productive_lifespan_years INT,
    risk_rating ENUM('low', 'moderate', 'high'),
    min_investment_cents INT,
    max_investment_cents INT,
    status ENUM('seedling', 'growing', 'productive', 'declining', 'retired') DEFAULT 'seedling',
    historical_yield_json JSON NULL,
    pricing_config_json JSON NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (fruit_crop_id) REFERENCES fruit_crops(id) ON DELETE CASCADE,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL,
    UNIQUE KEY (fruit_crop_id, tree_identifier),
    INDEX (fruit_crop_id, status),
    INDEX (status, price_cents),
    INDEX (lot_id)
);
```

**Dual Relationships Explained:**
- `fruit_crop_id` — Defines the **plant type** (e.g., Durian Musang King)
- `lot_id` — Defines the **investment package** this tree belongs to

This dual relationship allows:
- Trees to be grouped into lots for investment
- Trees to maintain their botanical identity
- Flexible queries (e.g., "all Durian trees" or "trees in Lot X")

**Relationships:**
- Tree **belongs to** FruitCrop (plant type)
- Tree **belongs to** Lot (investment package)
- Tree **has many** Investments
- Tree **has many** Harvests

**Location:** `database/migrations/2026_02_28_215104_create_trees_table.php`

**Migration adding lot_id:** `database/migrations/2026_03_13_000005_add_lot_id_to_trees_table.php`

**Model:** `app/Models/Tree.php`

---

### 2.6 FruitCrops Table

A **FruitCrop** defines the specific variety or variant of a fruit type planted on a farm.

```sql
CREATE TABLE fruit_crops (
    id BIGINT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    fruit_type_id BIGINT NOT NULL,
    variant VARCHAR(255),  -- e.g., "Musang King"
    description TEXT,
    harvest_cycle ENUM('annual', 'bi_annual', 'seasonal'),
    planted_date DATE,
    total_trees INT,
    productive_trees INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (fruit_type_id) REFERENCES fruit_types(id) ON DELETE CASCADE
);
```

**Relationships:**
- FruitCrop **belongs to** Farm
- FruitCrop **belongs to** FruitType
- FruitCrop **has many** Lots
- FruitCrop **has many** Trees

**Model:** `app/Models/FruitCrop.php`

---

### 2.7 Investments Table

**Investment** records track when investors purchase trees from a lot.

```sql
CREATE TABLE investments (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tree_id BIGINT NULL,
    lot_id BIGINT NULL,  -- Direct reference to the lot
    amount_cents BIGINT,
    quantity INT,  -- Number of trees purchased
    currency VARCHAR(3) DEFAULT 'IDR',
    purchase_date DATE,
    purchase_month INT,  -- Which cycle month was this purchased
    status ENUM('pending_payment', 'active', 'listed', 'sold', 'cancelled'),
    transaction_id BIGINT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE SET NULL,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
```

**Relationships:**
- Investment **belongs to** User (investor)
- Investment **belongs to** Tree
- Investment **belongs to** Lot
- Investment **has many** Payouts

**Model:** `app/Models/Investment.php`

---

## 3. Complete Relationship Map

```
User (Farm Owner)
 │
 └─── Farm
       ├─── Warehouses
       │     └─── Racks
       │           └─── Lots
       │                 └─── Trees ──┐
       │                               │
       └─── FruitCrops ────────────────┤
             ├─── Lots                 │
             └─── Trees ◄──────────────┘

User (Investor)
 └─── Investments
       ├─── Tree (specific plant)
       └─── Lot (investment package)
```

**Navigation Examples:**

1. **From Farm to Trees:**
   ```
   Farm → Warehouses → Racks → Lots → Trees
   ```

2. **From Tree to Farm:**
   ```
   Tree → Lot → Rack → Warehouse → Farm
   Tree → FruitCrop → Farm
   ```

3. **From Investment to Farm:**
   ```
   Investment → Lot → Rack → Warehouse → Farm
   Investment → Tree → FruitCrop → Farm
   ```

---

## 4. Eloquent Model Relationships

### Warehouse Model (`app/Models/Warehouse.php`)

```php
public function farm(): BelongsTo
{
    return $this->belongsTo(Farm::class);
}

public function racks(): HasMany
{
    return $this->hasMany(Rack::class);
}

public function lots(): HasManyThrough
{
    return $this->hasManyThrough(Lot::class, Rack::class);
}
```

### Rack Model (`app/Models/Rack.php`)

```php
public function warehouse(): BelongsTo
{
    return $this->belongsTo(Warehouse::class);
}

public function lots(): HasMany
{
    return $this->hasMany(Lot::class);
}

public function farm(): HasOneThrough
{
    return $this->hasOneThrough(
        Farm::class,
        Warehouse::class,
        'id',
        'id',
        'warehouse_id',
        'farm_id'
    );
}
```

### Lot Model (`app/Models/Lot.php`)

```php
public function rack(): BelongsTo
{
    return $this->belongsTo(Rack::class);
}

public function fruitCrop(): BelongsTo
{
    return $this->belongsTo(FruitCrop::class);
}

public function trees(): HasMany
{
    return $this->hasMany(Tree::class);
}

public function investments(): HasMany
{
    return $this->hasMany(Investment::class);
}

public function warehouse(): HasOneThrough
{
    return $this->hasOneThrough(
        Warehouse::class,
        Rack::class,
        'id',
        'id',
        'rack_id',
        'warehouse_id'
    );
}
```

### Tree Model (`app/Models/Tree.php`)

```php
public function fruitCrop(): BelongsTo
{
    return $this->belongsTo(FruitCrop::class);
}

public function lot(): BelongsTo
{
    return $this->belongsTo(Lot::class);
}

public function investments(): HasMany
{
    return $this->hasMany(Investment::class);
}

public function harvests(): HasMany
{
    return $this->hasMany(Harvest::class);
}
```

### FruitCrop Model (`app/Models/FruitCrop.php`)

```php
public function farm(): BelongsTo
{
    return $this->belongsTo(Farm::class);
}

public function fruitType(): BelongsTo
{
    return $this->belongsTo(FruitType::class);
}

public function lots(): HasMany
{
    return $this->hasMany(Lot::class);
}

public function trees(): HasMany
{
    return $this->hasMany(Tree::class);
}
```

### Farm Model (`app/Models/Farm.php`)

```php
public function owner(): BelongsTo
{
    return $this->belongsTo(User::class, 'owner_id');
}

public function warehouses(): HasMany
{
    return $this->hasMany(Warehouse::class);
}

public function fruitCrops(): HasMany
{
    return $this->hasMany(FruitCrop::class);
}
```

---

## 5. Real-World Example

**Scenario:** An investor wants to buy trees from a specific lot.

### Data Structure:

```
Farm: "Green Valley Farm"
 └── Warehouse: "Block A"
      └── Rack: "Row 1"
           └── Lot: "LOT-DURIAN-001"
                ├── Fruit Crop: "Durian Musang King"
                ├── Total Trees: 10
                ├── Price per Tree: Rp 5,000,000
                └── Trees:
                     ├── Tree #1 (ID: 101)
                     ├── Tree #2 (ID: 102)
                     ├── Tree #3 (ID: 103)
                     ├── Tree #4 (ID: 104)
                     └── Tree #5 (ID: 105)
```

### Investment Flow:

1. **Investor browses marketplace:**
   ```php
   $lots = Lot::with(['rack.warehouse.farm', 'fruitCrop.fruitType'])
       ->where('status', 'active')
       ->get();
   ```

2. **Investor selects LOT-DURIAN-001 (5 trees):**
   ```php
   $lot = Lot::find(1);
   $quantity = 5;
   $pricePerTree = $lot->current_price_per_tree_cents;
   $totalAmount = $pricePerTree * $quantity;
   ```

3. **Investment is created:**
   ```php
   $investment = Investment::create([
       'user_id' => auth()->id(),
       'lot_id' => $lot->id,
       'tree_id' => null,  // Multiple trees, not specific
       'quantity' => 5,
       'amount_cents' => $totalAmount,
       'purchase_date' => now(),
       'status' => 'active',
   ]);
   ```

4. **Investor can track their investment:**
   ```php
   $investment->load([
       'lot.rack.warehouse.farm',
       'lot.fruitCrop.fruitType',
       'lot.trees'
   ]);
   
   // Result:
   // "You own 5 trees of Durian Musang King"
   // "Location: Row 1, Block A, Green Valley Farm"
   // "City: Bogor, West Java, Indonesia"
   ```

---

## 6. Query Examples

### Get all lots in a specific farm:

```php
$farm = Farm::find(1);
$lots = $farm->warehouses()
    ->with('racks.lots.fruitCrop')
    ->get()
    ->pluck('racks')
    ->flatten()
    ->pluck('lots')
    ->flatten();
```

### Get farm location for a specific tree:

```php
$tree = Tree::with('lot.rack.warehouse.farm')->find(1);
$farmLocation = $tree->lot->rack->warehouse->farm->full_address;
```

### Get all investments for a lot with investor details:

```php
$lot = Lot::with(['investments.investor', 'trees'])->find(1);
$investors = $lot->investments->map(function ($investment) {
    return [
        'investor_name' => $investment->investor->name,
        'trees_owned' => $investment->quantity,
        'purchase_date' => $investment->purchase_date,
    ];
});
```

### Get total investment value for a warehouse:

```php
$warehouse = Warehouse::with('racks.lots.investments')->find(1);
$totalInvestment = $warehouse->racks
    ->pluck('lots')
    ->flatten()
    ->pluck('investments')
    ->flatten()
    ->sum('amount_cents');
```

---

## 7. Benefits of This Structure

### ✅ Clear Location Hierarchy
Every tree has a precise location:
- Farm → Warehouse (Block) → Rack (Row) → Lot → Tree

### ✅ Investment Grouping
Lots package multiple trees together, making it easier for:
- Investors to purchase multiple trees at once
- Farm owners to manage harvest and selling per lot
- Platform to track profit distribution

### ✅ Scalability
- Support multiple farms
- Each farm can have multiple warehouses
- Each warehouse can have multiple racks
- Flexible and extensible

### ✅ Data Integrity
- Foreign key constraints ensure data consistency
- Cascade deletes maintain referential integrity
- Soft deletes preserve historical data

### ✅ Transparency
Investors can:
- See exact location of their trees
- Track growth progress via photos
- View harvest and selling data per lot
- Calculate returns based on actual results

---

## 8. Future Enhancements

### 📍 GPS Coordinates per Tree
Add `latitude` and `longitude` to the `trees` table for precise geolocation.

### 🏷️ QR Code Tracking
Generate unique QR codes for each tree that investors can scan to:
- View real-time health status
- See photos and growth timeline
- Access harvest history

### 🗺️ Interactive Farm Map
Create a visual map showing:
- Warehouse/block layouts
- Rack/row positions
- Tree locations with investor ownership overlay

### 📸 Growth Timeline
Track tree growth with timestamped photos:
- Monthly/quarterly photo updates
- Before/after harvest comparisons
- Health monitoring visual evidence

### 🚁 Drone Imagery
Integrate drone footage for:
- Aerial farm views
- Crop health monitoring
- Virtual farm tours

---

## 9. Migration Status

| Migration | Status | File |
|-----------|--------|------|
| Warehouses | ✅ Created | `2026_03_13_000001_create_warehouses_table.php` |
| Racks | ✅ Created | `2026_03_13_000002_create_racks_table.php` |
| Lots | ✅ Created | `2026_03_13_000003_create_lots_table.php` |
| Add lot_id to trees | ✅ Created | `2026_03_13_000005_add_lot_id_to_trees_table.php` |

**All models have been created and relationships are properly defined.**

---

## 10. Summary

The hierarchical structure **Farm → Warehouse → Rack → Lot → Tree** provides a robust, scalable, and transparent foundation for the TreeVest investment platform. This structure ensures:

- Clear location tracking for every tree
- Flexible investment grouping via lots
- Data integrity through proper foreign keys
- Scalability for multiple farms
- Transparency for investor confidence

**The structure is fully implemented** with migrations, models, and relationships ready for use.
