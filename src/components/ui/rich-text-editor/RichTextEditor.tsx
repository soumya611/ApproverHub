import { useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  Eraser,
  Link2,
  List,
  ListOrdered,
} from "lucide-react";
import { Attachment } from "../../../icons";

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
  toolbarItems?: RichTextToolbarItem[];
}

export type RichTextToolbarItem =
  | "bold"
  | "italic"
  | "underline"
  | "h1"
  | "h2"
  | "h3"
  | "alignLeft"
  | "alignCenter"
  | "bulletList"
  | "orderedList"
  | "link"
  | "clearFormatting"
  | "attachment";

type ToolbarDefinition = {
  id: RichTextToolbarItem;
  label: ReactNode;
  ariaLabel: string;
  className?: string;
};

export const DEFAULT_RICH_TEXT_TOOLBAR_ITEMS: RichTextToolbarItem[] = [
  "bold",
  "italic",
  "underline",
  "h1",
  "h2",
  "h3",
  "alignLeft",
  "alignCenter",
  "bulletList",
  "orderedList",
  "link",
  "clearFormatting",
  "attachment",
];

const EMPTY_HTML = "<p></p>";

const normalizeHtml = (html: string) => (html === EMPTY_HTML ? "" : html);

const toEditorHtml = (html: string) => (html.trim().length ? html : EMPTY_HTML);

const TOOLBAR_DEFINITIONS: Record<RichTextToolbarItem, ToolbarDefinition> = {
  bold: { id: "bold", label: "B", ariaLabel: "Bold", className: "font-bold" },
  italic: { id: "italic", label: "I", ariaLabel: "Italic", className: "italic" },
  underline: {
    id: "underline",
    label: "U",
    ariaLabel: "Underline",
    className: "underline",
  },
  h1: { id: "h1", label: "H1", ariaLabel: "Heading 1" },
  h2: { id: "h2", label: "H2", ariaLabel: "Heading 2" },
  h3: { id: "h3", label: "H3", ariaLabel: "Heading 3" },
  alignLeft: {
    id: "alignLeft",
    label: <AlignLeft className="h-4 w-4" />,
    ariaLabel: "Align left",
  },
  alignCenter: {
    id: "alignCenter",
    label: <AlignCenter className="h-4 w-4" />,
    ariaLabel: "Align center",
  },
  bulletList: {
    id: "bulletList",
    label: <List className="h-4 w-4" />,
    ariaLabel: "Bulleted list",
  },
  orderedList: {
    id: "orderedList",
    label: <ListOrdered className="h-4 w-4" />,
    ariaLabel: "Numbered list",
  },
  link: {
    id: "link",
    label: <Link2 className="h-4 w-4" />,
    ariaLabel: "Insert link",
  },
  clearFormatting: {
    id: "clearFormatting",
    label: <Eraser className="h-4 w-4" />,
    ariaLabel: "Clear formatting",
  },
  attachment: {
    id: "attachment",
    label: <Attachment className="h-4 w-4" />,
    ariaLabel: "Attach files",
  },
};

