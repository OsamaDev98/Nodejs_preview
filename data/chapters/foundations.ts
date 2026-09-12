import type { StudyChapter } from "@/types/study";

export const foundationsChapter: StudyChapter = {
  id: "foundations",
  number: 1,
  title: "أساسيات Node.js وبيئة التشغيل",
  subtitle: "من معنى Runtime وحتى V8 وBrowser APIs وGlobal Object وREPL.",
  readingTime: "35 دقيقة",
  keywords: ["Node.js", "Runtime", "V8", "REPL", "Browser", "globalThis", "Cross-platform"],
  content: String.raw`
# 1. ما هو Node.js؟

أهم تعريف يجب تثبيته:

> Node.js هو JavaScript Runtime Environment يسمح لك بتشغيل JavaScript خارج المتصفح.

يعني Node.js ليس لغة برمجة جديدة، وليس Framework، وليس مكتبة JavaScript، وليس Backend Framework. هو **بيئة تشغيل Runtime**.

قبل ظهور Node.js كان الاستخدام الأساسي لـ JavaScript داخل المتصفح. المتصفح يحتوي على JavaScript Engine يقوم بتنفيذ الكود، وChrome مثلًا يستخدم **V8 Engine**. Node.js أخذ محرك V8 وأضاف حوله مجموعة كبيرة من الإمكانيات التي يحتاجها البرنامج خارج المتصفح.

\`\`\`text
JavaScript Code
       ↓
    Node.js
       ↓
 ┌───────────────┐
 │ V8 Engine     │
 │ Node APIs     │
 │ libuv         │
 │ C / C++       │
 │ OS APIs       │
 └───────────────┘
       ↓
Operating System
\`\`\`

وهذا هو السبب في أننا نستطيع باستخدام Node.js التعامل مع Files وServers وNetwork وProcesses وOperating System وDatabases وStreams وSockets وغيرها.

## 2. Node.js مفتوح المصدر Open Source

الكود المصدري الخاص بـ Node.js متاح للعامة. يمكن للمطورين مشاهدة الكود، دراسة طريقة عمل Node، الإبلاغ عن Bugs، المساهمة في تطوير المشروع، وإرسال Pull Requests. المشروع نفسه ضخم ومكتوب باستخدام عدة لغات أهمها JavaScript وC++ وC.

## 3. Node.js Cross-platform

Node.js يعمل على Windows وLinux وmacOS. نفس تطبيق Node.js يمكن تشغيله على أكثر من نظام تشغيل مع تغييرات قليلة جدًا أو بدون تغييرات.

\`\`\`js
console.log("Hello Node");
\`\`\`

تشغيله:

\`\`\`bash
node app.js
\`\`\`

لكن بعض التفاصيل المتعلقة بنظام التشغيل قد تختلف، مثل File paths وEnvironment variables وPermissions وProcess signals. لذلك يوفر Node APIs تساعدك على التعامل مع الاختلافات.

\`\`\`js
const os = require("node:os");
console.log(os.platform());
\`\`\`

قد تكون النتيجة \`win32\` أو \`linux\` أو \`darwin\`.

## 4. JavaScript Runtime Environment

Runtime يعني البيئة التي يتم داخلها تنفيذ البرنامج أثناء التشغيل.

\`\`\`text
JavaScript
   ↓
Browser Runtime
\`\`\`

وفي Node:

\`\`\`text
JavaScript
   ↓
Node.js Runtime
\`\`\`

القاعدة المهمة:

\`\`\`text
JavaScript ≠ Browser
JavaScript ≠ Node.js
\`\`\`

JavaScript لغة. Browser وNode.js بيئات تشغيل للغة.

## 5. Node.js وV8

V8 هو JavaScript Engine تم تطويره أساسًا بواسطة Google ويستخدم في Chrome وكذلك Node.js.

\`\`\`text
JavaScript Code
      ↓
     V8
      ↓
Machine Code
      ↓
CPU
\`\`\`

V8 مسؤول عن Parsing وCompilation وExecution وMemory Management وGarbage Collection وOptimization. لكن Node.js ليس V8 فقط.

\`\`\`text
              Node.js
                 │
      ┌──────────┼──────────┐
      ↓          ↓          ↓
     V8        libuv      Node APIs
      │          │
JavaScript     Async
 Engine         I/O
\`\`\`

## 6. لماذا Node.js يحتاج C++؟

JavaScript لا توفر بنفسها APIs مباشرة للتعامل مع File System وNetwork sockets وOperating System وProcesses وNative system calls. مثلًا JavaScript كلغة لا يوجد فيها شيء اسمه \`readFile()\`. Node.js هو الذي يوفر \`fs.readFile()\`.

\`\`\`text
JavaScript
    ↓
Node API
    ↓
C/C++ bindings
    ↓
libuv / OS APIs
    ↓
Operating System
\`\`\`

\`\`\`js
const fs = require("node:fs");

fs.readFile("data.txt", "utf8", (err, data) => {
  console.log(data);
});
\`\`\`

أنت تكتب JavaScript، لكن العمليات الفعلية الخاصة بالـ File System تتم بالتعاون مع الطبقات الداخلية لـ Node ونظام التشغيل.

## 7. تشغيل Node.js من Terminal

بعد تثبيت Node اكتب:

\`\`\`bash
node
\`\`\`

فتدخل إلى Node.js REPL.

\`\`\`text
> 1 + 1
2
\`\`\`

أو:

\`\`\`text
> const name = "Osama"
undefined
> name
'Osama'
\`\`\`

## 8. ما هو Node REPL؟

REPL اختصار:

- R = Read
- E = Evaluate
- P = Print
- L = Loop

Node يقرأ ما كتبته، ينفذه، يطبع الناتج، ثم يعود وينتظر أمرًا جديدًا.

\`\`\`text
Read
 ↓
Evaluate
 ↓
Print
 ↓
Loop
 ↓
Read
 ↓
...
\`\`\`

REPL مفيد في تجربة JavaScript بسرعة، اختبار Functions، تجربة Node APIs، Debugging بسيط، وتعلم اللغة.

## 9. بعض أوامر REPL المهمة

\`\`\`text
.help
.exit
.clear
.save
.load
\`\`\`

للخروج يمكنك استخدام \`.exit\` أو Ctrl+C مرتين.

## 10. تشغيل JavaScript File باستخدام Node

أنشئ ملفًا باسم \`app.js\`:

\`\`\`js
console.log("Hello from Node.js");
\`\`\`

ثم:

\`\`\`bash
node app.js
\`\`\`

أو:

\`\`\`bash
node ./app.js
\`\`\`

## 11. Browser JavaScript vs Node.js

المتصفح وNode يشغلان JavaScript، لكن البيئة المحيطة مختلفة.

في Browser توجد APIs مثل:

\`\`\`js
window
document
localStorage
navigator
location
\`\`\`

لكن في Node عادة لن تجد \`document\`:

\`\`\`js
console.log(document);
\`\`\`

فتظهر:

\`\`\`text
ReferenceError: document is not defined
\`\`\`

لأن \`document\` جزء من DOM API وليس جزءًا من JavaScript نفسها.

في المقابل Node لديه APIs مثل:

\`\`\`js
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
\`\`\`

\`\`\`text
JavaScript
   │
   ├── Browser
   │     ├── DOM
   │     ├── window
   │     ├── document
   │     └── Browser APIs
   │
   └── Node.js
         ├── fs
         ├── path
         ├── http
         ├── process
         └── Node APIs
\`\`\`

## 12. الـ Global Object في Node.js

في JavaScript يوجد مفهوم Global Object. الطريقة الحديثة والآمنة للوصول له هي:

\`\`\`js
globalThis
\`\`\`

في Node يوجد أيضًا:

\`\`\`js
global
\`\`\`

لكن الاستخدام الحديث المفضل عند الحاجة إلى global object هو \`globalThis\` لأنه يعمل في بيئات JavaScript المختلفة.

## 13. Browser Global Object

في المتصفح غالبًا \`window\` هو الـ Global Object التقليدي. وفي Node يوجد \`global\`. الشكل الحديث المشترك هو \`globalThis\`.

\`\`\`text
            JavaScript
                │
           globalThis
           /          \
      Browser        Node.js
        │               │
      window           global
\`\`\`

## 14. ماذا عن this؟

لا تعتمد على \`this\` على أنه دائمًا Global Object، لأن قيمته تختلف حسب مكان التنفيذ، نوع الـ Module، Strict mode، وطريقة استدعاء Function.

في CommonJS module:

\`\`\`js
console.log(this);
\`\`\`

لن يكون بالضرورة \`global\` بل غالبًا يشير إلى \`module.exports\`. إذا كنت تريد Global Object استخدم \`globalThis\`.

## 15. Mental Model مهم جدًا

بدل ما تحفظ أن Node "يشغل JavaScript خارج المتصفح" فقط، تخيله هكذا:

\`\`\`text
                    Node.js
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ↓             ↓             ↓
       V8          Node APIs      libuv
        │             │             │
        ↓             ↓             ↓
      JavaScript   fs/http/...   Async I/O
        │                           │
        └────────────┬──────────────┘
                     ↓
               Operating System
\`\`\`

وهذا Mental Model سيصبح مهمًا جدًا عندما تدخل في Event Loop وAsync I/O وStreams وBuffers وProcesses وWorker Threads وNetworking.

## 16. نقاط تصحيح مهمة

بدل أن تقول:

\`\`\`text
Node.js = V8
\`\`\`

قل:

\`\`\`text
Node.js uses V8
\`\`\`

وبدل:

\`\`\`text
Node.js is JavaScript
\`\`\`

قل:

\`\`\`text
JavaScript = Language
Node.js = Runtime Environment
\`\`\`

ولا تعتمد على \`this\` للوصول إلى Global Object؛ استخدم \`globalThis\`.

## أسئلة مراجعة

1. ما الفرق بين JavaScript وNode.js؟
2. ما معنى Runtime Environment؟
3. ما وظيفة V8؟
4. هل Node.js هو V8 فقط؟
5. لماذا يحتاج Node إلى C/C++؟
6. ما معنى Cross-platform؟
7. ما هو REPL؟
8. كيف تشغل ملف JavaScript باستخدام Node؟
9. ما الفرق بين Browser APIs وNode APIs؟
10. لماذا \`document\` غير موجود عادة في Node؟
11. ما هو \`globalThis\`؟
`};
