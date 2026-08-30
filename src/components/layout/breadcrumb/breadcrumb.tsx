"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

import { SidebarToggleButton } from "./sidebar-button";

export function BreadcrumbDemo() {
  const pathname = usePathname();
  const pages = useSidebarStore((store) => store.pages);

  return (
    <Breadcrumb
      className={cn("toolbar", "flex min-h-11 w-full items-center gap-2 px-3")}
    >
      <SidebarToggleButton />
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/">Home</Link>} />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {pathname.split("/").map((p, i) => {
          if (i === 0) return null;

          const page = pages[p];
          if (!page) return null;

          return (
            <BreadcrumbItem key={`${p}-${i}`}>
              <BreadcrumbLink
                render={<a href={`/${page.id}`}>{page.title}</a>}
              />
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
