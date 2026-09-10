import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Code, Video, Bot, Database, ExternalLink } from 'lucide-react';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'zegocloud' | 'gemini' | 'firebase';
  featureTitle: string;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  featureTitle,
}) => {
  const serviceDetails = {
    zegocloud: {
      icon: Video,
      color: 'text-purple-500 bg-purple-500/10 border-purple-200 dark:border-purple-900',
      title: 'ZEGOCLOUD Real-Time Video/Audio Integration Placeholder',
      filePath: 'src/services/zegocloud/roomService.ts & callService.ts',
      description: `The UI for "${featureTitle}" is fully responsive and ready. Real-time WebRTC audio/video call streams and live study rooms will connect when you add your ZEGOCLOUD credentials.`,
      todoList: [
        'Obtain App ID & Server Secret from ZEGOCLOUD Admin Console',
        'Install ZEGOCLOUD UIKit package: npm install @zegocloud/zego-uikit-prebuilt',
        'Implement token generation in src/services/zegocloud/roomService.ts',
        'Mount live WebRTC video room container DOM node'
      ]
    },
    gemini: {
      icon: Bot,
      color: 'text-teal-500 bg-teal-500/10 border-teal-200 dark:border-teal-900',
      title: 'Gemini AI Tutor API Integration Placeholder',
      filePath: 'src/services/gemini/geminiService.ts',
      description: `The AI Nursing Tutor UI is operating in high-fidelity demo mode. Connect Gemini AI to generate live NCLEX explanations and interactive quiz questions.`,
      todoList: [
        'Obtain GEMINI_API_KEY from Google AI Studio',
        'Install SDK: npm install @google/genai',
        'Connect askNursingTutor() in src/services/gemini/geminiService.ts',
        'Configure system instructions for nursing & NCLEX tutoring'
      ]
    },
    firebase: {
      icon: Database,
      color: 'text-amber-500 bg-amber-500/10 border-amber-200 dark:border-amber-900',
      title: 'Firebase Backend Integration Placeholder',
      filePath: 'src/services/firebase/firestoreService.ts & authService.ts',
      description: `Data is currently stored safely in browser LocalStorage. Replace mock handlers with Firebase to sync across devices in real-time.`,
      todoList: [
        'Initialize Firebase Project & copy firebaseConfig credentials',
        'Install SDK: npm install firebase',
        'Connect Auth in src/services/firebase/authService.ts',
        'Connect Firestore collections in src/services/firebase/firestoreService.ts'
      ]
    }
  };

  const current = serviceDetails[serviceType];
  const Icon = current.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${current.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {current.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {current.filePath}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {current.description}
        </p>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Code className="w-4 h-4 text-brand-500" />
            <span>Developer Integration Steps</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {current.todoList.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};
