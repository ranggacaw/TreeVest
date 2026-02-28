## 1. Database Schema Design
- [x] 1.1 Create migration for `articles` table
- [x] 1.2 Create migration for `categories` table
- [x] 1.3 Create migration for `tags` table
- [x] 1.4 Create migration for `article_category` pivot table
- [x] 1.5 Create migration for `article_tag` pivot table
- [x] 1.6 Add fulltext index on `articles.title` and `articles.content`
- [x] 1.7 Run migrations and verify schema

## 2. Eloquent Models
- [x] 2.1 Create Article model with relationships
- [x] 2.2 Create Category model with relationships
- [x] 2.3 Create Tag model with relationships
- [x] 2.4 Add `$fillable` and `$casts` properties to all models
- [x] 2.5 Add slug generation logic (use `Str::slug()`)
- [x] 2.6 Add published scope to Article model
- [x] 2.7 Add view count increment method to Article model

## 3. Model Factories
- [x] 3.1 Create ArticleFactory for testing
- [x] 3.2 Create CategoryFactory for testing
- [x] 3.3 Create TagFactory for testing
- [x] 3.4 Define realistic fake data for each factory

## 4. Database Seeders
- [x] 4.1 Create CategorySeeder with education and encyclopedia categories
- [x] 4.2 Create TagSeeder with common tags
- [x] 4.3 Create EducationContentSeeder with 5 core articles
- [x] 4.4 Create EncyclopediaSeeder with 6 fruit type entries
- [x] 4.5 Register seeders in DatabaseSeeder
- [x] 4.6 Run seeders and verify content

## 5. Public Article Controllers
- [x] 5.1 Create ArticleController for public article viewing
- [x] 5.2 Implement `index()` method with pagination and filtering
- [x] 5.3 Implement `show()` method with view count increment
- [x] 5.4 Implement search functionality
- [x] 5.5 Create EncyclopediaController for fruit type pages
- [x] 5.6 Add route model binding for Article and Category

## 6. Admin Article Controllers
- [x] 6.1 Create Admin\ArticleController for CMS
- [x] 6.2 Implement `index()` method (list all articles)
- [x] 6.3 Implement `create()` method (show creation form)
- [x] 6.4 Implement `store()` method with validation
- [x] 6.5 Implement `edit()` method (show editing form)
- [x] 6.6 Implement `update()` method with validation
- [x] 6.7 Implement `destroy()` method
- [x] 6.8 Implement `publish()` method (change status to published)
- [x] 6.9 Implement `unpublish()` method (change status to draft)

## 7. Form Request Validation
- [x] 7.1 Create StoreArticleRequest with validation rules
- [x] 7.2 Create UpdateArticleRequest with validation rules
- [x] 7.3 Add unique slug validation
- [x] 7.4 Add category and tag existence validation

## 8. Routes Configuration
- [x] 8.1 Add public education routes to `routes/web.php`
- [x] 8.2 Add public encyclopedia routes to `routes/web.php`
- [x] 8.3 Add search route for articles
- [x] 8.4 Add admin article resource routes with `role:admin` middleware
- [x] 8.5 Add publish/unpublish routes
- [x] 8.6 Verify route naming conventions

## 9. Public Frontend Pages (React/Inertia)
- [x] 9.1 Create `resources/js/Pages/Education/Index.tsx` (education home)
- [x] 9.2 Create `resources/js/Pages/Education/Show.tsx` (article detail)
- [x] 9.3 Create `resources/js/Pages/Encyclopedia/Index.tsx` (fruit catalog)
- [x] 9.4 Create `resources/js/Pages/Encyclopedia/Show.tsx` (fruit detail)
- [x] 9.5 Create `resources/js/Pages/Search/Index.tsx` (search results)
- [x] 9.6 Style all pages with Tailwind CSS
- [x] 9.7 Ensure mobile responsiveness

## 10. Admin CMS Pages (React/Inertia)
- [x] 10.1 Create `resources/js/Pages/Admin/Articles/Index.tsx` (article list)
- [x] 10.2 Create `resources/js/Pages/Admin/Articles/Create.tsx` (create form)
- [x] 10.3 Create `resources/js/Pages/Admin/Articles/Edit.tsx` (edit form)
- [x] 10.4 Add delete confirmation modal
- [x] 10.5 Add publish/unpublish buttons
- [x] 10.6 Show article status badges (draft/published)

## 11. Rich Text Editor Component
- [x] 11.1 Install TipTap dependencies (`npm install @tiptap/react @tiptap/starter-kit`)
- [x] 11.2 Create `resources/js/Components/RichTextEditor.tsx`
- [x] 11.3 Configure TipTap with essential extensions (Bold, Italic, Heading, List, Link)
- [x] 11.4 Add image upload functionality
- [x] 11.5 Style editor toolbar with Tailwind CSS
- [ ] 11.6 Add preview mode toggle

