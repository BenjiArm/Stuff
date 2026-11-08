import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Check, Loader2, CheckCircle2, FileVideo, Captions, MonitorPlay, Info, Copy } from 'lucide-react';
import { useStudio } from '../store/StudioContext';
import { IconButton, Button } from '../components/common/Button';
import { Radio, TextAreaField, SelectField } from '../components/common/Controls';
import { Thumbnail, type PaletteName, type ThumbSpec } from '../components/thumbnails/Thumbnail';
import type { SceneName } from '../components/thumbnails/scenes';
import type { Video, Visibility } from '../data/types';
import { formatDuration } from '../lib/format';
import { toInputDate } from '../lib/dates';

const STEPS = ['Details', 'Video elements', 'Checks', 'Visibility'];

const SCENE_KEYWORDS: [RegExp, SceneName][] = [
  [/rome|roman|caesar|emperor|legion/i, 'colosseum'],
  [/egypt|pharaoh|pyramid/i, 'pyramids'],
  [/viking|norse/i, 'longship'],
  [/castle|medieval|knight|king|queen/i, 'castle'],
  [/war|battle|army|siege/i, 'army'],
  [/plague|death|disease/i, 'plague'],
  [/sea|ship|navy|ocean/i, 'galleon'],
  [/greece|greek|sparta|athens/i, 'temple'],
  [/mystery|lost|vanish/i, 'ruins'],
];
const PALETTES: PaletteName[] = ['blood', 'gold', 'night', 'ember', 'dusk', 'storm'];

function specFor(title: string, variant: number): ThumbSpec {
  const scene = SCENE_KEYWORDS.find(([re]) => re.test(title))?.[1] ?? (['ruins', 'temple', 'fortress', 'map'] as SceneName[])[title.length % 4];
  const words = title.replace(/[^a-z0-9 ]/gi, '').split(' ').filter((w) => w.length > 3);
  const text = words.length ? `${words[0]}${words[1] ? `|${words[1]}` : ''}` : 'History';
  return { scene, palette: PALETTES[(title.length + variant * 2) % PALETTES.length], text, align: variant === 1 ? 'right' : 'left', arrow: variant === 2, flip: variant === 1 };
}

