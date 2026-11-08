import { useNavigate, useParams } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { Tabs } from '../components/common/Controls';
import { CommentsList } from '../components/community/CommentsList';
import { Button } from '../components/common/Button';
import { useStudio } from '../store/StudioContext';
import { LetterAvatar } from '../components/common/Avatar';
import { avatarColourFor } from '../data/comments';
import { timeAgo } from '../lib/format';
import { SESSION_START } from '../data/analytics';

const MENTIONS = [
  { handle: '@AncientEchoes', text: 'Huge shout-out to @ThePastExplained for the brilliant Mongol documentary – go and subscribe if you haven\'t already.', where: 'Comment on “The Entire History of the Roman Republic”', at: SESSION_START - 5 * 3600_000 },
  { handle: '@historyteacher_jo', text: 'I showed my Year 9 class @ThePastExplained\'s Black Death video today and they were silent for 20 minutes. Highest praise.', where: 'Community post', at: SESSION_START - 2 * 86_400_000 },
  { handle: '@MedievalMinds', text: 'Collab idea: @ThePastExplained x Medieval Minds on the Knights Templar? 👀', where: 'Comment on “Life as a Medieval Peasant”', at: SESSION_START - 6 * 86_400_000 },
  { handle: '@ByzantiumFan', text: 'Can\'t wait for @ThePastExplained to finally cover Byzantium next week!!', where: 'Comment on “Why the Byzantine Empire Lasted 1,000 Years”', at: SESSION_START - 9 * 86_400_000 },
];

export function CommunityPage() {
  const { tab = 'comments' } = useParams();
  const navigate = useNavigate();
  const { openSettings, comments } = useStudio();
  const held = comments.filter((c) => c.status === 'held').length;
  return (
    <div>
      <PageHeader
        title="Channel community"
        actions={
          <Button variant="tonal" icon={<Settings2 size={18} />} onClick={() => openSettings('community')}>
            Community settings
          </Button>
        }
      />
      <Tabs
        className="mt-2 px-5"
        tabs={[
          { value: 'comments', label: 'Comments', badge: held },
          { value: 'mentions', label: 'Mentions' },
        ]}
        value={tab === 'mentions' ? 'mentions' : 'comments'}
        onChange={(t) => navigate(`/community/${t}`)}
      />
      {tab === 'mentions' ? (
        <div>
          <p className="px-6 pt-4 text-[13px] text-[#606060]">Comments and posts where people have mentioned your channel's handle.</p>
          {MENTIONS.map((m) => (
            <div key={m.handle} className="flex gap-4 border-b border-black/[0.1] px-6 py-4">
              <LetterAvatar name={m.handle} color={avatarColourFor(m.handle)} size={40} />
              <div>
                <div className="text-[13px]"><span className="font-medium">{m.handle}</span> <span className="text-[#606060]">• {timeAgo(m.at)}</span></div>
                <p className="mt-1 text-sm">{m.text}</p>
                <div className="mt-1 text-xs text-[#606060]">{m.where}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CommentsList />
      )}
    </div>
  );
}
