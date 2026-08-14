"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Compact Tiptap editor for inline description fields.
 * Stores content as JSON string (same as the full RichTextEditor).
 */
export function MiniRichEditor({ value, onChange, placeholder = "Add a description...", className }: MiniRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[40px] max-h-[200px] overflow-y-auto px-3 py-2 text-sm focus:outline-none",
          "prose prose-sm dark:prose-invert !max-w-none",
          "[&_p]:m-0 [&_p]:leading-relaxed [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    content: (() => {
      if (!value) return "";
      try {
        return JSON.parse(value);
      } catch {
        // If it's plain text (legacy), wrap it
        return value ? `<p>${value}</p>` : "";
      }
    })(),
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className={cn("border border-dashed border-border/50 rounded-lg overflow-hidden focus-within:border-primary focus-within:border-solid transition-all", className)}>
      {/* Minimal toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border/30 bg-muted/20">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1 rounded hover:bg-muted/60 transition-colors",
            editor.isActive("bold") && "bg-muted text-primary"
          )}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1 rounded hover:bg-muted/60 transition-colors",
            editor.isActive("italic") && "bg-muted text-primary"
          )}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-border/40 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1 rounded hover:bg-muted/60 transition-colors",
            editor.isActive("bulletList") && "bg-muted text-primary"
          )}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1 rounded hover:bg-muted/60 transition-colors",
            editor.isActive("orderedList") && "bg-muted text-primary"
          )}
          title="Ordered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
