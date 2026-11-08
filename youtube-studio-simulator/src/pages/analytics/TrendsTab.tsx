import { useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { RESEARCH_TOPICS, VIEWER_SEARCHES } from '../../data/audience';
import { useStudio } from '../../store/StudioContext';
import { Chip, Tabs } from '../../components/common/Controls';
import { ACard } from './shared';
import { hashString, createRng } from '../../lib/random';
import { DONUT_COLORS } from '../../components/charts/MiniCharts';
import { useNavigate } from 'react-router-dom';

function interestSeries(term: string, trend: number) {
  const rng = createRng(hashString(term));
  const out: number[] = [];
  let v = 40 + rng.range(-10, 10);
  const growth = Math.pow(1 + trend / 100, 1 / 26);
  for (let w = 0; w < 52; w++) {
    if (w >= 26) v *= growth;
    v = Math.max(5, v * (1 + rng.normal(0, 0.06)));
    out.push(v);
  }
  const max = Math.max(...out);
  return out.map((x) => Math.round((x / max) * 100));
}

function VolumeBadge({ volume }: { volume: 'High' | 'Medium' | 'Low' }) {
  const bars = volume === 'High' ? 3 : volume === 'Medium' ? 2 : 1;
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-[#0f0f0f]">
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((b) => (
          <span key={b} className={`w-[4px] rounded-sm ${b <= bars ? 'bg-[#2793e8]' : 'bg-black/[0.12]'}`} style={{ height: 4 + b * 4 }} />
        ))}
      </span>
      {volume}
    </span>
  );
}

