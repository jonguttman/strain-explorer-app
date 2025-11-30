import Link from "next/link";

type PartnerTrainingPageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function PartnerTrainingPage({ searchParams }: PartnerTrainingPageProps) {
  const params = await searchParams;
  const accessKey = params.key;
  const backUrl = accessKey ? `/?key=${accessKey}` : "/";

  return (
    <main className="min-h-screen bg-[#f6eddc] text-[#3f301f]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1 text-sm text-[#6b5841] hover:text-[#3f301f] transition mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Explorer
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Partner Training
        </h1>
        <p className="text-sm text-[#8b7a5c] mb-8">Coming soon</p>

        <div className="rounded-2xl border border-[#e2d3b5] bg-white/80 p-6 shadow-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f5ebe0] mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-[#8b7a5c]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#2d1d12] mb-2">
              Under Development
            </h2>
            <p className="text-sm text-[#4c3926] max-w-md mx-auto">
              We&apos;re building training materials to help retail partners guide 
              customers through strain selection and dosing decisions. 
              Check back soon for interactive guides and best practices.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={backUrl}
            className="inline-flex items-center rounded-full bg-[#3f301f] px-6 py-2 text-sm font-medium text-[#f6eddc] transition hover:bg-[#2a2015]"
          >
            Return to Explorer
          </Link>
        </div>
      </div>
    </main>
  );
}

