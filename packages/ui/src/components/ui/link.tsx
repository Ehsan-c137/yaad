import type { ReactNode } from "react";
import type { LinkProps as RouterLinkProps } from "react-router";

import { Link as RouterLink } from "react-router";

interface Props
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Partial<Omit<RouterLinkProps, "to">> {
  children?: ReactNode;
  href?: string;
  to?: string;
}

export function Link({ children, href, to, ...props }: Props) {
  const target = to || href || "#";
  return (
    <RouterLink to={target} {...props}>
      {children}
    </RouterLink>
  );
}
