"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/utils/uploadImage";
import styles from "./RichTextEditor.module.css";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
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
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
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
        <div className={styles.toolDivider} />
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
        <div className={styles.toolDivider} />
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
        <div className={styles.toolDivider} />
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
      <div className={styles.content}>
        <EditorContent editor={editor} />
      </div>
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
    <button
      type="button"
      className={`${styles.toolButton} ${active ? styles.toolButtonActive : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
