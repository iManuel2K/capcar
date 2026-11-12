import { getTranslations } from "next-intl/server";
import { DrivingReviewWorkspace } from "@/components/driving-review/driving-review-workspace";
export async function generateMetadata() {
  const t = await getTranslations("DrivingReview");
  return { title: t("nav"), robots: { index: false, follow: false } };
}
export default function DrivingReviewPicker() {
  return <DrivingReviewWorkspace />;
}
