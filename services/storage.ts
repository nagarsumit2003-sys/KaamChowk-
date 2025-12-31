import { User, WorkerProfile, EmployerProfile, AdminProfile, JobPost, Review, AnyUser, Skill } from '../types';

const KEYS = {
  // UPGRADED TO V3 TO FORCE RE-SEEDING OF DATA
  USERS: 'kaamchowk_users_v3',
  JOBS: 'kaamchowk_jobs_v3',
  REVIEWS: 'kaamchowk_reviews_v3',
  CURRENT_USER: 'kaamchowk_current_user_id_v3'
};

// Robust Seed Data for "KaamChowk"
const seedData = () => {
  if (localStorage.getItem(KEYS.USERS)) return;

  const admin: AdminProfile = {
    id: 'admin1',
    name: 'Chowk Manager',
    phone: '9999999999',
    role: 'admin',
    createdAt: Date.now(),
    password: 'admin',
    bio: 'System Administrator'
  };

  // --- WORKERS (8 Profiles) ---
  const workers: WorkerProfile[] = [
    {
      id: 'w1', name: 'Raju "Painter" Singh', phone: '9800011101', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Painter', 'Cleaner'], area: 'Vaishali Nagar', dailyWage: 600, experienceYears: 8,
      isAvailableToday: true, lastAvailableUpdate: Date.now(), status: 'approved', ratingSum: 23, ratingCount: 5,
      bio: 'Expert in wall painting and texture design. 8 years experience.'
    },
    {
      id: 'w2', name: 'Mohammad Imran', phone: '9800011102', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Electrician'], area: 'Raja Park', dailyWage: 800, experienceYears: 12,
      isAvailableToday: true, lastAvailableUpdate: Date.now(), status: 'approved', ratingSum: 48, ratingCount: 10,
      bio: 'House wiring, fault repair, and AC installation specialist.'
    },
    {
      id: 'w3', name: 'Sunita Devi', phone: '9800011103', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://plus.unsplash.com/premium_photo-1664304598096-7d0d0f55bd44?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Helper', 'Cleaner'], area: 'Malviya Nagar', dailyWage: 450, experienceYears: 4,
      isAvailableToday: true, lastAvailableUpdate: Date.now(), status: 'approved', ratingSum: 19, ratingCount: 4,
      bio: 'Hardworking helper for construction and home cleaning.'
    },
    {
      id: 'w4', name: 'Vikram Mistry', phone: '9800011104', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Mason', 'Tile Worker'], area: 'Jhotwara', dailyWage: 900, experienceYears: 15,
      isAvailableToday: false, lastAvailableUpdate: Date.now() - 86400000, status: 'approved', ratingSum: 40, ratingCount: 8,
      bio: 'Master mason for plaster, brickwork and marble fitting.'
    },
    {
      id: 'w5', name: 'Chotu Kumar', phone: '9800011105', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Loading Worker', 'Helper'], area: 'Sodala', dailyWage: 500, experienceYears: 2,
      isAvailableToday: true, lastAvailableUpdate: Date.now(), status: 'approved', ratingSum: 12, ratingCount: 3,
      bio: 'Strong and energetic worker for loading/unloading.'
    },
    {
      id: 'w6', name: 'Harish Plumber', phone: '9800011106', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Plumber'], area: 'Mansarovar', dailyWage: 750, experienceYears: 9,
      isAvailableToday: true, lastAvailableUpdate: Date.now(), status: 'approved', ratingSum: 35, ratingCount: 7,
      bio: 'Pipe fitting, tank installation and leakage repair.'
    },
    {
      id: 'w7', name: 'Lakhan Carpenter', phone: '9800011107', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Carpenter'], area: 'Civil Lines', dailyWage: 850, experienceYears: 10,
      isAvailableToday: false, lastAvailableUpdate: Date.now() - 40000, status: 'approved', ratingSum: 50, ratingCount: 10,
      bio: 'Furniture making and repair works.'
    },
    {
      id: 'w8', name: 'Bablu Welder', phone: '9800011108', role: 'worker',
      createdAt: Date.now(), password: '123',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
      skills: ['Welder'], area: 'Sanganer', dailyWage: 1000, experienceYears: 12,
      isAvailableToday: true, lastAvailableUpdate: Date.now(), status: 'approved', ratingSum: 15, ratingCount: 3,
      bio: 'Iron gate and grill fabrication specialist.'
    }
  ];

  // --- EMPLOYERS (6 Profiles) ---
  const employers: EmployerProfile[] = [
    { id: 'e1', name: 'Gupta Ji Contractor', phone: '9900022201', role: 'employer', area: 'Vaishali Nagar', createdAt: Date.now(), ratingSum: 15, ratingCount: 3, bio: 'Civil contractor looking for reliable labour.' },
    { id: 'e2', name: 'Mrs. Sharma', phone: '9900022202', role: 'employer', area: 'Malviya Nagar', createdAt: Date.now(), ratingSum: 5, ratingCount: 1, bio: 'Home owner.' },
    { id: 'e3', name: 'Jaipur Constructions', phone: '9900022203', role: 'employer', area: 'Mansarovar', createdAt: Date.now(), ratingSum: 20, ratingCount: 5, bio: 'Building construction company.' },
    { id: 'e4', name: 'Rahul Sweet Shop', phone: '9900022204', role: 'employer', area: 'Raja Park', createdAt: Date.now(), ratingSum: 8, ratingCount: 2, bio: 'Shop owner.' },
    { id: 'e5', name: 'Amit Homeowner', phone: '9900022205', role: 'employer', area: 'Civil Lines', createdAt: Date.now(), ratingSum: 0, ratingCount: 0, bio: '' },
    { id: 'e6', name: 'City Hardware Store', phone: '9900022206', role: 'employer', area: 'Jhotwara', createdAt: Date.now(), ratingSum: 4, ratingCount: 1, bio: 'Hardware supplier.' }
  ];

  // --- JOBS (Varied) ---
  const jobs: JobPost[] = [
    {
      id: 'j1', employerId: 'e1', employerName: 'Gupta Ji Contractor', type: 'Mason', area: 'Vaishali Nagar',
      workersNeeded: 3, payment: 850, dateNeeded: 'Today', description: 'Urgent slab casting work. Lunch provided.',
      createdAt: Date.now() - 3600000, status: 'active'
    },
    {
      id: 'j2', employerId: 'e2', employerName: 'Mrs. Sharma', type: 'Cleaner', area: 'Malviya Nagar',
      workersNeeded: 1, payment: 400, dateNeeded: 'Tomorrow', description: 'Deep cleaning of 2BHK flat.',
      createdAt: Date.now() - 7200000, status: 'active'
    },
    {
      id: 'j3', employerId: 'e3', employerName: 'Jaipur Constructions', type: 'Helper', area: 'Mansarovar',
      workersNeeded: 10, payment: 500, dateNeeded: '2023-11-01', description: 'Construction site helpers needed for 1 week.',
      createdAt: Date.now() - 86400000, status: 'active'
    },
    {
      id: 'j4', employerId: 'e4', employerName: 'Rahul Sweet Shop', type: 'Painter', area: 'Raja Park',
      workersNeeded: 2, payment: 600, dateNeeded: 'This Weekend', description: 'Shop shutter painting.',
      createdAt: Date.now() - 10000000, status: 'active'
    },
    {
      id: 'j5', employerId: 'e6', employerName: 'City Hardware', type: 'Loading Worker', area: 'Jhotwara',
      workersNeeded: 4, payment: 550, dateNeeded: 'Today', description: 'Unloading ceramic tiles truck.',
      createdAt: Date.now() - 1800000, status: 'active'
    }
  ];

  localStorage.setItem(KEYS.USERS, JSON.stringify([admin, ...workers, ...employers]));
  localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify([]));
};

