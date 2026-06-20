export type BaizeAge = '6-9' | '10-12' | '13-15' | '16-18';

export type BaizeMood =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'sleeping'
  | 'surprised'
  | 'talking'
  | 'sad'
  | 'reading'
  | 'writing'
  | 'waving';

export interface CompanionState {
  age: BaizeAge;
  level: number;
  exp: number;
  maxExp: number;
  unlockedForms: string[];
  currentForm: string;
  name: string;
  petName: string;
  mood: BaizeMood;
}

export interface LearningContext {
  id: string;
  title: string;
  category: 'game' | 'video' | 'book' | 'idle';
  appName: string;
  subType: string; // e.g. "英语", "物理", "历史", "红石电路"
  scantext: string; // Fake simulated OCR text scan
  screenStateDesc: string; // Screen description
  mockScreenshotUrl: string; // Background visual placeholder
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  example: string;
  exampleTranslation: string;
  sourceGame: string;
  mastered: boolean;
  createdAt: string;
  levelRequired: number;
}

export interface ScreenInsight {
  id: string;
  title: string;
  content: string;
  subject: '生物' | '数学' | '物理' | '化学' | '历史' | '其他(附加)';
  pointsReward: number;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subject: string;
  expReward: number;
}

export interface ParentConfig {
  dailyLimitMs: number; // Daily gaming screen time limit in ms
  usedTimeMs: number; // Time used today in ms
  parentPin: string; // Simple lock
  isLockEnabled: boolean; // Is parental lock active
  announcementText: string; // Remote note from parent
  announcementActive: boolean;
}

export interface StudyStat {
  date: string;
  vocabulary: number;
  scannedInsights: number;
  focusTime: number; // in minutes
}
