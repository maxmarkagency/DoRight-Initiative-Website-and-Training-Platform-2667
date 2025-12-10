// Use a relative path for production, and the env var for development
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:4000/api');

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const tokenData = localStorage.getItem('sb-jqekzavaerbxjzyeihvv-auth-token');
    let token = null;
    if (tokenData) {
      try {
        token = JSON.parse(tokenData).access_token;
      } catch(e) {
        console.error("Error parsing auth token from local storage", e);
      }
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Check if the response indicates success (either HTTP 200 or success: true)
      if (!response.ok && !data.success) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  // Migration endpoints
  async listMigrations() {
    return this.request('/migrations');
  }

  async getMigration(migrationId) {
    return this.request(`/migrations/${migrationId}`);
  }

  async approveMigration(migrationId, metadata = {}) {
    return this.request('/migrations/approve', {
      method: 'POST',
      body: JSON.stringify({
        migrationId,
        metadata: { ...metadata, source: 'admin-panel' }
      }),
    });
  }

  async getMigrationHistory() {
    return this.request('/migrations/history/all');
  }

  // Blog endpoints
  async getBlogPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clean/blog${queryString ? `?${queryString}` : ''}`);
  }

  async getBlogPost(id) {
    return this.request(`/clean/blog/${id}`);
  }

  async createBlogPost(postData) {
    return this.request('/admin/blog', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updateBlogPost(id, postData) {
    return this.request(`/admin/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deleteBlogPost(id) {
    return this.request(`/admin/blog/${id}`, {
      method: 'DELETE',
    });
  }

  // Gallery endpoints
  async getGalleryItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/gallery${queryString ? `?${queryString}` : ''}`);
  }

  async createGalleryItem(itemData) {
    return this.request('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateGalleryItem(id, itemData) {
    return this.request(`/admin/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteGalleryItem(id) {
    return this.request(`/admin/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload endpoints
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const tokenData = localStorage.getItem('sb-jqekzavaerbxjzyeihvv-auth-token');
    let token = null;
    if (tokenData) {
      try {
        token = JSON.parse(tokenData).access_token;
      } catch(e) {
        console.error("Error parsing auth token from local storage", e);
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok && !data.success) {
        throw new Error(data.error || data.message || `Upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files, onProgress) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const tokenData = localStorage.getItem('sb-jqekzavaerbxjzyeihvv-auth-token');
    let token = null;
    if (tokenData) {
      try {
        token = JSON.parse(tokenData).access_token;
      } catch(e) {
        console.error("Error parsing auth token from local storage", e);
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/upload/multiple`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok && !data.success) {
        throw new Error(data.error || data.message || `Upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Multiple files upload failed:', error);
      throw error;
    }
  }
}

export default new ApiService();