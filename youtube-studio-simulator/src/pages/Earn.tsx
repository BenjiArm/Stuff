import { useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, CheckCircle2, CircleDollarSign, Gem, Heart, MessageSquareHeart, ShoppingBag, Sparkles, Tv, Smartphone, ChevronRight, Landmark, FileCheck2, CalendarClock } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Tabs, Toggle } from '../components/common/Controls';
import { useStudio, type EarnSettings } from '../store/StudioContext';
import { growthByWindow, metricTotal, LAST, MONETISATION_START, dayDate } from '../data/analytics';
import { formatDate, formatGBP, formatInt } from '../lib/format';
import { SimpleBars } from '../components/charts/MiniCharts';
import { Button } from '../components/common/Button';
import { revenueSources } from './analytics/shared';
import { LetterAvatar } from '../components/common/Avatar';
import { avatarColourFor } from '../data/comments';
import { SESSION_START } from '../data/analytics';

function Section({ title, subtitle, children, action }: { title: string; subtitle?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-xl border border-black/[0.1] bg-white p-6">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-[16px] font-medium">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-[#606060]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({ icon, title, body, k, value }: { icon: ReactNode; title: string; body: string; k: keyof EarnSettings; value?: ReactNode }) {
  const { earn, setEarn, toast } = useStudio();
  return (
    <div className="flex items-center gap-4 border-b border-black/[0.06] py-4 last:border-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[#0f0f0f]">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[13px] leading-5 text-[#606060]">{body}</div>
      </div>
      {value && <div className="text-right text-sm">{value}</div>}
      <Toggle
        checked={earn[k]}
        label={title}
        onChange={(v) => {
          setEarn({ [k]: v } as Partial<EarnSettings>);
          toast(`${title} ${v ? 'turned on' : 'turned off'}`);
        }}
      />
    </div>
  );
}

const MEMBER_TIERS = [
  { name: 'Legionary', price: 1.99, members: 28, perks: ['Loyalty badges', 'Custom emoji', 'Members-only posts'] },
  { name: 'Centurion', price: 4.99, members: 11, perks: ['Everything in Legionary', 'Early access to documentaries', 'Monthly sources list'] },
  { name: 'Senator', price: 9.99, members: 3, perks: ['Everything in Centurion', 'Vote on future topics', 'Name in the credits'] },
];

function Overview() {
  const navigate = useNavigate();
  const { earn } = useStudio();
  const rev = metricTotal('revenue', {}, LAST - 27, LAST);
  const months = growthByWindow().slice(3).map((m) => ({ label: m.label, value: m.revenue, sub: m.label }));
  const lifetime = growthByWindow().reduce((a, m) => a + m.revenue, 0);
  const ways = [
    { icon: <Tv size={20} />, title: 'Watch page ads', on: earn.watchPageAds, tab: 'ads' },
    { icon: <Smartphone size={20} />, title: 'Shorts feed ads', on: earn.shortsAds, tab: 'ads' },
    { icon: <Gem size={20} />, title: 'Memberships', on: earn.memberships, tab: 'memberships' },
    { icon: <Heart size={20} />, title: 'Supers', on: earn.superChat || earn.superThanks || earn.superStickers, tab: 'supers' },
    { icon: <ShoppingBag size={20} />, title: 'Shopping', on: earn.shopping, tab: 'shopping' },
  ];
  return (
    <div className="grid grid-cols-[1fr_380px] gap-6 max-xl:grid-cols-1">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-black/[0.1] bg-gradient-to-br from-white to-[#f3f8ff] p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f4ea] text-[#137333]">
              <BadgeCheck size={28} />
            </span>
            <div className="flex-1">
              <h3 className="text-xl font-medium">You're in the YouTube Partner Programme</h3>
              <p className="mt-1 text-sm text-[#606060]">Monetisation enabled since {formatDate(dayDate(MONETISATION_START))}. Your channel is eligible for all ways to earn.</p>
              <div className="mt-4 flex flex-wrap gap-6 text-[13px]">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#2ba640]" /> Monetisation status: <b>Enabled</b></span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#2ba640]" /> Channel in good standing</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#2ba640]" /> 2-Step Verification on</span>
              </div>
            </div>
          </div>
        </section>
        <Section title="Revenue overview" subtitle="Estimated revenue for the last 28 days" action={<Button variant="tonal" onClick={() => navigate('/analytics/revenue')}>Go to revenue analytics</Button>}>
          <div className="flex flex-wrap gap-10">
            <div>
              <div className="text-[13px] text-[#606060]">Last 28 days</div>
              <div className="text-[30px] font-medium leading-10">{formatGBP(rev)}</div>
            </div>
            <div>
              <div className="text-[13px] text-[#606060]">RPM</div>
              <div className="text-[30px] font-medium leading-10">{formatGBP(metricTotal('rpm', {}, LAST - 27, LAST))}</div>
            </div>
            <div>
              <div className="text-[13px] text-[#606060]">Lifetime estimated revenue</div>
              <div className="text-[30px] font-medium leading-10">{formatGBP(lifetime)}</div>
            </div>
          </div>
          <div className="mt-6">
            <SimpleBars data={months} format={(v) => (v >= 1000 ? `£${(v / 1000).toFixed(1)}K` : `£${Math.round(v)}`)} height={200} highlightLast />
          </div>
        </Section>
        <Section title="Ways to earn" subtitle="Turn on the features that suit your channel">
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            {ways.map((w) => (
              <button key={w.title} onClick={() => navigate(`/earn/${w.tab}`)} className="flex items-center gap-3 rounded-lg border border-black/[0.1] p-4 text-left hover:bg-[#f9f9f9]">
                <span className="text-[#606060]">{w.icon}</span>
                <span className="flex-1 text-sm font-medium">{w.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${w.on ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-black/[0.05] text-[#606060]'}`}>{w.on ? 'On' : 'Off'}</span>
                <ChevronRight size={18} className="text-[#909090]" />
              </button>
            ))}
          </div>
        </Section>
      </div>
      <div className="flex flex-col gap-6">
        <Section title="Payments" subtitle="Managed in AdSense for YouTube">
          <div className="flex items-center gap-3 rounded-lg bg-[#f9f9f9] p-4">
            <Landmark className="text-[#606060]" />
            <div className="flex-1 text-sm">
              <div className="font-medium">Last payment: £2,650.14</div>
              <div className="text-[13px] text-[#606060]">Sent {formatDate(SESSION_START - 2 * 86_400_000)} · Bank account ••••4417</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#f9f9f9] p-4">
            <CalendarClock className="text-[#606060]" />
            <div className="flex-1 text-sm">
              <div className="font-medium">Next payment (estimated)</div>
              <div className="text-[13px] text-[#606060]">Around the 21st of next month</div>
            </div>
          </div>
        </Section>
        <Section title="Agreements">
          {['YouTube Partner Programme Terms', 'Commerce Product Module', 'Shorts Monetisation Module'].map((a) => (
            <div key={a} className="flex items-center gap-3 py-2 text-sm">
              <FileCheck2 size={18} className="text-[#2ba640]" />
              <span className="flex-1">{a}</span>
              <span className="text-xs text-[#606060]">Accepted</span>
            </div>
          ))}
        </Section>
        <Section title="Path to the next milestone">
          <div className="text-sm">100,000 subscribers · Silver Creator Award</div>
          <div className="mt-2 h-2 rounded-full bg-black/[0.06]">
            <div className="h-2 rounded-full bg-[#cc0000]" style={{ width: '84.65%' }} />
          </div>
          <div className="mt-1 text-xs text-[#606060]">84,650 of 100,000 · about 34 days at your current pace</div>
        </Section>
      </div>
    </div>
  );
}

function Ads() {
  const { earn } = useStudio();
  const src = revenueSources({}, LAST - 27, LAST);
  return (
    <div className="flex max-w-[900px] flex-col gap-6">
      <Section title="Ads" subtitle="Earn from ads shown on your videos and between Shorts">
        <ToggleRow icon={<Tv size={20} />} title="Watch page ads" body="Ads before, during and after your long videos" k="watchPageAds" value={<><div className="font-medium">{formatGBP(src[0].value + src[1].value)}</div><div className="text-xs text-[#606060]">Last 28 days</div></>} />
        <ToggleRow icon={<Smartphone size={20} />} title="Shorts feed ads" body="Share of revenue from ads viewed between Shorts" k="shortsAds" value={<><div className="font-medium">{formatGBP(src[2].value)}</div><div className="text-xs text-[#606060]">Last 28 days</div></>} />
      </Section>
      <Section title="Default ad settings for new uploads" subtitle="You can override these on each video's Earn page">
        <div className={earn.watchPageAds ? '' : 'pointer-events-none opacity-40'}>
          <ToggleRow icon={<Sparkles size={20} />} title="Before video (pre-roll)" body="Ads that play before the video" k="adPreRoll" />
          <ToggleRow icon={<Sparkles size={20} />} title="During video (mid-roll)" body="Ads during videos longer than 8 minutes – most of your documentaries" k="adMidRoll" />
          <ToggleRow icon={<Sparkles size={20} />} title="Automatic mid-roll placement" body="Let YouTube place mid-roll ads at natural breaks" k="midRollAuto" />
          <ToggleRow icon={<Sparkles size={20} />} title="After video (post-roll)" body="Ads that play after the video" k="adPostRoll" />
          <ToggleRow icon={<Sparkles size={20} />} title="Skippable video ads" body="Viewers can skip after 5 seconds" k="adSkippable" />
          <ToggleRow icon={<Sparkles size={20} />} title="Non-skippable video ads" body="Viewers must watch the ad before the video plays" k="adNonSkippable" />
        </div>
      </Section>
    </div>
  );
}

function Memberships() {
  const { earn } = useStudio();
  const src = revenueSources({}, LAST - 27, LAST);
  const recent = ['Helen Ward', 'Tomás Rivera', 'Grace Okafor', 'Liam O\'Brien', 'Yusuf Demir'];
  return (
    <div className="flex max-w-[900px] flex-col gap-6">
      <Section title="Channel memberships" subtitle="Viewers pay monthly to join and get perks">
        <ToggleRow icon={<Gem size={20} />} title="Memberships" body="Offer members-only perks at three levels" k="memberships" value={<><div className="font-medium">{formatGBP(src[3].value)}</div><div className="text-xs text-[#606060]">Last 28 days</div></>} />
      </Section>
      <div className={`grid grid-cols-3 gap-4 max-md:grid-cols-1 ${earn.memberships ? '' : 'opacity-40'}`}>
        {MEMBER_TIERS.map((t) => (
          <div key={t.name} className="rounded-xl border border-black/[0.1] p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fef7e0] text-[#8a6100]"><Gem size={16} /></span>
              <span className="font-medium">{t.name}</span>
            </div>
            <div className="mt-3 text-2xl font-medium">£{t.price.toFixed(2)}<span className="text-sm font-normal text-[#606060]">/month</span></div>
            <div className="text-[13px] text-[#606060]">{t.members} active members</div>
            <ul className="mt-3 flex flex-col gap-1 text-[13px]">
              {t.perks.map((p) => (
                <li key={p} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#2ba640]" />{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Section title="Recent members">
        {recent.map((n, i) => (
          <div key={n} className="flex items-center gap-3 py-2 text-sm">
            <LetterAvatar name={n} color={avatarColourFor(n)} size={32} />
            <span className="flex-1">{n}</span>
            <span className="text-xs text-[#606060]">{MEMBER_TIERS[i % 3].name} · joined {i + 1} day{i ? 's' : ''} ago</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Supers() {
  const src = revenueSources({}, LAST - 27, LAST);
  return (
    <div className="flex max-w-[900px] flex-col gap-6">
      <Section title="Supers" subtitle="Let fans show support with paid highlights" action={<div className="text-right text-sm"><div className="font-medium">{formatGBP(src[4].value)}</div><div className="text-xs text-[#606060]">Last 28 days</div></div>}>
        <ToggleRow icon={<MessageSquareHeart size={20} />} title="Super Thanks" body="Viewers buy a highlighted comment on your videos" k="superThanks" />
        <ToggleRow icon={<CircleDollarSign size={20} />} title="Super Chat" body="Highlighted messages in live chats and premieres" k="superChat" />
        <ToggleRow icon={<Sparkles size={20} />} title="Super Stickers" body="Animated stickers in live chats and premieres" k="superStickers" />
      </Section>
      <Section title="Recent Super Thanks">
        {[
          ['@medievalmum', '£4.99', 'Thank you for the Black Death documentary – my kids loved it!'],
          ['@steppewarrior', '£1.99', 'More Mongol content please 🐎'],
          ['@gibbon_reader', '£9.99', 'For the Byzantine episode fund!'],
        ].map(([h, amt, t]) => (
          <div key={h} className="flex gap-3 border-b border-black/[0.06] py-3 text-sm last:border-0">
            <LetterAvatar name={h} color={avatarColourFor(h)} size={32} />
            <div className="flex-1">
              <div className="text-[13px] font-medium">{h} <span className="ml-1 rounded bg-[#1e88e5] px-1.5 py-0.5 text-[11px] text-white">{amt}</span></div>
              <div>{t}</div>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Shopping() {
  const { earn, setEarn, toast } = useStudio();
  return (
    <div className="flex max-w-[900px] flex-col gap-6">
      <Section title="Shopping" subtitle="Tag products in your videos and earn commission">
        <ToggleRow icon={<ShoppingBag size={20} />} title="YouTube Shopping" body="Show your store and tagged products on your channel" k="shopping" />
      </Section>
      <Section title="Affiliate products" subtitle={earn.shopping ? 'Products tagged in your recent videos' : 'Turn on Shopping to tag products'}>
        {[
          ['The Histories – Herodotus (paperback)', '£9.99', '24 clicks'],
          ['SPQR: A History of Ancient Rome', '£12.99', '61 clicks'],
          ['Illustrated Atlas of Ancient Empires', '£24.00', '17 clicks'],
        ].map(([n, p, c]) => (
          <div key={n} className="flex items-center gap-4 border-b border-black/[0.06] py-3 text-sm last:border-0">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f2f2f2] text-[#606060]"><ShoppingBag size={20} /></span>
            <span className="flex-1">{n}</span>
            <span className="text-[#606060]">{c}</span>
            <span className="font-medium">{p}</span>
          </div>
        ))}
        {!earn.shopping && (
          <Button variant="primary" className="mt-4" onClick={() => (setEarn({ shopping: true }), toast('Shopping turned on'))}>Get started</Button>
        )}
      </Section>
      <div className="text-xs text-[#909090]">Estimated affiliate commission in the last 28 days: {formatGBP(revenueSources({}, LAST - 27, LAST)[5].value)} · {formatInt(102)} product clicks</div>
    </div>
  );
}

export function EarnPage() {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  return (
    <div className="pb-12">
      <PageHeader title="Channel monetisation" />
      <Tabs
        className="mt-2 px-5"
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'ads', label: 'Ads' },
          { value: 'memberships', label: 'Memberships' },
          { value: 'supers', label: 'Supers' },
          { value: 'shopping', label: 'Shopping' },
        ]}
        value={tab}
        onChange={(t) => navigate(`/earn/${t}`)}
      />
      <div className="px-8 pt-6 max-sm:px-4">
        {tab === 'overview' && <Overview />}
        {tab === 'ads' && <Ads />}
        {tab === 'memberships' && <Memberships />}
        {tab === 'supers' && <Supers />}
        {tab === 'shopping' && <Shopping />}
      </div>
    </div>
  );
}
