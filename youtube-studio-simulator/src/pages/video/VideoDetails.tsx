import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Copy, ImagePlus, MoreVertical, Play, Trash2, Download, X, Check } from 'lucide-react';
import type { Video, Visibility } from '../../data/types';
import { useStudio } from '../../store/StudioContext';
import { Button, IconButton } from '../../components/common/Button';
import { Checkbox, Radio, SelectField, TextAreaField, Toggle } from '../../components/common/Controls';
import { Thumbnail } from '../../components/thumbnails/Thumbnail';
import { variantSpec } from '../../lib/thumbVariants';
import { MenuDivider, MenuItem, Popover, useMenu } from '../../components/common/Popover';
import { ConfirmDialog } from '../../components/common/Modal';
import { formatDate, formatDuration } from '../../lib/format';
import { VisibilityIcon } from '../../components/content/VideoControls';
import { visibilityLabel } from '../../lib/videoStats';
import { fileToThumbnail } from '../../lib/image';
import { MonetisationIcon } from '../../components/common/StudioIcons';

const CATEGORIES = ['Education', 'Entertainment', 'Film & Animation', 'People & Blogs', 'Travel & Events', 'News & Politics'];
const LANGS = ['English (United Kingdom)', 'English (United States)', 'English', 'Spanish', 'German', 'French'];

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [text, setText] = useState('');
  const total = tags.join(',').length;
  const add = (raw: string) => {
    const parts = raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (parts.length) onChange(Array.from(new Set([...tags, ...parts])));
    setText('');
  };
  return (
    <div>
      <div className="flex min-h-[56px] flex-wrap items-center gap-2 rounded-lg border border-black/[0.2] px-3 py-2 focus-within:border-[#065fd4] focus-within:shadow-[0_0_0_1px_#065fd4]">
        {tags.map((t) => (
          <span key={t} className="flex h-7 items-center gap-1 rounded-full bg-black/[0.07] pl-3 pr-1 text-[13px]">
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-black/10" aria-label={`Remove ${t}`}>
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(text);
            } else if (e.key === 'Backspace' && !text && tags.length) onChange(tags.slice(0, -1));
          }}
          onBlur={() => text && add(text)}
          placeholder={tags.length ? '' : 'Add tag'}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <div className="mt-1.5 flex justify-between px-1 text-xs text-[#606060]">
        <span>Enter a comma after each tag</span>
        <span className={total > 500 ? 'text-[#cc0000]' : ''}>{total}/500</span>
      </div>
    </div>
  );
}