const FALLBACK_EDITOR_STATE = {
  isEmpty: true,
  isFocused: false,
  bold: false,
  italic: false,
  underline: false,
  h1: false,
  h2: false,
  h3: false,
  alignLeft: false,
  alignCenter: false,
  bulletList: false,
  orderedList: false,
  link: false,
};

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
  toolbarItems,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestedToolbarItems = toolbarItems ?? DEFAULT_RICH_TEXT_TOOLBAR_ITEMS;
  const shouldShowAttachment =
    showAttachment || requestedToolbarItems.includes("attachment");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center"],
        defaultAlignment: "left",
      }),
    ],
    content: toEditorHtml(value),
    onUpdate: ({ editor: currentEditor }) => {
      onChange(normalizeHtml(currentEditor.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextValue = normalizeHtml(value);
    const currentValue = normalizeHtml(editor.getHTML());
    if (nextValue !== currentValue) {
      editor.commands.setContent(toEditorHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  const editorState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) {
          return FALLBACK_EDITOR_STATE;
        }
        return {
          isEmpty: currentEditor.isEmpty,
          isFocused: currentEditor.isFocused,
          bold: currentEditor.isActive("bold"),
          italic: currentEditor.isActive("italic"),
          underline: currentEditor.isActive("underline"),
          h1: currentEditor.isActive("heading", { level: 1 }),
          h2: currentEditor.isActive("heading", { level: 2 }),
          h3: currentEditor.isActive("heading", { level: 3 }),
          alignLeft: currentEditor.isActive({ textAlign: "left" }),
          alignCenter: currentEditor.isActive({ textAlign: "center" }),
          bulletList: currentEditor.isActive("bulletList"),
          orderedList: currentEditor.isActive("orderedList"),
          link: currentEditor.isActive("link"),
        };
      },
    }) ?? FALLBACK_EDITOR_STATE;

  const resolvedToolbarItems = useMemo(() => {
    if (!shouldShowAttachment) {
      return requestedToolbarItems.filter((item) => item !== "attachment");
    }
    return requestedToolbarItems;
  }, [requestedToolbarItems, shouldShowAttachment]);

  const promptForLink = () => {
    if (!editor) return;
    const currentHref = editor.getAttributes("link").href;
    const existingUrl = typeof currentHref === "string" ? currentHref : "";
    const enteredUrl = window.prompt("Enter URL", existingUrl);
    if (enteredUrl === null) return;

    const trimmedUrl = enteredUrl.trim();
    if (!trimmedUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const normalizedUrl = /^(https?:\/\/|mailto:|tel:)/i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizedUrl })
      .run();
  };

  const executeToolbarAction = (item: RichTextToolbarItem) => {
    if (item === "attachment") {
      fileInputRef.current?.click();
      return;
    }
    if (!editor) return;

    switch (item) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "h1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "alignLeft":
        editor.chain().focus().setTextAlign("left").run();
        break;
      case "alignCenter":
        editor.chain().focus().setTextAlign("center").run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "link":
        promptForLink();
        break;
      case "clearFormatting":
        editor.chain().focus().unsetAllMarks().clearNodes().run();
        break;
      default:
        break;
    }
  };

  const isToolbarItemActive = (item: RichTextToolbarItem) => {
    switch (item) {
      case "bold":
        return editorState.bold;
      case "italic":
        return editorState.italic;
      case "underline":
        return editorState.underline;
      case "h1":
        return editorState.h1;
      case "h2":
        return editorState.h2;
      case "h3":
        return editorState.h3;
      case "alignLeft":
        return editorState.alignLeft;
      case "alignCenter":
        return editorState.alignCenter;
      case "bulletList":
        return editorState.bulletList;
      case "orderedList":
        return editorState.orderedList;
      case "link":
        return editorState.link;
      case "clearFormatting":
      case "attachment":
      default:
        return false;
    }
  };

  const showPlaceholder = editorState.isEmpty && !editorState.isFocused;

  return (
    <div className={`rounded-md border border-gray-200 bg-white ${className}`}>
      <div
        className={`flex flex-wrap items-center gap-1 border-b border-gray-200 px-3 py-2 text-xs text-gray-600 rounded-t-md bg-gray-100 ${toolbarClassName}`}
      >
        {resolvedToolbarItems.map((item) => {
          const config = TOOLBAR_DEFINITIONS[item];
          const isAttachment = item === "attachment";
          const disabled = !editor && !isAttachment;

          return (
            <button
              key={config.id}
              type="button"
              onClick={() => executeToolbarAction(item)}
              className={`inline-flex h-7 min-w-7 items-center justify-center rounded px-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isToolbarItemActive(item)
                  ? "bg-gray-100 text-[#007B8C]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              } ${config.className ?? ""}`}
              aria-label={config.ariaLabel}
              disabled={disabled}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      <div className={`relative px-3 py-2 ${bodyClassName}`}>
        {showPlaceholder ? (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
            {placeholder}
          </span>
        ) : null}

        <EditorContent
          editor={editor}
          className={`text-sm text-gray-700 [&_.ProseMirror]:min-h-[140px] [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:break-words [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-lg [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-sm [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_a]:text-[#007B8C] [&_.ProseMirror_a]:underline ${editorClassName}`}
        />

        {shouldShowAttachment ? (
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
        ) : null}
      </div>
    </div>
  );
}
