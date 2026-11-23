/* Storage'dagi barcha fayllarni kompyuterga yuklab oladi. Oyiga bir marta qo'lda: npm run backup:storage */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

config({ path: ".env.local" });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("❌ .env.local da NEXT_PUBLIC_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY kerak."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const BUCKETS = ["public-media", "private"];
const outRoot = path.resolve(process.argv[2] ?? path.join("backups", `storage-${new Date().toISOString().slice(0, 10)}`));

async function listAll(bucket: string, prefix = ""): Promise<{ path: string; size: number }[]> {
  const out: { path: string; size: number }[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    if (!data?.length) break;
    for (const it of data) {
      const p = prefix ? `${prefix}/${it.name}` : it.name;
      if (it.id) out.push({ path: p, size: Number((it.metadata as { size?: number } | null)?.size ?? 0) });
      else out.push(...(await listAll(bucket, p)));
    }
    if (data.length < 100) break;
  }
  return out;
}

async function main() {
  console.log(`📦 Zaxira papkasi: ${outRoot}`);
  let total = 0, bytes = 0, skipped = 0, failed = 0;
  for (const bucket of BUCKETS) {
    const files = await listAll(bucket);
    console.log(`\n${bucket}: ${files.length} ta fayl`);
    const queue = [...files];
    const worker = async () => {
      for (let f = queue.shift(); f; f = queue.shift()) {
        const dest = path.join(outRoot, bucket, ...f.path.split("/"));
        try {
          const have = await stat(dest).then((s) => s.size, () => -1);
          if (have === f.size && have > 0) { skipped++; continue; } // allaqachon bor
          const { data, error } = await sb.storage.from(bucket).download(f.path);
          if (error || !data) throw new Error(error?.message ?? "bo'sh javob");
          const buf = Buffer.from(await data.arrayBuffer());
          await mkdir(path.dirname(dest), { recursive: true });
          await writeFile(dest, buf);
          total++; bytes += buf.length;
          process.stdout.write(`  ✓ ${f.path}\n`);
        } catch (e) {
          failed++;
          console.error(`  ✗ ${f.path}: ${(e as Error).message}`);
        }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  }
  console.log(`\n✅ Yuklab olindi: ${total} ta (${(bytes / 1024 / 1024).toFixed(1)} MB), o'tkazib yuborildi: ${skipped}, xato: ${failed}`);
  process.exit(failed ? 1 : 0);
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
