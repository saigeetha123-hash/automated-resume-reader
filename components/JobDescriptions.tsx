import React, { useState } from 'react';
import type { JobDescription } from '../types';

interface JobDescriptionsViewProps {
    jobDescriptions: JobDescription[];
    setJobDescriptions: React.Dispatch<React.SetStateAction<JobDescription[]>>;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export const JobDescriptionsView: React.FC<JobDescriptionsViewProps> = ({ jobDescriptions, setJobDescriptions }) => {
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const handleAddJobDescription = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newDescription.trim()) {
            return; // Basic validation
        }

        const newJob: JobDescription = {
            id: crypto.randomUUID(),
            title: newTitle.trim(),
            description: newDescription.trim(),
        };

        setJobDescriptions(prev => [newJob, ...prev]);
        setNewTitle('');
        setNewDescription('');
    };
    
    const handleDeleteJobDescription = (idToDelete: string) => {
        setJobDescriptions(prev => prev.filter(jd => jd.id !== idToDelete));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form for adding a new JD */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Job Description</h3>
                <form onSubmit={handleAddJobDescription} className="space-y-4">
                    <div>
                        <label htmlFor="jd-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Job Title
                        </label>
                        <input
                            id="jd-title"
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g., Senior Frontend Developer"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="jd-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Job Description
                        </label>
                        <textarea
                            id="jd-description"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            rows={8}
                            placeholder="Paste the full job description here..."
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={!newTitle.trim() || !newDescription.trim()}
                            className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Job Description
                        </button>
                    </div>
                </form>
            </div>

            {/* List of saved JDs */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Saved Job Descriptions</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {jobDescriptions.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-500 dark:text-slate-400">No job descriptions added yet.</p>
                        </div>
                    ) : (
                        jobDescriptions.map(jd => (
                            <div key={jd.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-start group">
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{jd.title}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                                        {jd.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteJobDescription(jd.id)}
                                    className="ml-4 p-1.5 rounded-full text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-600 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label={`Delete job description for ${jd.title}`}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};