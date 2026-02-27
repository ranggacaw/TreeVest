## 1. Database Schema Design
- [ ] 1.1 Create migration for `articles` table
- [ ] 1.2 Create migration for `categories` table
- [ ] 1.3 Create migration for `tags` table
- [ ] 1.4 Create migration for `article_category` pivot table
- [ ] 1.5 Create migration for `article_tag` pivot table
- [ ] 1.6 Add fulltext index on `articles.title` and `articles.content`
- [ ] 1.7 Run migrations and verify schema

## 2. Eloquent Models
- [ ] 2.1 Create Article model with relationships
- [ ] 2.2 Create Category model with relationships
- [ ] 2.3 Create Tag model with relationships
- [ ] 2.4 Add `$fillable` and `$casts` properties to all models
- [ ] 2.5 Add slug generation logic (use `Str::slug()`)
- [ ] 2.6 Add published scope to Article model
- [ ] 2.7 Add view count increment method to Article model

## 3. Model Factories
- [ ] 3.1 Create ArticleFactory for testing
- [ ] 3.2 Create CategoryFactory for testing
- [ ] 3.3 Create TagFactory for testing
- [ ] 3.4 Define realistic fake data for each factory

## 4. Database Seeders
- [ ] 4.1 Create CategorySeeder with education and encyclopedia categories
- [ ] 4.2 Create TagSeeder with common tags
- [ ] 4.3 Create EducationContentSeeder with 5 core articles
- [ ] 4.4 Create EncyclopediaSeeder with 6 fruit type entries
- [ ] 4.5 Register seeders in DatabaseSeeder
- [ ] 4.6 Run seeders and verify content

## 5. Public Article Controllers
- [ ] 5.1 Create ArticleController for public article viewing
- [ ] 5.2 Implement `index()` method with pagination and filtering
- [ ] 5.3 Implement `show()` method with view count increment
- [ ] 5.4 Implement search functionality
- [ ] 5.5 Create EncyclopediaController for fruit type pages
- [ ] 5.6 Add route model binding for Article and Category

## 6. Admin Article Controllers
- [ ] 6.1 Create Admin\ArticleController for CMS
- [ ] 6.2 Implement `index()` method (list all articles)
- [ ] 6.3 Implement `create()` method (show creation form)
- [ ] 6.4 Implement `store()` method with validation
- [ ] 6.5 Implement `edit()` method (show editing form)
- [ ] 6.6 Implement `update()` method with validation
- [ ] 6.7 Implement `destroy()` method
- [ ] 6.8 Implement `publish()` method (change status to published)
- [ ] 6.9 Implement `unpublish()` method (change status to draft)

## 7. Form Request Validation
- [ ] 7.1 Create StoreArticleRequest with validation rules
- [ ] 7.2 Create UpdateArticleRequest with validation rules
- [ ] 7.3 Add unique slug validation
- [ ] 7.4 Add category and tag existence validation

## 8. Routes Configuration
- [ ] 8.1 Add public education routes to `routes/web.php`
- [ ] 8.2 Add public encyclopedia routes to `routes/web.php`
- [ ] 8.3 Add search route for articles
- [ ] 8.4 Add admin article resource routes with `role:admin` middleware
- [ ] 8.5 Add publish/unpublish routes
- [ ] 8.6 Verify route naming conventions

## 9. Public Frontend Pages (React/Inertia)
- [ ] 9.1 Create `resources/js/Pages/Education/Index.tsx` (education home)
- [ ] 9.2 Create `resources/js/Pages/Education/Show.tsx` (article detail)
- [ ] 9.3 Create `resources/js/Pages/Encyclopedia/Index.tsx` (fruit catalog)
- [ ] 9.4 Create `resources/js/Pages/Encyclopedia/Show.tsx` (fruit detail)
- [ ] 9.5 Create `resources/js/Pages/Search/Index.tsx` (search results)
- [ ] 9.6 Style all pages with Tailwind CSS
- [ ] 9.7 Ensure mobile responsiveness

