import { useRef, useState } from 'react';
import { Plus, Trash2, Upload, Wand2, Keyboard, MoreVertical, Check } from 'lucide-react';
import { useStudio } from '../../store/StudioContext';
import { SUBTITLE_LANGUAGE_OPTIONS, sampleCaptionLines, type SubtitleTrack } from '../../data/library';
import { Button, IconButton } from '../common/Button';
import { Modal, ConfirmDialog } from '../common/Modal';
import { MenuItem, Popover, useMenu } from '../common/Popover';
import { formatDate, formatDuration } from '../../lib/format';
import type { Video } from '../../data/types';

type Line = { start: number; end: number; text: string };

function parseSrt(text: string): Line[] {
  const toSec = (t: string) => {
    const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(t);
    return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000 : 0;
  };
  return text
    .replace(/\r/g, '')
    .split(/\n\n+/)
    .map((block) => {
      const lines = block.split('\n').filter(Boolean);
      const timeIdx = lines.findIndex((l) => l.includes('-->'));
      if (timeIdx < 0) return null;
      const [a, b] = lines[timeIdx].split('-->');
      return { start: toSec(a), end: toSec(b), text: lines.slice(timeIdx + 1).join(' ') };
    })
    .filter((x): x is Line => !!x && !!x.text);
}

