import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { useStudio } from '../../store/StudioContext';
import { ChannelAvatar } from '../common/Avatar';
import { NavIcon, type NavIconName } from '../common/StudioIcons';
import { Tooltip } from '../common/Tooltip';
import { VideoThumb } from '../common/VideoThumb';

interface Item {
  to: string;
  label: string;
  icon: NavIconName;
  match?: string;
}

const CHANNEL_ITEMS: Item[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/content', label: 'Content', icon: 'content' },
  { to: '/analytics', label: 'Analytics', icon: 'analytics' },
  { to: '/community', label: 'Community', icon: 'community' },
  { to: '/subtitles', label: 'Subtitles', icon: 'subtitles' },
  { to: '/copyright', label: 'Copyright', icon: 'copyright' },
  { to: '/earn', label: 'Earn', icon: 'earn' },
  { to: '/customisation', label: 'Customisation', icon: 'customisation' },
  { to: '/audio-library', label: 'Audio Library', icon: 'audio' },
];

function videoItems(id: string): Item[] {
  return [
    { to: `/video/${id}/edit`, label: 'Details', icon: 'details' },
    { to: `/video/${id}/analytics`, label: 'Analytics', icon: 'analytics' },
    { to: `/video/${id}/editor`, label: 'Editor', icon: 'editor' },
    { to: `/video/${id}/comments`, label: 'Comments', icon: 'community' },
    { to: `/video/${id}/subtitles`, label: 'Subtitles', icon: 'subtitles' },
    { to: `/video/${id}/copyright`, label: 'Copyright', icon: 'copyright' },
    { to: `/video/${id}/monetisation`, label: 'Earn', icon: 'earn' },
    { to: `/video/${id}/clips`, label: 'Clips', icon: 'clips' },
  ];
}

function NavRow({ item, collapsed, onNavigate }: { item: Item; collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  const content = (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={`group relative flex items-center transition-colors ${
        collapsed ? 'mx-auto h-12 w-12 justify-center rounded-xl' : 'h-12 gap-6 px-6'
      } ${active ? 'bg-black/[0.05] text-[#cc0000]' : 'text-[#0f0f0f] hover:bg-black/[0.05]'}`}
    >
      <NavIcon name={item.icon} active={active} className={active ? 'text-[#cc0000]' : 'text-[#606060] group-hover:text-[#0f0f0f]'} />
      {!collapsed && <span className={`truncate text-[15px] ${active ? 'font-medium' : ''}`}>{item.label}</span>}
    </NavLink>
  );
  return collapsed ? (
    <Tooltip content={item.label} placement="bottom" className="block w-full">
      {content}
    </Tooltip>
  ) : (
    content
  );
}

function FooterRow({ label, icon, onClick, collapsed }: { label: string; icon: NavIconName; onClick: () => void; collapsed: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center text-[#0f0f0f] transition-colors hover:bg-black/[0.05] ${collapsed ? 'mx-auto h-12 w-12 justify-center rounded-xl' : 'h-12 gap-6 px-6'}`}
      title={collapsed ? label : undefined}
    >
      <NavIcon name={icon} className="text-[#606060] group-hover:text-[#0f0f0f]" />
      {!collapsed && <span className="text-[15px]">{label}</span>}
    </button>
  );
}

export function Sidebar({ collapsed, mobileOpen, onNavigate }: { collapsed: boolean; mobileOpen: boolean; onNavigate: () => void }) {
  const { profile, allVideos, openSettings, setFeedbackOpen, toast } = useStudio();
  const location = useLocation();
  const navigate = useNavigate();
  const videoMatch = /^\/video\/([^/]+)/.exec(location.pathname);
  const video = videoMatch ? allVideos.find((v) => v.id === videoMatch[1]) : undefined;
  const wide = !collapsed || mobileOpen;

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-30 flex flex-col overflow-y-auto overflow-x-hidden border-r border-black/[0.1] bg-white transition-[width,transform] duration-200 no-scrollbar ${
        wide ? 'w-[255px]' : 'w-[72px]'
      } ${mobileOpen ? 'translate-x-0 shadow-dialog' : 'max-[699px]:-translate-x-full'}`}
    >
      {video ? (
        <div className={wide ? '' : 'pt-2'}>
          {wide ? (
            <>
              <button onClick={() => navigate('/content')} className="flex h-12 w-full items-center gap-6 px-6 text-[15px] text-[#0f0f0f] hover:bg-black/[0.05]">
                <ArrowLeft size={22} strokeWidth={1.6} className="text-[#606060]" /> Channel content
              </button>
              <div className="px-4 pb-3 pt-1">
                <div className="group relative cursor-pointer overflow-hidden rounded-lg" onClick={() => toast('Playback preview is not available for simulated videos')}>
                  <VideoThumb video={video} width="100%" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white">
                      <Play size={24} fill="white" />
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[13px] font-medium text-[#0f0f0f]">Your video</div>
                <div className="mt-0.5 line-clamp-2 text-[13px] leading-[18px] text-[#606060]">{video.title}</div>
              </div>
            </>
          ) : (
            <button onClick={() => navigate('/content')} className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl hover:bg-black/[0.05]" title="Channel content">
              <ArrowLeft size={22} className="text-[#606060]" />
            </button>
          )}
          <nav className={wide ? '' : 'flex flex-col gap-1'}>
            {videoItems(video.id).map((item) => (
              <NavRow key={item.to} item={item} collapsed={!wide} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>
      ) : (
        <div>
          {wide ? (
            <div className="flex flex-col items-center px-6 pb-3 pt-4">
              <button className="group relative rounded-full" onClick={() => navigate('/customisation')} aria-label="Customise channel">
                <ChannelAvatar size={112} styleIndex={profile.avatarStyle} />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                  <ExternalLink size={22} />
                </span>
              </button>
              <div className="mt-4 text-[15px] font-medium text-[#0f0f0f]">Your channel</div>
              <div className="mt-0.5 max-w-full truncate text-[13px] text-[#606060]">{profile.name}</div>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <ChannelAvatar size={32} styleIndex={profile.avatarStyle} />
            </div>
          )}
          <nav className={wide ? '' : 'flex flex-col gap-1'}>
            {CHANNEL_ITEMS.map((item) => (
              <NavRow key={item.to} item={item} collapsed={!wide} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>
      )}

      <div className="mt-auto pb-2 pt-4">
        <FooterRow label="Settings" icon="settings" collapsed={!wide} onClick={() => openSettings('general')} />
        <FooterRow label="Send feedback" icon="feedback" collapsed={!wide} onClick={() => setFeedbackOpen(true)} />
        {wide && <p className="px-6 pb-2 pt-3 text-[11px] leading-4 text-[#909090]">Simulator with fictional data. Not affiliated with YouTube.</p>}
      </div>
    </aside>
  );
}
