/**
 * TESTWEST MOBILE API SERVICE
 * 
 * This file is designed to be used in a React Native application.
 * It provides a complete interface to the TestWest backend hosted on Render.
 * 
 * Usage:
 * 1. Copy this file to your React Native project.
 * 2. Install dependencies: npm install axios @react-native-async-storage/async-storage
 * 3. Update the BASE_URL to your Render backend URL.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// --- CONFIGURATION ---
const BASE_URL = 'https://testwest.onrender.com';

// --- TYPES ---
export type Role = 'STUDENT' | 'PARENT' | 'TEACHER' | 'SCHOOL' | 'SOLO';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ' | 'MSQ' | 'Fill in the blanks' | 'Short answer';
export type AssignmentStatus = 'Assigned' | 'In progress' | 'Completed' | 'Overdue';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
}

// --- STORAGE INTERFACE ---
// You can swap this with AsyncStorage or react-native-mmkv
export interface AuthStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// Default implementation (placeholder, override with AsyncStorage in RN)
let storage: AuthStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

export const setAuthStorage = (newStorage: AuthStorage) => {
  storage = newStorage;
};

// --- API CLIENT ---
const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token into every request
client.interceptors.request.use(async (config) => {
  const token = await storage.getItem('testwest_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global errors (like 401)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem('testwest_token');
      // Handle navigation to login here if needed
    }
    return Promise.reject(error);
  }
);

// --- SERVICES ---

export const authService = {
  register: async (data: any) => {
    const res = await client.post('/auth/register', data);
    if (res.data.token) {
      await storage.setItem('testwest_token', res.data.token);
    }
    return res.data;
  },
  login: async (credentials: { email: string; password: string }) => {
    const res = await client.post('/auth/login', credentials);
    if (res.data.token) {
      await storage.setItem('testwest_token', res.data.token);
    }
    return res.data;
  },
  getMe: () => client.get('/auth/me').then(r => r.data),
  logout: async () => {
    await storage.removeItem('testwest_token');
  },
};

export const userService = {
  getMe: () => client.get('/users/me').then(r => r.data),
  updateMe: (data: any) => client.patch('/users/me', data).then(r => r.data),
};

export const studentService = {
  list: (params = {}) => client.get('/students', { params }).then(r => r.data),
  get: (id: string) => client.get(`/students/${id}`).then(r => r.data),
  update: (id: string, data: any) => client.patch(`/students/${id}`, data).then(r => r.data),
  getDashboard: (id: string) => client.get(`/students/${id}/dashboard`).then(r => r.data),
  getTests: (id: string, params = {}) => client.get(`/students/${id}/tests`, { params }).then(r => r.data),
};

export const parentService = {
  list: (params = {}) => client.get('/parents', { params }).then(r => r.data),
  get: (id: string) => client.get(`/parents/${id}`).then(r => r.data),
  update: (id: string, data: any) => client.patch(`/parents/${id}`, data).then(r => r.data),
  getChildren: (id: string) => client.get(`/parents/${id}/children`).then(r => r.data),
  getChildDashboard: (id: string, childId: string) => 
    client.get(`/parents/${id}/children/${childId}/dashboard`).then(r => r.data),
  linkChild: (id: string, studentId: string) => 
    client.post(`/parents/${id}/link-student`, { studentId }).then(r => r.data),
};

export const teacherService = {
  list: (params = {}) => client.get('/teachers', { params }).then(r => r.data),
  get: (id: string) => client.get(`/teachers/${id}`).then(r => r.data),
  getStats: (id: string) => client.get(`/teachers/${id}/stats`).then(r => r.data),
  getStudents: (id: string) => client.get(`/teachers/${id}/students`).then(r => r.data),
  getAnalytics: (id: string) => client.get(`/teachers/${id}/analytics/subjects`).then(r => r.data),
  getTopicMastery: (id: string) => client.get(`/teachers/${id}/analytics/topics`).then(r => r.data),
};

export const schoolService = {
  list: (params = {}) => client.get('/schools', { params }).then(r => r.data),
  get: (id: string) => client.get(`/schools/${id}`).then(r => r.data),
  getStats: (id: string) => client.get(`/schools/${id}/stats`).then(r => r.data),
  getTeachers: (id: string) => client.get(`/schools/${id}/teachers`).then(r => r.data),
  listClasses: (id: string) => client.get(`/schools/${id}/classes`).then(r => r.data),
  getClassStudents: (id: string, classId: string) => 
    client.get(`/schools/${id}/classes/${classId}/students`).then(r => r.data),
};

export const testService = {
  list: (params = {}) => client.get('/tests', { params }).then(r => r.data),
  create: (data: any) => client.post('/tests', data).then(r => r.data),
  get: (id: string) => client.get(`/tests/${id}`).then(r => r.data),
  autosave: (id: string, questionId: string, data: { givenAnswer?: any, timeSpentSeconds?: number, flagged?: boolean }) => 
    client.patch(`/tests/${id}/responses/${questionId}`, data).then(r => r.data),
  submit: (id: string) => client.post(`/tests/${id}/submit`).then(r => r.data),
  generateAI: (data: any) => client.post('/tests/generate-ai', data).then(r => r.data),
};

export const curriculumService = {
  getBoards: () => client.get('/curriculum/boards').then(r => r.data),
  getGrades: () => client.get('/curriculum/grades').then(r => r.data),
  getSubjects: (params = {}) => client.get('/curriculum/subjects', { params }).then(r => r.data),
  getChapters: (params = {}) => client.get('/curriculum/chapters', { params }).then(r => r.data),
  getTopics: (params = {}) => client.get('/curriculum/topics', { params }).then(r => r.data),
  getSubtopics: (params = {}) => client.get('/curriculum/subtopics', { params }).then(r => r.data),
  getQuestionCount: (params = {}) => client.get('/curriculum/questions/count', { params }).then(r => r.data),
};

export const assignmentService = {
  list: (params = {}) => client.get('/assignments', { params }).then(r => r.data),
  create: (data: any) => client.post('/assignments', data).then(r => r.data),
  update: (id: string, data: any) => client.patch(`/assignments/${id}`, data).then(r => r.data),
  delete: (id: string) => client.delete(`/assignments/${id}`).then(r => r.data),
};

export default {
  auth: authService,
  user: userService,
  student: studentService,
  parent: parentService,
  teacher: teacherService,
  school: schoolService,
  test: testService,
  curriculum: curriculumService,
  assignment: assignmentService,
  setAuthStorage,
};
