# content-management Specification

## Purpose
TBD - created by archiving change add-information-education-center. Update Purpose after archive.
## Requirements
### Requirement: Article Content Management
The system SHALL provide a content management system for creating and managing educational articles.

#### Scenario: Admin creates new article
- **WHEN** an admin user creates a new article with title, content, and category
- **THEN** the system SHALL save the article with status `draft`
- **AND** the article SHALL be assigned a unique slug based on the title
- **AND** the article SHALL be associated with the authenticated admin as author

#### Scenario: Admin publishes article
- **WHEN** an admin publishes a draft article
- **THEN** the system SHALL change the article status to `published`
- **AND** the system SHALL set the `published_at` timestamp
- **AND** the article SHALL become visible to public users

#### Scenario: Admin unpublishes article
- **WHEN** an admin unpublishes a published article
- **THEN** the system SHALL change the article status to `draft`
- **AND** the article SHALL no longer be visible to public users

#### Scenario: Admin edits published article
- **WHEN** an admin edits a published article and saves changes
- **THEN** the system SHALL update the article content
- **AND** the article SHALL remain published
- **AND** the `updated_at` timestamp SHALL be updated

#### Scenario: Admin deletes article
- **WHEN** an admin deletes an article
- **THEN** the system SHALL remove the article from the database
- **AND** the system SHALL delete associated images from storage

### Requirement: Article Categorization and Tagging
The system SHALL support organizing articles by categories and tags.

#### Scenario: Assign category to article
- **WHEN** an admin assigns one or more categories to an article
- **THEN** the system SHALL associate the article with the specified categories
- **AND** the article SHALL appear in category-filtered views

#### Scenario: Assign tags to article
- **WHEN** an admin assigns tags to an article
- **THEN** the system SHALL associate the article with the specified tags
- **AND** the article SHALL be discoverable via tag-based filtering

#### Scenario: Filter articles by category
- **WHEN** a user views articles filtered by a specific category
- **THEN** the system SHALL display only articles in that category
- **AND** the system SHALL show the category name and description

#### Scenario: Filter articles by tag
- **WHEN** a user views articles filtered by a specific tag
- **THEN** the system SHALL display only articles with that tag
- **AND** the system SHALL show the tag name

### Requirement: Public Article Viewing
The system SHALL allow public access to published educational content without authentication.

#### Scenario: Public user browses education section
- **WHEN** an unauthenticated user visits the education section
- **THEN** the system SHALL display a list of published articles
- **AND** the system SHALL show article title, excerpt, and featured image
- **AND** the list SHALL be paginated

#### Scenario: Public user views article detail
- **WHEN** a user clicks on an article
- **THEN** the system SHALL display the full article content
- **AND** the system SHALL increment the view count
- **AND** the system SHALL display related articles at the end

#### Scenario: Authenticated user views article
- **WHEN** an authenticated user views an article
- **THEN** the system SHALL display the article with the same content as public users
- **AND** the system SHALL not require special permissions

### Requirement: Encyclopedia Content
The system SHALL provide an encyclopedia of fruit types with detailed information.

#### Scenario: Browse fruit types
- **WHEN** a user visits the encyclopedia section
- **THEN** the system SHALL display a catalog of fruit types
- **AND** each fruit type SHALL show an image, name, and brief description

#### Scenario: View fruit type detail
- **WHEN** a user clicks on a fruit type
- **THEN** the system SHALL display detailed information including:
  - **AND** Fruit variants (e.g., Durian: Musang King, D24, Black Thorn)
  - **AND** Growing conditions and requirements
  - **AND** Market demand insights
  - **AND** Seasonality chart showing harvest months

#### Scenario: Seasonality chart display
- **WHEN** a user views a fruit type detail page
- **THEN** the system SHALL display a visual seasonality chart
- **AND** the chart SHALL show harvest months with relative yield levels
- **AND** the chart SHALL be responsive and readable on mobile devices

### Requirement: Content Search
The system SHALL provide full-text search across all published content.

#### Scenario: Search by keyword
- **WHEN** a user enters a search query
- **THEN** the system SHALL return articles matching the query in title or content
- **AND** the system SHALL rank results by relevance (title match first, then content)
- **AND** the system SHALL return results in less than 500ms

#### Scenario: Search with category filter
- **WHEN** a user searches with a category filter applied
- **THEN** the system SHALL return only matching articles within the selected category

#### Scenario: Search with tag filter
- **WHEN** a user searches with a tag filter applied
- **THEN** the system SHALL return only matching articles with the selected tag

#### Scenario: No search results
- **WHEN** a search query returns no results
- **THEN** the system SHALL display a "no results" message
- **AND** the system SHALL suggest browsing by category or viewing popular articles

### Requirement: Rich Text Content Editing
The system SHALL provide a rich text editor for article content authoring.

#### Scenario: Admin uses rich text editor
- **WHEN** an admin creates or edits an article
- **THEN** the system SHALL provide a WYSIWYG editor
- **AND** the editor SHALL support bold, italic, headings, lists, and links
- **AND** the editor SHALL support image insertion via upload

