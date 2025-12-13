# DoRight CMS - Content Management System Documentation

## Overview

The DoRight CMS is a comprehensive content management system that allows administrators to edit all website content without touching code. This includes page sections, team members, programs, events, site settings, and navigation menus.

## Features

- **Page Content Management**: Edit text, images, and layouts for all pages
- **Team Member Management**: Add, edit, and remove team members and trustees
- **Program Management**: Manage all organizational programs and initiatives
- **Events Calendar**: Create and manage events and webinars
- **Site Settings**: Global configuration including contact info and social media
- **Navigation Management**: Dynamic header and footer menus
- **Role-Based Access**: Admin-only write access with public read access
- **Real-Time Updates**: Changes reflect immediately on the website

## Accessing the CMS

1. Log in as an admin user
2. Navigate to the Admin Dashboard
3. Click on "Content" in the sidebar menu
4. Select the page or content type you want to edit

## Database Tables

### 1. `content_sections`
Stores all page sections with flexible JSON data structure.

**Fields:**
- `id`: Unique identifier
- `page_name`: Which page this section belongs to (e.g., 'home', 'about')
- `section_key`: Unique identifier for the section (e.g., 'hero', 'stats')
- `section_type`: Type of section ('hero', 'statistics', 'features', etc.)
- `position`: Display order on the page
- `content_data`: JSON object with section content
- `is_visible`: Whether the section is displayed on the website
- `created_at`, `updated_at`: Timestamps

**Example:**
```json
{
  "page_name": "home",
  "section_key": "hero",
  "section_type": "hero",
  "position": 1,
  "content_data": {
    "title": "Building a Nigeria That Does Right",
    "subtitle": "Empower. Educate. Transform.",
    "description": "Join the movement...",
    "cta_primary": {
      "text": "Join The Movement",
      "url": "/join"
    }
  },
  "is_visible": true
}
```

### 2. `site_settings`
Global site configuration and settings.

**Fields:**
- `id`: Unique identifier
- `setting_key`: Unique key (e.g., 'site_name', 'contact_email')
- `setting_value`: The actual value
- `setting_type`: Data type ('text', 'email', 'url', 'json')
- `category`: Group ('general', 'contact', 'social', 'branding')
- `description`: Help text for admins
- `updated_at`: Timestamp

**Common Settings:**
- `site_name`: Organization name
- `site_tagline`: Main tagline
- `contact_email`: Main contact email
- `contact_phone`: Contact phone number
- `contact_address`: Physical address
- `facebook_url`, `twitter_url`, `instagram_url`, `linkedin_url`: Social media links

### 3. `team_members`
Team members, trustees, and staff profiles.

**Fields:**
- `id`: Unique identifier
- `name`: Full name
- `role`: Position/title
- `category`: Type ('trustee', 'staff', 'advisor')
- `bio_short`: Brief description (1-2 sentences)
- `bio_full`: Complete biography
- `image_url`: Profile photo URL
- `email`: Contact email
- `linkedin_url`: LinkedIn profile
- `position_order`: Display order
- `is_featured`: Show on main pages
- `is_active`: Currently active member
- `created_at`, `updated_at`: Timestamps

### 4. `programs_cms`
Organizational programs and initiatives.

**Fields:**
- `id`: Unique identifier
- `title`: Program name
- `subtitle`: Brief tagline
- `slug`: URL-friendly identifier
- `description`: Full description
- `short_description`: Brief overview
- `features`: JSON array of feature items
- `image_url`: Main program image
- `icon_name`: Icon identifier
- `color_scheme`: CSS color class
- `position_order`: Display order
- `is_active`: Currently active
- `created_at`, `updated_at`: Timestamps

### 5. `events_calendar`
Events, workshops, summits, and webinars.

**Fields:**
- `id`: Unique identifier
- `title`: Event name
- `description`: Full description
- `event_date`: When the event occurs
- `location`: Venue or online
- `location_address`: Full address
- `event_type`: Type ('workshop', 'summit', 'webinar', 'training')
- `registration_url`: Link to register
- `image_url`: Event banner
- `is_featured`: Show prominently
- `is_published`: Visible to public
- `max_attendees`: Capacity limit
- `created_at`, `updated_at`: Timestamps

### 6. `navigation_items`
Dynamic menu management.

**Fields:**
- `id`: Unique identifier
- `menu_location`: Where to display ('header', 'footer')
- `label`: Display text
- `url`: Link destination
- `parent_id`: For nested/dropdown menus
- `position_order`: Display order
- `is_external`: Opens in new tab
- `is_active`: Currently visible
- `created_at`, `updated_at`: Timestamps

## API Endpoints

All CMS API endpoints are under `/api/cms/`

### Content Sections

- `GET /api/cms/sections/:pageName` - Get all sections for a page
- `GET /api/cms/sections/:pageName/:sectionKey` - Get specific section
- `POST /api/cms/sections` - Create or update section (Admin only)
- `PATCH /api/cms/sections/:id/visibility` - Toggle visibility (Admin only)
- `DELETE /api/cms/sections/:id` - Delete section (Admin only)

