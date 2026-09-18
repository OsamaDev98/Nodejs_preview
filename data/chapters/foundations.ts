import type { StudyChapter } from "@/types/study";

export const foundationsChapter: StudyChapter = {
  id: "foundations",
  number: 1,
  title: "أساسيات Node.js وبيئة التشغيل",
  subtitle: "من معنى Runtime وحتى V8 وBrowser APIs وGlobal Object وREPL.",
  readingTime: "41 دقيقة",
  keywords: ["Node.js", "Runtime", "V8", "REPL", "Browser", "globalThis", "Cross-platform", "libuv", "Node APIs"],
  content: String.raw`
# قبل أن تبدأ: Mental Design للدرس كله

هذا الدرس يجيب عن سؤال واحد: **ما هي Node.js، وما الذي يحدث لكود JavaScript عندما يعمل خارج المتصفح؟**

\`\`\`text
JavaScript Language
       ↓
Node.js Runtime
       │
       ├── V8 → executes JavaScript
       ├── Node APIs → fs / http / process / path ...
       ├── libuv → async I/O / Event Loop / Thread Pool
       └── C/C++ + OS → real system capabilities
\`\`\`

كل جزء في الدرس يرجع لهذا الرسم: Runtime تشرح أين يعمل الكود، V8 تشرح من ينفذه، Node APIs تشرح ما الإمكانيات الإضافية، وBrowser vs Node يشرح لماذا بعض APIs موجودة هنا وغير موجودة هناك.


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

### ماذا يحدث للكود داخل V8؟

عندما تكتب JavaScript، لا ينتقل الكود مباشرة إلى CPU. يمر بعدة مراحل داخل JavaScript Engine. استخدم هذا الـ mental model:

\`\`\`text
You write JavaScript
        ↓
Parsing
"Understand the code"
        ↓
Compilation
"Convert it to executable instructions"
        ↓
Execution
"Run it"
        ↓
Memory Management
"Store the data it needs"
        ↓
Garbage Collection
"Remove data no longer needed"
        ↓
Optimization
"Make frequently executed code faster"
\`\`\`

وهذه المراحل ليست دائمًا خطًا زمنيًا منفصلًا يحدث مرة واحدة فقط؛ أثناء تشغيل البرنامج يمكن أن يحدث تخصيص Memory وGarbage Collection وOptimization مرات كثيرة. الرسم هدفه أن يعطيك الصورة الذهنية الأساسية.

### Parsing — فهم بنية الكود

Parsing يعني أن V8 يقرأ Source Code ويتأكد من أن تركيب JavaScript مفهوم نحويًا، ثم يحوله إلى تمثيل داخلي يستطيع الـ engine التعامل معه.

مثلًا:

\`\`\`js
const x = 10 + 20;
console.log(x);
\`\`\`

V8 لا يتعامل معه كنص عادي فقط. يجب أن يفهم أن هناك variable declaration وexpression وfunction call.

Mental model مبسط:

\`\`\`text
JavaScript Source Code
        ↓
Tokenizer / Parser
        ↓
Internal Representation / AST-like structure
\`\`\`

إذا كان هناك Syntax Error، تتوقف العملية قبل التنفيذ الطبيعي:

\`\`\`js
const x = ;
\`\`\`

### Compilation — تحويل الكود إلى تعليمات قابلة للتنفيذ

بعد أن يفهم V8 بنية الكود، يحتاج إلى تحويله إلى شكل يمكن تنفيذه بكفاءة. V8 يستخدم عدة طبقات وتقنيات داخلية، لكن كمبتدئ يكفي أن تفهم:

\`\`\`text
JavaScript
   ↓
V8 Compiler / Interpreter pipeline
   ↓
Executable instructions
\`\`\`

لا تحفظ أن JavaScript مجرد "interpreted language" فقط؛ محركات JavaScript الحديثة مثل V8 تستخدم compilation وJIT optimization أثناء التشغيل.

### Execution — تشغيل التعليمات

بعد تجهيز التعليمات يبدأ V8 في تنفيذ البرنامج.

\`\`\`js
const a = 5;
const b = 7;
console.log(a + b);
\`\`\`

النتيجة:

\`\`\`text
12
\`\`\`

أثناء التنفيذ تدخل Functions إلى Call Stack وتخرج منها بعد الانتهاء.

\`\`\`text
Function call
    ↓
Call Stack
    ↓
Execute instructions
    ↓
Return result
\`\`\`

### Memory Management — أين تذهب البيانات؟

البرنامج يحتاج Memory لتخزين القيم والـ objects والـ functions والبيانات المؤقتة.

\`\`\`js
const user = {
  name: "Osama",
  age: 28,
};
\`\`\`

الـ object يحتاج مساحة في Memory أثناء استخدام البرنامج له.

V8 يدير الذاكرة تلقائيًا بدل أن تطلب أنت يدويًا مساحة لكل object ثم تحررها بنفسك كما يحدث في بعض اللغات منخفضة المستوى.

Mental model:

\`\`\`text
Create value / object
        ↓
Allocate Memory
        ↓
Use the data
\`\`\`

### Garbage Collection — تنظيف البيانات غير المستخدمة

مع الوقت قد تنشئ Objects لم تعد هناك حاجة إليها. V8 يحتوي Garbage Collector يحدد الذاكرة التي لم يعد البرنامج يستطيع الوصول إليها ويستعيدها لاستخدامات أخرى.

مثال مفاهيمي:

\`\`\`js
let user = { name: "Osama" };
user = null;
\`\`\`

بعد إزالة المرجع إلى الـ object، قد يصبح object القديم غير قابل للوصول، وبالتالي يمكن للـ Garbage Collector تنظيفه لاحقًا.

الفكرة:

\`\`\`text
Object exists
    ↓
No reachable references
    ↓
Garbage Collector detects it
    ↓
Memory can be reclaimed
\`\`\`

المهم: لا تفهم Garbage Collection على أنها تعمل فورًا بمجرد كتابة \`user = null\`. الـ engine يقرر متى وكيف ينفذ GC وفق استراتيجيته.

### Optimization — جعل الكود المتكرر أسرع

V8 يراقب التنفيذ. إذا وجد Code Path أو Function يتم تشغيلها كثيرًا، يمكن أن يحاول تحسينها باستخدام JIT optimization حتى تعمل أسرع.

مثال:

\`\`\`js
function add(a, b) {
  return a + b;
}

for (let i = 0; i < 1_000_000; i++) {
  add(i, i + 1);
}
\`\`\`

الفكرة المبسطة:

\`\`\`text
Code runs
   ↓
V8 observes behavior
   ↓
Frequently executed code becomes "hot"
   ↓
V8 may optimize it
   ↓
Faster execution
\`\`\`

وفي بعض الحالات، إذا تغيرت assumptions التي اعتمد عليها optimization، يمكن أن يحدث deoptimization ثم يعيد V8 اختيار طريقة تنفيذ مناسبة.

إذن الصورة الكاملة التي يجب أن تثبت عندك:

\`\`\`text
JavaScript Source Code
        ↓
Parsing
        ↓
Compilation / JIT pipeline
        ↓
Execution
        ↓
Memory Allocation
        ↓
Garbage Collection when needed
        ↓
Optimization / Deoptimization during runtime
\`\`\`

### الصورة الكاملة: Node.js ليس V8 فقط

المخطط التالي يجمع أهم الأجزاء التي تحدثنا عنها في صورة واحدة:

\`\`\`text
Your JavaScript Code
        ↓
      Node.js
 ┌───────────────────────┐
 │          V8           │
 │ Parsing               │
 │ Compilation / JIT     │
 │ Execution             │
 │ Memory / Heap         │
 │ Garbage Collection    │
 │ Optimization          │
 └───────────────────────┘
        +
 ┌───────────────────────┐
 │        libuv          │
 │ Event Loop            │
 │ Thread Pool           │
 │ Async I/O             │
 │ File System*          │
 │ Networking*           │
 └───────────────────────┘
        +
 ┌───────────────────────┐
 │ Node.js APIs / C++    │
 │ fs, http, net, crypto │
 │ timers, streams ...   │
 └───────────────────────┘
        ↓
 Operating System
\`\`\`

هذا الرسم ممتاز كـ **Mental Model**، لكن يوجد تصحيح مهم حتى لا يتحول التبسيط إلى معلومة خاطئة:

- **V8** يشغّل JavaScript ويدير الـ Heap والـ Garbage Collection والـ JIT Optimization.
- **libuv** يوفر Event Loop وThread Pool وطبقة cross-platform للتعامل مع asynchronous I/O.
- **File System** في Node يرتبط غالبًا بـ libuv Thread Pool في الـ async filesystem APIs.
- **Networking** لا يعني أن libuv Thread Pool ينفذ كل network request؛ أغلب socket/network I/O تعتمد على آليات الـ OS مثل epoll أو kqueue أو IOCP، بينما libuv تنسق معها عبر Event Loop.
- **Node.js APIs** مثل \`fs\`, \`http\`, \`net\`, \`crypto\`, timers وstreams هي الواجهة التي تتعامل معها أنت من JavaScript، وتحتها توجد JavaScript implementations وC/C++ bindings وlibuv وOS APIs حسب العملية.

يمكنك التفكير في المسؤوليات بهذا الشكل:

| الجزء | مسؤوليته الأساسية |
|---|---|
| V8 | تنفيذ JavaScript وإدارة الذاكرة والـ GC والـ JIT |
| libuv | Event Loop وAsync I/O وThread Pool وOS abstraction |
| Node APIs | الواجهة البرمجية التي تستخدمها: fs/http/net/crypto/streams/timers |
| C/C++ bindings | الربط بين JavaScript والطبقات native عندما تحتاج العملية لذلك |
| Operating System | الملفات، sockets، الشبكة، system calls والموارد الحقيقية |

ومثال عملي يربط الطبقات:

\`\`\`js
const fs = require("node:fs");

fs.readFile("users.json", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});
\`\`\`

النموذج المبسط:

\`\`\`text
Your JavaScript
      ↓
Node fs API
      ↓
Node internals / native bindings
      ↓
libuv
      ↓
Thread Pool + Operating System
      ↓
File read completes
      ↓
Event Loop
      ↓
Your callback
      ↓
V8 executes callback JavaScript
\`\`\`

أما في HTTP/networking فالصورة تختلف قليلًا:

\`\`\`text
Your JavaScript
      ↓
http / net API
      ↓
Node + libuv
      ↓
Operating System networking mechanisms
      ↓
Network event becomes ready
      ↓
Event Loop
      ↓
JavaScript callback
      ↓
V8 executes it
\`\`\`

إذن الجملة التي يجب تثبيتها:

> V8 يشغّل JavaScript، libuv تساعد Node على إدارة الـ asynchronous I/O والـ Event Loop، وNode APIs تربط كودك بهذه الإمكانيات وبنظام التشغيل.

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

## كيف تربط أجزاء الدرس معًا؟

| الفكرة | دورها في الصورة الكبيرة |
|---|---|
| JavaScript | اللغة التي تكتب بها الكود |
| Runtime | البيئة التي تشغّل اللغة وتوفر APIs |
| V8 | Parsing + JIT + Execution + Memory + GC |
| Node APIs | الإمكانيات التي لا توفرها JavaScript وحدها |
| libuv | تنسيق async I/O وEvent Loop |
| C/C++ bindings | ربط JavaScript بالطبقات native |
| Operating System | الملفات والشبكة والـ processes والموارد الحقيقية |
| Browser APIs | APIs خاصة بالمتصفح مثل DOM |
| globalThis | الوصول القياسي إلى global object |
| REPL | تجربة JavaScript وNode APIs مباشرة |

> لو فهمت الفرق بين **Language → Runtime → Engine → APIs → OS** فأنت فهمت أساس Node.js الذي ستبني عليه بقية الدروس.


## أسئلة مراجعة

1. ما الفرق بين JavaScript وNode.js؟
2. ما معنى Runtime Environment؟
3. ما وظيفة V8؟
4. ما المقصود بـ Parsing داخل V8؟
5. لماذا نقول إن V8 يستخدم Compilation وJIT بدل وصف JavaScript بأنها interpreted فقط؟
6. ماذا يحدث أثناء Execution؟
7. ما المقصود بـ Memory Management؟
8. ما وظيفة Garbage Collector؟ وهل يعمل فورًا عند إزالة reference؟
9. ما معنى Optimization وDeoptimization داخل V8؟
10. ما الفرق بين مسؤولية V8 ومسؤولية libuv؟
11. ما دور Node.js APIs وC++ bindings؟
12. هل Network I/O تستخدم Thread Pool لكل request؟
13. هل Node.js هو V8 فقط؟
14. لماذا يحتاج Node إلى C/C++؟
15. ما معنى Cross-platform؟
16. ما هو REPL؟
17. كيف تشغل ملف JavaScript باستخدام Node؟
18. ما الفرق بين Browser APIs وNode APIs؟
19. لماذا \`document\` غير موجود عادة في Node؟
20. ما هو \`globalThis\`؟
`};