export function VideoDetails({ video }: { video: Video }) {
  const { updateVideo, deleteVideos, restoreVideos, playlists, upsertPlaylist, toast } = useStudio();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Video>(video);
  const [showMore, setShowMore] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [ack, setAck] = useState(false);
  const more = useMenu();
  const visMenu = useMenu();
  const plMenu = useMenu();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickedPlaylists, setPickedPlaylists] = useState<string[]>(() => playlists.filter((p) => p.videoIds.includes(video.id)).map((p) => p.id));

  useEffect(() => {
    setDraft(video);
    setPickedPlaylists(playlists.filter((p) => p.videoIds.includes(video.id)).map((p) => p.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  const originalPlaylists = useMemo(() => playlists.filter((p) => p.videoIds.includes(video.id)).map((p) => p.id).sort().join(), [playlists, video.id]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(video) || [...pickedPlaylists].sort().join() !== originalPlaylists;
  const set = <K extends keyof Video>(k: K, v: Video[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const titleError = !draft.title.trim() ? 'Your video needs a title' : draft.title.length > 100 ? 'Title is too long' : undefined;
  const link = `https://youtu.be/${video.id.replace(/[^a-z0-9]/gi, '').slice(0, 11)}`;

  const save = () => {
    const patch: Partial<Video> = {};
    (Object.keys(draft) as (keyof Video)[]).forEach((k) => {
      if (JSON.stringify(draft[k]) !== JSON.stringify(video[k])) (patch as Record<string, unknown>)[k] = draft[k];
    });
    if (patch.visibility === 'public' && (video.visibility === 'scheduled' || video.visibility === 'draft' || video.visibility === 'private')) patch.publishedAt = Date.now();
    updateVideo(video.id, patch);
    playlists.forEach((p) => {
      const has = p.videoIds.includes(video.id);
      const want = pickedPlaylists.includes(p.id);
      if (has !== want) upsertPlaylist({ ...p, videoIds: want ? [...p.videoIds, video.id] : p.videoIds.filter((x) => x !== video.id), updatedAt: Date.now() });
    });
    toast('Changes saved');
  };

  const onThumbFile = async (f: File) => {
    try {
      const data = await fileToThumbnail(f);
      setDraft((d) => ({ ...d, customThumb: data }));
    } catch {
      toast('That image couldn\'t be read – try a JPG or PNG');
    }
  };

  const thumbOptions = [0, 1, 2, 3];

  return (
    <div className="pb-16">
      <div className="flex min-h-[72px] items-center gap-2 px-8 pt-6 max-sm:px-4">
        <h1 className="flex-1 text-[25px] font-medium">Video details</h1>
        <Button variant="text" disabled={!dirty} onClick={() => setDraft(video)}>
          Undo changes
        </Button>
        <Button variant="primary" disabled={!dirty || !!titleError} onClick={save}>
          Save
        </Button>
        <IconButton label="More" ref={more.ref} onClick={more.toggle}>
          <MoreVertical size={22} />
        </IconButton>
        <Popover anchor={more.ref} open={more.open} onClose={more.close} align="right" width={220}>
          <MenuItem icon={<Download size={18} />} onClick={() => (more.close(), toast('Download started (simulated)'))}>Download</MenuItem>
          <MenuDivider />
          <MenuItem icon={<Trash2 size={18} />} onClick={() => (more.close(), setConfirm(true))}>Delete forever</MenuItem>
        </Popover>
      </div>

      <div className="flex gap-8 px-8 pt-2 max-lg:flex-col max-sm:px-4">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TextAreaField label="Title" required value={draft.title} onChange={(v) => set('title', v.replace(/\n/g, ''))} maxLength={100} rows={2} error={titleError} placeholder="Add a title that describes your video" />
          <TextAreaField label="Description" value={draft.description} onChange={(v) => set('description', v)} maxLength={5000} rows={8} placeholder="Tell viewers about your video" />

          <div>
            <div className="text-[15px] font-medium">Thumbnail</div>
            <p className="mt-0.5 text-[13px] text-[#606060]">Set a thumbnail that stands out and draws viewers' attention.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => fileRef.current?.click()} className="flex w-[150px] flex-col items-center justify-center gap-1 rounded border border-dashed border-black/[0.3] text-[13px] text-[#606060] hover:bg-black/[0.03]" style={{ aspectRatio: '16/9' }}>
                <ImagePlus size={22} />
                Upload file
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onThumbFile(f); e.target.value = ''; }} />
              {draft.customThumb && (
                <div className={`relative w-[150px] overflow-hidden rounded border-2 border-[#0f0f0f]`} style={{ aspectRatio: '16/9' }}>
                  <img src={draft.customThumb} alt="Custom thumbnail" className="h-full w-full object-cover" />
                  <button onClick={() => set('customThumb', undefined)} className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white" aria-label="Remove custom thumbnail">
                    <X size={14} />
                  </button>
                </div>
              )}
              {thumbOptions.map((v) => {
                const active = !draft.customThumb && (draft.thumbVariant ?? 0) === v;
                return (
                  <button key={v} onClick={() => setDraft((d) => ({ ...d, thumbVariant: v, customThumb: undefined }))} className={`relative w-[150px] overflow-hidden rounded border-2 ${active ? 'border-[#0f0f0f]' : 'border-transparent opacity-80 hover:opacity-100'}`} style={{ aspectRatio: '16/9' }}>
                    <Thumbnail spec={variantSpec(draft.thumb, v)} vertical={draft.kind === 'short'} />
                    {v === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">Original</span>}
                    {active && <span className="absolute right-1 top-1 rounded-full bg-[#0f0f0f] p-0.5 text-white"><Check size={12} /></span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[15px] font-medium">Playlists</div>
            <p className="mt-0.5 text-[13px] text-[#606060]">Add your video to one or more playlists to organise your content for viewers.</p>
            <button ref={plMenu.ref} onClick={plMenu.toggle} className="mt-3 flex h-14 w-full max-w-[360px] items-center rounded-lg border border-black/[0.2] px-3 text-left text-[15px] hover:border-[#606060]">
              <span className="flex-1 truncate">{pickedPlaylists.length ? playlists.filter((p) => pickedPlaylists.includes(p.id)).map((p) => p.title).join(', ') : 'Select'}</span>
              <ChevronDown size={20} className="text-[#606060]" />
            </button>
            <Popover anchor={plMenu.ref} open={plMenu.open} onClose={plMenu.close} width={360}>
              <div className="flex flex-col gap-3 px-4 py-2">
                {playlists.map((p) => (
                  <Checkbox key={p.id} checked={pickedPlaylists.includes(p.id)} onChange={(c) => setPickedPlaylists((s) => (c ? [...s, p.id] : s.filter((x) => x !== p.id)))} label={p.title} />
                ))}
              </div>
              <div className="flex justify-end px-4 pt-2">
                <Button variant="text" onClick={plMenu.close}>Done</Button>
              </div>
            </Popover>
          </div>

          <div>
            <div className="text-[15px] font-medium">Audience</div>
            <p className="mt-0.5 text-[13px] text-[#606060]">This video is set to {draft.madeForKids ? 'made for kids' : 'not made for kids'}. Is this video made for kids? (required)</p>
            <div className="mt-2">
              <Radio name="mfk" checked={draft.madeForKids} onChange={() => set('madeForKids', true)} label="Yes, it's made for kids" />
              <Radio name="mfk" checked={!draft.madeForKids} onChange={() => set('madeForKids', false)} label="No, it's not made for kids" />
            </div>
            <div className="mt-3 rounded-lg bg-[#f9f9f9] p-4">
              <div className="text-sm font-medium">Age restriction (advanced)</div>
              <div className="mt-2">
                <Checkbox checked={draft.ageRestricted} onChange={(v) => set('ageRestricted', v)} label="Yes, restrict my video to viewers over 18" />
              </div>
            </div>
          </div>

          <button onClick={() => setShowMore(!showMore)} className="self-start text-sm font-medium text-[#0f0f0f] hover:underline">
            {showMore ? 'Show less' : 'Show more'}
          </button>
          {showMore && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="text-[15px] font-medium">Altered content</div>
                <p className="mt-0.5 text-[13px] text-[#606060]">Does this content contain realistic altered or synthetic media, such as AI-generated reconstructions of historical events?</p>
                <Radio name="alt" checked={draft.alteredContent} onChange={() => set('alteredContent', true)} label="Yes" />
                <Radio name="alt" checked={!draft.alteredContent} onChange={() => set('alteredContent', false)} label="No" description="Illustrative AI visuals that are clearly stylised don't need a label." />
              </div>
              <div>
                <div className="text-[15px] font-medium">Tags</div>
                <p className="mb-3 mt-0.5 text-[13px] text-[#606060]">Tags can be useful if content in your video is commonly misspelt.</p>
                <TagInput tags={draft.tags} onChange={(t) => set('tags', t)} />
              </div>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <SelectField label="Video language" value={draft.language} onChange={(v) => set('language', v)} options={LANGS.map((l) => ({ value: l, label: l }))} />
                <SelectField label="Category" value={draft.category} onChange={(v) => set('category', v)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
              </div>
              <div>
                <div className="text-[15px] font-medium">Comments and ratings</div>
                <SelectField className="mt-3 max-w-[360px]" label="Comment moderation" value={draft.commentsMode} onChange={(v) => set('commentsMode', v)} options={[{ value: 'on', label: 'On – allow all comments' }, { value: 'hold', label: 'Hold all comments for review' }, { value: 'off', label: 'Off – disable comments' }]} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Toggle checked={draft.commentsMode !== 'off'} onChange={(v) => set('commentsMode', v ? 'on' : 'off')} label="Comments" />
                Allow viewers to comment
              </div>
            </div>
          )}
        </div>

        <div className="w-[360px] shrink-0 max-lg:w-full">
          <div className="overflow-hidden rounded-xl bg-[#f9f9f9]">
            <div className="group relative cursor-pointer" style={{ aspectRatio: '16/9' }} onClick={() => toast('Playback isn\'t available for simulated videos')}>
              {draft.customThumb ? <img src={draft.customThumb} alt="" className="h-full w-full object-cover" /> : <Thumbnail spec={variantSpec(draft.thumb, draft.thumbVariant ?? 0)} vertical={draft.kind === 'short'} />}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100">
                  <Play size={28} fill="white" className="text-white" />
                </span>
              </span>
              <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1 text-xs text-white">{formatDuration(video.durationSec)}</span>
            </div>
            <div className="p-4 text-[13px]">
              <div className="text-xs text-[#606060]">Video link</div>
              <div className="flex items-center gap-2">
                <span className="truncate text-[#065fd4]">{link}</span>
                <IconButton label="Copy video link" size={32} onClick={() => (navigator.clipboard?.writeText(link).catch(() => undefined), toast('Link copied to clipboard'))}>
                  <Copy size={16} />
                </IconButton>
              </div>
              <div className="mt-2 text-xs text-[#606060]">Filename</div>
              <div className="truncate">{video.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}_final_4k.mp4</div>
              <div className="mt-3 text-xs text-[#606060]">Video quality</div>
              <div className="mt-1 flex gap-1">
                {['SD', 'HD', '4K'].map((q) => (
                  <span key={q} className="rounded border border-black/[0.2] px-1.5 text-[11px] font-medium">{q}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[15px] font-medium">Visibility</div>
            <button ref={visMenu.ref} onClick={() => draft.visibility !== 'draft' && visMenu.toggle()} className="mt-2 flex h-14 w-full items-center gap-3 rounded-lg border border-black/[0.2] px-3 text-left hover:border-[#606060]">
              <VisibilityIcon v={draft.visibility} />
              <span className="flex-1">
                <span className="block text-[15px]">{visibilityLabel[draft.visibility]}</span>
                {draft.visibility === 'scheduled' && draft.scheduledFor && <span className="block text-xs text-[#606060]">Premieres {formatDate(draft.scheduledFor)}</span>}
              </span>
              <ChevronDown size={20} className="text-[#606060]" />
            </button>
            <Popover anchor={visMenu.ref} open={visMenu.open} onClose={visMenu.close} width={360}>
              <div className="px-5 py-2">
                {(['private', 'unlisted', 'public'] as Visibility[]).concat(video.visibility === 'scheduled' ? ['scheduled'] : []).map((v) => (
                  <Radio key={v} name="dvis" checked={draft.visibility === v} onChange={() => (set('visibility', v), visMenu.close())} label={visibilityLabel[v]} />
                ))}
              </div>
            </Popover>
          </div>

          <div className="mt-5 flex flex-col divide-y divide-black/[0.08] rounded-lg border border-black/[0.1]">
            {[
              { l: 'Restrictions', v: video.restriction === 'copyright' ? 'Copyright claim' : draft.ageRestricted ? 'Age restriction' : 'None', to: video.restriction === 'copyright' ? 'copyright' : undefined },
              { l: 'Monetisation', v: <span className="flex items-center gap-1.5"><MonetisationIcon status={video.monetisation} size={16} />{video.monetisation === 'on' ? 'On' : video.monetisation === 'limited' ? 'Limited ads' : video.monetisation === 'claimed' ? 'Claimed' : 'Off'}</span>, to: 'monetisation' },
              { l: 'Subtitles', v: 'English (United Kingdom)', to: 'subtitles' },
              { l: 'End screen', v: 'Imported from latest upload', to: 'editor' },
              { l: 'Cards', v: '2 cards', to: 'editor' },
            ].map((r) => (
              <button key={r.l} onClick={() => r.to && navigate(`/video/${video.id}/${r.to}`)} className="flex items-center px-4 py-3 text-left text-sm hover:bg-[#f9f9f9]">
                <span className="flex-1 font-medium">{r.l}</span>
                <span className="text-[13px] text-[#606060]">{r.v}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => (setConfirm(false), setAck(false))}
        title="Permanently delete this video?"
        body={<>“{video.title}” will be removed from your channel content. This can't be undone.</>}
        confirmLabel="Delete forever"
        requireCheck="I understand that deleting is permanent and can't be undone"
        checked={ack}
        onCheck={setAck}
        onConfirm={() => {
          deleteVideos([video.id]);
          toast('Video deleted', 'Undo', () => restoreVideos([video.id]));
          navigate('/content/videos');
        }}
      />
    </div>
  );
}
