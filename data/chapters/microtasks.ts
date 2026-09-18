import type { StudyChapter } from "@/types/study";

export const microtasksChapter: StudyChapter = {
  id: "microtasks",
  number: 7,
  title: "Microtasks وnextTick وترتيب التنفيذ",
  subtitle: "Promises، queueMicrotask، setImmediate، starvation والـ ordering الحقيقي.",
  readingTime: "55 دقيقة",
  keywords: ["process.nextTick", "Promise", "queueMicrotask", "setImmediate", "starvation", "ordering"],
  content: String.raw`
# قبل أن تبدأ: Mental Design للدرس كله

بعد أن فهمت Event Loop، هذا الدرس يضيف سؤالًا جديدًا: **إذا كان عندي أكثر من callback جاهزة، من له الأولوية؟**

\`\`\`text
Current JavaScript finishes
        ↓
process.nextTick queue
        ↓
Promise / queueMicrotask microtasks
        ↓
Event Loop continues
timers / poll / check ...
\`\`\`

هذا ترتيب ذهني مبسط للسياقات المعتادة في Node، وليس قانونًا مطلقًا لكل top-level ESM scenario. الهدف هو فهم priority وليس حفظ output بلا سياق.


# 127. Microtasks

لفهم ترتيب التنفيذ في Node لا يكفي أن تحفظ phases الخاصة بـ Event Loop. يوجد أيضًا Microtasks، كما أن \`process.nextTick()\` له queue وسلوك خاص في Node.

من أشهر microtasks:

\`\`\`text
Promise.then()
Promise.catch()
Promise.finally()
queueMicrotask()
\`\`\`

وفي Node يوجد أيضًا:

\`\`\`text
process.nextTick()
\`\`\`

والأدق أن Node تفرق بين nextTick queue وmicrotask queue.

# 128. process.nextTick()

مثال:

\`\`\`js
console.log("A");

process.nextTick(() => {
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

callback لا تعمل داخل نفس synchronous stack، لكنها تعمل بعد انتهاء current synchronous code وقبل الانتقال الطبيعي لأعمال event loop الأخرى.

# 129. Promise Microtask

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

لأن \`.then()\` microtask.

# 130. process.nextTick vs Promise

في Node، \`process.nextTick()\` له أولوية خاصة غالبًا أعلى من Promise microtasks في سياقات التنفيذ المعتادة.

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

# 131. ترتيب التنفيذ المبسط

كموديل دراسي جيد:

\`\`\`text
1. Current synchronous code
2. process.nextTick queue
3. Promise / microtasks
4. Event loop phases
\`\`\`

وبعد callbacks يمكن تصريف microtasks مرة أخرى قبل الانتقال للعمل التالي، لذلك الترتيب الكامل أكثر تفصيلًا من مجرد أربع خطوات ثابتة.

# 132. مثال جامع

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

غالبًا:

\`\`\`text
1
5
4
3
2
\`\`\`

الشرح:

- 1 و5 synchronous.
- 4 من nextTick queue.
- 3 Promise microtask.
- 2 timer.

# 133. queueMicrotask()

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

\`queueMicrotask\` طريقة مباشرة لجدولة microtask.

# 134. nextTick vs queueMicrotask

\`process.nextTick()\` له semantics خاصة بـ Node. \`queueMicrotask()\` أقرب إلى JavaScript/Web-standard microtask semantics.

إذا لم تكن تحتاج behavior خاصًا بـ Node، فقد تكون \`queueMicrotask\` أوضح في بعض الحالات.

# 135. Event Loop Starvation

يمكن أن تسبب recursive nextTick starvation:

\`\`\`js
function loop() {
  process.nextTick(loop);
}

loop();
\`\`\`

هذه الحلقة قد تمنع Event Loop من الوصول إلى Timers وI/O وsetImmediate لأن nextTick queue تتجدد باستمرار.

ويمكن أن يحدث concept مشابه مع Promises:

\`\`\`js
function loop() {
  Promise.resolve().then(loop);
}

loop();
\`\`\`

إنتاج microtasks بلا نهاية قد يمنع Event Loop من التقدم بصورة طبيعية.

# 136. Macro Tasks vs Microtasks

في شروحات JavaScript قد تسمع مصطلحي Macrotask وMicrotask. لكن في Node من الأفضل ألا تختزل runtime إلى "macro queue واحدة + micro queue واحدة"، لأن Node لديها phases متعددة.

كمفهوم:

- Promise callbacks و\`queueMicrotask\` = microtasks.
- \`process.nextTick\` = queue خاصة ذات أولوية مميزة في Node.
- timers وI/O callbacks و\`setImmediate\` تدخل في Event Loop phases المختلفة.

# 137. setImmediate متى نستخدمه؟

إذا كنت داخل I/O callback وتريد تأجيل جزء من التنفيذ للـ check phase:

\`\`\`js
fs.readFile("file.txt", () => {
  setImmediate(() => {
    console.log("after I/O");
  });
});
\`\`\`

\`setImmediate\` ليست بديلًا دائمًا لـ \`setTimeout\`، وكل واحدة لها semantics مختلفة.

# 138. setTimeout(0) لا يعني 0 فعليًا

حتى لو كتبت:

\`\`\`js
setTimeout(fn, 0);
\`\`\`

المعنى ليس execute immediately. هناك minimum scheduling behavior وevent loop overhead. المعنى الأقرب: schedule as soon as timer rules allow.

# 139. مثال كامل لترتيب التنفيذ

\`\`\`js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

setImmediate(() => {
  console.log("C");
});

process.nextTick(() => {
  console.log("D");
});

Promise.resolve().then(() => {
  console.log("E");
});

console.log("F");
\`\`\`

المؤكد أولًا:

\`\`\`text
A
F
D
E
\`\`\`

أما ترتيب \`B\` و\`C\` في top-level فلا تعتمد عليه بشكل ثابت.

# 140. مثال داخل fs.readFile

\`\`\`js
const fs = require("node:fs");

fs.readFile("file.txt", () => {
  console.log("I/O");

  setTimeout(() => {
    console.log("timeout");
  }, 0);

  setImmediate(() => {
    console.log("immediate");
  });

  process.nextTick(() => {
    console.log("nextTick");
  });

  Promise.resolve().then(() => {
    console.log("promise");
  });
});
\`\`\`

الترتيب المتوقع داخل callback غالبًا:

\`\`\`text
I/O
nextTick
promise
immediate
timeout
\`\`\`

هذا مثال مهم جدًا لفهم الأولويات.

# 141. لماذا Microtasks تنفذ بسرعة؟

runtime تقوم بتصريفها بعد انتهاء synchronous callback الحالي قبل الاستمرار إلى أعمال event loop التالية.

\`\`\`text
callback executes
↓
callback ends
↓
nextTick / microtasks
↓
event loop continues
\`\`\`

# 142. FIFO لا تعني أن كل Node FIFO واحدة

داخل queue واحدة، الترتيب غالبًا FIFO: First In, First Out. لكن وجود عدة queues/phases يجعل global execution order غير قابل للتعبير عنه كـ FIFO واحدة فقط.

# 143. Long-running Callback

حتى callback جاءت من async API يمكنها حجز main thread لو هي نفسها تعمل CPU-heavy JavaScript.

\`\`\`js
setTimeout(() => {
  const start = Date.now();
  while (Date.now() - start < 5000) {}
}, 0);
\`\`\`

خلال خمس ثوانٍ لا تستطيع JavaScript callback أخرى التنفيذ على main thread.

# 144. أهم Rule في Node Backend

> Keep the event loop free.

تجنب على main thread داخل request handlers:

- Huge loops.
- Heavy JSON processing.
- Large compression in JavaScript.
- CPU-intensive transforms.
- Synchronous filesystem calls.
- Synchronous crypto.

مثال سيئ:

\`\`\`js
app.get("/users", (req, res) => {
  const data = fs.readFileSync("./huge-users.json", "utf8");
  res.send(data);
});
\`\`\`

مثال أفضل من ناحية blocking:

\`\`\`js
app.get("/users", async (req, res) => {
  const data = await fs.promises.readFile(
    "./huge-users.json",
    "utf8"
  );

  res.send(data);
});
\`\`\`

لكن لو الملف ضخم جدًا قد يكون Stream أفضل من تحميل الملف كاملًا في الذاكرة.

# 145. I/O-bound vs CPU-bound

**I/O-bound**: معظم الوقت Waiting.

\`\`\`text
Database
Network
Disk
HTTP API
\`\`\`

Node ممتازة في هذا النوع.

**CPU-bound**: معظم الوقت Computing.

\`\`\`text
Image encoding
Video processing
Huge loops
Cryptographic computation
Machine learning
Large transforms
\`\`\`

هذه تحتاج worker strategy أو service منفصل أو native solution حسب الحالة.

# 146. كيف تحدد CPU-bound؟

إذا كانت العملية تستهلك processor باستمرار فهي CPU-bound.

\`\`\`js
for (let i = 0; i < 1e10; i++) {
  Math.sqrt(i);
}
\`\`\`

أما:

\`\`\`js
await fetch("https://api.example.com");
\`\`\`

فغالبًا I/O-bound.

# 147. async/await مع Event Loop

\`\`\`js
async function getData() {
  console.log("A");
  const data = await fetchSomething();
  console.log("B");
}
\`\`\`

قبل \`await\` الكود synchronous. عند \`await\` تتوقف الـ async function منطقيًا لكن main thread لا تُحجز. عندما تتحقق Promise، continuation تصبح microtask وتنفذ لاحقًا.

النموذج العقلي:

\`\`\`js
const value = await promise;
console.log(value);
\`\`\`

قريب مفاهيميًا من:

\`\`\`js
promise.then((value) => {
  console.log(value);
});
\`\`\`

ليس مطابقًا حرفيًا في كل التفاصيل، لكنه mental model جيد.

# 148. مثال async/await ordering

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

الناتج:

\`\`\`text
C
A
D
B
\`\`\`

لأن الجزء بعد \`await\` يكمل في microtask.

## كيف تربط أجزاء الدرس معًا؟

| المفهوم | دوره في Scheduling |
|---|---|
| Synchronous code | يعمل أولًا حتى يفرغ الـ stack |
| process.nextTick | queue خاصة بـ Node ذات أولوية عالية |
| Promise microtasks | then/catch/finally وawait continuation |
| queueMicrotask | جدولة microtask مباشرة |
| Timers | Event Loop work وليست microtask |
| setImmediate | check phase |
| Starvation | priority work يمنع Event Loop من التقدم |
| async/await | Promise-based scheduling وليس threads |

> فكر في الدرس كطبقات أولوية: **Current Stack → nextTick → Microtasks → Event Loop phases** مع الانتباه لاختلاف السياق.


## أسئلة مراجعة

1. ما هي Microtasks؟
2. ما هو \`process.nextTick()\`؟
3. أيهما غالبًا له أولوية: nextTick أم Promise؟
4. ما معنى Event Loop Starvation؟
5. هل Promise تنشئ Thread؟
6. هل async/await تنشئ Thread؟
7. ما الفرق بين \`setImmediate\` و\`setTimeout(0)\`؟
8. لماذا لا تعتمد على ترتيبهما في top-level؟
9. لماذا \`setImmediate\` غالبًا يسبق timer داخل I/O callback؟
10. ما الفرق بين I/O-bound وCPU-bound؟
11. لماذا async لا تعني Efficient دائمًا؟
`};
