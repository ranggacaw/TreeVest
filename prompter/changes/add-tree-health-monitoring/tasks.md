## 1. Database Schema

- [x] 1.1 Create migration for `tree_health_updates` table
- [x] 1.2 Create migration for `weather_data` table
- [x] 1.3 Create migration for `health_alerts` table
- [x] 1.4 Add indexes for `fruit_crop_id`, `farm_id`, `created_at` columns

## 2. Enums & Models

- [x] 2.1 Create `HealthSeverity` enum (low, medium, high, critical)
- [x] 2.2 Create `HealthUpdateType` enum (routine, pest, disease, damage, weather_impact, other)
- [x] 2.3 Create `HealthAlertType` enum (weather, pest, disease, manual)
- [x] 2.4 Create `TreeHealthUpdate` model with relationships and casts
- [x] 2.5 Create `WeatherData` model with relationships and casts
- [x] 2.6 Create `HealthAlert` model with relationships and casts
- [x] 2.7 Add `healthUpdates()` relationship to `FruitCrop` model
- [x] 2.8 Add `weatherData()` relationship to `Farm` model
- [x] 2.9 Add `healthAlerts()` relationship to `Farm` and `FruitCrop` models

## 3. Weather Service Integration

- [x] 3.1 Add `OPENWEATHERMAP_API_KEY` to `.env` and `.env.example`
- [x] 3.2 Create `WeatherService` class with OpenWeatherMap API integration (Laravel HTTP client)
- [x] 3.3 Implement `fetchWeatherForFarm(Farm $farm)` method
- [x] 3.4 Implement weather data caching (store in `weather_data` table)
- [x] 3.5 Create `FetchWeatherData` scheduled job (runs every 6 hours)
- [x] 3.6 Register scheduled job in `routes/console.php`
- [x] 3.7 Create `WeatherAlertService` class with threshold logic
- [x] 3.8 Implement `generateAlertsForWeatherData(WeatherData $data)` method
- [x] 3.9 Create `GenerateWeatherAlerts` job (triggered after weather fetch)

## 4. Health Update Submission

- [x] 4.1 Create `StoreHealthUpdateRequest` FormRequest with validation rules
- [x] 4.2 Create `UpdateHealthUpdateRequest` FormRequest with validation rules
- [x] 4.3 Create `FarmOwner/HealthUpdateController` with CRUD actions
- [x] 4.4 Implement photo upload handling with Laravel filesystem (max 5 images)
- [x] 4.5 Implement image optimization (resize, compress) using Intervention Image
- [x] 4.6 Generate thumbnails for gallery view (300x300)
- [x] 4.7 Create `ProcessHealthUpdate` job for async photo processing
- [x] 4.8 Dispatch `HealthUpdateCreated` event after successful creation
- [x] 4.9 Add authorization policy for health update CRUD (farm owner only)

## 5. Health Monitoring Service

- [x] 5.1 Create `HealthMonitoringService` class
- [x] 5.2 Implement `getHealthFeedForInvestor(User $investor)` method
- [x] 5.3 Implement `getHealthStatusForTree(Tree $tree)` method
- [x] 5.4 Implement `getHealthStatusForCrop(FruitCrop $crop)` method
- [x] 5.5 Implement filtering logic (farm, crop type, severity)
- [x] 5.6 Implement pagination for health feed queries

## 6. Investor Health Feed UI

- [x] 6.1 Create `resources/js/Pages/Investments/HealthFeed/Index.tsx` (health feed list)
- [x] 6.2 Create `resources/js/Pages/Investments/HealthFeed/Show.tsx` (health update detail)
- [x] 6.3 Create `resources/js/Components/HealthUpdateCard.tsx` (health update card component)
- [x] 6.4 Create `resources/js/Components/WeatherAlertBanner.tsx` (weather alert component)
- [x] 6.5 Create `resources/js/Components/HealthSeverityBadge.tsx` (severity badge)
- [x] 6.6 Create `resources/js/Components/PhotoGallery.tsx` (lightbox photo gallery)
- [x] 6.7 Implement health feed filtering UI (dropdown filters)
- [x] 6.8 Create `Investor/HealthFeedController` to serve Inertia pages

