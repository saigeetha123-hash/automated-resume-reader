import React, { useState } from 'react';
import type { StoredAnalysis } from '../App';
import type { LearningResource } from '../types';

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    let colorClass = 'stroke-rose-500';
    if (score >= 75) colorClass = 'stroke-emerald-500';
    else if (score >= 50) colorClass = 'stroke-amber-500';

    return React.createElement('div', { className: "relative w-32 h-32" },
        React.createElement('svg', { className: "w-full h-full", viewBox: "0 0 100 100" },
            React.createElement('circle', { className: "text-slate-200 dark:text-slate-700", strokeWidth: "10", stroke: "currentColor", fill: "transparent", r: "45", cx: "50", cy: "50" }),
            React.createElement('circle', {
                className: `transition-all duration-1000 ease-in-out ${colorClass}`,
                strokeWidth: "10",
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                strokeLinecap: "round",
                stroke: "currentColor",
                fill: "transparent",
                r: "45",
                cx: "50",
                cy: "50",
                transform: "rotate(-90 50 50)"
            })
        ),
        React.createElement('span', { className: "absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-800 dark:text-slate-100" },
            `${score}%`
        )
    );
};

const SkillList: React.FC<{ title: string; skills: string[]; type: 'match' | 'miss' }> = ({ title, skills, type }) => {
    const bgColor = type === 'match' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-rose-100 dark:bg-rose-900';
    const textColor = type === 'match' ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200';
    
    return React.createElement('div', null,
        React.createElement('h4', { className: "font-semibold text-slate-800 dark:text-slate-100 mb-2" }, title),
        React.createElement('div', { className: "flex flex-wrap gap-2" },
            skills.length > 0 ? skills.map(skill =>
                React.createElement('span', { key: skill, className: `px-2.5 py-1 text-sm font-medium rounded-full ${bgColor} ${textColor}` }, skill)
            ) : React.createElement('p', { className: "text-sm text-slate-500 dark:text-slate-400" }, "None identified.")
        )
    );
};

const LearningResources: React.FC<{ resources: LearningResource[] }> = ({ resources }) => {
    if (!resources || resources.length === 0) {
        return null;
    }
    return React.createElement('div', null,
        React.createElement('h3', { className: "font-semibold text-lg text-slate-800 dark:text-slate-100 mb-2" }, "Suggested Learning Resources"),
        React.createElement('div', { className: "space-y-4" },
            resources.map(resource => 
                React.createElement('div', { key: resource.skill, className: "bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg" },
                    React.createElement('h4', { className: "font-semibold text-slate-700 dark:text-slate-200" }, `For "${resource.skill}":`),
                    React.createElement('ul', { className: "list-disc list-inside space-y-1 pl-2 mt-1" },
                        resource.links.map((link, index) => 
                            React.createElement('li', { key: index, className: "text-slate-600 dark:text-slate-300" },
                                React.createElement('a', { 
                                    href: link, 
                                    target: "_blank", 
                                    rel: "noopener noreferrer", 
                                    className: "text-indigo-600 dark:text-indigo-400 hover:underline" 
                                }, link)
                            )
                        )
                    )
                )
            )
        )
    );
};


interface AnalysisDetailModalProps {
    analysis: StoredAnalysis;
    jobDescriptionText: string;
    onClose: () => void;
    rewriteResume: (resumeText: string, jobDescriptionText: string) => Promise<string>;
}

