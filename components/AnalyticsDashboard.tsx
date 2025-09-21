import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import type { StoredAnalysis } from '../App';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface AnalyticsDashboardProps {
  results: StoredAnalysis[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analytics Dashboard</h3>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          No analysis data available. Please analyze some resumes on the dashboard first.
        </p>
      </div>
    );
  }

  // Data for Verdict Distribution Pie Chart
  const verdictCounts = results.reduce((acc, result) => {
    acc[result.verdict] = (acc[result.verdict] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Verdict Distribution',
        data: [verdictCounts['High'] || 0, verdictCounts['Medium'] || 0, verdictCounts['Low'] || 0],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // emerald-500
          'rgba(245, 158, 11, 0.7)', // amber-500
          'rgba(244, 63, 94, 0.7)',   // rose-500
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(244, 63, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for Most Common Missing Skills Bar Chart
  const missingSkillsCount = results
    .flatMap(result => result.missingSkills)
    .reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedMissingSkills = Object.entries(missingSkillsCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10

  const barData = {
    labels: sortedMissingSkills.map(([skill]) => skill),
    datasets: [
      {
        label: 'Frequency',
        data: sortedMissingSkills.map(([, count]) => count),
        backgroundColor: 'rgba(79, 70, 229, 0.7)', // indigo-600
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const isDarkMode = document.documentElement.classList.contains('dark');
  const textColor = isDarkMode ? '#cbd5e1' : '#475569'; // slate-400 or slate-600
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; // slate-700 or slate-200

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      }
    }
  };


  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Verdict Distribution</h3>
        <div className="max-w-sm mx-auto">
          <Pie data={pieData} options={{ plugins: { legend: chartOptions.plugins.legend } }} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Most Commonly Missing Skills</h3>
        <div className="h-96">
            <Bar data={barData} options={{ ...chartOptions, indexAxis: 'y', maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};