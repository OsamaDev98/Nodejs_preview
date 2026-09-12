import type { StudyChapter } from "@/types/study";

export const labsReferenceChapter: StudyChapter = {
  id: "labs-reference",
  number: 9,
  title: "المعمل العملي والمرجع السريع",
  subtitle: "تمارين عملية، جداول مصطلحات، أمثلة متكاملة ومراجعة نهائية لكل ما سبق.",
  readingTime: "60 دقيقة",
  keywords: ["Lab", "Practice", "Glossary", "Interview", "Exercises", "Revision"],
  content: String.raw`
# 164. قاموس المصطلحات الأساسي

| المصطلح | المعنى |
|---|---|
| Node.js | JavaScript Runtime |
| V8 | JavaScript Engine |
| Runtime | بيئة تنفيذ البرنامج |
| Cross-platform | يعمل على أنظمة مختلفة |
| Open Source | الكود المصدري متاح |
| REPL | Read Evaluate Print Loop |
| Module | وحدة كود مستقلة |
| Built-in Module | Module يأتي مع Node |
| Local Module | Module أنت كتبته |
| NPM Module | Package خارجية |
| CommonJS | require / module.exports |
| ESM | import / export |
| Module Wrapper | Function تغلف CommonJS module |
| Module Cache | تخزين module بعد تحميله |
| require.cache | Cache الخاصة بـ CommonJS |
| require.resolve() | تحديد مسار module |
| globalThis | Global object standard |
| global | Node global object |
| libuv | مكتبة أساسية للـ async I/O |
| Internal Binding | ربط داخلي بين JS وNative code |
| Buffer | تمثيل bytes في الذاكرة |
| Stream | معالجة بيانات تدريجيًا على chunks |
| Backpressure | تنظيم سرعة producer وconsumer |
| Thread Pool | Workers تستخدمها بعض native async APIs |
| Event Loop | تنسيق أحداث وجدولة callbacks |
| Microtask | مهمة ذات أولوية مثل Promise callbacks |
| CPU-bound | وقت العمل أغلبه حساب على CPU |
| I/O-bound | وقت العمل أغلبه انتظار I/O |

# 165. تمرين Modules + Cache

أنشئ:

\`\`\`text
node-learning/
│
├── app.js
├── math.js
├── logger.js
└── counter.js
\`\`\`

## math.js

\`\`\`js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract
};
\`\`\`

## logger.js

\`\`\`js
console.log("Logger module loaded");

function log(message) {
  console.log(`[LOG]: ${message}`);
}

module.exports = log;
\`\`\`

## counter.js

\`\`\`js
let count = 0;

function increment() {
  count++;
  return count;
}

module.exports = {
  increment
};
\`\`\`

## app.js

\`\`\`js
const math = require("./math");
const log = require("./logger");

const counter1 = require("./counter");
const counter2 = require("./counter");

log(`2 + 3 = ${math.add(2, 3)}`);

console.log(counter1.increment());
console.log(counter2.increment());
\`\`\`

قبل التشغيل، توقّع النتيجة. ثم اسأل نفسك: لماذا \`counter2\` لم يبدأ من صفر؟ الإجابة: **Module Cache**.

# 166. مثال Backend Modules واقعي

\`\`\`text
project/
│
├── app.js
├── config/
│   └── database.js
│
├── controllers/
│   └── users.controller.js
│
├── services/
│   └── users.service.js
│
├── routes/
│   └── users.routes.js
│
└── utils/
    └── logger.js
\`\`\`

مسار الطلب غالبًا:

\`\`\`text
app.js
  ↓
routes
  ↓
controller
  ↓
service
  ↓
database
\`\`\`

# 167. تمرين File System شامل

أنشئ:

\`\`\`text
node-internals/
│
├── files/
│   └── data.txt
│
├── sync.js
├── async.js
├── streams.js
├── crypto-sync.js
├── crypto-async.js
└── package.json
\`\`\`

## sync.js

\`\`\`js
const fs = require("node:fs");

console.log("Start");

const data = fs.readFileSync(
  "./files/data.txt",
  "utf8"
);

console.log(data);
console.log("End");
\`\`\`

راقب ترتيب التنفيذ.

## async.js

\`\`\`js
const fs = require("node:fs");

console.log("Start");

fs.readFile(
  "./files/data.txt",
  "utf8",
  (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(data);
  }
);

console.log("End");
\`\`\`

توقع الناتج قبل التشغيل.

# 168. تمرين Streams

\`\`\`js
const fs = require("node:fs");

const stream = fs.createReadStream(
  "./files/data.txt",
  {
    encoding: "utf8"
  }
);

stream.on("data", (chunk) => {
  console.log("CHUNK:");
  console.log(chunk);
});

stream.on("end", () => {
  console.log("Finished");
});

stream.on("error", (err) => {
  console.error(err);
});
\`\`\`

جرب أيضًا نسخ ملف كبير باستخدام:

\`\`\`js
readStream.pipe(writeStream);
\`\`\`

ثم قارن استهلاك الذاكرة ذهنيًا مع \`readFile\` لملف كبير جدًا.

# 169. crypto-sync.js

\`\`\`js
const crypto = require("node:crypto");

const start = performance.now();

for (let i = 1; i <= 4; i++) {
  crypto.pbkdf2Sync(
    "secret",
    "salt",
    100000,
    64,
    "sha512"
  );

  console.log(
    `Task ${i}:`,
    performance.now() - start
  );
}
\`\`\`

لاحظ أن العمليات تحدث واحدة وراء الأخرى وتحتجز main thread أثناء كل حساب.

# 170. crypto-async.js

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
      console.log(
        `Task ${i}:`,
        performance.now() - start
      );
    }
  );
}
\`\`\`

هذا التمرين يسمح لك برؤية أثر Thread Pool وترتيب completion غير المضمون.

# 171. تغيير Thread Pool للتجربة

Linux/macOS:

\`\`\`bash
UV_THREADPOOL_SIZE=5 node crypto-async.js
\`\`\`

PowerShell:

\`\`\`powershell
$env:UV_THREADPOOL_SIZE=5
node crypto-async.js
\`\`\`

راقب النتائج ولا تتوقع أزمنة متطابقة؛ CPU وOS load والـ scheduling كلها تؤثر.

# 172. Event Loop Lab

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

القاعدة: **اكتب توقعك للـ output على الورق قبل التشغيل**.

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

المهم ليس حفظ الناتج، بل فهم السبب.

# 173. Complete Ordering Exercise

\`\`\`js
const fs = require("node:fs");

console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

setImmediate(() => {
  console.log("3");
});

process.nextTick(() => {
  console.log("4");
});

Promise.resolve().then(() => {
  console.log("5");
});

fs.readFile(__filename, () => {
  console.log("6");

  process.nextTick(() => {
    console.log("7");
  });

  Promise.resolve().then(() => {
    console.log("8");
  });

  setImmediate(() => {
    console.log("9");
  });

  setTimeout(() => {
    console.log("10");
  }, 0);
});

console.log("11");
\`\`\`

الجزء المؤكد أولًا:

\`\`\`text
1
11
4
5
\`\`\`

داخل \`fs.readFile\` غالبًا ترى النمط:

\`\`\`text
6
7
8
9
10
\`\`\`

مع فهم أن nextTick ثم Promise microtask ثم setImmediate/check ثم timer في الدورة المناسبة هو pattern الأساسي داخل هذا السياق.

# 174. Starvation Lab

\`\`\`js
function recurse() {
  process.nextTick(recurse);
}

recurse();
\`\`\`

لا تشغل هذا بلا فهم لما يحدث. الفكرة هي ملاحظة أن nextTick queue يمكن أن تتجدد باستمرار وتمنع event loop من الوصول إلى timers وI/O وcheck.

والمفهوم نفسه ممكن مع Promise microtasks إذا أنشأت سلسلة غير منتهية.

# 175. Event Loop Delay Lab

\`\`\`js
setTimeout(() => {
  console.log("Timer");
}, 100);

const start = Date.now();

while (Date.now() - start < 3000) {}
\`\`\`

الهدف هو مشاهدة الفرق بين Scheduled time وActual execution time.

# 176. قائمة التصحيحات التي يجب تثبيتها

بدل:

\`\`\`text
JS → single thread
\`\`\`

قل:

\`\`\`text
JavaScript code normally executes on one main thread,
but the Node.js process uses additional threads internally.
\`\`\`

بدل:

\`\`\`text
Async = Thread Pool
\`\`\`

قل:

\`\`\`text
Async operation may use OS async mechanisms
OR libuv thread pool depending on the API.
\`\`\`

بدل:

\`\`\`text
Thread pool handles requests
\`\`\`

قل:

\`\`\`text
Network socket I/O generally relies on OS/kernel event mechanisms,
not one libuv worker thread per request.
\`\`\`

بدل:

\`\`\`text
Callback runs when operation ends
\`\`\`

قل:

\`\`\`text
Operation completes → callback becomes eligible →
event loop schedules it → callback runs when JS thread is available.
\`\`\`

بدل:

\`\`\`text
Event Loop does async operations
\`\`\`

قل:

\`\`\`text
Event Loop coordinates events/completions and callback execution.
The actual I/O may be handled by OS or thread pool.
\`\`\`

# 177. الخريطة الدراسية النهائية

\`\`\`text
Node.js
│
├── What is Node?
│   ├── Open Source
│   ├── Cross Platform
│   └── JavaScript Runtime
│
├── How Node Works
│   ├── JavaScript
│   ├── V8
│   ├── C/C++
│   ├── libuv
│   └── Operating System
│
├── Running Node
│   ├── Terminal
│   ├── node app.js
│   └── REPL
│
├── Modules
│   ├── Built-in
│   ├── Local
│   ├── NPM
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
├── Buffer / UTF-8 / JSON
│
├── Streams
│   ├── chunks
│   ├── readable
│   ├── writable
│   └── backpressure
│
├── npm
│   ├── registry
│   ├── package.json
│   ├── dependencies
│   ├── node_modules
│   └── package-lock.json
│
├── libuv
│   ├── OS abstraction
│   ├── Thread Pool
│   └── Event Loop
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

# 178. طريقة المذاكرة الصحيحة

1. اقرأ المفهوم وحاول أن تشرحه بصوتك.
2. لا تحفظ ترتيب Event Loop بدون تشغيل أمثلة.
3. قبل تشغيل كل مثال asynchronous اكتب توقعك للـ output.
4. إذا أخطأت في التوقع، ارسم Call Stack وqueues/phases.
5. غيّر المثال بنفسك: أضف timer أو Promise أو I/O وشاهد الفرق.
6. في الأداء، لا تعتمد على التخمين: benchmark ثم measure ثم adjust.
7. عندما تستطيع شرح الفرق بين V8 وlibuv وEvent Loop وThread Pool وWorker Threads لشخص آخر، تكون الصورة المعمارية بدأت تثبت فعلًا.
`};
