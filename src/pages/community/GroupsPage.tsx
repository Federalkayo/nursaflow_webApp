import React, { useState } from 'react';
import { Users, Video, Plus, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { IntegrationModal } from '../../components/feedback/IntegrationModal';

export const GroupsPage: React.FC = () => {
  const {
    groups,
    toggleJoinGroup,
    isCommunityLoading,
    communityError,
    clearCommunityError,
  } = useData();
  const [showZegoModal, setShowZegoModal] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  const handleToggleJoin = async (groupId: string) => {
    if (joiningGroupId === groupId) return;
    setJoiningGroupId(groupId);
    try {
      await toggleJoinGroup(groupId);
    } catch (err) {
      console.error('[GroupsPage] Failed to toggle join group:', err);
    } finally {
      setJoiningGroupId(null);
    }
  };

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

      {/* Community Error Banner */}
      {communityError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{communityError}</span>
          </div>
          <button onClick={clearCommunityError} className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading Skeleton or Group Grid */}
      {isCommunityLoading && groups.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="w-36 h-4 rounded bg-slate-800" />
                  <div className="w-24 h-3 rounded bg-slate-800/60" />
                </div>
              </div>
              <div className="w-full h-12 rounded bg-slate-800/40" />
            </Card>
          ))}
        </div>
      ) : (
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
                  icon={joiningGroupId === group.id ? Loader2 : group.isMember ? Check : Plus}
                  disabled={joiningGroupId === group.id}
                  onClick={() => handleToggleJoin(group.id)}
                >
                  {joiningGroupId === group.id ? 'Updating...' : group.isMember ? 'Joined Group' : 'Join Group'}
                </Button>

                <Button variant="ghost" size="sm" icon={Video} onClick={() => setShowZegoModal(true)}>
                  Join Live Room
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <IntegrationModal
        isOpen={showZegoModal}
        onClose={() => setShowZegoModal(false)}
        serviceType="zegocloud"
        featureTitle="Live Group Video / Audio Room"
      />
    </div>
  );
};
