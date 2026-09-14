import type { StudyChapter } from "@/types/study";

export const httpFundamentalsChapter: StudyChapter = {
  id: "http-fundamentals",
  number: 10,
  title: "HTTP Server وRequest/Response",
  subtitle: "من أول TCP وPort وحتى إنشاء HTTP server يدويًا في Node.js وفهم request, response, methods, headers وstatus codes.",
  readingTime: "55 دقيقة",
  keywords: ["HTTP", "Server", "Request", "Response", "Port", "Status Code", "Headers", "Methods", "Routing", "node:http"],
  content: String.raw`
# 178. ما هو HTTP Server؟

عندما تفتح موقعًا في Browser فالمتصفح يعمل كـ **Client** ويرسل HTTP Request إلى Server. السيرفر يستقبل الطلب، يعالجه، ثم يرسل HTTP Response.

\`\`\`text
Client / Browser
      │
      │ HTTP Request
      ▼
    Server
      │
      │ HTTP Response
      ▼
Client / Browser
\`\`\`

HTTP هو **Application-layer protocol** يحدد شكل التواصل بين Client وServer، لكنه يعتمد في HTTP/1.1 وHTTP/2 غالبًا على TCP كطبقة نقل. HTTP/3 يستخدم QUIC فوق UDP، لذلك لا تحفظ قاعدة أن "HTTP = TCP دائمًا".

# 179. Request وResponse

الـ Request يحتوي عادة على:

- HTTP method.
- URL / path.
- Headers.
- أحيانًا Body.
- معلومات اتصال مرتبطة بالـ socket.

والـ Response يحتوي على:

- Status code.
- Headers.
- Body.

\`\`\`text
REQUEST
GET /users?page=2 HTTP/1.1
Host: example.com
Accept: application/json

        ↓

RESPONSE
HTTP/1.1 200 OK
Content-Type: application/json

[{"id":1,"name":"Ali"}]
\`\`\`

# 180. ما هو Port؟

الـ IP يحدد الجهاز على الشبكة، أما **Port** فيحدد الخدمة أو التطبيق داخل الجهاز.

تخيل الجهاز مبنى والـ IP هو عنوان المبنى، والـ Port هو رقم الباب الذي تستقبل عليه خدمة معينة.

\`\`\`text
127.0.0.1:3000
│         │
IP        Port
\`\`\`

أمثلة شائعة:

| البروتوكول/الخدمة | Port شائع |
|---|---:|
| HTTP | 80 |
| HTTPS | 443 |
| SSH | 22 |
| PostgreSQL | 5432 |
| MySQL | 3306 |

في التطوير نستخدم كثيرًا 3000 أو 4000 أو 5000، لكنها مجرد اختيارات وليست requirement من HTTP.

# 181. localhost و127.0.0.1 و0.0.0.0

\`localhost\` عادة يشير إلى الجهاز الحالي وقد resolve إلى IPv4 أو IPv6 حسب النظام.

\`127.0.0.1\` هو IPv4 loopback address ويجعل الخدمة متاحة من نفس الجهاز فقط.

أما الاستماع على \`0.0.0.0\` فيعني أن السيرفر يقبل الاتصالات على كل IPv4 interfaces المتاحة، وهو شائع داخل Docker أو cloud environments.

> الاستماع على 0.0.0.0 لا يعني أن السيرفر أصبح آمنًا أو public تلقائيًا؛ Firewall, security groups, NAT وcontainer networking ما زالت تتحكم في الوصول.

# 182. Built-in HTTP Module في Node.js

Node توفر module مدمجًا اسمه:

\`\`\`js
const http = require("node:http");
\`\`\`

ولا تحتاج تثبيته من npm لأنه Built-in Module.

# 183. إنشاء أبسط HTTP Server

\`\`\`js
const http = require("node:http");

const server = http.createServer((req, res) => {
  res.end("Hello World");
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
\`\`\`

الفكرة:

\`\`\`text
http.createServer(...)
        ↓
creates Server object
        ↓
server.listen(3000)
        ↓
OS starts listening on port 3000
        ↓
request arrives
        ↓
(req, res) callback runs
\`\`\`

# 184. req وres ما هما؟

في callback:

\`\`\`js
http.createServer((req, res) => {})
\`\`\`

\`req\` هو **IncomingMessage** يمثل الطلب القادم، و\`res\` هو **ServerResponse** الذي تستخدمه لبناء وإرسال الرد.

أمثلة من req:

\`\`\`js
req.method
req.url
req.headers
req.socket.remoteAddress
\`\`\`

أمثلة من res:

\`\`\`js
res.statusCode = 200;
res.setHeader("Content-Type", "text/plain; charset=utf-8");
res.write("Hello");
res.end();
\`\`\`

# 185. res.write() vs res.end()

\`res.write()\` ترسل جزءًا من Response body ويمكن استدعاؤها أكثر من مرة قبل الإنهاء.

\`\`\`js
res.write("Hello ");
res.write("Node.js");
res.end();
\`\`\`

أما \`res.end()\` فتنهي response. ويمكنها إرسال آخر chunk:

\`\`\`js
res.end("Done");
\`\`\`

إذا لم تنهِ response ولم تغلقه بطريقة صحيحة، سيبقى Client منتظرًا وقد يبدو أن request **معلق**.

# 186. هل Response يجب أن تكون String فقط؟

لا. HTTP body في النهاية bytes، وNode تستطيع إرسال String أو Buffer أو data عبر Streams. لكن إذا أردت إرسال JavaScript object كـ JSON في raw Node HTTP فعليك تحويله إلى JSON text أو Buffer مناسب.

\`\`\`js
const user = { id: 1, name: "Osama" };

res.setHeader("Content-Type", "application/json; charset=utf-8");
res.end(JSON.stringify(user));
\`\`\`

# 187. Content-Type مهم

Client يحتاج أن يعرف نوع البيانات.

\`\`\`js
res.setHeader("Content-Type", "text/plain; charset=utf-8");
\`\`\`

أو:

\`\`\`js
res.setHeader("Content-Type", "text/html; charset=utf-8");
\`\`\`

أو:

\`\`\`js
res.setHeader("Content-Type", "application/json; charset=utf-8");
\`\`\`

لا تعتمد على أن Browser سيخمن النوع دائمًا بشكل صحيح.

# 188. HTTP Request Methods

الـ Method تعبّر عن **العملية المطلوبة**.

| Method | الاستخدام الشائع |
|---|---|
| GET | قراءة Resource |
| POST | إنشاء Resource أو تنفيذ command |
| PUT | استبدال Resource كامل عادة |
| PATCH | تعديل جزئي |
| DELETE | حذف Resource |
| HEAD | مثل GET بدون response body |
| OPTIONS | معرفة capabilities / CORS preflight في حالات كثيرة |

مثال:

\`\`\`text
GET /users
POST /users
GET /users/15
PATCH /users/15
DELETE /users/15
\`\`\`

# 189. req.url

في raw HTTP server يمكنك فحص:

\`\`\`js
console.log(req.url);
\`\`\`

لو فتحت:

\`\`\`text
http://localhost:3000/users?page=2
\`\`\`

قد ترى:

\`\`\`text
/users?page=2
\`\`\`

لذلك المقارنة المباشرة مع \`/users\` قد تفشل لو هناك Query String.

الطريقة الأنظف بدون استخدام template literal داخل مثال الكود:

\`\`\`js
const baseUrl = "http://" + req.headers.host;
const url = new URL(req.url, baseUrl);

console.log(url.pathname);
console.log(url.searchParams.get("page"));
\`\`\`

# 190. Routing يدويًا بدون Framework

الصورة التي كتبتها توضّح الفكرة الأساسية:

\`\`\`js
const http = require("node:http");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("Home Page");
  } else if (req.url === "/about") {
    res.end("About Page");
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(3000);
\`\`\`

هذا يعمل للتطبيقات الصغيرة، لكن عندما تزيد routes وmethods وvalidation وmiddlewares وerror handling سيصبح هذا الأسلوب صعب الصيانة.

# 191. Routing يجب أن يراعي Method أيضًا

هذه route:

\`\`\`text
GET /users
\`\`\`

مختلفة عن:

\`\`\`text
POST /users
\`\`\`

في raw Node:

\`\`\`js
if (req.method === "GET" && req.url === "/users") {
  // list users
}

if (req.method === "POST" && req.url === "/users") {
  // create user
}
\`\`\`

# 192. HTTP Status Codes

الـ Status Code يصف نتيجة معالجة request. قسّمها ذهنيًا إلى خمس عائلات:

| Range | المعنى |
|---|---|
| 1xx | Informational |
| 2xx | Success |
| 3xx | Redirection |
| 4xx | Client-side problem |
| 5xx | Server-side problem |

أمثلة مهمة جدًا:

| Code | المعنى الشائع |
|---:|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 301 | Moved Permanently |
| 302 | Found / temporary redirect behavior |
| 304 | Not Modified |
| 400 | Bad Request |
| 401 | Unauthorized — authentication required/failed |
| 403 | Forbidden — authenticated/known but not allowed |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Content |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 502 | Bad Gateway |
| 503 | Service Unavailable |

> Status code ليس "Postal Code" بالمعنى التقني؛ التشبيه مفيد فقط كتذكّر أن الرقم يصف حالة response.

# 193. تحديد statusCode في Node

\`\`\`js
res.statusCode = 404;
res.end("Not Found");
\`\`\`

أو باستخدام \`writeHead\`:

\`\`\`js
res.writeHead(200, {
  "Content-Type": "application/json; charset=utf-8"
});

res.end(JSON.stringify({ ok: true }));
\`\`\`

# 194. Request Headers

\`req.headers\` يحتوي metadata مرسلة من Client.

\`\`\`js
console.log(req.headers["user-agent"]);
console.log(req.headers["content-type"]);
console.log(req.headers.authorization);
\`\`\`

Headers مهمة في Authentication وContent negotiation وCaching وCORS وCompression وغيرها.

# 195. Request Body في raw Node

Request body يصل كـ Stream، وليس جاهزًا تلقائيًا كـ Object.

\`\`\`js
let body = "";

req.on("data", (chunk) => {
  body += chunk;
});

req.on("end", () => {
  const data = JSON.parse(body);
  console.log(data);
  res.end("Received");
});
\`\`\`

في production تحتاج validation وحدود للحجم ومعالجة أخطاء JSON بدل الاعتماد على التجميع المفتوح بهذا الشكل.

# 196. remoteAddress ليست دائمًا Public IP للمستخدم

\`\`\`js
console.log(req.socket.remoteAddress);
\`\`\`

هذه تعطي عنوان الـ peer المتصل مباشرة بالسيرفر. لو التطبيق خلف Reverse Proxy / Load Balancer / CDN فقد ترى IP للبروكسي بدل Client الحقيقي.

لذلك عبارة "remoteAddress = Public IP" ليست قاعدة صحيحة دائمًا.

# 197. من HTTP الخام إلى Framework

في Node الخام أنت مسؤول يدويًا عن:

- Routing.
- Parsing bodies.
- Query strings.
- Route parameters.
- Static files.
- Middleware pipeline.
- Error handling.
- Content types.
- 404 handling.
- تنظيم المشروع.

ولهذا نستخدم Framework أو Web framework/toolkit مثل Express لتقليل boilerplate وتنظيم التطبيق.

# 198. Mental Model نهائي

\`\`\`text
Browser / Client
      │
      │ HTTP Request
      ▼
Network → OS → Node HTTP Server
                │
                ▼
          request callback
             req / res
                │
        routing / business logic
                │
                ▼
          HTTP Response
                │
                ▼
          Browser / Client
\`\`\`

## أسئلة مراجعة

1. ما الفرق بين Client وServer؟
2. ما هو Port؟ وما الفرق بينه وبين IP؟
3. ما معنى \`localhost\` و\`127.0.0.1\` و\`0.0.0.0\`؟
4. ما وظيفة \`http.createServer()\`؟
5. ما الفرق بين \`req\` و\`res\`؟
6. ما الفرق بين \`res.write()\` و\`res.end()\`؟
7. لماذا Content-Type مهم؟
8. ما الفرق بين GET وPOST وPUT وPATCH وDELETE؟
9. ما الفرق بين path وquery string؟
10. لماذا routing اليدوي يصبح صعبًا؟
11. ما معنى 2xx و4xx و5xx؟
12. ما الفرق بين 401 و403؟
13. لماذا request body في raw Node يصل كـ Stream؟
14. هل \`remoteAddress\` يساوي public IP للمستخدم دائمًا؟ ولماذا؟
15. متى ننتقل إلى Framework مثل Express؟
`};
