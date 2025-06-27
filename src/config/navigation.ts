export interface NavLink {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export interface PipelineStep {
  href: string;
  iconType: "svg" | "image";
  icon: string;
  alt: string;
  title: string;
  description: string;
}

export const dataProcessingLinks: NavLink[] = [
  {
    name: "Disease Management",
    href: "/data/diseases",
    icon: "/svgs/disease.svg",
  },
  {
    name: "Features Management",
    href: "/data/features",
    icon: "/svgs/feature-management.svg",
  },
  {
    name: "Histology Library",
    href: "/data/images",
    icon: "/svgs/image-management.svg",
  },
  {
    name: "Histology Analysis",
    href: "/data/analysis",
    icon: "/svgs/diagnosis.svg",
  },
  {
    name: "Segmentation",
    href: "/data/segmentation",
    icon: "/svgs/segmentation.svg",
  },
];

const pipelineStepDescriptions: Record<string, string> = {
  "Disease Management": "Manage and create disease types for analysis",
  "Features Management": "Manage and create features for image analysis",
  "Histology Library": "Import and organize histological images",
  "Histology Analysis": "Analyze and diagnose histological samples",
  Classification: "Classify and label segmented features",
};

export const pipelineSteps: PipelineStep[] = dataProcessingLinks.map(
  (link) => ({
    href: link.href,
    iconType: "svg",
    icon: link.icon,
    alt: link.name,
    title: link.name,
    description: pipelineStepDescriptions[link.name] || "",
  })
);

export const systemNavigation: NavSection[] = [
  {
    title: "Overview",
    links: [
      { name: "Dashboard", href: "/dashboard", icon: "/svgs/home.svg" },
      { name: "Analytics", href: "/analytics", icon: "/svgs/chart.svg" },
    ],
  },
  {
    title: "Medical",
    links: [
      { name: "Patients", href: "/patients", icon: "/svgs/file.svg", badge: 5 },
      { name: "Diagnoses", href: "/diagnosis", icon: "/svgs/book.svg" },
    ],
  },
  {
    title: "Data Processing",
    links: dataProcessingLinks,
  },
];

export const userPrefsNavigation: NavSection[] = [
  {
    title: "User Settings",
    links: [
      { name: "Profile", href: "/profile", icon: "/svgs/user.svg" },
      { name: "Settings", href: "/settings", icon: "/svgs/model.svg" },
      {
        name: "Preferences",
        href: "/preferences",
        icon: "/svgs/brush-size.svg",
      },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help", icon: "/svgs/info.svg" },
      //   { name: "Documentation", href: "/docs", icon: "/svgs/book.svg" },
    ],
  },
];
