import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/Layout';
import { Tabs } from '../../components/common/Controls';
import { DateRangePicker } from '../../components/analytics/DateRangePicker';
import { useStudio } from '../../store/StudioContext';
import { resolveRange } from '../../lib/ranges';
import { OverviewTab } from './OverviewTab';
import { ContentTab } from './ContentTab';
import { AudienceTab } from './AudienceTab';
import { RevenueTab } from './RevenueTab';
import { TrendsTab } from './TrendsTab';
import { AdvancedMode } from './AdvancedMode';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'content', label: 'Content' },
  { value: 'audience', label: 'Audience' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'trends', label: 'Trends' },
] as const;
type Tab = (typeof TABS)[number]['value'];

export function AnalyticsPage() {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { analyticsRange, customRange } = useStudio();
  const range = resolveRange(analyticsRange, customRange);
  const current = (TABS.some((t) => t.value === tab) ? tab : 'overview') as Tab;
  const advanced = params.get('advanced') === '1';

  return (
    <div className="pb-16">
      <PageHeader
        title="Channel analytics"
        actions={
          <button onClick={() => setParams({ advanced: '1' })} className="mr-2 h-9 rounded-full px-3 text-sm font-medium text-[#0f0f0f] hover:bg-black/[0.05]">
            Advanced mode
          </button>
        }
      />
      <div className="flex items-end gap-4 px-8 max-sm:px-4">
        <Tabs className="min-w-0 flex-1 border-b-0" tabs={TABS as unknown as { value: Tab; label: string }[]} value={current} onChange={(t) => navigate(`/analytics/${t}`)} />
        {current !== 'trends' && (
          <div className="mb-1 shrink-0">
            <DateRangePicker />
          </div>
        )}
      </div>
      <div className="border-b border-black/[0.1]" />
      <div className="mx-auto max-w-[1440px] px-8 pt-6 max-sm:px-4">
        {current === 'overview' && <OverviewTab scope={{}} range={range} />}
        {current === 'content' && <ContentTab range={range} />}
        {current === 'audience' && <AudienceTab scope={{}} range={range} />}
        {current === 'revenue' && <RevenueTab scope={{}} range={range} />}
        {current === 'trends' && <TrendsTab />}
      </div>
      {advanced && <AdvancedMode onClose={() => setParams({})} />}
    </div>
  );
}
