// FIX: Import 'useState' from React to fix 'Cannot find name' errors.
import React, { useState } from 'react';
import { StatCard } from './FeedbackCard';
import type { JobDescription, FileUploadStatus } from '../types';

const ChevronDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


const FileStatusList: React.FC<{ fileStatuses: FileUploadStatus[] }> = ({ fileStatuses }) => {
    if (fileStatuses.length === 0) return <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">No files chosen</p>;

    const statusMap = {
        pending: { icon: <ClockIcon />, text: "Pending", textColor: "text-slate-500 dark:text-slate-400" },
        processing: { icon: <SpinnerIcon />, text: "Processing...", textColor: "text-indigo-500 dark:text-indigo-400" },
        success: { icon: <CheckCircleIcon />, text: "Success", textColor: "text-emerald-600 dark:text-emerald-500" },
        error: { icon: <XCircleIcon />, text: "Error", textColor: "text-rose-600 dark:text-rose-500" },
    };

    return (
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2">
            {fileStatuses.map(({ id, file, status, error }) => {
                const { icon, text, textColor } = statusMap[status];
                return (
                    <div key={id} className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                        <span className="truncate text-slate-700 dark:text-slate-300" title={file.name}>{file.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2" title={error}>
                            <span className={`font-medium ${textColor}`}>{text}</span>
                            {icon}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


interface FileDropzoneProps {
  title: string;
  supportedFiles: string;
  isMultiple: boolean;
  onFilesChange: (files: File[]) => void;
  selectedFiles?: File[];
  fileStatuses?: FileUploadStatus[];
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ title, supportedFiles, isMultiple, onFilesChange, selectedFiles, fileStatuses }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValidationError(null);
        if (!event.target.files || event.target.files.length === 0) {
            onFilesChange([]); // Clear files if selection is cancelled
            return;
        }

        const files = Array.from(event.target.files);
        const validFiles: File[] = [];
        const invalidFileNames: string[] = [];

        const allowedMimeTypes = ['application/pdf', 'text/plain'];
        const allowedExtensions = ['.pdf', '.txt'];

        for (const file of files) {
            const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
            // Prioritize MIME type for accuracy, but fall back to extension for robustness
            if (allowedMimeTypes.includes(file.type) || (file.type === '' && allowedExtensions.includes(fileExtension))) {
                validFiles.push(file);
            } else {
                invalidFileNames.push(file.name);
            }
        }
        
        if (invalidFileNames.length > 0) {
            setValidationError(`Unsupported file(s) ignored: ${invalidFileNames.join(', ')}. Please use PDF or TXT.`);
        }
        
        onFilesChange(validFiles);

        // Reset the file input value so the onChange event fires even if the same file is selected again
        event.target.value = '';
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const getSelectedFilesText = () => {
        if (!selectedFiles || selectedFiles.length === 0) return "No file chosen";
        if (selectedFiles.length === 1) return selectedFiles[0].name;
        return `${selectedFiles.length} files chosen`;
    }

    return (
        <div className="mt-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
            <input
                type="file"
                ref={fileInputRef}
                multiple={isMultiple}
                onChange={handleFileChange}
                className="hidden"
                accept="application/pdf,text/plain,.pdf,.txt"
            />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">{title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{supportedFiles}</p>
            <button
                onClick={handleButtonClick}
                className="mt-4 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600">
                Choose File{isMultiple ? 's' : ''}
            </button>
            {validationError && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-2 text-left">{validationError}</p>
            )}
            {fileStatuses ? (
                <FileStatusList fileStatuses={fileStatuses} />
            ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{getSelectedFilesText()}</p>
            )}
        </div>
    );
};

interface DashboardProps {
  onAnalyze: (jdInput: { file?: File; text?: string }) => void;
  isLoading: boolean;
  jobDescriptions: JobDescription[];
  processingStatus: { current: number; total: number } | null;
  resumeFileStatuses: FileUploadStatus[];
  onResumeFilesChange: (files: File[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAnalyze, isLoading, jobDescriptions, processingStatus, resumeFileStatuses, onResumeFilesChange }) => {
  const [jdFile, setJdFile] = useState<File[]>([]);
  const [selectedJdId, setSelectedJdId] = useState('');

  const handleJdSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedJdId(e.target.value);
      if (e.target.value) {
          setJdFile([]); // Clear file input if a saved JD is selected
      }
  };

  const handleJdFileChange = (files: File[]) => {
      setJdFile(files);
      if (files.length > 0) {
          setSelectedJdId(''); // Clear dropdown if a file is selected
      }
  };

  const handleAnalysisClick = () => {
    const selectedJd = jobDescriptions.find(jd => jd.id === selectedJdId);
    if ((selectedJd || jdFile.length > 0) && resumeFileStatuses.length > 0) {
      const jdInput = selectedJd ? { text: selectedJd.description } : { file: jdFile[0] };
      onAnalyze(jdInput);
    }
  };

  const isButtonDisabled = isLoading || (jdFile.length === 0 && !selectedJdId) || resumeFileStatuses.length === 0;

  const buttonText = () => {
    if (isLoading && processingStatus && processingStatus.total > 0) {
      return `Processing... (${processingStatus.current}/${processingStatus.total})`;
    }
    if (isLoading) {
      return 'Processing...';
    }
    return 'Batch Upload & Analyze';
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* FIX: The 'value' prop for StatCard expects a string. Converted the number 'jobDescriptions.length' to a string. */}
        <StatCard title="Active jobs" value={jobDescriptions.length.toString()} change={`${jobDescriptions.length} saved`} />
        <StatCard title="Avg Processing" value="2.3s" change="-15% faster than before" changeType="decrease" />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Job Description Panel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upload Job Description</h3>
            <div className="mt-4">
                <label htmlFor="saved-jd" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select a Saved Job Description</label>
                <div className="relative mt-1">
                    <select 
                      id="saved-jd"
                      value={selectedJdId}
                      onChange={handleJdSelectChange}
                      className="appearance-none block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a saved JD</option>
                        {jobDescriptions.map(jd => (
                            <option key={jd.id} value={jd.id}>{jd.title}</option>
                        ))}
                    </select>
                    <ChevronDownIcon />
                </div>
            </div>
            <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-sm">OR</span>
                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            </div>
             <FileDropzone title="Upload a new JD file" supportedFiles="Supports PDF, TXT files up to 10MB" isMultiple={false} onFilesChange={handleJdFileChange} selectedFiles={jdFile} />
        </div>

        {/* Upload Resumes Panel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upload Resumes</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Upload up to 50 resumes for a batch analysis against the selected job description.</p>
            <FileDropzone title="Upload multiple resumes for batch processing" supportedFiles="Supports PDF, TXT files up to 50MB total" isMultiple={true} onFilesChange={onResumeFilesChange} fileStatuses={resumeFileStatuses} />
        </div>
      </div>
       <div className="mt-6 flex justify-center sm:justify-end">
            <button 
                onClick={handleAnalysisClick}
                disabled={isButtonDisabled}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-semibold rounded-lg shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
                aria-label={isLoading ? 'Processing analysis' : 'Start batch upload and analysis'}
            >
                {buttonText()}
            </button>
        </div>
    </>
  );
};