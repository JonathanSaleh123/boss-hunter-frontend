import React from 'react';
import { StatInputProps } from './types';

const StatInput: React.FC<StatInputProps> = ({ label, name, value, onChange, colorClass }) => (
  <div className={`bg-slate-800/50 p-2 rounded border-l-2 ${colorClass} flex justify-between items-center`}>
    <label className="text-slate-300 text-xs">{label}: </label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      className="bg-slate-900 text-white font-bold w-16 text-right p-1 rounded"
    />
  </div>
);

export default StatInput; 