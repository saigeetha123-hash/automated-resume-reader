
import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from './components/ResultsDashboard';
import { Dashboard } from './components/FileUpload';
import { ResumeAnalysisResults } from './components/ScoreGauge';
import { AnalysisDetailModal } from './data/templates';
import { Login } from './components/Login';
import { JobDescriptionsView } from './components/JobDescriptions';
import { SettingsView } from './components/Settings';
import { ToastProvider } from './components/Toast'; // Import the ToastProvider
import type { CandidateAnalysis, AnalysisResult, JobDescription, FileUploadStatus } from './types';
import { analyzeResume, rewriteResume, getInputAsText } from './services/geminiService';

export interface StoredAnalysis extends CandidateAnalysis {
  resumeText: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<StoredAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('Dashboard');
  const [selectedAnalysis, setSelectedAnalysis] = useState<StoredAnalysis | null>(null);
  const [jdText, setJdText] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<{ current: number; total: number } | null>(null);
  const [resumeFileStatuses, setResumeFileStatuses] = useState<FileUploadStatus[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize job descriptions from local storage, or as an empty array if none are found.
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(() => {
    try {
      const savedJds = window.localStorage.getItem('jobDescriptions');
      return savedJds ? JSON.parse(savedJds) : [];
    } catch (error) {
      console.error("Failed to load job descriptions from local storage", error);
      return [];
    }
  });

  // State and effect for dark mode, moved to App for global scope.
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.theme === 'dark') return true;
        if (localStorage.theme === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Default for non-browser environments
  });

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Persist job descriptions to local storage whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem('jobDescriptions', JSON.stringify(jobDescriptions));
    // FIX: Added an opening curly brace to the catch block to fix a syntax error.
    } catch (error) {
      console.error("Failed to save job descriptions to local storage", error);
    }
  }, [jobDescriptions]);
  
  const handleResumeFilesChange = (files: File[]) => {
    const newFileStatuses = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
    }));
    setResumeFileStatuses(newFileStatuses);
    setAnalysisResults([]); // Clear previous results when new files are selected
  };


  const handleAnalyze = async (jdInput: { file?: File; text?: string }) => {
    const pendingFiles = resumeFileStatuses.filter(fs => fs.status === 'pending' || fs.status === 'error');
    if (pendingFiles.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);

    try {
        const jdContent = jdInput.text ?? await getInputAsText(jdInput.file!, 'Job Description');
        setJdText(jdContent);
        setActiveView('ResumeAnalysis');

        setResumeFileStatuses(prev => prev.map(fs => ({ ...fs, status: 'processing' })));

        const resumeFiles = resumeFileStatuses.map(fs => fs.file);
        
        // Single, efficient API call for batch processing
        const batchResults = await analyzeResume(jdContent, resumeFiles);

        const newAnalysisResults: StoredAnalysis[] = [];
        let finalFileStatuses = [...resumeFileStatuses];

        // Pre-fetch all resume texts for storage to avoid multiple reads
        const resumeTextMap = new Map<string, string>();
        await Promise.all(resumeFiles.map(async file => {
            const text = await getInputAsText(file, 'Resume');
            resumeTextMap.set(file.name, text);
        }));

        batchResults.forEach(({ analysis, fileName }) => {
            const statusIndex = finalFileStatuses.findIndex(fs => fs.file.name === fileName);
            if (statusIndex !== -1) {
                const candidateName = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
                
                newAnalysisResults.push({
                    id: crypto.randomUUID(),
                    candidateName: candidateName,
                    job: { id: '1', title: 'Senior Software Engineer', department: 'Engineering' },
                    relevanceScore: analysis.relevanceScore,
                    verdict: analysis.verdict,
                    keySkillsMatch: analysis.matchingSkills.length,
                    missingSkills: analysis.missingSkills,
                    missingCertifications: analysis.missingCertifications || [],
                    missingProjects: analysis.missingProjects || [],
                    fullAnalysis: analysis,
                    resumeText: resumeTextMap.get(fileName) || '',
                });

                finalFileStatuses[statusIndex] = { ...finalFileStatuses[statusIndex], status: 'success' };
            }
        });

        setAnalysisResults(newAnalysisResults.sort((a, b) => b.relevanceScore - a.relevanceScore));
        setResumeFileStatuses(finalFileStatuses);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during analysis.";
      console.error(err);
      setError(errorMessage);
      // If the batch fails, mark all processing files as errored
      setResumeFileStatuses(prev => prev.map(fs => 
        fs.status === 'processing' ? { ...fs, status: 'error', error: errorMessage } : fs
      ));
    } finally {
      setIsLoading(false);
      setProcessingStatus(null);
    }
  };


  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    // Optional: Reset state on logout
    setAnalysisResults([]);
    setResumeFileStatuses([]);
    // Do not clear job descriptions on logout to persist them
    setActiveView('Dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
            {activeView === 'Dashboard' && 
              <Dashboard 
                  onAnalyze={handleAnalyze} 
                  isLoading={isLoading} 
                  jobDescriptions={jobDescriptions} 
                  processingStatus={processingStatus}
                  resumeFileStatuses={resumeFileStatuses}
                  onResumeFilesChange={handleResumeFilesChange}
              />
            }
            {activeView === 'ResumeAnalysis' && (
              <ResumeAnalysisResults 
                  results={analysisResults} 
                  isLoading={isLoading} 
                  error={error}
                  onSelectResult={setSelectedAnalysis} 
                />
            )}
            {activeView === 'JobDescriptions' && <JobDescriptionsView jobDescriptions={jobDescriptions} setJobDescriptions={setJobDescriptions} />}
            {activeView === 'Settings' && <SettingsView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
          </main>
        </div>
        {selectedAnalysis && (
          <AnalysisDetailModal 
            analysis={selectedAnalysis}
            jobDescriptionText={jdText}
            onClose={() => setSelectedAnalysis(null)}
            rewriteResume={rewriteResume}
          />
        )}
      </div>
    </ToastProvider>
  );
};

export default App;