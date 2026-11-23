"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Redo2, Undo2 } from "lucide-react";

export function RichTextEditor({ name, defaultValue = "", invalid }: { name: string; defaultValue?: string; invalid?: boolean }) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } } })],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose-school min-h-40 px-3 py-2 outline-none", "aria-label": "Matn muharriri" } },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });
  if (!editor) return <div className="h-48 animate-pulse rounded-lg border bg-muted" />;

  const btn = (active: boolean) => `grid size-9 place-items-center rounded-md transition hover:bg-accent ${active ? "bg-accent text-primary" : ""}`;
  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Havola manzili (bo'sh qoldirsangiz, havola olib tashlanadi):", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor!.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className={`rounded-lg border bg-background ${invalid ? "border-destructive" : ""}`}>
      <div className="flex flex-wrap gap-0.5 border-b p-1" role="toolbar" aria-label="Matnni formatlash">
        <button type="button" className={btn(editor.isActive("bold"))} aria-label="Qalin" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-4" /></button>
        <button type="button" className={btn(editor.isActive("italic"))} aria-label="Kursiv" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-4" /></button>
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} aria-label="Sarlavha" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="size-4" /></button>
        <button type="button" className={btn(editor.isActive("bulletList"))} aria-label="Nuqtali ro'yxat" onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-4" /></button>
        <button type="button" className={btn(editor.isActive("orderedList"))} aria-label="Raqamli ro'yxat" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></button>
        <button type="button" className={btn(editor.isActive("link"))} aria-label="Havola" onClick={setLink}><Link2 className="size-4" /></button>
        <span className="mx-1 w-px bg-border" aria-hidden />
        <button type="button" className={btn(false)} aria-label="Orqaga (undo)" onClick={() => editor.chain().focus().undo().run()}><Undo2 className="size-4" /></button>
        <button type="button" className={btn(false)} aria-label="Oldinga (redo)" onClick={() => editor.chain().focus().redo().run()}><Redo2 className="size-4" /></button>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
