import {
  IconDashboard,
  IconFingerprint,
  IconHelp,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

export const NAV = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
    {
      title: "Popes (CAIS)",
      url: "/popes",
      icon: IconFingerprint,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
};

export function getTitleByUrl(url: string): string {
  const allItems = [...NAV.navMain, ...NAV.navSecondary];
  const item = allItems.find((entry) => entry.url === url);
  return item?.title ?? "";
}
