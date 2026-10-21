"use client";
import Link from "@/components/i18n/public-link";
import type { ComponentProps } from "react";
import { trackAnalytics } from "@/features/analytics/client";
type Props = ComponentProps<typeof Link> & {
  placement?: "hero" | "header" | "demo" | "final" | "footer";
  useCase?: "maintain" | "modify" | "drives";
  demo?: boolean;
};
export function HomepageLink({
  placement,
  useCase,
  demo,
  onClick,
  ...props
}: Props) {
  return (
    <Link
      prefetch={false}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (useCase)
          trackAnalytics("homepage_use_case_clicked", { use_case: useCase });
        else if (demo)
          trackAnalytics("homepage_demo_engaged", { demo_action: "open" });
        else if (placement)
          trackAnalytics("homepage_primary_cta_clicked", { placement });
      }}
    />
  );
}
