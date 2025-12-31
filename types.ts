export type Role = 'worker' | 'employer' | 'admin';
export type Language = 'en' | 'hi';

export enum Skill {
  Painter = 'Painter',
  Mason = 'Mason',
  Helper = 'Helper',
  Plumber = 'Plumber',
  Electrician = 'Electrician',
  Carpenter = 'Carpenter',
  TileWorker = 'Tile Worker',
  Welder = 'Welder',
  Cleaner = 'Cleaner',
  LoadingWorker = 'Loading Worker',
  Other = 'Other'
}

export interface User {
  id: string;
  phone: string;
  role: Role;
  name: string;
  createdAt: number;
  password?: string; // For worker/admin login
  isBlocked?: boolean;
  bio?: string; // New: Description/About Me
}

export interface WorkerProfile extends User {
  role: 'worker';
  photoUrl: string;
  idProofUrl?: string; // New: Aadhaar/ID photo
  skills: string[];
  area: string;
  // Simulated Coordinates for Map Demo
  lat?: number; 
  lng?: number;
  dailyWage: number;
  experienceYears: number;
  isAvailableToday: boolean;
  lastAvailableUpdate: number; // timestamp
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  ratingSum: number;
  ratingCount: number;
}

export interface EmployerProfile extends User {
  role: 'employer';
  area: string;
  ratingSum: number;
  ratingCount: number;
}

export interface AdminProfile extends User {
  role: 'admin';
}

export interface JobPost {
  id: string;
  employerId: string;
  employerName: string;
  type: string;
  area: string;
  workersNeeded: number;
  payment: number;
  dateNeeded: string;
  description?: string;
  createdAt: number;
  status: 'active' | 'closed';
}

export interface Review {
  id: string;
  fromId: string;
  toId: string; // Can be worker or employer
  rating: number;
  comment?: string;
  createdAt: number;
}

export type AnyUser = WorkerProfile | EmployerProfile | AdminProfile;