import { redirect } from "next/navigation";
import { getGuideFromCookies } from "@/lib/guideSession";
import { GuidesHeader } from "./GuidesHeader";

export default async function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guide = await getGuideFromCookies();

  // If not logged in, redirect to the gateway
  if (!guide) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f6eddc]">
      <GuidesHeader guide={guide} />
      <main>{children}</main>
    </div>
  );
}

