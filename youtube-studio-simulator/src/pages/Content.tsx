import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BarChart2, Image as ImageIcon, ListChecks, MessageSquare, MoreVertical, Pencil, ThumbsUp, Trash2, Globe, Lock, Link2, Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { Tabs, TextAreaField, SelectField, Checkbox } from '../components/common/Controls';
import { VideosTable } from './content/VideosTable';
import { useStudio } from '../store/StudioContext';
import { Button, IconButton } from '../components/common/Button';
import { EmptyArt, EmptyState } from '../components/common/Card';
import { ChannelAvatar } from '../components/common/Avatar';
import { Thumbnail } from '../components/thumbnails/Thumbnail';
import { formatCompact, formatDate, formatInt, timeAgo } from '../lib/format';
import { MenuItem, Popover, useMenu } from '../components/common/Popover';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { VideoThumb } from '../components/common/VideoThumb';
import type { CommunityPost, Playlist } from '../data/types';

const TABS = [
  { value: 'videos', label: 'Videos' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'live', label: 'Live' },
  { value: 'posts', label: 'Posts' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'podcasts', label: 'Podcasts' },
  { value: 'promotions', label: 'Promotions' },
] as const;
type Tab = (typeof TABS)[number]['value'];

function PostComposer({ onClose }: { onClose: () => void }) {
  const { addPost, profile, toast } = useStudio();
  const [text, setText] = useState('');
  const [kind, setKind] = useState<'text' | 'poll' | 'image'>('text');
  const [options, setOptions] = useState(['', '']);
  const valid = text.trim() && (kind !== 'poll' || options.filter((o) => o.trim()).length >= 2);
  return (
    <div className="rounded-xl border border-black/[0.1] p-4">
      <div className="flex items-center gap-3">
        <ChannelAvatar size={40} styleIndex={profile.avatarStyle} />
        <div className="text-sm font-medium">{profile.name}</div>
        <span className="ml-1 rounded bg-black/[0.05] px-2 py-0.5 text-xs text-[#606060]">Visibility: Public</span>
      </div>
      <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1500} placeholder="Give a sneak peek of your next documentary…" className="mt-3 w-full resize-none text-[15px] outline-none placeholder:text-[#909090]" />
      {kind === 'poll' && (
        <div className="mb-3 flex flex-col gap-2">
          {options.map((o, i) => (
            <input key={i} value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} className="h-10 rounded-lg border border-black/[0.2] px-3 text-sm outline-none focus:border-[#065fd4]" />
          ))}
          {options.length < 5 && (
            <button className="self-start text-sm font-medium text-[#065fd4]" onClick={() => setOptions([...options, ''])}>
              + Add option
            </button>
          )}
        </div>
      )}
      {kind === 'image' && (
        <div className="mb-3 w-64 overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
          <Thumbnail spec={{ scene: 'ruins', palette: 'dusk', text: 'Coming|Soon', align: 'center' }} />
        </div>
      )}
      <div className="flex items-center gap-1 border-t border-black/[0.1] pt-3">
        <IconButton label="Text" active={kind === 'text'} onClick={() => setKind('text')}><MessageSquare size={20} /></IconButton>
        <IconButton label="Image" active={kind === 'image'} onClick={() => setKind('image')}><ImageIcon size={20} /></IconButton>
        <IconButton label="Poll" active={kind === 'poll'} onClick={() => setKind('poll')}><ListChecks size={20} /></IconButton>
        <div className="flex-1" />
        <span className="mr-2 text-xs text-[#606060]">{text.length}/1500</span>
        <Button variant="text" onClick={onClose}>Cancel</Button>
        <Button
          variant="blue"
          disabled={!valid}
          onClick={() => {
            const post: CommunityPost = {
              id: `post-${Date.now()}`,
              kind,
              text: text.trim(),
              at: Date.now(),
              likes: 0,
              comments: 0,
              visibility: 'public',
              options: kind === 'poll' ? options.filter((o) => o.trim()).map((label) => ({ label, votes: 0 })) : undefined,
              imageScene: kind === 'image' ? { scene: 'ruins', palette: 'dusk', text: 'Coming|Soon', align: 'center' } : undefined,
            };
            addPost(post);
            toast('Post published');
            onClose();
          }}
        >
          Post
        </Button>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: CommunityPost }) {
  const { profile, postVotes, votePost, deletePost, toast } = useStudio();
  const menu = useMenu();
  const voted = postVotes[post.id];
  const userAdded = post.id.startsWith('post-');
  const ageBoost = userAdded ? Math.min(1, (Date.now() - post.at) / 86_400_000) : 1;
  const totalVotes = (post.options ?? []).reduce((a, o, i) => a + Math.round(o.votes * ageBoost) + (voted === i ? 1 : 0), 0);
  return (
    <div className="rounded-xl border border-black/[0.1] p-4">
      <div className="flex items-center gap-3">
        <ChannelAvatar size={40} styleIndex={profile.avatarStyle} />
        <div className="flex-1">
          <div className="text-[13px] font-medium">
            {profile.name} <span className="font-normal text-[#606060]">· {timeAgo(post.at)}</span>
          </div>
          <div className="text-xs text-[#606060]">{post.kind === 'poll' ? 'Poll' : post.kind === 'quiz' ? 'Quiz' : post.kind === 'image' ? 'Image post' : 'Text post'} · Public</div>
        </div>
        <IconButton label="Options" ref={menu.ref} onClick={menu.toggle}><MoreVertical size={20} /></IconButton>
        <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} align="right" width={200}>
          <MenuItem icon={<Pencil size={18} />} onClick={() => (menu.close(), toast('Editing posts is limited to the first 24 hours'))}>Edit post</MenuItem>
          <MenuItem icon={<Trash2 size={18} />} onClick={() => (menu.close(), deletePost(post.id), toast('Post deleted'))}>Delete</MenuItem>
        </Popover>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-[22px]">{post.text}</p>
      {post.imageScene && (
        <div className="mt-3 max-w-md overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
          <Thumbnail spec={post.imageScene} />
        </div>
      )}
      {post.options && (
        <div className="mt-3 flex max-w-md flex-col gap-2">
          {post.options.map((o, i) => {
            const votes = Math.round(o.votes * ageBoost) + (voted === i ? 1 : 0);
            const pct = totalVotes ? (votes / totalVotes) * 100 : 0;
            const correct = post.kind === 'quiz' && o.label === 'Carthage';
            return (
              <button key={i} onClick={() => votePost(post.id, i)} className={`relative h-10 overflow-hidden rounded-lg border text-left text-sm ${voted === i ? 'border-[#065fd4]' : 'border-black/[0.15] hover:bg-black/[0.03]'}`}>
                <span className={`absolute inset-y-0 left-0 ${correct ? 'bg-[#e6f4ea]' : 'bg-[#e8f0fe]'} transition-[width]`} style={{ width: `${pct}%` }} />
                <span className="relative flex items-center px-3">
                  <span className="flex-1">{o.label}{correct && ' ✓'}</span>
                  <span className="text-[#606060]">{pct.toFixed(0)}%</span>
                </span>
              </button>
            );
          })}
          <div className="text-xs text-[#606060]">{formatInt(totalVotes)} votes</div>
        </div>
      )}
      <div className="mt-3 flex items-center gap-5 text-[13px] text-[#606060]">
        <span className="flex items-center gap-1.5"><ThumbsUp size={16} /> {formatCompact(Math.round(post.likes * ageBoost))}</span>
        <span className="flex items-center gap-1.5"><MessageSquare size={16} /> {formatCompact(Math.round(post.comments * ageBoost))}</span>
        <span className="flex items-center gap-1.5"><BarChart2 size={16} /> {formatCompact(Math.round(post.likes * 9.3 * ageBoost))} impressions</span>
      </div>
    </div>
  );
}

