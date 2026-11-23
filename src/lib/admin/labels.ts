export const TABLE_LABEL: Record<string, string> = {
  posts: "Post", events: "Tadbir", announcements: "E'lon", leaders: "Rahbar", teachers: "O'qituvchi",
  council_members: "Kengash a'zosi", clubs: "To'garak", partners: "Hamkor", hero_slides: "Slayd",
  site_settings: "Sayt sozlamalari", registry_students: "Reyestr", profiles: "Foydalanuvchi",
};
export const OP_LABEL: Record<string, string> = { INSERT: "qo'shildi", UPDATE: "o'zgartirildi", DELETE: "o'chirildi" };
export const STATUS_COLOR: Record<string, string> = {
  draft: "bg-muted text-muted-foreground", review: "bg-amber-100 text-amber-900",
  published: "bg-green-100 text-green-900", rejected: "bg-red-100 text-red-900",
};