seedData();

export const StorageService = {
  getUsers: (): AnyUser[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  setUsers: (users: AnyUser[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  getJobs: (): JobPost[] => JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]'),
  setJobs: (jobs: JobPost[]) => localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs)),
  getReviews: (): Review[] => JSON.parse(localStorage.getItem(KEYS.REVIEWS) || '[]'),
  
  addReview: (review: Review) => {
    const reviews = StorageService.getReviews();
    reviews.push(review);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    const users = StorageService.getUsers();
    const userIndex = users.findIndex(u => u.id === review.toId);
    if (userIndex > -1) {
      const user = users[userIndex];
      if (user.role === 'worker' || user.role === 'employer') {
        user.ratingSum = (user.ratingSum || 0) + review.rating;
        user.ratingCount = (user.ratingCount || 0) + 1;
        users[userIndex] = user;
        StorageService.setUsers(users);
      }
    }
  },

  addUser: (user: AnyUser) => {
    const users = StorageService.getUsers();
    users.push(user);
    StorageService.setUsers(users);
  },

  updateUser: (updatedUser: AnyUser) => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index > -1) {
      users[index] = updatedUser;
      StorageService.setUsers(users);
    }
  },

  addJob: (job: JobPost) => {
    const jobs = StorageService.getJobs();
    jobs.push(job);
    StorageService.setJobs(jobs);
  },

  deleteJob: (jobId: string) => {
    const jobs = StorageService.getJobs();
    const newJobs = jobs.filter(j => j.id !== jobId);
    StorageService.setJobs(newJobs);
  },

  getCurrentUser: (): AnyUser | null => {
    const id = localStorage.getItem(KEYS.CURRENT_USER);
    if (!id) return null;
    const users = StorageService.getUsers();
    return users.find(u => u.id === id) || null;
  },

  setCurrentUser: (id: string | null) => {
    if (id) localStorage.setItem(KEYS.CURRENT_USER, id);
    else localStorage.removeItem(KEYS.CURRENT_USER);
  }
};