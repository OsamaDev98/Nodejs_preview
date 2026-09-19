import type { StudyChapter } from "@/types/study";

export const microtasksChapter: StudyChapter = {
  id: "microtasks",
  number: 7,
  title: "Microtasks وnextTick وترتيب التنفيذ",
  subtitle: "Promises، queueMicrotask، setImmediate، starvation والـ ordering الحقيقي.",
  readingTime: "65 دقيقة",
  keywords: ["process.nextTick", "Promise", "queueMicrotask", "setImmediate", "starvation", "ordering"],
  content: String.raw`
# قبل أن تبدأ: Mental Design بسيط جدًا

هذا الدرس كله يدور حول سؤال واحد:

> **عندما تنتهي JavaScript الحالية، وهناك أكثر من callback جاهزة، أي واحدة تعمل أولًا؟**

لا تبدأ بحفظ أسماء كثيرة. ابدأ بهذه الصورة:

\`\`\`text
1) JavaScript الحالية تعمل
        ↓
2) تنتهي الـ Call Stack الحالية
        ↓
3) Node تفحص nextTick queue
        ↓
4) ثم Microtasks مثل Promise وqueueMicrotask
        ↓
5) ثم تكمل Event Loop
   timers / poll / check / ...
\`\`\`

هذا هو الـ Mental Model الأساسي لهذا الدرس.

وبشكل أبسط جدًا:

\`\`\`text
Current code
   ↓
nextTick
   ↓
Promise / queueMicrotask
   ↓
Event Loop work
\`\`\`

لكن انتبه: هذا ترتيب تعليمي للسياقات المعتادة في Node، وليس قاعدة مطلقة لكل سياق، خصوصًا top-level ESM.


# 127. أولًا: ما معنى Scheduling؟

Scheduling يعني: عندما يكون عندي أكثر من شيء جاهز للتنفيذ، **متى وأين يوضع كل واحد؟**

مثال:

\`\`\`js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");
\`\`\`

النتيجة:

\`\`\`text
A
C
B
\`\`\`

لماذا؟

- A تعمل فورًا.
- setTimeout لا يشغل callback فورًا؛ يقوم بجدولتها.
- C ما زالت synchronous، فتعمل قبل B.

إذن أول قاعدة:

> **الكود synchronous الحالي يكتمل أولًا قبل الانتقال إلى callbacks المجدولة.**


# 128. ما هي Microtask؟

Microtask هي callback ذات أولوية عالية تُنفذ بعد انتهاء synchronous code الحالي وقبل أن تستمر Event Loop إلى معظم الأعمال التالية.

أمثلة مشهورة:

- \`Promise.then()\`
- \`Promise.catch()\`
- \`Promise.finally()\`
- \`queueMicrotask()\`
- continuation بعد \`await\`

مثال:

\`\`\`js
console.log("A");

Promise.resolve().then(() => {
  console.log("B");
});

console.log("C");
\`\`\`

الناتج:

\`\`\`text
A
C
B
\`\`\`

لأن Promise callback لم تدخل Call Stack الحالية، لكنها وُضعت في Microtask queue.


# 129. أين تقع Microtasks في الصورة؟

\`\`\`text
Current synchronous callback
          ↓
      finishes
          ↓
   Microtasks run
          ↓
 Event Loop continues
\`\`\`

فكر فيها كأن Node تقول:

> قبل أن أذهب للـ timer أو I/O التالي، هل عندي Microtasks جاهزة؟


# 130. ما هو process.nextTick()؟

\`process.nextTick()\` API خاصة بـ Node.js.

هي تقول تقريبًا:

> بعد انتهاء الكود الحالي مباشرة، نفّذ هذه callback قبل أن تكمل Event Loop.

مثال:

\`\`\`js
console.log("A");

process.nextTick(() => {
  console.log("B");
});

console.log("C");
\`\`\`

الناتج المعتاد:

\`\`\`text
A
C
B
\`\`\`

إذن nextTick لا تقاطع الكود الحالي. تنتظر انتهاء الـ stack الحالية أولًا.


# 131. الفرق الذهني بين nextTick وPromise

هذه أهم نقطة في الدرس.

في CommonJS والسياقات المعتادة داخل callbacks، فكر في الترتيب هكذا:

\`\`\`text
Current synchronous code
        ↓
process.nextTick queue
        ↓
Promise / queueMicrotask queue
        ↓
Event Loop continues
\`\`\`

مثال:

\`\`\`js
console.log("start");

Promise.resolve().then(() => {
  console.log("promise");
});

process.nextTick(() => {
  console.log("nextTick");
});

console.log("end");
\`\`\`

النتيجة المعتادة:

\`\`\`text
start
end
nextTick
promise
\`\`\`

السبب:

1. synchronous code أولًا.
2. nextTick queue.
3. Promise microtasks.


# 132. مثال شامل صغير جدًا

\`\`\`js
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

process.nextTick(() => {
  console.log("4");
});

console.log("5");
\`\`\`

حلّه خطوة خطوة:

### الخطوة 1 — synchronous

\`\`\`text
1
5
\`\`\`

### الخطوة 2 — nextTick

\`\`\`text
4
\`\`\`

### الخطوة 3 — Promise microtask

\`\`\`text
3
\`\`\`

### الخطوة 4 — Event Loop

timer يصبح جاهزًا:

\`\`\`text
2
\`\`\`

إذن غالبًا:

\`\`\`text
1
5
4
3
2
\`\`\`


# 133. queueMicrotask()

\`queueMicrotask()\` تضع callback مباشرة في Microtask queue.

\`\`\`js
console.log("A");

queueMicrotask(() => {
  console.log("B");
});

console.log("C");
\`\`\`

الناتج:

\`\`\`text
A
C
B
\`\`\`

هي أقرب للـ standard JavaScript microtask behavior، بينما \`process.nextTick()\` API خاصة بـ Node.


# 134. nextTick vs queueMicrotask

الفرق المفاهيمي:

| API | النوع | أين تستخدمها ذهنيًا؟ |
|---|---|---|
| \`process.nextTick()\` | Node-specific queue | أولوية خاصة بعد الكود الحالي |
| \`queueMicrotask()\` | Standard microtask | نفس طبقة Promise microtasks |

في الكود الحديث، إذا لم تكن تحتاج semantics خاصة بـ Node، فـ \`queueMicrotask()\` غالبًا أوضح وأكثر portable.


# 135. لماذا لا نريد الإفراط في nextTick؟

لأنها ذات أولوية عالية.

مثال خطر:

\`\`\`js
function loop() {
  process.nextTick(loop);
}

loop();
\`\`\`

ماذا يحدث؟

كل nextTick تضيف nextTick أخرى.

\`\`\`text
nextTick
   ↓
nextTick
   ↓
nextTick
   ↓
nextTick
   ↓
...
\`\`\`

فتظل Node مشغولة بتصريف nextTick queue ولا تصل بسهولة إلى timers أو I/O.

هذا يسمى **Starvation**.


# 136. هل Promise يمكن أن تسبب Starvation أيضًا؟

نعم، إذا استمريت في إنشاء Microtasks بلا نهاية.

\`\`\`js
function loop() {
  Promise.resolve().then(loop);
}

loop();
\`\`\`

الفكرة:

> أي queue ذات أولوية يمكن أن تمنع Event Loop من التقدم لو ظلت تتجدد بلا نهاية.


# 137. ما المقصود بـ Macrotask؟

قد تسمع في شروحات JavaScript:

\`\`\`text
Macrotask
vs
Microtask
\`\`\`

في Node لا أحب أن تختزل الصورة إلى queue واحدة اسمها Macrotask لأن Event Loop فيها phases متعددة.

الأفضل:

\`\`\`text
Microtasks:
Promise / queueMicrotask

Node special queue:
process.nextTick

Event Loop work:
timers / I/O / setImmediate / close ...
\`\`\`


# 138. أين setTimeout(0)؟

\`setTimeout(fn, 0)\` لا يعني "شغّل الآن".

يعني:

> اجعل callback مؤهلة للتنفيذ عندما تسمح timer scheduling rules بذلك.

مثال:

\`\`\`js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");
\`\`\`

النتيجة:

\`\`\`text
A
C
B
\`\`\`


# 139. أين setImmediate()؟

\`setImmediate()\` تضع callback في **check phase** من Event Loop.

فكر فيها هكذا:

\`\`\`text
setTimeout(0)
→ timers

setImmediate
→ check phase
\`\`\`

لكن لا تحفظ أن واحدة منهما دائمًا تسبق الأخرى في top-level، لأن الترتيب قد يعتمد على السياق والتوقيت.


# 140. المثال الذي يسبب اللخبطة: setTimeout vs setImmediate

\`\`\`js
setTimeout(() => {
  console.log("timeout");
}, 0);

setImmediate(() => {
  console.log("immediate");
});
\`\`\`

في top-level:

> لا تبنِ منطقك على ترتيب ثابت بينهما.

لكن داخل I/O callback غالبًا يكون الأمر أوضح.


# 141. المثال الأهم: داخل I/O callback

\`\`\`js
const fs = require("node:fs");

fs.readFile("file.txt", () => {
  console.log("I/O");

  process.nextTick(() => {
    console.log("nextTick");
  });

  Promise.resolve().then(() => {
    console.log("promise");
  });

  setImmediate(() => {
    console.log("immediate");
  });

  setTimeout(() => {
    console.log("timeout");
  }, 0);
});
\`\`\`

الترتيب المتوقع غالبًا:

\`\`\`text
I/O
nextTick
promise
immediate
timeout
\`\`\`

لماذا؟

\`\`\`text
I/O callback executes
      ↓
callback ends
      ↓
nextTick
      ↓
Promise microtasks
      ↓
check phase
setImmediate
      ↓
next timer opportunity
setTimeout
\`\`\`

هذا المثال وحده يربط نصف الدرس.


# 142. Microtasks تعمل بعد كل callback مهمة

لا تتخيل أن Microtasks تعمل مرة واحدة فقط في البرنامج.

بعد انتهاء callback، runtime تستطيع تصريف nextTick/microtasks قبل الانتقال لعمل آخر.

\`\`\`text
callback
   ↓
callback ends
   ↓
nextTick
   ↓
microtasks
   ↓
Event Loop continues
\`\`\`


# 143. FIFO لا تعني أن Node كلها Queue واحدة

داخل queue واحدة، الترتيب عادة FIFO.

لكن Node لديها:

- nextTick queue
- Microtask queue
- timers
- poll
- check
- close

لذلك لا تقل:

> Node تنفذ كل callbacks من queue واحدة بالترتيب.

هذا غير دقيق.


# 144. ماذا يحدث لو callback نفسها ثقيلة؟

حتى لو جاءت callback من async API، JavaScript داخلها تعمل على Main Thread.

مثال:

\`\`\`js
setTimeout(() => {
  const start = Date.now();

  while (Date.now() - start < 5000) {
    // heavy work
  }
}, 0);
\`\`\`

هذه callback تحجز Main Thread خمس ثوانٍ.

إذن:

> Async source لا يعني أن callback نفسها non-blocking.


# 145. I/O-bound vs CPU-bound

اربط هذا بالدرس السابق:

### I/O-bound

الوقت الأكبر Waiting:

\`\`\`text
Database
Network
Disk
External API
\`\`\`

### CPU-bound

الوقت الأكبر Computing:

\`\`\`text
Huge loop
Image processing
Video processing
Heavy transformation
Crypto calculation
\`\`\`

Node ممتازة جدًا عندما لا تحجز Main Thread أثناء انتظار I/O.


# 146. async/await أين يدخل في الترتيب؟

الجزء بعد \`await\` لا يكمل فورًا في نفس السطر التنفيذي.

عندما تتحقق Promise، continuation بعد \`await\` تُجدول كـ Microtask.

مثال:

\`\`\`js
async function test() {
  console.log("A");

  await Promise.resolve();

  console.log("B");
}

console.log("C");
test();
console.log("D");
\`\`\`

الترتيب:

\`\`\`text
C
A
D
B
\`\`\`

الشرح:

1. C synchronous.
2. نستدعي test.
3. A synchronous.
4. عند await تتوقف test منطقيًا.
5. نعود وننفذ D.
6. continuation بعد await تعمل كـ Microtask، فتطبع B.


# 147. Mental Model واحد لحل أي سؤال Ordering

عندما ترى سؤال ترتيب تنفيذ، لا تحاول الحفظ.

امشِ بهذه الخطوات:

\`\`\`text
Step 1
نفّذ كل synchronous code
        ↓
Step 2
سجّل ما دخل nextTick
        ↓
Step 3
سجّل Promise / queueMicrotask
        ↓
Step 4
بعد انتهاء current callback:
صرف nextTick ثم microtasks
        ↓
Step 5
أكمل Event Loop phase المناسبة
        ↓
Step 6
بعد كل callback:
ارجع افحص nextTick/microtasks
\`\`\`

هذه هي طريقة التفكير الصحيحة.


# 148. مثال نهائي محلول خطوة بخطوة

\`\`\`js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

process.nextTick(() => {
  console.log("D");
});

queueMicrotask(() => {
  console.log("E");
});

console.log("F");
\`\`\`

### 1) Synchronous

\`\`\`text
A
F
\`\`\`

### 2) nextTick

\`\`\`text
D
\`\`\`

### 3) Microtasks

تم تسجيل Promise قبل queueMicrotask، لذلك داخل نفس microtask queue:

\`\`\`text
C
E
\`\`\`

### 4) Timer

\`\`\`text
B
\`\`\`

الناتج المعتاد:

\`\`\`text
A
F
D
C
E
B
\`\`\`


## الخريطة النهائية للدرس

\`\`\`text
                 READY WORK
                     │
                     ↓
           Current JS finishes
                     │
                     ↓
             nextTick queue
                     │
                     ↓
        Promise / queueMicrotask
                     │
                     ↓
              Event Loop
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
    timers          poll          check
 setTimeout        I/O       setImmediate
       │             │             │
       └─────────────┴─────────────┘
                     ↓
             callback executes
                     ↓
         check nextTick/microtasks
                     ↓
                 repeat
\`\`\`


## جدول الربط النهائي

| الشيء | أين يذهب؟ | متى يعمل ذهنيًا؟ |
|---|---|---|
| synchronous code | Call Stack | الآن |
| process.nextTick | nextTick queue | بعد current code وقبل microtasks المعتادة |
| Promise.then | Microtask queue | بعد nextTick في السياقات المعتادة |
| queueMicrotask | Microtask queue | نفس طبقة Promise |
| code after await | Microtask | عندما تتحقق Promise |
| setTimeout | timers | عندما تسمح timer rules |
| I/O callback | poll / I/O processing | عندما تصبح العملية جاهزة |
| setImmediate | check | بعد poll/check flow |
| heavy JS callback | Main Thread | تحجز التنفيذ أثناء تشغيلها |
| recursive nextTick | nextTick queue | قد تسبب Starvation |
| recursive Promise | Microtask queue | قد تسبب Starvation |


## أهم 7 قواعد للمراجعة

1. synchronous code يكتمل أولًا.
2. nextTick لا تقاطع الكود الحالي.
3. Promise callbacks وqueueMicrotask هي Microtasks.
4. في CommonJS والسياقات المعتادة: nextTick قبل Promise microtasks.
5. setTimeout وsetImmediate جزء من Event Loop وليسا Microtasks.
6. داخل I/O callback غالبًا setImmediate يسبق setTimeout(0).
7. لا تحفظ output فقط؛ صنّف كل callback إلى queue/phase أولًا.


## ملاحظة متقدمة مهمة

في top-level **ES Modules** قد ترى ترتيبًا مختلفًا بين \`process.nextTick()\` وPromise microtasks لأن تقييم ESM نفسه يدخل في microtask machinery.

لذلك لا تحفظ جملة مطلقة مثل:

\`\`\`text
nextTick ALWAYS before Promise
\`\`\`

الأصح:

> في CommonJS والسياقات المعتادة داخل callbacks، nextTick لها أولوية خاصة قبل Promise microtasks، لكن السياق مهم.


## أسئلة مراجعة

1. لماذا synchronous code يعمل قبل callbacks المجدولة؟
2. ما هي Microtask؟
3. ما الفرق بين nextTick queue وMicrotask queue؟
4. لماذا nextTick لا تقاطع الكود الحالي؟
5. ما الفرق بين process.nextTick وqueueMicrotask؟
6. كيف تسبب nextTick Starvation؟
7. هل Promise أو async/await تنشئ Thread؟
8. أين يذهب setTimeout؟
9. أين يذهب setImmediate؟
10. لماذا لا نعتمد على ترتيب setTimeout(0) وsetImmediate في top-level؟
11. لماذا setImmediate غالبًا يسبق timer داخل I/O callback؟
12. ماذا يحدث للكود بعد await؟
13. كيف تحل أي سؤال Ordering خطوة بخطوة؟
14. ما الفرق بين I/O-bound وCPU-bound؟
15. لماذا قد يختلف top-level ESM عن CommonJS؟
`};
