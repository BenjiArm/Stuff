import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { metricTotal, IMPRESSION_VIEW_SHARE, type KindFilter, type Scope } from '../../data/analytics';
import { BROWSE_FEATURES, SEARCH_TERMS, SUGGESTED_SOURCES } from '../../data/audience';
import type { ResolvedRange } from '../../lib/ranges';
import { MetricTabsChart } from '../../components/analytics/MetricTabsChart';
import { HBarList } from '../../components/charts/MiniCharts';
import { Chip } from '../../components/common/Controls';
import { ACard, TopContentTable, headline, trafficSources, useVideoRows } from './shared';
import { formatCompact, formatDuration, formatInt } from '../../lib/format';
import { Modal } from '../../components/common/Modal';
import { hashString } from '../../lib/random';

export function ImpressionsFunnel({ scope, range }: { scope: Scope; range: ResolvedRange }) {
  const impressions = metricTotal('impressions', scope, range.start, range.end);
  const ctr = metricTotal('ctr', scope, range.start, range.end);
  const fromImpr = metricTotal('impressionViews', scope, range.start, range.end);
  const avd = metricTotal('avd', { ...scope, kind: scope.videoId ? undefined : 'video' }, range.start, range.end);
  const watch = (fromImpr * avd) / 3600;
  const recommended = 72.6 + (scope.videoId ? (hashString(scope.videoId) % 9) - 4 : 0);
  const steps = [
    { label: 'Impressions', value: formatCompact(impressions), note: `${recommended.toFixed(1)}% from YouTube recommending your content` },
    { label: 'Impressions click-through rate', value: `${ctr.toFixed(1)}%`, note: '' },
    { label: 'Views from impressions', value: formatCompact(fromImpr), note: `${(IMPRESSION_VIEW_SHARE * 100).toFixed(0)}% of long-form views` },
    { label: 'Average view duration', value: formatDuration(avd), note: '' },
    { label: 'Watch time from impressions (hours)', value: formatCompact(watch), note: '' },
  ];
  return (
    <ACard title="Impressions and how they led to watch time" subtitle={range.label}>
      <div className="flex flex-col gap-0">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex w-full items-center gap-4 border-b border-black/[0.06] py-3" style={{ paddingLeft: i * 10 }}>
              <div className="flex-1">
                <div className="text-[13px] text-[#606060]">{s.label}</div>
                {s.note && <div className="text-xs text-[#909090]">{s.note}</div>}
              </div>
              <div className="text-[20px] font-medium">{s.value}</div>
              {i < steps.length - 1 && <ArrowRight size={16} className="rotate-90 text-[#909090]" />}
            </div>
          </div>
        ))}
      </div>
    </ACard>
  );
}

