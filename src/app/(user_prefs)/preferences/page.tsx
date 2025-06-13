"use client";

import { useAuth } from "@/components/AuthCheck";
import { useState } from "react";

interface Preference {
  id: string;
  title: string;
  description: string;
  value: boolean;
  category: "workflow" | "interface" | "data";
}

export default function PreferencesPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preference[]>([
    {
      id: "auto-save",
      title: "Auto-save",
      description: "Automatically save changes while working",
      value: true,
      category: "workflow",
    },
    {
      id: "confirm-actions",
      title: "Confirm Actions",
      description: "Show confirmation dialogs for important actions",
      value: true,
      category: "workflow",
    },
    {
      id: "compact-view",
      title: "Compact View",
      description: "Use a more compact layout for data tables",
      value: false,
      category: "interface",
    },
    {
      id: "show-tooltips",
      title: "Show Tooltips",
      description: "Display helpful tooltips when hovering over elements",
      value: true,
      category: "interface",
    },
    {
      id: "auto-load",
      title: "Auto-load Data",
      description: "Automatically load next data set when scrolling",
      value: true,
      category: "data",
    },
    {
      id: "cache-data",
      title: "Cache Data",
      description: "Cache data locally for faster access",
      value: true,
      category: "data",
    },
  ]);

  const updatePreference = (id: string, value: boolean) => {
    setPreferences((prev) =>
      prev.map((pref) => (pref.id === id ? { ...pref, value } : pref))
    );
  };

  const categories = {
    workflow: {
      title: "Workflow",
      description: "Configure how you work with the application",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    interface: {
      title: "Interface",
      description: "Customize the application's appearance",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
    },
    data: {
      title: "Data Management",
      description: "Configure data handling preferences",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {(Object.keys(categories) as Array<keyof typeof categories>).map(
            (category) => (
              <div
                key={category}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    {categories[category].icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {categories[category].title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {categories[category].description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {preferences
                    .filter((pref) => pref.category === category)
                    .map((preference) => (
                      <div
                        key={preference.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {preference.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {preference.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preference.value}
                            onChange={(e) =>
                              updatePreference(preference.id, e.target.checked)
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
