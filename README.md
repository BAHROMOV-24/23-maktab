# 23-maktab veb-sayti va admin paneli

Maktab uchun zamonaviy sayt: yangiliklar, e'lonlar, tadbirlar, o'qituvchilar, o'quvchilar kengashi, to'garaklar va murojaatlar. Kontentni bir nechta odam admin panel orqali boshqaradi.

**Texnologiyalar:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (baza, kirish, fayllar, Realtime) · Vercel.
Hammasi **bepul tariflarda** ishlaydi.

---

## Mundarija

1. [Tayyorgarlik](#1-tayyorgarlik)
2. [Supabase loyihasini ochish](#2-supabase-loyihasini-ochish)
3. [`.env.local` faylini to'ldirish](#3-envlocal-faylini-toldirish)
4. [Baza va birinchi superadmin](#4-baza-va-birinchi-superadmin)
5. [Saytni kompyuterda ishga tushirish](#5-saytni-kompyuterda-ishga-tushirish)
6. [Vercel'ga joylash](#6-vercelga-joylash)
7. [Zaxira nusxa (GitHub Actions)](#7-zaxira-nusxa-github-actions)
8. [Koordinatorlar uchun yo'riqnoma](#8-koordinatorlar-uchun-yoriqnoma)
9. [Maslahatchi uchun yo'riqnoma](#9-maslahatchi-uchun-yoriqnoma)
10. [Administrator uchun kundalik ishlar](#10-administrator-uchun-kundalik-ishlar)
11. [Kengash a'zolarini JSON'dan yuklash](#11-kengash-azolarini-jsondan-yuklash)
12. [Bepul tarif cheklovlari va xotira nazorati](#12-bepul-tarif-cheklovlari-va-xotira-nazorati)
13. [Xavfsizlik ro'yxati](#13-xavfsizlik-royxati)
14. [Muammolar va yechimlar](#14-muammolar-va-yechimlar)
15. [Rus tilini qo'shish](#15-rus-tilini-qoshish)
16. [Buyruqlar va loyiha tuzilishi](#16-buyruqlar-va-loyiha-tuzilishi)

---

## 1. Tayyorgarlik

Kerak bo'ladi:

| Nima | Qayerdan | Nima uchun |
|---|---|---|
| **Node.js 22 yoki yangisi** | https://nodejs.org | Dasturni ishga tushirish |
| **Git** | https://git-scm.com | Kodni GitHub'ga yuklash |
| **Supabase hisobi** | https://supabase.com | Baza va fayllar (bepul) |
| **GitHub hisobi** | https://github.com | Kod saqlash va zaxira nusxa |
| **Vercel hisobi** | https://vercel.com | Saytni internetga chiqarish (bepul Hobby) |

Loyiha papkasida bir marta o'rnating:

```powershell
npm install
```

---

## 2. Supabase loyihasini ochish

1. https://supabase.com/dashboard ga kiring → **New project**.
2. Nomi: `23-maktab`. **Database password** maydonida parol yarating va **uni nusxalab xavfsiz joyga saqlang** (keyin kerak bo'ladi).
3. Mintaqa: Evropadan biri (masalan Frankfurt). **Free** tarifni tanlang.
4. Loyiha 1–2 daqiqada tayyor bo'ladi.

### Kalitlarni olish

**Project Settings → API Keys** bo'limida:

- **Project URL**: `https://xxxxxxxx.supabase.co`
- **Publishable key** (`sb_publishable_...`): ommaviy kalit
- **Secret key** (`sb_secret_...`): **maxfiy**, hech kimga ko'rsatmang va chatlarga yubormang

### Ro'yxatdan o'tishni o'chirish (MUHIM)

Foydalanuvchilarni faqat superadmin yaratishi kerak. Supabase'da bu sozlama qo'lda o'chiriladi:

1. **Authentication → Sign In / Providers** (yoki *Sign In / Up*).
2. **«Allow new users to sign up»** (yangi foydalanuvchilarga ro'yxatdan o'tishga ruxsat) ni **o'chiring** va saqlang.

> Bu o'chirilmagan bo'lsa ham begona odam admin panelga kira olmaydi (profil va rol bo'lmaydi), lekin baribir o'chirib qo'ying.

---

## 3. `.env.local` faylini to'ldirish

Loyiha papkasida `.env.example` faylidan nusxa olib, `.env.local` nomi bilan saqlang:

```powershell
Copy-Item .env.example .env.local
```

So'ng `.env.local` ni oching va to'ldiring:

| O'zgaruvchi | Qiymat |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable key** (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret key** (`sb_secret_...`) |
| `NEXT_PUBLIC_SITE_URL` | Hozircha `http://localhost:3000`, Vercel'da haqiqiy manzil |
| `CRON_SECRET` | Istalgan uzun tasodifiy qator (kamida 24 belgi) |
| `SEED_SUPERADMIN_EMAIL` | O'zingizning email (superadmin shu bilan kiradi) |
| `SEED_SUPERADMIN_PASSWORD` | Kamida 10 belgili **kuchli** parol (tug'ilgan yil emas) |
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens da yaratiladi (faqat migratsiya uchun) |
| `SUPABASE_DB_PASSWORD` | 2-qadamda saqlagan database paroli |

> `.env.local` hech qachon GitHub'ga yuklanmaydi (`.gitignore` da). `SUPABASE_SERVICE_ROLE_KEY` faqat serverda ishlatiladi, brauzerga chiqmaydi.

Tasodifiy `CRON_SECRET` yaratish:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

---

## 4. Baza va birinchi superadmin

Barcha buyruqlar loyiha papkasida bajariladi.

**1) Supabase'ga ulanish** (`.env.local` dagi token va parol ishlatiladi):

```powershell
npx supabase link --project-ref <loyiha-id>
```

`<loyiha-id>`: URL dagi `https://<loyiha-id>.supabase.co` qismi.
Agar token `.env.local` da bo'lsa va buyruq login so'rasa, avval `npx supabase login` ni bajaring.

**2) Jadvallar va xavfsizlik qoidalarini (RLS) yaratish:**

```powershell
npm run db:push
```

Bu `supabase/migrations/` dagi fayllarni bazaga qo'llaydi.

**3) Namunaviy ma'lumotlar va superadmin:**

```powershell
npm run seed
```

Skript maktab sozlamalari, rahbarlar, o'qituvchilar, kengash (1 maslahatchi + 1 lider + 7 koordinator), to'garaklar, tadbirlar, e'lonlar va namunaviy postlarni qo'shadi hamda `.env.local` dagi email va parol bilan **superadmin** yaratadi. Qayta ishga tushirish xavfsiz: mavjud ma'lumotni buzmaydi.

**4) Tiplarni yangilash** (faqat bazaga o'zgartirish kiritilganda kerak):

```powershell
npm run db:types
```

---

## 5. Saytni kompyuterda ishga tushirish

```powershell
npm run dev
```

- Sayt: http://localhost:3000
- Admin panel: http://localhost:3000/admin (seed'dagi email va parol bilan kiring)

Ishlab chiqarish rejimini sinash:

```powershell
npm run build
npm run start
```

Qo'shimcha tekshiruvlar:

```powershell
npm run lint          # kod tekshiruvi
npm run test:roles    # rollar va ruxsatlar sinovi (baza bilan, o'zini tozalaydi)
```

---

## 6. Vercel'ga joylash

### 6.1. Kodni GitHub'ga yuklash

1. https://github.com/new da **private** (yopiq) repozitoriy oching (masalan `23-maktab`).
2. Loyiha papkasida:

```powershell
git add .
git commit -m "Birinchi versiya"
git branch -M main
git remote add origin https://github.com/<foydalanuvchi>/23-maktab.git
git push -u origin main
```

### 6.2. Vercel'da loyiha yaratish

1. https://vercel.com/new → GitHub repozitoriyni tanlang → **Import**.
2. Framework avtomatik **Next.js** deb aniqlanadi.
3. **Environment Variables** bo'limiga quyidagilarni kiriting:

| O'zgaruvchi | Qiymat |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key |
| `NEXT_PUBLIC_SITE_URL` | Saytning haqiqiy manzili (masalan `https://23-maktab.vercel.app` yoki o'z domeningiz) |
| `CRON_SECRET` | `.env.local` dagi bilan **bir xil** |

> `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` va `SEED_*` ni Vercel'ga **kiritmang**.

4. **Deploy** ni bosing.
5. Birinchi deploydan keyin manzil o'zgargan bo'lsa, `NEXT_PUBLIC_SITE_URL` ni yangilab, **Redeploy** qiling (Telegram'dagi ko'rinish va sitemap uchun).

### 6.3. Cron (Supabase uxlab qolmasligi uchun)

Bepul Supabase loyihasi 7 kun faol bo'lmasa to'xtatib qo'yiladi. `vercel.json` da `/api/keep-alive` har kuni 06:00 (UTC) da avtomatik chaqiriladigan qilib sozlangan. Qo'shimcha ish kerak emas, faqat Vercel'da `CRON_SECRET` kiritilgan bo'lishi shart.

Tekshirish: Vercel → loyiha → **Settings → Cron Jobs**. Qo'lda sinash:

```powershell
curl -H "Authorization: Bearer <CRON_SECRET>" https://<sayt-manzili>/api/keep-alive
```

Javob `{"ok":true,...}` bo'lsa, hammasi joyida.

### 6.4. Domen (ixtiyoriy)

Vercel → **Settings → Domains** → o'z domeningizni qo'shing va ko'rsatmaga amal qiling. Keyin `NEXT_PUBLIC_SITE_URL` ni yangilang.

---

## 7. Zaxira nusxa (GitHub Actions)

Bepul Supabase tarifida avtomatik zaxira **yo'q**, shuning uchun ikki xil nusxa olinadi.

### 7.1. Baza: har hafta avtomatik

`.github/workflows/backup.yml` har yakshanba bazaning nusxasini olib, GitHub'da **90 kun** saqlaydi.

**Sozlash (bir marta):**

1. Supabase → loyiha → yuqoridagi **Connect** tugmasi → **Session pooler** bo'limidan ulanish manzilini (URI) nusxalang. U shunday ko'rinadi:
   `postgresql://postgres.<loyiha-id>:[YOUR-PASSWORD]@aws-0-<mintaqa>.pooler.supabase.com:5432/postgres`
2. `[YOUR-PASSWORD]` o'rniga database parolini yozing. Parolda **maxsus belgilar** bo'lsa, ularni kodlang: `%` → `%25`, `^` → `%5E`, `@` → `%40`, `#` → `%23`, `/` → `%2F`.
3. GitHub → repozitoriy → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `SUPABASE_DB_URL`
   - Secret: yuqoridagi to'liq manzil.

> «Direct connection» emas, aynan **Session pooler** ishlating: GitHub serverlari IPv6 ishlatmaydi.

**Sinash:** GitHub → **Actions → «Haftalik baza zaxira nusxasi» → Run workflow**. Tugagach ish sahifasi pastida **maktab-db-backup** artifact paydo bo'ladi: uni yuklab oling.

**Tiklash (kerak bo'lib qolsa):** yangi Supabase loyihasida avval `npm run db:push` qiling, so'ng:

```powershell
pg_restore --no-owner --data-only -d "<ulanish-manzili>" maktab-db-YYYY-MM-DD.dump
```

> Tiklash nozik jarayon. Kerak bo'lsa, dasturchiga murojaat qiling va dump faylni yo'qotmang.

### 7.2. Fayllar (rasm, PDF): oyiga bir marta qo'lda

```powershell
npm run backup:storage
```

Barcha fayllar `backups/storage-YYYY-MM-DD/` papkasiga yuklanadi (ommaviy va yopiq bucket'lar alohida). Qayta ishga tushirsangiz, mavjudlarini o'tkazib yuboradi. Papkani tashqi diskka yoki Google Drive'ga ko'chirib qo'ying.

---

## 8. Koordinatorlar uchun yo'riqnoma

### 8.1. Akkaunt yaratish (superadmin qiladi)

Avval **kengash a'zosi yozuvi** bo'lishi kerak (seed'da 7 ta koordinator va lider tayyor, **Kengash a'zolari** bo'limida ismini haqiqiysiga almashtiring).

1. Admin panelga superadmin sifatida kiring.
2. Chap menyuda **Foydalanuvchilar → Yangi foydalanuvchi**.
3. To'ldiring:
   - **Ism-familiya**
   - **Email** (koordinatorning haqiqiy emaili)
   - **Parol** (kamida 10 belgi). Uni koordinatorga xavfsiz usulda yetkazing
   - **Roli:** `Koordinator`
   - **Kengashdagi o'rni:** shu koordinatorning yozuvini tanlang (har bir yozuv faqat **bitta** foydalanuvchiga bog'lanadi)
4. **Foydalanuvchi yaratish**. Lider ham shu rolda: kengashdagi «Lider» yozuviga bog'lanadi.

Parolni tiklash yoki bloklash: **Foydalanuvchilar → ro'yxatdan ismni tanlang** → yangi parol yozing yoki «Bloklangan» belgisini qo'ying.

### 8.2. Post joylash (koordinator, telefondan ham)

1. `https://<sayt-manzili>/admin` ni oching va kiring.
2. **Postlar → Yangi post** (telefonda chap yuqoridagi ☰ menyu).
3. To'ldiring:
   - **Sarlavha** va **Qisqa tavsif**
   - **Matn:** qalin, kursiv, ro'yxat va havola tugmalari bor
   - **Asosiy rasm:** «Rasm tanlash». Rasm avtomatik kichraytiriladi, shuning uchun katta fotoni ham yuklayvering
   - **Fotolavhalar:** bir nechta rasmni birdaniga tanlash mumkin
   - **Biriktirilgan fayllar:** PDF, Word, PowerPoint yoki Excel (15 MB gacha)
4. Pastdagi tugmalar:
   - **Qoralama sifatida saqlash**: faqat o'zingiz ko'rasiz
   - **Tekshiruvga yuborish**: maslahatchiga boradi
5. Postingiz holati **Postlar** ro'yxatida ko'rinadi:
   - 🟡 **Tekshiruvda**: maslahatchi ko'rib chiqmoqda
   - 🟢 **E'lon qilingan**: saytda chiqdi
   - 🔴 **Rad etilgan**: sababi postni ochganda yozilgan, tuzatib qayta yuboring

> E'lon qilingan postni tahrirlasangiz, u qayta tekshiruvga tushadi. Siz faqat **o'z** postlaringizni ko'rasiz va tahrirlaysiz.

---

## 9. Maslahatchi uchun yo'riqnoma

1. Kiring → boshqaruv panelida **«Tekshiruvda turgan postlar»** soni va ro'yxati ko'rinadi.
2. Postni oching, o'qing va kerak bo'lsa tahrirlang.
3. Tugmalar:
   - **E'lon qilish**: saytda darhol chiqadi, sayt ochiq turganlarga bildirishnoma boradi
   - **Rad etish**: sababni yozing, muallif ko'radi
   - **Qoralamaga qaytarish**: e'lon qilingan postni yashirish
4. **Kengash a'zolari** bo'limida a'zolarning ismi, sinfi, yo'nalishi va rasmini tahrirlash mumkin.

Maslahatchining reyestr va murojaatlarga **ruxsati yo'q**.

> «Koordinator postlari tasdiqlansin» sozlamasi **Sayt sozlamalari → Postlar** bo'limida. Sukut bo'yicha yoqilgan. O'chirilsa, koordinatorlar postni o'zlari e'lon qila oladi.

---

## 10. Administrator uchun kundalik ishlar

| Nima qilmoqchisiz | Qayerda |
|---|---|
| Maktab nomi, shior, logo, bosh sahifa rasmi, aloqa, ijtimoiy tarmoqlar, xarita | **Sayt sozlamalari** |
| Statistika raqamlari (o'quvchilar, o'qituvchilar...) | **Sayt sozlamalari → Statistika**. Bo'sh qoldirilgan raqam saytda ko'rinmaydi |
| «Maktab haqida» matnlari (tarix, maqsad, yutuqlar) | **Sayt sozlamalari** sahifasi pastida |
| Bosh sahifadagi qo'shimcha slaydlar | **Bosh sahifa slayderi** |
| Rahbarlar, o'qituvchilar, to'garaklar, tadbirlar, e'lonlar, hamkorlar | Chap menyudagi tegishli bo'lim |
| Ro'yxat tartibini o'zgartirish | Chap tomondagi ⠿ tutqichdan ushlab sudrang |
| Reyestrdagi o'quvchilar, Excel'ga yuklash | **Reyestr** (faqat admin va superadmin) |
| Direktorga kelgan murojaatlar | **Murojaatlar** (holatini o'zgartiring: yangi / ko'rib chiqilmoqda / javob berildi) |
| Xotira holati | **Boshqaruv paneli → Xotira**. 80% dan oshsa ogohlantirish chiqadi |

**Eslatmalar**

- O'chirishdan oldin tasdiqlash oynasi chiqadi. Yozuv o'chirilganda unga tegishli rasm va fayllar ham Storage'dan o'chadi.
- Admin paneldan kiritilgan o'zgarish saytda **darhol** ko'rinadi.
- **Reyestr** maxfiy: sayt ommaviy qismida faqat umumiy sonlar (jami, jalb qilingani, foizi, to'garaklar bo'yicha diagramma) chiqadi. Ism-familiya hech qachon chiqmaydi.

### Rollar jadvali

| | Superadmin | Admin | Maslahatchi | Koordinator |
|---|:-:|:-:|:-:|:-:|
| Foydalanuvchilar yaratish, parol, bloklash | ✅ | | | |
| Sayt kontenti, sozlamalar | ✅ | ✅ | | |
| Reyestr, murojaatlar | ✅ | ✅ | | |
| Kengash a'zolari | ✅ | ✅ | ✅ | |
| Barcha postlarni tasdiqlash/rad etish | ✅ | ✅ | ✅ | |
| O'z postini yozish va tahrirlash | ✅ | ✅ | ✅ | ✅ |

---

## 11. Kengash a'zolarini JSON'dan yuklash

Ma'lumotlar ko'p bo'lsa, ularni bitta JSON faylga yozib, bir buyruq bilan yuklash mumkin. Mavjud yozuvlar (maslahatchi, lider, 1–7-koordinator) **yangilanadi**. Rasmlar keyin admin paneldan yuklanadi.

**Fayl namunasi** (`scripts/council.example.json`):

```json
{
  "maslahatchi": {
    "first_name": "Dilnoza",
    "last_name": "Karimova",
    "direction_name": "Maktab maslahatchisi"
  },
  "lider": {
    "first_name": "Jasur",
    "last_name": "Rahimov",
    "grade": "11-A",
    "direction_name": "Kengash lideri",
    "direction_description": "Kengash faoliyatini muvofiqlashtiradi."
  },
  "koordinatorlar": [
    {
      "first_name": "Madina",
      "last_name": "Yusupova",
      "grade": "10-B",
      "direction_name": "Ta'lim va fanlar",
      "direction_description": "Olimpiadalar, fan to'garaklari va o'quv tadbirlari."
    }
  ]
}
```

- Majburiy maydon faqat `first_name`. Qolganlari ixtiyoriy: `last_name`, `grade` (sinf), `direction_name` (yo'nalish nomi), `direction_description` (tavsif).
- `koordinatorlar` ro'yxatidagi tartib raqami koordinator raqamiga to'g'ri keladi (1-element = 1-koordinator).

**Avval tekshirib ko'ring** (hech narsa o'zgarmaydi):

```powershell
npm run import:council -- scripts/council.json --dry
```

**Yuklash:**

```powershell
npm run import:council -- scripts/council.json
```

---

## 12. Bepul tarif cheklovlari va xotira nazorati

| Cheklov | Qiymat | Sayt qanday moslashgan |
|---|---|---|
| Ma'lumotlar bazasi | 500 MB | Matn juda kam joy oladi |
| Fayllar (Storage) | 1 GB | Rasmlar brauzerda siqiladi (asosiy ~300 KB WebP, kichik 400px) |
| Trafik | oyiga 5 GB | Rasmlarga 1 yillik kesh, sahifalar 5 daqiqa keshlanadi |
| Faol bo'lmasa | 7 kundan keyin to'xtaydi | Har kuni Cron chaqiradi |
| Zaxira | yo'q | Haftalik GitHub nusxasi + oylik fayl nusxasi |

- **Boshqaruv paneli → Xotira** fayllar va baza qancha joy olgani va foizini ko'rsatadi. 80% dan oshsa qizil ogohlantirish chiqadi. Bunda keraksiz tadbir va postlarni o'chiring, `npm run backup:storage` bilan nusxa oling.
- Rasm yuklash chegaralari: rasm siqishdan oldin **10 MB** gacha (JPG, PNG, WebP); fayllar **15 MB** gacha (PDF, DOCX, PPTX, XLSX).
- Supabase to'xtab qolsa: dashboard'da **Restore project** tugmasini bosing (ma'lumot saqlanib qoladi).

---

## 13. Xavfsizlik ro'yxati

- [ ] Supabase'da **«Allow new users to sign up»** o'chirilgan (2-bo'lim).
- [ ] Superadmin paroli uzun va tasodifiy; boshqa joyda ishlatilmagan.
- [ ] `Secret key`, access token va database paroli **hech qachon** chatga, ommaviy repozitoriyga yoki skrinshotga tushmagan. Tushgan bo'lsa: Supabase'da yangisini yarating, eskisini o'chiring.
- [ ] Ish tugagach `SUPABASE_ACCESS_TOKEN` ni https://supabase.com/dashboard/account/tokens dan o'chiring (kerak bo'lganda yangisini yaratasiz).
- [ ] GitHub repozitoriy **private**.
- [ ] Faqat ishonchli odamlarga admin yoki maslahatchi roli berilgan.
- [ ] Ketgan xodim akkaunti bloklangan (**Foydalanuvchilar** bo'limida).

Himoya qatlamlari: har bir jadvalda **Row Level Security**; `/admin` kirmagan foydalanuvchini kirish sahifasiga yo'naltiradi; rol har bir amalda serverda qayta tekshiriladi; login va murojaat formalarida urinish cheklovi; murojaat formasida yashirin tuzoq (honeypot); reyestr fayllari yopiq bucket'da va faqat 5 daqiqalik havola bilan ochiladi.

---

## 14. Muammolar va yechimlar

**Saytda ma'lumot ko'rinmayapti.** `.env.local` (yoki Vercel'dagi) kalitlarni tekshiring. Eski keshni tozalash: `Remove-Item -Recurse -Force .next` va `npm run dev`.

**Kirib bo'lmayapti: «Email yoki parol noto'g'ri».** Superadmin paroli `.env.local` dagi `SEED_SUPERADMIN_PASSWORD`. Kerak bo'lsa, Supabase → Authentication → Users orqali tiklang. «Juda ko'p urinish» chiqsa, 15 daqiqa kuting.

**Koordinator «akkaunt kengash a'zosiga bog'lanmagan» xabarini ko'ryapti.** **Foydalanuvchilar** bo'limida uning akkauntini oching va «Kengashdagi o'rni» ni tanlang.

**Antivirus (masalan Avast) tufayli `UNABLE_TO_VERIFY_LEAF_SIGNATURE` xatosi** (Supabase'ga ulanmaydi). PowerShell'da, dasturni ishga tushirishdan oldin:

```powershell
$env:NODE_USE_SYSTEM_CA = "1"
npm run dev
```

**`npm run db:push` xato beradi.** `npx supabase login` yoki `.env.local` dagi `SUPABASE_ACCESS_TOKEN` va `SUPABASE_DB_PASSWORD` to'g'riligini tekshiring.

**Rasm yuklanmayapti.** Format JPG/PNG/WebP va 10 MB dan kichik ekanini tekshiring; internetni tekshiring.

**Ma'lum cheklov:** rasm yuklab, formani saqlamasdan yopilsa, o'sha fayl Storage'da yetim qoladi. Xotira juda to'lib qolsa, **Storage** bo'limidan (Supabase dashboard) kerak bo'lmagan fayllarni qo'lda o'chirish mumkin.

---

## 15. Rus tilini qo'shish

Saytdagi barcha interfeys matnlari bitta lug'at faylida: `src/lib/i18n/uz.ts`. Rus tilini qo'shish uchun:

1. `src/lib/i18n/ru.ts` yarating va `uz.ts` dagi barcha kalitlarni rus tilida yozing (`export const ru: Dict = {...}`).
2. `src/lib/i18n/index.ts` da `Locale` turiga `"ru"` ni qo'shib, `dicts` ga `ru` ni ulang.
3. Tilni tanlash: URL (`/ru/...`) yoki cookie orqali `getDict(locale)` chaqiring.

Eslatma: baza ichidagi kontent (postlar, ismlar) hozircha bitta tilda; ikki tilli kontent kerak bo'lsa, tegishli jadvallarga til ustunlari qo'shiladi.

---

## 16. Buyruqlar va loyiha tuzilishi

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Saytni ishlab chiqish rejimida ishga tushirish |
| `npm run build` / `npm run start` | Ishlab chiqarish uchun yig'ish va ishga tushirish |
| `npm run lint` | Kod tekshiruvi |
| `npm run db:push` | Migratsiyalarni Supabase'ga qo'llash |
| `npm run db:types` | Bazadan TypeScript tiplarini yangilash |
| `npm run seed` | Namunaviy ma'lumotlar va superadmin |
| `npm run test:roles` | Rollar va ruxsatlar sinovi |
| `npm run import:council` | Kengash ma'lumotlarini JSON'dan yuklash |
| `npm run backup:storage` | Barcha fayllarni kompyuterga yuklab olish |

```
src/app/(public)/       Ommaviy sahifalar (bosh, kollektiv, kengash, tadbirlar, to'garaklar, aloqa...)
src/app/admin/          Admin panel (login, boshqaruv paneli, postlar, universal CRUD...)
src/app/api/            keep-alive, upload-url (imzolangan yuklash havolasi), qidiruv
src/components/         site/ (ommaviy), admin/ (panel), ui/ (shadcn)
src/lib/                supabase/, i18n/, admin/ (actions), upload*.ts, data.ts
supabase/migrations/    Baza sxemasi va RLS qoidalari
scripts/                seed, import-council, backup-storage, test-roles
.github/workflows/      Haftalik baza zaxirasi
vercel.json             Kunlik keep-alive Cron
```
