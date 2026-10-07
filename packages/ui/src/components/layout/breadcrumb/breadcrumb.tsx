/* eslint-disable @eslint-react/no-array-index-key */
"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

import { SidebarToggleButton } from "./sidebar-button";

export function BreadcrumbDemo() {
  const { t } = useTranslation(["sidebar", "common"]);
  const { pathname } = useLocation();
  const pages = useSidebarStore((store) => store.pages);

  return (
    <Breadcrumb
      className={cn("toolbar", "flex min-h-11 w-full items-center gap-2 px-3")}
    >
      <SidebarToggleButton />
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/">{t("sidebar:home")}</Link>} />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {pathname.split("/").map((p, i) => {
          if (i === 0) return null;

          const page = pages[p];
          if (!page) return null;

          return (
            <BreadcrumbItem key={`${p}-${i}`}>
              <BreadcrumbLink
                render={
                  <a href={`/${page.id}`}>
                    {page.title || t("common:untitled")}
                  </a>
                }
              />
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
