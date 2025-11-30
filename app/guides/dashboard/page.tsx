import Link from "next/link";
import { getGuideFromCookies } from "@/lib/guideSession";
import { redirect } from "next/navigation";

export default async function GuidesDashboardPage() {
  const guide = await getGuideFromCookies();

  if (!guide) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#3f301f]">
          Hi, {guide.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Welcome to the Psilly Guides portal
        </p>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link
          href="#"
          className="block rounded-2xl border border-[#ddcbaa] bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 mb-4">
            <svg
              className="h-5 w-5 text-amber-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-[#3f301f]">Training Modules</h3>
          <p className="mt-1 text-sm text-stone-600">
            Learn about strains, dosing, and guiding best practices
          </p>
        </Link>

        <Link
          href="/guides/messages"
          className="block rounded-2xl border border-[#ddcbaa] bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <svg
              className="h-5 w-5 text-emerald-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-[#3f301f]">Your Messages</h3>
          <p className="mt-1 text-sm text-stone-600">
            Updates and announcements from the Psilly team
          </p>
        </Link>

        <Link
          href="#"
          className="block rounded-2xl border border-[#ddcbaa] bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 mb-4">
            <svg
              className="h-5 w-5 text-violet-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-[#3f301f]">Session Logs</h3>
          <p className="mt-1 text-sm text-stone-600">
            Track and review your guiding sessions
          </p>
        </Link>
      </div>

      {/* Stats (placeholder) */}
      <div className="rounded-2xl border border-[#ddcbaa] bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-[#3f301f] mb-4">Your Stats</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center p-4 rounded-xl bg-stone-50">
            <p className="text-3xl font-bold text-[#3f301f]">12</p>
            <p className="text-sm text-stone-600">Sessions logged</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-stone-50">
            <p className="text-3xl font-bold text-[#3f301f]">4</p>
            <p className="text-sm text-stone-600">Quizzes completed</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-stone-50">
            <p className="text-3xl font-bold text-[#3f301f]">2</p>
            <p className="text-sm text-stone-600">Certifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}

