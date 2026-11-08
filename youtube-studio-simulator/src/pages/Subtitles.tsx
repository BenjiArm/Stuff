import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/Layout';
import { Tabs } from '../components/common/Controls';
import { useStudio } from '../store/StudioContext';
import { VideoThumb } from '../components/common/VideoThumb';
import { formatDate } from '../lib/format';

export function SubtitlesPage() {
  const { videos, subtitles } = useStudio();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'drafts' | 'published'>('all');
  const rows = useMemo(
    () =>
      videos
        .filter((v) => v.visibility !== 'draft')
        .map((v) => {
          const t = subtitles(v.id);
          return { v, tracks: t, modified: Math.max(...t.map((x) => x.modifiedAt), v.publishedAt), drafts: t.filter((x) => x.kind === 'draft').length };
        })
        .filter((r) => (tab === 'drafts' ? r.drafts > 0 : tab === 'published' ? r.tracks.some((t) => t.kind === 'published') : true))
        .sort((a, b) => b.v.publishedAt - a.v.publishedAt),
    [videos, subtitles, tab],
  );
  return (
    <div>
      <PageHeader title="Channel subtitles" />
      <Tabs
        className="mt-2 px-5"
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'drafts', label: 'Drafts' },
          { value: 'published', label: 'Published' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="h-12 border-b border-black/[0.1] text-xs text-[#606060]">
            <th className="pl-6 font-medium">Video</th>
            <th className="w-[280px] font-medium">Languages</th>
            <th className="w-[160px] pr-6 font-medium">Modified on</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ v, tracks, modified, drafts }) => (
            <tr key={v.id} onClick={() => navigate(`/video/${v.id}/subtitles`)} className="cursor-pointer border-b border-black/[0.1] hover:bg-[#f9f9f9]">
              <td className="py-3 pl-6">
                <div className="flex items-center gap-4">
                  <VideoThumb video={v} width={120} />
                  <div>
                    <div className="line-clamp-2 text-[13px]">{v.title}</div>
                    {drafts > 0 && <div className="mt-1 text-xs text-[#8a6100]">{drafts} draft{drafts > 1 ? 's' : ''}</div>}
                  </div>
                </div>
              </td>
              <td>
                <div>{tracks.length} language{tracks.length === 1 ? '' : 's'}</div>
                <div className="line-clamp-1 text-xs text-[#606060]">{tracks.map((t) => t.language.replace(' (United Kingdom)', '')).join(', ')}</div>
              </td>
              <td className="pr-6">{formatDate(modified)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
