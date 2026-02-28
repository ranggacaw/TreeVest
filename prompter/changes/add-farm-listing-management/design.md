## Context

This change introduces a new architectural pattern for geospatial data handling and establishes the farm entity as the foundational marketplace asset. Key architectural decisions need to be documented before implementation to ensure consistency and maintainability.

### Background

- Farm listings are the core marketplace entity that investors browse before purchasing tree investments
- Farms contain geospatial data (latitude/longitude) for map-based discovery
- Farms have a multi-stage approval workflow (pending → active → suspended/deactivated)
- Farm profile completeness directly impacts investor confidence and platform trust

### Constraints

- Must use MySQL 8.x spatial extensions (POINT column with SRID 4326) for geospatial queries
- Must support both local and cloud image storage via Laravel filesystem abstraction (initially local)
- Google Maps API has usage-based pricing — implementation must minimize API calls
- Farm approval is a manual admin process (no auto-approval at launch)

### Stakeholders

- **Farm Owners:** Need intuitive farm profile creation and management
- **Investors:** Need comprehensive farm data for informed investment decisions
- **Admins:** Need efficient approval workflow and audit visibility
- **Platform:** Needs scalable geospatial indexing and performant map-based discovery

---

## Goals / Non-Goals

**Goals:**
- Establish Farm as the foundational marketplace entity with complete profile data
- Implement geospatial queries for map-based farm discovery with MySQL spatial indexes
- Create farm approval workflow with status transitions and audit logging
- Support farm image galleries with efficient storage and retrieval
- Enable external virtual tour integration via URL links

**Non-Goals:**
- Multi-region/multi-language farm data (deferred)
- Automated farm approval based on verification rules (manual only at launch)
- In-platform virtual tour hosting (external links only)
- Farm performance analytics dashboard (separate EPIC)
- Weather data integration (EPIC-008)
- Harvest data reporting (EPIC-009)

---

## Decisions

### Decision 1: MySQL Spatial Data Types for Geospatial Queries

**What:** Use MySQL 8.x `POINT` column type with SRID 4326 (WGS 84) for farm coordinates.

**Why:**
- Native spatial indexing support in MySQL 8.x provides efficient geospatial queries
- SRID 4326 is the standard coordinate system for GPS data (latitude/longitude)
- Avoids need for external geospatial services (PostGIS, MongoDB)
- Laravel 12.x has built-in support for spatial data types via Eloquent

**Alternatives Considered:**
- **Separate lat/lng columns:** Simpler but lacks spatial indexing, poor performance for radius queries
- **PostGIS (PostgreSQL):** More powerful geospatial features but requires PostgreSQL migration
- **External geocoding service:** Adds latency and third-party dependency

**Implementation:**
```php
// Migration
$table->point('coordinates')->srid(4326)->nullable();
$table->spatialIndex('coordinates');

// Model accessor
public function getLatitudeAttribute(): ?float
{
    return $this->coordinates?->latitude;
}

public function getLongitudeAttribute(): ?float
{
    return $this->coordinates?->longitude;
}
```

### Decision 2: Farm Edit Always Triggers Re-Approval

**What:** Any edit to a farm profile by a farm owner automatically sets status back to `pending_approval`.

**Why:**
- Ensures admin review of all farm profile changes (safety measure)
- Prevents farm owners from changing critical details (location, certifications) after approval
- Simplifies logic (no need to define "major vs minor" change thresholds)
- Aligns with financial platform compliance expectations

**Alternatives Considered:**
- **Selective re-approval:** Only trigger for "major" fields (location, certifications) — adds complexity and edge cases
- **No re-approval:** Faster for farm owners but reduces platform control and trust

**Implementation:**
- `UpdateFarmRequest` validation passes
- `FarmService::updateFarm()` checks if farm is currently `active`
- If active, set status to `pending_approval` after save
- Dispatch `FarmUpdated` event (admin notification)

### Decision 3: Local Filesystem Storage for Farm Images (Initially)

**What:** Store farm images in `storage/app/public/farms/{farm_id}/` using Laravel's local disk driver.

**Why:**
- Simplifies initial deployment (no AWS credentials required)
- Laravel filesystem abstraction allows easy migration to S3 later
- Local storage sufficient for MVP scale (< 1000 farms, < 10GB images)
- Reduces operational costs during early adoption phase

**Alternatives Considered:**
- **Amazon S3 immediately:** Better scalability but adds configuration complexity and costs
- **Cloudinary/Imgix:** Optimized for image delivery but adds third-party dependency and cost

**Migration Path:**
- Update `config/filesystems.php` disk from `public` to `s3`
- Run migration script to move existing images to S3
- Update `FILESYSTEM_DISK` environment variable

**Implementation:**
```php
// config/filesystems.php
'farms' => [
    'driver' => 'local',
    'root' => storage_path('app/public/farms'),
    'url' => env('APP_URL').'/storage/farms',
    'visibility' => 'public',
],

// FarmService
Storage::disk('farms')->putFileAs(
    $farm->id,
    $request->file('image'),
    $filename
);
```

### Decision 4: Google Maps for Geospatial Display

**What:** Use Google Maps JavaScript API via `@react-google-maps/api` React library for farm location display and map-based discovery.

**Why:**
- Familiar UX for most users (Google Maps is widely recognized)
- Comprehensive JavaScript SDK with good React integration
- Robust geocoding API for address → coordinates conversion
- Mature documentation and community support

**Alternatives Considered:**
- **Mapbox:** More customizable styling but less familiar to end users
- **Leaflet + OpenStreetMap:** Free but lacks geocoding API and requires additional services