export function TrendsTab() {
  const { savedTopics, toggleSavedTopic, toast } = useStudio();
  const navigate = useNavigate();
  const [sub, setSub] = useState<'viewers' | 'youtube' | 'saved'>('youtube');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [compare, setCompare] = useState<string[]>(['byzantine empire documentary', 'bronze age collapse explained', 'roman empire for sleep']);
  const categories = ['All', ...Array.from(new Set(RESEARCH_TOPICS.map((t) => t.category)))];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESEARCH_TOPICS.filter((t) => (category === 'All' || t.category === category) && (!q || t.term.includes(q) || q.split(' ').some((w) => w.length > 2 && t.term.includes(w)))).sort((a, b) => b.trend - a.trend);
  }, [query, category]);

  const chartData = useMemo(() => {
    const series = compare.map((term) => ({ term, values: interestSeries(term, RESEARCH_TOPICS.find((t) => t.term === term)?.trend ?? 0) }));
    return Array.from({ length: 52 }).map((_, w) => {
      const d = new Date();
      d.setDate(d.getDate() - (51 - w) * 7);
      const row: Record<string, number | string> = { week: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) };
      series.forEach((s) => (row[s.term] = s.values[w]));
      return row;
    });
  }, [compare]);

  const SaveButton = ({ term }: { term: string }) => {
    const saved = savedTopics.includes(term);
    return (
      <button
        onClick={() => {
          toggleSavedTopic(term);
          toast(saved ? 'Removed from saved' : 'Saved to your research list');
        }}
        className="rounded-full p-2 hover:bg-black/[0.07]"
        aria-label={saved ? 'Remove from saved' : 'Save'}
        title={saved ? 'Remove from saved' : 'Save'}
      >
        {saved ? <BookmarkCheck size={20} className="text-[#065fd4]" /> : <Bookmark size={20} className="text-[#606060]" />}
      </button>
    );
  };

  return (
    <div className="flex gap-6 max-xl:flex-col">
      <div className="min-w-0 flex-1">
        <Tabs
          tabs={[
            { value: 'youtube', label: 'Searches across YouTube' },
            { value: 'viewers', label: 'Your viewers\' searches' },
            { value: 'saved', label: 'Saved', badge: savedTopics.length },
          ]}
          value={sub}
          onChange={setSub}
          className="mb-5"
        />
        {sub === 'youtube' && (
          <>
            <div className="flex h-12 items-center rounded-lg border border-black/[0.2] px-3 focus-within:border-[#065fd4]">
              <Search size={20} className="text-[#606060]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for history topics, e.g. 'empire', 'roman', 'mystery'" className="ml-3 flex-1 bg-transparent text-[15px] outline-none" />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear">
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </Chip>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-black/[0.1]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="h-11 border-b border-black/[0.1] bg-[#f9f9f9] text-xs text-[#606060]">
                    <th className="pl-4 font-medium">Search term</th>
                    <th className="font-medium">Search volume on YouTube</th>
                    <th className="font-medium">Interest (28 days)</th>
                    <th className="font-medium">Compare</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {results.map((t) => (
                    <tr key={t.term} className="h-14 border-b border-black/[0.06] hover:bg-[#f9f9f9]">
                      <td className="pl-4">
                        <div>{t.term}</div>
                        <div className="mt-0.5 flex gap-2">
                          <span className="text-xs text-[#606060]">{t.category}</span>
                          {t.contentGap && <span className="rounded bg-[#fef7e0] px-1.5 text-[11px] font-medium text-[#8a6100]">Content gap</span>}
                        </div>
                      </td>
                      <td>
                        <VolumeBadge volume={t.volume} />
                      </td>
                      <td>
                        <span className={`flex items-center gap-1 ${t.trend >= 0 ? 'text-[#2ba640]' : 'text-[#cc0000]'}`}>
                          {t.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {t.trend >= 0 ? '+' : ''}
                          {t.trend}%
                        </span>
                      </td>
                      <td>
                        <input type="checkbox" className="studio-check" checked={compare.includes(t.term)} onChange={(e) => setCompare((c) => (e.target.checked ? [...c, t.term].slice(-4) : c.filter((x) => x !== t.term)))} />
                      </td>
                      <td>
                        <SaveButton term={t.term} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length === 0 && <div className="py-10 text-center text-sm text-[#606060]">No topics match “{query}”. Try a broader term.</div>}
            </div>
          </>
        )}
        {sub === 'viewers' && (
          <ACard title="Your viewers' searches" subtitle="What your audience searched for on YouTube in the last 28 days">
            {VIEWER_SEARCHES.map((t) => (
              <div key={t.term} className="flex items-center gap-4 border-b border-black/[0.06] py-3 last:border-0">
                <div className="flex-1">
                  <div className="text-sm">{t.term}</div>
                  {t.contentGap && <span className="mt-1 inline-block rounded bg-[#fef7e0] px-1.5 text-[11px] font-medium text-[#8a6100]">Content gap · Few videos cover this well</span>}
                </div>
                <VolumeBadge volume={t.volume} />
                <SaveButton term={t.term} />
              </div>
            ))}
          </ACard>
        )}
        {sub === 'saved' && (
          <ACard title="Saved topics" subtitle="Ideas you've saved from Trends and the dashboard">
            {savedTopics.length === 0 && <div className="py-8 text-center text-sm text-[#606060]">Nothing saved yet. Bookmark search terms to plan future documentaries.</div>}
            {savedTopics.map((t) => (
              <div key={t} className="flex items-center gap-3 border-b border-black/[0.06] py-3 last:border-0">
                <span className="flex-1 text-sm">{t}</span>
                <button className="text-sm font-medium text-[#065fd4] hover:underline" onClick={() => navigate(`/content/videos`)}>
                  Plan video
                </button>
                <SaveButton term={t} />
              </div>
            ))}
          </ACard>
        )}
      </div>
      <div className="flex w-[420px] shrink-0 flex-col gap-6 max-xl:w-full">
        <ACard title="Interest over time" subtitle="Relative search interest on YouTube · last 12 months">
          {compare.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#606060]">Tick “Compare” on up to 4 topics to chart them here.</div>
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="week" interval={12} tick={{ fontSize: 11, fill: '#606060' }} tickLine={false} axisLine={{ stroke: '#909090' }} />
                  <YAxis orientation="right" width={30} tick={{ fontSize: 11, fill: '#606060' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 32px rgba(0,0,0,.1)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  {compare.map((t, i) => (
                    <Line key={t} type="monotone" dataKey={t} stroke={DONUT_COLORS[i]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ACard>
        <ACard title="Trending in history this week">
          {[...RESEARCH_TOPICS].sort((a, b) => b.trend - a.trend).slice(0, 5).map((t, i) => (
            <div key={t.term} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-5 text-[#606060]">{i + 1}</span>
              <span className="flex-1">{t.term}</span>
              <span className="text-[#2ba640]">+{t.trend}%</span>
            </div>
          ))}
        </ACard>
      </div>
    </div>
  );
}
