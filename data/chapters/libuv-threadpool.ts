import type { StudyChapter } from "@/types/study";

export const libuvThreadpoolChapter: StudyChapter = {
  id: "libuv-threadpool",
  number: 5,
  title: "libuv وThread Pool وAsync I/O",
  subtitle: "كيف ينسق Node بين JavaScript وOS والـ worker threads.",
  readingTime: "55 دقيقة",
  keywords: ["libuv", "Thread Pool", "Async I/O", "epoll", "kqueue", "IOCP", "pbkdf2", "DNS"],
  content: String.raw`
# 83. ما هي libuv؟

libuv هي مكتبة C متعددة المنصات توفر abstraction للـ asynchronous I/O وevent loop وعدة وظائف منخفضة المستوى، وهي جزء أساسي من architecture الخاصة بـ Node.js.

بدأ تطويرها أساسًا لخدمة Node.js، لكنها مشروع مستقل.

## 84. لماذا Node يحتاج libuv؟

لأن أنظمة التشغيل مختلفة. Linux لديه mechanisms مثل \`epoll\`، وmacOS/BSD لديه \`kqueue\`، وWindows لديه IOCP.

بدل أن يتعامل Node مباشرة مع كل OS بشكل مختلف، توفر libuv طبقة abstraction:

\`\`\`text
Node.js
   ↓
libuv
   ↓
OS-specific mechanisms
\`\`\`

## 85. Architecture بشكل أوضح

\`\`\`text
          Your JavaScript
                 │
                 ↓
               Node.js
        ┌────────┴────────┐
        ↓                 ↓
       V8               libuv
        │                 │
JS execution          Event Loop
Memory                Async I/O
GC                    Thread Pool
                      OS abstraction
                         │
                         ↓
                 Operating System
\`\`\`

## 86. ماذا توفر libuv؟

من الوظائف التي ترتبط بها:

- Event loop.
- TCP.
- UDP.
- TTY.
- Pipes.
- File system operations.
- DNS operations.
- Thread pool.
- Signals.
- Child processes.
- Timers/integration.
- IPC.

لكن المهم ليس حفظ القائمة فقط، بل فهم أن العمليات المختلفة لا تسلك نفس المسار.

# 87. أكبر خطأ شائع: "Node.js is single-threaded"

الجملة ليست دقيقة إذا فهمتها حرفيًا.

الأدق:

> JavaScript code الخاص بك يعمل افتراضيًا على main JavaScript thread واحد في Node process.

لكن Node process نفسه يحتوي على threads أخرى، مثل:

\`\`\`text
Main JavaScript thread
V8 helper threads
libuv thread pool threads
other internal threads
\`\`\`

إذن:

\`\`\`text
JavaScript execution ≈ single main thread
Node.js process ≠ one thread only
\`\`\`

# 88. Main Thread وCall Stack

الكود العادي:

\`\`\`js
console.log("A");
const x = 10 + 20;
console.log(x);
\`\`\`

ينفذ على main JavaScript thread ومعه Call Stack.

Stack تعمل LIFO: Last In, First Out.

\`\`\`js
function one() {
  two();
}

function two() {
  console.log("Hello");
}

one();
\`\`\`

تقريبًا:

\`\`\`text
Push one
   ↓
Push two
   ↓
Push console.log
   ↓
Pop console.log
   ↓
Pop two
   ↓
Pop one
\`\`\`

## 89. لماذا Call Stack مهمة؟

JavaScript لا تستطيع تنفيذ callback جديدة على نفس thread أثناء stack ما زالت مشغولة بكود synchronous طويل.

\`\`\`js
while (true) {}
\`\`\`

هذا يمنع event loop من التقدم، حتى لو كانت هناك async operations انتهت وcallbacksها جاهزة.

# 90. I/O

I/O تعني Input / Output، مثل Reading disk وWriting disk وNetwork requests وDatabase communication وDNS وSockets.

غالبًا هي عمليات بطيئة مقارنة بتنفيذ CPU instruction بسيط.

# 91. Offloading

في Node context المقصود عدم تنفيذ العملية الثقيلة أو المنتظرة مباشرة على JavaScript main thread، وإنما تفويضها إلى OS أو libuv/thread pool عندما يكون ذلك مناسبًا.

\`\`\`text
JS Thread
   ↓
Request async operation
   ↓
Offload
   ↓
OS / libuv
   ↓
JS thread continues
\`\`\`

# 92. لا تقل إن كل Async operation تذهب إلى Thread Pool

هذه من أهم القواعد.

هناك طريقان أساسيان تقريبًا:

\`\`\`text
Async operation
      │
      ├── OS/kernel event mechanism
      │
      └── libuv thread pool
\`\`\`

ليست كل العمليات async تستخدم thread pool.

# 93. Network I/O

TCP servers وHTTP connections وSockets لا يتم عادة تنفيذ كل request داخل Thread من libuv thread pool.

الاعتماد يكون غالبًا على OS async/event notification mechanisms.

\`\`\`text
TCP Socket
   ↓
Operating System Kernel
   ↓
epoll / kqueue / IOCP
   ↓
libuv event loop
   ↓
callback
\`\`\`

لهذا السبب عبارة "Node لديه 4 threads إذن يستطيع استقبال 4 requests فقط" خطأ تمامًا.

Node يستطيع إدارة عدد كبير من network connections لأن النموذج ليس one request = one libuv worker thread.

# 94. Thread Pool

libuv لديها Thread Pool. الحجم الافتراضي الشائع تاريخيًا هو 4 workers.

تستخدم هذه workers لبعض الأعمال التي لا يوجد لها async kernel interface موحد مناسب، أو لبعض native operations التي تقوم Node بتفويضها لها.

من أشهر ما يستخدمها:

\`\`\`text
File system async APIs
Some DNS operations
Some crypto operations
zlib operations
\`\`\`

# 95. File I/O وThread Pool

كقاعدة تعليمية جيدة لفهم Node/libuv:

\`\`\`js
fs.readFile("large.txt", callback);
\`\`\`

تقريبًا:

\`\`\`text
Main JS Thread
      ↓
fs.readFile
      ↓
libuv
      ↓
Thread Pool worker
      ↓
File system operation
      ↓
completion
      ↓
Event Loop
      ↓
callback
\`\`\`

# 96. UV_THREADPOOL_SIZE

يمكن تغيير حجم thread pool باستخدام environment variable:

\`\`\`bash
UV_THREADPOOL_SIZE=8 node app.js
\`\`\`

وعلى PowerShell:

\`\`\`powershell
$env:UV_THREADPOOL_SIZE=8
node app.js
\`\`\`

الأفضل ضبطها قبل تشغيل Node لأن بعض أجزاء Node قد تبدأ باستخدام thread pool قبل تعديل القيمة داخل الكود.

## 97. لماذا زيادة Thread Pool ليست دائمًا أفضل؟

إذا كان لديك 4 CPU cores ووضعت \`UV_THREADPOOL_SIZE=500\` فهذا لا يعني أن التطبيق أصبح أسرع 125 مرة.

قد تحصل على:

- Context switching.
- Memory overhead.
- CPU contention.
- Worse performance.

إذن الحجم قرار tuning ويجب قياسه بالـ benchmarks وليس التخمين.

# 98. CPU Tasks وPBKDF2

بعض العمليات تحتاج CPU computation كبير مثل Password key derivation وCompression وEncryption وHashing وImage processing وHuge calculations.

### pbkdf2Sync

\`\`\`js
const crypto = require("node:crypto");

crypto.pbkdf2Sync(
  "secret",
  "salt",
  100000,
  64,
  "sha512"
);
\`\`\`

هذه Synchronous وبالتالي تحجز main JavaScript thread أثناء الحساب.

### pbkdf2 Async

\`\`\`js
const crypto = require("node:crypto");

const start = performance.now();

crypto.pbkdf2(
  "secret",
  "salt",
  100000,
  64,
  "sha512",
  () => {
    console.log("End", performance.now() - start);
  }
);
\`\`\`

النسخة async تستطيع استخدام libuv thread pool.

# 99. عدة PBKDF2 Operations

إذا كان thread pool يحتوي 4 workers وشغلت خمس عمليات:

\`\`\`text
Worker 1 → Task 1
Worker 2 → Task 2
Worker 3 → Task 3
Worker 4 → Task 4

Queue:
Task 5
\`\`\`

المهمة الخامسة غالبًا تنتظر worker متاحًا. هذا يعني أن Async لا تعني infinite concurrency.

# 100. Order of Invocation vs Order of Completion

لو كتبت:

\`\`\`js
task1();
task2();
task3();
\`\`\`

هذا هو ترتيب الاستدعاء. لكن completion قد يكون:

\`\`\`text
task2
task3
task1
\`\`\`

لأن كل task قد تستغرق زمنًا مختلفًا. هذا مهم مع File I/O وNetwork I/O وThread Pool tasks وDatabase queries وExternal APIs.

# 101. Network Requests لا تدخل عادة Thread Pool Queue

كقاعدة عامة لمعظم socket network I/O:

\`\`\`text
HTTP/TCP socket
→ OS/kernel event mechanisms
\`\`\`

وليس:

\`\`\`text
one libuv worker thread per request
\`\`\`

# 102. DNS يحتاج تفصيل

لا تقل "DNS always Thread Pool" ولا "DNS never Thread Pool". APIs تختلف.

بعض عمليات \`dns.lookup()\` تعتمد على system resolver ويمكن أن تستخدم libuv thread pool، بينما DNS APIs أخرى قد تستخدم asynchronous DNS mechanisms مختلفة.

إذن افهم API نفسها بدل حفظ جملة عامة.

# 103. Thread Pool Starvation

إذا كان لديك 4 workers وكلهم مشغولون بعمليات crypto ثقيلة:

\`\`\`text
Worker 1 → PBKDF2
Worker 2 → PBKDF2
Worker 3 → PBKDF2
Worker 4 → PBKDF2
\`\`\`

ثم جاء \`fs.readFile()\` فقد ينتظر worker متاحًا، لأن بعض هذه العمليات تشارك نفس thread pool.

مثال:

\`\`\`js
for (let i = 0; i < 4; i++) {
  crypto.pbkdf2(
    "secret",
    "salt",
    1_000_000,
    64,
    "sha512",
    () => console.log("crypto done")
  );
}

fs.readFile("file.txt", () => {
  console.log("file done");
});
\`\`\`

الـ file read قد تتأخر بسبب thread pool المشغولة.

# 104. Rule of Thumb

لا تستخدم رقمًا ضخمًا لـ \`UV_THREADPOOL_SIZE\` لمجرد "زيادة الأداء". الصح:

\`\`\`text
benchmark
measure
adjust
\`\`\`

وقِس Latency وCPU utilization وThroughput وThread contention قبل وبعد.

## أسئلة مراجعة

1. ما هي libuv؟
2. لماذا يحتاجها Node؟
3. هل Node.js single-threaded فعلًا؟
4. ما هو Main JavaScript Thread؟
5. ما هو Call Stack؟
6. ما معنى Offloading؟
7. هل كل async operation تستخدم thread pool؟
8. أين تذهب Network I/O عادة؟
9. أين تذهب File I/O عادة؟
10. ما هو \`UV_THREADPOOL_SIZE\`؟
11. لماذا زيادة thread pool ليست دائمًا أفضل؟
12. ما الفرق بين \`pbkdf2Sync()\` و\`pbkdf2()\`؟
13. ما معنى Thread Pool Starvation؟
14. لماذا completion order غير مضمون؟
`};
