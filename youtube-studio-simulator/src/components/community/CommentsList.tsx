import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Heart, MoreVertical, Pin, Search, ThumbsDown, ThumbsUp, Trash2, Flag, UserX, ShieldCheck, X, MessageSquareReply } from 'lucide-react';
import { useStudio } from '../../store/StudioContext';
import type { CommentStatus, StudioComment } from '../../data/types';
import { LetterAvatar, ChannelAvatar } from '../common/Avatar';
import { VideoThumb } from '../common/VideoThumb';
import { IconButton, Button } from '../common/Button';
import { Checkbox, Chip } from '../common/Controls';
import { MenuDivider, MenuItem, Popover, useMenu } from '../common/Popover';
import { formatCompact, formatSubs, timeAgo } from '../../lib/format';
import { EmptyArt, EmptyState } from '../common/Card';
import { Tooltip } from '../common/Tooltip';
import { videoLifetime } from '../../lib/videoStats';

function ReplyBox({ onCancel, onSubmit, placeholder = 'Add a reply…' }: { onCancel: () => void; onSubmit: (t: string) => void; placeholder?: string }) {
  const { profile } = useStudio();
  const [text, setText] = useState('');
  return (
    <div className="mt-3 flex gap-3">
      <ChannelAvatar size={24} styleIndex={profile.avatarStyle} />
      <div className="flex-1">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder={placeholder}
          className="w-full resize-none border-b border-black/[0.3] pb-1 text-sm outline-none focus:border-[#0f0f0f]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && text.trim()) onSubmit(text.trim());
          }}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="text" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="blue" size="sm" disabled={!text.trim()} onClick={() => onSubmit(text.trim())}>Reply</Button>
        </div>
      </div>
    </div>
  );
}

