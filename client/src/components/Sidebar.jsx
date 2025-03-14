import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import ThemeToggle from "./ThemeToggle";
import "./Sidebar.css";

// Icons
import {
  Home,
  MessageSquare,
  FileText,
  Vote,
  Trophy,
  ShoppingBag,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "./Icons";

function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme } = useTheme();

  // Animation on mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);

    // Close sidebar on mobile when clicking outside
    const handleClickOutside = (e) => {
      if (
        isMobileOpen &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".sidebar-mobile-toggle")
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileOpen]);

  if (!mounted) return null;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

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
        { icon: <Trophy />, label: "Leaderboard", href: "/leaderboard", badge: null },
        { icon: <ShoppingBag />, label: "Marketplace", href: "/marketplace", badge: null },
      ],
    },
    {
      section: "Services",
      items: [{ icon: <Phone />, label: "Emergency", href: "/emergency", badge: null, isEmergency: true }],
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button className="sidebar-mobile-toggle" onClick={toggleMobileSidebar}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Mobile backdrop */}
      <div className={`sidebar-backdrop ${isMobileOpen ? "active" : ""}`} onClick={() => setIsMobileOpen(false)}></div>

      <div className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""} ${isMobileOpen ? "open" : ""} ${theme}`}>
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
        </div>

        {/* Laptop/Desktop Toggle Button */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        {/* Sidebar content */}
        <div className="sidebar-content">
          {sidebarItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="sidebar-section">
              {!isCollapsed && <div className="sidebar-section-title">{section.section}</div>}
              <nav className="sidebar-nav">
                {section.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={itemIndex} to={item.href} className={`sidebar-nav-item ${isActive ? "active" : ""}`}>
                      <div className="sidebar-nav-icon">{item.icon}</div>
                      {!isCollapsed && (
                        <>
                          <span className="sidebar-nav-text">{item.label}</span>
                          {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
                          {item.isEmergency && <span className="sidebar-emergency-indicator"></span>}
                        </>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          {!isCollapsed && <div className="theme-toggle-container"><ThemeToggle /></div>}
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">TS</div>
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">John Doe</div>
                <div className="sidebar-user-role">Community Member</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;