#### Scenario: Upload image in article
- **WHEN** an admin uploads an image in the editor
- **THEN** the system SHALL validate the image (max 5MB, JPG/PNG/WebP)
- **AND** the system SHALL optimize the image (resize, compress)
- **AND** the system SHALL store the image and insert it into the content

#### Scenario: Preview article before publishing
- **WHEN** an admin clicks the preview button
- **THEN** the system SHALL display the article as it will appear to public users
- **AND** the system SHALL not change the article status

### Requirement: SEO and Metadata
The system SHALL support SEO metadata for articles.

#### Scenario: Set SEO metadata
- **WHEN** an admin creates or edits an article
- **THEN** the system SHALL allow setting meta title, meta description, and meta keywords
- **AND** the system SHALL validate meta description length (max 160 characters)

#### Scenario: Generate Open Graph tags
- **WHEN** a public user shares an article on social media
- **THEN** the system SHALL provide Open Graph meta tags
- **AND** the tags SHALL include article title, excerpt, and featured image

#### Scenario: Generate XML sitemap
- **WHEN** search engines crawl the site
- **THEN** the system SHALL provide an XML sitemap of all published articles
- **AND** the sitemap SHALL include last modified dates

### Requirement: Content Analytics
The system SHALL track article performance metrics.

#### Scenario: Track article views
- **WHEN** a user views an article
- **THEN** the system SHALL increment the view count
- **AND** the view count SHALL be displayed to admins in the CMS

#### Scenario: Display popular articles
- **WHEN** an admin views the CMS dashboard
- **THEN** the system SHALL display the top 10 most-viewed articles
- **AND** the list SHALL show view counts and publication dates

#### Scenario: Identify stale content
- **WHEN** an article has not been updated in 6 months
- **THEN** the system SHALL flag it as potentially stale in the admin dashboard
- **AND** the system SHALL prompt the admin to review and update

### Requirement: Content Permissions
The system SHALL restrict content management to admin users only.

#### Scenario: Admin accesses CMS
- **WHEN** an authenticated user with role `admin` accesses the article management interface
- **THEN** the system SHALL grant access to all CMS features

#### Scenario: Non-admin attempts to access CMS
- **WHEN** a user without admin role attempts to access the CMS
- **THEN** the system SHALL deny access with HTTP 403 Forbidden
- **AND** the system SHALL redirect to a 403 error page

#### Scenario: Unauthenticated user attempts to access CMS
- **WHEN** an unauthenticated user attempts to access the CMS
- **THEN** the system SHALL redirect to the login page

### Requirement: Legal Disclaimers
The system SHALL display legal disclaimers on educational content.

#### Scenario: Display disclaimer on education articles
- **WHEN** a user views an investment education article
- **THEN** the system SHALL display a disclaimer stating:
  - **AND** "This content is for educational purposes only"
  - **AND** "This does not constitute financial advice"
  - **AND** "Consult a financial advisor before making investment decisions"

#### Scenario: Display disclaimer on encyclopedia pages
- **WHEN** a user views a fruit type encyclopedia page
- **THEN** the system SHALL display a disclaimer stating market data is historical and not guaranteed

### Requirement: Mobile Responsiveness
The system SHALL ensure all content pages are mobile-responsive.

#### Scenario: View article on mobile device
- **WHEN** a user accesses an article on a mobile device
- **THEN** the system SHALL display the article in a mobile-optimized layout
- **AND** images SHALL scale to fit the screen width
- **AND** text SHALL be readable without zooming

#### Scenario: View seasonality chart on mobile
- **WHEN** a user views a seasonality chart on a mobile device
- **THEN** the chart SHALL scale appropriately
- **AND** the chart SHALL remain interactive and readable

### Requirement: Content Seeding
The system SHALL provide initial content for education and encyclopedia sections.

#### Scenario: Seed education content
- **WHEN** the content seeder runs
- **THEN** the system SHALL create at least 5 core education articles:
  - **AND** "How Fruit Tree Investing Works"
  - **AND** "Understanding Risk Factors"
  - **AND** "Harvest Cycles Explained"
  - **AND** "ROI Calculation Guide"
  - **AND** "Market Trends Analysis"

#### Scenario: Seed encyclopedia content
- **WHEN** the content seeder runs
- **THEN** the system SHALL create at least 6 fruit type encyclopedia entries:
  - **AND** Durian (with variants: Musang King, D24, Black Thorn, Red Prawn)
  - **AND** Mango (with variants: Alphonso, Nam Doc Mai, Carabao, Kent)
  - **AND** Grapes (with variants: Thompson Seedless, Concord, Shine Muscat)
  - **AND** Melon (with variants: Honeydew, Cantaloupe, Yubari King)
  - **AND** Citrus (with variants: Valencia Orange, Meyer Lemon, Pomelo)
  - **AND** Others (Avocado, Longan, Rambutan, Mangosteen)