**API Usage Optimization:**
- Cache geocoding results (address → coordinates) in database
- Use static map images for farm cards (cheaper than interactive maps)
- Load interactive map only on farm detail page

**Configuration:**
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

```tsx
// FarmMap.tsx
<GoogleMap
  mapContainerStyle={{ width: '100%', height: '400px' }}
  center={{ lat: farm.latitude, lng: farm.longitude }}
  zoom={15}
>
  <Marker position={{ lat: farm.latitude, lng: farm.longitude }} />
</GoogleMap>
```

### Decision 5: Farm Status Enum and Transition Rules

**What:** Use PHP enum for farm status with explicit allowed transitions.

**Status Values:**
- `pending_approval` — Initial state, visible only to farm owner and admin
- `active` — Approved, visible on marketplace
- `suspended` — Admin-suspended, hidden from marketplace, farm owner can view
- `deactivated` — Permanently removed, hidden from marketplace

**Allowed Transitions:**
- `pending_approval` → `active` (admin approves)
- `pending_approval` → `deactivated` (admin rejects permanently)
- `active` → `pending_approval` (farm owner edits)
- `active` → `suspended` (admin suspends)
- `suspended` → `active` (admin reinstates)
- `suspended` → `deactivated` (admin permanently removes)

**Implementation:**
```php
// app/Enums/FarmStatus.php
enum FarmStatus: string
{
    case PENDING_APPROVAL = 'pending_approval';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case DEACTIVATED = 'deactivated';
    
    public function canTransitionTo(self $newStatus): bool
    {
        return match($this) {
            self::PENDING_APPROVAL => in_array($newStatus, [self::ACTIVE, self::DEACTIVATED]),
            self::ACTIVE => in_array($newStatus, [self::PENDING_APPROVAL, self::SUSPENDED]),
            self::SUSPENDED => in_array($newStatus, [self::ACTIVE, self::DEACTIVATED]),
            self::DEACTIVATED => false, // Terminal state
        };
    }
}
```

---

## Risks / Trade-offs

### Risk 1: Google Maps API Costs

**Risk:** API usage costs can scale unpredictably with user traffic.

**Mitigation:**
- Implement API key restrictions (HTTP referrer, usage limits)
- Use static map images for farm cards (1 API call per farm vs per page load)
- Monitor usage via Google Cloud Console
- Set up billing alerts
- Consider Mapbox migration if costs exceed budget

### Risk 2: Geospatial Query Performance

**Risk:** Map-based radius queries (e.g., "farms within 50km") may be slow with large datasets.

**Mitigation:**
- MySQL spatial indexes created on `coordinates` column
- Limit initial map viewport queries to bounding box (faster than radius)
- Add query result caching for popular search areas
- Validate performance with load testing (10,000+ farms)

### Risk 3: Farm Data Completeness

**Risk:** Farm owners may skip optional fields, reducing investor confidence.

**Mitigation:**
- Mark critical fields as required (name, location, size, capacity)
- Add "profile completeness" indicator (e.g., 80% complete)
- Admin review process flags incomplete profiles
- Provide farm owner guidance during creation flow

### Risk 4: Admin Approval Bottleneck

**Risk:** Manual approval workflow could delay farm availability if admin capacity is insufficient.

**Mitigation:**
- Track approval queue metrics (average time to approve)
- Add admin notification for new pending farms
- Consider multi-admin assignment in future
- Document approval SLA (e.g., 48 hours)

### Risk 5: Re-Approval UX Friction

**Risk:** Always requiring re-approval for edits may frustrate farm owners with minor typo fixes.

**Mitigation:**
- Clearly communicate re-approval policy in UI ("Any changes require admin review")
- Provide admin "quick approve" action for minor edits
- Track re-approval frequency to identify pain points
- Consider selective re-approval in future iteration if data supports it

---

## Migration Plan

### Phase 1: Schema Deployment
1. Run migrations for `farms`, `farm_images`, `farm_certifications` tables
2. Create spatial indexes on `coordinates` column
3. Verify spatial data types in production MySQL version (8.0.x)

### Phase 2: Code Deployment
1. Deploy backend code (models, services, controllers)
2. Deploy frontend code (Inertia pages, React components)
3. Add Google Maps API key to production `.env`
4. Create symlink for public storage: `php artisan storage:link`

### Phase 3: Data Seeding (Optional)
1. Create sample farm data for marketplace testing
2. Generate test images for farm galleries
3. Verify geocoding and map display

### Rollback Plan
- Database rollback: `php artisan migrate:rollback --step=3`
- Code rollback: Revert deployment (no data loss, farms table empty initially)
- Google Maps API key: Remove from `.env` (no cost impact)

---

## Open Questions

1. **Image upload limits:** What are the maximum file size and dimensions for farm images?
   - **Proposed:** 5MB max, 4000x3000px max, JPEG/PNG only
   - **Needs validation:** Storage capacity planning

2. **Certification validation:** Should admins verify certification documents during approval?
   - **Proposed:** Yes — farm owners upload certification PDFs, admins review
   - **Alternative:** Trust farm owners initially, audit retroactively

3. **Historical performance data:** What format and granularity for historical yield data?
   - **Deferred:** EPIC-009 (Harvest & Returns) will define data structure
   - **Current:** Free-text description field only

4. **Search performance:** Should we implement Elasticsearch/Algolia for farm search?
   - **Proposed:** Start with MySQL FULLTEXT indexes, evaluate search quality
   - **Trigger:** If search quality is poor or response time > 300ms

5. **Map clustering:** Should farm markers be clustered on map view with many farms?
   - **Proposed:** Use `@react-google-maps/marker-clusterer` if > 100 farms in viewport
   - **Deferred:** Implement after launch if needed
