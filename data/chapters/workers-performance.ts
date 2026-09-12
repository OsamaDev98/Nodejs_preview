import type { StudyChapter } from "@/types/study";

export const workersPerformanceChapter: StudyChapter = {
  id: "workers-performance",
  number: 8,
  title: "Worker Threads وPerformance",
  subtitle: "CPU-heavy JavaScript، Worker Threads، Child Processes، event-loop lag وقياس الأداء.",
  readingTime: "45 دقيقة",
  keywords: ["Worker Threads", "Child Process", "CPU-bound", "Event Loop Lag", "Latency", "Throughput"],
  content: String.raw`
# 149. Worker Threads

عندما يكون لديك JavaScript CPU-intensive فإن الحل ليس أن تحاول تحويله إلى callback فقط. Node توفر:

\`\`\`js
node:worker_threads
\`\`\`

لتشغيل JavaScript في threads منفصلة.

\`\`\`js
const { Worker } = require("node:worker_threads");
\`\`\`

الفكرة:

\`\`\`text
Main Thread
   ↓
spawn worker
   ↓
Worker Thread
   ↓
heavy computation
   ↓
message back
\`\`\`

## 150. متى نستخدم Worker Threads؟

عندما تكون المهمة CPU-bound فعلًا، مثل:

- Image processing.
- Parsing أو transforms ثقيلة جدًا.
- حسابات رياضية كبيرة.
- Compression logic مكتوبة في JavaScript.
- بعض workloads المشابهة لمعالجة البيانات الثقيلة.

هي ليست الحل الطبيعي لمجرد انتظار Database أو HTTP request؛ هذه I/O-bound ويمكن للـ async model التقليدي التعامل معها بكفاءة.

# 151. Worker Thread ليست libuv Thread Pool

هذه نقطة شديدة الأهمية.

**libuv Thread Pool**:

- تديرها Node/libuv داخليًا.
- تستخدمها بعض native operations مثل filesystem وcrypto وzlib وبعض DNS APIs.
- أنت لا تنشئ worker فيها لكل function JavaScript تريدها.

**Worker Threads**:

- أنت تنشئها صراحة.
- تستطيع تشغيل JavaScript code في execution context مستقل.
- مناسبة لـ CPU-heavy JavaScript.

| Feature | libuv Thread Pool | Worker Threads |
|---|---|---|
| من يديره؟ | Node/libuv | أنت |
| يشغل JavaScript app code؟ | ليس كعامل عام لكودك | نعم |
| مناسب لـ CPU-heavy JS؟ | ليس كحل مباشر لكود JS | نعم |
| يستخدمه fs؟ | نعم في كثير من العمليات | لا تلقائيًا |
| يحتاج إنشاء يدوي؟ | لا | نعم |

# 152. Child Process vs Worker Thread

Node توفر أيضًا:

\`\`\`text
worker_threads
child_process
cluster
\`\`\`

Worker Thread:

\`\`\`text
Same process
Separate thread
Separate JS execution context
\`\`\`

Child Process:

\`\`\`text
Separate process
Separate memory
Separate PID
\`\`\`

الاختيار يعتمد على workload، isolation المطلوب، طريقة الاتصال، تكلفة التشغيل، وكيف تريد توزيع العمل.

# 153. Event Loop Delay / Lag

إذا كانت event loop مشغولة فإن callbacks تتأخر.

\`\`\`js
setTimeout(() => {
  console.log("Timer");
}, 100);

const start = Date.now();
while (Date.now() - start < 3000) {}
\`\`\`

طلبت timer بعد 100ms لكنها لن تعمل حتى يفرغ main thread بعد حوالي 3 ثوانٍ.

الفرق بين الوقت المتوقع والوقت الفعلي جزء مما نفكر فيه كـ Event Loop Delay/Lag.

# 154. لماذا Event Loop Lag خطير؟

لأن المستخدم يشعر بـ:

- Slow API responses.
- WebSocket delay.
- Timeouts.
- Delayed jobs.
- Poor latency.

وقد تكون المشكلة CPU-bound JavaScript وليس Network أو Database.

# 155. Latency vs Throughput

Backend developer يجب أن يفرق بينهما.

**Latency**:

> كم يستغرق request واحد حتى يحصل على response؟

**Throughput**:

> كم request أقدر أخدم في وحدة زمن، مثل requests/second؟

Blocking event loop يضر الاثنين: يزيد latency ويخفض throughput.

# 156. Example Request Flow

تخيل HTTP request في Node:

\`\`\`text
Client
 ↓
TCP Socket
 ↓
OS Kernel
 ↓
libuv
 ↓
Event Loop
 ↓
JS callback
 ↓
Route Handler
 ↓
Database request
 ↓
JS thread free
 ↓
DB response
 ↓
Event Loop
 ↓
Callback/Promise continuation
 ↓
Response sent
\`\`\`

هذا الرسم يوضح لماذا Node ممتازة في API servers التي تقضي وقتًا كبيرًا في انتظار I/O.

# 157. Keep the Event Loop Free

القاعدة العملية الأهم:

> لا تجعل main JavaScript thread تنفذ أعمالًا ثقيلة لفترة طويلة.

تجنب داخل request handlers قدر الإمكان:

\`\`\`text
Huge loops
CPU-heavy transforms
Synchronous fs APIs
Synchronous crypto
Large synchronous parsing
Unbounded recursive microtasks
\`\`\`

إذا كانت المهمة CPU-heavy فكر في:

- Worker Threads.
- Child Processes.
- Separate service.
- Job queue.
- Native/native-backed APIs.
- Horizontal scaling عندما يكون مناسبًا.

# 158. Thread Pool Size ليس حلًا سحريًا

زيادة \`UV_THREADPOOL_SIZE\` قد تحسن workload محدد، وقد تضر workload آخر بسبب:

- Context switching.
- CPU contention.
- Memory overhead.
- ازدحام الموارد.

إذن يجب أن تقيس:

\`\`\`text
Latency
Throughput
CPU utilization
Memory
Event loop lag
Thread pool pressure
\`\`\`

قبل وبعد أي tuning.

# 159. Complete Mental Model

\`\`\`text
                 ┌──────────────────────┐
                 │   JavaScript Code    │
                 └──────────┬───────────┘
                            ↓
                     ┌────────────┐
                     │ V8 Engine  │
                     │ Call Stack │
                     └─────┬──────┘
                           │
                    async operation
                           │
              ┌────────────┴─────────────┐
              ↓                          ↓
       OS / Kernel                 libuv Thread Pool
                                           
 TCP / UDP / sockets             fs
 network events                  crypto
                                 zlib
                                 some DNS
              │                          │
              └────────────┬─────────────┘
                           ↓
                       completion
                           ↓
                    ┌────────────┐
                    │ Event Loop │
                    └─────┬──────┘
                          │
      ┌───────────────────┼────────────────────┐
      ↓                   ↓                    ↓
   timers               poll                 check
setTimeout            I/O callbacks       setImmediate
setInterval

            + process.nextTick queue
            + Promise microtasks
                           ↓
                      Call Stack
\`\`\`

وبالنسبة لـ CPU-heavy JavaScript، يمكن إضافة Worker Threads خارج main JavaScript execution flow.

# 160. تمرين عملي شامل للـ Event Loop

أنشئ:

\`\`\`text
event-loop-lab/
│
├── 01-sync.js
├── 02-nexttick.js
├── 03-promises.js
├── 04-timers.js
├── 05-immediate.js
├── 06-io.js
├── 07-threadpool.js
└── 08-starvation.js
\`\`\`

في كل ملف حاول توقع output قبل التشغيل ثم شغله وفسر النتيجة.

مثال:

\`\`\`js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

process.nextTick(() => {
  console.log("C");
});

Promise.resolve().then(() => {
  console.log("D");
});

console.log("E");
\`\`\`

لا تحفظ output فقط. اسأل دائمًا: **لماذا؟**

# 161. تمرين Thread Pool

\`\`\`js
const crypto = require("node:crypto");

const start = performance.now();

for (let i = 1; i <= 5; i++) {
  crypto.pbkdf2(
    "secret",
    "salt",
    100000,
    64,
    "sha512",
    () => {
      console.log(`Task ${i}:`, performance.now() - start);
    }
  );
}
\`\`\`

راقب أن ترتيب completion قد لا يطابق ترتيب الاستدعاء، وأن عدد workers يؤثر على كيفية تكدس الأعمال.

# 162. الخريطة الحالية للكورس

\`\`\`text
Node.js
│
├── Runtime
│   ├── V8
│   ├── C/C++
│   └── libuv
│
├── Modules
│   ├── CommonJS
│   ├── ESM
│   ├── Wrapper
│   └── Cache
│
├── File System
│   ├── Sync
│   ├── Async callbacks
│   └── Promises
│
├── Buffer
│
├── Streams
│
├── npm
│
├── libuv
│   ├── OS abstraction
│   ├── Thread Pool
│   └── Event Loop
│
├── Async architecture
│   ├── OS I/O
│   └── Thread Pool
│
├── Event Loop
│   ├── timers
│   ├── pending callbacks
│   ├── poll
│   ├── check
│   ├── close callbacks
│   ├── process.nextTick
│   └── Promise microtasks
│
└── CPU-heavy strategy
    ├── Worker Threads
    ├── Child Processes
    ├── Job queues
    └── Separate services
\`\`\`

# 163. أسئلة Interview ومراجعة شاملة

1. ما الفرق بين \`readFile()\` و\`readFileSync()\`؟
2. ماذا يعني Blocking؟
3. لماذا synchronous APIs خطيرة داخل HTTP request handler؟
4. ما هو Buffer؟
5. ما هو UTF-8؟
6. ما هو Stream؟
7. ما هو Backpressure؟
8. ما هو npm Registry؟
9. ما الفرق بين \`package.json\` و\`package-lock.json\`؟
10. ما هي libuv؟
11. هل Node.js single-threaded فعلًا؟
12. ما هو Main JavaScript Thread؟
13. ما هو Thread Pool؟
14. هل كل async operation تستخدم Thread Pool؟
15. أين تذهب Network I/O عادة؟
16. أين تذهب File I/O عادة؟
17. لماذا \`crypto.pbkdf2()\` تختلف عن \`pbkdf2Sync()\`؟
18. ما هي Event Loop؟
19. ما الفرق بين Concurrency وParallelism؟
20. لماذا CPU-heavy JavaScript يمكن أن يدمر أداء Node server؟
21. ما هي Event Loop phases؟
22. أين يعمل \`setImmediate()\`؟
23. هل \`setTimeout(fn, 0)\` ينفذ فورًا؟
24. ما هي Microtasks؟
25. ما هو \`process.nextTick()\`؟
26. أيهما له أولوية عادة: nextTick أم Promise؟
27. ما معنى Event Loop Starvation؟
28. هل Promise تنشئ Thread؟
29. هل async/await تنشئ Thread؟
30. متى نستخدم Worker Threads؟
31. ما الفرق بين Worker Threads وlibuv Thread Pool؟
32. ما هو Event Loop Lag؟
33. ما الفرق بين Latency وThroughput؟
34. كيف يمكن أن يحدث Thread Pool Starvation؟
35. لماذا زيادة \`UV_THREADPOOL_SIZE\` ليست دائمًا أفضل؟

إذا استطعت شرح هذه الأسئلة لشخص آخر بلغتك ومن غير حفظ حرفي، فأنت فهمت أساس Node internals بشكل حقيقي.
`};
