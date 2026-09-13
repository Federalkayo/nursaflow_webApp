import React, { useState } from 'react';
import { Calendar, Plus, CheckSquare, Square, Clock, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

import { useAuth } from '../../context/AuthContext';

export const StudyPlansPage: React.FC = () => {
  const { studyPlans, toggleTaskCompletion, addStudyPlan, subjects } = useData();
  const { addStudyTime, recordStudyActivity } = useAuth();

  const handleToggleTask = (planId: string, taskId: string, currentlyCompleted: boolean) => {
    toggleTaskCompletion(planId, taskId);
    if (!currentlyCompleted) {
      addStudyTime(10, false); // 10 minutes study time credit
      recordStudyActivity();
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 'subj_pharm');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle) return;

    addStudyPlan(planTitle, selectedSubjectId, [
      { day: 'Monday', taskTitle: 'Read NCLEX Summary Notes', taskType: 'Notes' },
      { day: 'Tuesday', taskTitle: 'Solve 20 Practice Questions', taskType: 'Questions' },
      { day: 'Wednesday', taskTitle: 'Flip 30 Subject Flashcards', taskType: 'Flashcards' },
      { day: 'Thursday', taskTitle: 'Practice Clinical Calculators', taskType: 'Clinical Practice' },
      { day: 'Friday', taskTitle: 'Take 10-Minute Assessment Quiz', taskType: 'Review' },
    ]);

    setPlanTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span>Interactive Study Plans</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Structure your weekly nursing revision schedules & track completion tasks.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Create Study Plan
        </Button>
      </div>

      <div className="space-y-6">
        {studyPlans.map((plan) => {
          const completedCount = plan.tasks.filter((t) => t.isCompleted).length;
          const percentage = Math.round((completedCount / plan.tasks.length) * 100);

          return (
            <Card key={plan.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Schedule: {plan.startDate} to {plan.targetEndDate}
                  </p>
                </div>

                <Badge variant={percentage === 100 ? 'success' : 'brand'}>
                  {percentage}% Completed
                </Badge>
              </div>

              <ProgressBar value={percentage} color="brand" size="md" />

              {/* Tasks List */}
              <div className="space-y-3">
                {plan.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(plan.id, task.id, task.isCompleted)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      task.isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400 line-through'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {task.isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 block">
                          {task.day}
                        </span>
                        <p className="text-sm font-semibold">{task.taskTitle}</p>
                      </div>
                    </div>

                    <Badge variant="neutral">{task.taskType}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Weekly Study Plan">
        <form onSubmit={handleCreatePlan} className="space-y-4 pt-2">
          <Input
            label="Plan Title"
            placeholder="e.g. Pharmacology Revision Sprint"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            required
          />

          <Select
            label="Nursing Subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={subjects.map((s) => ({ value: s.id, label: s.title }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
