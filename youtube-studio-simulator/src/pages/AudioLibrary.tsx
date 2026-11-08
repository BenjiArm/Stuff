import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Pause, Play, Search, Star, X, Volume2, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { Tabs, Chip } from '../components/common/Controls';
import { useStudio } from '../store/StudioContext';
import { AUDIO_TRACKS, MUSIC_GENRES, MUSIC_MOODS, type AudioTrack } from '../data/library';
import { formatDate, formatDuration } from '../lib/format';
import { MenuItem, Popover, useMenu } from '../components/common/Popover';
import { IconButton } from '../components/common/Button';
import { playTrack, renderTrackWav, setVolume, stopTrack } from '../lib/synth';
import { Tooltip } from '../components/common/Tooltip';
import { EmptyArt, EmptyState } from '../components/common/Card';

function FilterChip({ label, options, value, onChange }: { label: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  const menu = useMenu<HTMLSpanElement>();
  return (
    <>
      <span ref={menu.ref}>
        <Chip active={!!value} onClick={menu.toggle} onRemove={value ? () => onChange(null) : undefined}>
          {value ? `${label}: ${value}` : label}
        </Chip>
      </span>
      <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} width={220} className="max-h-[320px] overflow-y-auto">
        {options.map((o) => (
          <MenuItem key={o} selected={o === value} onClick={() => (onChange(o), menu.close())}>
            {o}
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}

export function AudioLibraryPage() {
  const { tab = 'music' } = useParams();
  const navigate = useNavigate();
  const { starredTracks, toggleStar, toast } = useStudio();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [licence, setLicence] = useState<string | null>(null);
  const [playing, setPlaying] = useState<AudioTrack | null>(null);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [vol, setVol] = useState(0.6);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sort, setSort] = useState<'added' | 'title' | 'duration'>('added');
  const tick = useRef<number>();

  useEffect(() => () => stopTrack(), []);
  useEffect(() => {
    window.clearInterval(tick.current);
    if (playing && !paused) {
      tick.current = window.setInterval(() => {
        setElapsed((e) => {
          if (e + 0.25 >= playing.durationSec) {
            stopTrack();
            setPaused(true);
            return playing.durationSec;
          }
          return e + 0.25;
        });
      }, 250);
    }
    return () => window.clearInterval(tick.current);
  }, [playing, paused]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIO_TRACKS.filter((t) => (tab === 'sfx' ? t.kind === 'sfx' : tab === 'starred' ? starredTracks.includes(t.id) : t.kind === 'music'))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q) || t.mood.toLowerCase().includes(q))
      .filter((t) => !genre || t.genre === genre)
      .filter((t) => !mood || t.mood === mood)
      .filter((t) => !licence || (licence === 'Attribution not required' ? t.licence === 'none' : t.licence === 'attribution'))
      .filter((t) => !duration || (duration === '0–1 min' ? t.durationSec <= 60 : duration === '1–3 min' ? t.durationSec > 60 && t.durationSec <= 180 : t.durationSec > 180))
      .sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title) : sort === 'duration' ? b.durationSec - a.durationSec : b.addedAt - a.addedAt));
  }, [tab, query, genre, mood, licence, duration, starredTracks, sort]);

  const toggle = (t: AudioTrack) => {
    if (playing?.id === t.id && !paused) {
      stopTrack();
      setPaused(true);
      return;
    }
    if (playing?.id === t.id && paused) {
      playTrack(t, elapsed >= t.durationSec ? 0 : elapsed);
      if (elapsed >= t.durationSec) setElapsed(0);
      setPaused(false);
      return;
    }
    playTrack(t);
    setVolume(vol);
    setPlaying(t);
    setPaused(false);
    setElapsed(0);
  };

  const download = async (t: AudioTrack) => {
    setDownloading(t.id);
    try {
      const blob = await renderTrackWav(t, 60);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${t.title} - ${t.artist}.wav`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast(t.durationSec > 60 ? 'Downloaded a 60-second WAV preview' : 'Download complete');
    } catch {
      toast('Audio rendering isn\'t supported in this browser');
    } finally {
      setDownloading(null);
    }
  };

  const isMusic = tab !== 'sfx';

  return (
    <div className="pb-24">
      <PageHeader title="Audio Library" />
      <Tabs
        className="mt-2 px-5"
        tabs={[
          { value: 'music', label: 'Free music' },
          { value: 'sfx', label: 'Sound effects' },
          { value: 'starred', label: 'Starred', badge: starredTracks.length },
        ]}
        value={tab}
        onChange={(t) => navigate(`/audio-library/${t}`)}
      />
      <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.1] px-6 py-3">
        <div className="flex h-9 w-[300px] items-center rounded-full border border-black/[0.15] px-3 focus-within:border-[#065fd4]">
          <Search size={18} className="text-[#606060]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search or filter library" className="ml-2 flex-1 bg-transparent text-sm outline-none" />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
        </div>
        {isMusic && <FilterChip label="Genre" options={MUSIC_GENRES} value={genre} onChange={setGenre} />}
        {isMusic && <FilterChip label="Mood" options={MUSIC_MOODS} value={mood} onChange={setMood} />}
        <FilterChip label="Duration" options={['0–1 min', '1–3 min', '3+ min']} value={duration} onChange={setDuration} />
        {isMusic && <FilterChip label="Licence type" options={['Attribution not required', 'Attribution required']} value={licence} onChange={setLicence} />}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[13px]">
          <thead>
            <tr className="h-12 border-b border-black/[0.1] text-xs text-[#606060]">
              <th className="w-16" />
              <th className="font-medium"><button className={sort === 'title' ? 'text-[#0f0f0f]' : ''} onClick={() => setSort('title')}>Track title</button></th>
              <th className="w-12" />
              <th className="font-medium">{isMusic ? 'Genre' : 'Category'}</th>
              {isMusic && <th className="font-medium">Mood</th>}
              <th className="font-medium">Artist name</th>
              <th className="font-medium"><button className={sort === 'duration' ? 'text-[#0f0f0f]' : ''} onClick={() => setSort('duration')}>Duration</button></th>
              {isMusic && <th className="font-medium">Licence type</th>}
              <th className="font-medium"><button className={sort === 'added' ? 'text-[#0f0f0f]' : ''} onClick={() => setSort('added')}>Added</button></th>
              <th className="w-[120px]" />
            </tr>
          </thead>
          <tbody>
            {list.map((t) => {
              const isPlaying = playing?.id === t.id && !paused;
              const starred = starredTracks.includes(t.id);
              return (
                <tr key={t.id} className={`group h-14 border-b border-black/[0.06] ${playing?.id === t.id ? 'bg-[#f2f2f2]' : 'hover:bg-[#f9f9f9]'}`}>
                  <td className="pl-4">
                    <IconButton label={isPlaying ? 'Pause' : 'Play'} size={36} onClick={() => toggle(t)}>
                      {isPlaying ? <Pause size={20} fill="#0f0f0f" /> : <Play size={20} fill="#0f0f0f" />}
                    </IconButton>
                  </td>
                  <td className="font-medium">{t.title}</td>
                  <td>
                    <Tooltip content={starred ? 'Remove from starred' : 'Add to starred'}>
                      <IconButton label="Star" size={32} onClick={() => (toggleStar(t.id), toast(starred ? 'Removed from starred' : 'Added to starred'))}>
                        <Star size={18} className={starred ? 'text-[#0f0f0f]' : 'text-[#909090]'} fill={starred ? '#0f0f0f' : 'none'} />
                      </IconButton>
                    </Tooltip>
                  </td>
                  <td>{t.genre}</td>
                  {isMusic && <td>{t.mood}</td>}
                  <td>{t.artist}</td>
                  <td className="tabular">{formatDuration(t.durationSec)}</td>
                  {isMusic && (
                    <td>
                      {t.licence === 'attribution' ? (
                        <Tooltip content={`Attribution required: credit “${t.title} by ${t.artist}” in your description`}>
                          <span className="rounded border border-black/[0.2] px-1.5 py-0.5 text-[11px] font-medium">CC BY</span>
                        </Tooltip>
                      ) : (
                        <span className="text-[#606060]">—</span>
                      )}
                    </td>
                  )}
                  <td>{formatDate(t.addedAt)}</td>
                  <td className="pr-4 text-right">
                    <button onClick={() => download(t)} disabled={downloading === t.id} className="invisible inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#065fd4] hover:bg-[#def1ff] group-hover:visible disabled:visible">
                      {downloading === t.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      Download
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <EmptyState art={<EmptyArt kind="search" />} title={tab === 'starred' ? 'No starred tracks yet' : 'No tracks match your filters'} body={tab === 'starred' ? 'Star tracks to keep them handy for your next documentary.' : 'Try a different search or remove a filter.'} />}
      </div>

      {playing && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex h-[72px] animate-slide-up items-center gap-4 border-t border-black/[0.1] bg-white px-6 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
          <IconButton label={paused ? 'Play' : 'Pause'} onClick={() => toggle(playing)}>
            {paused ? <Play size={22} fill="#0f0f0f" /> : <Pause size={22} fill="#0f0f0f" />}
          </IconButton>
          <div className="w-[240px] min-w-0">
            <div className="truncate text-sm font-medium">{playing.title}</div>
            <div className="truncate text-xs text-[#606060]">{playing.artist}</div>
          </div>
          <span className="tabular w-10 text-right text-xs text-[#606060]">{formatDuration(elapsed)}</span>
          <input
            type="range"
            className="studio-range flex-1"
            min={0}
            max={playing.durationSec}
            step={1}
            value={elapsed}
            onChange={(e) => {
              const v = Number(e.target.value);
              setElapsed(v);
              if (!paused) playTrack(playing, v);
            }}
          />
          <span className="tabular w-10 text-xs text-[#606060]">{formatDuration(playing.durationSec)}</span>
          <Volume2 size={20} className="text-[#606060]" />
          <input type="range" className="studio-range w-24" min={0} max={1} step={0.05} value={vol} onChange={(e) => (setVol(Number(e.target.value)), setVolume(Number(e.target.value)))} />
          <IconButton label="Download" onClick={() => download(playing)}>
            <Download size={20} />
          </IconButton>
          <IconButton label="Close player" onClick={() => (stopTrack(), setPlaying(null))}>
            <X size={20} />
          </IconButton>
        </div>
      )}
    </div>
  );
}
