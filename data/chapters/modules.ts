import type { StudyChapter } from "@/types/study";

export const modulesChapter: StudyChapter = {
  id: "modules",
  number: 2,
  title: "Modules وCommonJS وESM",
  subtitle: "تنظيم الكود، أنواع الـ modules، الـ wrapper، الـ cache والـ internal bindings.",
  readingTime: "45 دقيقة",
  keywords: ["Modules", "CommonJS", "ESM", "require", "module.exports", "cache", "wrapper"],
  content: String.raw`
# قبل أن تبدأ: Mental Design للدرس كله

هذا الدرس يشرح كيف ينتقل مشروع Node من ملف واحد إلى تطبيق مكوّن من أجزاء مترابطة.

\`\`\`text
Large Application
      ↓
Split into Modules
      ↓
Export values
      ↓
Import / require them
      ↓
Node resolves file/package
      ↓
Module executes
      ↓
Exports returned
      ↓
Result may be cached
\`\`\`

إذن CommonJS وESM وmodule.exports وrequire وModule Wrapper وCache ليست موضوعات منفصلة؛ كلها مراحل في **Module Lifecycle**.


# 17. Node.js Modules

الـ Module هي وحدة كود مستقلة يمكن إعادة استخدامها. بدل أن يكون التطبيق ملفًا واحدًا فيه آلاف الأسطر نقسمه إلى أجزاء مسؤولية كل جزء واضحة.

\`\`\`text
src/
│
├── app.js
├── logger.js
├── database.js
├── auth.js
├── users.js
└── products.js
\`\`\`

الهدف هو Code organization وReusability وMaintainability وReadability وTesting وSeparation of concerns وScalability.

## 18. لماذا نستخدم Modules؟

مثلًا:

- \`logger.js\` مسؤول عن Logging.
- \`database.js\` مسؤول عن Database.
- \`auth.js\` مسؤول عن Authentication.

هذا يجعل التطبيق أسهل في التعديل والاختبار والتوسعة.

## 19. أنواع Modules في Node.js

تقسيم مناسب للمبتدئ:

1. Built-in Modules.
2. Local / User Defined Modules.
3. NPM / Third-party Modules.

### Built-in Modules

تأتي مع Node.js ولا تحتاج \`npm install\`.

\`\`\`text
fs
path
os
http
https
events
stream
buffer
crypto
url
util
\`\`\`

\`\`\`js
const fs = require("node:fs");
\`\`\`

### node: Prefix

يمكن كتابة:

\`\`\`js
const fs = require("node:fs");
\`\`\`

بدل:

\`\`\`js
const fs = require("fs");
\`\`\`

الاثنان يعملان، لكن \`node:fs\` أوضح لأنه يبين أن الـ module من Node core.

### Local Modules

\`logger.js\`:

\`\`\`js
function log(message) {
  console.log(message);
}

module.exports = log;
\`\`\`

وفي \`app.js\`:

\`\`\`js
const log = require("./logger");
log("Hello");
\`\`\`

الـ \`./\` تعني ابحث في الـ current directory. أما \`require("logger")\` فلها معنى مختلف؛ Node سيبحث عنها كـ package/module وليس كملف محلي بنفس الطريقة.

## 20. CommonJS

النظام التقليدي في Node.js يستخدم:

\`\`\`js
require()
module.exports
\`\`\`

مثال:

\`\`\`js
function add(a, b) {
  return a + b;
}

module.exports = add;
\`\`\`

ثم:

\`\`\`js
const add = require("./math");
console.log(add(2, 3));
\`\`\`

## 21. ECMAScript Modules — ESM

النظام القياسي الحديث يستخدم:

\`\`\`js
import
export
\`\`\`

\`\`\`js
export function add(a, b) {
  return a + b;
}
\`\`\`

ثم:

\`\`\`js
import { add } from "./math.js";
console.log(add(2, 3));
\`\`\`

## 22. CommonJS vs ESM

| CommonJS | ESM |
|---|---|
| \`require()\` | \`import\` |
| \`module.exports\` | \`export\` |
| نظام تقليدي في Node | JavaScript Standard |
| \`.cjs\` ممكن | \`.mjs\` ممكن |
| واسع الاستخدام | المفضل في كثير من المشاريع الحديثة |

كيف يعرف Node النظام؟ من \`package.json\` مثلًا:

\`\`\`json
{
  "type": "module"
}
\`\`\`

يعني ملفات \`.js\` تتعامل عادة كـ ESM. أما \`.cjs\` فهو CommonJS و\`.mjs\` هو ESM بشكل صريح.

## 23. NPM Modules

هي Packages يكتبها مطورون ويتم نشرها في npm Registry مثل:

\`\`\`text
express
dotenv
axios
mongoose
lodash
bcrypt
\`\`\`

\`\`\`bash
npm install express
\`\`\`

ثم CommonJS:

\`\`\`js
const express = require("express");
\`\`\`

أو ESM:

\`\`\`js
import express from "express";
\`\`\`

## 24. الفرق بين Built-in وLocal وNPM

\`\`\`js
const fs = require("node:fs");      // Built-in
const logger = require("./logger"); // Local
const express = require("express"); // npm package
\`\`\`

## 25. Module Wrapper Function

في CommonJS يتعامل Node مع كل module كما لو أنه مغلف داخل Function:

\`\`\`js
(function (exports, require, module, __filename, __dirname) {
  // Your module code
});
\`\`\`

هذا يفسر لماذا تتوفر هذه القيم داخل CommonJS بدون أن تعرفها بنفسك:

\`\`\`text
require
module
exports
__filename
__dirname
\`\`\`

مثال:

\`\`\`js
console.log(__filename);
console.log(__dirname);
\`\`\`

## 26. Module Scope

كل Module لديه Scope خاص به.

\`logger.js\`:

\`\`\`js
const secret = "123456";

function log(message) {
  console.log(message);
}

module.exports = log;
\`\`\`

في \`app.js\` لا تستطيع الوصول مباشرة إلى \`secret\`. وهذا جيد لأنه يمنع تسريب تفاصيل داخلية بين الملفات.

## 27. module.exports

لتصدير شيء من CommonJS:

\`\`\`js
function add(a, b) {
  return a + b;
}

module.exports = add;
\`\`\`

وتستطيع تصدير أكثر من شيء:

\`\`\`js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };
\`\`\`

ثم:

\`\`\`js
const { add, subtract } = require("./math");
\`\`\`

## 28. Module Caching

عندما تكتب:

\`\`\`js
const moduleA = require("./moduleA");
\`\`\`

Node يعمل تقريبًا:

\`\`\`text
Find module
    ↓
Load module
    ↓
Execute module
    ↓
Store result in cache
    ↓
Return exports
\`\`\`

المرة التالية غالبًا يعيد exports الموجودة في cache بدل إعادة تنفيذ الملف من البداية.

### مثال

\`logger.js\`:

\`\`\`js
console.log("logger.js executed");
module.exports = { message: "Hello" };
\`\`\`

\`app.js\`:

\`\`\`js
require("./logger");
require("./logger");
require("./logger");
\`\`\`

غالبًا ستظهر:

\`\`\`text
logger.js executed
\`\`\`

مرة واحدة فقط.

## 29. require.cache

في CommonJS يمكنك رؤية الـ cache:

\`\`\`js
console.log(require.cache);
\`\`\`

النموذج العقلي:

\`\`\`text
require("./logger")
       ↓
Is module cached?
       │
       ├── No → Load → Execute → Cache → Return exports
       └── Yes → Return exports
\`\`\`

## 30. تأثير الـ Cache على State

\`counter.js\`:

\`\`\`js
let count = 0;

function increment() {
  count++;
  return count;
}

module.exports = { increment };
\`\`\`

\`\`\`js
const counter1 = require("./counter");
const counter2 = require("./counter");

console.log(counter1.increment()); // 1
console.log(counter2.increment()); // 2
\`\`\`

السبب أن الاثنين يتعاملان مع نفس module instance المحمل في cache.

## 31. حذف Module من Cache

يمكنك تحديد المسار:

\`\`\`js
const modulePath = require.resolve("./logger");
delete require.cache[modulePath];
\`\`\`

وبعدها \`require("./logger")\` قد يؤدي إلى تحميل module من جديد.

هذه تقنية مفيدة لفهم internals وقد تظهر في Development tooling وTesting وHot reloading وPlugin systems، لكنها ليست طريقة طبيعية لإدارة application state.

## 32. require.resolve()

\`\`\`js
console.log(require.resolve("./logger"));
\`\`\`

يعطي المسار الفعلي الذي سيستخدمه Node للـ module.

## 33. Node Internal Bindings

داخل Node توجد طبقات داخلية تربط JavaScript بأجزاء Native مكتوبة بـ C/C++.

\`\`\`text
JavaScript
      ↓
Node JavaScript APIs
      ↓
Internal bindings
      ↓
C / C++
      ↓
Operating System
\`\`\`

لكن هذه **ليست APIs للمطور العادي**. لا يفترض أن تبني تطبيقك على وظائف داخلية غير موثقة مثل \`internalBinding\` لأنها private implementation details ويمكن أن تتغير.

## 34. ماذا يحدث عند استخدام fs؟

\`\`\`js
const fs = require("node:fs");

fs.readFile("users.json", "utf8", (err, data) => {
  console.log(data);
});
\`\`\`

الصورة المفاهيمية:

\`\`\`text
Your JavaScript
      ↓
fs.readFile()
      ↓
Node.js internal implementation
      ↓
Native bindings
      ↓
libuv / OS
      ↓
File System
\`\`\`

## 35. مثال Backend واقعي

\`\`\`text
project/
│
├── app.js
├── config/
│   └── database.js
├── controllers/
│   └── users.controller.js
├── services/
│   └── users.service.js
├── routes/
│   └── users.routes.js
└── utils/
    └── logger.js
\`\`\`

العلاقة:

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

وهذا يوضح لماذا فهم الـ Modules هو أساس تنظيم أي Backend Application حقيقي.

## كيف تربط أجزاء الدرس معًا؟

| المفهوم | دوره |
|---|---|
| Module | وحدة مستقلة من الكود |
| Export | ما يسمح الـ module للآخرين باستخدامه |
| Import / require | جلب exports من module آخر |
| CommonJS | نظام Node التقليدي: require + module.exports |
| ESM | النظام القياسي الحديث: import + export |
| Module Wrapper | يفسر من أين تأتي require/module/__dirname |
| Module Scope | يمنع متغيرات الملف من أن تصبح global تلقائيًا |
| Resolution | تحديد الملف أو package المقصود |
| Module Cache | منع إعادة تنفيذ CommonJS module غالبًا بعد أول تحميل |
| require.resolve | معرفة المسار الذي سيُحمّل فعليًا |

> فكر دائمًا: **Resolve → Load → Execute → Export → Cache**.


## أسئلة مراجعة

1. ما هو Module؟
2. لماذا نستخدم Modules؟
3. ما الفرق بين Built-in وLocal وNPM modules؟
4. ما الفرق بين CommonJS وESM؟
5. ما وظيفة \`module.exports\`؟
6. ما هو Module Wrapper؟
7. من أين جاءت \`require\` و\`module\` و\`__dirname\` و\`__filename\` في CommonJS؟
8. ما معنى Module Cache؟
9. لماذا يتم تنفيذ module غالبًا مرة واحدة؟
10. ما وظيفة \`require.resolve()\`؟
11. ما المقصود بـ Internal Bindings؟
`};
