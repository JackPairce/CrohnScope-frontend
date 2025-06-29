import ThemeToggle from "@/components/ThemeToggle";
import UserProfileButton from "@/components/UserProfileButton";
import { authApi } from "@/lib/api";
import { redirect } from "next/navigation";
import "./styles.scss";

const featuresList = [
  {
    title: "Patient Management",
    description: "Efficiently manage and track patient records and history",
    icon: "/svgs/file.svg",
    href: "/patients",
  },
  {
    title: "Smart Diagnosis",
    description: "AI-assisted diagnosis using advanced image processing",
    icon: "/svgs/model.svg",
    href: "/diagnosis",
  },
  {
    title: "Data Processing",
    description: "Advanced tools for image labeling and segmentation",
    icon: "/svgs/dataset.svg",
    href: "/data",
  },
];

export default async function Home() {
  await authApi.checkAuth().catch(() => {
    redirect("/auth");
  });

  return (
    <div className="home-page">
      <div className="header-controls">
        <ThemeToggle />
        <UserProfileButton />
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="welcome-title">Welcome to HistoScope</h1>
        <p className="welcome-subtitle">
          An AI-powered diagnostic tool for medical professionals
        </p>

        <div className="features-grid">
          {featuresList.map((feature) => (
            <a key={feature.title} href={feature.href} className="feature-card">
              <div className="feature-icon">
                <img src={feature.icon} alt={feature.title} />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="status-badge">
          <span className="status-dot"></span>
          System Status: All services operational
        </div>
      </div>
    </div>
  );
}
