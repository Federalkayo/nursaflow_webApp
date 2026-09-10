import React, { useState } from 'react';
import { Users, Video, Plus, Check, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { IntegrationModal } from '../../components/feedback/IntegrationModal';

export const GroupsPage: React.FC = () => {
  const { groups, toggleJoinGroup } = useData();
  const [showZegoModal, setShowZegoModal] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>Nursing Study Groups</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join focused peer study squads, share resources & launch live study rooms.
          </p>
        </div>

        <Button variant="primary" icon={Video} onClick={() => setShowZegoModal(true)}>
          Start Live Study Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={group.avatarUrl} name={group.name} size="lg" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant="brand">{group.category}</Badge>
                    <span>• {group.membersCount} Members</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {group.description}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Recent Activity:
                </span>
                <p>{group.recentActivity}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant={group.isMember ? 'outline' : 'primary'}
                size="sm"
                icon={group.isMember ? Check : Plus}
                onClick={() => toggleJoinGroup(group.id)}
              >
                {group.isMember ? 'Joined Group' : 'Join Group'}
              </Button>

              <Button variant="ghost" size="sm" icon={Video} onClick={() => setShowZegoModal(true)}>
                Join Live Room
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <IntegrationModal
        isOpen={showZegoModal}
        onClose={() => setShowZegoModal(false)}
        serviceType="zegocloud"
        featureTitle="Live Group Video / Audio Room"
      />
    </div>
  );
};
