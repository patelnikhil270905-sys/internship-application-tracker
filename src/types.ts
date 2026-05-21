export interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  status: "Applied" | "Under Review" | "Interview Scheduled" | "Accepted" | "Rejected";
  location: string;
  salary: string;
  appliedDate: string;
  deadlineDate: string;
  linkedinUrl?: string;
  jobUrl?: string;
  notes?: string;
  timeline: {
    status: string;
    date: string;
    notes: string;
    completed: boolean;
  }[];
  personalDetails?: {
    fullName: string;
    phone: string;
    email: string;
    linkedinUrl: string;
    resumeFileName: string;
  };
  projects?: {
    title: string;
    description: string;
    githubLink?: string;
    portfolioLink?: string;
    skills: string[];
    fileName?: string;
  }[];
  finalAnswers?: {
    desiredRole: string;
    availability: string;
    whyJoin: string;
    additionalNotes?: string;
  };
}

export interface User {
  email: string;
  name: string;
  university: string;
  profilePhoto: string;
  skills: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  links?: { title: string; url: string }[];
}

export interface ResumeReport {
  score: number;
  feedbackSummary: string;
  bulletStrengths: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  improvements: string[];
}
