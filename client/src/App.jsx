"use client"

import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import Layout from "./components/Layout"
import "./App.css"
import axios from "axios"
import { Toaster } from "react-hot-toast"
import { useSelector } from "react-redux"
import SurveysPage from "./pages/SurveysPage"
import MarketplacePage from "./pages/MarketplacePage"
import PostPage from "./Pages/PostPage"
axios.defaults.withCredentials = true

// Lazy load all page components
const HomePage = lazy(() => import("./pages/HomePage"))
const DiscussionsPage = lazy(() => import("./Pages/DiscussionsPage"))
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"))
// const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"))
const UserProfile = lazy(() => import("./pages/UserProfile/UserProfile"))
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"))

const AuthPage = lazy(() => import("./components/Login"))
const CreatePost = lazy(() => import("./components/CreatePost"))
const Login = lazy(() => import("./pages/Login/Login"))
const Register = lazy(() => import("./pages/Register/Register"))
const Verify = lazy(() => import("./pages/Verification/Verify"))


// Loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
)

function App() {
  const { userData } = useSelector((state) => state.user)

  const DebugWrapper = ({ Component }) => {
    try {
      return <Component />
    } catch (err) {
      console.error("Error rendering component:", err)
      return <div>Error loading component</div>
    }
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <div className="main-cont-app">
            <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/discussions" element={<DiscussionsPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/surveys" element={<SurveysPage />} />
                {/* <Route path="/leaderboard" element={<LeaderboardPage />} /> */}
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/createPost" element={<CreatePost />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/post/:id" element={<PostPage />} />
              </Routes>
            </Suspense>
          </div>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
