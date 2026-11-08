import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CircleHelp,
  Menu,
  Search,
  X,
  SquarePlay,
  Radio,
  SquarePen,
  ListVideo,
  Mic,
  ChevronRight,
  LogOut,
  UserRoundCog,
  Globe,
  Moon,
  Settings,
  MessageSquareWarning,
  ExternalLink,
  BookOpen,
  GraduationCap,
  CircleDollarSign,
  BadgeCheck,
  Copyright as CopyrightIcon,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import { useStudio } from '../../store/StudioContext';
import { IconButton } from '../common/Button';
import { MenuDivider, MenuItem, Popover, useMenu } from '../common/Popover';
import { ChannelAvatar } from '../common/Avatar';
import { YouTubeStudioLogo } from '../common/StudioIcons';
import { VideoThumb } from '../common/VideoThumb';
import { timeAgo } from '../../lib/format';
import { Modal } from '../common/Modal';

export function Header({ onMenu }: { onMenu: () => void }) {
  const { videos, profile, notifications, markNotification, markAllNotificationsRead, setUploadOpen, openSettings, setFeedbackOpen, toast } = useStudio();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const create = useMenu();
  const help = useMenu();
  const bell = useMenu();
  const account = useMenu();
  const [liveOpen, setLiveOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return videos.filter((v) => v.title.toLowerCase().includes(q) || v.tags.some((t) => t.includes(q))).slice(0, 6);
  }, [query, videos]);

  const unread = notifications.filter((n) => !n.read).length;

  const submitSearch = () => {
    if (!query.trim()) return;
    navigate(`/content/videos?q=${encodeURIComponent(query.trim())}`);
    setFocused(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-black/[0.1] bg-white pl-4 pr-6 max-sm:pl-2 max-sm:pr-3">
      <div className="flex w-[240px] shrink-0 items-center gap-3 max-md:w-auto max-sm:gap-1">
        <IconButton label="Menu" onClick={onMenu}>
          <Menu size={24} strokeWidth={1.6} />
        </IconButton>
        <Link to="/dashboard" aria-label="YouTube Studio home" className="flex items-center">
          <YouTubeStudioLogo />
        </Link>
      </div>

      <div className={`min-w-0 flex-1 justify-center px-4 ${mobileSearch ? 'absolute inset-x-0 top-0 z-10 flex h-16 items-center bg-white px-3' : 'flex max-sm:invisible'}`}>
        <div ref={searchRef} className="relative w-full max-w-[740px]">
          <div
            className={`flex h-10 items-center rounded-lg border bg-white transition-shadow ${focused ? 'border-[#065fd4] shadow-[0_0_0_1px_#065fd4]' : 'border-black/[0.2]'}`}
          >
            <Search size={20} className="ml-3 mr-2 shrink-0 text-[#606060]" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 150)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder="Search across your channel"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#0f0f0f] outline-none placeholder:text-[#606060]"
            />
            {(query || mobileSearch) && (
              <IconButton label="Clear search" size={32} className="mr-1" onClick={() => (setQuery(''), setMobileSearch(false))}>
                <X size={18} />
              </IconButton>
            )}
          </div>
          {focused && query.trim() && (
            <div className="absolute left-0 right-0 top-12 z-50 animate-pop-in overflow-hidden rounded-xl bg-white py-2 shadow-menu">
              {results.length === 0 && <div className="px-4 py-3 text-sm text-[#606060]">No results for “{query}”</div>}
              {results.map((v) => (
                <button
                  key={v.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    navigate(`/video/${v.id}/edit`);
                    setFocused(false);
                    setQuery('');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-black/[0.05]"
                >
                  <VideoThumb video={v} width={88} showDuration={false} rounded="rounded" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm text-[#0f0f0f]">{v.title}</span>
                    <span className="text-xs text-[#606060]">{v.kind === 'short' ? 'Short' : 'Video'} · {v.visibility[0].toUpperCase() + v.visibility.slice(1)}</span>
                  </span>
                </button>
              ))}
              {results.length > 0 && (
                <button onMouseDown={(e) => e.preventDefault()} onClick={submitSearch} className="flex w-full items-center gap-3 border-t border-black/[0.1] px-4 pb-1 pt-3 text-left text-sm text-[#065fd4] hover:underline">
                  <Search size={16} /> See all results in Content
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 max-sm:gap-0">
        <IconButton label="Search" className="sm:hidden" onClick={() => setMobileSearch(true)}>
          <Search size={22} strokeWidth={1.6} />
        </IconButton>
        <IconButton label="Help" ref={help.ref} onClick={help.toggle} className="max-sm:hidden">
          <CircleHelp size={24} strokeWidth={1.6} />
        </IconButton>
        <Popover anchor={help.ref} open={help.open} onClose={help.close} align="right" width={300}>
          <div className="px-4 pb-2 pt-1 text-base font-medium">Help</div>
          {[
            { icon: <BookOpen size={20} />, label: 'Help Centre' },
            { icon: <GraduationCap size={20} />, label: 'Creator Academy' },
            { icon: <TrendingUp size={20} />, label: 'Growing your channel' },
            { icon: <CircleDollarSign size={20} />, label: 'YouTube Partner Programme overview' },
            { icon: <CopyrightIcon size={20} />, label: 'Copyright on YouTube' },
            { icon: <Lightbulb size={20} />, label: 'Disclosing altered or synthetic content' },
          ].map((i) => (
            <MenuItem
              key={i.label}
              icon={i.icon}
              trailing={<ExternalLink size={16} className="text-[#606060]" />}
              onClick={() => {
                help.close();
                toast('Help articles are not available in this offline simulator');
              }}
            >
              {i.label}
            </MenuItem>
          ))}
          <MenuDivider />
          <MenuItem
            icon={<MessageSquareWarning size={20} />}
            onClick={() => {
              help.close();
              setFeedbackOpen(true);
            }}
          >
            Send feedback
          </MenuItem>
        </Popover>

        <IconButton label="Notifications" ref={bell.ref} onClick={bell.toggle} className="relative">
          <Bell size={24} strokeWidth={1.6} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#cc0000] px-1 text-[10px] font-medium text-white">{unread}</span>
          )}
        </IconButton>
        <Popover anchor={bell.ref} open={bell.open} onClose={bell.close} align="right" width={420} className="max-h-[560px] overflow-y-auto !py-0">
          <div className="sticky top-0 flex items-center border-b border-black/[0.1] bg-white px-4 py-3">
            <span className="flex-1 text-base font-medium">Notifications</span>
            <button className="text-sm font-medium text-[#065fd4] hover:underline disabled:text-[#909090] disabled:no-underline" disabled={!unread} onClick={markAllNotificationsRead}>
              Mark all as read
            </button>
          </div>
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                markNotification(n.id, true);
                bell.close();
                if (n.link) navigate(n.link);
              }}
              className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-black/[0.05] ${n.read ? '' : 'bg-[#f2f8ff]'}`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-[#065fd4]'}`} />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[#0f0f0f]">
                {n.kind === 'payment' || n.kind === 'monetisation' ? (
                  <CircleDollarSign size={20} />
                ) : n.kind === 'copyright' ? (
                  <CopyrightIcon size={20} />
                ) : n.kind === 'subscriber' ? (
                  <BadgeCheck size={20} />
                ) : n.kind === 'tip' ? (
                  <Lightbulb size={20} />
                ) : (
                  <TrendingUp size={20} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#0f0f0f]">{n.title}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-[#606060]">{n.body}</span>
                <span className="mt-1 block text-xs text-[#909090]">{timeAgo(n.at)}</span>
              </span>
            </button>
          ))}
        </Popover>

        <button
          ref={create.ref}
          onClick={create.toggle}
          className="ml-1 flex h-9 items-center gap-2 rounded-full border border-black/[0.1] px-3 text-sm font-medium text-[#0f0f0f] hover:bg-black/[0.05] max-sm:border-0 max-sm:px-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff0000" strokeWidth="1.7" aria-hidden>
            <rect x="2.5" y="5.5" width="13.5" height="13" rx="2" />
            <path d="M16 10.2l5.3-3v9.6l-5.3-3" strokeLinejoin="round" />
            <path d="M9.2 9v6M6.2 12h6" stroke="#ff0000" strokeLinecap="round" />
          </svg>
          <span className="max-sm:hidden">Create</span>
        </button>
        <Popover anchor={create.ref} open={create.open} onClose={create.close} align="right" width={220}>
          <MenuItem icon={<SquarePlay size={20} strokeWidth={1.6} />} onClick={() => (create.close(), setUploadOpen(true))}>
            Upload videos
          </MenuItem>
          <MenuItem icon={<Radio size={20} strokeWidth={1.6} />} onClick={() => (create.close(), setLiveOpen(true))}>
            Go live
          </MenuItem>
          <MenuItem icon={<SquarePen size={20} strokeWidth={1.6} />} onClick={() => (create.close(), navigate('/content/posts?compose=1'))}>
            Create post
          </MenuItem>
          <MenuItem icon={<ListVideo size={20} strokeWidth={1.6} />} onClick={() => (create.close(), navigate('/content/playlists?new=1'))}>
            New playlist
          </MenuItem>
          <MenuItem icon={<Mic size={20} strokeWidth={1.6} />} onClick={() => (create.close(), navigate('/content/podcasts'))}>
            New podcast
          </MenuItem>
        </Popover>

        <button ref={account.ref} onClick={account.toggle} className="ml-2 rounded-full" aria-label="Account">
          <ChannelAvatar size={32} styleIndex={profile.avatarStyle} />
        </button>
        <Popover anchor={account.ref} open={account.open} onClose={account.close} align="right" width={300}>
          <div className="flex gap-4 px-4 pb-3 pt-2">
            <ChannelAvatar size={40} styleIndex={profile.avatarStyle} />
            <div className="min-w-0">
              <div className="truncate text-base text-[#0f0f0f]">{profile.name}</div>
              <div className="truncate text-sm text-[#0f0f0f]">{profile.handle}</div>
              <button className="mt-2 text-sm text-[#065fd4] hover:underline" onClick={() => (account.close(), navigate('/customisation'))}>
                View your channel
              </button>
            </div>
          </div>
          <MenuDivider />
          <MenuItem icon={<SquarePlay size={20} strokeWidth={1.6} />} onClick={() => (account.close(), navigate('/content'))}>
            Your channel content
          </MenuItem>
          <MenuItem icon={<UserRoundCog size={20} strokeWidth={1.6} />} trailing={<ChevronRight size={18} />} onClick={() => (account.close(), toast('Only one channel is available in this simulator'))}>
            Switch account
          </MenuItem>
          <MenuItem icon={<LogOut size={20} strokeWidth={1.6} />} onClick={() => (account.close(), toast('Signing out is disabled in the simulator'))}>
            Sign out
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<Moon size={20} strokeWidth={1.6} />} trailing={<ChevronRight size={18} />} onClick={() => (account.close(), openSettings('general'))}>
            Appearance: Light
          </MenuItem>
          <MenuItem icon={<Globe size={20} strokeWidth={1.6} />} trailing={<ChevronRight size={18} />} onClick={() => (account.close(), openSettings('general'))}>
            Language: English (UK)
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<Settings size={20} strokeWidth={1.6} />} onClick={() => (account.close(), openSettings('general'))}>
            Settings
          </MenuItem>
          <MenuItem icon={<MessageSquareWarning size={20} strokeWidth={1.6} />} onClick={() => (account.close(), setFeedbackOpen(true))}>
            Send feedback
          </MenuItem>
          <div className="px-4 pb-1 pt-2 text-[11px] leading-4 text-[#909090]">Simulator · fictional channel data. Not affiliated with or endorsed by YouTube.</div>
        </Popover>
      </div>

      <Modal open={liveOpen} onClose={() => setLiveOpen(false)} title="Welcome to live streaming" width={520}
        footer={<button className="h-9 rounded-full bg-[#0f0f0f] px-4 text-sm font-medium text-white hover:bg-[#272727]" onClick={() => { setLiveOpen(false); toast('Live streaming enabled – it can take up to 24 hours to activate'); }}>Request access</button>}>
        <div className="flex gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#ffebee] text-[#cc0000]"><Radio size={36} /></div>
          <div className="text-sm leading-6 text-[#0f0f0f]">
            <p>Live streaming is available for your channel. Before your first stream, YouTube will verify your channel – this can take up to 24 hours.</p>
            <p className="mt-3 text-[#606060]">Premieres are a great alternative for documentaries: your Byzantine Empire episode is already scheduled as a premiere.</p>
          </div>
        </div>
      </Modal>
    </header>
  );
}
