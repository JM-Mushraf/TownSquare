

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../Slices/AuthSlice"
import ThemeToggle from "./ThemeToggle"
import "./Sidebar.css"

// Icons
import {
  Home,
  MessageSquare,
  FileText,
  Vote,
  ShoppingBag,
  Phone,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Menu,
  X,
} from "./Icons"

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const dispatch = useDispatch()

  // Access user data and authorization status from Redux store
  const isAuthorized = useSelector((state) => state.user.isAuthorized)
  const userData = useSelector((state) => state.user.userData)

  // Animation on mount
  const [mounted, setMounted] = useState(false)

  // Load and apply saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
    document.documentElement.classList.add(savedTheme)
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  useEffect(() => {
    setTimeout(() => setMounted(true), 0)

    // Close sidebar on mobile when clicking outside
    const handleClickOutside = (e) => {
      if (isMobileOpen && !e.target.closest(".sidebar") && !e.target.closest(".sidebar-mobile-toggle")) {
        setIsMobileOpen(false)
      }
    }

    // Close sidebar on mobile when route changes
    const handleRouteChange = () => {
      if (isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    // Close sidebar on resize if screen becomes larger
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    window.addEventListener("resize", handleResize)

    // Clean up event listeners
    return () => {
      document.removeEventListener("click", handleClickOutside)
      window.removeEventListener("resize", handleResize)
    }
  }, [isMobileOpen, location.pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

  // Redirect to login page if not logged in
  useEffect(() => {
    if (!isAuthorized && location.pathname !== "/login") {
      navigate("/login")
    }
  }, [isAuthorized, location.pathname, navigate])

  if (!mounted) return null

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  const sidebarItems = [
    {
      section: "Main",
      items: [
        { icon: <Home />, label: "Home", href: "/", badge: null },
        { icon: <MessageSquare />, label: "Discussions", href: "/discussions", badge: 3 },
        { icon: <FileText />, label: "Announcements", href: "/announcements", badge: 1 },
      ],
    },
    {
      section: "Engagement",
      items: [
        { icon: <Vote />, label: "Surveys & Polls", href: "/surveys", badge: null },
        { icon: <ShoppingBag />, label: "Marketplace", href: "/marketplace", badge: null },
      ],
    },
    {
      section: "Services",
      items: [{ icon: <Phone />, label: "Emergency", href: "/emergency", badge: null, isEmergency: true }],
    },
  ]

  return (
    <>
      {/* Mobile toggle button */}
      <button className="sidebar-mobile-toggle" onClick={toggleMobileSidebar} aria-label="Toggle sidebar menu">
        <Menu className="sidebar-toggle-icon" />
      </button>

      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? "active" : ""}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      ></div>

      <div
        className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""} ${isMobileOpen ? "open" : ""}`}
        data-theme={theme}
      >
        {/* Sidebar header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                <rect width="7" height="5" x="3" y="16" rx="1"></rect>
              </svg>
            </div>
            <span className="sidebar-logo-text">
              Town<span className="logo-highlight">Square</span>
            </span>
          </Link>

          {/* Mobile close button */}
          <button className="sidebar-mobile-close" onClick={() => setIsMobileOpen(false)} aria-label="Close sidebar">
            <X />
          </button>
        </div>

        {/* Laptop/Desktop Toggle Button */}
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        {/* Sidebar content */}
        <div className="sidebar-content">
          {sidebarItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="sidebar-section">
              {!isCollapsed && <div className="sidebar-section-title">{section.section}</div>}
              <nav className="sidebar-nav">
                {section.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={itemIndex}
                      to={item.href}
                      className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="sidebar-nav-icon">{item.icon}</div>
                      {(!isCollapsed || isMobileOpen) && (
                        <>
                          <span className="sidebar-nav-text">{item.label}</span>
                          {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
                          {item.isEmergency && <span className="sidebar-emergency-indicator"></span>}
                        </>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          {(!isCollapsed || isMobileOpen) && (
            <div className="theme-toggle-container">
              <ThemeToggle theme={theme} setTheme={toggleTheme} />
            </div>
          )}
          <div
            className="sidebar-user"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label="User profile"
          >
            {isAuthorized ? (
              <img
                className="sidebar-user-avatar"
                src={userData?.avatar || "/placeholder.svg"}
                alt={userData?.username || "User avatar"}
              />
            ) : null}
            {(!isCollapsed || isMobileOpen) && (
              <div className="sidebar-user-info">
                {isAuthorized && userData ? (
                  <>
                    <div className="sidebar-user-name">{userData.username}</div>
                    <div className="sidebar-user-role">{userData.role}</div>
                  </>
                ) : null}
              </div>
            )}
          </div>
          {isAuthorized ? (
            <button className="sidebar-nav-item sidebar-logout" onClick={handleLogout} aria-label="Logout">
              <div className="sidebar-nav-icon">
                <LogOut />
              </div>
              {(!isCollapsed || isMobileOpen) && <span className="sidebar-nav-text">Logout</span>}
            </button>
          ) : (
            <Link to="/login" className="sidebar-nav-item sidebar-login" aria-label="Login">
              <div className="sidebar-nav-icon">
                <LogIn />
              </div>
              {(!isCollapsed || isMobileOpen) && <span className="sidebar-nav-text">Login</span>}
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar
