const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class CMSService {
  // ============= CONTENT SECTIONS =============

  async getPageSections(pageName) {
    try {
      const response = await fetch(`${API_URL}/api/cms/sections/${pageName}`);
      if (!response.ok) throw new Error('Failed to fetch sections');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching sections for ${pageName}:`, error);
      return [];
    }
  }

  async getSection(pageName, sectionKey) {
    try {
      const response = await fetch(`${API_URL}/api/cms/sections/${pageName}/${sectionKey}`);
      if (!response.ok) throw new Error('Failed to fetch section');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching section ${pageName}/${sectionKey}:`, error);
      return null;
    }
  }

  // ============= SITE SETTINGS =============

  async getAllSettings() {
    try {
      const response = await fetch(`${API_URL}/api/cms/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const settings = await response.json();

      // Convert array of settings to object for easier access
      return settings.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  }

  async getSettingsByCategory(category) {
    try {
      const response = await fetch(`${API_URL}/api/cms/settings/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching settings for ${category}:`, error);
      return [];
    }
  }

  // ============= TEAM MEMBERS =============

  async getTeamMembers(category = null) {
    try {
      const url = category
        ? `${API_URL}/api/cms/team?category=${category}`
        : `${API_URL}/api/cms/team`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch team members');
      return await response.json();
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  async getTeamMember(id) {
    try {
      const response = await fetch(`${API_URL}/api/cms/team/${id}`);
      if (!response.ok) throw new Error('Failed to fetch team member');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching team member ${id}:`, error);
      return null;
    }
  }

  // ============= PROGRAMS =============

  async getPrograms() {
    try {
      const response = await fetch(`${API_URL}/api/cms/programs`);
      if (!response.ok) throw new Error('Failed to fetch programs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
  }

  async getProgram(slug) {
    try {
      const response = await fetch(`${API_URL}/api/cms/programs/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch program');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching program ${slug}:`, error);
      return null;
    }
  }

  // ============= EVENTS =============

  async getEvents(upcomingOnly = false) {
    try {
      const url = upcomingOnly
        ? `${API_URL}/api/cms/events?upcoming=true`
        : `${API_URL}/api/cms/events`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEvent(id) {
    try {
      const response = await fetch(`${API_URL}/api/cms/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      return null;
    }
  }

  // ============= NAVIGATION =============

  async getNavigation(location) {
    try {
      const response = await fetch(`${API_URL}/api/cms/navigation/${location}`);
      if (!response.ok) throw new Error('Failed to fetch navigation');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching navigation for ${location}:`, error);
      return [];
    }
  }

  // ============= PAGE CONTENT =============

  async getPage(pageName) {
    try {
      const response = await fetch(`${API_URL}/api/cms/pages/${pageName}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching page ${pageName}:`, error);
      return null;
    }
  }
}

const cmsService = new CMSService();
export default cmsService;
