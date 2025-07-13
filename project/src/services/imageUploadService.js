import api from './api';

// Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('swornim_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Upload single image
export async function uploadImage(file, endpoint, fieldName = 'image') {
  try {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await api.post(endpoint, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// Upload multiple images
export async function uploadMultipleImages(files, endpoint, fieldName = 'images') {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(fieldName, file);
    });

    const response = await api.post(endpoint, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw error;
  }
}

// Upload profile image
export async function uploadProfileImage(file) {
  return uploadImage(file, '/photographers/profile', 'profileImage');
}

// Upload portfolio images
export async function uploadPortfolioImages(files) {
  return uploadMultipleImages(files, '/photographers/portfolio/images', 'portfolioImage');
}

// Upload venue images
export async function uploadVenueImages(files) {
  return uploadMultipleImages(files, '/venues/profile', 'image');
}

// Upload user profile image
export async function uploadUserProfileImage(file) {
  return uploadImage(file, '/users/profile', 'profileImage');
}

// Generic upload function
export async function uploadToEndpoint(files, endpoint, fieldName = 'image') {
  if (Array.isArray(files)) {
    return uploadMultipleImages(files, endpoint, fieldName);
  } else {
    return uploadImage(files, endpoint, fieldName);
  }
} 