import type { StudyChapter } from "@/types/study";

export const eventLoopChapter: StudyChapter = {
  id: "event-loop",
  number: 6,
  title: "Event Loop بالتفصيل",
  subtitle: "المراحل، timers، poll، check، callback scheduling وترتيب التنفيذ.",
  readingTime: "60 دقيقة",
  keywords: ["Event Loop", "timers", "poll", "check", "setTimeout", "setImmediate", "callbacks"],
  content: String.raw`
# 105. Event Loop

تعريف عملي:

> Event Loop هي الآلية المركزية التي تساعد Node على تنسيق تنفيذ callbacks الناتجة عن timers وI/O وأحداث أخرى عندما يصبح JavaScript main thread قادرًا على تنفيذها.

مهم جدًا: Event Loop ليست Thread تقرأ الملفات بنفسها، وليست مكان تنفيذ network operation. وظيفتها الأساسية تنسيق readiness/completions وجدولة callbacks عندما يحين دورها.

## 106. النموذج العقلي الصحيح

\`\`\`text
                 JavaScript
                     │
                     ↓
                 Call Stack
                     │
                     ↓
                Async request
                     │
             ┌───────┴────────┐
             ↓                ↓
       OS / Kernel       Thread Pool
       Network I/O       fs / crypto...
             ↓                ↓
             └───────┬────────┘
                     ↓
                Completion
                     ↓
                Event Loop
                     ↓
              Callback ready
                     ↓
                Call Stack
\`\`\`

## 107. هل Event Loop تجعل JavaScript Multithreaded؟

لا. JavaScript callbacks ما زالت تنفذ افتراضيًا على main JavaScript thread. لكن الأعمال المنتظرة قد تتم خارج الـ main thread أو بواسطة OS، وبعد انتهاء العملية يتم جدولة callback.

# 108. Concurrency vs Parallelism

**Concurrency** تعني إدارة عدة مهام متداخلة زمنيًا.

\`\`\`text
Task A waiting for DB
Task B waiting for network
Task C waiting for file
\`\`\`

Node ممتاز فيها، لأن main thread يمكنها تنفيذ أعمال أخرى أثناء انتظار I/O.

**Parallelism** تعني تنفيذ أكثر من عملية فعلًا في نفس اللحظة على cores أو threads مختلفة.

\`\`\`text
CPU Core 1 → Task A
CPU Core 2 → Task B
\`\`\`

الـ libuv thread pool وWorker Threads وبعض أجزاء runtime يمكن أن تحقق parallel work، لكن JavaScript main thread وحدها لا تنفذ JavaScript parallel.

# 109. Multi-threaded Server التقليدي vs Node

نموذج تقليدي:

\`\`\`text
User 1 → Thread 1
User 2 → Thread 2
User N → Thread N
\`\`\`

أما Node فيعتمد غالبًا على:

\`\`\`text
Many connections
       ↓
 Event-driven server
       ↓
One main JS event loop
       ↓
OS async I/O + thread pool where needed
\`\`\`

## 110. لماذا نموذج Node مناسب للـ Backend؟

ممتاز خصوصًا مع:

- REST APIs.
- WebSockets.
- Chat applications.
- Realtime services.
- Proxy servers.
- I/O-heavy applications.
- Microservices.

لأن جزءًا كبيرًا من وقت backend يضيع في انتظار Database وNetwork وDisk وExternal services بدل الحساب المستمر على CPU.

# 111. متى Node تتأثر بشدة؟

لو كتبت JavaScript CPU-heavy على main thread:

\`\`\`js
function hugeCalculation() {
  for (let i = 0; i < 100_000_000_000; i++) {
    // CPU work
  }
}
\`\`\`

أثناء التنفيذ:

\`\`\`text
Event Loop blocked
HTTP requests wait
Timers wait
Callbacks wait
WebSocket messages wait
\`\`\`

مثال سيئ جدًا داخل route handler:

\`\`\`js
app.get("/slow", (req, res) => {
  let sum = 0;

  for (let i = 0; i < 20_000_000_000; i++) {
    sum += i;
  }

  res.send(String(sum));
});
\`\`\`

Request واحد قد يجعل service كلها تبدو معلقة.

# 112. Event Loop Phases

من أشهر المراحل:

\`\`\`text
timers
↓
pending callbacks
↓
idle, prepare
↓
poll
↓
check
↓
close callbacks
\`\`\`

كما توجد آليات Microtasks و\`process.nextTick\` تؤثر على ترتيب التنفيذ.

لا تحفظ Event Loop كأنها Queue واحدة؛ هناك عدة queues ومصادر scheduling.

# 113. Stack vs Queue

| Structure | Rule |
|---|---|
| Stack | LIFO |
| Queue | FIFO |

Call Stack تعمل LIFO. كثير من callback queues تعمل FIFO، لكن الترتيب العام للتنفيذ ليس FIFO واحدة لأن Node لديها phases وqueues متعددة.

# 114. Timers Phase

مرتبطة بـ:

\`\`\`js
setTimeout()
setInterval()
\`\`\`

مثال:

\`\`\`js
setTimeout(() => {
  console.log("Hello");
}, 1000);
\`\`\`

هذا لا يعني "نفذ بالضبط عند 1000.000ms". المعنى الأقرب: لا تجعل callback مؤهلة قبل الـ threshold تقريبًا، ثم نفذها عندما تسمح event loop وmain thread.

قد تعمل عند 1004ms أو 1020ms أو أكثر حسب workload وOS scheduling وحالة event loop.

## 115. setInterval

\`\`\`js
setInterval(() => {
  console.log("Hello");
}, 1000);
\`\`\`

تحاول جدولة callback دوريًا، لكن إذا كانت event loop مشغولة أو callback ثقيلة فقد تتأخر. ليست real-time scheduler.

# 116. Pending Callbacks

هذه phase تنفذ بعض I/O callbacks التي تأجلت من دورة سابقة. ليست كل I/O callbacks تذهب هنا.

# 117. idle, prepare

مراحل داخلية تستخدمها libuv. كمطور Node عادي لا تحتاج التعامل معها مباشرة، لكن من المفيد معرفة مكانها في lifecycle.

# 118. Poll Phase

من أهم المراحل لفهم I/O.

Poll مسؤولة بصورة مبسطة عن:

- Retrieving new I/O events.
- Executing relevant I/O callbacks.
- Waiting for new I/O when appropriate.

مثال:

\`\`\`js
fs.readFile("file.txt", () => {
  console.log("Done");
});
\`\`\`

بعد اكتمال read operation تصبح callback مرتبطة بتنفيذ I/O flow في الدورة المناسبة.

Poll يمكنها الانتظار لو لا يوجد شغل فوري حتى يصل network packet أو socket connection أو file operation completion. وهذا جزء مهم من كفاءة Node event-driven architecture.

# 119. Check Phase

مرتبطة أساسًا بـ:

\`\`\`js
setImmediate()
\`\`\`

\`setImmediate\` لا تعني "نفذ فورًا". هي schedule للـ check phase.

# 120. setImmediate vs setTimeout(0)

عند top-level:

\`\`\`js
setTimeout(() => {
  console.log("timeout");
}, 0);

setImmediate(() => {
  console.log("immediate");
});
\`\`\`

لا تعتمد على ترتيب ثابت بينهما في top-level code؛ قد يختلف حسب runtime scheduling والسياق.

لكن داخل I/O callback:

\`\`\`js
fs.readFile("file.txt", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});
\`\`\`

غالبًا:

\`\`\`text
immediate
timeout
\`\`\`

لأننا نكون في سياق I/O وبعد poll تنتقل event loop إلى check قبل دورة timers التالية.

# 121. Close Callbacks Phase

لcallbacks المتعلقة بإغلاق handles/resources.

\`\`\`js
socket.on("close", () => {
  console.log("Socket closed");
});
\`\`\`

# 122. setTimeout داخليًا لا ينشئ Thread ينام

عندما تكتب:

\`\`\`js
setTimeout(() => {
  console.log("Hello");
}, 1000);
\`\`\`

Node لا تنشئ worker thread فقط لكي تنام 1000ms.

الفكرة:

\`\`\`text
Register timer
↓
Continue JS
↓
Time threshold expires
↓
callback becomes eligible
↓
event loop executes callback
\`\`\`

# 123. Timer Delay بسبب Blocking

\`\`\`js
setTimeout(() => {
  console.log("Timer");
}, 1000);

const start = Date.now();
while (Date.now() - start < 5000) {}

console.log("Done");
\`\`\`

الـ timer ستتأخر لأن event loop لا تستطيع اقتحام JavaScript الجاري على main thread. يجب أن يفرغ Call Stack.

# 124. Callback لا تعمل لحظة انتهاء I/O حرفيًا

الأدق:

\`\`\`text
I/O completes
     ↓
Node/libuv records completion
     ↓
callback becomes schedulable
     ↓
Event Loop reaches appropriate phase
     ↓
main thread available
     ↓
callback runs
\`\`\`

# 125. مثال يربط الصورة كلها

\`\`\`js
const fs = require("node:fs");

console.log("A");

fs.readFile("hello.txt", "utf8", (err, data) => {
  console.log("B");
});

console.log("C");
\`\`\`

غالبًا:

\`\`\`text
A
C
B
\`\`\`

لأن القراءة asynchronous، فيكمل JavaScript تنفيذ \`C\`، ثم عند اكتمال القراءة وجدولة callback تظهر \`B\`.

# 126. Final Runtime Model حتى هذه النقطة

\`\`\`text
                         ┌──────────────┐
                         │ JavaScript   │
                         │ Your Code    │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │ V8           │
                         │ Call Stack   │
                         └──────┬───────┘
                                │
                   Async operation requested
                                │
              ┌─────────────────┴──────────────────┐
              ↓                                    ↓
        Operating System                    libuv Thread Pool
                                              
     TCP / UDP / sockets                   File System
     network readiness                     Crypto
     kernel mechanisms                     Some DNS
                                           zlib
              │                                    │
              └─────────────────┬──────────────────┘
                                ↓
                         operation ready
                                ↓
                         ┌──────────────┐
                         │ Event Loop   │
                         └──────┬───────┘
                                ↓
                           Callback
                                ↓
                           Call Stack
\`\`\`

## أسئلة مراجعة

1. ما هي Event Loop؟
2. هل Event Loop thread يقوم بقراءة الملف بنفسه؟
3. ما الفرق بين Concurrency وParallelism؟
4. لماذا Node ممتازة في I/O-heavy workloads؟
5. لماذا CPU-heavy JavaScript خطير على server؟
6. ما هي phases الأساسية؟
7. ما وظيفة timers phase؟
8. ما وظيفة poll phase؟
9. ما وظيفة check phase؟
10. أين يعمل \`setImmediate()\`؟
11. هل \`setTimeout(fn, 0)\` ينفذ فورًا؟
12. لماذا \`setImmediate\` غالبًا يسبق timer داخل I/O callback؟
`};
