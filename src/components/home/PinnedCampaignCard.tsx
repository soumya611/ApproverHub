import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent,
} from "react";
import Popup from "../ui/popup/Popup";
import ReviewerList, {
  type ReviewerListItem,
} from "../ui/reviewerlist/ReviewerList";
import WorkflowStageCard from "../workflow/WorkflowStageCard";
import { VerticalDots } from "../../icons";
import type { PinnedCampaign } from "../../stores/campaignsStore";
import PinnedAssetCard from "./pinned/PinnedAssetCard";
import PinnedStageCard from "./pinned/PinnedStageCard";

interface PinnedCampaignCardProps {
  campaign: PinnedCampaign;
  onUnpin: (id: string) => void;
}

export default function PinnedCampaignCard({
  campaign,
  onUnpin,
}: PinnedCampaignCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReviewerListOpen, setIsReviewerListOpen] = useState(false);
  const [reviewerAnchor, setReviewerAnchor] = useState<DOMRect | null>(null);
  const stageLaneRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const members = campaign.members ?? [];
  const stages = campaign.stages ?? [];

  const reviewers = useMemo<ReviewerListItem[]>(
    () =>
      members.map((member) => ({
        id: member.id,
        name: member.name,
      })),
    [members]
  );

  const stageSummaries = useMemo(() => stages, [stages]);

  const handleAvatarClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    setReviewerAnchor(event.currentTarget.getBoundingClientRect());
    setIsReviewerListOpen(true);
  };

  const handleStageLaneWheel = (event: WheelEvent<HTMLDivElement>) => {
    const lane = stageLaneRef.current;
    if (!lane) return;
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

    lane.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const lane = stageLaneRef.current;
    if (!lane || event.button !== 0) return;
    isDraggingRef.current = true;
    startXRef.current = event.clientX;
    startScrollLeftRef.current = lane.scrollLeft;
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const lane = stageLaneRef.current;
    if (!lane || !isDraggingRef.current) return;
    const delta = event.clientX - startXRef.current;
    lane.scrollLeft = startScrollLeftRef.current - delta;
    event.preventDefault();
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="p-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">
          {campaign.title} campaign
        </p>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Pinned campaign options"
          >
            <VerticalDots className="h-4 w-4" />
          </button>
          {isMenuOpen ? (
            <div className="absolute right-0 top-full z-30 mt-2">
              <Popup
                items={[
                  {
                    id: "unpin",
                    label: "Unpin",
                    onClick: () => {
                      onUnpin(campaign.id);
                      setIsMenuOpen(false);
                    },
                  },
                ]}
                className="!min-w-[120px] rounded-lg"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <PinnedAssetCard
          title={campaign.assetTitle ?? `${campaign.title} PPT`}
          format={campaign.assetFormat ?? "PPT"}
          className="w-full lg:w-[220px]"
        />
        <div className="h-px bg-gray-200 lg:h-auto lg:w-px" />
        <div className="flex-1 min-w-0">
          <div className="relative w-full overflow-hidden">
            <div
              ref={stageLaneRef}
              onWheel={handleStageLaneWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              className="no-scrollbar w-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
            >
              <div className="flex w-max gap-3 pr-8">
                {stageSummaries.map((stage) => (
                  <PinnedStageCard
                    key={stage.id}
                    stage={stage}
                    members={members}
                    onMembersClick={handleAvatarClick}
                    className="w-[300px] shrink-0"
                    popover={
                      stages.map((item) => (
                        <WorkflowStageCard
                          key={item.id}
                          stage={item}
                          variant="fluid"
                          showRightChevron={false}
                          fallbackTopBarClass="bg-gray-300"
                          className="rounded-none border-0 p-3 pt-2 sm:p-3 sm:pt-2 sm:pb-2"
                        />
                      ))
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewerList
        isOpen={isReviewerListOpen}
        onClose={() => setIsReviewerListOpen(false)}
        anchorRect={reviewerAnchor}
        reviewers={reviewers}
        placement="bottom-start"
      />
    </div>
  );
}
