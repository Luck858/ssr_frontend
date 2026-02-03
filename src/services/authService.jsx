import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.get('/api/auth/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await api.post('/api/auth/reset-password', {
      resetToken,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const storeToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const storeUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getCurrentUserId = () => {
  const u = getUser();
  return u?._id || u?.id || null;
};

export const getCurrentUserBranch = () => {
  const u = getUser();
  
  return u?.department  || null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const adminRegisterUser = async (userData) => {
  try {
    const response = await api.post('/api/admin/register-user', userData, {
      headers: {
        'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const teacherRegisterStudent = async (studentData) => {
  try {
    const response = await api.post('/api/teacher/register-student', studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const toggleTeacherPermission = async (userId) => {
  try {
    const response = await api.patch(`/api/admin/toggle-permission/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    console.log(queryParams);
    const response = await api.get(`/api/admin/users?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};


export const getAllUsersForTeacher = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    console.log(queryParams);
    const response = await api.get(`/api/user?${queryParams}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getMyStudents = async () => {
  try {
    const response = await api.get('/api/teacher/my-students');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getUsersWithPhotos = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/user/photos?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getPublicFaculty = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    // Use axios without auth for public endpoint
    const response = await axios.get(`${API_URL}/api/user/public/faculty?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export default api;