function PostsTab() {
  const { posts } = useStudio();
  const [params, setParams] = useSearchParams();
  const [composing, setComposing] = useState(params.get('compose') === '1');
  useEffect(() => {
    if (params.get('compose')) {
      setComposing(true);
      params.delete('compose');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);
  return (
    <div className="mx-auto max-w-[760px] px-6 py-6">
      {composing ? (
        <PostComposer onClose={() => setComposing(false)} />
      ) : (
        <button onClick={() => setComposing(true)} className="flex w-full items-center gap-3 rounded-xl border border-black/[0.1] p-4 text-left text-[15px] text-[#606060] hover:bg-[#f9f9f9]">
          <Plus size={20} /> Create a post – share an update, poll or image with your audience
        </button>
      )}
      <div className="mt-6 flex flex-col gap-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

function PlaylistDialog({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Playlist }) {
  const { upsertPlaylist, videos, toast } = useStudio();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [visibility, setVisibility] = useState<Playlist['visibility']>(initial?.visibility ?? 'public');
  const [ids, setIds] = useState<string[]>(initial?.videoIds ?? []);
  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setVisibility(initial?.visibility ?? 'public');
      setIds(initial?.videoIds ?? []);
    }
  }, [open, initial]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit playlist' : 'Create a new playlist'}
      width={640}
      footer={
        <>
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!title.trim()}
            onClick={() => {
              upsertPlaylist({ id: initial?.id ?? `pl-${Date.now()}`, title: title.trim(), description, visibility, videoIds: ids, updatedAt: Date.now() });
              toast(initial ? 'Playlist saved' : 'Playlist created');
              onClose();
            }}
          >
            {initial ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextAreaField label="Title" value={title} onChange={setTitle} maxLength={150} rows={1} required />
        <TextAreaField label="Description" value={description} onChange={setDescription} maxLength={5000} rows={3} />
        <SelectField label="Visibility" value={visibility} onChange={setVisibility} options={[{ value: 'public', label: 'Public' }, { value: 'unlisted', label: 'Unlisted' }, { value: 'private', label: 'Private' }]} />
        <div>
          <div className="mb-2 text-sm font-medium">Videos ({ids.length})</div>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-black/[0.1]">
            {videos.filter((v) => v.visibility !== 'draft').map((v) => (
              <div key={v.id} className="flex items-center gap-3 border-b border-black/[0.06] px-3 py-2 last:border-0">
                <Checkbox checked={ids.includes(v.id)} onChange={(c) => setIds((s) => (c ? [...s, v.id] : s.filter((x) => x !== v.id)))} />
                <VideoThumb video={v} width={64} showDuration={false} rounded="rounded" />
                <span className="line-clamp-1 text-[13px]">{v.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PlaylistsTab() {
  const { playlists, allVideos, deletePlaylist, toast } = useStudio();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Playlist | undefined>();
  const [open, setOpen] = useState(params.get('new') === '1');
  const [del, setDel] = useState<Playlist | null>(null);
  useEffect(() => {
    if (params.get('new')) {
      setOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);
  const visIcon = (v: Playlist['visibility']) => (v === 'public' ? <Globe size={18} /> : v === 'private' ? <Lock size={18} /> : <Link2 size={18} />);
  return (
    <div>
      <div className="flex h-14 items-center border-b border-black/[0.1] px-6">
        <span className="flex-1 text-sm text-[#606060]">{playlists.length} playlists</span>
        <Button variant="tonal" icon={<Plus size={18} />} onClick={() => (setEditing(undefined), setOpen(true))}>New playlist</Button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="h-12 border-b border-black/[0.1] text-xs font-medium text-[#606060]">
            <th className="pl-6 font-medium">Playlist</th>
            <th className="font-medium">Type</th>
            <th className="font-medium">Visibility</th>
            <th className="font-medium">Last updated</th>
            <th className="pr-6 text-right font-medium">Video count</th>
          </tr>
        </thead>
        <tbody>
          {playlists.map((p) => {
            const first = allVideos.find((v) => v.id === p.videoIds[0]);
            return (
              <tr key={p.id} className="group border-b border-black/[0.1] hover:bg-[#f9f9f9]">
                <td className="py-3 pl-6">
                  <div className="flex gap-4">
                    <div className="relative w-[120px] shrink-0 overflow-hidden rounded-lg bg-[#e5e5e5]" style={{ aspectRatio: '16/9' }}>
                      {first && <VideoThumb video={first} width={120} showDuration={false} />}
                      <span className="absolute inset-y-0 right-0 flex w-1/2 flex-col items-center justify-center bg-black/70 text-xs font-medium text-white">
                        {p.videoIds.length}
                        <span className="text-[10px] font-normal">videos</span>
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium">{p.title}</div>
                      <div className="relative mt-1 h-9">
                        <div className="line-clamp-2 text-xs text-[#606060] group-hover:invisible">{p.description || 'Add description'}</div>
                        <div className="invisible absolute -left-2 top-0 flex group-hover:visible">
                          <IconButton label="Edit" size={36} onClick={() => (setEditing(p), setOpen(true))}><Pencil size={18} /></IconButton>
                          <IconButton label="Delete" size={36} onClick={() => setDel(p)}><Trash2 size={18} /></IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-[13px]">{p.id === 'pl-shorts' ? 'Shorts playlist' : 'Playlist'}</td>
                <td className="text-[13px]"><span className="flex items-center gap-2 text-[#606060]">{visIcon(p.visibility)} <span className="text-[#0f0f0f] capitalize">{p.visibility}</span></span></td>
                <td className="text-[13px]">{formatDate(p.updatedAt)}</td>
                <td className="pr-6 text-right text-[13px]">{p.videoIds.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <PlaylistDialog open={open} onClose={() => setOpen(false)} initial={editing} />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete playlist?" body={<>“{del?.title}” will be permanently deleted. The videos in it won't be affected.</>} confirmLabel="Delete" onConfirm={() => { if (del) { deletePlaylist(del.id); toast('Playlist deleted'); } }} />
    </div>
  );
}

export function ContentPage() {
  const { tab = 'videos' } = useParams();
  const navigate = useNavigate();
  const { toast } = useStudio();
  const current = (TABS.some((t) => t.value === tab) ? tab : 'videos') as Tab;
  return (
    <div>
      <PageHeader title="Channel content" />
      <Tabs className="mt-2 px-5" tabs={TABS as unknown as { value: Tab; label: string }[]} value={current} onChange={(t) => navigate(`/content/${t}`)} />
      {current === 'videos' && <VideosTable kind="video" />}
      {current === 'shorts' && <VideosTable kind="short" />}
      {current === 'live' && (
        <EmptyState art={<EmptyArt kind="live" />} title="No live streams yet" body="Premieres and live streams you create will show up here. Documentaries often premiere as a scheduled event so subscribers can watch together." action={<Button variant="primary" onClick={() => toast('Live streaming will be available within 24 hours of enabling')}>Go live</Button>} />
      )}
      {current === 'posts' && <PostsTab />}
      {current === 'playlists' && <PlaylistsTab />}
      {current === 'podcasts' && (
        <EmptyState art={<EmptyArt kind="podcast" />} title="No podcasts yet" body="Turn a playlist into a podcast so your documentaries can be listened to in YouTube Music – great for long-form history content." action={<Button variant="primary" onClick={() => navigate('/content/playlists?new=1')}>New podcast</Button>} />
      )}
      {current === 'promotions' && (
        <EmptyState art={<EmptyArt kind="mail" />} title="No promotions" body="Promote a video to reach new viewers with a Google Ads campaign. Promotions you create will show up here." action={<Button variant="tonal" onClick={() => toast('Promotions use Google Ads, which is outside this simulator')}>Learn more</Button>} />
      )}
    </div>
  );
}