function CaptionEditor({ open, onClose, video, track, onSave }: { open: boolean; onClose: () => void; video: Video; track: SubtitleTrack | null; onSave: (lines: Line[], publish: boolean) => void }) {
  const [lines, setLines] = useState<Line[]>(() => track?.lines ?? sampleCaptionLines(video.title, video.durationSec));
  const [prevTrack, setPrevTrack] = useState(track);
  if (track !== prevTrack) {
    setPrevTrack(track);
    setLines(track?.lines ?? sampleCaptionLines(video.title, video.durationSec));
  }
  const update = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={880}
      title={`${track?.language ?? 'Subtitles'} · ${video.title}`}
      footer={
        <>
          <span className="mr-auto text-xs text-[#606060]">{lines.length} captions</span>
          <Button variant="text" onClick={() => onSave(lines, false)}>Save draft</Button>
          <Button variant="primary" disabled={!lines.some((l) => l.text.trim())} onClick={() => onSave(lines, true)}>Publish</Button>
        </>
      }
    >
      <div className="flex gap-6 max-md:flex-col">
        <div className="min-w-0 flex-1">
          {lines.map((l, i) => (
            <div key={i} className="mb-2 flex gap-2 rounded-lg border border-black/[0.1] p-2 focus-within:border-[#065fd4]">
              <div className="flex w-[92px] shrink-0 flex-col gap-1 text-xs">
                <input value={formatDuration(l.start)} onChange={() => undefined} onBlur={(e) => { const [m, s] = e.target.value.split(':').map(Number); if (!isNaN(m) && !isNaN(s)) update(i, { start: m * 60 + s }); }} className="rounded bg-black/[0.04] px-2 py-1 tabular outline-none" aria-label="Start time" />
                <input value={formatDuration(l.end)} onChange={() => undefined} onBlur={(e) => { const [m, s] = e.target.value.split(':').map(Number); if (!isNaN(m) && !isNaN(s)) update(i, { end: m * 60 + s }); }} className="rounded bg-black/[0.04] px-2 py-1 tabular outline-none" aria-label="End time" />
              </div>
              <textarea value={l.text} onChange={(e) => update(i, { text: e.target.value })} rows={2} className="min-w-0 flex-1 resize-none text-sm outline-none" />
              <IconButton label="Delete caption" size={32} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
          <Button variant="tonal" icon={<Plus size={18} />} onClick={() => setLines((ls) => [...ls, { start: ls.at(-1)?.end ?? 0, end: (ls.at(-1)?.end ?? 0) + 3, text: '' }])}>
            Caption
          </Button>
        </div>
        <div className="w-[300px] shrink-0 max-md:w-full">
          <div className="relative flex aspect-video items-end justify-center overflow-hidden rounded-lg bg-black p-3">
            <span className="rounded bg-black/80 px-2 py-1 text-center text-sm text-white">{lines.find((l) => l.text)?.text ?? 'Caption preview'}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#606060]">Tip: keep each caption under 42 characters per line and 2 lines long. Timings use minutes:seconds.</p>
        </div>
      </div>
    </Modal>
  );
}

export function VideoSubtitles({ video }: { video: Video }) {
  const { subtitles, setSubtitles, toast } = useStudio();
  const tracks = subtitles(video.id);
  const addMenu = useMenu();
  const [editing, setEditing] = useState<SubtitleTrack | null>(null);
  const [methodFor, setMethodFor] = useState<SubtitleTrack | null>(null);
  const [toDelete, setToDelete] = useState<SubtitleTrack | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const available = SUBTITLE_LANGUAGE_OPTIONS.filter((l) => !tracks.some((t) => t.language === l));

  const save = (language: string, patch: Partial<SubtitleTrack>) => {
    const exists = tracks.some((t) => t.language === language);
    const next = exists ? tracks.map((t) => (t.language === language ? { ...t, ...patch, modifiedAt: Date.now() } : t)) : [...tracks, { language, kind: 'draft' as const, modifiedAt: Date.now(), ...patch }];
    setSubtitles(video.id, next);
  };

  return (
    <div>
      <div className="flex items-center px-6 py-4">
        <div className="flex-1 text-sm text-[#606060]">Subtitles and translated titles help international viewers find and watch your documentaries.</div>
        <Button variant="tonal" icon={<Plus size={18} />} ref={addMenu.ref} onClick={addMenu.toggle}>
          Add language
        </Button>
        <Popover anchor={addMenu.ref} open={addMenu.open} onClose={addMenu.close} align="right" width={240} className="max-h-[360px] overflow-y-auto">
          {available.map((l) => (
            <MenuItem key={l} onClick={() => { addMenu.close(); save(l, { kind: 'draft' }); toast(`${l} added`); }}>
              {l}
            </MenuItem>
          ))}
        </Popover>
      </div>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="h-12 border-y border-black/[0.1] text-xs text-[#606060]">
            <th className="pl-6 font-medium">Language</th>
            <th className="font-medium">Modified on</th>
            <th className="font-medium">Title & description</th>
            <th className="font-medium">Subtitles</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {tracks.map((t) => (
            <tr key={t.language} className="h-14 border-b border-black/[0.06] hover:bg-[#f9f9f9]">
              <td className="pl-6">
                {t.language}
                {t.kind === 'auto' && <div className="text-xs text-[#606060]">Automatic</div>}
              </td>
              <td>{formatDate(t.modifiedAt)}</td>
              <td>
                {t.titleAndDescription ? (
                  <span className="flex items-center gap-1"><Check size={16} className="text-[#2ba640]" /> Published</span>
                ) : (
                  <button className="font-medium text-[#065fd4] hover:underline" onClick={() => { save(t.language, { titleAndDescription: true }); toast('Translated title and description published'); }}>
                    Add
                  </button>
                )}
              </td>
              <td>
                {t.kind === 'auto' ? (
                  <button className="font-medium text-[#065fd4] hover:underline" onClick={() => setEditing({ ...t, lines: sampleCaptionLines(video.title, video.durationSec) })}>
                    Duplicate and edit
                  </button>
                ) : t.kind === 'published' ? (
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><Check size={16} className="text-[#2ba640]" /> Published</span>
                    <button className="font-medium text-[#065fd4] hover:underline" onClick={() => setEditing(t)}>Edit</button>
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    {t.lines ? <span className="rounded bg-[#fef7e0] px-1.5 text-xs text-[#8a6100]">Draft</span> : null}
                    <button className="font-medium text-[#065fd4] hover:underline" onClick={() => (t.lines ? setEditing(t) : setMethodFor(t))}>
                      {t.lines ? 'Edit draft' : 'Add'}
                    </button>
                  </span>
                )}
              </td>
              <td>
                {t.kind !== 'auto' && (
                  <IconButton label="Delete" size={32} onClick={() => setToDelete(t)}>
                    <MoreVertical size={16} />
                  </IconButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tracks.length === 0 && <div className="py-12 text-center text-sm text-[#606060]">No subtitles yet. Add a language to get started.</div>}

      <Modal open={!!methodFor} onClose={() => setMethodFor(null)} title={`Add ${methodFor?.language} subtitles`} width={520}>
        {[
          { icon: <Upload size={22} />, title: 'Upload file', body: 'Upload an .srt or .vtt subtitle file', on: () => fileRef.current?.click() },
          { icon: <Wand2 size={22} />, title: 'Auto-sync', body: 'Type or paste a transcript and timings will be set automatically', on: () => methodFor && (setEditing({ ...methodFor, lines: sampleCaptionLines(video.title, video.durationSec) }), setMethodFor(null)) },
          { icon: <Keyboard size={22} />, title: 'Type manually', body: 'Type and set timings as you watch the video', on: () => methodFor && (setEditing({ ...methodFor, lines: [{ start: 0, end: 3, text: '' }] }), setMethodFor(null)) },
        ].map((o) => (
          <button key={o.title} onClick={o.on} className="mb-2 flex w-full items-center gap-4 rounded-lg border border-black/[0.1] p-4 text-left hover:bg-[#f9f9f9]">
            <span className="text-[#606060]">{o.icon}</span>
            <span>
              <span className="block text-sm font-medium">{o.title}</span>
              <span className="block text-xs text-[#606060]">{o.body}</span>
            </span>
          </button>
        ))}
        <input
          ref={fileRef}
          type="file"
          accept=".srt,.vtt,.txt"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f || !methodFor) return;
            const lines = parseSrt(await f.text());
            setEditing({ ...methodFor, lines: lines.length ? lines : sampleCaptionLines(video.title, video.durationSec) });
            setMethodFor(null);
            toast(lines.length ? `Imported ${lines.length} captions from ${f.name}` : 'No captions found in that file – started a new track');
            e.target.value = '';
          }}
        />
      </Modal>

      {editing && (
        <CaptionEditor
          open={!!editing}
          onClose={() => setEditing(null)}
          video={video}
          track={editing}
          onSave={(lines, publish) => {
            const lang = editing.kind === 'auto' ? 'English (United Kingdom)' : editing.language;
            save(lang, { lines, kind: publish ? 'published' : 'draft' });
            toast(publish ? `${lang} subtitles published` : 'Draft saved');
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete subtitles?" body={`The ${toDelete?.language} subtitles and translations for this video will be deleted.`} confirmLabel="Delete" onConfirm={() => { if (toDelete) { setSubtitles(video.id, tracks.filter((t) => t.language !== toDelete.language)); toast('Subtitles deleted'); } }} />
    </div>
  );
}
