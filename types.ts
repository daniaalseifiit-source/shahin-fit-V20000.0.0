
export enum UserRole {
  TRAINER = 'TRAINER',
  STUDENT = 'STUDENT'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED_WAITING_PAYMENT = 'APPROVED_WAITING_PAYMENT',
  PAYMENT_UPLOADED = 'PAYMENT_UPLOADED',
  PAYMENT_APPROVED = 'PAYMENT_APPROVED',
  COMPLETING_INFO = 'COMPLETING_INFO',
  WAITING_FOR_PLAN = 'WAITING_FOR_PLAN',
  PLAN_READY = 'PLAN_READY'
}

export enum TrainingType {
  WARM_UP = 'گرم کردن',
  MAIN = 'تمرین اصلی',
  AEROBIC = 'هوازی',
  COOL_DOWN = 'سرد کردن',
  REHAB = 'اصلاحی'
}

export enum ProgramDuration {
  WEEKS_4 = '۴ هفته',
  WEEKS_12 = '۱۲ هفته'
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  videoUrl?: string;
}

export interface TrainingRow {
  id: string;
  movement: string; 
  system: string;
  reps: string;
  sets: string;
  rhythm: string;
  rest: string;
  videoUrl?: string;
}

export interface DietMeal {
  id: string;
  time: string;
  foods: string;
}

export interface TrainingDay {
  id: string;
  dayNumber: number;
  sections: {
    type: TrainingType;
    rows: TrainingRow[];
  }[];
  dietMeals?: DietMeal[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ProgressLog {
  date: string;
  weight: number;
  waist?: number;
  arm?: number;
}

export interface SupplementaryInfo {
  age?: number;
  height?: number;
  weight?: number;
  bloodType?: string;
  supplementHistory?: string;
  wakeUpTime?: string;
  sleepTime?: string;
  trainingTimePref?: string;
  injuryHistory?: string;
  measurements?: {
    arm?: number;
    chest?: number;
    hip?: number;
    thigh?: number;
    waist?: number;
  };
  goal?: string;
  photos?: string[];
}

export interface PlanRequest {
  id: string;
  studentId: string;
  studentName: string;
  city: string;
  level: string;
  sessionsPerWeek: number;
  planType: string;
  duration: ProgramDuration;
  status: RequestStatus;
  price?: number;
  cardNumber?: string;
  accountName?: string;
  receiptUrl?: string;
  createdAt: string;
  messages: Message[];
  progress: ProgressLog[];
  supplementaryInfo?: SupplementaryInfo;
}

export interface Program {
  id: string;
  requestId: string;
  studentId: string;
  trainerId: string;
  startDate: string;
  endDate: string;
  trainingDays: TrainingDay[];
  createdAt: string;
}
