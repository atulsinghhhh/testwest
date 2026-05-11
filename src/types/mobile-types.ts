/**
 * TESTWEST MOBILE SHARED TYPES
 * 
 * These types are inferred from the backend Mongoose models.
 * Use these to ensure type safety in your React Native app.
 */

export type Role = 'STUDENT' | 'PARENT' | 'TEACHER' | 'SCHOOL' | 'SOLO';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ' | 'MSQ' | 'Fill in the blanks' | 'Short answer';
export type AssignmentStatus = 'Assigned' | 'In progress' | 'Completed' | 'Overdue';
export type TestStatus = 'Pending' | 'In progress' | 'Completed' | 'Abandoned';

export interface User {
  _id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
  schoolId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  _id: string;
  user: string | User;
  grade: number;
  board: string;
  avatarUrl?: string;
  schoolId?: string;
  classId?: string;
  section?: string;
  rollNo?: string;
}

export interface ParentProfile {
  _id: string;
  user: string | User;
  children: string[] | StudentProfile[];
}

export interface TeacherProfile {
  _id: string;
  user: string | User;
  subjects: string[];
  classIds: string[];
  schoolId?: string;
  experienceYears: number;
}

export interface School {
  _id: string;
  name: string;
  board: string;
  city?: string;
  principal?: string;
}

export interface Class {
  _id: string;
  schoolId: string;
  grade: number;
  section: string;
  teacherId?: string;
}

export interface Question {
  _id: string;
  board: string;
  grade: number;
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
  type: QuestionType;
  difficulty: Difficulty;
  body: string;
  options: any[];
  answer: any;
  explanation?: string;
}

export interface TestQuestion extends Partial<Question> {
  originalQuestionId: string;
  givenAnswer?: any;
  isCorrect?: boolean;
  timeSpentSeconds: number;
  flagged: boolean;
}

export interface Test {
  _id: string;
  studentId: string;
  subject: string;
  chapter?: string;
  topic?: string;
  subtopic?: string;
  difficulty: Difficulty;
  status: TestStatus;
  questions: TestQuestion[];
  score?: number;
  accuracy?: number;
  durationSeconds?: number;
  submittedAt?: string;
  createdAt: string;
}

export interface Assignment {
  _id: string;
  teacherId: string;
  schoolId?: string;
  title: string;
  subject: string;
  chapter?: string;
  topic?: string;
  questionCount: number;
  difficulty: Difficulty;
  dueDate: string;
  target: {
    type: 'class' | 'students' | 'group';
    classIds?: string[];
    studentIds?: string[];
    groupId?: string;
    targetLabel?: string;
  };
  totalStudents: number;
  submitted: number;
  inProgress: number;
  notStarted: number;
  averageScore: number;
  status: AssignmentStatus;
  createdAt: string;
}
