
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
        name: "Cells Management",
        href: "/data/cells",
        icon: "/svgs/cell.svg",
      },
      {
        name: "Image Library",
        href: "/data/images",
        icon: "/svgs/file.svg",
      },
      {
        name: "Segmentation",
        href: "/data/segmentation",
        icon: "/svgs/draw.svg",
      },
      {
        name: "Classification",
        href: "/data/labeling",
        icon: "/svgs/cell-classification.svg",
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
