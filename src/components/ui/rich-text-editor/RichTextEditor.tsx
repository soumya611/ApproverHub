import { useEffect, useRef, useState, type ReactNode } from "react";
import { Attachment, CopyLinkIcon, Gallery } from "../../../icons";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  toolbarClassName?: string;
  bodyClassName?: string;
  editorClassName?: string;
  showAttachment?: boolean;
  onAttachmentChange?: (files: File[]) => void;
}

type ToolbarItem = {
  id: string;
  label: ReactNode;
  command: string;
  className?: string;
  value?: string;
};

const TOOLBAR: ToolbarItem[] = [
  { id: "bold", label: "B", command: "bold", className: "font-bold" },
  { id: "italic", label: "I", command: "italic", className: "italic" },
  { id: "underline", label: "U", command: "underline", className: "underline" },
  { id: "h1", label: "H1", command: "formatBlock", value: "h1" },
  { id: "h2", label: "H2", command: "formatBlock", value: "h2" },
  { id: "h3", label: "H3", command: "formatBlock", value: "h3" },
  { id: "ul", label: "•", command: "insertUnorderedList" },
  { id: "ol", label: "1.", command: "insertOrderedList" },
  {
    id: "link",
    label: <CopyLinkIcon className="h-4 w-4" />,
    command: "createLink",
  },
  {
    id: "image",
    label: <Gallery className="h-4 w-4" />,
    command: "insertImage",
  },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing here...",
  className = "",
  toolbarClassName = "",
  bodyClassName = "",
  editorClassName = "",
  showAttachment = false,
  onAttachmentChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (document.activeElement === editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(editor.innerHTML);
  };

  const applyCommand = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (command === "createLink") {
      const url = window.prompt("Enter URL");
      if (url) {
        document.execCommand(command, false, url);
      }
    } else if (command === "insertImage") {
      const url = window.prompt("Enter image URL");
      if (url) {
        document.execCommand(command, false, url);
      }
    } else if (command === "formatBlock") {
      document.execCommand(command, false, value ?? "p");
    } else {
      document.execCommand(command);
    }
    handleInput();
  };

  const showPlaceholder = !value && !isFocused;

  return (
    <div className={`rounded-xl border border-gray-200 bg-white ${className}`}>
      <div
        className={`flex flex-wrap items-center gap-1 border-b border-gray-200 px-3 py-2 text-xs text-gray-600 ${toolbarClassName}`}
      >
        {TOOLBAR.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => applyCommand(item.command, item.value)}
            className={`rounded px-2 py-1 hover:bg-gray-100 ${item.className ?? ""}`}
            aria-label={item.command}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={`relative px-3 py-2 ${bodyClassName}`}>
        {showPlaceholder ? (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`min-h-[140px] text-sm text-gray-700 outline-none ${showAttachment ? "pb-9" : ""} ${editorClassName}`}
        />
        {showAttachment ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length) {
                  onAttachmentChange?.(files);
                }
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 left-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-600"
              aria-label="Attach files"
            >
              <Attachment className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
