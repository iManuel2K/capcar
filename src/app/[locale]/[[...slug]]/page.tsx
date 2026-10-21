import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ConnectedPartsPage, {
  generateMetadata as connectedPartsMetadata,
} from "@/app/connected-parts/page";
import ImprintPage, {
  generateMetadata as imprintMetadata,
} from "@/app/imprint/page";
import MovieCarsPage, {
  generateMetadata as movieCarsMetadata,
} from "@/app/movie-cars/page";
import HomePage, { generateMetadata as homeMetadata } from "@/app/page";
import AIPlannerPage, { generateMetadata as aiMetadata } from "@/app/ai/page";
import ProjectPlannerPage, {
  generateMetadata as plannerMetadata,
} from "@/app/project-car-planner/page";
import MaintenanceTrackerPage, {
  generateMetadata as maintenanceMetadata,
} from "@/app/car-maintenance-tracker/page";
import PartsSearchPage, {
  generateMetadata as partsSearchMetadata,
} from "@/app/parts-search/page";
import PlatformPage, {
  generateMetadata as platformMetadata,
} from "@/app/platform/page";
import PrivacyPage, {
  generateMetadata as privacyMetadata,
} from "@/app/privacy/page";
import RoadbookPage, {
  generateMetadata as roadbookMetadata,
} from "@/app/roadbook/page";
import RoadmapPage, {
  generateMetadata as roadmapMetadata,
} from "@/app/roadmap/page";
import SoundStudioPage, {
  generateMetadata as soundStudioMetadata,
} from "@/app/sound-studio/page";
import SpecialistsPage, {
  generateMetadata as specialistsMetadata,
} from "@/app/specialists/page";
import StudioPage, {
  generateMetadata as studioMetadata,
} from "@/app/studio/page";
import TermsPage, { generateMetadata as termsMetadata } from "@/app/terms/page";
import {
  isPublicIndexableRoute,
  localizedMetadata,
  type PublicIndexableRoute,
} from "@/features/seo/public-metadata";
import { isAppLocale, type AppLocale } from "@/i18n/config";

type LocalizedPublicPageProps = {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function resolveLocalizedRoute(
  params: LocalizedPublicPageProps["params"],
): Promise<{ locale: AppLocale; route: PublicIndexableRoute }> {
  const { locale: requestedLocale, slug } = await params;
  if (!isAppLocale(requestedLocale)) notFound();

  const route = slug?.length ? `/${slug.join("/")}` : "";
  if (!isPublicIndexableRoute(route)) notFound();

  return { locale: requestedLocale, route };
}

async function routeMetadata(route: PublicIndexableRoute): Promise<Metadata> {
  switch (route) {
    case "":
      return homeMetadata();
    case "/ai":
      return aiMetadata();
    case "/project-car-planner":
      return plannerMetadata();
    case "/car-maintenance-tracker":
      return maintenanceMetadata();
    case "/connected-parts":
      return connectedPartsMetadata();
    case "/imprint":
      return imprintMetadata();
    case "/movie-cars":
      return movieCarsMetadata();
    case "/parts-search":
      return partsSearchMetadata();
    case "/platform":
      return platformMetadata();
    case "/privacy":
      return privacyMetadata();
    case "/roadbook":
      return roadbookMetadata();
    case "/roadmap":
      return roadmapMetadata();
    case "/sound-studio":
      return soundStudioMetadata();
    case "/specialists":
      return specialistsMetadata();
    case "/studio":
      return studioMetadata();
    case "/terms":
      return termsMetadata();
  }

  notFound();
}

export async function generateMetadata({
  params,
}: LocalizedPublicPageProps): Promise<Metadata> {
  const { locale, route } = await resolveLocalizedRoute(params);
  return localizedMetadata(await routeMetadata(route), route, locale);
}

export default async function LocalizedPublicPage({
  params,
  searchParams,
}: LocalizedPublicPageProps) {
  const { route, locale } = await resolveLocalizedRoute(params);
  const query = searchParams as Promise<{ q?: string | string[] }>;

  switch (route) {
    case "":
      return <HomePage locale={locale} />;
    case "/ai":
      return (
        <AIPlannerPage
          searchParams={
            searchParams as Promise<{ journal?: string; vehicle?: string }>
          }
        />
      );
    case "/project-car-planner":
      return <ProjectPlannerPage />;
    case "/car-maintenance-tracker":
      return <MaintenanceTrackerPage />;
    case "/connected-parts":
      return <ConnectedPartsPage searchParams={query} />;
    case "/imprint":
      return <ImprintPage />;
    case "/movie-cars":
      return <MovieCarsPage />;
    case "/parts-search":
      return <PartsSearchPage searchParams={query} />;
    case "/platform":
      return <PlatformPage />;
    case "/privacy":
      return <PrivacyPage />;
    case "/roadbook":
      return <RoadbookPage />;
    case "/roadmap":
      return <RoadmapPage />;
    case "/sound-studio":
      return <SoundStudioPage />;
    case "/specialists":
      return <SpecialistsPage />;
    case "/studio":
      return <StudioPage />;
    case "/terms":
      return <TermsPage />;
  }

  notFound();
}
