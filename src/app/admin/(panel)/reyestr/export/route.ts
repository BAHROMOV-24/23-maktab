import ExcelJS from "exceljs";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { queryRegistry, STATUS_LABEL } from "@/lib/admin/registry-query";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !["superadmin", "admin"].includes(s.profile.role)) return new NextResponse("Ruxsat yo'q", { status: 403 });
  const { rows } = await queryRegistry(Object.fromEntries(req.nextUrl.searchParams));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Reyestr");
  ws.columns = [
    { header: "№", key: "n", width: 6 }, { header: "Ism-familiya", key: "name", width: 34 }, { header: "Sinf", key: "grade", width: 10 },
    { header: "To'garak", key: "club", width: 26 }, { header: "Qatnashish holati", key: "status", width: 20 }, { header: "Izoh", key: "note", width: 40 },
  ];
  ws.getRow(1).font = { bold: true };
  rows.forEach((r, i) => ws.addRow({ n: i + 1, name: r.full_name, grade: r.grade ?? "", club: r.club?.name ?? "", status: STATUS_LABEL[r.status] ?? r.status, note: r.note ?? "" }));
  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reyestr-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
