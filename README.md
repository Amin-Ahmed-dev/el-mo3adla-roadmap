# El Mo3adla — Study Roadmap 2027

موقع للمذاكرة: كل مادة عبارة عن دروس، وكل درس خطوات: **Learn ← Understand ← Solve ← Practice**.
تقدّم الطالب بيتحفظ في المتصفح (`localStorage`)، ولو سجّل دخول بيتزامن تلقائيًا على كل أجهزته عبر Supabase.

## التشغيل

```bash
npm install
npm run dev      # للتطوير على http://localhost:5173
npm run build    # بيطلّع مجلد dist
```

`npm run build` بيشغّل `npm run check` الأول، فلو فيه خطأ في المحتوى (ID مكرر مثلًا) البناء بيقف قبل النشر.

## إضافة مادة جديدة (3 خطوات)

1. انسخ `src/data/subjects/_template.js` إلى `src/data/subjects/physics.js` (أو اسم المادة) واملأه.
   المواد الجاهزة كـ "قريبًا" (`physics.js` و`chemistry.js` و`english.js`) بتتفعّل لما تحط فيها `groups`.
2. لو المادة جديدة تمامًا: استوردها في `src/data/subjects/index.js` وضيفها في القائمة (الترتيب هو ترتيب القائمة).
3. `npm run check` ثم `git push`.

**مفيش أي كود واجهة يتغيّر.** الصفحة الرئيسية والقائمة والبحث والمراجعة والمزامنة بين المواد كلها بتتبنّى من الملفات دي.

### ترتيب صفحة الـ Roadmap

1. **`basics`** في الأول (قبل الدرس الأول): فيديو أو اتنين للأساسيات، مع زرار "Mark basics as done".
2. **`groups`** (المنهج): الوحدات والدروس زي ما هي.
3. **`guide`** في الآخر كـ "Exam toolkit": شرح الآلة الحاسبة في كارت مميز.

الاتنين اختياريين: احذف `basics` أو خلّي `guide: null` وهيختفوا. الطالب الجديد بيبدأ من الأساسيات تلقائيًا في الصفحة الرئيسية.

## قواعد المحتوى
- كل `id` (درس أو عنصر مراجعة) لازم يكون **فريد في كل المواد**. ابدأه باختصار المادة: `ph-u1-l1`.
- **متغيّرش `id` بعد ما الطلبة يبدأوا**، لأن تقدّمهم محفوظ عليه.
- سيب أي رابط `''` لحد ما يجهز، والموقع هيكتب "Link coming soon".
- كل خطوة فيها مصادر: `video(العنوان, الرابط, req)` و`pdf(...)`. الـ `req` يبقى `'yes'` (أساسي) أو `'rec'` (موصى به) أو `'opt'` (اختياري).
- مادة لها خطوات مختلفة؟ حط `steps: [...]` في ملفها بدل الافتراضية (شوف `DEFAULT_STEPS` في `src/data/helpers.js`).
- الألوان المتاحة: `blue` `cyan` `orange` `purple` `rose`.

## الهيكل

```
src/
  data/            المحتوى (الملف الوحيد اللي بتعدّله في العادة)
    subjects/      ملف لكل مادة + _template.js
    helpers.js     video() pdf() lesson() defineSubject()
    catalog.js     فهارس مشتقة (لا تعدّلها)
    validate.js    قواعد التحقق
  store/progress.js   حفظ التقدّم في المتصفح + الـ hooks
  store/session.js    جلسة الدخول (Supabase Auth)
  lib/                selectors + route + search + cloud sync (cloud.js / useCloudSync.js)
  components/         مكوّنات مشتركة
  pages/              Home · SubjectPage · LessonPage · RevisionPage
scripts/check-content.mjs   npm run check
```

## النشر على Netlify

1. ارفع المشروع على GitHub، ثم Netlify ← **Add new site** ← Import an existing project.
2. الإعداد كله جاهز في `netlify.toml` (Build: `npm run build` · Publish: `dist` · Node 20).
3. Site settings ← **Environment variables**: ضيف `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY`،
   بعدها اعمل **Redeploy** (من غيرهم الموقع بيفتح عادي لكن على localStorage بس — مفيش مزامنة).
4. Supabase ← Authentication ← **URL Configuration** ← Redirect URLs: ضيف
   `http://localhost:5173/*` و `https://YOUR-SITE.netlify.app/*`
   (من غيرهم لينكات استرجاع الباسورد والتأكيد هتقع في صفحة خطأ).
5. لازم يكون في جدول `progress` مع RLS مضبوط قبل ما تفعّل المزامنة.
6. Supabase ← Authentication ← **Sign In / Providers** ← Email (قسم Password):
   حطّ الحد الأدنى للطول = **8** مع "Required characters" (أحرف كبيرة/صغيرة/أرقام/رموز).
   الطول والقوة ده هما حماية السيرفر لكلمة السر، وسياسة الأحرف بتتطبّق من الواجهة
   كمان في `src/lib/password.js` على التسجيل واسترجاع الباسورد. (فحص كلمات
   السر المسرّبة/HaveIBeenPwned اختياري ومتاح من خطة Pro فما فوق.)

منصات تانية: نفس الإعداد تقريبًا على Cloudflare Pages، وملف `.github/workflows/deploy.yml` جاهز لـ GitHub Pages (فعّله من Settings ← Pages ← Source: GitHub Actions).

- الـ `base` في `vite.config.js` مضبوط على `./` فبيشتغل على أي مسار.
- الروابط بصيغة `#/...` فمفيش إعداد إضافي للـ refresh.
- لو تغيّر اسم موقع Netlify، حدّث `og:url` و`og:image` في `index.html` (ولّد الصورة تاني بـ `node scripts/gen-og-image.mjs`).

## ملاحظات
- بيانات الطلبة اللي استخدموا النسخة القديمة (الملف الواحد) بتتقرأ زي ما هي: المفتاح نفسه `cs-equivalency-roadmap-v1`.
- زرار "Sign in" بيفتح الدخول/التسجيل بالبريد؛ ونقل التقدّم بين الأجهزة بيحصل تلقائياً بعد تسجيل الدخول (مفيش كود نسخ احتياطي بعد الآن).
- من غير مفاتيح Supabase الموقع بيشتغل عادي على المتصفح فقط (localStorage).
