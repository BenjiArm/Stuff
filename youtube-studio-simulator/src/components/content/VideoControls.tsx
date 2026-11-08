import { useState } from 'react';
import { Eye, EyeOff, Link2, Lock, Clock, FileText, ChevronDown, Info } from 'lucide-react';
import type { Monetisation, Video, Visibility } from '../../data/types';
import { Popover, useMenu } from '../common/Popover';
import { Radio } from '../common/Controls';
import { Button } from '../common/Button';
import { MonetisationIcon } from '../common/StudioIcons';
import { monetisationLabel, visibilityLabel } from '../../lib/videoStats';
import { useStudio } from '../../store/StudioContext';

export function VisibilityIcon({ v, size = 20 }: { v: Visibility; size?: number }) {
  const p = { size, strokeWidth: 1.7, className: 'shrink-0 text-[#606060]' };
  switch (v) {
    case 'public':
      return <Eye {...p} className="shrink-0 text-[#2ba640]" />;
    case 'unlisted':
      return <Link2 {...p} />;
    case 'private':
      return <Lock {...p} />;
    case 'scheduled':
      return <Clock {...p} />;
    case 'draft':
      return <FileText {...p} />;
  }
}

/** Inline visibility editor ("Save or publish") as used in the Content table. */
export function VisibilityCell({ video }: { video: Video }) {
  const menu = useMenu();
  const { updateVideo, toast } = useStudio();
  const [choice, setChoice] = useState<Visibility>(video.visibility);
  const editable = video.visibility !== 'draft';
  return (
    <>
      <button
        ref={menu.ref}
        onClick={(e) => {
          e.stopPropagation();
          if (!editable) return;
          setChoice(video.visibility);
          menu.toggle();
        }}
        className={`group/v flex items-center gap-2 rounded px-1 py-1 text-left text-[13px] text-[#0f0f0f] ${editable ? 'hover:bg-black/[0.05]' : 'cursor-default'}`}
      >
        <VisibilityIcon v={video.visibility} />
        <span>{visibilityLabel[video.visibility]}</span>
        {editable && <ChevronDown size={16} className="text-[#606060] opacity-0 group-hover/v:opacity-100" />}
      </button>
      <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} width={320} className="px-0">
        <div onClick={(e) => e.stopPropagation()} className="px-5 pb-2 pt-2">
          <div className="text-[15px] font-medium">Save or publish</div>
          <div className="mt-2">
            <Radio name={`vis-${video.id}`} checked={choice === 'private'} onChange={() => setChoice('private')} label="Private" description="Only you and people you choose can watch" />
            <Radio name={`vis-${video.id}`} checked={choice === 'unlisted'} onChange={() => setChoice('unlisted')} label="Unlisted" description="Anyone with the link can watch" />
            <Radio name={`vis-${video.id}`} checked={choice === 'public'} onChange={() => setChoice('public')} label="Public" description="Everyone can watch your video" />
            {video.visibility === 'scheduled' && (
              <Radio name={`vis-${video.id}`} checked={choice === 'scheduled'} onChange={() => setChoice('scheduled')} label="Scheduled" description={video.scheduledFor ? `Premieres ${new Date(video.scheduledFor).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : undefined} />
            )}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="text" onClick={menu.close}>Cancel</Button>
            <Button
              variant="primary"
              disabled={choice === video.visibility}
              onClick={() => {
                const patch: Partial<Video> = { visibility: choice };
                if (video.visibility === 'scheduled' && choice === 'public') patch.publishedAt = Date.now();
                updateVideo(video.id, patch);
                menu.close();
                toast(`Video ${choice === 'public' ? 'published' : `saved as ${visibilityLabel[choice].toLowerCase()}`}`);
              }}
            >
              {choice === 'public' && video.visibility !== 'public' ? 'Publish' : 'Save'}
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
}

export function MonetisationCell({ video }: { video: Video }) {
  const menu = useMenu();
  const { updateVideo, toast } = useStudio();
  const [choice, setChoice] = useState<Monetisation>(video.monetisation);
  const disabled = video.visibility === 'draft' || video.uploaded;
  return (
    <>
      <button
        ref={menu.ref}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          setChoice(video.monetisation === 'off' ? 'off' : 'on');
          menu.toggle();
        }}
        className={`group/m flex items-center gap-2 rounded px-1 py-1 text-[13px] ${disabled ? 'cursor-default text-[#909090]' : 'text-[#0f0f0f] hover:bg-black/[0.05]'}`}
      >
        <MonetisationIcon status={disabled ? 'off' : video.monetisation} />
        <span>{disabled ? 'Off' : monetisationLabel[video.monetisation]}</span>
        {!disabled && <ChevronDown size={16} className="text-[#606060] opacity-0 group-hover/m:opacity-100" />}
      </button>
      <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} width={340}>
        <div onClick={(e) => e.stopPropagation()} className="px-5 pb-2 pt-2">
          <div className="text-[15px] font-medium">Monetisation</div>
          {video.monetisation === 'limited' && (
            <div className="mt-2 flex gap-2 rounded-lg bg-[#fef7e0] p-3 text-xs leading-[18px] text-[#5f4b00]">
              <Info size={16} className="shrink-0" /> Limited or no ads: this video isn't suitable for most advertisers. You can request a human review from the video's Earn page.
            </div>
          )}
          {video.monetisation === 'claimed' && (
            <div className="mt-2 flex gap-2 rounded-lg bg-[#f2f2f2] p-3 text-xs leading-[18px] text-[#3c3c3c]">
              <Info size={16} className="shrink-0" /> A Content ID claim means the claimant earns ad revenue from this video. Resolve the claim in Copyright to monetise it yourself.
            </div>
          )}
          <div className="mt-2">
            <Radio name={`mon-${video.id}`} checked={choice === 'on'} onChange={() => setChoice('on')} label="On" description="Show ads on this video" />
            <Radio name={`mon-${video.id}`} checked={choice === 'off'} onChange={() => setChoice('off')} label="Off" description="Don't show ads or earn revenue" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="text" onClick={menu.close}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const next: Monetisation = choice === 'off' ? 'off' : video.monetisation === 'off' ? 'on' : video.monetisation;
                updateVideo(video.id, { monetisation: next });
                menu.close();
                toast(`Monetisation turned ${choice === 'off' ? 'off' : 'on'}`);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
}

export function EyeOffIcon() {
  return <EyeOff size={20} />;
}