## 10. Admin CMS Pages (React/Inertia)
- [ ] 10.1 Create `resources/js/Pages/Admin/Articles/Index.tsx` (article list)
- [ ] 10.2 Create `resources/js/Pages/Admin/Articles/Create.tsx` (create form)
- [ ] 10.3 Create `resources/js/Pages/Admin/Articles/Edit.tsx` (edit form)
- [ ] 10.4 Add delete confirmation modal
- [ ] 10.5 Add publish/unpublish buttons
- [ ] 10.6 Show article status badges (draft/published)

## 11. Rich Text Editor Component
- [ ] 11.1 Install TipTap dependencies (`npm install @tiptap/react @tiptap/starter-kit`)
- [ ] 11.2 Create `resources/js/Components/RichTextEditor.tsx`
- [ ] 11.3 Configure TipTap with essential extensions (Bold, Italic, Heading, List, Link)
- [ ] 11.4 Add image upload functionality
- [ ] 11.5 Style editor toolbar with Tailwind CSS
- [ ] 11.6 Add preview mode toggle

## 12. Seasonality Chart Component
- [ ] 12.1 Install Recharts (`npm install recharts`)
- [ ] 12.2 Create `resources/js/Components/SeasonalityChart.tsx`
- [ ] 12.3 Implement bar chart for monthly harvest data
- [ ] 12.4 Add responsive design for mobile
- [ ] 12.5 Add tooltips for data points
- [ ] 12.6 Add legend and axis labels

## 13. Content Components
- [ ] 13.1 Create `ArticleCard.tsx` component for article previews
- [ ] 13.2 Create `CategoryFilter.tsx` component for filtering
- [ ] 13.3 Create `TagList.tsx` component for displaying tags
- [ ] 13.4 Create `SearchBar.tsx` component
- [ ] 13.5 Create `Breadcrumb.tsx` component for navigation
- [ ] 13.6 Create `RelatedArticles.tsx` component

## 14. Media Management
- [ ] 14.1 Configure Laravel filesystem for article images
- [ ] 14.2 Create image upload endpoint in Admin\MediaController
- [ ] 14.3 Add image validation (size, type, dimensions)
- [ ] 14.4 Implement image optimization (resize, compress)
- [ ] 14.5 Store images in `storage/app/public/articles/`
- [ ] 14.6 Add image deletion when article is deleted

## 15. Search Functionality
- [ ] 15.1 Add fulltext search query to Article model
- [ ] 15.2 Implement search ranking (title match > content match)
- [ ] 15.3 Add category and tag filtering to search
- [ ] 15.4 Paginate search results
- [ ] 15.5 Optimize search performance (< 500ms)

## 16. SEO & Metadata
- [ ] 16.1 Add SEO metadata fields to articles (meta_title, meta_description, meta_keywords)
- [ ] 16.2 Update Inertia Head component in article pages
- [ ] 16.3 Generate Open Graph tags for social sharing
- [ ] 16.4 Add canonical URLs
- [ ] 16.5 Create XML sitemap for public content

## 17. Analytics & Tracking
- [ ] 17.1 Implement view count increment on article show
- [ ] 17.2 Add "Last Updated" timestamp display
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
- [ ] 21.1 Seed "How Fruit Tree Investing Works" article
- [ ] 21.2 Seed "Understanding Risk Factors" article
- [ ] 21.3 Seed "Harvest Cycles Explained" article
- [ ] 21.4 Seed "ROI Calculation Guide" article
- [ ] 21.5 Seed "Market Trends Analysis" article
- [ ] 21.6 Seed Durian encyclopedia entry with seasonality chart
- [ ] 21.7 Seed Mango encyclopedia entry with seasonality chart
- [ ] 21.8 Seed Grapes encyclopedia entry with seasonality chart
- [ ] 21.9 Seed Melon encyclopedia entry with seasonality chart
- [ ] 21.10 Seed Citrus encyclopedia entry with seasonality chart
- [ ] 21.11 Seed "Other Fruits" encyclopedia entry

## Post-Implementation
- [ ] Update AGENTS.md Section 4 (Folder Structure) with new directories
- [ ] Update AGENTS.md Section 6 (Data Models) with Article, Category, Tag entities
- [ ] Validate change proposal: `prompter validate add-information-education-center --strict --no-interactive`
- [ ] Request review and approval before merging
