import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StudioProvider } from './store/StudioContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/Dashboard';
import { ContentPage } from './pages/Content';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { CommunityPage } from './pages/Community';
import { SubtitlesPage } from './pages/Subtitles';
import { CopyrightPage } from './pages/Copyright';
import { EarnPage } from './pages/Earn';
import { CustomisationPage } from './pages/Customisation';
import { AudioLibraryPage } from './pages/AudioLibrary';
import { VideoRoutes } from './pages/video/VideoRoutes';

export function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StudioProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/content" element={<Navigate to="/content/videos" replace />} />
            <Route path="/content/:tab" element={<ContentPage />} />
            <Route path="/analytics" element={<Navigate to="/analytics/overview" replace />} />
            <Route path="/analytics/:tab" element={<AnalyticsPage />} />
            <Route path="/community" element={<Navigate to="/community/comments" replace />} />
            <Route path="/community/:tab" element={<CommunityPage />} />
            <Route path="/subtitles" element={<SubtitlesPage />} />
            <Route path="/copyright" element={<Navigate to="/copyright/claims" replace />} />
            <Route path="/copyright/:tab" element={<CopyrightPage />} />
            <Route path="/earn" element={<Navigate to="/earn/overview" replace />} />
            <Route path="/earn/:tab" element={<EarnPage />} />
            <Route path="/customisation" element={<Navigate to="/customisation/profile" replace />} />
            <Route path="/customisation/:tab" element={<CustomisationPage />} />
            <Route path="/audio-library" element={<Navigate to="/audio-library/music" replace />} />
            <Route path="/audio-library/:tab" element={<AudioLibraryPage />} />
            <Route path="/video/:id/*" element={<VideoRoutes />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </StudioProvider>
    </HashRouter>
  );
}
