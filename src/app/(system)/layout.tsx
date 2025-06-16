import Layout from "@/components/Layout";
import { systemNavigation } from "@/config/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout
      homeButton={
        <Link href="/" className="flex items-center">
          <Image
            src="/svgs/microscope.svg"
            alt="Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            HistoScope
          </span>
        </Link>
      }
      navigation={systemNavigation}
      showUserMenu={true}
    >
      {children}
    </Layout>
  );
}
