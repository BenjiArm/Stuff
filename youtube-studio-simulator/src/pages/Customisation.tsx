import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { Tabs, TextAreaField, InputField, SelectField, Toggle } from '../components/common/Controls';
import { useStudio } from '../store/StudioContext';
import { Button, IconButton } from '../components/common/Button';
import { ChannelAvatar, ChannelBanner, AVATAR_STYLE_COUNT, BANNER_COUNT } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { MenuItem, Popover, useMenu } from '../components/common/Popover';
import { VideoThumb } from '../components/common/VideoThumb';
import { formatCompact, formatInt, timeAgo } from '../lib/format';
import { CURRENT_SUBSCRIBERS } from '../data/analytics';
import { videoLifetime } from '../lib/videoStats';
import type { ChannelProfile } from '../data/channel';

function Block({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/[0.1] py-6 last:border-0">
      <div className="text-[15px] font-medium">{title}</div>
      {desc && <p className="mt-1 max-w-[720px] text-[13px] leading-5 text-[#606060]">{desc}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChannelPreview({ open, onClose, profile }: { open: boolean; onClose: () => void; profile: ChannelProfile }) {
  const { videos } = useStudio();
  const pub = videos.filter((v) => v.visibility === 'public');
  const longs = pub.filter((v) => v.kind === 'video').sort((a, b) => b.publishedAt - a.publishedAt);
  const popular = [...longs].sort((a, b) => videoLifetime(b).views - videoLifetime(a).views);
  const [tab, setTab] = useState<'home' | 'videos' | 'shorts'>('home');
  const featured = longs.find((v) => v.id === profile.featuredForNonSubscribers) ?? popular[0];
  const grid = tab === 'shorts' ? pub.filter((v) => v.kind === 'short') : tab === 'videos' ? longs : popular.slice(0, 8);
  return (
    <Modal open={open} onClose={onClose} title="Channel preview" width={1100} bodyClassName="p-0">
      <div className="px-8 pb-8 pt-4">
        <div className="h-[170px] overflow-hidden rounded-xl">
          <ChannelBanner styleIndex={profile.bannerStyle} name={profile.name} />
        </div>
        <div className="mt-4 flex gap-6">
          <ChannelAvatar size={150} styleIndex={profile.avatarStyle} />
          <div className="pt-2">
            <div className="text-[34px] font-bold leading-tight">{profile.name}</div>
            <div className="mt-1 text-sm text-[#606060]">
              <span className="font-medium text-[#0f0f0f]">{profile.handle}</span> · {formatCompact(CURRENT_SUBSCRIBERS)} subscribers · {longs.length + pub.filter((v) => v.kind === 'short').length} videos
            </div>
            <div className="mt-2 line-clamp-2 max-w-[640px] text-sm text-[#606060]">{profile.description.split('\n')[0]} <ChevronRight size={14} className="inline" /></div>
            {profile.links[0] && <div className="mt-1 text-sm font-medium text-[#065fd4]">{profile.links[0].url} and {profile.links.length - 1} more links</div>}
            <button className="mt-3 h-9 rounded-full bg-[#0f0f0f] px-4 text-sm font-medium text-white">Subscribe</button>
          </div>
        </div>
        <div className="mt-4 flex gap-6 border-b border-black/[0.1] text-[15px] font-medium">
          {(['home', 'videos', 'shorts'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`pb-3 capitalize ${tab === t ? 'border-b-2 border-[#0f0f0f]' : 'text-[#606060]'}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === 'home' && featured && (
          <div className="mt-6 flex gap-6">
            <VideoThumb video={featured} width={420} rounded="rounded-xl" />
            <div>
              <div className="text-lg font-medium">{featured.title}</div>
              <div className="mt-1 text-xs text-[#606060]">{formatInt(videoLifetime(featured).views)} views · {timeAgo(featured.publishedAt)}</div>
              <p className="mt-3 line-clamp-4 text-[13px] text-[#606060]">{featured.description}</p>
            </div>
          </div>
        )}
        {tab === 'home' && <div className="mt-8 text-lg font-bold">{profile.sections[0]?.title ?? 'Videos'}</div>}
        <div className={`mt-4 grid gap-4 ${tab === 'shorts' ? 'grid-cols-6' : 'grid-cols-4'} max-md:grid-cols-2`}>
          {grid.map((v) => (
            <div key={v.id}>
              <VideoThumb video={v} width="100%" rounded="rounded-xl" />
              <div className="mt-2 line-clamp-2 text-sm font-medium leading-5">{v.title}</div>
              <div className="text-xs text-[#606060]">{formatCompact(videoLifetime(v).views)} views · {timeAgo(v.publishedAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

const SECTION_TYPES = ['Videos', 'Popular videos', 'Shorts', 'Playlist', 'Created playlists', 'Posts', 'Featured channels', 'Upcoming premieres'];

export function CustomisationPage() {
  const { tab = 'profile' } = useParams();
  const navigate = useNavigate();
  const { profile, setProfile, videos, playlists, toast } = useStudio();
  const [draft, setDraft] = useState<ChannelProfile>(profile);
  const [preview, setPreview] = useState(false);
  const addSection = useMenu();
  useEffect(() => setDraft(profile), [profile]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const set = <K extends keyof ChannelProfile>(k: K, v: ChannelProfile[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const handleValid = /^@[A-Za-z0-9._-]{3,30}$/.test(draft.handle);
  const longs = useMemo(() => videos.filter((v) => v.kind === 'video' && v.visibility === 'public'), [videos]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Channel customisation"
        actions={
          <>
            <Button variant="text" onClick={() => setPreview(true)}>View channel</Button>
            <Button variant="tonal" disabled={!dirty} onClick={() => setDraft(profile)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!dirty || !draft.name.trim() || !handleValid}
              onClick={() => {
                setProfile(draft);
                toast('Changes published');
              }}
            >
              Publish
            </Button>
          </>
        }
      />
      <Tabs className="mt-2 px-5" tabs={[{ value: 'profile', label: 'Profile' }, { value: 'home', label: 'Home tab' }]} value={tab === 'home' ? 'home' : 'profile'} onChange={(t) => navigate(`/customisation/${t}`)} />
      <div className="max-w-[1000px] px-8 max-sm:px-4">
        {tab !== 'home' ? (
          <>
            <Block title="Banner image" desc="This image will appear across the top of your channel. For the best results on all devices, use an image that's at least 2048 x 1152 pixels.">
              <div className="flex items-start gap-6 max-md:flex-col">
                <div className="h-[106px] w-[290px] max-w-full overflow-hidden rounded-lg bg-[#f2f2f2]">
                  <ChannelBanner styleIndex={draft.bannerStyle} name={draft.name || 'Your channel'} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: BANNER_COUNT }).map((_, i) => (
                      <button key={i} onClick={() => set('bannerStyle', i)} className={`h-10 w-24 overflow-hidden rounded border-2 ${draft.bannerStyle === i ? 'border-[#065fd4]' : 'border-transparent'}`} aria-label={`Banner style ${i + 1}`}>
                        <ChannelBanner styleIndex={i} name={draft.name} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="text" onClick={() => set('bannerStyle', (draft.bannerStyle + 1) % BANNER_COUNT)}>Change</Button>
                  </div>
                </div>
              </div>
            </Block>
            <Block title="Picture" desc="Your profile picture will appear where your channel is presented on YouTube, like next to your videos and comments.">
              <div className="flex flex-wrap items-center gap-6">
                <ChannelAvatar size={112} styleIndex={draft.avatarStyle} />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: AVATAR_STYLE_COUNT }).map((_, i) => (
                    <button key={i} onClick={() => set('avatarStyle', i)} className={`rounded-full border-2 p-0.5 ${draft.avatarStyle === i ? 'border-[#065fd4]' : 'border-transparent'}`} aria-label={`Avatar style ${i + 1}`}>
                      <ChannelAvatar size={48} styleIndex={i} />
                    </button>
                  ))}
                </div>
              </div>
            </Block>
            <Block title="Name" desc="Choose a channel name that represents you and your content. Changes made to your name and picture are visible only on YouTube.">
              <TextAreaField label="Name" value={draft.name} onChange={(v) => set('name', v)} maxLength={50} rows={1} required />
            </Block>
            <Block title="Handle" desc="Choose your unique handle by adding letters and numbers. You can change your handle back within 14 days.">
              <InputField label="Handle" value={draft.handle} onChange={(v) => set('handle', v.startsWith('@') ? v : `@${v}`)} helper={handleValid ? `https://www.youtube.com/${draft.handle}` : 'Handles must be 3–30 characters: letters, numbers, dots, dashes or underscores'} />
            </Block>
            <Block title="Description">
              <TextAreaField label="Description" value={draft.description} onChange={(v) => set('description', v)} maxLength={1000} rows={6} />
            </Block>
            <Block title="Channel URL" desc="This is the standard web address for your channel.">
              <div className="flex max-w-[560px] items-center gap-2 rounded-lg bg-[#f9f9f9] px-3 py-2 text-sm">
                <span className="flex-1 truncate">https://www.youtube.com/channel/UCp4stExpl41n3dH1st0ry</span>
                <IconButton label="Copy" size={32} onClick={() => (navigator.clipboard?.writeText('https://www.youtube.com/channel/UCp4stExpl41n3dH1st0ry').catch(() => undefined), toast('Link copied'))}>
                  <Copy size={16} />
                </IconButton>
              </div>
            </Block>
            <Block title="Links" desc="Share external links with your viewers. They'll be visible on your channel profile and about page.">
              <div className="flex flex-col gap-3">
                {draft.links.map((l, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <GripVertical size={20} className="mt-4 text-[#909090]" />
                    <InputField className="w-[220px]" label="Link title (required)" value={l.title} onChange={(v) => set('links', draft.links.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
                    <InputField className="flex-1" label="URL (required)" value={l.url} onChange={(v) => set('links', draft.links.map((x, j) => (j === i ? { ...x, url: v } : x)))} />
                    <IconButton label="Delete link" className="mt-2" onClick={() => set('links', draft.links.filter((_, j) => j !== i))}>
                      <Trash2 size={20} />
                    </IconButton>
                  </div>
                ))}
                <Button variant="text" icon={<Plus size={18} />} className="self-start" onClick={() => set('links', [...draft.links, { title: '', url: '' }])} disabled={draft.links.length >= 14}>
                  Add link
                </Button>
              </div>
            </Block>
            <Block title="Contact info" desc="Let people know how to contact you with business enquiries.">
              <InputField className="max-w-[560px]" label="Email" value={draft.email} onChange={(v) => set('email', v)} type="email" />
            </Block>
            <Block title="Video watermark" desc="The watermark will appear on your videos in the right-hand corner of the video player.">
              <div className="flex items-center gap-4">
                <div className="relative h-[90px] w-[160px] overflow-hidden rounded bg-black">
                  {draft.watermark && (
                    <span className="absolute bottom-2 right-2 opacity-70">
                      <ChannelAvatar size={26} styleIndex={draft.avatarStyle} />
                    </span>
                  )}
                </div>
                <Toggle checked={draft.watermark} onChange={(v) => set('watermark', v)} label="Show watermark" />
                <span className="text-sm">{draft.watermark ? 'Shown for the entire video' : 'Off'}</span>
              </div>
            </Block>
          </>
        ) : (
          <>
            <Block title="Video spotlight" desc="Add a video to the top of your channel home page.">
              <div className="flex flex-col gap-4">
                <SelectField
                  label="Channel trailer for people who haven't subscribed"
                  value={draft.featuredForNonSubscribers}
                  onChange={(v) => set('featuredForNonSubscribers', v)}
                  options={[{ value: '', label: 'Automatic: your most popular video' }, ...longs.map((v) => ({ value: v.id, label: v.title }))]}
                />
                <SelectField
                  label="Featured video for returning subscribers"
                  value={draft.featuredForSubscribers}
                  onChange={(v) => set('featuredForSubscribers', v)}
                  options={[{ value: '', label: 'Automatic: your latest upload' }, ...longs.map((v) => ({ value: v.id, label: v.title }))]}
                />
              </div>
            </Block>
            <Block title={`Featured sections (${draft.sections.length}/12)`} desc="Customise the layout of your channel home page with up to 12 sections.">
              <div className="flex flex-col gap-2">
                {draft.sections.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border border-black/[0.1] px-3 py-2">
                    <GripVertical size={18} className="text-[#909090]" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="text-xs text-[#606060]">{s.type}</div>
                    </div>
                    <IconButton label="Move up" size={32} disabled={i === 0} onClick={() => { const n = [...draft.sections]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set('sections', n); }}><ArrowUp size={16} /></IconButton>
                    <IconButton label="Move down" size={32} disabled={i === draft.sections.length - 1} onClick={() => { const n = [...draft.sections]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set('sections', n); }}><ArrowDown size={16} /></IconButton>
                    <IconButton label="Remove section" size={32} onClick={() => set('sections', draft.sections.filter((x) => x.id !== s.id))}><Trash2 size={16} /></IconButton>
                  </div>
                ))}
                <Button variant="text" icon={<Plus size={18} />} className="self-start" ref={addSection.ref} onClick={addSection.toggle} disabled={draft.sections.length >= 12}>
                  Add section
                </Button>
                <Popover anchor={addSection.ref} open={addSection.open} onClose={addSection.close} width={240}>
                  {SECTION_TYPES.map((t) => (
                    <MenuItem key={t} onClick={() => { addSection.close(); set('sections', [...draft.sections, { id: `sec${Date.now()}`, type: t, title: t === 'Playlist' ? playlists[0]?.title ?? 'Playlist' : t }]); }}>
                      {t}
                    </MenuItem>
                  ))}
                </Popover>
              </div>
            </Block>
          </>
        )}
      </div>
      {dirty && <div className="fixed bottom-6 right-8 z-30 animate-slide-up rounded-lg bg-[#0f0f0f] px-4 py-3 text-sm text-white shadow-lg">You have unpublished changes</div>}
      <ChannelPreview open={preview} onClose={() => setPreview(false)} profile={draft} />
    </div>
  );
}
