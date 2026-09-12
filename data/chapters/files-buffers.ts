import type { StudyChapter } from "@/types/study";

export const filesBuffersChapter: StudyChapter = {
  id: "files-buffers",
  number: 3,
  title: "File System وBuffer وJSON",
  subtitle: "Blocking vs Non-blocking، callbacks، promises، binary data وUTF-8.",
  readingTime: "50 دقيقة",
  keywords: ["fs", "readFile", "readFileSync", "Buffer", "UTF-8", "JSON", "async/await"],
  content: String.raw`
# 36. File System Module — fs

Node يوفر Built-in Module اسمه \`node:fs\` للتعامل مع File System: قراءة الملفات، إنشاء الملفات، الكتابة، الإضافة، الحذف، إنشاء directories، إعادة التسمية، قراءة metadata، والتعامل مع streams.

CommonJS:

\`\`\`js
const fs = require("node:fs");
\`\`\`

ES Modules:

\`\`\`js
import fs from "node:fs";
\`\`\`

## 37. لماذا File System مهم في Backend؟

الـ backend يتعامل مع logs وconfiguration files وJSON files وuploaded images وPDFs وtemporary files وCSV وgenerated reports وcertificates وcached data.

## 38. Synchronous vs Asynchronous

معظم عمليات fs يوجد منها نسخ Synchronous وAsynchronous.

\`\`\`js
fs.readFileSync()
fs.readFile()
\`\`\`

### Synchronous I/O

\`\`\`js
const data = fs.readFileSync("hello.txt", "utf8");
console.log(data);
\`\`\`

\`readFileSync\` تعني: اقرأ الملف وانتظر حتى تنتهي العملية قبل أن تكمل تنفيذ السطر التالي.

\`\`\`text
JavaScript
   ↓
readFileSync()
   ↓
WAIT
WAIT
WAIT
   ↓
File finished
   ↓
Next line
\`\`\`

هذا يسمى **Blocking**.

## 39. ماذا يعني Blocking؟

Blocking يعني أن JavaScript execution لا يستطيع التقدم في الـ thread الذي يشغل الكود حتى تنتهي العملية.

\`\`\`js
console.log("1");
const data = fs.readFileSync("large.txt", "utf8");
console.log("2");
\`\`\`

لن ترى \`2\` قبل انتهاء القراءة.

## 40. لماذا Blocking خطير في Backend Server؟

إذا دخل request handler في \`fs.readFileSync("huge-file.txt")\` فإن JavaScript main thread ينتظر. أي Requests أخرى ستتأخر حتى ينتهي synchronous operation. لذلك تجنب synchronous I/O داخل hot path للـ production web server.

## 41. متى تكون Sync APIs مقبولة؟

قد تكون مناسبة في Application startup وCLI scripts وBuild tools وSmall one-off scripts وقراءة config قبل تشغيل السيرفر وTests وMigration scripts.

\`\`\`js
const config = fs.readFileSync("./config.json", "utf8");
startServer(config);
\`\`\`

إذا حدث ذلك مرة واحدة قبل تشغيل السيرفر فقد يكون مقبولًا.

## 42. Buffer عند القراءة بدون Encoding

\`\`\`js
const data = fs.readFileSync("hello.txt");
console.log(data);
\`\`\`

قد تحصل على:

\`\`\`text
<Buffer 48 65 6c 6c 6f>
\`\`\`

لأن Node يرجع Buffer إذا لم تحدد encoding.

للحصول على String:

\`\`\`js
const data = fs.readFileSync("hello.txt", "utf8");
\`\`\`

أو:

\`\`\`js
const data = fs.readFileSync("hello.txt");
console.log(data.toString("utf8"));
\`\`\`

## 43. writeFileSync

\`\`\`js
fs.writeFileSync("hello.txt", "Hello Node.js", "utf8");
\`\`\`

إذا كان الملف غير موجود يتم إنشاؤه، وإذا كان موجودًا يتم استبدال محتواه افتراضيًا. \`writeFile\` لا تعني Append.

## 44. appendFileSync

لإضافة محتوى بدون حذف القديم:

\`\`\`js
fs.appendFileSync("hello.txt", "\nNew line", "utf8");
\`\`\`

## 45. حذف ملف — unlink

Sync:

\`\`\`js
fs.unlinkSync("hello.txt");
\`\`\`

Async:

\`\`\`js
fs.unlink("hello.txt", (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Deleted");
});
\`\`\`

## 46. Async File System

\`\`\`js
fs.readFile("hello.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
\`\`\`

الفكرة:

\`\`\`text
JavaScript
     ↓
fs.readFile()
     ↓
Start operation
     ↓
JavaScript continues
     ↓
Other code runs
     ↓
File operation completes
     ↓
Callback becomes eligible
     ↓
Event Loop schedules callback
     ↓
Callback executes
\`\`\`

## 47. تجربة Non-blocking behavior

\`\`\`js
console.log("Start");

fs.readFile("hello.txt", "utf8", (err, data) => {
  console.log(data);
});

console.log("End");
\`\`\`

غالبًا:

\`\`\`text
Start
End
Hello
\`\`\`

## 48. Callback

Callback هي Function يتم تمريرها إلى Function أخرى لكي يتم استدعاؤها لاحقًا. ليست callbacks مرتبطة دائمًا بالـ async.

\`\`\`js
function greet(name, callback) {
  console.log("Hello " + name);
  callback();
}

greet("Osama", () => {
  console.log("Done");
});
\`\`\`

هذه callback لكنها synchronous. أما callback الخاصة بـ \`fs.readFile\` فهي asynchronous.

## 49. Error-first Callback Pattern

Node APIs التقليدية تستخدم:

\`\`\`js
(err, data) => {}
\`\`\`

يسمى Error-first callback.

\`\`\`js
fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
\`\`\`

الـ \`return\` بعد الخطأ يمنع استمرار التنفيذ باستخدام نتيجة غير صالحة.

## 50. Async Write / Append / Delete

\`\`\`js
fs.writeFile("hello.txt", "Hello Node", "utf8", (err) => {
  if (err) return console.error(err);
  console.log("File written");
});
\`\`\`

\`\`\`js
fs.appendFile("hello.txt", "\nNew line", "utf8", (err) => {
  if (err) return console.error(err);
  console.log("Data appended");
});
\`\`\`

\`\`\`js
fs.unlink("hello.txt", (err) => {
  if (err) return console.error(err);
  console.log("File deleted");
});
\`\`\`

## 51. Promise API — node:fs/promises

الطريقة الحديثة:

\`\`\`js
import fs from "node:fs/promises";

async function readData() {
  const data = await fs.readFile("hello.txt", "utf8");
  console.log(data);
}

readData();
\`\`\`

Error handling:

\`\`\`js
try {
  const data = await fs.readFile("hello.txt", "utf8");
  console.log(data);
} catch (error) {
  console.error(error);
}
\`\`\`

## 52. await ليست مثل readFileSync

\`\`\`js
const data = await fs.readFile("file.txt", "utf8");
\`\`\`

الـ async function تتوقف منطقيًا عند \`await\`، لكن Node يستطيع متابعة أعمال أخرى. هذا مختلف عن:

\`\`\`js
fs.readFileSync("file.txt", "utf8");
\`\`\`

الذي يحجز main JavaScript thread أثناء العملية.

# 53. Buffer

Buffer في Node هو Object يمثل sequence من bytes في الذاكرة.

\`\`\`js
const buffer = Buffer.from("Hello");
console.log(buffer);
\`\`\`

قد ترى:

\`\`\`text
<Buffer 48 65 6c 6c 6f>
\`\`\`

القيم Hexadecimal للـ bytes:

\`\`\`text
H → 0x48
e → 0x65
l → 0x6c
l → 0x6c
o → 0x6f
\`\`\`

## 54. Bit vs Byte

1 bit إما 0 أو 1، و8 bits = 1 byte.

\`\`\`text
01001000
\`\`\`

هذا Byte واحد ويمكن تمثيله بالـ hexadecimal كـ \`48\`.

## 55. لماذا Node يحتاج Buffer؟

الكمبيوتر والشبكة والملفات تتعامل في النهاية مع bytes. Buffer يسمح لـ Node بالتعامل مع Files وImages وVideos وNetwork packets وStreams وTCP data وBinary protocols.

# 56. UTF-8

UTF-8 هو Encoding يحول Unicode characters إلى bytes والعكس.

\`\`\`text
Text
   ↓
UTF-8 encoding
   ↓
Bytes
\`\`\`

وعند القراءة:

\`\`\`text
Bytes
   ↓
UTF-8 decoding
   ↓
Text
\`\`\`

\`\`\`js
const buffer = Buffer.from("Hello", "utf8");
console.log(buffer.toString("utf8"));
\`\`\`

## 57. الأحرف العربية وUTF-8

Character لا يساوي Byte دائمًا.

\`\`\`js
const buffer = Buffer.from("مرحبا");
console.log(buffer.length);
\`\`\`

عدد bytes لن يساوي بالضرورة عدد JavaScript characters بالشكل الذي قد تتوقعه بسبب Unicode encoding.

# 58. التعامل مع JSON File

نمط شائع:

\`\`\`text
Read → Parse → Modify → Stringify → Write
\`\`\`

\`users.json\`:

\`\`\`json
[
  {
    "id": 1,
    "name": "Ali"
  }
]
\`\`\`

لإضافة User:

\`\`\`js
const fs = require("node:fs");

const data = fs.readFileSync("users.json", "utf8");
const users = JSON.parse(data);

users.push({ id: 2, name: "Osama" });

fs.writeFileSync(
  "users.json",
  JSON.stringify(users, null, 2),
  "utf8"
);
\`\`\`

## 59. JSON.parse وJSON.stringify

\`JSON.parse()\` تحول JSON String إلى JavaScript Object أو Array. \`JSON.stringify()\` تحول Object إلى Text صالح للكتابة في ملف JSON. استخدام \`JSON.stringify(users, null, 2)\` يجعل الملف مرتبًا وأسهل في القراءة.

## أسئلة مراجعة

1. ما الفرق بين \`readFile()\` و\`readFileSync()\`؟
2. ماذا يعني Blocking؟
3. لماذا synchronous APIs خطيرة داخل HTTP request handler؟
4. ما هو Error-first callback؟
5. لماذا \`await fs.readFile()\` ليست مثل \`readFileSync()\`؟
6. ما هو Buffer؟
7. ما علاقة Buffer بالـ binary data؟
8. ما هو UTF-8؟
9. لماذا \`readFile()\` يرجع Buffer بدون encoding؟
10. ما وظيفة \`JSON.parse()\` و\`JSON.stringify()\`؟
`};
