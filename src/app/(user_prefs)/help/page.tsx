"use client";
//

import { useState } from "react";

interface Article {
  id: string;
  title: string;
  description: string;
  category: "getting-started" | "features" | "troubleshooting" | "faqs";
  content: string;
}

export default function HelpPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const articles: Article[] = [
    {
      id: "gs-1",
      title: "Getting Started with HistoScope",
      description: "Learn the basics of using HistoScope",
      category: "getting-started",
      content: `
        Welcome to HistoScope! This guide will help you get started with our platform.

        1. Account Setup
        - Create your account or log in
        - Complete your profile
        - Set your preferences

        2. Basic Navigation
        - Dashboard overview
        - Understanding the sidebar
        - Using the search function

        3. First Steps
        - Uploading your first dataset
        - Creating a new analysis
        - Viewing results

        For more detailed information, please check our documentation or contact support.
      `,
    },
    {
      id: "gs-2",
      title: "Understanding the Dashboard",
      description: "A comprehensive guide to the dashboard",
      category: "getting-started",
      content: "Dashboard guide content...",
    },
    {
      id: "f-1",
      title: "Feature Classification",
      description: "How to use the feature classification feature",
      category: "features",
      content: "Feature classification guide...",
    },
    {
      id: "f-2",
      title: "Data Analysis Tools",
      description: "Overview of data analysis capabilities",
      category: "features",
      content: "Data analysis guide...",
    },
    {
      id: "t-1",
      title: "Common Issues",
      description: "Solutions to common problems",
      category: "troubleshooting",
      content: "Troubleshooting guide...",
    },
    {
      id: "faq-1",
      title: "Frequently Asked Questions",
      description: "Answers to common questions",
      category: "faqs",
      content: "FAQ content...",
    },
  ];

  const categories = {
    "getting-started": {
      title: "Getting Started",
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    features: {
      title: "Features",
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    troubleshooting: {
      title: "Troubleshooting",
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    faqs: {
      title: "FAQs",
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
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you?
          </h1>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute right-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories and Articles */}
          <div className="md:col-span-1 space-y-6">
            {Object.entries(categories).map(([key, category]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>
                <div className="space-y-2">
                  {filteredArticles
                    .filter((article) => article.category === key)
                    .map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {article.description}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Article Content */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {selectedArticle ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedArticle.title}
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {selectedArticle.content}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Select an article
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose an article from the left sidebar to view its content
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
