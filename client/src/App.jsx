import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DiscussionsPage from "./pages/DiscussionsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import EmergencyPage from "./pages/EmergencyPage";
import SurveysPage from "./pages/SurveysPage";
import "./App.css";

import axios from "axios";
axios.defaults.withCredentials = true;

import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Verify from "./pages/Verification/Verify";

function App() {
  const { userData } = useSelector((state) => state.user);

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <div className="main-cont-app">
            <Toaster
              position="bottom-right"
              toastOptions={{ duration: 2000 }}
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
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
