import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { GradeLetter } from '../../types';
import { useData } from '../../context/DataContext';
import { Plus, Trash2, Calculator, CheckCircle2 } from 'lucide-react';

interface GpaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CalcCourseItem {
  id: string;
  code: string;
  creditUnits: number;
  grade: GradeLetter;
}

export const GpaCalculatorModal: React.FC<GpaCalculatorModalProps> = ({ isOpen, onClose }) => {
  const { calculateGpaForCourses, gradeScale, cgpa, totalCompletedCredits } = useData();

  const [courses, setCourses] = useState<CalcCourseItem[]>([
    { id: '1', code: 'Anatomy', creditUnits: 4, grade: 'A' },
    { id: '2', code: 'Pharmacology', creditUnits: 3, grade: 'B' },
    { id: '3', code: 'Med-Surg', creditUnits: 5, grade: 'A' },
  ]);

  const handleAddRow = () => {
    setCourses([
      ...courses,
      { id: Date.now().toString(), code: `Course ${courses.length + 1}`, creditUnits: 3, grade: 'A' },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleUpdate = (id: string, field: keyof CalcCourseItem, val: any) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const calculatedSemesterGpa = calculateGpaForCourses(courses);

  // Projected CGPA Calculation
  let currentTotalPoints = cgpa * totalCompletedCredits;
  let newSemesterPoints = 0;
  let newSemesterCredits = 0;

  courses.forEach((c) => {
    const pts = gradeScale.gradePoints[c.grade] ?? 0;
    newSemesterPoints += c.creditUnits * pts;
    newSemesterCredits += c.creditUnits;
  });

  const projectedTotalCredits = totalCompletedCredits + newSemesterCredits;
  const projectedCgpa = projectedTotalCredits > 0
    ? (currentTotalPoints + newSemesterPoints) / projectedTotalCredits
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Functional GPA & CGPA Simulator" maxWidth="xl">
      <div className="space-y-6 pt-2">
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Simulated Semester GPA
            </span>
            <h2 className="text-3xl font-extrabold text-brand-600 dark:text-brand-300">
              {calculatedSemesterGpa.toFixed(2)} / 5.00
            </h2>
          </div>

          <div className="sm:border-l sm:border-slate-300 dark:sm:border-slate-700 sm:pl-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Projected Overall CGPA
            </span>
            <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-300">
              {projectedCgpa.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Dynamic Course Rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Course Calculation Rows
            </h4>
            <Button variant="ghost" size="sm" icon={Plus} onClick={handleAddRow}>
              Add Row
            </Button>
          </div>

          {courses.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={c.code}
                onChange={(e) => handleUpdate(c.id, 'code', e.target.value)}
                className="w-1/3 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Course Name"
              />

              <input
                type="number"
                min="1"
                max="10"
                value={c.creditUnits}
                onChange={(e) => handleUpdate(c.id, 'creditUnits', Number(e.target.value))}
                className="w-20 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-center font-bold"
              />

              <select
                value={c.grade}
                onChange={(e) => handleUpdate(c.id, 'grade', e.target.value as GradeLetter)}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="A">Grade A (5.0 pts)</option>
                <option value="B">Grade B (4.0 pts)</option>
                <option value="C">Grade C (3.0 pts)</option>
                <option value="D">Grade D (2.0 pts)</option>
                <option value="F">Grade F (0.0 pts)</option>
              </select>

              <button
                onClick={() => handleRemoveRow(c.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
