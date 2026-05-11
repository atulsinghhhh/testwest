# TestWest Mobile Integration Guide

Since you've converted the TestWest website to a React Native mobile app, you can use the newly created `src/services/mobile-api.ts` file to handle all your API interactions with the Render backend.

## 1. Prerequisites
Ensure you have `axios` and `@react-native-async-storage/async-storage` installed in your React Native project:

```bash
npm install axios @react-native-async-storage/async-storage
```

## 2. Setup
In your mobile app's entry point (e.g., `App.tsx` or `index.js`), set up the storage for the API client:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/mobile-api';

// Initialize the API with AsyncStorage
api.setAuthStorage({
  getItem: async (key) => await AsyncStorage.getItem(key),
  setItem: async (key, value) => await AsyncStorage.setItem(key, value),
  removeItem: async (key) => await AsyncStorage.removeItem(key),
});
```

## 3. Usage Examples

### Login
```typescript
const handleLogin = async (email, password) => {
  try {
    const user = await api.auth.login({ email, password });
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Fetch Student Dashboard
```typescript
const loadDashboard = async (studentId) => {
  const data = await api.student.getDashboard(studentId);
  setDashboardData(data);
};
```

### Submit a Test
```typescript
const submitTest = async (testId) => {
  const result = await api.test.submit(testId);
  console.log('Test submitted:', result);
};
```

## 4. Features Included
- **Auto-Token Injection**: Once logged in, the token is automatically added to all subsequent requests.
- **Authentication Handling**: Automatically clears token on 401 (Unauthorized) errors.
- **Full Coverage**: Includes all services: Auth, Student, Parent, Teacher, School, Test, Curriculum, and Assignments.
- **TypeScript Support**: Includes base types for Roles, Difficulty, etc.
