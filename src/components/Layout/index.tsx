"use client";

import { type NavSection } from "@/config/navigation";
import { ApiUser, authApi } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import "./styles.scss";

interface LayoutProps {
  children: React.ReactNode;
  showUserMenu: boolean;
  homeButton: React.ReactNode;
  navigation?: NavSection[];
}

const FORCE_COLLAPSE_PATHS = ["/data/segmentation", "/data/labeling"];

export default function Layout({
  children,
  homeButton,
  navigation,
  showUserMenu,
}: LayoutProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isForceCollapse, setIsForceCollapse] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user) return; // Skip if user is already set
    authApi.checkAuth(true).then((user) => {
      if (user && typeof user === "object" && "username" in user)
        setUser(user as ApiUser);
    });
  }, []);

  useEffect(() => {
    if (FORCE_COLLAPSE_PATHS.find((path) => pathname === path)) {
      setIsForceCollapse(true);
    } else {
      setIsForceCollapse(false);
    }
  }, [pathname]);

  const handleLogout = useCallback(() => {
    authApi.logout();
    router.push("/auth");
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    if (!isForceCollapse) setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu */}
          <button
            onClick={toggleSidebar}
            className="hamburger-menu"
            aria-label="Toggle sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="header-title">
            <h1>
              {pathname
                .split("/")
                .pop()
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </h1>
          </div>
        </div>
        {showUserMenu && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* User menu dropdown */}
            <div className="user-menu" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="user-menu-button"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <Image
                  src="/svgs/user.svg"
                  alt="User menu"
                  width={32}
                  height={32}
                  className="nav-link-icon"
                />
              </button>
              {isDropdownOpen && (
                <div className="user-menu-dropdown">
                  {user && (
                    <div className="user-info">
                      <div className="user-name">{user.username || "dev"}</div>
                      <div className="user-email">
                        {user.email || "test@gmail.com"}
                      </div>
                    </div>
                  )}
                  <div className="menu-items">
                    <Link href="/profile" className="user-menu-link">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                    </Link>
                    <Link href="/settings" className="user-menu-link">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="user-menu-link danger"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          isSidebarCollapsed || isForceCollapse ? "collapsed" : ""
        }`}
      >
        <div className="logo">{homeButton}</div>
        <nav className="nav">
          {navigation?.map((section) => (
            <div key={section.title} className="nav-section">
              <h3 className="nav-section-title">{section.title}</h3>
              <div className="nav-links">
                {section.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`nav-link ${isActive ? "active" : ""}`}
                      title={
                        isForceCollapse || isSidebarCollapsed
                          ? link.name
                          : undefined
                      } // Add title attribute for hover tooltip
                    >
                      <Image
                        src={link.icon}
                        alt={link.name}
                        width={20}
                        height={20}
                        className="nav-link-icon svg-icon"
                      />
                      <span className="nav-link-text">{link.name}</span>
                      {link.badge && (
                        <span className="nav-link-badge">{link.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer>
        <div className="early-access-badge">Early Access</div>
        <span>Version 0.1.0</span>
      </footer>
    </div>
  );
}
