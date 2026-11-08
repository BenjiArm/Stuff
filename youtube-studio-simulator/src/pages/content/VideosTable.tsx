import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, MoreVertical, Pencil, BarChart3, MessageSquare, Youtube, Link2, Download, Trash2, Megaphone, X, ListPlus } from 'lucide-react';
import type { Video, VideoKind } from '../../data/types';
import { useStudio } from '../../store/StudioContext';
import { VideoThumb } from '../../components/common/VideoThumb';
import { Checkbox, Chip } from '../../components/common/Controls';
import { MenuDivider, MenuItem, Popover, useMenu } from '../../components/common/Popover';
import { IconButton, Button } from '../../components/common/Button';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { MonetisationCell, VisibilityCell } from '../../components/content/VideoControls';
import { Tooltip } from '../../components/common/Tooltip';
import { formatDate, formatInt } from '../../lib/format';
import { videoLifetime, visibilityLabel, monetisationLabel } from '../../lib/videoStats';
import { EmptyArt, EmptyState } from '../../components/common/Card';

type SortKey = 'date' | 'views' | 'comments' | 'likes';
type FilterField = 'title' | 'description' | 'visibility' | 'monetisation' | 'restriction' | 'views' | 'madeForKids';
interface FilterChip {
  field: FilterField;
  value: string;
  label: string;
}

const FIELD_LABELS: Record<FilterField, string> = {
  title: 'Title',
  description: 'Description',
  visibility: 'Visibility',
  monetisation: 'Monetisation',
  restriction: 'Restrictions',
  views: 'Views',
  madeForKids: 'Made for kids',
};

const FIELD_OPTIONS: Partial<Record<FilterField, { value: string; label: string }[]>> = {
  visibility: (['public', 'unlisted', 'private', 'scheduled', 'draft'] as const).map((v) => ({ value: v, label: visibilityLabel[v] })),
  monetisation: (['on', 'limited', 'off', 'claimed'] as const).map((v) => ({ value: v, label: monetisationLabel[v] })),
  restriction: [
    { value: 'none', label: 'None' },
    { value: 'copyright', label: 'Copyright' },
    { value: 'age', label: 'Age restriction' },
    { value: 'kids', label: 'Made for kids' },
  ],
  madeForKids: [
    { value: 'yes', label: 'Made for kids' },
    { value: 'no', label: 'Not made for kids' },
  ],
};

function matches(v: Video, f: FilterChip) {
  switch (f.field) {
    case 'title':
      return v.title.toLowerCase().includes(f.value.toLowerCase());
    case 'description':
      return v.description.toLowerCase().includes(f.value.toLowerCase());
    case 'visibility':
      return v.visibility === f.value;
    case 'monetisation':
      return v.monetisation === f.value;
    case 'restriction':
      return v.restriction === f.value || (f.value === 'age' && v.ageRestricted) || (f.value === 'kids' && v.madeForKids);
    case 'views': {
      const [op, n] = f.value.split(':');
      const views = videoLifetime(v).views;
      return op === 'gte' ? views >= Number(n) : views <= Number(n);
    }
    case 'madeForKids':
      return f.value === 'yes' ? v.madeForKids : !v.madeForKids;
  }
}

