
import { useMemo, useState } from "react";

/** Inline dropdown for comment actions (replaces deleted CommentActionsDropdown) */
function CommentActionsDropdown({
  isOpen,
  onClose,
  onEditComment,
  onDeleteComment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEditComment: () => void;
  onDeleteComment: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-full mt-1 py-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <button
        type="button"
        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => { onEditComment(); onClose(); }}
      >
        Edit
      </button>
      <button
        type="button"
        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        onClick={() => { onDeleteComment(); onClose(); }}
      >
        Delete
      </button>
    </div>
  );
}

interface Comment {
  id: number;
  author: string;
  authorInitial: string;
  avatarColor: string;
  timestamp: string;
  content: string;
  likes: number;
  replies: number;
  hasTag: boolean;
  tagText?: string;
  tagColor?: string;
  isMentioned?: boolean;
  mentions?: string[];
}

interface AccordionSection {
  id: string;
  title: string;
  isOpen: boolean;
}

interface WorkflowStage {
  id: string;
  stageNumber: string;
  title: string;
  dateRange: string;
  status: 'Approved' | 'Pending' | 'In Progress';
  approvers: Array<{
    initial: string;
    color: string;
  }>;
}

interface JobInfoField {
  label: string;
  value: string;
}

const COMMENTS_DATA: Comment[] = [
  {
    id: 1,
    author: "Pranali Gosavi",
    authorInitial: "P",
    avatarColor: "bg-purple-500",
    timestamp: "5 mins ago",
    content: "Change highlighted text",
    likes: 1,
    replies: 1,
    hasTag: true,
  },
  {
    id: 2,
    author: "Pranali Gosavi",
    authorInitial: "P",
    avatarColor: "bg-purple-500",
    timestamp: "5 mins ago",
    content: "Need new comment here @Sam well",
    likes: 0,
    replies: 0,
    hasTag: false,
    isMentioned: true,
    mentions: ["Sam well"],
  },
  {
    id: 3,
    author: "Vikas Cheda",
    authorInitial: "V",
    avatarColor: "bg-teal-500",
    timestamp: "5 mins ago",
    content: "Need new comment here @Sam well",
    likes: 1,
    replies: 0,
    hasTag: true,
    tagText: "Content",
    tagColor: "bg-purple-600 text-purple-800",
    isMentioned: true,
    mentions: ["Sam well"],
  },
];

const CommentsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comments' | 'job-details'>('comments');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(COMMENTS_DATA);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [accordionSections, setAccordionSections] = useState<AccordionSection[]>([
    { id: 'brief', title: 'Brief', isOpen: false },
    { id: 'workflow', title: 'Workflow', isOpen: false },
    { id: 'job-info', title: 'Job Information', isOpen: false }
  ]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedComments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const commentsToSort = comments.filter((comment) => {
      if (!query) return true;
      return (
        comment.author.toLowerCase().includes(query) ||
        comment.content.toLowerCase().includes(query)
      );
    });

    return [...commentsToSort].sort((a, b) => {
      const compareValue = a.author.localeCompare(b.author, undefined, { sensitivity: 'base' });
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }, [searchQuery, sortOrder, comments]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Handle adding new comment
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const handleEditComment = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingContent(comment.content);
      setOpenDropdownId(null);
    }
  };

  const handleSaveEdit = (commentId: number) => {
    if (editingContent.trim()) {
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? { ...comment, content: editingContent.trim() }
            : comment
        )
      );
      setEditingCommentId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = (commentId: number) => {
    const ok = window.confirm('Delete this comment?');
    if (ok) {
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      setOpenDropdownId(null);
    }
  };

  const handleActionsClick = (commentId: number) => {
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  const handleCloseDropdown = () => {
    setOpenDropdownId(null);
  };

  const renderMentionedText = (content: string, mentions: string[] = []) => {
    let processedContent = content;
    mentions.forEach(mention => {
      processedContent = processedContent.replace(
        new RegExp(`@${mention}`, 'g'),
        `<span class="text-teal-600 font-medium">@${mention}</span>`
      );
    });
    return { __html: processedContent };
  };

  const renderAccordionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'brief':
        return (
          <div>
            <p className="text-sm text-gray-800 leading-relaxed">
              It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-800">Supporting document</span>
              <button className="px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-full hover:bg-teal-700 transition-colors">
                Attachment 1
              </button>
            </div>
          </div>
        );

      case 'workflow':
        return (
          <div className="space-y-4">
            {workflowStages.map((stage) => (
              <div
  key={stage.id}
  className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm"
>
  {/* Top Section */}
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-start space-x-3">
      {/* Stage Badge */}
      <div className="bg-red-50 text-red-500 text-[11px] font-semibold px-2 py-0.5 rounded-md">
        {stage.stageNumber}
      </div>

      {/* Title + Date */}
      <div>
        <h4 className="font-semibold text-gray-900 text-[15px] leading-tight">
          {stage.title}
        </h4>
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <svg
            className="w-4 h-4 text-gray-500 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">{stage.dateRange}</span>
        </div>
      </div>
    </div>

    {/* Status Badge */}
    <div className="bg-green-600 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
      {stage.status}
    </div>
  </div>

  {/* Approvers Row */}
  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2">
      <span>Approvers / Reviewers</span>
      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8
           3.582-8 8 3.582 8 8 8z"
        />
      </svg>
    </div>

    {/* Avatars */}
    <div className="flex -space-x-2 mt-2">
      {stage.approvers.map((approver, index) => (
        <div
          key={index}
          className={`w-7 h-7 ${approver.color} rounded-full flex items-center justify-center text-white font-medium text-[12px] border-2 border-white shadow-sm`}
        >
          {approver.initial}
        </div>
      ))}
    </div>
  </div>
</div>

            ))}
          </div>
        );

      case 'job-info':
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {jobInfoFields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{field.label}</span>
                  <p className="text-sm font-medium text-gray-900">{field.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-800">Additional Information</span>
              <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const toggleAccordion = (sectionId: string) => {
    setAccordionSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, isOpen: !section.isOpen }
          : section
      )
    );
  };

  // Job Details Data
  const jobDetails = {
    jobName: "Jobname V.2",
    owner: "Krutika Gawankar",
    assignee: "Pranali Gosavi",
    createdDate: "8/12/2025, 15:22 pm"
  };

  // Workflow Stages Data
  const workflowStages: WorkflowStage[] = [
    {
      id: 'compliance',
      stageNumber: 'S1',
      title: 'Compliance',
      dateRange: '27 to 31 Dec 25',
      status: 'Approved',
      approvers: [
        { initial: 'V', color: 'bg-teal-500' },
        { initial: 'H', color: 'bg-blue-500' },
        { initial: 'S', color: 'bg-orange-500' }
      ]
    },
    {
      id: 'marketing',
      stageNumber: 'S2',
      title: 'Marketing',
      dateRange: '19 to 26 Dec 25',
      status: 'Approved',
      approvers: [
        { initial: 'P', color: 'bg-purple-500' },
        { initial: 'S', color: 'bg-orange-500' }
      ]
    }
  ];

  // Job Information Fields
  const jobInfoFields: JobInfoField[] = [
    // { label: 'Project Type', value: 'Marketing Campaign' },
    // { label: 'Priority', value: 'High' },
    // { label: 'Deadline', value: '31 Dec 2025' },
    // { label: 'Budget', value: '$50,000' },
    // { label: 'Client', value: 'ABC Corporation' },
    // { label: 'Department', value: 'Marketing' }
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Back Arrow */}
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Tabs - Equal Width */}
            <div className="flex w-64">
              <button
                onClick={() => setActiveTab('comments')}
                className={`relative flex-1 pb-2 text-sm font-medium text-center ${
                  activeTab === 'comments' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Comments
                {activeTab === 'comments' && (
                  <>
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-teal-500"></div>
                    <div className="absolute -top-1 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">1</span>
                    </div>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('job-details')}
                className={`flex-1 pb-2 text-sm font-medium text-center ${
                  activeTab === 'job-details' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Job Details
                {activeTab === 'job-details' && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-teal-500"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar - Only show for Comments tab */}
      {activeTab === 'comments' && (
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Filter Icons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                aria-label={`Sort comments by author ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <span className="font-medium">Author</span>
                <span className="ml-2 flex flex-col leading-none">
                  <svg
                    className={`w-3 h-3 ${sortOrder === 'asc' ? 'text-teal-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l5-5 5 5" />
                  </svg>
                  <svg
                    className={`w-3 h-3 ${sortOrder === 'desc' ? 'text-teal-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5" />
                  </svg>
                </span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Section - Only show for Comments tab */}
      {activeTab === 'comments' && (
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'comments' ? (
          <div className="px-6 py-4 space-y-6">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="space-y-3 relative">
                {/* Avatar and action icons */}
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 ${comment.avatarColor} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                    {comment.authorInitial}
                  </div>

                  {/* Right side action icons */}
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </button>
                    <div className="relative" style={{ zIndex: openDropdownId === comment.id ? 50 : 'auto' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionsClick(comment.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Comment actions"
                      >
                        <svg width="3" height="13" viewBox="0 0 3 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="1.25" cy="10.9785" r="1.25" transform="rotate(180 1.25 10.9785)" fill="#999999" />
                          <circle cx="1.25" cy="6.47852" r="1.25" transform="rotate(180 1.25 6.47852)" fill="#999999" />
                          <circle cx="1.25" cy="1.97852" r="1.25" transform="rotate(180 1.25 1.97852)" fill="#999999" />
                        </svg>
                      </button>
                      <CommentActionsDropdown
                        isOpen={openDropdownId === comment.id}
                        onClose={handleCloseDropdown}
                        onEditComment={() => handleEditComment(comment.id)}
                        onDeleteComment={() => handleDeleteComment(comment.id)}
                      />
                    </div>
                  </div>
                </div>

                {/* Content Tag - second row (if present) */}
                {comment.hasTag && (
                  <div className={`px-2 py-0.5 ${comment.isMentioned ? 'bg-[#BD00C0] text-gray-100' : comment.tagColor} rounded text-xs font-medium flex items-center space-x-1 w-fit`}>
                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.08963 0.625C8.59652 0.625047 8.12361 0.820976 7.77495 1.16969L0.669509 8.27469C0.320863 8.62338 0.125 9.09628 0.125 9.58937C0.125 10.0825 0.320863 10.5554 0.669509 10.9041L5.59445 15.8294C5.94314 16.1781 6.41604 16.3739 6.90913 16.3739C7.40223 16.3739 7.87513 16.1781 8.22382 15.8294L15.3293 8.72444C15.502 8.55174 15.639 8.34671 15.7324 8.12106C15.8259 7.89541 15.874 7.65355 15.8739 7.40931V2.48438C15.8739 1.99124 15.678 1.5183 15.3293 1.1696C14.9806 0.820898 14.5077 0.625 14.0146 0.625H9.08963ZM8.54801 1.94319C8.61912 1.87203 8.70355 1.81558 8.79649 1.77707C8.88942 1.73856 8.98904 1.71874 9.08963 1.71875H14.0146C14.4376 1.71875 14.7802 2.06175 14.7802 2.48438V7.40931C14.7802 7.61231 14.6997 7.80744 14.5562 7.95094L7.45076 15.0559C7.37966 15.127 7.29526 15.1834 7.20236 15.2219C7.10947 15.2604 7.0099 15.2802 6.90935 15.2802C6.8088 15.2802 6.70924 15.2604 6.61634 15.2219C6.52345 15.1834 6.43904 15.127 6.36795 15.0559L1.44257 10.131C1.37147 10.0599 1.31507 9.9755 1.27658 9.8826C1.2381 9.78971 1.2183 9.69014 1.2183 9.58959C1.2183 9.48904 1.2381 9.38948 1.27658 9.29658C1.31507 9.20369 1.37147 9.11928 1.44257 9.04819L8.54801 1.94319ZM12.1543 5.4375C12.4444 5.4375 12.7226 5.32227 12.9277 5.11715C13.1328 4.91203 13.2481 4.63383 13.2481 4.34375C13.2481 4.05367 13.1328 3.77547 12.9277 3.57035C12.7226 3.36523 12.4444 3.25 12.1543 3.25C11.8642 3.25 11.586 3.36523 11.3809 3.57035C11.1758 3.77547 11.0606 4.05367 11.0606 4.34375C11.0606 4.63383 11.1758 4.91203 11.3809 5.11715C11.586 5.32227 11.8642 5.4375 12.1543 5.4375Z" fill={comment.isMentioned ? "white" : "#8D8D8D"}/>
</svg>

                    <span>{comment.tagText}</span>
                  </div>
                )}

                {/* Author and timestamp - third row */}
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-gray-900">{comment.author}</h4>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>

                {/* Comment content - fourth row */}
                <div>
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p 
                      className="text-sm text-gray-800"
                      dangerouslySetInnerHTML={renderMentionedText(comment.content, comment.mentions)}
                    />
                  )}
                </div>

                {/* Like and Reply - fifth row */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {comment.likes > 0 && (
                    <button className="flex items-center space-x-1 hover:text-gray-700">
                      <span className="text-blue-600">{comment.likes}</span>
                      <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.9395 7.08333L10.241 6.96717C10.2242 7.0686 10.2296 7.17248 10.2569 7.2716C10.2843 7.37073 10.3328 7.46271 10.3993 7.54117C10.4658 7.61962 10.5485 7.68267 10.6418 7.72593C10.7351 7.76919 10.8366 7.79162 10.9395 7.79167V7.08333ZM3.14779 7.08333V6.375C2.95992 6.375 2.77976 6.44963 2.64692 6.58247C2.51408 6.7153 2.43945 6.89547 2.43945 7.08333H3.14779ZM4.56445 14.875H12.6111V13.4583H4.56445V14.875ZM13.4611 6.375H10.9395V7.79167H13.4611V6.375ZM11.6386 7.1995L12.2088 3.77471L10.812 3.54167L10.241 6.96717L11.6386 7.1995ZM10.812 2.125H10.6604V3.54167H10.812V2.125ZM8.30233 3.38654L6.52158 6.05979L7.70024 6.84604L9.48241 4.17279L8.30233 3.38654ZM5.93154 6.375H3.14779V7.79167H5.93154V6.375ZM2.43945 7.08333V12.75H3.85612V7.08333H2.43945ZM14.695 13.1665L15.545 8.9165L14.1567 8.63883L13.3067 12.8888L14.695 13.1665ZM6.52158 6.05979C6.45687 6.15677 6.36852 6.23629 6.26572 6.29127C6.16291 6.34626 6.04812 6.37502 5.93154 6.375V7.79167C6.28136 7.79164 6.62576 7.70525 6.93419 7.54017C7.24261 7.37508 7.5055 7.13641 7.69954 6.84533L6.52158 6.05979ZM12.2088 3.77471C12.2426 3.5718 12.2319 3.36395 12.1773 3.16562C12.1227 2.96728 12.0255 2.78322 11.8926 2.62623C11.7597 2.46923 11.5941 2.34307 11.4075 2.25651C11.2209 2.16996 11.0177 2.12508 10.812 2.125V3.54167L12.2088 3.77471ZM13.4611 7.79167C13.5659 7.79163 13.6695 7.81485 13.7642 7.85965C13.859 7.90446 13.9426 7.96974 14.0091 8.05078C14.0755 8.13182 14.1232 8.22661 14.1486 8.3283C14.174 8.42999 14.1772 8.53605 14.1567 8.63883L15.545 8.9165C15.6066 8.60827 15.5991 8.29021 15.523 7.98524C15.4468 7.68027 15.304 7.396 15.1047 7.1529C14.9054 6.9098 14.6547 6.71393 14.3706 6.57942C14.0866 6.4449 13.7754 6.37508 13.4611 6.375V7.79167ZM12.6111 14.875C13.1024 14.875 13.5786 14.7048 13.9585 14.3933C14.3385 14.0818 14.5987 13.6483 14.695 13.1665L13.3067 12.8888C13.2746 13.0496 13.1877 13.1942 13.0608 13.2981C12.934 13.4019 12.7751 13.4586 12.6111 13.4583V14.875ZM10.6604 2.125C10.194 2.12501 9.73477 2.24016 9.32354 2.46023C8.91231 2.6803 8.56107 2.99848 8.30233 3.38654L9.48241 4.17279C9.61174 3.9787 9.78628 3.81953 9.9919 3.70944C10.1975 3.59934 10.4271 3.54171 10.6604 3.54167V2.125ZM4.56445 13.4583C4.37659 13.4583 4.19642 13.3837 4.06359 13.2509C3.93075 13.118 3.85612 12.9379 3.85612 12.75H2.43945C2.43945 13.3136 2.66334 13.8541 3.06185 14.2526C3.46037 14.6511 4.00087 14.875 4.56445 14.875V13.4583Z" fill="black" fill-opacity="0.5"/>
<path d="M5.98242 7.08398V14.1673V7.08398Z" fill="black" fill-opacity="0.5"/>
<path d="M5.98242 7.08398V14.1673" stroke="black" stroke-opacity="0.5" stroke-width="2"/>
</svg>

                    </button>
                  )}
                  <button className="hover:text-gray-700">Reply</button>
                </div>

                {/* View replies - sixth row */}
                {comment.replies > 0 && (
                  <div className="text-xs text-gray-500">
                    <button className="hover:text-gray-700">View {comment.replies} reply</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Job Details Tab Content */
          <div className="px-6 py-4 space-y-6">
            {/* Job Name and Version */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-teal-600">{jobDetails.jobName}</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Job Metadata */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Owner:</span>
                <span className="text-sm font-medium text-gray-900">{jobDetails.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Assignee:</span>
                <span className="text-sm font-medium text-gray-900">{jobDetails.assignee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created Date:</span>
                <span className="text-sm font-medium text-gray-900">{jobDetails.createdDate}</span>
              </div>
            </div>

            {/* Accordion Sections */}
           <div className="space-y-3">
  {accordionSections.map((section) => (
    <div
      key={section.id}
      className={`border border-gray-200 rounded-lg overflow-hidden ${
        section.isOpen ? "bg-white" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => toggleAccordion(section.id)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-900">{section.title}</span>
        <span className="text-sm text-red-600 hover:text-red-700">
          {section.isOpen ? "Hide" : "View details"}
        </span>
      </button>

       {/* Content */}
       {section.isOpen && (
         <div className="border-t border-gray-200 bg-white p-4">
           {renderAccordionContent(section.id)}
         </div>
       )}
    </div>
  ))}
</div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;
