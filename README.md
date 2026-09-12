# Node.js Study Hub

موقع عربي RTL مبني بـ **Next.js + TypeScript** ليكون مرجعًا تفصيليًا للمذاكرة في Node.js والـ Backend Internals.

## المحتوى الحالي

- Node.js Runtime وV8 وREPL وBrowser vs Node.
- Modules: Built-in / Local / npm، CommonJS، ESM، Module Wrapper وModule Cache.
- File System: sync / async / promises وError-first callbacks.
- Buffer وUTF-8 وJSON.
- Streams وChunks وPipe وBackpressure.
- npm وRegistry وpackage.json وpackage-lock.json وdependencies.
- libuv وOS abstraction وThread Pool وNetwork I/O وDNS وPBKDF2.
- Event Loop phases: timers / pending / poll / check / close callbacks.
- Microtasks وprocess.nextTick وPromises وsetImmediate وsetTimeout.
- CPU-bound vs I/O-bound، Worker Threads، Child Processes، Event Loop Lag، Latency وThroughput.
- معمل عملي شامل، قاموس مصطلحات، أسئلة مراجعة وInterview questions.

## المزايا

- تصميم حديث Responsive للموبايل والكمبيوتر.
- RTL عربي وخط Cairo.
- Dark / Light mode مع حفظ الاختيار محليًا.
- Search داخل كامل محتوى الفصول.
- تتبع تقدم المذاكرة وحفظه في localStorage.
- تنقل سابق/تالي بين الفصول.
- Markdown/GFM لعرض الجداول، القوائم، الاقتباسات وCode Blocks.
- المحتوى مفصول عن UI داخل ملفات مستقلة لتسهيل إضافة أي شرح جديد مباشرة.

## هيكل المشروع

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  study-shell.tsx
  markdown-lesson.tsx
data/
  chapters/
    foundations.ts
    modules.ts
    files-buffers.ts
    streams-npm.ts
    libuv-threadpool.ts
    event-loop.ts
    microtasks.ts
    workers-performance.ts
    labs-reference.ts
    index.ts
types/
  study.ts
```

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

لبناء نسخة Production:

```bash
npm run build
npm start
```

## إضافة فصل جديد

1. أنشئ ملفًا جديدًا داخل `data/chapters/` بنفس نوع `StudyChapter`.
2. اكتب المحتوى داخل `content` بصيغة Markdown.
3. أضف الفصل إلى `data/chapters/index.ts`.
4. سيظهر تلقائيًا في الـ Sidebar والبحث والتقدم والتنقل.
