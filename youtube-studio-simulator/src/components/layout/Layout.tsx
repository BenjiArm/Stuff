import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useStudio } from '../../store/StudioContext';
import { Toaster } from '../common/Toaster';
import { SettingsModal } from '../../pages/SettingsModal';
import { FeedbackDrawer } from '../../pages/FeedbackDrawer';
import { UploadDialog } from '../../pages/UploadDialog';

const TITLES: [RegExp, string][] = [
  [/^\/dashboard/, 'Channel dashboard'],
  [/^\/content/, 'Channel content'],
  [/^\/analytics/, 'Channel analytics'],
  [/^\/community/, 'Channel community'],
  [/^\/subtitles/, 'Channel subtitles'],
  [/^\/copyright/, 'Channel copyright'],
  [/^\/earn/, 'Channel monetisation'],
  [/^\/customisation/, 'Channel customisation'],
  [/^\/audio-library/, 'Audio Library'],
  [/^\/video\/[^/]+\/analytics/, 'Video analytics'],
  [/^\/video\/[^/]+\/comments/, 'Video comments'],
  [/^\/video\/[^/]+/, 'Video details'],
];

function useWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

export function Layout({ children }: { children: ReactNode }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useStudio();
  const location = useLocation();
  const width = useWidth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = width < 700;
  const autoCollapsed = width < 1180;
  const collapsed = isMobile ? true : sidebarCollapsed || autoCollapsed;

  useEffect(() => {
    const t = TITLES.find(([re]) => re.test(location.pathname));
    document.title = `${t ? t[1] : 'YouTube Studio'} - YouTube Studio (Simulator)`;
    window.scrollTo({ top: 0 });
    setMobileOpen(false);
  }, [location.pathname]);

  const onMenu = () => {
    if (isMobile || autoCollapsed) setMobileOpen((o) => !o);
    else setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onMenu={onMenu} />
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {mobileOpen && <div className="fixed inset-0 top-16 z-20 bg-black/40" onClick={() => setMobileOpen(false)} />}
      <main className={`min-h-screen pt-16 transition-[padding] duration-200 ${isMobile ? 'pl-0' : collapsed ? 'pl-[72px]' : 'pl-[255px]'}`}>{children}</main>
      <Toaster />
      <SettingsModal />
      <FeedbackDrawer />
      <UploadDialog />
    </div>
  );
}

export function PageHeader({ title, actions, className = '' }: { title: string; actions?: ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-[72px] flex-wrap items-center gap-x-4 gap-y-2 px-8 pt-6 max-sm:px-4 ${className}`}>
      <h1 className="min-w-0 flex-1 text-[25px] font-medium leading-8 tracking-[-0.2px] text-[#0f0f0f]">{title}</h1>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