## 12. Seasonality Chart Component
- [x] 12.1 Install Recharts (`npm install recharts`)
- [x] 12.2 Create `resources/js/Components/SeasonalityChart.tsx`
- [x] 12.3 Implement bar chart for monthly harvest data
- [x] 12.4 Add responsive design for mobile
- [x] 12.5 Add tooltips for data points
- [x] 12.6 Add legend and axis labels

## 13. Content Components
- [x] 13.1 Create `ArticleCard.tsx` component for article previews (inline in pages)
- [x] 13.2 Create `CategoryFilter.tsx` component for filtering (inline in pages)
- [x] 13.3 Create `TagList.tsx` component for displaying tags (inline in pages)
- [x] 13.4 Create `SearchBar.tsx` component (inline in pages)
- [x] 13.5 Create `Breadcrumb.tsx` component for navigation (inline in pages)
- [x] 13.6 Create `RelatedArticles.tsx` component (inline in pages)

## 14. Media Management
- [ ] 14.1 Configure Laravel filesystem for article images
- [ ] 14.2 Create image upload endpoint in Admin\MediaController
- [ ] 14.3 Add image validation (size, type, dimensions)
- [ ] 14.4 Implement image optimization (resize, compress)
- [ ] 14.5 Store images in `storage/app/public/articles/`
- [ ] 14.6 Add image deletion when article is deleted

## 15. Search Functionality
- [x] 15.1 Add fulltext search query to Article model
- [ ] 15.2 Implement search ranking (title match > content match)
- [x] 15.3 Add category and tag filtering to search
- [x] 15.4 Paginate search results
- [ ] 15.5 Optimize search performance (< 500ms)

## 16. SEO & Metadata
- [x] 16.1 Add SEO metadata fields to articles (meta_title, meta_description, meta_keywords)
- [x] 16.2 Update Inertia Head component in article pages
- [ ] 16.3 Generate Open Graph tags for social sharing
- [ ] 16.4 Add canonical URLs
- [ ] 16.5 Create XML sitemap for public content

## 17. Analytics & Tracking
- [x] 17.1 Implement view count increment on article show
- [x] 17.2 Add "Last Updated" timestamp display
- [ ] 17.3 Create admin dashboard widget for popular articles
- [ ] 17.4 Add content staleness alerts (articles older than 6 months)

## 18. Testing
- [ ] 18.1 Write unit tests for Article model methods (5 tests)
- [ ] 18.2 Write unit tests for Category and Tag models (4 tests)
- [ ] 18.3 Write feature tests for public article viewing (6 tests)
- [ ] 18.4 Write feature tests for encyclopedia pages (4 tests)
- [ ] 18.5 Write feature tests for search functionality (5 tests)
- [ ] 18.6 Write feature tests for admin article CRUD (10 tests)
- [ ] 18.7 Write feature tests for publish/unpublish workflow (3 tests)
- [ ] 18.8 Write feature tests for image upload (3 tests)
- [ ] 18.9 Test permissions (non-admin cannot access admin routes) (2 tests)
- [ ] 18.10 Run full test suite and verify 100% pass rate

## 19. Documentation
- [ ] 19.1 Document content management workflow in README
- [ ] 19.2 Create content author guide (how to write articles)
- [ ] 19.3 Document rich text editor features
- [ ] 19.4 Add legal disclaimer templates
- [ ] 19.5 Document SEO best practices for content

## 20. Code Quality
- [ ] 20.1 Run Laravel Pint on all PHP files
- [ ] 20.2 Run TypeScript compiler and fix all errors
- [ ] 20.3 Verify no console warnings in frontend build
- [ ] 20.4 Review code for accessibility (WCAG 2.1 AA)
- [ ] 20.5 Test on mobile devices (iOS and Android)

## 21. Content Population
- [x] 21.1 Seed "How Fruit Tree Investing Works" article
- [x] 21.2 Seed "Understanding Risk Factors" article
- [x] 21.3 Seed "Harvest Cycles Explained" article
- [x] 21.4 Seed "ROI Calculation Guide" article
- [x] 21.5 Seed "Market Trends Analysis" article
- [x] 21.6 Seed Durian encyclopedia entry with seasonality chart
- [x] 21.7 Seed Mango encyclopedia entry with seasonality chart
- [x] 21.8 Seed Grapes encyclopedia entry with seasonality chart
- [x] 21.9 Seed Melon encyclopedia entry with seasonality chart
- [x] 21.10 Seed Citrus encyclopedia entry with seasonality chart
- [x] 21.11 Seed "Other Fruits" encyclopedia entry

## Post-Implementation
- [ ] Update AGENTS.md Section 4 (Folder Structure) with new directories
- [ ] Update AGENTS.md Section 6 (Data Models) with Article, Category, Tag entities
- [ ] Validate change proposal: `prompter validate add-information-education-center --strict --no-interactive`
- [ ] Request review and approval before merging