### Site Settings

- `GET /api/cms/settings` - Get all settings
- `GET /api/cms/settings/category/:category` - Get settings by category
- `PUT /api/cms/settings/:key` - Update setting (Admin only)

### Team Members

- `GET /api/cms/team` - Get all team members
- `GET /api/cms/team/:id` - Get single team member
- `POST /api/cms/team` - Create team member (Admin only)
- `PUT /api/cms/team/:id` - Update team member (Admin only)
- `DELETE /api/cms/team/:id` - Delete team member (Admin only)

### Programs

- `GET /api/cms/programs` - Get all programs
- `GET /api/cms/programs/:slug` - Get single program
- `POST /api/cms/programs` - Create program (Admin only)
- `PUT /api/cms/programs/:id` - Update program (Admin only)
- `DELETE /api/cms/programs/:id` - Delete program (Admin only)

### Events

- `GET /api/cms/events` - Get all events
- `GET /api/cms/events?upcoming=true` - Get upcoming events only
- `GET /api/cms/events/:id` - Get single event
- `POST /api/cms/events` - Create event (Admin only)
- `PUT /api/cms/events/:id` - Update event (Admin only)
- `DELETE /api/cms/events/:id` - Delete event (Admin only)

### Navigation

- `GET /api/cms/navigation/:location` - Get navigation items
- `POST /api/cms/navigation` - Create navigation item (Admin only)
- `PUT /api/cms/navigation/:id` - Update navigation item (Admin only)
- `DELETE /api/cms/navigation/:id` - Delete navigation item (Admin only)

## Using the CMS in Code

### Frontend Integration

The CMS service provides easy access to all content:

```javascript
import cmsService from './services/cmsService';

// Get page sections
const sections = await cmsService.getPageSections('home');

// Get specific section
const heroSection = await cmsService.getSection('home', 'hero');

// Get all settings
const settings = await cmsService.getAllSettings();
console.log(settings.site_name); // "Doing Right Awareness Initiative"

// Get team members
const trustees = await cmsService.getTeamMembers('trustee');

// Get programs
const programs = await cmsService.getPrograms();

// Get upcoming events
const upcomingEvents = await cmsService.getEvents(true);
```

### Dynamic Section Component

Use the `DynamicSection` component to automatically fetch and render content:

```jsx
import DynamicSection from './components/DynamicSection';

function HomePage() {
  return (
    <DynamicSection pageName="home" sectionKey="hero">
      {(content) => (
        <div>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
          <a href={content.cta_primary.url}>
            {content.cta_primary.text}
          </a>
        </div>
      )}
    </DynamicSection>
  );
}
```

## Best Practices

### Content Structure

1. **Keep JSON data flat when possible**: Avoid deep nesting
2. **Use consistent field names**: Stick to conventions like `title`, `description`, `image_url`
3. **Store arrays as JSON arrays**: For features, tags, etc.
4. **Use descriptive section keys**: Make them meaningful like 'hero', 'mission', 'stats'

### Section Types

Common section types:
- `hero`: Hero sections with title, subtitle, CTA
- `statistics`: Stat cards with numbers and labels
- `features`: Feature grids with icons, titles, descriptions
- `text`: Rich text content blocks
- `testimonials`: Customer testimonials and reviews
- `team`: Team member cards
- `gallery`: Image galleries
- `cta`: Call-to-action sections

### Performance

1. **Use caching**: The CMS service implements caching
2. **Load sections on demand**: Only fetch what you need
3. **Use loading states**: Show skeletons while fetching
4. **Handle errors gracefully**: Provide fallback content

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Public read access**: Anyone can view published content
- **Admin-only writes**: Only admins can modify content
- **Authentication required**: Admin routes require valid JWT token
- **Input validation**: All inputs are validated before saving

## Troubleshooting

### Content not updating

1. Check if section is marked as visible (`is_visible = true`)
2. Clear browser cache
3. Check for JavaScript console errors
4. Verify API is running and accessible

### Admin cannot edit

1. Verify user has admin role in database
2. Check authentication token is valid
3. Look for CORS errors in console
4. Verify API endpoint is correct

### Images not displaying

1. Ensure image URLs are publicly accessible
2. Check for HTTPS/HTTP mixed content issues
3. Verify image URL is correct in database
4. Check browser console for 404 errors

## Future Enhancements

Planned features for future releases:

- Content versioning and rollback
- Multi-language support
- Content scheduling (publish/unpublish at specific times)
- Media library with drag-and-drop upload
- Content preview before publishing
- Bulk operations
- Content import/export
- Activity log and audit trail
- SEO optimization tools
- Content templates

## Support

For technical support or questions about the CMS:
- Contact: tech@doright.ng
- Documentation: /docs/cms
- Admin Guide: /admin/help

---

**Last Updated**: 2024
**Version**: 1.0.0
