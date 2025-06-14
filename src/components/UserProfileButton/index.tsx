"use client";

import { ApiUser, authApi } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";

interface UserProfileButtonProps {
  className?: string;
}

export default function UserProfileButton({
  className = "",
}: UserProfileButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Get user data
  useEffect(() => {
    if (user) return; // Skip if user is already set
    authApi.checkAuth(true).then((user) => {
      if (user && typeof user === "object" && "username" in user)
        setUser(user as ApiUser);
    });
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    authApi.logout();
    router.push("/auth");
  }, [router]);

  // Only render on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside to close dropdown
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

  if (!mounted) {
    // Render placeholder while loading to avoid layout shift
    return <div className="w-10 h-10"></div>;
  }

  return (
    <div className={`user-menu ${className}`} ref={dropdownRef}>
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
          className="nav-link-icon svg-icon"
        />
      </button>
      {isDropdownOpen && (
        <div className="user-menu-dropdown">
          {user && (
            <div className="user-info">
              <div className="user-name">{user.username || "dev"}</div>
              <div className="user-email">{user.email || "test@gmail.com"}</div>
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
            <button onClick={handleLogout} className="user-menu-link danger">
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
  );
}
