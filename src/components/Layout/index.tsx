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
        {showUserMenu && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserProfileButton />
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
