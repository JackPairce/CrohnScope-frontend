"use client";

import { type NavSection } from "@/config/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import UserProfileButton from "../UserProfileButton";
import "./styles.scss";

interface LayoutProps {
  children: React.ReactNode;
  showUserMenu: boolean;
  homeButton: React.ReactNode;
  navigation?: NavSection[];
}

const FORCE_COLLAPSE_PATHS = ["/data/segmentation", "/data/classification"];

export default function Layout({
  children,
  homeButton,
  navigation,
  showUserMenu,
}: LayoutProps) {
  const [isForceCollapse, setIsForceCollapse] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (FORCE_COLLAPSE_PATHS.find((path) => pathname === path)) {
      setIsForceCollapse(true);
    } else {
      setIsForceCollapse(false);
    }
  }, [pathname]);

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
        <div className="flex items-center gap-4">
          {/* Data Pipeline Button */}
          <Link
            href="/data"
            className="inline-flex items-center px-3 py-1.5 rounded transition-colors text-sm font-medium shadow-sm"
            style={{
              marginRight: showUserMenu ? "1rem" : 0,
              backgroundColor: "var(--accent)",
              color: "var(--color-white)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Database with Gear icon for Data Pipeline Management */}
            <span className="relative flex items-center mr-2">
              {/* Database shape */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <ellipse cx="12" cy="6" rx="7" ry="3" />
                <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
                <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
              </svg>
              {/* Gear for management */}
              <svg
                className="w-4 h-4 absolute -bottom-1 -right-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                />
              </svg>
            </span>
            Data Pipeline
          </Link>
          {showUserMenu && (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserProfileButton />
            </div>
          )}
        </div>
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
