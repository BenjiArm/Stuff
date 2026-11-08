import { useEffect, useState } from 'react';
import { CheckCircle2, Trash2, UserPlus, X, RotateCcw } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useStudio, type StudioSettings } from '../store/StudioContext';
import { InputField, Radio, SelectField, TextAreaField, Toggle, Tabs } from '../components/common/Controls';
import { Button, IconButton } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/Modal';
import type { ChannelProfile } from '../data/channel';

const NAV = [
  { id: 'general', label: 'General' },
  { id: 'channel', label: 'Channel' },
  { id: 'upload', label: 'Upload defaults' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'community', label: 'Community' },
  { id: 'agreements', label: 'Agreements' },
];

const CATEGORIES = ['Education', 'Entertainment', 'Film & Animation', 'People & Blogs', 'Travel & Events', 'News & Politics'];
const LANGS = ['English (United Kingdom)', 'English (United States)', 'English', 'Spanish', 'German', 'French'];

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/[0.08] py-5 last:border-0">
      <div className="text-[15px] font-medium">{title}</div>
      {desc && <p className="mt-1 text-[13px] leading-5 text-[#606060]">{desc}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function SettingsModal() {
  const { settingsOpen, closeSettings, openSettings, settings, setSettings, profile, setProfile, toast, resetSimulator } = useStudio();
  const [draft, setDraft] = useState<StudioSettings>(settings);
  const [prof, setProf] = useState<ChannelProfile>(profile);
  const [channelTab, setChannelTab] = useState<'basic' | 'advanced' | 'eligibility'>('basic');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (settingsOpen) {
      setDraft(settings);
      setProf(profile);
    }
  }, [settingsOpen, settings, profile]);

  if (!settingsOpen) return null;
  const tab = settingsOpen;
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings) || JSON.stringify(prof) !== JSON.stringify(profile);
  const set = <K extends keyof StudioSettings>(k: K, v: StudioSettings[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && closeSettings()}>
      <div className="flex h-[min(680px,calc(100vh-32px))] w-full max-w-[1000px] animate-pop-in flex-col overflow-hidden rounded-xl bg-white shadow-dialog">
        <div className="flex items-center border-b border-black/[0.1] py-2 pl-6 pr-3">
          <h2 className="flex-1 py-2 text-xl font-medium">Settings</h2>
          <IconButton label="Close" onClick={closeSettings}>
            <X size={22} />
          </IconButton>
        </div>
        <div className="flex min-h-0 flex-1">
          <nav className="w-[220px] shrink-0 border-r border-black/[0.1] py-2 max-sm:w-[130px]">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => openSettings(n.id)} className={`flex h-12 w-full items-center px-6 text-left text-[15px] ${tab === n.id ? 'bg-black/[0.05] font-medium' : 'hover:bg-black/[0.03]'}`}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto px-8 py-2">
            {tab === 'general' && (
              <>
                <Row title="Default units" desc="Currency used to display your estimated revenue.">
                  <SelectField className="max-w-[360px]" label="Currency" value={draft.currency} onChange={(v) => set('currency', v)} options={['GBP – British Pound', 'USD – US Dollar', 'EUR – Euro'].map((c) => ({ value: c, label: c }))} />
                  {draft.currency !== 'GBP – British Pound' && <p className="mt-2 text-xs text-[#606060]">Revenue in this simulator is always calculated in GBP.</p>}
                </Row>
                <Row title="Appearance">
                  <SelectField className="max-w-[360px]" label="Theme" value={draft.appearance} onChange={(v) => set('appearance', v)} options={[{ value: 'light', label: 'Light theme' }, { value: 'device', label: 'Use device theme' }]} />
                </Row>
                <Row title="Language and location">
                  <div className="flex max-w-[740px] gap-4 max-md:flex-col">
                    <SelectField className="flex-1" label="Language" value={draft.language} onChange={(v) => set('language', v)} options={['English (UK)', 'English (US)'].map((c) => ({ value: c, label: c }))} />
                    <SelectField className="flex-1" label="Location" value={draft.location} onChange={(v) => set('location', v)} options={['United Kingdom', 'United States', 'Ireland', 'Canada', 'Australia'].map((c) => ({ value: c, label: c }))} />
                  </div>
                </Row>
                <Row title="Notifications">
                  <label className="flex items-center gap-4 text-sm">
                    <Toggle checked={draft.emailNotifications} onChange={(v) => set('emailNotifications', v)} label="Email notifications" />
                    Send me emails about my channel's performance, milestones and comments
                  </label>
                </Row>
                <Row title="Simulator data" desc="Everything you change in this simulator (titles, comments, settings, uploads…) is saved in your browser's local storage. Resetting restores the original seeded channel.">
                  <Button variant="outline" icon={<RotateCcw size={18} />} onClick={() => setConfirmReset(true)}>
                    Reset simulator to defaults
                  </Button>
                  <p className="mt-3 text-xs text-[#909090]">The Past Explained is a fictional channel. All statistics are simulated and are not real YouTube analytics. Not affiliated with YouTube or Google.</p>
                </Row>
              </>
            )}
            {tab === 'channel' && (
              <>
                <Tabs className="mb-2" tabs={[{ value: 'basic', label: 'Basic info' }, { value: 'advanced', label: 'Advanced settings' }, { value: 'eligibility', label: 'Feature eligibility' }]} value={channelTab} onChange={setChannelTab} />
                {channelTab === 'basic' && (
                  <>
                    <Row title="Country of residence" desc="Choose the country where you're currently based. This affects payments and tax.">
                      <SelectField className="max-w-[360px]" label="Country" value={prof.country} onChange={(v) => setProf({ ...prof, country: v })} options={['United Kingdom', 'United States', 'Ireland', 'Canada', 'Australia'].map((c) => ({ value: c, label: c }))} />
                    </Row>
                    <Row title="Keywords" desc="Add keywords to help viewers find your channel.">
                      <TextAreaField label="Keywords" value={prof.keywords} onChange={(v) => setProf({ ...prof, keywords: v })} rows={3} maxLength={500} />
                    </Row>
                  </>
                )}
                {channelTab === 'advanced' && (
                  <>
                    <Row title="Audience" desc="Do you want to set your channel as made for kids?">
                      <Radio name="kids" checked={false} onChange={() => toast('This history channel is set as not made for kids')} label="Yes, set this channel as made for kids" />
                      <Radio name="kids" checked onChange={() => undefined} label="No, set this channel as not made for kids. I will upload content that is not made for kids." />
                    </Row>
                    <Row title="Subscriber count">
                      <label className="flex items-center gap-4 text-sm">
                        <Toggle checked={draft.showSubscriberCount} onChange={(v) => set('showSubscriberCount', v)} label="Display subscriber count" />
                        Display the number of people subscribed to my channel
                      </label>
                    </Row>
                    <Row title="Google Ads account linking">
                      <Button variant="tonal" onClick={() => toast('Google Ads linking is not available in the simulator')}>Link account</Button>
                    </Row>
                  </>
                )}
                {channelTab === 'eligibility' && (
                  <>
                    {[
                      ['Standard features', 'Upload videos, create playlists, add subtitles'],
                      ['Intermediate features', 'Longer videos (over 15 minutes), custom thumbnails, live streaming'],
                      ['Advanced features', 'More daily uploads, external links in descriptions, appeal Content ID claims'],
                    ].map(([t, d]) => (
                      <Row key={t} title={t} desc={d}>
                        <span className="flex items-center gap-2 text-sm text-[#2ba640]"><CheckCircle2 size={18} /> Enabled</span>
                      </Row>
                    ))}
                  </>
                )}
              </>
            )}
            {tab === 'upload' && (
              <>
                <Row title="Basic info" desc="These defaults will be applied to each new upload.">
                  <div className="flex flex-col gap-4">
                    <TextAreaField label="Title" value={draft.defaultTitle} onChange={(v) => set('defaultTitle', v)} maxLength={100} rows={1} placeholder="Add a title" />
                    <TextAreaField label="Description" value={draft.defaultDescription} onChange={(v) => set('defaultDescription', v)} maxLength={5000} rows={4} />
                    <SelectField label="Visibility" value={draft.defaultVisibility} onChange={(v) => set('defaultVisibility', v)} options={[{ value: 'private', label: 'Private' }, { value: 'unlisted', label: 'Unlisted' }, { value: 'public', label: 'Public' }]} />
                    <TextAreaField label="Tags" value={draft.defaultTags} onChange={(v) => set('defaultTags', v)} rows={1} helper="Enter a comma after each tag" />
                  </div>
                </Row>
                <Row title="Advanced settings">
                  <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <SelectField label="Category" value={draft.defaultCategory} onChange={(v) => set('defaultCategory', v)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
                    <SelectField label="Video language" value={draft.defaultLanguage} onChange={(v) => set('defaultLanguage', v)} options={LANGS.map((c) => ({ value: c, label: c }))} />
                    <SelectField label="Licence" value={draft.defaultLicence} onChange={(v) => set('defaultLicence', v)} options={[{ value: 'standard', label: 'Standard YouTube Licence' }, { value: 'cc', label: 'Creative Commons – Attribution' }]} />
                    <SelectField label="Comments" value={draft.defaultComments} onChange={(v) => set('defaultComments', v)} options={[{ value: 'on', label: 'Allow all comments' }, { value: 'hold', label: 'Hold all comments for review' }, { value: 'off', label: 'Disable comments' }]} />
                  </div>
                  <div className="mt-4 flex flex-col gap-3 text-sm">
                    <label className="flex items-center gap-4"><Toggle checked={draft.allowEmbedding} onChange={(v) => set('allowEmbedding', v)} label="Allow embedding" /> Allow embedding</label>
                    <label className="flex items-center gap-4"><Toggle checked={draft.publishToSubscriptions} onChange={(v) => set('publishToSubscriptions', v)} label="Publish to subscriptions feed" /> Publish to subscriptions feed and notify subscribers</label>
                  </div>
                </Row>
              </>
            )}
            {tab === 'permissions' && (
              <Row title="Channel permissions" desc="Give people access to your channel in YouTube Studio without sharing your account.">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="h-10 border-b border-black/[0.1] text-xs text-[#606060]">
                      <th className="font-medium">Name</th>
                      <th className="font-medium">Role</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.permissions.map((p, i) => (
                      <tr key={p.email} className="h-14 border-b border-black/[0.06]">
                        <td>
                          <div>{p.name}</div>
                          <div className="text-xs text-[#606060]">{p.email}</div>
                        </td>
                        <td>{p.role}</td>
                        <td>{p.role !== 'Owner' && <IconButton label="Remove" size={32} onClick={() => set('permissions', draft.permissions.filter((_, j) => j !== i))}><Trash2 size={16} /></IconButton>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex items-start gap-3 max-md:flex-col">
                  <InputField className="flex-1" label="Invite by email" value={inviteEmail} onChange={setInviteEmail} placeholder="name@example.com" />
                  <SelectField className="w-[200px]" label="Role" value={inviteRole} onChange={setInviteRole} options={['Manager', 'Editor', 'Editor (limited)', 'Subtitle editor', 'Viewer', 'Viewer (limited)'].map((r) => ({ value: r, label: r }))} />
                  <Button
                    variant="tonal"
                    className="mt-2.5"
                    icon={<UserPlus size={18} />}
                    disabled={!/^\S+@\S+\.\S+$/.test(inviteEmail)}
                    onClick={() => {
                      set('permissions', [...draft.permissions, { name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole }]);
                      setInviteEmail('');
                      toast('Invitation added – save to send it');
                    }}
                  >
                    Invite
                  </Button>
                </div>
              </Row>
            )}
            {tab === 'community' && (
              <>
                <Row title="Automated filters" desc="Comments containing these words or from these users will be held for review.">
                  <div className="flex flex-col gap-4">
                    <TextAreaField label="Moderators" value={draft.moderators} onChange={(v) => set('moderators', v)} rows={2} helper="Handles, separated by commas" />
                    <TextAreaField label="Approved users" value={draft.approvedUsers} onChange={(v) => set('approvedUsers', v)} rows={2} helper="Comments from these users are always published" />
                    <TextAreaField label="Blocked words" value={draft.blockedWords} onChange={(v) => set('blockedWords', v)} rows={2} helper="Comments containing these words will be held for review" />
                    <label className="flex items-center gap-4 text-sm"><Toggle checked={draft.holdLinks} onChange={(v) => set('holdLinks', v)} label="Block links" /> Hold comments with links for review</label>
                  </div>
                </Row>
                <Row title="Default comment settings" desc="Hold potentially inappropriate comments for review">
                  <Radio name="inap" checked={draft.holdPotentiallyInappropriate === 'none'} onChange={() => set('holdPotentiallyInappropriate', 'none')} label="None" description="Don't hold any comments for review" />
                  <Radio name="inap" checked={draft.holdPotentiallyInappropriate === 'basic'} onChange={() => set('holdPotentiallyInappropriate', 'basic')} label="Basic" description="Hold potentially inappropriate comments for review" />
                  <Radio name="inap" checked={draft.holdPotentiallyInappropriate === 'strict'} onChange={() => set('holdPotentiallyInappropriate', 'strict')} label="Strict" description="Hold a broader range of potentially inappropriate comments" />
                </Row>
              </>
            )}
            {tab === 'agreements' && (
              <>
                {['YouTube Partner Programme Terms (accepted)', 'Commerce Product Module (accepted)', 'Shorts Monetisation Module (accepted)', 'Copyright Match Tool terms (accepted)'].map((a) => (
                  <Row key={a} title={a.replace(' (accepted)', '')}>
                    <span className="flex items-center gap-2 text-sm text-[#2ba640]"><CheckCircle2 size={18} /> Accepted</span>
                  </Row>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-black/[0.1] px-6 py-3">
          <Button variant="text" onClick={closeSettings}>Close</Button>
          <Button
            variant="primary"
            disabled={!dirty}
            onClick={() => {
              setSettings(draft);
              setProfile(prof);
              toast('Settings saved');
            }}
          >
            Save
          </Button>
        </div>
      </div>
      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset the simulator?" body="All your edits, replies, uploads and settings will be cleared and the original channel data will be restored." confirmLabel="Reset" onConfirm={resetSimulator} danger />
    </div>,
    document.body,
  );
}
