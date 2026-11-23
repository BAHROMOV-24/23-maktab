"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteResource, reorderResource } from "@/lib/admin/actions";
import { mediaUrl } from "@/lib/media";
import { DeleteButton } from "./delete-button";

export type ListItem = { id: string; title: string; subtitle?: string; thumb?: string | null };

function Row({ item, slug, orderable }: { item: ListItem; slug: string; orderable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: !orderable });
  const thumb = mediaUrl(item.thumb);
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-2.5 ${isDragging ? "z-10 shadow-lg" : ""}`}>
      {orderable && (
        <button type="button" className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded text-muted-foreground hover:bg-accent active:cursor-grabbing" aria-label={`Tartibni o'zgartirish: ${item.title}`} {...attributes} {...listeners}>
          <GripVertical className="size-5" />
        </button>
      )}
      {thumb && <Image src={thumb} alt="" width={44} height={44} className="size-11 shrink-0 rounded-md object-cover" />}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.title || "(nomsiz)"}</p>
        {item.subtitle && <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>}
      </div>
      <Button variant="ghost" size="icon" aria-label={`Tahrirlash: ${item.title}`} render={<Link href={`/admin/${slug}/${item.id}`} />}><Pencil /></Button>
      <DeleteButton name={item.title} action={deleteResource.bind(null, slug, item.id)} />
    </li>
  );
}

export function SortableList({ items: initial, slug, orderable }: { items: ListItem[]; slug: string; orderable: boolean }) {
  const [items, setItems] = useState(initial);
  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const next = arrayMove(items, items.findIndex((i) => i.id === e.active.id), items.findIndex((i) => i.id === e.over!.id));
    setItems(next);
    start(async () => {
      const r = await reorderResource(slug, next.map((i) => i.id));
      if (r.error) toast.error(r.error); else toast.success("Tartib saqlandi");
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">{items.map((i) => <Row key={i.id} item={i} slug={slug} orderable={orderable} />)}</ul>
      </SortableContext>
    </DndContext>
  );
}