export const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ analysis, jobDescriptionText, onClose, rewriteResume }) => {
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewrittenResume, setRewrittenResume] = useState<string | null>(null);
    const [rewriteError, setRewriteError] = useState<string | null>(null);

    const handleRewriteClick = async () => {
        setIsRewriting(true);
        setRewriteError(null);
        try {
            const result = await rewriteResume(analysis.resumeText, jobDescriptionText);
            setRewrittenResume(result);
        } catch (err) {
            setRewriteError(err instanceof Error ? err.message : "Failed to rewrite resume.");
        } finally {
            setIsRewriting(false);
        }
    };

    return React.createElement('div',
        {
            className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4",
            onClick: onClose,
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "analysis-detail-title"
        },
        React.createElement('div',
            {
                className: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col",
                onClick: (e: React.MouseEvent) => e.stopPropagation()
            },
            React.createElement('header', { className: "p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center" },
                React.createElement('h2', { id: "analysis-detail-title", className: "text-xl font-bold text-slate-900 dark:text-white" }, `Analysis for: ${analysis.candidateName}`),
                React.createElement('button', { onClick: onClose, className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200", "aria-label": "Close modal" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
                    )
                )
            ),
            React.createElement('div', { className: "p-8 overflow-y-auto space-y-8" },
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8 items-center" },
                    React.createElement('div', { className: "flex justify-center" },
                        React.createElement(ScoreGauge, { score: analysis.fullAnalysis.relevanceScore })
                    ),
                    React.createElement('div', { className: "md:col-span-2" },
                        React.createElement('h3', { className: "font-semibold text-lg text-slate-800 dark:text-slate-100 mb-2" }, "AI Summary"),
                        React.createElement('p', { className: "text-slate-600 dark:text-slate-300" }, analysis.fullAnalysis.summary)
                    )
                ),
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
                    React.createElement(SkillList, { title: "Matching Skills", skills: analysis.fullAnalysis.matchingSkills, type: "match" }),
                    React.createElement('div', { className: "space-y-4" },
                        React.createElement(SkillList, { title: "Missing Skills", skills: analysis.fullAnalysis.missingSkills, type: "miss" }),
                        analysis.fullAnalysis.missingCertifications?.length > 0 && React.createElement(SkillList, { title: "Missing Certifications", skills: analysis.fullAnalysis.missingCertifications, type: "miss" }),
                        analysis.fullAnalysis.missingProjects?.length > 0 && React.createElement(SkillList, { title: "Missing Projects", skills: analysis.fullAnalysis.missingProjects, type: "miss" })
                    )
                ),
                React.createElement('div', null,
                    React.createElement('h3', { className: "font-semibold text-lg text-slate-800 dark:text-slate-100 mb-2" }, "Suggested Improvements"),
                    React.createElement('ul', { className: "list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300" },
                        analysis.fullAnalysis.suggestedImprovements.map((item, i) => React.createElement('li', { key: i }, item))
                    )
                ),
                React.createElement(LearningResources, { resources: analysis.fullAnalysis.suggestedLearningResources }),
                React.createElement('div', null,
                    React.createElement('h3', { className: "font-semibold text-lg text-slate-800 dark:text-slate-100 mb-2" }, "ATS Compatibility Analysis"),
                    React.createElement('div', { className: "flex items-center gap-4 mb-2" },
                       React.createElement('p', { className: "font-bold text-slate-700 dark:text-slate-200 text-lg" }, 
                           React.createElement('span', null, 'Score: '),
                           React.createElement('span', { className: "text-xl" }, `${analysis.fullAnalysis.atsAnalysis.score}/100`)
                       )
                    ),
                     React.createElement('ul', { className: "list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300" },
                        analysis.fullAnalysis.atsAnalysis.issues.length > 0
                            ? analysis.fullAnalysis.atsAnalysis.issues.map((issue, i) => React.createElement('li', { key: i }, issue))
                            : React.createElement('li', null, "No major ATS compatibility issues found.")
                    )
                ),
                React.createElement('div', null,
                    React.createElement('h3', { className: "font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4" }, "AI Resume Rewriter"),
                    rewrittenResume ? (
                        React.createElement('div', null,
                            React.createElement('h4', { className: "font-semibold text-slate-700 dark:text-slate-200 mb-2" }, "Rewritten Resume:"),
                            React.createElement('pre', { className: "bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg text-sm whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200" }, rewrittenResume)
                        )
                    ) : (
                        React.createElement('div', { className: "text-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg" },
                            React.createElement('p', { className: "mb-4 text-slate-600 dark:text-slate-300" }, "Rewrite this resume to better match the job description."),
                            React.createElement('button',
                                {
                                    onClick: handleRewriteClick,
                                    disabled: isRewriting,
                                    className: "px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                },
                                isRewriting ? 'Rewriting...' : 'Rewrite with AI'
                            ),
                            rewriteError && React.createElement('p', { className: "text-rose-500 mt-4 text-sm" }, rewriteError)
                        )
                    )
                )
            )
        )
    );
};