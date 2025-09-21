export type Verdict = 'High' | 'Medium' | 'Low';

export interface AtsAnalysis {
  score: number; // A score from 0-100
  issues: string[]; // List of issues found
}

export interface LearningResource {
  skill: string;
  links: string[];
}

export interface AnalysisResult {
  relevanceScore: number;
  hardMatchPercentage: number;
  softMatchPercentage: number;
  verdict: Verdict;
  matchingSkills: string[];
  missingSkills: string[];
  missingCertifications: string[];
  missingProjects: string[];
  suggestedImprovements: string[];
  summary: string;
  atsAnalysis: AtsAnalysis;
  suggestedLearningResources: LearningResource[];
}

// New types for dashboard
export interface Job {
  id: string;
  title: string;
  department: string;
}

export interface JobDescription {
  id: string;
  title: string;
  description: string;
}

export interface CandidateAnalysis {
  id: string;
  candidateName: string;
  job: Job;
  relevanceScore: number;
  verdict: Verdict;
  keySkillsMatch: number; // percentage
  missingSkills: string[];
  missingCertifications: string[];
  missingProjects: string[];
  // Added to provide full details to the modal view
  fullAnalysis: AnalysisResult;
}

// New types for file upload status
export type FileProcessingStatus = 'pending' | 'processing' | 'success' | 'error';

export interface FileUploadStatus {
  id: string;
  file: File;
  status: FileProcessingStatus;
  error?: string;
}
