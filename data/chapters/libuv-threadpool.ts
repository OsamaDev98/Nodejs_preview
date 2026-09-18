import type { StudyChapter } from "@/types/study";

export const libuvThreadpoolChapter: StudyChapter = {
  id: "libuv-threadpool",
  number: 5,
  title: "libuv وThread Pool وAsync I/O",
  subtitle: "كيف ينسق Node بين JavaScript وOS والـ worker threads.",
  readingTime: "70 دقيقة",
  keywords: ["libuv", "Thread Pool", "Async I/O", "Offloading", "epoll", "kqueue", "IOCP", "pbkdf2", "DNS"],
  content: String.raw`
# قبل أن تبدأ: Mental Design للدرس كله

هذا الدرس يصبح سهلًا عندما تربط كل جزء بالسؤال الأساسي التالي:

> عندما أستدعي Async API في Node.js، **من الذي يقوم بالعمل فعليًا بينما JavaScript تكمل؟**

الإجابة ليست دائمًا واحدة. أحيانًا يكون **Operating System**، وأحيانًا يكون **libuv Thread Pool**.

استخدم هذا الرسم كخريطة للدرس كله:

\`\`\`text
Your JavaScript Code
        ↓
       V8
Main JavaScript Thread
        ↓
Node API
fs / net / http / crypto / dns ...
        ↓
      libuv
        ↓
   What kind of work is it?
        │
        ├──────────────────────────────┐
        │                              │
        ↓                              ↓
OS / Kernel async path           libuv Thread Pool
Network sockets                  File System
TCP / HTTP / UDP                 Some Crypto
epoll / kqueue / IOCP            Some DNS
                                 zlib
        │                              │
        └──────────────┬───────────────┘
                       ↓
                Operation completes
                       ↓
                  Event Loop
                       ↓
               Callback is scheduled
                       ↓
              Main JavaScript Thread
                       ↓
                 V8 runs callback
\`\`\`

إذن عند دراسة أي API اسأل 4 أسئلة:

1. هل استدعاء JavaScript نفسه Sync أم Async؟
2. إذا كان Async: هل العمل ينتظر OS/kernel أم يستخدم Thread Pool؟
3. ماذا يحدث بعد اكتمال العملية؟
4. متى ترجع النتيجة إلى JavaScript؟

احفظ الفكرة قبل التفاصيل:

\`\`\`text
V8
= executes your JavaScript

libuv
= coordinates asynchronous work

OS
= handles many network/event-based operations

Thread Pool
= executes certain operations that need worker threads

Event Loop
= brings completed work back so callbacks can run
\`\`\`

# 83. ما هي libuv؟

**libuv** هي مكتبة مكتوبة أساسًا بلغة C وتستخدمها Node.js لتوفير جزء كبير من البنية الخاصة بـ asynchronous I/O وEvent Loop وThread Pool والتعامل مع اختلافات أنظمة التشغيل.

لا تعتبر libuv JavaScript library عادية تستوردها في تطبيقك. هي جزء داخلي مهم من Runtime نفسها.

الصورة:

\`\`\`text
Your JavaScript
      ↓
Node.js APIs
      ↓
libuv
      ↓
Operating System
\`\`\`

وظيفتها ليست أن "تنفذ كل شيء"، بل أن تساعد Node في **تنسيق** العمليات غير المتزامنة والتعامل مع الـ OS بطريقة موحدة.

# 84. لماذا Node.js يحتاج libuv؟

لأن كل Operating System لديه mechanisms مختلفة للتعامل مع I/O.

أمثلة مشهورة:

\`\`\`text
Linux        → epoll
macOS / BSD → kqueue
Windows      → IOCP
\`\`\`

لو لم توجد طبقة مثل libuv، لاضطر Node إلى كتابة منطق مختلف جدًا لكل نظام.

libuv تعمل كـ abstraction layer:

\`\`\`text
Node.js
   ↓
libuv
   ↓
┌─────────┬─────────┬─────────┐
│ Linux   │ macOS   │ Windows │
│ epoll   │ kqueue  │ IOCP    │
└─────────┴─────────┴─────────┘
\`\`\`

إذن كلمة **Cross-platform** هنا مهمة جدًا.

# 85. أين تقع libuv داخل Node Architecture؟

اربط هذا الدرس بالدرس الأول:

\`\`\`text
                 Node.js Runtime
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
         V8                       libuv
          │                         │
Execute JavaScript            Event Loop
Call Stack                    Async I/O
Heap / GC                     Thread Pool
JIT                           OS abstraction
          │                         │
          └────────────┬────────────┘
                       ↓
                Operating System
\`\`\`

المسؤوليات الأساسية:

- **V8**: ينفذ JavaScript.
- **Node APIs**: تعطيك functions مثل fs.readFile وhttp.createServer.
- **libuv**: تنظم كثيرًا من الـ async work.
- **Operating System**: ينفذ أو ينتظر كثيرًا من عمليات I/O الفعلية.

# 86. ما معنى Async I/O؟

I/O تعني Input / Output.

أمثلة:

- قراءة ملف.
- كتابة ملف.
- استقبال Network data.
- إرسال HTTP request.
- DNS lookup.
- التعامل مع Socket.

عندما نقول **Async I/O** فنحن نقصد أن JavaScript لا تضطر عادة للوقوف منتظرة انتهاء العملية.

مثال:

\`\`\`js
console.log("A");

fs.readFile("file.txt", () => {
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

لماذا؟ لأن JavaScript بدأت العملية ثم أكملت، وعندما انتهت القراءة عاد callback لاحقًا.

# 87. هل Node.js Single-threaded؟

الجملة "Node.js is single-threaded" تحتاج تصحيح.

الأدق:

> كود JavaScript الخاص بتطبيقك يعمل افتراضيًا على **Main JavaScript Thread واحد** داخل Node process.

لكن Runtime نفسها تستخدم Threads أخرى.

\`\`\`text
Node Process
│
├── Main JavaScript Thread
│     └── V8 runs your JS here
│
├── libuv Worker Threads
│
├── V8 internal/helper threads
│
└── Other runtime threads
\`\`\`

إذن:

\`\`\`text
Your JS execution
≈ one main thread

Node process
≠ one thread only
\`\`\`

# 88. Main JavaScript Thread وCall Stack

الـ Main JavaScript Thread هو المكان الذي ينفذ فيه V8 الكود الرئيسي والـ callbacks.

مثال:

\`\`\`js
function one() {
  two();
}

function two() {
  console.log("Hello");
}

one();
\`\`\`

الـ Call Stack تعمل LIFO:

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

المهم في هذا الدرس: طالما Main Thread مشغولة بكود JavaScript طويل، callbacks الأخرى لن تنفذ عليها.

# 89. ما المشكلة لو Main Thread انشغلت؟

مثال سيئ:

\`\`\`js
const start = Date.now();

while (Date.now() - start < 5000) {
  // busy CPU work
}
\`\`\`

خلال هذه الخمس ثوانٍ، JavaScript callbacks الأخرى تنتظر.

حتى لو انتهت network request أو file read، الـ callback لا تستطيع اقتحام الكود الجاري.

الصورة:

\`\`\`text
Async operation finishes
        ↓
callback ready
        ↓
Main Thread busy?
        │
        ├── Yes → wait
        └── No  → execute callback
\`\`\`

# 90. ما هو Offloading؟

**Offloading** يعني أن Node لا تجعل Main JavaScript Thread تنفذ أو تنتظر كل العمل بنفسها.

بدلًا من ذلك يتم تفويض العملية إلى جهة أخرى مناسبة.

هذه الجهة قد تكون:

\`\`\`text
Operating System
or
libuv Thread Pool
\`\`\`

الصورة:

\`\`\`text
Main JS Thread
      ↓
Start async operation
      ↓
Offload
      ↓
OS or Thread Pool
      ↓
Main JS Thread continues
\`\`\`

هذه هي الفكرة المركزية للدرس.

# 91. أهم Decision Tree في الدرس

عندما ترى Async API لا تقل مباشرة: "ذهبت إلى Thread Pool".

استخدم هذا القرار:

\`\`\`text
Async operation
      ↓
What kind of operation?
      │
      ├── Network / socket readiness
      │        ↓
      │   OS / Kernel mechanism
      │   epoll / kqueue / IOCP
      │
      └── Certain native work
               ↓
         libuv Thread Pool
         fs / crypto / zlib / some DNS
\`\`\`

هذا هو الربط الذي كان ناقصًا: **Async هي طريقة سلوك من منظور JavaScript، وليست اسمًا لمسار تنفيذ واحد.**

# 92. المسار الأول: OS / Kernel Async Path

بعض العمليات ممتازة جدًا للـ OS لكي ينتظرها بدون حجز Worker Thread لكل عملية.

أشهر مثال: Network sockets.

\`\`\`text
JavaScript
    ↓
http / net API
    ↓
libuv
    ↓
Operating System
    ↓
socket waits for data
    ↓
kernel signals readiness
    ↓
libuv Event Loop
    ↓
JavaScript callback
\`\`\`

الفكرة المهمة:

> Network connection لا تحتاج غالبًا Thread Pool worker مخصوص ينتظرها.

# 93. Network I/O: لماذا Node تتحمل اتصالات كثيرة؟

لو كان كل HTTP request يحتاج Thread مستقل، كان عدد الاتصالات مرتبطًا مباشرة بعدد Threads.

لكن النموذج المعتاد في Node مختلف:

\`\`\`text
1000 sockets
     ↓
OS monitors readiness
     ↓
not 1000 libuv worker threads
\`\`\`

لذلك العبارة التالية خطأ:

\`\`\`text
Thread Pool = 4
therefore
Node handles only 4 requests
\`\`\`

HTTP/TCP socket I/O تعتمد غالبًا على event notification من الـ OS.

# 94. المسار الثاني: libuv Thread Pool

بعض العمليات لا تعتمد على نفس evented kernel mechanism الخاصة بالشبكات، أو تحتاج Native CPU work.

هنا تستخدم Node/libuv مجموعة Worker Threads.

تخيلها كفريق عمال:

\`\`\`text
              Thread Pool
      ┌────────┬────────┬────────┬────────┐
      │Worker 1│Worker 2│Worker 3│Worker 4│
      └────────┴────────┴────────┴────────┘
\`\`\`

الحجم الافتراضي الشائع هو 4 Workers.

أعمال مشهورة تستخدم هذا pool:

- كثير من Async File System APIs.
- بعض Crypto APIs مثل pbkdf2.
- zlib.
- بعض DNS work مثل dns.lookup.

مهم: هذه **قائمة أمثلة وليست قاعدة أن كل async API تستخدم pool**.

# 95. مثال File I/O من البداية للنهاية

الآن اربط كل الأجزاء:

\`\`\`js
const fs = require("node:fs");

console.log("A");

fs.readFile("users.json", "utf8", (err, data) => {
  console.log("B");
});

console.log("C");
\`\`\`

المسار التقريبي:

\`\`\`text
1. V8 executes JavaScript
        ↓
2. fs.readFile() is called
        ↓
3. Node/libuv receives request
        ↓
4. File work goes to Thread Pool
        ↓
5. Main JS Thread continues
        ↓
6. console.log("C") runs
        ↓
7. Worker finishes file operation
        ↓
8. Completion reaches Event Loop
        ↓
9. callback becomes runnable
        ↓
10. V8 executes callback
        ↓
11. console.log("B")
\`\`\`

لذلك غالبًا ترى:

\`\`\`text
A
C
B
\`\`\`

هذه السلسلة تربط V8 + Node API + libuv + Thread Pool + Event Loop.

# 96. UV_THREADPOOL_SIZE

يمكن تغيير عدد libuv worker threads باستخدام environment variable:

Linux/macOS:

\`\`\`bash
UV_THREADPOOL_SIZE=8 node app.js
\`\`\`

PowerShell:

\`\`\`powershell
$env:UV_THREADPOOL_SIZE=8
node app.js
\`\`\`

يفضل ضبطها قبل تشغيل التطبيق، وليس بعد بدء استخدام pool.

لكن لا تعتبرها "زر سرعة".

# 97. لماذا زيادة Thread Pool ليست دائمًا أفضل؟

لنفترض:

\`\`\`text
CPU cores = 4
Thread Pool = 500
\`\`\`

هذا لا يعني أداء أفضل 125 مرة.

قد تحصل على:

- Context switching أكثر.
- Memory overhead.
- CPU contention.
- Scheduling overhead.
- Latency أسوأ.

الصحيح:

\`\`\`text
measure
↓
benchmark
↓
change
↓
measure again
\`\`\`

# 98. CPU-heavy Native Work: pbkdf2Sync vs pbkdf2

هنا يوجد فرق مهم جدًا بين **CPU-heavy JavaScript** و**CPU-heavy native async API**.

أولًا:

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

هذه synchronous، لذلك Main JavaScript Thread تنتظرها.

\`\`\`text
Main JS Thread
      ↓
pbkdf2Sync
      ↓
CPU calculation
      ↓
Main Thread blocked
\`\`\`

أما:

\`\`\`js
crypto.pbkdf2(
  "secret",
  "salt",
  100000,
  64,
  "sha512",
  () => {
    console.log("done");
  }
);
\`\`\`

فالنسخة async تستطيع offload العمل إلى libuv Thread Pool.

\`\`\`text
Main JS Thread
      ↓
crypto.pbkdf2()
      ↓
Thread Pool Worker
      ↓
CPU calculation
      ↓
completion
      ↓
Event Loop
      ↓
callback
\`\`\`

# 99. ماذا يحدث لو عندي Tasks أكثر من Workers؟

لو Thread Pool فيها 4 workers وأرسلت 5 أعمال طويلة:

\`\`\`text
Worker 1 → Task 1
Worker 2 → Task 2
Worker 3 → Task 3
Worker 4 → Task 4

Waiting Queue:
Task 5
\`\`\`

Task 5 تنتظر Worker متاحًا.

إذن:

> Async لا تعني Infinite Parallelism.

العملية يمكن أن تكون async من منظور JavaScript، لكنها ما زالت تنتظر resource داخلي مثل worker.

# 100. Invocation Order ≠ Completion Order

لو بدأت:

\`\`\`js
task1();
task2();
task3();
\`\`\`

هذا هو **Invocation Order**.

لكن الانتهاء قد يكون:

\`\`\`text
task2
task1
task3
\`\`\`

لماذا؟

- مدة كل عملية مختلفة.
- OS scheduling مختلف.
- Worker availability مختلف.
- Network latency مختلفة.
- Disk/cache state مختلفة.

لذلك لا تبنِ logic على افتراض أن async tasks ستنتهي بنفس ترتيب استدعائها.

# 101. Network I/O vs File I/O — المقارنة التي يجب تثبيتها

هذه أهم مقارنة في الدرس:

\`\`\`text
NETWORK I/O
http / TCP sockets
       ↓
OS / Kernel readiness
       ↓
Event Loop
       ↓
callback

FILE I/O
fs.readFile()
       ↓
libuv Thread Pool
       ↓
OS file operation
       ↓
Event Loop
       ↓
callback
\`\`\`

الاثنان Async من منظور JavaScript، لكن **المسار الداخلي مختلف**.

# 102. DNS: لماذا لا توجد إجابة واحدة؟

DNS مثال ممتاز يثبت أن اسم المجال وحده لا يكفي؛ يجب معرفة الـ API.

مثلًا:

- \`dns.lookup()\` قد يعتمد على system resolver ويستخدم libuv Thread Pool.
- APIs أخرى في \`node:dns\` يمكن أن تستخدم asynchronous DNS mechanisms مختلفة.

إذن لا تحفظ:

\`\`\`text
DNS = Thread Pool
\`\`\`

ولا:

\`\`\`text
DNS = OS async always
\`\`\`

احفظ:

> المسار يعتمد على الـ API المستخدمة.

# 103. Thread Pool Starvation

الآن اربط queue بالـ File System.

لو لديك 4 Workers وكلهم مشغولون بـ Crypto طويل:

\`\`\`text
Worker 1 → PBKDF2
Worker 2 → PBKDF2
Worker 3 → PBKDF2
Worker 4 → PBKDF2

Waiting:
fs.readFile()
\`\`\`

الـ File I/O async، لكن قد تتأخر لأنها تحتاج Worker من نفس pool.

هذا يسمى **Thread Pool Starvation**.

مثال:

\`\`\`js
const crypto = require("node:crypto");
const fs = require("node:fs");

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

المشكلة ليست أن Event Loop متوقفة، بل أن العملية التي تحتاج Worker تنتظر توفر Worker.

# 104. كيف تربط الدرس كله؟

استخدم الخريطة التالية كل مرة:

\`\`\`text
I call an API
      ↓
Is it synchronous?
      │
      ├── Yes
      │    ↓
      │ Main JS Thread waits / blocks
      │
      └── No
           ↓
      Async operation
           ↓
   Which internal path?
      │             │
      ↓             ↓
 OS / Kernel    Thread Pool
 Network        fs / crypto
 sockets        zlib / some DNS
      │             │
      └──────┬──────┘
             ↓
         completion
             ↓
         Event Loop
             ↓
         callback
             ↓
      Main JS Thread
\`\`\`

والقاعدة العملية:

\`\`\`text
Do not ask only:
"Is it async?"

Also ask:
"Who is doing the work while JS continues?"
\`\`\`

## جدول الربط النهائي

| المفهوم | معناه | أين يعمل/يحدث؟ | مثال | ما الذي يجب ألا تخلطه معه؟ |
|---|---|---|---|---|
| V8 | محرك تنفيذ JavaScript | Main JS Thread أساسًا | تنفيذ callback | ليس مسؤولًا عن كل I/O |
| Main JavaScript Thread | الـ thread الذي ينفذ كود تطبيقك | داخل Node process | route handler / callback | Node process ليست thread واحدة فقط |
| Call Stack | تتبع functions الجاري تنفيذها | داخل V8 execution | one() → two() | ليست Event Loop queue |
| libuv | طبقة تنسيق async I/O وOS abstraction | داخل Node Runtime | fs/network coordination | ليست JavaScript library عادية |
| Event Loop | تنسق متى تعمل callbacks الجاهزة | libuv/Node runtime | callback بعد I/O | لا تقوم بقراءة الملف بنفسها |
| Offloading | تفويض العمل خارج Main JS Thread | إلى OS أو Thread Pool | fs.readFile / socket wait | لا يعني دائمًا Thread Pool |
| OS async path | kernel يراقب readiness/events | Operating System | HTTP/TCP sockets | لا يحتاج worker لكل request |
| Thread Pool | مجموعة worker threads لعمليات محددة | libuv | fs, pbkdf2, zlib | ليست Worker Threads |
| Async File I/O | قراءة/كتابة بدون حجز Main JS Thread | غالبًا Thread Pool + OS | fs.readFile | Async لا تعني بدون انتظار داخلي |
| Network I/O | socket communication | غالبًا OS/kernel mechanisms | HTTP/TCP | ليست عادة one worker per connection |
| UV_THREADPOOL_SIZE | عدد libuv workers | Environment config | 4 → 8 | الأكبر ليس دائمًا أسرع |
| pbkdf2Sync | CPU-heavy synchronous crypto | Main JS Thread | password derivation | تحجز JavaScript |
| pbkdf2 async | CPU-heavy native async crypto | libuv Thread Pool | crypto.pbkdf2 | ليست Worker Thread JS |
| Thread Pool Queue | انتظار Tasks عندما كل workers مشغولة | داخل pool scheduling | Task 5 تنتظر | Async ليست infinite parallelism |
| Thread Pool Starvation | تأخر Tasks بسبب انشغال كل workers | libuv pool | crypto يؤخر fs | ليست نفس Event Loop blocking |
| Completion Order | ترتيب انتهاء async work | يعتمد على runtime/OS/workload | task2 قبل task1 | لا يساوي Invocation Order |
| DNS | المسار يعتمد على API | system resolver أو async DNS path | dns.lookup | لا تحفظ DNS = pool دائمًا |

## ملخص الربط في 6 جمل

1. V8 ينفذ JavaScript على Main JavaScript Thread.
2. عندما تستدعي Async API، Node تحاول ألا تجعل Main Thread تنتظر.
3. libuv تنسق العملية وتقرر/تستخدم المسار المناسب بحسب نوع الـ API.
4. Network sockets تعتمد غالبًا على OS event mechanisms، بينما كثير من fs وبعض crypto/zlib/DNS تستخدم Thread Pool.
5. عند اكتمال العملية، Event Loop تساعد في إعادة callback إلى JavaScript عندما تصبح Main Thread متاحة.
6. لذلك Async لا تعني Thread Pool، وThread Pool لا تعني Event Loop، وNode ليست single-threaded حرفيًا.

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
