import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiscussionsPage from './pages/DiscussionsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SurveysPage from './pages/SurveysPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MarketplacePage from './pages/MarketplacePage';
import EmergencyPage from './pages/EmergencyPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <div className='main-cont-app'>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discussions" element={<DiscussionsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/surveys" element={<SurveysPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
            </Routes>
          </div>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;