import React, { useState, useMemo } from 'react';
import type { CandidateAnalysis } from '../types';
import type { StoredAnalysis } from '../App';

const MagnifyingGlassIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterDropdown: React.FC<{ options: {value: string, label: string}[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ options, value, onChange }) => (
    <select 
        value={value}
        onChange={onChange}
        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-10 px-3"
    >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
);

const getVerdictChipClass = (verdict: string) => {
    switch (verdict) {
        case 'High': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
        case 'Medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
        case 'Low': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300';
        default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
}

const TableRowSkeleton: React.FC = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div></td>
    </tr>
)

const CardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 space-y-3 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
             <div className="flex justify-between items-center text-sm">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
        </div>
        <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full -mb-1"></div>
        </div>
    </div>
);

const CandidateCard: React.FC<{ result: StoredAnalysis; onSelectResult: (result: StoredAnalysis) => void }> = ({ result, onSelectResult }) => {
    const missingItems = [
        ...(result.missingSkills || []),
        ...(result.missingCertifications || []),
        ...(result.missingProjects || [])
    ];
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 space-y-3 text-sm">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-base text-slate-900 dark:text-white pr-2">{result.candidateName}</h4>
                <span className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${getVerdictChipClass(result.verdict)}`}>
                    {result.verdict}
                </span>
            </div>

            <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Relevance Score</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{result.relevanceScore}%</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Matched Skills</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{result.keySkillsMatch}</span>
                </div>
            </div>

            {missingItems.length > 0 && (
                <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Areas for Improvement</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {missingItems.join(', ')}
                    </p>
                </div>
            )}
            
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => onSelectResult(result)} 
                    className="w-full text-center font-medium text-indigo-600 dark:text-indigo-500 hover:text-indigo-800 dark:hover:text-indigo-400 py-1 transition-colors"
                >
                    View Full Analysis
                </button>
            </div>
        </div>
    );
};


interface ResumeAnalysisResultsProps {
    results: StoredAnalysis[];
    isLoading: boolean;
    error: string | null;
    onSelectResult: (result: StoredAnalysis) => void;
}

export const ResumeAnalysisResults: React.FC<ResumeAnalysisResultsProps> = ({ results, isLoading, error, onSelectResult }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVerdict, setFilterVerdict] = useState('All');
    const [sortBy, setSortBy] = useState('score-desc');
    
    const displayedResults = useMemo(() => {
        let filtered = [...results];

        // Search filter (on candidate name)
        if (searchTerm.trim()) {
            filtered = filtered.filter(r => 
                r.candidateName.toLowerCase().includes(searchTerm.toLowerCase().trim())
            );
        }
        
        // Verdict filter
        if (filterVerdict !== 'All') {
            filtered = filtered.filter(r => r.verdict === filterVerdict);
        }
        
        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'score-asc':
                    return a.relevanceScore - b.relevanceScore;
                case 'name-asc':
                    return a.candidateName.localeCompare(b.candidateName);
                case 'score-desc':
                default:
                    return b.relevanceScore - a.relevanceScore;
            }
        });
        
        return filtered;
    }, [results, searchTerm, filterVerdict, sortBy]);


    const renderContent = () => {
        if (isLoading && results.length === 0) {
            return (
                <>
                    <div className="hidden md:block">
                        <table className="w-full">
                           <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:text-slate-300 dark:bg-slate-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Candidate</th>
                                    <th scope="col" className="px-6 py-3">Job Role</th>
                                    <th scope="col" className="px-6 py-3">Relevance Score</th>
                                    <th scope="col" className="px-6 py-3">Verdict</th>
                                    <th scope="col" className="px-6 py-3">Matched Skills (#)</th>
                                    <th scope="col" className="px-6 py-3">Areas for Improvement</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <TableRowSkeleton />
                                <TableRowSkeleton />
                                <TableRowSkeleton />
                            </tbody>
                        </table>
                    </div>
                    <div className="md:hidden space-y-4">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </>
            );
        }
        if (error) {
            return <div className="text-center py-10 text-rose-500"><p>Error: {error}</p></div>
        }
        if (results.length > 0 && displayedResults.length === 0) {
            return <div className="text-center py-10 text-slate-500 dark:text-slate-400"><p>No results match the current filters.</p></div>
        }
        if (results.length === 0) {
             return <div className="text-center py-10 text-slate-500 dark:text-slate-400"><p>No results to display. Upload a JD and resumes to begin.</p></div>
        }

        return (
            <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:text-slate-300 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Candidate</th>
                                <th scope="col" className="px-6 py-3">Job Role</th>
                                <th scope="col" className="px-6 py-3">Relevance Score</th>
                                <th scope="col" className="px-6 py-3">Verdict</th>
                                <th scope="col" className="px-6 py-3">Matched Skills (#)</th>
                                <th scope="col" className="px-6 py-3">Areas for Improvement</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedResults.map((result, index) => {
                                const missingItems = [
                                    ...(result.missingSkills || []),
                                    ...(result.missingCertifications || []),
                                    ...(result.missingProjects || [])
                                ].join(', ');

                                return (
                                    <tr key={result.id} className={`border-b dark:border-slate-700 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/40'}`}>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{result.candidateName}</td>
                                        <td className="px-6 py-4">{result.job.title}</td>
                                        <td className="px-6 py-4 font-semibold">{result.relevanceScore}%</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVerdictChipClass(result.verdict)}`}>
                                                {result.verdict}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{result.keySkillsMatch}</td>
                                        <td className="px-6 py-4">{missingItems}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => onSelectResult(result)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                    {displayedResults.map(result => (
                        <CandidateCard key={result.id} result={result} onSelectResult={onSelectResult} />
                    ))}
                </div>
            </>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white whitespace-nowrap">Resume Analysis Results</h3>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="px-4 h-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 w-full md:w-auto">Export</button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative w-full md:w-auto flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full h-10 pl-10 pr-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <FilterDropdown 
                    value={filterVerdict}
                    onChange={(e) => setFilterVerdict(e.target.value)}
                    options={[
                        {value: "All", label: "All Verdicts"},
                        {value: "High", label: "High"},
                        {value: "Medium", label: "Medium"},
                        {value: "Low", label: "Low"},
                    ]} 
                />
                <FilterDropdown 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                        {value: "score-desc", label: "Score: High to Low"},
                        {value: "score-asc", label: "Score: Low to High"},
                        {value: "name-asc", label: "Candidate: A-Z"},
                    ]}
                />
            </div>

            {renderContent()}

            <div className="flex justify-between items-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                <p>Showing <strong>{displayedResults.length > 0 ? 1 : 0}</strong> to <strong>{displayedResults.length}</strong> of <strong>{displayedResults.length}</strong> results</p>
                <div>
                    <button className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md mr-2 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50" disabled>Next</button>
                </div>
            </div>
        </div>
    );
};