function CommentRow({ c, showVideo, selectable, selected, onSelect }: { c: StudioComment; showVideo: boolean; selectable: boolean; selected: boolean; onSelect: (v: boolean) => void }) {
  const { updateComment, replyToComment, allVideos, profile, toast } = useStudio();
  const navigate = useNavigate();
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const menu = useMenu();
  const video = allVideos.find((v) => v.id === c.videoId);
  const likes = c.likes + (c.liked ? 1 : 0);
  const creatorReplied = c.replies.some((r) => r.isCreator);

  const setStatus = (status: CommentStatus, msg: string) => {
    const prev = c.status;
    updateComment(c.id, { status });
    toast(msg, 'Undo', () => updateComment(c.id, { status: prev }));
  };

  return (
    <div className={`group flex gap-4 border-b border-black/[0.1] px-6 py-4 ${selected ? 'bg-[#f2f2f2]' : 'hover:bg-[#fafafa]'}`}>
      {selectable && (
        <div className="pt-2">
          <Checkbox checked={selected} onChange={onSelect} />
        </div>
      )}
      <LetterAvatar name={c.handle} color={c.avatarColor} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
          <span className={`font-medium ${c.isSubscriber ? 'text-[#0f0f0f]' : 'text-[#0f0f0f]'}`}>{c.handle}</span>
          <span className="text-[#606060]">• {timeAgo(c.at)}</span>
          {c.isSubscriber && <span className="rounded bg-black/[0.05] px-1.5 text-[11px] text-[#606060]">Subscriber</span>}
          {c.pinned && (
            <span className="flex items-center gap-1 text-xs text-[#606060]">
              <Pin size={12} /> Pinned by {profile.handle}
            </span>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-[#0f0f0f]">{c.text}</p>

        {c.status === 'published' ? (
          <div className="mt-1 flex items-center gap-1 text-xs text-[#606060]">
            <button onClick={() => setReplying(true)} className="mr-2 h-8 rounded-full px-3 text-[13px] font-medium text-[#0f0f0f] hover:bg-black/[0.05]">
              Reply
            </button>
            {c.replies.length > 0 && (
              <button onClick={() => setShowReplies(!showReplies)} className="mr-2 flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-[#065fd4] hover:bg-[#def1ff]">
                {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
            <Tooltip content="Like">
              <IconButton label="Like" size={32} onClick={() => updateComment(c.id, { liked: !c.liked, disliked: false })}>
                <ThumbsUp size={16} fill={c.liked ? '#0f0f0f' : 'none'} />
              </IconButton>
            </Tooltip>
            <span className="tabular min-w-[20px]">{likes ? formatCompact(likes) : ''}</span>
            <Tooltip content="Dislike">
              <IconButton label="Dislike" size={32} onClick={() => updateComment(c.id, { disliked: !c.disliked, liked: false })}>
                <ThumbsDown size={16} fill={c.disliked ? '#0f0f0f' : 'none'} />
              </IconButton>
            </Tooltip>
            <Tooltip content={c.hearted ? 'Remove heart' : 'Heart'}>
              <IconButton label="Heart" size={32} onClick={() => updateComment(c.id, { hearted: !c.hearted })}>
                {c.hearted ? (
                  <span className="relative">
                    <ChannelAvatar size={18} styleIndex={profile.avatarStyle} />
                    <Heart size={11} className="absolute -bottom-1 -right-1.5 text-[#ff0000]" fill="#ff0000" />
                  </span>
                ) : (
                  <Heart size={16} />
                )}
              </IconButton>
            </Tooltip>
            <IconButton label="More actions" size={32} ref={menu.ref} onClick={menu.toggle}>
              <MoreVertical size={16} />
            </IconButton>
            <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} width={260}>
              <MenuItem icon={<Pin size={18} />} onClick={() => (menu.close(), updateComment(c.id, { pinned: !c.pinned }), toast(c.pinned ? 'Comment unpinned' : 'Comment pinned'))}>
                {c.pinned ? 'Unpin' : 'Pin'}
              </MenuItem>
              <MenuItem icon={<Trash2 size={18} />} onClick={() => (menu.close(), setStatus('removed', 'Comment removed'))}>
                Remove
              </MenuItem>
              <MenuItem icon={<Flag size={18} />} onClick={() => (menu.close(), setStatus('spam', 'Comment reported and moved to Likely spam'))}>
                Report
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<UserX size={18} />} onClick={() => (menu.close(), setStatus('removed', `${c.handle} hidden from your channel`))}>
                Hide user from channel
              </MenuItem>
              <MenuItem icon={<ShieldCheck size={18} />} onClick={() => (menu.close(), toast(`${c.handle} added as a standard moderator`))}>
                Add as moderator
              </MenuItem>
            </Popover>
            {creatorReplied && <span className="ml-2 flex items-center gap-1 text-[11px] text-[#606060]"><MessageSquareReply size={13} /> You replied</span>}
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" variant="tonal" icon={<Check size={16} />} onClick={() => setStatus('published', c.status === 'spam' ? 'Marked as not spam and published' : 'Comment approved')}>
              {c.status === 'spam' ? 'Not spam' : 'Approve'}
            </Button>
            <Button size="sm" variant="tonal" icon={<Trash2 size={16} />} onClick={() => setStatus('removed', 'Comment removed')}>
              Remove
            </Button>
            {c.status === 'held' && (
              <Button size="sm" variant="tonal" icon={<Flag size={16} />} onClick={() => setStatus('spam', 'Reported as spam')}>
                Report
              </Button>
            )}
          </div>
        )}

        {replying && (
          <ReplyBox
            onCancel={() => setReplying(false)}
            onSubmit={(t) => {
              replyToComment(c.id, t);
              setReplying(false);
              setShowReplies(true);
              toast('Reply posted');
            }}
          />
        )}

        {showReplies && c.replies.length > 0 && (
          <div className="mt-2 flex flex-col gap-3 pl-1">
            {c.replies.map((r) => (
              <div key={r.id} className="flex gap-3">
                {r.isCreator ? <ChannelAvatar size={24} styleIndex={profile.avatarStyle} /> : <LetterAvatar name={r.handle} color={r.avatarColor} size={24} />}
                <div>
                  <div className="text-xs">
                    <span className={`font-medium ${r.isCreator ? 'rounded-full bg-[#606060] px-1.5 py-px text-white' : ''}`}>{r.handle}</span>
                    <span className="text-[#606060]"> • {timeAgo(r.at)}</span>
                  </div>
                  <p className="mt-0.5 text-sm">{r.text}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-[#606060]">
                    <ThumbsUp size={13} /> {r.likes || ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showVideo && video && (
        <button onClick={() => navigate(`/video/${video.id}/comments`)} className="hidden w-[220px] shrink-0 gap-3 text-left lg:flex">
          <VideoThumb video={video} width={96} showDuration={false} rounded="rounded-md" />
          <span className="line-clamp-3 text-xs leading-[17px] text-[#606060] hover:text-[#0f0f0f]">{video.title}</span>
        </button>
      )}
    </div>
  );
}

type SubTab = 'published' | 'held' | 'spam';

export function CommentsList({ videoId }: { videoId?: string }) {
  const { comments, allVideos, updateComment, toast } = useStudio();
  const [tab, setTab] = useState<SubTab>('published');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'top'>('newest');
  const [questions, setQuestions] = useState(false);
  const [unanswered, setUnanswered] = useState(false);
  const [subsOnly, setSubsOnly] = useState(false);
  const [videoFilter, setVideoFilter] = useState<string>(videoId ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const videoMenu = useMenu();
  const sortMenu = useMenu();

  const scoped = useMemo(() => comments.filter((c) => (videoFilter ? c.videoId === videoFilter : true)), [comments, videoFilter]);
  const counts = { published: scoped.filter((c) => c.status === 'published').length, held: scoped.filter((c) => c.status === 'held').length, spam: scoped.filter((c) => c.status === 'spam').length };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .filter((c) => c.status === tab)
      .filter((c) => !q || c.text.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q))
      .filter((c) => !questions || c.isQuestion || c.text.includes('?'))
      .filter((c) => !unanswered || !c.replies.some((r) => r.isCreator))
      .filter((c) => !subsOnly || c.isSubscriber)
      .sort((a, b) => (a.pinned && !b.pinned ? -1 : b.pinned && !a.pinned ? 1 : sort === 'newest' ? b.at - a.at : b.likes - a.likes));
  }, [scoped, tab, query, questions, unanswered, subsOnly, sort]);

  const totalComments = useMemo(() => allVideos.reduce((a, v) => a + videoLifetime(v).comments, 0), [allVideos]);
  const commentedVideos = useMemo(() => Array.from(new Set(comments.map((c) => c.videoId))).map((id) => allVideos.find((v) => v.id === id)).filter(Boolean), [comments, allVideos]);

  const bulk = (status: CommentStatus, label: string) => {
    selected.forEach((id) => updateComment(id, { status }));
    toast(`${selected.length} comment${selected.length > 1 ? 's' : ''} ${label}`);
    setSelected([]);
  };

  return (
    <div>
      <div className="flex gap-2 px-6 pb-2 pt-4">
        {([
          ['published', 'Published'],
          ['held', 'Held for review'],
          ['spam', 'Likely spam'],
        ] as [SubTab, string][]).map(([v, l]) => (
          <Chip key={v} active={tab === v} onClick={() => (setTab(v), setSelected([]))}>
            {l}
            {v !== 'published' && counts[v] > 0 && <span className={`ml-1 rounded-full px-1.5 text-[11px] ${tab === v ? 'bg-white/20' : 'bg-[#cc0000] text-white'}`}>{counts[v]}</span>}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.1] px-6 py-3">
        <div className="flex h-9 w-[280px] items-center rounded-full border border-black/[0.15] px-3 focus-within:border-[#065fd4]">
          <Search size={18} className="text-[#606060]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search comments" className="ml-2 min-w-0 flex-1 bg-transparent text-sm outline-none" />
          {query && <button aria-label="Clear" onClick={() => setQuery('')}><X size={16} /></button>}
        </div>
        <button ref={sortMenu.ref} onClick={sortMenu.toggle} className="flex h-8 items-center gap-1 rounded-lg bg-black/[0.05] px-3 text-sm font-medium hover:bg-black/[0.1]">
          Sort by: {sort === 'newest' ? 'Newest' : 'Top'} <ChevronDown size={16} />
        </button>
        <Popover anchor={sortMenu.ref} open={sortMenu.open} onClose={sortMenu.close} width={180}>
          <MenuItem selected={sort === 'newest'} onClick={() => (setSort('newest'), sortMenu.close())}>Newest first</MenuItem>
          <MenuItem selected={sort === 'top'} onClick={() => (setSort('top'), sortMenu.close())}>Top comments</MenuItem>
        </Popover>
        <Chip active={questions} onClick={() => setQuestions(!questions)}>Contains questions</Chip>
        {tab === 'published' && <Chip active={unanswered} onClick={() => setUnanswered(!unanswered)}>I haven't responded</Chip>}
        <Chip active={subsOnly} onClick={() => setSubsOnly(!subsOnly)}>Subscribers</Chip>
        {!videoId && (
          <>
            <button ref={videoMenu.ref} onClick={videoMenu.toggle} className={`flex h-8 max-w-[260px] items-center gap-1 rounded-lg px-3 text-sm font-medium ${videoFilter ? 'bg-[#0f0f0f] text-white' : 'bg-black/[0.05] hover:bg-black/[0.1]'}`}>
              <span className="truncate">{videoFilter ? allVideos.find((v) => v.id === videoFilter)?.title : 'All videos'}</span>
              <ChevronDown size={16} className="shrink-0" />
            </button>
            <Popover anchor={videoMenu.ref} open={videoMenu.open} onClose={videoMenu.close} width={360} className="max-h-[400px] overflow-y-auto">
              <MenuItem selected={!videoFilter} onClick={() => (setVideoFilter(''), videoMenu.close())}>All videos</MenuItem>
              {commentedVideos.map((v) => v && (
                <MenuItem key={v.id} selected={videoFilter === v.id} onClick={() => (setVideoFilter(v.id), videoMenu.close())}>
                  <span className="line-clamp-1">{v.title}</span>
                </MenuItem>
              ))}
            </Popover>
          </>
        )}
      </div>

      {tab !== 'published' && list.length > 0 && (
        <div className="flex h-12 items-center gap-3 border-b border-black/[0.1] bg-[#f9f9f9] px-6">
          <Checkbox checked={selected.length === list.length} indeterminate={selected.length > 0 && selected.length < list.length} onChange={(c) => setSelected(c ? list.map((x) => x.id) : [])} label={selected.length ? `${selected.length} selected` : 'Select all'} />
          {selected.length > 0 && (
            <>
              <Button size="sm" variant="tonal" icon={<Check size={16} />} onClick={() => bulk('published', 'approved')}>Approve</Button>
              <Button size="sm" variant="tonal" icon={<Trash2 size={16} />} onClick={() => bulk('removed', 'removed')}>Remove</Button>
            </>
          )}
          <span className="ml-auto text-xs text-[#606060]">{tab === 'held' ? 'Comments held because of your channel’s blocked words, links or moderation settings.' : 'YouTube thinks these comments may be spam. Review them before approving.'}</span>
        </div>
      )}

      {list.map((c) => (
        <CommentRow key={c.id} c={c} showVideo={!videoId} selectable={tab !== 'published'} selected={selected.includes(c.id)} onSelect={(v) => setSelected((s) => (v ? [...s, c.id] : s.filter((x) => x !== c.id)))} />
      ))}
      {list.length === 0 && (
        <EmptyState
          art={<EmptyArt kind="box" />}
          title={tab === 'published' ? 'No comments match your filters' : tab === 'held' ? 'No comments held for review' : 'No likely spam'}
          body={tab === 'published' ? 'Try removing filters or searching for something else.' : 'You\'re all caught up. Nice work keeping your community tidy.'}
        />
      )}
      {list.length > 0 && <div className="px-6 py-4 text-xs text-[#909090]">Showing {list.length} of {counts[tab]} comments{tab === 'published' && !videoId ? ` · showing the most recent comments of ${formatSubs(totalComments)} across your channel` : ''}</div>}
    </div>
  );
}
