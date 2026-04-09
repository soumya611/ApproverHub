import { useState } from "react";
import { CloseIcon, NotesIcon, NotesPlusIcon } from "../../icons";
import AnalyticsNoteItem from "../analytics/AnalyticsNoteItem";

export interface NoteItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

const MOCK_NOTES: NoteItem[] = [
  { id: "1", title: "Summer allergies campaign", description: "Rework needed after phase 1 is completed", date: "Jul 31" },
  { id: "2", title: "Summer allergies campaign", description: "Rework needed after phase 1 is completed", date: "Jul 31" },
  { id: "3", title: "Summer allergies campaign", description: "Rework needed after phase 1 is completed", date: "Jul 31" },
];

export default function NotesCard() {
  const [notes, setNotes]           = useState<NoteItem[]>(MOCK_NOTES);
  const [isEditing, setIsEditing]   = useState(false);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorText, setEditorText] = useState("");
  const [editingId, setEditingId]   = useState<string | null>(null);

  const handleAdd = () => {
    setEditingId(null);
    setEditorTitle("");
    setEditorText("");
    setIsEditing(true);
  };

  const handleEdit = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setEditingId(id);
    setEditorTitle(note.title);
    setEditorText(note.description);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSave = () => {
    const nextTitle = editorTitle.trim() || "New note";
    const nextDescription = editorText.trim();
    if (!nextTitle && !nextDescription) return;

    if (editingId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? { ...n, title: nextTitle, description: nextDescription }
            : n
        )
      );
    } else {
      const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      setNotes((prev) => [
        ...prev,
        { id: `note-${Date.now()}`, title: nextTitle, description: nextDescription, date },
      ]);
    }
    handleClose();
  };

  const handleInlineTitleSave = (id: string, nextTitle: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              title: nextTitle.trim() || note.title || "New note",
            }
          : note
      )
    );
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditorTitle("");
    setEditorText("");
    setEditingId(null);
  };

  // ── Shared header ──────────────────────────────────────
  const header = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0 shadow-[2px_4px_10px_0px_#0000000F]">
      <div className="flex items-center gap-2">
        <NotesIcon/>
        <span className="text-sm font-medium text-gray-700">Notes</span>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label="Close editor"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!editorTitle.trim() && !editorText.trim()}
            className="rounded-sm bg-[#E74C3C] px-4 py-1 text-sm font-semibold text-white hover:bg-[#c0392b] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E74C3C]/10 text-[#E74C3C] hover:bg-[#E74C3C]/20 transition"
          aria-label="Add note"
        >
          <NotesPlusIcon className="w-3 h-3"/>
        </button>
      )}
    </div>
  );

  // ── Editor view ────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden h-[480px]">
        {header}
        <div className="flex flex-1 flex-col">
          <input
            autoFocus
            value={editorTitle}
            onChange={(event) => setEditorTitle(event.target.value)}
            placeholder="Enter title"
            className="border-b border-gray-200 px-4 py-3 text-base font-semibold text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#007B8C]"
          />
          <textarea
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            placeholder="Start typing...."
            className="flex-1 resize-none p-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden h-[480px]">
      {header}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center pt-8">No notes yet</p>
        ) : (
          notes.map((note) => (
            <AnalyticsNoteItem
              key={note.id}
              variant="note"
              title={note.title}
              description={note.description}
              date={note.date}
              onEdit={() => handleEdit(note.id)}
              onDelete={() => handleDelete(note.id)}
              editableTitle
              onTitleSave={(nextTitle) => handleInlineTitleSave(note.id, nextTitle)}
            />
          ))
        )}
      </div>
    </div>
  );
}
