import React, { useState } from 'react';
import { FileText, Plus, Search, Trash2, Edit2, Bookmark, Tag } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { NursingNote } from '../../types';

export const NotesPage: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, subjects } = useData();

  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('Anatomy & Physiology');
  const [noteContent, setNoteContent] = useState('');

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesSubject = selectedSubjectId === 'all' || n.subjectId === selectedSubjectId;

    return matchesSearch && matchesSubject;
  });

  const handleOpenAdd = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteCategory('Anatomy & Physiology');
    setNoteContent('');
    setShowModal(true);
  };

  const handleOpenEdit = (note: NursingNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteCategory(note.category);
    setNoteContent(note.content);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;

    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: noteTitle,
        category: noteCategory,
        content: noteContent,
      });
    } else {
      addNote({
        title: noteTitle,
        subjectId: subjects.find((s) => s.title === noteCategory)?.id || 'subj_ana_phs',
        category: noteCategory,
        content: noteContent,
        isBookmarked: false,
        tags: ['NursingNotes', 'NCLEX-Prep'],
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-500" />
            <span>Personal Nursing Notes</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize study mnemonics, medication guides, and clinical procedure summaries.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Create New Note
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search notes by title, keyword, or tag..." />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={[
              { value: 'all', label: 'All Subject Categories' },
              ...subjects.map((s) => ({ value: s.id, label: s.title })),
            ]}
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {note.category}
                </span>

                <button
                  onClick={() => updateNote(note.id, { isBookmarked: !note.isBookmarked })}
                  className={`p-1.5 rounded-lg ${
                    note.isBookmarked ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {note.title}
              </h3>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 max-h-40 overflow-hidden relative">
                <div className="whitespace-pre-line line-clamp-5">{note.content}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Updated: {note.updatedAt}</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(note)}
                  className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create / Edit Note Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNoteId ? 'Edit Nursing Note' : 'Create Nursing Note'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            label="Note Title"
            placeholder="e.g. Cranial Nerves & Mnemonics"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
          />

          <Select
            label="Subject Category"
            value={noteCategory}
            onChange={(e) => setNoteCategory(e.target.value)}
            options={subjects.map((s) => ({ value: s.title, label: s.title }))}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Note Content (Markdown supported)
            </label>
            <textarea
              rows={8}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write clinical notes, drug classifications, or procedure steps here..."
              className="w-full p-4 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
