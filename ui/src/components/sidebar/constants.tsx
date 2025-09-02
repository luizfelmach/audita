import { Activity, Fingerprint, Info, Search, Settings, User } from "lucide-react";

export const nav = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: Activity,
    },
    {
      title: "Search",
      url: "/search",
      icon: Search,
    },
    {
      title: "Pop ES",
      url: "/popes",
      icon: Fingerprint,
    },
    {
      title: "Auto Detect",
      url: "/auto-detect",
      icon: User,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "https://github.com/luizfelmach/audita",
      icon: Info,
    },
  ],
};

export function getTitleByUrl(url: string): string {
  const allItems = [...nav.navMain, ...nav.navSecondary];
  const item = allItems.find((entry) => entry.url === url);
  return item?.title ?? "";
}