function FilterButton({ onAdd }: { onAdd: (f: FilterChip) => void }) {
  const menu = useMenu<HTMLDivElement>();
  const [field, setField] = useState<FilterField | null>(null);
  const [text, setText] = useState('');
  const [op, setOp] = useState<'gte' | 'lte'>('gte');
  const [selected, setSelected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const reset = () => {
    setField(null);
    setText('');
    setSelected([]);
  };
  const apply = () => {
    if (!field) return;
    if (field === 'title' || field === 'description') {
      if (text.trim()) onAdd({ field, value: text.trim(), label: `${FIELD_LABELS[field]}: ${text.trim()}` });
    } else if (field === 'views') {
      const n = Number(text.replace(/[^0-9]/g, ''));
      if (n >= 0 && text) onAdd({ field, value: `${op}:${n}`, label: `Views ${op === 'gte' ? '≥' : '≤'} ${formatInt(n)}` });
    } else {
      selected.forEach((s) => {
        const o = FIELD_OPTIONS[field]?.find((x) => x.value === s);
        if (o) onAdd({ field, value: s, label: `${FIELD_LABELS[field]}: ${o.label}` });
      });
    }
    reset();
    menu.close();
  };
  return (
    <>
      <div ref={menu.ref} className="flex flex-1 items-center">
        <IconButton label="Filter" onClick={() => (reset(), menu.toggle())}>
          <Filter size={20} strokeWidth={1.7} />
        </IconButton>
        <input
          ref={inputRef}
          value={field ? '' : text}
          onFocus={() => !menu.open && (reset(), menu.setOpen(true))}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              onAdd({ field: 'title', value: text.trim(), label: `Title: ${text.trim()}` });
              setText('');
              menu.close();
            }
          }}
          placeholder="Filter"
          className="h-10 min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-[#606060]"
        />
      </div>
      <Popover anchor={menu.ref} open={menu.open} onClose={() => (menu.close(), reset())} width={field ? 300 : 240}>
        {!field &&
          (Object.keys(FIELD_LABELS) as FilterField[]).map((f) => (
            <MenuItem key={f} onClick={() => setField(f)}>
              {FIELD_LABELS[f]}
            </MenuItem>
          ))}
        {field && (
          <div className="px-4 pb-2 pt-1">
            <div className="mb-3 text-[15px] font-medium">{FIELD_LABELS[field]}</div>
            {(field === 'title' || field === 'description') && (
              <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder="Value" className="h-10 w-full rounded-lg border border-black/[0.2] px-3 text-sm outline-none focus:border-[#065fd4]" />
            )}
            {field === 'views' && (
              <div className="flex gap-2">
                <select value={op} onChange={(e) => setOp(e.target.value as 'gte' | 'lte')} className="h-10 rounded-lg border border-black/[0.2] px-2 text-sm">
                  <option value="gte">≥</option>
                  <option value="lte">≤</option>
                </select>
                <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder="Number of views" inputMode="numeric" className="h-10 min-w-0 flex-1 rounded-lg border border-black/[0.2] px-3 text-sm outline-none focus:border-[#065fd4]" />
              </div>
            )}
            {FIELD_OPTIONS[field] && (
              <div className="flex flex-col gap-2">
                {FIELD_OPTIONS[field]!.map((o) => (
                  <Checkbox key={o.value} checked={selected.includes(o.value)} onChange={(c) => setSelected((s) => (c ? [...s, o.value] : s.filter((x) => x !== o.value)))} label={o.label} />
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="text" onClick={reset}>Back</Button>
              <Button variant="primary" onClick={apply}>Apply</Button>
            </div>
          </div>
        )}
      </Popover>
    </>
  );
}

function RowMenu({ video, onDelete }: { video: Video; onDelete: () => void }) {
  const menu = useMenu();
  const navigate = useNavigate();
  const { toast } = useStudio();
  return (
    <>
      <Tooltip content="Options">
        <IconButton label="Options" size={36} ref={menu.ref} onClick={(e) => (e.stopPropagation(), menu.toggle())}>
          <MoreVertical size={20} strokeWidth={1.7} />
        </IconButton>
      </Tooltip>
      <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} width={260}>
        <div onClick={(e) => e.stopPropagation()}>
          <MenuItem icon={<Pencil size={20} strokeWidth={1.6} />} onClick={() => (menu.close(), navigate(`/video/${video.id}/edit`))}>
            Edit title and description
          </MenuItem>
          <MenuItem
            icon={<Link2 size={20} strokeWidth={1.6} />}
            onClick={() => {
              menu.close();
              const link = `https://youtu.be/${video.id.slice(0, 11)}`;
              navigator.clipboard?.writeText(link).catch(() => undefined);
              toast('Link copied to clipboard');
            }}
          >
            Get shareable link
          </MenuItem>
          <MenuItem icon={<Megaphone size={20} strokeWidth={1.6} />} onClick={() => (menu.close(), toast('Promotions aren\'t available in the simulator'))}>
            Promote
          </MenuItem>
          <MenuItem
            icon={<Download size={20} strokeWidth={1.6} />}
            onClick={() => {
              menu.close();
              const blob = new Blob([`Title: ${video.title}\n\n${video.description}\n\nTags: ${video.tags.join(', ')}`], { type: 'text/plain' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `${video.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 60)}_metadata.txt`;
              a.click();
              URL.revokeObjectURL(a.href);
              toast('Downloaded video metadata (simulated video file)');
            }}
          >
            Download
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<Trash2 size={20} strokeWidth={1.6} />} onClick={() => (menu.close(), onDelete())}>
            Delete forever
          </MenuItem>
        </div>
      </Popover>
    </>
  );
}

function BulkEditMenu({ ids, onDone }: { ids: string[]; onDone: () => void }) {
  const menu = useMenu();
  const { updateVideo, toast, playlists, upsertPlaylist } = useStudio();
  const [mode, setMode] = useState<'root' | 'visibility' | 'monetisation' | 'comments' | 'playlist'>('root');
  const apply = (patch: Partial<Video>, msg: string) => {
    ids.forEach((id) => updateVideo(id, patch));
    toast(msg);
    menu.close();
    setMode('root');
    onDone();
  };
  return (
    <>
      <button ref={menu.ref} onClick={() => (setMode('root'), menu.toggle())} className="flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-white hover:bg-white/10">
        Edit <ChevronDown size={18} />
      </button>
      <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} width={240}>
        {mode === 'root' && (
          <>
            <MenuItem onClick={() => setMode('visibility')} trailing={<ChevronRight size={16} />}>Visibility</MenuItem>
            <MenuItem onClick={() => setMode('monetisation')} trailing={<ChevronRight size={16} />}>Monetisation</MenuItem>
            <MenuItem onClick={() => setMode('comments')} trailing={<ChevronRight size={16} />}>Comments</MenuItem>
            <MenuItem onClick={() => setMode('playlist')} trailing={<ChevronRight size={16} />}>Add to playlist</MenuItem>
          </>
        )}
        {mode === 'visibility' &&
          (['public', 'unlisted', 'private'] as const).map((v) => (
            <MenuItem key={v} onClick={() => apply({ visibility: v }, `${ids.length} video${ids.length > 1 ? 's' : ''} set to ${visibilityLabel[v].toLowerCase()}`)}>
              {visibilityLabel[v]}
            </MenuItem>
          ))}
        {mode === 'monetisation' && (
          <>
            <MenuItem onClick={() => apply({ monetisation: 'on' }, 'Monetisation turned on')}>On</MenuItem>
            <MenuItem onClick={() => apply({ monetisation: 'off' }, 'Monetisation turned off')}>Off</MenuItem>
          </>
        )}
        {mode === 'comments' && (
          <>
            <MenuItem onClick={() => apply({ commentsMode: 'on' }, 'Comments turned on')}>Allow all comments</MenuItem>
            <MenuItem onClick={() => apply({ commentsMode: 'hold' }, 'Comments will be held for review')}>Hold all for review</MenuItem>
            <MenuItem onClick={() => apply({ commentsMode: 'off' }, 'Comments turned off')}>Disable comments</MenuItem>
          </>
        )}
        {mode === 'playlist' &&
          playlists.map((p) => (
            <MenuItem
              key={p.id}
              icon={<ListPlus size={18} />}
              onClick={() => {
                upsertPlaylist({ ...p, videoIds: Array.from(new Set([...p.videoIds, ...ids])), updatedAt: Date.now() });
                toast(`Added to “${p.title}”`);
                menu.close();
                onDone();
              }}
            >
              {p.title}
            </MenuItem>
          ))}
      </Popover>
    </>
  );
}

export function VideosTable({ kind }: { kind: VideoKind }) {
  const { videos, deleteVideos, restoreVideos, toast } = useStudio();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(30);
  const [selected, setSelected] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const [ack, setAck] = useState(false);
  const perPageMenu = useMenu();
  const [descFor, setDescFor] = useState<Video | null>(null);

  useEffect(() => {
    const q = params.get('q');
    if (q) {
      setFilters([{ field: 'title', value: q, label: `Title: ${q}` }]);
      params.delete('q');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    setPage(0);
    setSelected([]);
  }, [filters, kind, sort, perPage]);

  const list = useMemo(() => {
    const base = videos.filter((v) => v.kind === kind && filters.every((f) => filters.filter((x) => x.field === f.field).some((x) => matches(v, x))));
    const stat = (v: Video) => videoLifetime(v);
    const dateOf = (v: Video) => (v.visibility === 'scheduled' ? v.scheduledFor ?? v.publishedAt : v.publishedAt);
    const val = (v: Video) => {
      switch (sort.key) {
        case 'date':
          return v.visibility === 'draft' ? Number.MAX_SAFE_INTEGER : dateOf(v);
        case 'views':
          return stat(v).views;
        case 'comments':
          return stat(v).comments;
        case 'likes':
          return stat(v).likes;
      }
    };
    return [...base].sort((a, b) => (sort.dir === 'desc' ? val(b) - val(a) : val(a) - val(b)));
  }, [videos, kind, filters, sort]);

  const pageItems = list.slice(page * perPage, page * perPage + perPage);
  const allOnPage = pageItems.length > 0 && pageItems.every((v) => selected.includes(v.id));
  const someOnPage = pageItems.some((v) => selected.includes(v.id));

  const confirmDelete = () => {
    if (!toDelete) return;
    const ids = toDelete;
    deleteVideos(ids);
    setSelected([]);
    toast(`${ids.length === 1 ? 'Video' : `${ids.length} videos`} deleted`, 'Undo', () => restoreVideos(ids));
  };

  const SortHeader = ({ k, label, className = '' }: { k: SortKey; label: string; className?: string }) => (
    <button
      onClick={() => setSort((s) => ({ key: k, dir: s.key === k && s.dir === 'desc' ? 'asc' : 'desc' }))}
      className={`flex items-center gap-1 hover:text-[#0f0f0f] ${sort.key === k ? 'text-[#0f0f0f]' : ''} ${className}`}
    >
      {sort.key === k && (sort.dir === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
      {label}
    </button>
  );

  return (
    <div>
      {selected.length > 0 ? (
        <div className="flex h-14 items-center gap-2 bg-[#0f0f0f] px-4 text-white">
          <span className="px-2 text-sm font-medium">{selected.length} selected</span>
          <div className="mx-2 h-6 w-px bg-white/30" />
          <BulkEditMenu ids={selected} onDone={() => setSelected([])} />
          <button onClick={() => setToDelete(selected)} className="flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-white/10">
            <Trash2 size={18} /> Delete forever
          </button>
          <div className="flex-1" />
          {selected.length < list.length && (
            <button onClick={() => setSelected(list.map((v) => v.id))} className="h-9 rounded-full px-3 text-sm font-medium text-[#3ea6ff] hover:bg-white/10">
              Select all {list.length}
            </button>
          )}
          <IconButton label="Clear selection" className="text-white hover:bg-white/10" onClick={() => setSelected([])}>
            <X size={20} className="text-white" />
          </IconButton>
        </div>
      ) : (
        <div className="flex min-h-[56px] flex-wrap items-center gap-2 border-b border-black/[0.1] px-4 py-2">
          {filters.map((f, i) => (
            <Chip key={i} onRemove={() => setFilters((fs) => fs.filter((_, j) => j !== i))}>
              {f.label}
            </Chip>
          ))}
          <FilterButton onAdd={(f) => setFilters((fs) => [...fs.filter((x) => !(x.field === f.field && x.value === f.value)), f])} />
          {filters.length > 0 && (
            <button onClick={() => setFilters([])} className="text-sm font-medium text-[#065fd4] hover:underline">
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="h-12 border-b border-black/[0.1] text-xs font-medium text-[#606060]">
              <th className="w-[56px] pl-6">
                <Checkbox
                  checked={allOnPage}
                  indeterminate={!allOnPage && someOnPage}
                  onChange={(c) => setSelected((s) => (c ? Array.from(new Set([...s, ...pageItems.map((v) => v.id)])) : s.filter((id) => !pageItems.some((v) => v.id === id))))}
                />
              </th>
              <th className="min-w-[420px] pl-2 font-medium">{kind === 'short' ? 'Short' : 'Video'}</th>
              <th className="w-[130px] font-medium">Visibility</th>
              <th className="w-[130px] font-medium">Monetisation</th>
              <th className="w-[120px] font-medium">Restrictions</th>
              <th className="w-[120px] font-medium">
                <SortHeader k="date" label="Date" />
              </th>
              <th className="w-[90px] font-medium">
                <SortHeader k="views" label="Views" className="ml-auto" />
              </th>
              <th className="w-[100px] font-medium">
                <SortHeader k="comments" label="Comments" className="ml-auto" />
              </th>
              <th className="w-[150px] pr-6 font-medium">
                <SortHeader k="likes" label="Likes (vs. dislikes)" className="ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((v) => {
              const st = videoLifetime(v);
              const likePct = st.likes + st.dislikes ? (st.likes / (st.likes + st.dislikes)) * 100 : 0;
              const isSel = selected.includes(v.id);
              const firstLine = v.description.split('\n')[0];
              return (
                <tr key={v.id} className={`group border-b border-black/[0.1] transition-colors ${isSel ? 'bg-[#f2f2f2]' : 'hover:bg-[#f9f9f9]'}`}>
                  <td className="pl-6 align-top pt-4">
                    <Checkbox checked={isSel} onChange={(c) => setSelected((s) => (c ? [...s, v.id] : s.filter((x) => x !== v.id)))} />
                  </td>
                  <td className="py-3 pl-2 pr-4">
                    <div className="flex gap-4">
                      <button onClick={() => navigate(`/video/${v.id}/edit`)} className="shrink-0">
                        <VideoThumb video={v} width={120} />
                      </button>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <button onClick={() => navigate(`/video/${v.id}/edit`)} className="line-clamp-2 text-left text-[13px] leading-[18px] text-[#0f0f0f] hover:underline">
                          {v.title}
                        </button>
                        <div className="relative mt-1 h-9">
                          <button onClick={() => setDescFor(v)} className="line-clamp-2 text-left text-xs leading-[18px] text-[#606060] group-hover:invisible">
                            {v.visibility === 'draft' ? 'Draft · Upload complete. Finish editing to publish.' : firstLine || 'Add description'}
                          </button>
                          <div className="invisible absolute -left-2 top-0 flex items-center gap-0.5 group-hover:visible">
                            <Tooltip content="Details"><IconButton label="Details" size={36} onClick={() => navigate(`/video/${v.id}/edit`)}><Pencil size={19} strokeWidth={1.6} /></IconButton></Tooltip>
                            <Tooltip content="Analytics"><IconButton label="Analytics" size={36} onClick={() => navigate(`/video/${v.id}/analytics`)}><BarChart3 size={19} strokeWidth={1.6} /></IconButton></Tooltip>
                            <Tooltip content="Comments"><IconButton label="Comments" size={36} onClick={() => navigate(`/video/${v.id}/comments`)}><MessageSquare size={19} strokeWidth={1.6} /></IconButton></Tooltip>
                            <Tooltip content="View on YouTube"><IconButton label="View on YouTube" size={36} onClick={() => toast('Watch page preview is not part of the simulator')}><Youtube size={19} strokeWidth={1.6} /></IconButton></Tooltip>
                            <RowMenu video={v} onDelete={() => setToDelete([v.id])} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="align-top pt-3">
                    <VisibilityCell video={v} />
                  </td>
                  <td className="align-top pt-3">
                    <MonetisationCell video={v} />
                  </td>
                  <td className="align-top pt-4 text-[13px]">
                    {v.restriction === 'copyright' ? (
                      <button onClick={() => navigate(`/video/${v.id}/copyright`)} className="text-[#0f0f0f] underline decoration-dotted underline-offset-2 hover:text-[#065fd4]">Copyright</button>
                    ) : v.ageRestricted ? (
                      'Age restriction'
                    ) : v.madeForKids ? (
                      'Made for kids'
                    ) : (
                      <span className="text-[#606060]">None</span>
                    )}
                  </td>
                  <td className="align-top pt-4 text-[13px] leading-[18px]">
                    {v.visibility === 'draft' ? (
                      <>
                        <div className="text-[#606060]">—</div>
                        <button onClick={() => navigate(`/video/${v.id}/edit`)} className="text-xs font-medium text-[#065fd4]">Edit draft</button>
                      </>
                    ) : (
                      <>
                        <div>{formatDate(v.visibility === 'scheduled' ? v.scheduledFor ?? v.publishedAt : v.publishedAt)}</div>
                        <div className="text-xs text-[#606060]">{v.visibility === 'scheduled' ? 'Scheduled' : v.visibility === 'public' ? 'Published' : 'Uploaded'}</div>
                      </>
                    )}
                  </td>
                  <td className="tabular align-top pt-4 text-right text-[13px]">{v.visibility === 'draft' || v.visibility === 'scheduled' ? '—' : formatInt(st.views)}</td>
                  <td className="tabular align-top pt-4 text-right text-[13px]">{v.visibility === 'draft' || v.visibility === 'scheduled' ? '—' : formatInt(st.comments)}</td>
                  <td className="align-top pr-6 pt-4 text-right text-[13px]">
                    {st.likes > 0 ? (
                      <div className="ml-auto w-[110px]">
                        <div className="tabular">{likePct.toFixed(1)}%</div>
                        <div className="text-xs text-[#606060]">{formatInt(st.likes)} likes</div>
                        <div className="mt-1 h-0.5 w-full bg-black/[0.15]">
                          <div className="h-0.5 bg-[#606060]" style={{ width: `${likePct}%` }} />
                        </div>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <EmptyState art={<EmptyArt kind="search" />} title="No content matches these filters" body="Try removing some filters to see more of your videos." action={<Button variant="tonal" onClick={() => setFilters([])}>Clear filters</Button>} />
        )}
      </div>

      <div className="flex h-14 items-center justify-end gap-4 px-6 text-xs text-[#606060]">
        <span>Rows per page:</span>
        <button ref={perPageMenu.ref} onClick={perPageMenu.toggle} className="flex items-center gap-1 rounded px-2 py-1 text-[#0f0f0f] hover:bg-black/[0.05]">
          {perPage} <ChevronDown size={16} />
        </button>
        <Popover anchor={perPageMenu.ref} open={perPageMenu.open} onClose={perPageMenu.close} width={100}>
          {[10, 30, 50].map((n) => (
            <MenuItem key={n} selected={n === perPage} onClick={() => (setPerPage(n), perPageMenu.close())}>
              {n}
            </MenuItem>
          ))}
        </Popover>
        <span className="tabular">
          {list.length ? page * perPage + 1 : 0}–{Math.min(list.length, (page + 1) * perPage)} of {list.length}
        </span>
        <div className="flex">
          <IconButton label="First page" size={36} disabled={page === 0} onClick={() => setPage(0)}><ChevronsLeft size={20} /></IconButton>
          <IconButton label="Previous page" size={36} disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={20} /></IconButton>
          <IconButton label="Next page" size={36} disabled={(page + 1) * perPage >= list.length} onClick={() => setPage(page + 1)}><ChevronRight size={20} /></IconButton>
          <IconButton label="Last page" size={36} disabled={(page + 1) * perPage >= list.length} onClick={() => setPage(Math.max(0, Math.ceil(list.length / perPage) - 1))}><ChevronsRight size={20} /></IconButton>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => (setToDelete(null), setAck(false))}
        title={`Permanently delete ${toDelete && toDelete.length > 1 ? `${toDelete.length} videos` : 'this video'}?`}
        body={
          <>
            Deleting is permanent and can't be undone. Views, comments and likes will be removed from your channel content list. Analytics already earned will still appear in your channel totals.
            {toDelete && toDelete.length === 1 && <div className="mt-3 rounded-lg bg-[#f9f9f9] p-3 font-medium">{videos.find((v) => v.id === toDelete[0])?.title}</div>}
          </>
        }
        confirmLabel="Delete forever"
        requireCheck="I understand that deleting is permanent and can't be undone"
        checked={ack}
        onCheck={setAck}
        onConfirm={() => {
          confirmDelete();
          setAck(false);
        }}
        danger
      />

      <Modal open={!!descFor} onClose={() => setDescFor(null)} title="Description" width={640} footer={<Button variant="primary" onClick={() => descFor && navigate(`/video/${descFor.id}/edit`)}>Edit in details</Button>}>
        <p className="whitespace-pre-wrap text-sm leading-6">{descFor?.description}</p>
      </Modal>
    </div>
  );
}
