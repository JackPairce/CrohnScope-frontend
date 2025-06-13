"use client";

import ThemeToggle from "@/components/ThemeToggle";
import type { ReactElement } from "react";
import { useState } from "react";

interface SettingsSection {
  title: string;
  description: string;
  icon: ReactElement;
  content: ReactElement;
}

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState<string>("general");

  const settingsSections: SettingsSection[] = [
    {
      title: "General",
      description: "Basic application settings and preferences",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Theme
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Light/Dark Mode:
              </span>
              <ThemeToggle />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Language
            </h3>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Privacy",
      description: "Manage your privacy and security settings",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Data Collection
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  defaultChecked
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Allow anonymous usage data collection
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  defaultChecked
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Allow error reporting
                </span>
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Notifications",
      description: "Configure your notification preferences",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Email Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  defaultChecked
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Task completion notifications
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  defaultChecked
                />
                <span className="text-gray-700 dark:text-gray-300">
                  System updates
                </span>
              </label>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Settings
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-4">
              {/* Sidebar */}
              <div className="col-span-1 bg-gray-50 dark:bg-gray-900">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.title.toLowerCase()}
                      onClick={() =>
                        setSelectedTab(section.title.toLowerCase())
                      }
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                        selectedTab === section.title.toLowerCase()
                          ? "bg-indigo-50 dark:bg-indigo-900 border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="mr-3">{section.icon}</div>
                      <div>
                        <p
                          className={
                            selectedTab === section.title.toLowerCase()
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-gray-900 dark:text-white"
                          }
                        >
                          {section.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {section.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="col-span-3 p-6">
                {
                  settingsSections.find(
                    (section) => section.title.toLowerCase() === selectedTab
                  )?.content
                }
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