export function TrafficCards({ scope, range }: { scope: Scope; range: ResolvedRange }) {
  const views = metricTotal('views', scope, range.start, range.end);
  const sources = trafficSources(scope, views);
  const [detail, setDetail] = useState<string | null>(null);
  const search = sources.find((s) => s.label === 'YouTube search');
  const browse = sources.find((s) => s.label === 'Browse features');
  const suggested = sources.find((s) => s.label === 'Suggested videos');
  return (
    <>
      <ACard title="How viewers find your videos" subtitle={`Views · ${range.label}`}>
        <HBarList rows={sources.map((s) => ({ label: s.label, value: s.share, key: s.label, sub: formatCompact(s.views) }))} onRowClick={(i) => setDetail(sources[i].label)} />
        <p className="mt-2 text-xs text-[#909090]">Select a traffic source to see more detail.</p>
      </ACard>
      {search && (
        <ACard title="Traffic source: YouTube search" subtitle={`${formatCompact(search.views)} views · ${range.label}`}>
          <HBarList rows={SEARCH_TERMS.slice(0, 8).map((t) => ({ label: t.term, value: t.share * 3.2 }))} />
        </ACard>
      )}
      {browse && (
        <ACard title="Traffic source: Browse features" subtitle={`${formatCompact(browse.views)} views · ${range.label}`}>
          <HBarList rows={BROWSE_FEATURES.map((t) => ({ label: t.label, value: t.value }))} />
        </ACard>
      )}
      {suggested && (
        <ACard title="Traffic source: Suggested videos" subtitle={`${formatCompact(suggested.views)} views · ${range.label}`}>
          <HBarList rows={SUGGESTED_SOURCES.map((t) => ({ label: <span>{t.title} <span className="text-[#606060]">· {t.channel}</span></span>, value: t.share }))} />
        </ACard>
      )}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Traffic source: ${detail}`} width={600}>
        {(() => {
          const s = sources.find((x) => x.label === detail);
          if (!s) return null;
          const rows = detail === 'YouTube search' ? SEARCH_TERMS.map((t) => ({ label: t.term, value: t.share * 3 })) : detail === 'Suggested videos' ? SUGGESTED_SOURCES.map((t) => ({ label: `${t.title} · ${t.channel}`, value: t.share })) : detail === 'Browse features' ? BROWSE_FEATURES.map((b) => ({ label: b.label, value: b.value })) : [{ label: detail ?? '', value: 100 }];
          return (
            <>
              <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                <div><div className="text-[#606060]">Views</div><div className="text-xl font-medium">{formatInt(s.views)}</div></div>
                <div><div className="text-[#606060]">Share</div><div className="text-xl font-medium">{s.share.toFixed(1)}%</div></div>
                <div><div className="text-[#606060]">Watch time (hours)</div><div className="text-xl font-medium">{formatCompact((s.views * metricTotal('avd', scope, range.start, range.end)) / 3600)}</div></div>
              </div>
              <HBarList rows={rows} />
            </>
          );
        })()}
      </Modal>
    </>
  );
}

const KIND_CHIPS: { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'video', label: 'Videos' },
  { value: 'short', label: 'Shorts' },
];

export function ContentTab({ range }: { range: ResolvedRange }) {
  const [kind, setKind] = useState<KindFilter>('video');
  const [extra, setExtra] = useState<'live' | 'posts' | null>(null);
  const scope: Scope = { kind };
  const rows = useVideoRows(scope, range);
  const views = metricTotal('views', scope, range.start, range.end);
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {KIND_CHIPS.map((c) => (
          <Chip key={c.value} active={!extra && kind === c.value} onClick={() => (setExtra(null), setKind(c.value))}>
            {c.label}
          </Chip>
        ))}
        <Chip active={extra === 'live'} onClick={() => setExtra('live')}>Live</Chip>
        <Chip active={extra === 'posts'} onClick={() => setExtra('posts')}>Posts</Chip>
      </div>
      {extra === 'live' && <div className="rounded-xl border border-black/[0.1] py-16 text-center text-sm text-[#606060]">You haven't streamed in this period. Premieres count as videos.</div>}
      {extra === 'posts' && (
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {[['Post impressions', '412.6K'], ['Likes', '11.6K'], ['Poll votes', '13.0K']].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-black/[0.1] p-6"><div className="text-[13px] text-[#606060]">{l}</div><div className="mt-1 text-[26px] font-medium">{v}</div></div>
          ))}
        </div>
      )}
      {!extra && (
        <>
          <h2 className="mb-5 text-center text-[26px] font-medium leading-9 tracking-[-0.3px] max-md:text-xl">{headline('views', views, range, false).replace('Your channel', kind === 'short' ? 'Your Shorts' : kind === 'video' ? 'Your videos' : 'Your content')}</h2>
          <div className="flex gap-6 max-xl:flex-col">
            <div className="min-w-0 flex-1">
              <MetricTabsChart
                key={kind}
                metrics={kind === 'short' ? ['views', 'likes', 'subscribers', 'avd'] : ['views', 'impressions', 'ctr', 'avd']}
                scope={scope}
                range={range}
              />
              <ACard title={kind === 'short' ? 'Top Shorts' : kind === 'video' ? 'Top videos' : 'Top content'} subtitle={range.label} className="mt-6">
                <TopContentTable rows={rows} columns={kind === 'short' ? ['views', 'subs', 'avd'] : ['impressions', 'ctr', 'views', 'avd']} sortBy="views" limit={15} />
              </ACard>
            </div>
            <div className="flex w-[380px] shrink-0 flex-col gap-6 max-xl:w-full">
              {kind !== 'short' && <ImpressionsFunnel scope={{ kind: 'video' }} range={range} />}
              <TrafficCards scope={scope} range={range} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
