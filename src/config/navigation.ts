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

export const pipelineSteps: PipelineStep[] = [
  {
    href: "/data/features",
    iconType: "svg",
    icon: "/svgs/feature-management.svg",
    alt: "Feature Management",
    title: "Feature Management",
    description: "Manage and create features for image analysis",
  },
  {
    href: "/data/images",
    iconType: "svg",
    icon: "/svgs/image-management.svg",
    alt: "Image Management",
    title: "Image Management",
    description: "Import and organize microscopy images",
  },
  {
    href: "/data/segmentation",
    iconType: "svg",
    icon: "/svgs/segmentation.svg",
    alt: "Segmentation",
    title: "Feature Segmentation",
    description: "Analyze and segment features with AI-assisted tools",
  },
  {
    href: "/data/classification",
    iconType: "svg",
    icon: "/svgs/classification-new.svg",
    alt: "Classification",
    title: "Feature Classification",
    description: "Classify and label segmented features",
  },
];

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
    links: [
      {
        name: "Features Management",
        href: "/data/features",
        icon: "/svgs/feature-management.svg",
      },
      {
        name: "Image Library",
        href: "/data/images",
        icon: "/svgs/image-management.svg",
      },
      {
        name: "Segmentation",
        href: "/data/segmentation",
        icon: "/svgs/segmentation.svg",
      },
      {
        name: "Classification",
        href: "/data/classification",
        icon: "/svgs/classification-new.svg",
      },
    ],
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
