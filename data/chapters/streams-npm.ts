import type { StudyChapter } from "@/types/study";

export const streamsNpmChapter: StudyChapter = {
  id: "streams-npm",
  number: 4,
  title: "Streams وnpm وPackage Management",
  subtitle: "Chunks، backpressure، pipe، package.json، node_modules والـ registry.",
  readingTime: "40 دقيقة",
  keywords: ["Streams", "Readable", "Writable", "Backpressure", "npm", "package.json", "node_modules"],
  content: String.raw`
# 60. Streams

Stream تعني التعامل مع البيانات تدريجيًا على شكل **chunks** بدل تحميل البيانات كلها مرة واحدة في الذاكرة.

الفكرة مهمة جدًا في Node.js لأن backend كثيرًا ما يتعامل مع ملفات أو بيانات كبيرة.

## 61. مثال بدون Stream

تخيل ملف حجمه 5 GB واستخدمت:

\`\`\`js
fs.readFile("video.mp4", ...);
\`\`\`

Node يحتاج إلى التعامل مع الملف كاملًا كعملية قراءة واحدة وإتاحة محتواه لك، وهذا قد يستهلك Memory ضخمة.

## 62. Stream Approach

بدل أن تتعامل مع 5 GB دفعة واحدة، تتعامل مع:

\`\`\`text
chunk
chunk
chunk
chunk
...
\`\`\`

الفكرة مثل أنبوب مياه: لا تحتاج تخزين كل المياه قبل أن تستخدمها.

# 63. Readable Stream

\`\`\`js
const fs = require("node:fs");

const stream = fs.createReadStream("big-file.txt");
\`\`\`

ثم:

\`\`\`js
stream.on("data", (chunk) => {
  console.log(chunk);
});
\`\`\`

كل مرة تصل قطعة بيانات يتم إطلاق \`data\` event.

## 64. Chunk غالبًا Buffer

بدون encoding قد ترى:

\`\`\`text
<Buffer ...>
\`\`\`

لأن chunk غالبًا Buffer. يمكنك تحويلها:

\`\`\`js
console.log(chunk.toString("utf8"));
\`\`\`

أو تحديد encoding عند إنشاء stream:

\`\`\`js
const stream = fs.createReadStream("big-file.txt", {
  encoding: "utf8"
});
\`\`\`

## 65. أهم Stream Events

من أشهر أحداث Readable Stream:

\`\`\`text
data
end
error
close
\`\`\`

مثال:

\`\`\`js
stream.on("data", (chunk) => {
  console.log(chunk);
});

stream.on("end", () => {
  console.log("Finished");
});

stream.on("error", (err) => {
  console.error(err);
});
\`\`\`

# 66. Writable Stream

\`\`\`js
const writeStream = fs.createWriteStream("output.txt");

writeStream.write("Hello\n");
writeStream.write("Node.js\n");
writeStream.end();
\`\`\`

\`write()` يرسل data للـ stream، أما \`end()` فيعني أنه لا توجد بيانات إضافية بعد الآن.

\`\`\`js
writeStream.end("Last line");
\`\`\`

# 67. لماذا Streams مهمة للـ Backend؟

تستخدم في:

- File downloads.
- File uploads.
- Video streaming.
- Audio streaming.
- HTTP responses.
- Compression.
- Large CSV processing.
- Database exports.
- Proxy servers.

# 68. pipe()

من أجمل أفكار Streams:

\`\`\`js
readStream.pipe(writeStream);
\`\`\`

مثال:

\`\`\`js
const fs = require("node:fs");

const readStream = fs.createReadStream("large.mp4");
const writeStream = fs.createWriteStream("copy.mp4");

readStream.pipe(writeStream);
\`\`\`

\`\`\`text
File A
  ↓
Readable Stream
  ↓
chunks
  ↓
Writable Stream
  ↓
File B
\`\`\`

# 69. Backpressure

لو producer ينتج data أسرع من consumer فقد تمتلئ الذاكرة. Streams لديها mechanism يسمى **Backpressure** لموازنة سرعة producer مع consumer.

هذا سبب مهم لاستخدام \`pipe()\` بدل إدارة \`data\` events يدويًا في كثير من الحالات.

# 70. Async لا تعني Memory Efficient دائمًا

مثلًا:

\`\`\`js
await fs.readFile("10GB.txt");
\`\`\`

هذه العملية غير blocking من ناحية event loop، لكنها قد تستهلك Memory ضخمة لأنها تحاول إرجاع الملف كاملًا. إذن يوجد محوران مختلفان:

\`\`\`text
Blocking vs Non-blocking
Memory efficient vs Memory hungry
\`\`\`

وهنا تظهر أهمية Streams.

# 71. npm

npm هو ecosystem/tools لإدارة packages. الاسم التاريخي المتداول هو Node Package Manager، لكن استخدامه اليوم أوسع من مجرد manager.

نستخدمه من أجل:

- Install packages.
- Manage dependencies.
- Run scripts.
- Publish packages.
- Manage package versions.

## 72. التحقق من npm

\`\`\`bash
npm --version
\`\`\`

أو:

\`\`\`bash
npm -v
\`\`\`

# 73. إنشاء Node Project

\`\`\`bash
npm init
\`\`\`

سيطرح أسئلة مثل package name وversion وdescription وentry point وtest command وlicense، ثم ينشئ \`package.json\`.

لإنشاء المشروع بسرعة بالقيم الافتراضية:

\`\`\`bash
npm init -y
\`\`\`

# 74. package.json

من أهم ملفات مشروع Node.js. يحتوي metadata وإعدادات المشروع والـ scripts والاعتماديات.

\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {},
  "dependencies": {},
  "devDependencies": {}
}
\`\`\`

يمكن اعتباره Metadata + configuration + dependency manifest للمشروع.

# 75. npm Registry

npm Registry هو المكان الذي يتم نشر واسترجاع packages منه افتراضيًا.

عندما تكتب:

\`\`\`bash
npm install express
\`\`\`

npm يتواصل مع registry للحصول على package metadata والملفات اللازمة.

# 76. Third-party Package

في Node عندما نقول Third-party package نقصد package ليست جزءًا من Node core ولم تكتبها أنت ضمن المشروع.

أمثلة:

\`\`\`text
express
axios
mongoose
zod
lodash
commander
\`\`\`

# 77. Dependencies

Dependencies هي packages يحتاجها التطبيق لكي يعمل.

\`\`\`bash
npm install express
\`\`\`

يضيفها غالبًا داخل:

\`\`\`json
{
  "dependencies": {
    "express": "..."
  }
}
\`\`\`

# 78. node_modules

بعد install يظهر مجلد:

\`\`\`text
node_modules/
\`\`\`

ويحتوي packages التي تم تثبيتها مع dependencies التابعة لها.

\`\`\`text
project/
│
├── node_modules/
├── package.json
├── package-lock.json
└── index.js
\`\`\`

لا تعدل \`node_modules\` يدويًا، وعمومًا لا ترفعه إلى Git. عادة نضع:

\`\`\`text
node_modules/
\`\`\`

داخل \`.gitignore\`.

أي developer يستطيع تشغيل:

\`\`\`bash
npm install
\`\`\`

لإعادة تثبيت dependencies.

# 79. package-lock.json

هذا الملف يحتوي معلومات أكثر دقة عن dependency tree والنسخ resolved. الهدف هو **Reproducible installs** قدر الإمكان.

عادة يجب رفع \`package-lock.json\` إلى Git في التطبيقات.

# 80. تثبيت وإزالة Packages

تثبيت:

\`\`\`bash
npm install express
\`\`\`

اختصار:

\`\`\`bash
npm i express
\`\`\`

إزالة:

\`\`\`bash
npm uninstall express
\`\`\`

أو:

\`\`\`bash
npm remove express
\`\`\`

# 81. dependencies vs devDependencies

Dependency يحتاجها التطبيق أثناء runtime:

\`\`\`bash
npm install express
\`\`\`

Dev Dependency غالبًا مطلوبة أثناء التطوير:

\`\`\`bash
npm install -D eslint
\`\`\`

\`\`\`json
{
  "dependencies": {
    "express": "..."
  },
  "devDependencies": {
    "eslint": "..."
  }
}
\`\`\`

# 82. commander

\`commander\` package مشهورة لبناء CLI applications.

مثل:

\`\`\`bash
myapp add user
myapp --version
\`\`\`

وهي مثال ممتاز على Third-party package.

## أسئلة مراجعة

1. ما هو Stream؟
2. ما الفرق بين قراءة ملف كامل واستخدام Stream؟
3. ما معنى Chunk؟
4. ما هو \`pipe()\`؟
5. ما معنى Backpressure؟
6. لماذا async لا تعني Memory efficient دائمًا؟
7. ما هو npm؟
8. ما هو npm Registry؟
9. ما الفرق بين \`package.json\` و\`package-lock.json\`؟
10. ما هو \`node_modules\`؟
11. ما الفرق بين dependencies وdevDependencies؟
`};