export function UploadDialog() {
  const { uploadOpen, setUploadOpen, settings, addUpload, toast, playlists } = useStudio();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbVariant, setThumbVariant] = useState(0);
  const [playlist, setPlaylist] = useState('');
  const [kids, setKids] = useState(false);
  const [altered, setAltered] = useState(true);
  const [elements, setElements] = useState({ subtitles: false, endScreen: false, cards: false });
  const [checks, setChecks] = useState<'idle' | 'running' | 'done'>('idle');
  const [visibility, setVisibility] = useState<Visibility>(settings.defaultVisibility);
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(toInputDate(new Date(Date.now() + 3 * 86_400_000)));
  const [scheduleTime, setScheduleTime] = useState('17:00');
  const [published, setPublished] = useState<Video | null>(null);
  const duration = useMemo(() => 540 + Math.floor(Math.random() * 900), [file]);

  useEffect(() => {
    if (!file || progress >= 100) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(100, p + 3 + Math.random() * 6)), 220);
    return () => window.clearTimeout(t);
  }, [file, progress]);

  useEffect(() => {
    if (step === 2 && checks === 'idle') {
      setChecks('running');
      window.setTimeout(() => setChecks('done'), 2200);
    }
  }, [step, checks]);

  const reset = () => {
    setFile(null);
    setStep(0);
    setProgress(0);
    setTitle('');
    setDescription('');
    setThumbVariant(0);
    setPlaylist('');
    setElements({ subtitles: false, endScreen: false, cards: false });
    setChecks('idle');
    setVisibility(settings.defaultVisibility);
    setSchedule(false);
    setPublished(null);
  };
  const close = () => {
    setUploadOpen(false);
    reset();
  };

  const pick = (f: { name: string; size: number }) => {
    setFile(f);
    const base = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    setTitle(settings.defaultTitle || base.charAt(0).toUpperCase() + base.slice(1));
    setDescription(settings.defaultDescription);
  };

  if (!uploadOpen) return null;
  const titleValid = title.trim().length > 0 && title.length <= 100;

  const publish = () => {
    let publishedAt = Date.now();
    let vis = visibility;
    let scheduledFor: number | undefined;
    if (schedule) {
      const [h, m] = scheduleTime.split(':').map(Number);
      const d = new Date(scheduleDate);
      d.setHours(h, m, 0, 0);
      scheduledFor = d.getTime();
      vis = 'scheduled';
      publishedAt = Date.now();
    }
    const v: Video = {
      id: `up-${Date.now().toString(36)}`,
      kind: 'video',
      title: title.trim(),
      description,
      durationSec: duration,
      topic: 'Uploads',
      tags: settings.defaultTags.split(',').map((t) => t.trim()).filter(Boolean),
      thumb: specFor(title, thumbVariant),
      visibility: vis,
      monetisation: 'on',
      restriction: 'none',
      publishedAt,
      scheduledFor,
      madeForKids: kids,
      ageRestricted: false,
      alteredContent: altered,
      category: settings.defaultCategory,
      language: settings.defaultLanguage,
      commentsMode: settings.defaultComments,
      playlistIds: playlist ? [playlist] : [],
      uploaded: true,
      fixedStats: { views: 0, likes: 0, comments: 0 },
    };
    addUpload(v);
    setPublished(v);
  };

  if (published) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-[520px] animate-pop-in rounded-xl bg-white p-6 shadow-dialog">
          <h2 className="text-xl font-medium">{published.visibility === 'public' ? 'Video published' : published.visibility === 'scheduled' ? 'Video scheduled' : 'Video saved'}</h2>
          <div className="mt-4 flex gap-4 rounded-lg bg-[#f9f9f9] p-3">
            <div className="w-40 shrink-0 overflow-hidden rounded" style={{ aspectRatio: '16/9' }}>
              <Thumbnail spec={published.thumb} />
            </div>
            <div className="min-w-0 text-sm">
              <div className="line-clamp-2 font-medium">{published.title}</div>
              <div className="mt-1 text-xs text-[#606060]">Video link</div>
              <div className="flex items-center gap-1 text-[13px] text-[#065fd4]">
                youtu.be/{published.id.slice(3, 14)}
                <button aria-label="Copy link" onClick={() => (navigator.clipboard?.writeText(`https://youtu.be/${published.id.slice(3, 14)}`).catch(() => undefined), toast('Link copied'))}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-[#606060]">This is a simulated upload: it appears in your content list but has no historical analytics yet.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="text" onClick={() => { const id = published.id; close(); navigate(`/video/${id}/edit`); }}>Edit details</Button>
            <Button variant="primary" onClick={() => { close(); navigate('/content/videos'); }}>Close</Button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4">
      <div className="flex h-[min(760px,calc(100vh-32px))] w-full max-w-[960px] animate-pop-in flex-col overflow-hidden rounded-xl bg-white shadow-dialog">
        <div className="flex items-center border-b border-black/[0.1] py-2 pl-6 pr-3">
          <h2 className="min-w-0 flex-1 truncate py-2 text-xl font-medium">{file ? title || 'Untitled' : 'Upload videos'}</h2>
          <IconButton label="Close" onClick={close}>
            <X size={22} />
          </IconButton>
        </div>
        {!file ? (
          <div
            className={`flex flex-1 flex-col items-center justify-center px-6 ${drag ? 'bg-[#f2f8ff]' : ''}`}
            onDragOver={(e) => (e.preventDefault(), setDrag(true))}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) pick({ name: f.name, size: f.size });
            }}
          >
            <button onClick={() => fileRef.current?.click()} className="flex h-[136px] w-[136px] items-center justify-center rounded-full bg-[#f2f2f2] text-[#909090] transition hover:bg-[#e5e5e5]">
              <Upload size={56} strokeWidth={1.5} />
            </button>
            <div className="mt-6 text-[15px]">Drag and drop video files to upload</div>
            <div className="mt-1 text-[13px] text-[#606060]">Your videos will be private until you publish them.</div>
            <Button variant="primary" className="mt-6" onClick={() => fileRef.current?.click()}>Select files</Button>
            <button className="mt-3 text-[13px] text-[#065fd4] hover:underline" onClick={() => pick({ name: 'the_rise_of_the_ottoman_empire_final.mp4', size: 2_840_000_000 })}>
              Or use a sample documentary file
            </button>
            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pick({ name: f.name, size: f.size }); e.target.value = ''; }} />
            <p className="mt-10 max-w-[560px] text-center text-xs text-[#909090]">By submitting your videos to YouTube, you acknowledge that you agree to YouTube's Terms of Service and Community Guidelines. This simulator never uploads files – they stay on your device.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-0 px-6 py-4">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <button onClick={() => (i < step || titleValid) && setStep(i)} className="flex flex-col items-center gap-1.5">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] ${i < step ? 'border-[#065fd4] bg-[#065fd4] text-white' : i === step ? 'border-[#065fd4]' : 'border-[#909090]'}`}>
                      {i < step ? <Check size={12} strokeWidth={3} /> : i === step ? <span className="h-2 w-2 rounded-full bg-[#065fd4]" /> : null}
                    </span>
                    <span className={`text-[13px] ${i === step ? 'font-medium text-[#0f0f0f]' : 'text-[#606060]'}`}>{s}</span>
                  </button>
                  {i < STEPS.length - 1 && <span className={`mx-3 mb-6 h-0.5 w-24 max-md:w-8 ${i < step ? 'bg-[#065fd4]' : 'bg-[#e5e5e5]'}`} />}
                </div>
              ))}
            </div>
            <div className="flex min-h-0 flex-1 gap-6 overflow-y-auto px-8 pb-6">
              <div className="min-w-0 flex-1">
                {step === 0 && (
                  <div className="flex flex-col gap-5">
                    <h3 className="text-xl font-medium">Details</h3>
                    <TextAreaField label="Title" value={title} onChange={setTitle} maxLength={100} required rows={2} placeholder="Add a title that describes your video" />
                    <TextAreaField label="Description" value={description} onChange={setDescription} maxLength={5000} rows={5} placeholder="Tell viewers about your video" />
                    <div>
                      <div className="text-[15px] font-medium">Thumbnail</div>
                      <p className="text-[13px] text-[#606060]">Select or upload a picture that shows what's in your video.</p>
                      <div className="mt-3 flex gap-3">
                        {[0, 1, 2].map((v) => (
                          <button key={v} onClick={() => setThumbVariant(v)} className={`w-[150px] overflow-hidden rounded border-2 ${thumbVariant === v ? 'border-[#0f0f0f]' : 'border-transparent opacity-80 hover:opacity-100'}`} style={{ aspectRatio: '16/9' }}>
                            <Thumbnail spec={specFor(title || 'History', v)} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <SelectField label="Playlists" value={playlist} onChange={setPlaylist} options={[{ value: '', label: 'Select' }, ...playlists.map((p) => ({ value: p.id, label: p.title }))]} />
                    <div>
                      <div className="text-[15px] font-medium">Audience</div>
                      <p className="mb-2 text-[13px] text-[#606060]">Is this video made for kids? (required)</p>
                      <Radio name="kids" checked={kids} onChange={() => setKids(true)} label="Yes, it's made for kids" />
                      <Radio name="kids" checked={!kids} onChange={() => setKids(false)} label="No, it's not made for kids" />
                    </div>
                    <div>
                      <div className="text-[15px] font-medium">Altered content</div>
                      <p className="mb-2 text-[13px] text-[#606060]">Does this video contain realistic altered or synthetic content, such as AI-generated scenes that viewers could mistake for real footage?</p>
                      <Radio name="alt" checked={altered} onChange={() => setAltered(true)} label="Yes" description="Recommended for AI-generated historical reconstructions" />
                      <Radio name="alt" checked={!altered} onChange={() => setAltered(false)} label="No" />
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <h3 className="text-xl font-medium">Video elements</h3>
                    <p className="mt-1 text-[13px] text-[#606060]">Use cards and an end screen to show viewers related videos, websites and calls to action.</p>
                    {[
                      { k: 'subtitles' as const, icon: <Captions size={22} />, t: 'Add subtitles', d: 'Reach a broader audience by adding subtitles to your video' },
                      { k: 'endScreen' as const, icon: <MonitorPlay size={22} />, t: 'Add an end screen', d: 'Promote related content at the end of your video' },
                      { k: 'cards' as const, icon: <Info size={22} />, t: 'Add cards', d: 'Promote related content during your video' },
                    ].map((e) => (
                      <div key={e.k} className="mt-4 flex items-center gap-4 rounded-lg bg-[#f9f9f9] p-4">
                        <span className="text-[#606060]">{e.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{e.t}</div>
                          <div className="text-[13px] text-[#606060]">{e.d}</div>
                        </div>
                        {elements[e.k] ? (
                          <span className="flex items-center gap-1 text-sm text-[#2ba640]"><CheckCircle2 size={18} /> Added</span>
                        ) : (
                          <Button variant="tonal" onClick={() => setElements((s) => ({ ...s, [e.k]: true }))}>{e.k === 'endScreen' ? 'Import from video' : 'Add'}</Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-medium">Checks</h3>
                    <p className="mt-1 text-[13px] text-[#606060]">We'll check your video for issues that may restrict its visibility and then you'll have the opportunity to fix issues before publishing.</p>
                    {['Copyright', 'Ad suitability'].map((c) => (
                      <div key={c} className="mt-4 flex items-center gap-4 border-b border-black/[0.08] pb-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{c}</div>
                          <div className="text-[13px] text-[#606060]">{checks === 'done' ? 'No issues found' : 'Checking…'}</div>
                        </div>
                        {checks === 'done' ? <CheckCircle2 className="text-[#2ba640]" /> : <Loader2 className="animate-spin text-[#606060]" />}
                      </div>
                    ))}
                    <p className="mt-4 text-xs text-[#909090]">Remember: these check results aren't final. Issues may come up in the future that impact your video.</p>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <h3 className="text-xl font-medium">Visibility</h3>
                    <p className="mt-1 text-[13px] text-[#606060]">Choose when to publish and who can see your video.</p>
                    <div className="mt-4 rounded-lg border border-black/[0.1] p-4">
                      <div className="text-sm font-medium">Save or publish</div>
                      <div className="mt-2 pl-1">
                        {(['private', 'unlisted', 'public'] as const).map((v) => (
                          <Radio key={v} name="vis" checked={!schedule && visibility === v} onChange={() => (setSchedule(false), setVisibility(v))} label={v[0].toUpperCase() + v.slice(1)} description={v === 'private' ? 'Only you and people that you choose can watch your video' : v === 'unlisted' ? 'Anyone with the video link can watch your video' : 'Everyone can watch your video'} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-black/[0.1] p-4">
                      <Radio name="vis" checked={schedule} onChange={() => setSchedule(true)} label="Schedule" description="Select a date to make your video public" />
                      {schedule && (
                        <div className="mt-3 flex gap-3 pl-8">
                          <input type="date" value={scheduleDate} min={toInputDate(new Date())} onChange={(e) => setScheduleDate(e.target.value)} className="h-10 rounded-lg border border-black/[0.2] px-3 text-sm" />
                          <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="h-10 rounded-lg border border-black/[0.2] px-3 text-sm" />
                          <span className="self-center text-xs text-[#606060]">Set as Premiere</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-[290px] shrink-0 max-md:hidden">
                <div className="overflow-hidden rounded-lg bg-[#f9f9f9]">
                  <div className="relative" style={{ aspectRatio: '16/9' }}>
                    {progress < 100 ? (
                      <div className="flex h-full flex-col items-center justify-center bg-[#1f1f1f] text-white">
                        <FileVideo size={32} className="opacity-70" />
                        <div className="mt-2 text-xs opacity-80">Uploading video…</div>
                      </div>
                    ) : (
                      <>
                        <Thumbnail spec={specFor(title || 'History', thumbVariant)} />
                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[11px] text-white">{formatDuration(duration)}</span>
                      </>
                    )}
                  </div>
                  <div className="p-3 text-[13px]">
                    <div className="text-xs text-[#606060]">Video link</div>
                    <div className="text-[#065fd4]">https://youtu.be/{file.name.length.toString(36)}xQ9pE{title.length}</div>
                    <div className="mt-3 text-xs text-[#606060]">Filename</div>
                    <div className="truncate">{file.name}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-black/[0.1] px-6 py-3">
              {progress < 100 ? (
                <span className="flex items-center gap-2 text-[13px] text-[#606060]">
                  <Upload size={18} /> Uploading {Math.floor(progress)}% … {Math.max(1, Math.ceil((100 - progress) / 12))} minutes left
                </span>
              ) : (
                <span className="flex items-center gap-2 text-[13px] text-[#606060]">
                  <CheckCircle2 size={18} className="text-[#2ba640]" /> Upload complete{checks === 'done' ? ' · Checks complete. No issues found.' : ' · Processing HD version…'}
                </span>
              )}
              <div className="h-1 w-24 overflow-hidden rounded bg-black/[0.08]">
                <div className="h-1 bg-[#065fd4] transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex-1" />
              {step > 0 && <Button variant="text" onClick={() => setStep(step - 1)}>Back</Button>}
              {step < 3 ? (
                <Button variant="primary" disabled={!titleValid} onClick={() => setStep(step + 1)}>Next</Button>
              ) : (
                <Button variant="primary" disabled={!titleValid || progress < 100} onClick={publish}>
                  {schedule ? 'Schedule' : visibility === 'public' ? 'Publish' : 'Save'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
