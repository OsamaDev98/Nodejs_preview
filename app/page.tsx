"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, Moon, Sun, CheckCircle2, Circle, Terminal, Cpu, Waves, Package, Database, GitBranch } from "lucide-react";

const chapters = [
  { id: "intro", title: "1. ما هو Node.js؟", icon: BookOpen },
  { id: "modules", title: "2. Modules", icon: GitBranch },
  { id: "fs", title: "3. File System", icon: Database },
  { id: "buffer", title: "4. Buffer و UTF-8", icon: Terminal },
  { id: "streams", title: "5. Streams", icon: Waves },
  { id: "npm", title: "6. npm و Packages", icon: Package },
  { id: "libuv", title: "7. libuv و Thread Pool", icon: Cpu },
  { id: "event-loop", title: "8. Event Loop", icon: Cpu },
  { id: "microtasks", title: "9. Microtasks", icon: GitBranch },
  { id: "workers", title: "10. Worker Threads", icon: Cpu },
];

const content = [
  {
    id: "intro",
    title: "ما هو Node.js؟",
    summary: "Node.js هو JavaScript Runtime Environment يسمح بتشغيل JavaScript خارج المتصفح.",
    blocks: [
      { h: "الفكرة الأساسية", p: "JavaScript لغة، أما Node.js فهو بيئة تشغيل. يستخدم V8 لتنفيذ JavaScript ويضيف APIs للتعامل مع الملفات، الشبكات، العمليات، الـ streams وغيرها." },
      { code: "JavaScript Code\n   ↓\nNode.js Runtime\n   ├─ V8\n   ├─ Node APIs\n   ├─ libuv\n   └─ OS" },
      { h: "Cross-platform", p: "يعمل على Windows وLinux وmacOS. بعض التفاصيل مثل paths وpermissions وsignals تختلف، لكن Node يوفر abstractions تقلل هذه الاختلافات." },
      { h: "V8", p: "محرك JavaScript مسؤول عن parsing, compilation, execution, optimization, garbage collection وإدارة الذاكرة. Node.js ليس V8 فقط؛ V8 جزء من المعمارية." },
    ],
  },
  {
    id: "modules",
    title: "Modules في Node.js",
    summary: "تنظيم التطبيق إلى وحدات مستقلة قابلة لإعادة الاستخدام.",
    blocks: [
      { h: "الأنواع", p: "Built-in modules مثل fs وpath، Local modules التي تكتبها داخل مشروعك، وThird-party packages من npm." },
      { code: "const fs = require('node:fs');\nconst logger = require('./logger');\nconst express = require('express');" },
      { h: "CommonJS vs ESM", p: "CommonJS يستخدم require/module.exports. ESM يستخدم import/export وهو معيار JavaScript الحديث." },
      { code: "// CommonJS\nmodule.exports = add;\n\n// ESM\nexport function add(a, b) { return a + b }" },
      { h: "Module Wrapper", p: "في CommonJS يتم تغليف الملف مفاهيميًا داخل function توفر exports, require, module, __filename, __dirname، وهذا يمنح كل module scope خاصًا." },
      { h: "Caching", p: "أول require يحمل وينفذ module ثم يخزن exports في cache. الاستدعاءات التالية غالبًا تعيد نفس instance بدل التنفيذ من البداية." },
    ],
  },
  {
    id: "fs",
    title: "File System",
    summary: "الفرق بين synchronous وasynchronous I/O وتأثيره على الـ backend.",
    blocks: [
      { h: "Blocking", p: "readFileSync يوقف تقدم JavaScript على الـ main thread حتى تنتهي العملية. داخل request handler قد يؤخر كل الطلبات الأخرى." },
      { code: "const fs = require('node:fs');\nconst data = fs.readFileSync('file.txt', 'utf8');" },
      { h: "Non-blocking", p: "readFile يبدأ العملية ويكمل JavaScript تنفيذ باقي الكود، ثم يتم تنفيذ callback بعد اكتمال I/O عندما تصبح event loop جاهزة." },
      { code: "fs.readFile('file.txt', 'utf8', (err, data) => {\n  if (err) return console.error(err);\n  console.log(data);\n});" },
      { h: "Promise API", p: "الأسلوب الحديث يعتمد node:fs/promises مع async/await. await لا يحول العملية إلى synchronous I/O؛ هو يوقف الـ async function منطقيًا فقط." },
      { code: "import fs from 'node:fs/promises';\nconst data = await fs.readFile('file.txt', 'utf8');" },
    ],
  },
  {
    id: "buffer",
    title: "Buffer و UTF-8",
    summary: "كيف يمثل Node البيانات الثنائية داخل الذاكرة.",
    blocks: [
      { h: "Buffer", p: "Buffer يمثل sequence من bytes. يستخدم مع الملفات، الصور، الفيديو، TCP والـ binary protocols." },
      { code: "const buffer = Buffer.from('Hello', 'utf8');\nconsole.log(buffer); // <Buffer 48 65 6c 6c 6f>" },
      { h: "UTF-8", p: "Encoding يحول Unicode characters إلى bytes والعكس. Character لا يساوي Byte دائمًا، وخصوصًا مع العربية والرموز." },
    ],
  },
  {
    id: "streams",
    title: "Streams",
    summary: "معالجة البيانات على chunks بدل تحميلها كاملة في الذاكرة.",
    blocks: [
      { h: "Readable Stream", p: "مفيد للملفات الكبيرة لأنك تستقبل البيانات تدريجيًا. events الشائعة: data, end, error, close." },
      { code: "const stream = fs.createReadStream('big.txt', { encoding: 'utf8' });\nstream.on('data', chunk => console.log(chunk));" },
      { h: "Writable Stream", p: "يسمح بالكتابة تدريجيًا. استخدم write لإرسال chunks وend للإشارة إلى انتهاء البيانات." },
      { h: "Backpressure", p: "آلية تمنع producer السريع من إغراق consumer الأبطأ. pipe يساعد في إدارة هذه الموازنة تلقائيًا في حالات كثيرة." },
      { code: "readStream.pipe(writeStream);" },
    ],
  },
  {
    id: "npm",
    title: "npm و Package Management",
    summary: "إدارة الحزم، dependencies، package.json وpackage-lock.json.",
    blocks: [
      { h: "npm init", p: "ينشئ package.json الذي يمثل metadata وإعدادات واعتماديات المشروع." },
      { code: "npm init -y\nnpm install express\nnpm install -D eslint\nnpm uninstall express" },
      { h: "dependencies vs devDependencies", p: "dependencies يحتاجها التطبيق أثناء التشغيل، devDependencies غالبًا لأدوات التطوير مثل linting وtesting." },
      { h: "package-lock.json", p: "يثبت dependency tree بشكل أدق ويساعد على reproducible installs، وعادة يُرفع إلى Git." },
    ],
  },
  {
    id: "libuv",
    title: "libuv و Thread Pool",
    summary: "طبقة أساسية في Node للتعامل مع async I/O والـ OS abstractions.",
    blocks: [
      { h: "libuv", p: "مكتبة C متعددة المنصات توفر event loop، thread pool، TCP/UDP، filesystem abstractions، signals وغيرها." },
      { h: "Node ليس Thread واحد حرفيًا", p: "JavaScript code يعمل افتراضيًا على main JavaScript thread واحد، لكن عملية Node نفسها تحتوي threads أخرى داخل V8 وlibuv." },
      { h: "Thread Pool", p: "الـ default الشائع 4 workers. تستخدمه عمليات مثل fs async، بعض crypto، zlib وبعض DNS APIs." },
      { code: "UV_THREADPOOL_SIZE=8 node app.js" },
      { h: "Network I/O", p: "عادة لا تستهلك worker لكل request. sockets تعتمد غالبًا على kernel mechanisms مثل epoll/kqueue/IOCP." },
    ],
  },
  {
    id: "event-loop",
    title: "Event Loop",
    summary: "الآلية التي تنسق callbacks والأحداث ومراحل التنفيذ.",
    blocks: [
      { h: "المراحل", p: "المراحل الأساسية: timers → pending callbacks → idle/prepare → poll → check → close callbacks." },
      { code: "timers\n  ↓\npending callbacks\n  ↓\npoll\n  ↓\ncheck\n  ↓\nclose callbacks" },
      { h: "Timers", p: "setTimeout وsetInterval لا يضمنان وقت تنفيذ دقيقًا. الزمن المحدد هو threshold تقريبي وليس موعدًا مضمونًا." },
      { h: "Poll", p: "تستقبل I/O events وتنفذ callbacks المرتبطة بها، ويمكنها الانتظار عندما لا يوجد عمل فوري." },
      { h: "Check", p: "تُنفذ فيها callbacks الخاصة بـ setImmediate." },
      { h: "قاعدة مهمة", p: "Keep the event loop free. أي CPU-heavy JavaScript أو synchronous I/O داخل request handler قد يرفع latency ويخفض throughput." },
    ],
  },
  {
    id: "microtasks",
    title: "Microtasks و process.nextTick",
    summary: "فهم ترتيب التنفيذ بين synchronous code، nextTick، Promises وevent-loop phases.",
    blocks: [
      { h: "الترتيب المبسط", p: "1) synchronous code، 2) process.nextTick queue، 3) Promise/queueMicrotask، 4) event loop phases." },
      { code: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nprocess.nextTick(() => console.log('4'));\nconsole.log('5');\n\n// غالبًا: 1, 5, 4, 3, 2" },
      { h: "Starvation", p: "إنشاء nextTick أو microtasks بشكل لا نهائي قد يمنع event loop من الوصول للـ timers وI/O." },
      { h: "setImmediate vs setTimeout(0)", p: "في top-level لا تعتمد على ترتيب ثابت. داخل I/O callback غالبًا setImmediate يسبق timer التالي لأن check تأتي بعد poll." },
    ],
  },
  {
    id: "workers",
    title: "Worker Threads",
    summary: "لتنفيذ JavaScript CPU-heavy بالتوازي خارج الـ main thread.",
    blocks: [
      { h: "Worker Threads", p: "تستخدم عندما يكون عندك CPU-bound JavaScript مثل image processing أو حسابات ثقيلة. أنت تنشئها صراحة." },
      { h: "ليست libuv Thread Pool", p: "Thread Pool يديرها Node داخليًا لبعض native operations. Worker Threads تشغل JavaScript في execution context مستقل." },
      { h: "CPU-bound vs I/O-bound", p: "Node ممتاز في I/O-heavy workloads. أما CPU-heavy JavaScript فيحتاج worker strategy أو service منفصل أو child process حسب الحالة." },
    ],
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("intro");
  const [dark, setDark] = useState(true);
  const [done, setDone] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return content;
    return content.filter((c) => `${c.title} ${c.summary} ${c.blocks.map((b) => `${b.h ?? ""} ${b.p ?? ""} ${b.code ?? ""}`).join(" ")}`.toLowerCase().includes(q));
  }, [query]);

  const current = filtered.find((c) => c.id === active) ?? filtered[0] ?? content[0];

  function toggleDone(id: string) {
    setDone((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <main className={dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand">Node.js Study Hub</div>
        <div className="searchBox"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في الشرح..." /></div>
        <nav>
          {chapters.map(({ id, title, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)} className={active === id ? "navItem active" : "navItem"}>
              <Icon size={17} /><span>{title}</span>{done.includes(id) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </button>
          ))}
        </nav>
        <div className="progressWrap">
          <div className="progressText">التقدم: {done.length} / {chapters.length}</div>
          <div className="progress"><span style={{ width: `${(done.length / chapters.length) * 100}%` }} /></div>
        </div>
      </aside>

      <section className="contentArea">
        <header className="topbar">
          <div>
            <div className="eyebrow">مرجع Backend بالعربي</div>
            <h1>{current.title}</h1>
          </div>
          <button className="themeBtn" onClick={() => setDark((v) => !v)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </header>

        <div className="heroCard">
          <p>{current.summary}</p>
          <button className={done.includes(current.id) ? "doneBtn completed" : "doneBtn"} onClick={() => toggleDone(current.id)}>
            {done.includes(current.id) ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            {done.includes(current.id) ? "تمت المذاكرة" : "علّم الفصل كمكتمل"}
          </button>
        </div>

        <article className="lesson">
          {current.blocks.map((block, index) => (
            <section key={index} className="lessonBlock">
              {block.h && <h2>{block.h}</h2>}
              {block.p && <p>{block.p}</p>}
              {block.code && <pre><code>{block.code}</code></pre>}
            </section>
          ))}
        </article>
      </section>
    </main>
  );
}
