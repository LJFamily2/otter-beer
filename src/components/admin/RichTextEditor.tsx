"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/utils/uploadImage";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
}

const toolButtonClass = (active?: boolean) =>
  `inline-flex h-[30px] min-w-[30px] cursor-pointer items-center justify-center rounded-sm px-2 text-[13px] font-semibold ${
    active
      ? "bg-secondary-container text-on-secondary-container"
      : "text-on-surface-variant hover:bg-surface-container"
  }`;

const proseMirrorStyles =
  "[&_.ProseMirror]:min-h-[240px] [&_.ProseMirror]:outline-none " +
  "[&_.ProseMirror_p]:mb-[0.9em] " +
  "[&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:font-display [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:text-primary " +
  "[&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:font-display [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:text-primary " +
  "[&_.ProseMirror_ul]:mb-[0.9em] [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:mb-[0.9em] [&_.ProseMirror_ol]:pl-6 " +
  "[&_.ProseMirror_blockquote]:my-0 [&_.ProseMirror_blockquote]:mb-[0.9em] [&_.ProseMirror_blockquote]:border-l-[3px] [&_.ProseMirror_blockquote]:border-secondary-fixed-dim [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-on-surface-variant " +
  "[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded " +
  "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline " +
  "[&_.is-editor-empty::before]:pointer-events-none [&_.is-editor-empty::before]:float-left [&_.is-editor-empty::before]:h-0 [&_.is-editor-empty::before]:text-outline [&_.is-editor-empty::before]:content-[attr(data-placeholder)]";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  async function handleImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadImage(file);
      editor.chain().focus().setImage({ src: uploaded.url }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href as
      | string
      | undefined;
    const url = window.prompt("Nhập URL liên kết:", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`overflow-hidden rounded border transition-colors ${
          error
            ? "border-error bg-error-container/10"
            : "border-[rgba(196,198,210,0.5)] bg-surface-container-lowest"
        }`}
      >
        <div className="flex flex-wrap gap-0.5 border-b border-[rgba(196,198,210,0.5)] bg-surface p-1.5">
          <ToolButton
            label="B"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolButton
            label="I"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <div className="mx-1 my-1 w-px bg-[rgba(196,198,210,0.5)]" />
          <ToolButton
            label="H2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolButton
            label="H3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          />
          <div className="mx-1 my-1 w-px bg-[rgba(196,198,210,0.5)]" />
          <ToolButton
            label="• Danh sách"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolButton
            label="1. Danh sách"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolButton
            label="Trích dẫn"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <div className="mx-1 my-1 w-px bg-[rgba(196,198,210,0.5)]" />
          <ToolButton
            label="Liên kết"
            active={editor.isActive("link")}
            onClick={setLink}
          />
          <ToolButton
            label={isUploadingImage ? "Đang tải..." : "Ảnh"}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={handleImagePick}
          />
        </div>
        <div className={`p-4 text-base leading-relaxed ${proseMirrorStyles}`}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {error ? (
        <p className="flex items-center gap-1 text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ToolButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={toolButtonClass(active)} onClick={onClick}>
      {label}
    </button>
  );
}
