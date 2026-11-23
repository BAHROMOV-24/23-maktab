import type { Metadata } from "next";
import { TeachersExplorer } from "@/components/site/teachers-explorer";
import { Container, PageHero } from "@/components/site/ui-bits";
import { getTeachers } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Fan o'qituvchilari", description: "Maktab o'qituvchilari: fani, toifasi, staji va yutuqlari." };
export const revalidate = 300;

export default async function TeachersPage() {
  const teachers = await getTeachers();
  return (
    <>
      <PageHero title="Fan o'qituvchilari" subtitle="Fan bo'yicha filtrlang yoki ism bo'yicha qidiring" />
      <Container>
        <TeachersExplorer emptyText={t.empty.teachers}
          teachers={teachers.map((x) => ({ id: x.id, full_name: x.full_name, subject: x.subject, category: x.category, experience_years: x.experience_years, achievements: x.achievements, photo: x.thumb_path ?? x.photo_path }))} />
      </Container>
    </>
  );
}
