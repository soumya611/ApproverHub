/** Local types for checklist comments (replaces deleted CommentCard import) */
export interface Reply {
  id?: number;
  author?: string;
  content?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface Comment {
  id: number;
  author?: string;
  content?: string;
  repliesList?: Reply[];
  replies?: number;
  [key: string]: unknown;
}

export interface ChecklistComment extends Comment {
  sectionId: string;
  questionId: string;
}

export interface ChecklistCommentStorage {
  [key: string]: ChecklistComment[];
}

const STORAGE_KEY_PREFIX = "checklistComments_";

function getStorageKey(sectionId: string, questionId: string): string {
  return `${STORAGE_KEY_PREFIX}${sectionId}_${questionId}`;
}

export function getChecklistComments(
  sectionId: string,
  questionId: string
): ChecklistComment[] {
  try {
    const key = getStorageKey(sectionId, questionId);
    const stored = sessionStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as ChecklistComment[];
  } catch (error) {
    console.error("Error loading checklist comments:", error);
    return [];
  }
}

export function saveChecklistComment(
  sectionId: string,
  questionId: string,
  comment: ChecklistComment
): void {
  try {
    const key = getStorageKey(sectionId, questionId);
    const existing = getChecklistComments(sectionId, questionId);
    const updated = [...existing, comment];
    sessionStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving checklist comment:", error);
  }
}

export function updateChecklistComment(
  sectionId: string,
  questionId: string,
  commentId: number,
  updates: Partial<ChecklistComment>
): void {
  try {
    const comments = getChecklistComments(sectionId, questionId);
    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, ...updates } : c
    );
    const key = getStorageKey(sectionId, questionId);
    sessionStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating checklist comment:", error);
  }
}

export function deleteChecklistComment(
  sectionId: string,
  questionId: string,
  commentId: number
): void {
  try {
    const comments = getChecklistComments(sectionId, questionId);
    const updated = comments.filter((c) => c.id !== commentId);
    const key = getStorageKey(sectionId, questionId);
    sessionStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Error deleting checklist comment:", error);
  }
}

export function addChecklistCommentReply(
  sectionId: string,
  questionId: string,
  commentId: number,
  reply: Reply
): void {
  try {
    const comments = getChecklistComments(sectionId, questionId);
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        const existingReplies = c.repliesList ?? [];
        return {
          ...c,
          repliesList: [...existingReplies, reply],
          replies: (c.replies ?? 0) + 1,
        };
      }
      return c;
    });
    const key = getStorageKey(sectionId, questionId);
    sessionStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Error adding checklist comment reply:", error);
  }
}

export function getChecklistCommentCount(
  sectionId: string,
  questionId: string
): number {
  return getChecklistComments(sectionId, questionId).length;
}

export function clearChecklistComments(
  sectionId: string,
  questionId: string
): void {
  try {
    const key = getStorageKey(sectionId, questionId);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing checklist comments:", error);
  }
}
