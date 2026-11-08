import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Info, Mail, Archive, RotateCcw, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { Tabs, Radio, TextAreaField, Checkbox } from '../components/common/Controls';
import { useStudio } from '../store/StudioContext';
import { VideoThumb } from '../components/common/VideoThumb';
import { Button } from '../components/common/Button';
import { MenuItem, Popover, useMenu } from '../components/common/Popover';
import { Modal } from '../components/common/Modal';
import { EmptyArt, EmptyState } from '../components/common/Card';
import { formatDate, formatInt, formatSubs, timeAgo } from '../lib/format';
import type { ContentClaim, CopyrightMatch } from '../data/library';
import { LetterAvatar } from '../components/common/Avatar';
import { avatarColourFor } from '../data/comments';

type Action = 'trim' | 'replace' | 'mute' | 'dispute';

function ClaimActions({ claim }: { claim: ContentClaim }) {
  const { updateClaim, updateVideo, toast } = useStudio();
  const menu = useMenu();
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState('licence');
  const [explanation, setExplanation] = useState('');
  const [agree, setAgree] = useState(false);
  const resolve = (resolution: string) => {
    updateClaim(claim.id, { status: 'resolved', resolution });
    updateVideo(claim.videoId, { restriction: 'none', monetisation: 'on' });
    toast('Claim released – monetisation restored on this video');
    setAction(null);
  };
  if (claim.status !== 'active') {
    return <span className="text-[13px] text-[#606060]">{claim.status === 'disputed' ? 'Dispute submitted · claimant has 30 days to respond' : claim.resolution}</span>;
  }
  const titles: Record<Action, string> = { trim: 'Trim out segment', replace: 'Replace song', mute: 'Mute song', dispute: 'Dispute claim' };
  return (
    <>
      <Button variant="tonal" size="sm" ref={menu.ref} onClick={menu.toggle}>
        Select action <ChevronDown size={16} />
      </Button>
      <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} align="right" width={220}>
        {(Object.keys(titles) as Action[]).map((a) => (
          <MenuItem key={a} onClick={() => (menu.close(), setAction(a))}>
            {titles[a]}
          </MenuItem>
        ))}
      </Popover>
      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={action ? titles[action] : ''}
        width={560}
        footer={
          <>
            <Button variant="text" onClick={() => setAction(null)}>Cancel</Button>
            {action === 'dispute' ? (
              <Button
                variant="primary"
                disabled={!agree || explanation.trim().length < 20}
                onClick={() => {
                  updateClaim(claim.id, { status: 'disputed' });
                  toast('Dispute submitted');
                  setAction(null);
                }}
              >
                Submit dispute
              </Button>
            ) : (
              <Button variant="primary" onClick={() => resolve(action === 'trim' ? `Segment ${claim.segment} trimmed` : action === 'replace' ? 'Song replaced with “Legions of the North” (Audio Library)' : 'Song muted')}>
                Continue
              </Button>
            )}
          </>
        }
      >
        {action === 'dispute' ? (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-[#606060]">Only dispute if you're confident you have the rights to use this content.</p>
            <Radio name="reason" checked={reason === 'licence'} onChange={() => setReason('licence')} label="I have a licence or written permission" />
            <Radio name="reason" checked={reason === 'fair'} onChange={() => setReason('fair')} label="My use qualifies as fair dealing / fair use" />
            <Radio name="reason" checked={reason === 'original'} onChange={() => setReason('original')} label="The content is my original work" />
            <Radio name="reason" checked={reason === 'public'} onChange={() => setReason('public')} label="The content is in the public domain" />
            <TextAreaField label="Explanation" value={explanation} onChange={setExplanation} rows={3} maxLength={1000} helper="At least 20 characters" />
            <Checkbox checked={agree} onChange={setAgree} label="I understand that submitting fraudulent disputes may result in the termination of my channel" />
          </div>
        ) : (
          <div className="text-sm leading-6">
            <p>
              {action === 'trim' && <>The segment <b>{claim.segment}</b> will be removed from your video. Processing can take a few hours, and the claim will be released when it's done.</>}
              {action === 'replace' && <>The claimed song will be replaced with a track from the YouTube Audio Library. Other audio in that section will be preserved.</>}
              {action === 'mute' && <>Only the claimed song will be muted – narration and sound effects remain. The claim will be released after processing.</>}
            </p>
            <div className="mt-4 flex gap-2 rounded-lg bg-[#e8f0fe] p-3 text-[13px] text-[#1a3a6b]">
              <Info size={18} className="shrink-0" /> Views, comments and the video URL stay the same.
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export function ClaimsTable({ videoId }: { videoId?: string }) {
  const { claims, allVideos } = useStudio();
  const navigate = useNavigate();
  const list = claims.filter((c) => !videoId || c.videoId === videoId);
  if (!list.length)
    return (
      <div className="flex items-center gap-3 px-6 py-8 text-sm">
        <CheckCircle2 className="text-[#2ba640]" /> No copyright issues found.
      </div>
    );
  return (
    <table className="w-full text-left text-[13px]">
      <thead>
        <tr className="h-12 border-b border-black/[0.1] text-xs text-[#606060]">
          {!videoId && <th className="pl-6 font-medium">Video</th>}
          <th className={`font-medium ${videoId ? 'pl-6' : ''}`}>Content used</th>
          <th className="font-medium">Claim type</th>
          <th className="font-medium">Impact</th>
          <th className="pr-6 text-right font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {list.map((c) => {
          const v = allVideos.find((x) => x.id === c.videoId);
          return (
            <tr key={c.id} className="border-b border-black/[0.1]">
              {!videoId && (
                <td className="py-3 pl-6">
                  {v && (
                    <button className="flex items-center gap-3 text-left" onClick={() => navigate(`/video/${v.id}/copyright`)}>
                      <VideoThumb video={v} width={120} />
                      <span className="line-clamp-2 max-w-[260px]">{v.title}</span>
                    </button>
                  )}
                </td>
              )}
              <td className={`py-3 ${videoId ? 'pl-6' : ''}`}>
                <div className="font-medium">{c.asset}</div>
                <div className="text-xs text-[#606060]">Claimed by {c.claimant} · {c.segment}</div>
              </td>
              <td>
                Content ID<div className="text-xs text-[#606060]">{timeAgo(c.at)}</div>
              </td>
              <td className="max-w-[220px]">{c.status === 'resolved' ? <span className="text-[#2ba640]">No impact</span> : c.impact}</td>
              <td className="pr-6 text-right">
                <ClaimActions claim={c} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function MatchRow({ m }: { m: CopyrightMatch }) {
  const { allVideos, updateMatch, toast } = useStudio();
  const v = allVideos.find((x) => x.id === m.videoId);
  const [dialog, setDialog] = useState<'removal' | 'message' | null>(null);
  const [timing, setTiming] = useState<'7days' | 'now'>('7days');
  const [prevent, setPrevent] = useState(true);
  const [message, setMessage] = useState(`Hi, this is The Past Explained. Your upload “${m.matchTitle}” uses our documentary footage without permission. Please remove it or credit and link the original. Thanks!`);
  return (
    <tr className="border-b border-black/[0.1]">
      <td className="py-3 pl-6">
        {v && (
          <div className="flex items-center gap-3">
            <VideoThumb video={v} width={96} />
            <span className="line-clamp-2 max-w-[200px]">{v.title}</span>
          </div>
        )}
      </td>
      <td>
        <div className="flex items-center gap-3">
          <LetterAvatar name={m.channel} color={avatarColourFor(m.channel)} size={32} />
          <div>
            <div className="line-clamp-1 font-medium">{m.matchTitle}</div>
            <div className="text-xs text-[#606060]">{m.channel} · {formatSubs(m.channelSubs)} subscribers · {formatInt(m.matchViews)} views · uploaded {formatDate(m.uploadedAt)}</div>
          </div>
        </div>
      </td>
      <td>
        <div>{m.matchPercent}%</div>
        <div className="text-xs text-[#606060]">{m.matchLength} matched</div>
      </td>
      <td className="pr-6 text-right">
        {m.status === 'new' && (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="tonal" onClick={() => setDialog('removal')}>Request removal</Button>
            <Button size="sm" variant="text" onClick={() => setDialog('message')}>Message</Button>
            <Button size="sm" variant="text" onClick={() => (updateMatch(m.id, 'archived'), toast('Match archived', 'Undo', () => updateMatch(m.id, 'new')))}>Archive</Button>
          </div>
        )}
        {m.status === 'removal-requested' && <span className="text-[#606060]">Removal requested</span>}
        {m.status === 'contacted' && <span className="text-[#606060]">Channel contacted</span>}
        {m.status === 'archived' && (
          <Button size="sm" variant="text" icon={<RotateCcw size={16} />} onClick={() => updateMatch(m.id, 'new')}>Restore</Button>
        )}
      </td>
      <Modal
        open={dialog === 'removal'}
        onClose={() => setDialog(null)}
        title="Request removal"
        width={560}
        footer={
          <>
            <Button variant="text" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => { updateMatch(m.id, 'removal-requested'); setDialog(null); toast('Copyright removal request submitted'); }}>Submit</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-sm">
          <p>You're asking YouTube to remove <b>{m.matchTitle}</b> from {m.channel} for using your content.</p>
          <Radio name={`t-${m.id}`} checked={timing === '7days'} onChange={() => setTiming('7days')} label="Scheduled: send a 7-day notice" description="The uploader has 7 days to remove the video before a copyright strike." />
          <Radio name={`t-${m.id}`} checked={timing === 'now'} onChange={() => setTiming('now')} label="Standard: remove now" description="The video will be removed and the uploader will receive a copyright strike." />
          <Checkbox checked={prevent} onChange={setPrevent} label="Prevent copies of this video from appearing on YouTube in the future" />
          <p className="flex gap-2 rounded-lg bg-[#fef7e0] p-3 text-xs leading-5 text-[#5f4b00]"><ShieldAlert size={16} className="shrink-0" /> Submitting a removal request is a legal process. Abusing it can result in your account being suspended.</p>
        </div>
      </Modal>
      <Modal
        open={dialog === 'message'}
        onClose={() => setDialog(null)}
        title={`Message ${m.channel}`}
        width={560}
        footer={
          <>
            <Button variant="text" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="primary" disabled={!message.trim()} onClick={() => { updateMatch(m.id, 'contacted'); setDialog(null); toast('Message sent'); }}>Send</Button>
          </>
        }
      >
        <TextAreaField label="Message" value={message} onChange={setMessage} rows={5} maxLength={1000} />
      </Modal>
    </tr>
  );
}

function MatchesTable({ status, videoId }: { status: CopyrightMatch['status'][]; videoId?: string }) {
  const { matches } = useStudio();
  const list = matches.filter((m) => status.includes(m.status) && (!videoId || m.videoId === videoId));
  if (!list.length)
    return <EmptyState art={<EmptyArt kind="search" />} title={status.includes('archived') ? 'Nothing archived' : 'No matches'} body="The Copyright Match Tool scans YouTube for re-uploads of your videos." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-[13px]">
        <thead>
          <tr className="h-12 border-b border-black/[0.1] text-xs text-[#606060]">
            <th className="pl-6 font-medium">Your video</th>
            <th className="font-medium">Matched video</th>
            <th className="font-medium">Match</th>
            <th className="pr-6 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => (
            <MatchRow key={m.id} m={m} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VideoCopyright({ videoId }: { videoId: string }) {
  return (
    <div>
      <div className="px-6 pt-4 text-[15px] font-medium">Copyright claims</div>
      <ClaimsTable videoId={videoId} />
      <div className="mt-6 px-6 text-[15px] font-medium">Copies of this video found on YouTube</div>
      <MatchesTable status={['new', 'removal-requested', 'contacted']} videoId={videoId} />
    </div>
  );
}

export function CopyrightPage() {
  const { tab = 'claims' } = useParams();
  const navigate = useNavigate();
  const { matches, claims } = useStudio();
  const newMatches = matches.filter((m) => m.status === 'new').length;
  const activeClaims = claims.filter((c) => c.status === 'active').length;
  return (
    <div>
      <PageHeader title="Channel copyright" />
      <div className="mx-8 mt-2 flex items-center gap-4 rounded-xl bg-[#f9f9f9] p-4 text-sm max-sm:mx-4">
        <CheckCircle2 className="shrink-0 text-[#2ba640]" />
        <div className="flex-1">
          <div className="font-medium">No copyright strikes</div>
          <div className="text-[13px] text-[#606060]">Your channel is in good standing. {activeClaims ? `${activeClaims} active Content ID claim${activeClaims > 1 ? 's' : ''} – claims don't affect your channel standing.` : 'No active Content ID claims.'}</div>
        </div>
      </div>
      <Tabs
        className="mt-4 px-5"
        tabs={[
          { value: 'claims', label: 'Claims', badge: activeClaims },
          { value: 'matches', label: 'Matches', badge: newMatches },
          { value: 'removal', label: 'Removal requests' },
          { value: 'messages', label: 'Messages' },
          { value: 'archive', label: 'Archive' },
        ]}
        value={tab}
        onChange={(t) => navigate(`/copyright/${t}`)}
      />
      {tab === 'claims' && <ClaimsTable />}
      {tab === 'matches' && <MatchesTable status={['new']} />}
      {tab === 'removal' && <MatchesTable status={['removal-requested']} />}
      {tab === 'archive' && <MatchesTable status={['archived']} />}
      {tab === 'messages' && (
        <div>
          {matches.filter((m) => m.status === 'contacted').length === 0 ? (
            <EmptyState art={<EmptyArt kind="mail" />} title="No messages" body="Messages you send to channels that re-upload your content will appear here." />
          ) : (
            matches
              .filter((m) => m.status === 'contacted')
              .map((m) => (
                <div key={m.id} className="flex items-center gap-4 border-b border-black/[0.1] px-6 py-4 text-sm">
                  <Mail className="text-[#606060]" />
                  <div className="flex-1">
                    <div className="font-medium">To {m.channel}</div>
                    <div className="text-[13px] text-[#606060]">About “{m.matchTitle}” · Awaiting reply</div>
                  </div>
                  <Archive size={18} className="text-[#909090]" />
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