## 7. Farm Owner Health Update UI

- [x] 7.1 Create `resources/js/Pages/FarmOwner/HealthUpdates/Index.tsx` (list updates)
- [x] 7.2 Create `resources/js/Pages/FarmOwner/HealthUpdates/Create.tsx` (create form)
- [x] 7.3 Create `resources/js/Pages/FarmOwner/HealthUpdates/Edit.tsx` (edit form)
- [x] 7.4 Create `resources/js/Components/HealthUpdateForm.tsx` (reusable form component)
- [x] 7.5 Create `resources/js/Components/ImageUploader.tsx` (drag-drop image upload)
- [x] 7.6 Implement form validation using Inertia `useForm()`
- [ ] 7.7 Add success/error toast notifications on submit

## 8. Tree & Portfolio Integration

- [x] 8.1 Modify `Trees/Show.tsx` to display health status section
- [x] 8.2 Add recent health updates widget to tree detail page
- [x] 8.3 Add current weather conditions widget to tree detail page
- [x] 8.4 Create `resources/js/Components/HealthStatusIndicator.tsx` (status badge)
- [ ] 8.5 Modify portfolio dashboard to show health indicators per tree
- [ ] 8.6 Add health alert count badge in portfolio view

## 9. Notification Integration

- [x] 9.1 Modify notification type enum to add `health` and `weather` types
- [x] 9.2 Create `HealthUpdateCreatedListener` to dispatch health notification
- [x] 9.3 Create `WeatherAlertGeneratedListener` to dispatch weather notification
- [ ] 9.4 Create notification templates for health/weather types (email, SMS, database)
- [ ] 9.5 Update default notification preferences to include health/weather types (enabled for email + database)

## 10. Routes

- [x] 10.1 Add farm owner health update routes in `routes/web.php`
- [x] 10.2 Add investor health feed routes in `routes/web.php`
- [x] 10.3 Apply `role:farm_owner` middleware to farm owner routes
- [x] 10.4 Apply `role:investor` middleware to investor routes

## 11. Testing

- [ ] 11.1 Unit test: `WeatherService` API integration (mock HTTP responses)
- [ ] 11.2 Unit test: `WeatherAlertService` threshold logic
- [ ] 11.3 Unit test: `HealthMonitoringService` filtering and queries
- [ ] 11.4 Feature test: Farm owner can create health update with photos
- [ ] 11.5 Feature test: Investor can view health feed for their trees
- [ ] 11.6 Feature test: Weather data is fetched and cached correctly
- [ ] 11.7 Feature test: Weather alerts are generated when thresholds exceeded
- [ ] 11.8 Feature test: Health notifications are sent to investors
- [ ] 11.9 Feature test: Unauthorized users cannot access farm owner health routes
- [ ] 11.10 Feature test: Image upload validation (max 5 images, file size, type)

## 12. Seeding & Demo Data

- [ ] 12.1 Create `TreeHealthUpdateSeeder` with sample health updates
- [ ] 12.2 Create `WeatherDataSeeder` with sample weather data
- [ ] 12.3 Create `HealthAlertSeeder` with sample weather/pest alerts
- [ ] 12.4 Add sample photos to storage for demo health updates

## 13. Documentation

- [x] 13.1 Update AGENTS.md Section 6 (Data Models) with new entities and relationships
- [x] 13.2 Update AGENTS.md Section 13 (Integration Map) with OpenWeatherMap integration
- [x] 13.3 Document weather alert thresholds in `design.md`
- [ ] 13.4 Add API key setup instructions to README

## Post-Implementation

- [x] Update AGENTS.md in the project root for new changes in this spec
- [ ] Run full test suite and ensure 100% pass rate
- [ ] Validate with `prompter validate add-tree-health-monitoring --strict --no-interactive`
