import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, tokens } = response.data.data;
      // Use the correct token field from backend response
      const token = tokens?.accessToken || tokens?.accessTokenMasked;
      
      // Store token and user data
      localStorage.setItem('swornim_token', token);
      localStorage.setItem('swornim_user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register user
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Registration does not log in user, so do not store token/user
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('swornim_token');
    localStorage.removeItem('swornim_user');
  },

  // Get current user
  getCurrentUser: () => {
    const token = localStorage.getItem('swornim_token');
    const userData = localStorage.getItem('swornim_user');
    
    if (token && userData) {
      try {
        return {
          token,
          user: JSON.parse(userData)
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('swornim_token');
        localStorage.removeItem('swornim_user');
      }
    }
    return null;
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }
};