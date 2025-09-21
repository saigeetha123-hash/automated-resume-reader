import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  subtitle?: string;
}

const getChangeColor = (type?: 'increase' | 'decrease') => {
  if (type === 'increase') return 'text-emerald-500';
  if (type === 'decrease') return 'text-red-500';
  return 'text-slate-500 dark:text-slate-400';
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, subtitle }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h4>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
      {change && (
        <p className={`text-sm mt-1 ${getChangeColor(changeType)}`}>{change}</p>
      )}
      {subtitle && (
        <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
};