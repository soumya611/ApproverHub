import { useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { useDashboardCardsStore } from "@/stores/dashboardCardsStore";
import { useCampaignsStore } from "@/stores/campaignsStore";
import { useJobsStore } from "@/stores/jobsStore";
export { default as AddNewTabModal } from "@/components/home/AddNewTabModal";
import {
  DateCard,
  WelcomeSection,
  ProgressCard,
  DashboardCard,
  AddButton,
  FloatingActions,
  AddNewTabModal,
  PinnedCampaignCard,
  PinnedJobCard,
} from "@/components/home";
import { MyPinIcon } from "@/icons";
import NotesCard from "@/components/home/NotesCard";
import MentionedCard from "@/components/home/MentionedCard";

export default function Home() {
  const { data, loading, error } = useHomeDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userCards = useDashboardCardsStore((s) => s.userCards);
  const pinnedCampaigns = useCampaignsStore((s) => s.pinned);
  const unpinCampaign = useCampaignsStore((s) => s.unpinCampaign);
  const pinnedJobs = useJobsStore((s) => s.pinned);
  const unpinJob = useJobsStore((s) => s.unpinJob);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-red-500 text-sm">Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const { date, welcome, progress, cards } = data;
  const allCards = [...cards, ...userCards];

  return (
    <>
      <PageMeta title="Home" description="Dashboard overview" />

      {/* Header card: date + welcome message + progress ring */}
      <div className="bg-white rounded-xl shadow-[2px_4px_10px_0px_#0000000F] border border-gray-100 px-6 py-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <DateCard date={date} />
          <WelcomeSection welcome={welcome} />
        </div>
        <ProgressCard progress={progress} />
      </div>

      {/* Dashboard cards grid — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allCards.map((card) => (
          <DashboardCard key={card.id} card={card} />
        ))}
        <AddButton aria-label="Add new" onClick={() => setIsModalOpen(true)} />
      </div>

      {pinnedCampaigns.length > 0 || pinnedJobs.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-primary">My Space</h2>
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400">
                  <MyPinIcon className="h-3.5 w-3.5" />
                </span>
                My pins
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {pinnedCampaigns.map((campaign) => (
                <PinnedCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onUnpin={unpinCampaign}
                />
              ))}
              {pinnedJobs.map((job) => (
                <PinnedJobCard key={job.id} job={job} onUnpin={unpinJob} />
              ))}
            </div>
          </div>
          {/* Notes columns */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <NotesCard />
            {/* Placeholder for Mentioned you — add your component here */}
            <MentionedCard/>
          </div>
        </section>
      ) : null}

      {/* Floating action buttons - fixed bottom-right */}
      <FloatingActions />

      {/* Add new tab modal */}
      <AddNewTabModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}


