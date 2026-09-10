import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Calculator,
  ChevronRight,
  Award,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { GpaCalculatorModal } from './GpaCalculatorModal';
import { GradeLetter } from '../../types';

export const AcademicTrackerPage: React.FC = () => {
  const { student } = useAuth();
  const {
    semesters,
    currentGpa,
    cgpa,
    totalCompletedCredits,
    addSemester,
    addCourse,
    deleteCourse,
    deleteSemester,
    gradeScale
  } = useData();

  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

  // Add Semester Form State
  const [newSemName, setNewSemName] = useState('');
  const [newSemYear, setNewSemYear] = useState('2026/2027');

  // Add Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [creditUnits, setCreditUnits] = useState(3);
  const [grade, setGrade] = useState<GradeLetter>('A');

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemName.trim()) return;
    addSemester(newSemName, newSemYear);
    setNewSemName('');
    setShowAddSemesterModal(false);
  };

  const handleOpenAddCourse = (semId: string) => {
    setSelectedSemesterId(semId);
    setShowAddCourseModal(true);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemesterId || !courseCode || !courseTitle) return;

    addCourse(selectedSemesterId, {
      code: courseCode,
      title: courseTitle,
      creditUnits: Number(creditUnits),
      grade,
    });

    setCourseCode('');
    setCourseTitle('');
    setCreditUnits(3);
    setGrade('A');
    setShowAddCourseModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>Academic Performance Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your nursing semester courses, track GPA/CGPA calculations & target goals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Calculator}
            onClick={() => setShowCalculatorModal(true)}
          >
            GPA/CGPA Calculator
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddSemesterModal(true)}
          >
            Add Semester
          </Button>
        </div>
      </div>

      {/* Academic Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current GPA</p>
          <h2 className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
            {currentGpa.toFixed(2)}
          </h2>
          <p className="text-xs text-slate-500">Based on active semester courses</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative CGPA</p>
          <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {cgpa.toFixed(2)}
          </h2>
          <p className="text-xs text-slate-500">Scale: {gradeScale.scaleName}</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Credits</p>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalCompletedCredits} <span className="text-sm font-normal text-slate-500">/ 120</span>
          </h2>
          <p className="text-xs text-slate-500">BSN Degree Requirement</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target CGPA</p>
          <h2 className="text-3xl font-extrabold text-amber-500">
            {student?.targetCgpa.toFixed(2) || '4.50'}
          </h2>
          <p className="text-xs text-slate-500">
            Deficit: {(student?.targetCgpa || 4.50) > cgpa ? ((student?.targetCgpa || 4.50) - cgpa).toFixed(2) : 'Target Reached! 🎉'}
          </p>
        </Card>
      </div>

      {/* Semesters & Courses View */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Semesters Overview ({semesters.length})
          </h2>
        </div>

        {semesters.map((sem) => (
          <Card key={sem.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{sem.name}</span>
                    {sem.isCompleted ? (
                      <Badge variant="success" size="sm">Completed</Badge>
                    ) : (
                      <Badge variant="brand" size="sm">Active Semester</Badge>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Academic Year: {sem.academicYear} • Total Credits: {sem.totalCredits}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Semester GPA
                  </span>
                  <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                    {sem.gpa.toFixed(2)}
                  </span>
                </div>

                <Button variant="outline" size="sm" icon={Plus} onClick={() => handleOpenAddCourse(sem.id)}>
                  Add Course
                </Button>

                <button
                  onClick={() => deleteSemester(sem.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete Semester"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Courses Table */}
            {sem.courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
                      <th className="pb-3 pr-4">Code</th>
                      <th className="pb-3 px-4">Course Title</th>
                      <th className="pb-3 px-4 text-center">Credit Units</th>
                      <th className="pb-3 px-4 text-center">Grade</th>
                      <th className="pb-3 px-4 text-center">Grade Points</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {sem.courses.map((crs) => (
                      <tr key={crs.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-brand-600 dark:text-brand-400">
                          {crs.code}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 dark:text-slate-100">
                          {crs.title}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {crs.creditUnits}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                              crs.grade === 'A'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : crs.grade === 'B'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {crs.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                          {(crs.creditUnits * crs.gradePoints).toFixed(1)} pts
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            onClick={() => deleteCourse(crs.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No courses added to this semester yet. Click &quot;Add Course&quot; above.
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Modal: Add Semester */}
      <Modal isOpen={showAddSemesterModal} onClose={() => setShowAddSemesterModal(false)} title="Add New Semester">
        <form onSubmit={handleCreateSemester} className="space-y-4 pt-2">
          <Input
            label="Semester Name"
            placeholder="e.g. 300 Level - Second Semester"
            value={newSemName}
            onChange={(e) => setNewSemName(e.target.value)}
            required
          />
          <Input
            label="Academic Year"
            placeholder="2026/2027"
            value={newSemYear}
            onChange={(e) => setNewSemYear(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAddSemesterModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Semester
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Course */}
      <Modal isOpen={showAddCourseModal} onClose={() => setShowAddCourseModal(false)} title="Add Course to Semester">
        <form onSubmit={handleCreateCourse} className="space-y-4 pt-2">
          <Input
            label="Course Code"
            placeholder="e.g. NUR 301"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
          />
          <Input
            label="Course Title"
            placeholder="e.g. Pharmacology & Therapeutics"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            required
          />
          <Input
            label="Credit Units"
            type="number"
            min="1"
            max="12"
            value={creditUnits}
            onChange={(e) => setCreditUnits(Number(e.target.value))}
            required
          />
          <Select
            label="Grade Obtained / Expected"
            value={grade}
            onChange={(e) => setGrade(e.target.value as GradeLetter)}
            options={[
              { value: 'A', label: 'A (5.0 Points - Excellent)' },
              { value: 'B', label: 'B (4.0 Points - Very Good)' },
              { value: 'C', label: 'C (3.0 Points - Credit)' },
              { value: 'D', label: 'D (2.0 Points - Pass)' },
              { value: 'F', label: 'F (0.0 Points - Fail)' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAddCourseModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* Standalone GPA/CGPA Interactive Calculator Modal */}
      <GpaCalculatorModal
        isOpen={showCalculatorModal}
        onClose={() => setShowCalculatorModal(false)}
      />
    </div>
  );
};
