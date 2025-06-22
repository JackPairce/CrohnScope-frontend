import Layout from "@/components/Layout";
import { userPrefsNavigation } from "@/config/navigation";
import { headers } from "next/headers";
import Link from "next/link";

export default async function UserPrefsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentPath = (await headers()).get("x-current-path") || "";
  let previousPage = (await headers()).get("referer") || "/";
  previousPage = previousPage.endsWith(currentPath) ? "/" : previousPage;

  return (
    <Layout
      homeButton={
        //
        <Link
          href={previousPage}
          className="btn btn-ghost btn-sm"
          aria-label="Return to previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="19 21 9 12 19 3" />
          </svg>
        </Link>
      }
      navigation={userPrefsNavigation}
      showUserMenu={false}
    >
      {children}
    </Layout>
  );
}
