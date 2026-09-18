import type { StudyChapter } from "@/types/study";

export const expressMiddlewareChapter: StudyChapter = {
  id: "express-middleware",
  number: 11,
  title: "Express.js وRouting وMiddleware",
  subtitle: "فهم Express من الأساس: app, routes, req/res, middleware pipeline, static files, next(), morgan وerror handling.",
  readingTime: "65 دقيقة",
  keywords: ["Express", "Routing", "Middleware", "next", "morgan", "express.static", "req", "res", "app.use", "app.get"],
  content: String.raw`
# قبل أن تبدأ: Mental Design للدرس كله

Express لا يغير HTTP؛ هو ينظم رحلة الـ request التي درستها في الدرس السابق على شكل Pipeline واضحة.

\`\`\`text
HTTP Request
    ↓
Express App
    ↓
Global Middleware
logger / json / auth ...
    ↓
Router
    ↓
Route Match
method + path
    ↓
Route Middleware
    ↓
Controller / Handler
    ↓
Service / Business Logic
    ↓
Response

If error
    ↓
Error Middleware
\`\`\`

كل شيء في الدرس يجب أن تضعه في مكانه داخل هذا الـ pipeline: app.use يسجل طبقة، next ينقل التحكم، Router يقسم المسارات، و404/Error handlers تأتي في أماكن محددة بسبب ترتيب الـ stack.


# 199. ما هو Express؟

Express هو Web Framework / minimalist web framework مبني فوق Node.js HTTP APIs. هو لا يستبدل HTTP، بل يعطيك abstraction وتنظيمًا أسهل للتعامل مع requests, responses, routes وmiddleware.

\`\`\`text
Client
  ↓
HTTP
  ↓
Node.js http
  ↓
Express
  ↓
Routes / Middleware / Controllers
  ↓
Response
\`\`\`

Express مشهور لأنه بسيط، unopinionated إلى حد كبير، وله ecosystem ضخم.

# 200. تثبيت Express

\`\`\`bash
npm install express
\`\`\`

ثم:

\`\`\`js
const express = require("express");
const app = express();
\`\`\`

\`app\` هو application object الذي تسجل عليه routes وmiddleware وتبدأ منه السيرفر.

# 201. أول Express Server

\`\`\`js
const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
\`\`\`

مقارنةً بـ raw Node HTTP، Express يقلل الشروط اليدوية ويعطيك API واضحة للـ routing والردود.

# 202. Routing في Express

Routing يعني تحديد ماذا يحدث عند وصول request لمسار وطريقة HTTP معينة.

\`\`\`js
app.get("/users", handler);
app.post("/users", handler);
app.patch("/users/:id", handler);
app.delete("/users/:id", handler);
\`\`\`

المعادلة:

\`\`\`text
HTTP Method + Path = Route
\`\`\`

# 203. Route Parameters

\`\`\`js
app.get("/users/:id", (req, res) => {
  console.log(req.params.id);
  res.send("User " + req.params.id);
});
\`\`\`

لو فتحت:

\`\`\`text
/users/42
\`\`\`

ستكون:

\`\`\`js
req.params.id === "42"
\`\`\`

# 204. Query Parameters

\`\`\`text
/products?page=2&limit=20
\`\`\`

في Express:

\`\`\`js
app.get("/products", (req, res) => {
  console.log(req.query.page);
  console.log(req.query.limit);
  res.json(req.query);
});
\`\`\`

لا تخلط بين \`req.params\` و\`req.query\`.

# 205. req.body

Express يمكنه parsing JSON body باستخدام middleware مدمجة:

\`\`\`js
app.use(express.json());
\`\`\`

ثم:

\`\`\`js
app.post("/users", (req, res) => {
  console.log(req.body);
  res.status(201).json(req.body);
});
\`\`\`

بدون body parser مناسب، \`req.body\` لن تكون جاهزة بالشكل المتوقع.

# 206. res.send()

\`res.send()\` طريقة عامة لإرسال response body.

\`\`\`js
res.send("Hello");
\`\`\`

يمكن أيضًا إرسال Buffer وبعض أنواع البيانات الأخرى، وExpress يضبط بعض التفاصيل تلقائيًا.

# 207. res.json()

لإرسال JSON:

\`\`\`js
res.json({
  success: true,
  user: { id: 1, name: "Osama" }
});
\`\`\`

هذا أوضح من كتابة \`JSON.stringify\` يدويًا كل مرة.

# 208. res.status()

\`\`\`js
res.status(404).send("Not Found");
\`\`\`

أو:

\`\`\`js
res.status(201).json({ id: 5 });
\`\`\`

هذه chainable API.

# 209. res.sendFile()

لإرسال File:

\`\`\`js
const path = require("node:path");

app.get("/report", (req, res) => {
  res.sendFile(path.join(__dirname, "report.pdf"));
});
\`\`\`

في كثير من الحالات يفضل إعطاء absolute path أو استخدام root option بوضوح.

# 210. Static Files

الملفات التي لا تتغير لكل request مثل CSS, images, client-side JS, icons تسمى static assets.

Express يوفر:

\`\`\`js
app.use(express.static("public"));
\`\`\`

لو عندك:

\`\`\`text
public/
├── style.css
├── logo.png
└── app.js
\`\`\`

سيتمكن المتصفح من طلبها مباشرة حسب المسار.

# 211. ما هي Middleware؟

Middleware هي Function تشارك في request-response cycle ولديها access إلى:

- \`req\`
- \`res\`
- \`next\`

الشكل الأساسي:

\`\`\`js
function middleware(req, res, next) {
  // do something
  next();
}
\`\`\`

يمكن للـ middleware أن:

1. تنفذ أي كود.
2. تعدل request.
3. تعدل response.
4. تنهي request-response cycle.
5. تمرر التحكم للـ middleware التالية.

# 212. next() بالتحديد

\`next\` ليست "تنهي middleware" حرفيًا؛ هي تستدعي middleware أو route handler التالي المطابق في stack الحالي.

\`\`\`js
app.use((req, res, next) => {
  console.log("First middleware");
  next();
});

app.use((req, res, next) => {
  console.log("Second middleware");
  next();
});
\`\`\`

إذا لم ترسل response ولم تستدع \`next()\`، غالبًا سيظل request hanging.

# 213. Middleware Pipeline

تصور request كأنه يمر في pipeline:

\`\`\`text
Request
  ↓
Logger
  ↓
Authentication
  ↓
Validation
  ↓
Route Handler
  ↓
Response
\`\`\`

ترتيب تسجيل middleware مهم جدًا لأن Express ينفذها بالترتيب.

# 214. app.use()

\`app.use\` تستخدم غالبًا لتسجيل middleware.

\`\`\`js
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
\`\`\`

هذه middleware تعمل على كل requests المطابقة للمسار الذي سجلت عليه.

# 215. Middleware على مسار محدد

\`\`\`js
app.use("/admin", (req, res, next) => {
  console.log("Admin middleware");
  next();
});
\`\`\`

ستعمل عند requests تبدأ بالمسار المناسب مثل \`/admin\` و\`/admin/users\`.

# 216. Middleware خاصة بـ Route واحدة

\`\`\`js
function auth(req, res, next) {
  const allowed = true;

  if (!allowed) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}

app.get("/profile", auth, (req, res) => {
  res.send("Profile");
});
\`\`\`

# 217. Logger Middleware

فكرتك المكتوبة "watch everything" صحيحة كتصور مبسط، لكن الأدق أن logger يسجل معلومات عن requests التي تمر عبره.

\`\`\`js
function logger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    console.log({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}

app.use(logger);
\`\`\`

# 218. Morgan

Morgan هي HTTP request logger middleware شائعة لـ Node/Express.

\`\`\`bash
npm install morgan
\`\`\`

ثم:

\`\`\`js
const morgan = require("morgan");

app.use(morgan("dev"));
\`\`\`

Morgan مفيدة في development وفي logging setups، لكن في production الكبير غالبًا تحتاج structured logging strategy وربط logs بمنظومة monitoring.

# 219. Middleware يمكنها تعديل req

\`\`\`js
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
\`\`\`

لكن في TypeScript تحتاج declaration merging أو type extension لكي يعرف TypeScript الخاصية الجديدة.

# 220. Middleware يمكنها إنهاء الـ Request

ليس لازمًا كل middleware تستدعي next.

\`\`\`js
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Missing token" });
  }

  next();
});
\`\`\`

لو أرسلت response فلا تستدع \`next()\` بعدها بشكل عشوائي، وإلا قد تحاول طبقات لاحقة إرسال response ثانية.

# 221. Headers Already Sent

من أشهر الأخطاء:

\`\`\`text
Error: Cannot set headers after they are sent to the client
\`\`\`

يحدث غالبًا عندما ترسل response ثم يكمل الكود ويحاول إرسال response أخرى.

خطأ:

\`\`\`js
if (!user) {
  res.status(404).send("Not Found");
}

res.send(user);
\`\`\`

الصحيح:

\`\`\`js
if (!user) {
  return res.status(404).send("Not Found");
}

res.send(user);
\`\`\`

# 222. 404 Handler

بعد كل routes:

\`\`\`js
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});
\`\`\`

يجب أن يكون بعد routes حتى لا يلتقط requests قبل أن تصل لها.

# 223. Error-handling Middleware

Express يميز error middleware بعدد parameters:

\`\`\`js
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal Server Error"
  });
});
\`\`\`

وجود أربعة parameters مهم لتعرفها Express كـ error handler في النمط التقليدي.

# 224. تمرير Error باستخدام next(err)

\`\`\`js
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});
\`\`\`

الفكرة هي تحويل الخطأ إلى error-handling middleware بدل تكرار response logic في كل route.

# 225. Router

عندما يكبر المشروع لا تضع كل routes في \`app.js\`.

\`\`\`js
const express = require("express");
const router = express.Router();

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", createUser);

module.exports = router;
\`\`\`

ثم:

\`\`\`js
app.use("/users", usersRouter);
\`\`\`

فتصبح routes:

\`\`\`text
GET  /users
GET  /users/:id
POST /users
\`\`\`

# 226. تنظيم Backend أكبر

\`\`\`text
src/
├── app.js
├── server.js
├── routes/
│   └── users.routes.js
├── controllers/
│   └── users.controller.js
├── services/
│   └── users.service.js
├── middlewares/
│   ├── auth.js
│   └── error-handler.js
└── utils/
    └── logger.js
\`\`\`

الفكرة:

\`\`\`text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository / Database
\`\`\`

ليس قانونًا إلزاميًا، لكنه تنظيم شائع وقابل للتوسع.

# 227. Express لا يلغي فهم HTTP

إذا كنت تستخدم Express بدون فهم HTTP ستواجه مشاكل عند التعامل مع:

- Status codes.
- Caching.
- Authentication headers.
- Cookies.
- CORS.
- Content-Type.
- Streaming.
- Proxies.
- Request size.
- Timeouts.

لذلك فهم raw Node HTTP قبل Express خطوة ممتازة.

# 228. مثال كامل صغير

\`\`\`js
const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.get("/about", (req, res) => {
  res.send("About Page");
});

app.post("/users", (req, res) => {
  res.status(201).json({
    message: "User created",
    user: req.body,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
\`\`\`

# 229. Mental Model

\`\`\`text
HTTP Request
    ↓
Express App
    ↓
Middleware 1
    ↓
Middleware 2
    ↓
Matching Route
    ↓
Controller
    ↓
Service
    ↓
Response

If error:
    ↓
Error Middleware
\`\`\`

## كيف تربط أجزاء الدرس معًا؟

| المفهوم | مكانه في Express Pipeline |
|---|---|
| app | التطبيق والـ middleware stack |
| Route | Method + Path + Handler |
| req.params | قيم المسار الديناميكية |
| req.query | query string values |
| req.body | body بعد parsing |
| app.use | تسجيل middleware/router |
| Middleware | طبقة تمر عبرها request |
| next() | نقل التحكم للطبقة التالية |
| Router | تقسيم routes إلى modules |
| Controller | يتعامل مع HTTP layer |
| Service | business logic |
| 404 Handler | يعمل بعد فشل كل routes في المطابقة |
| Error Middleware | المسار المركزي لمعالجة الأخطاء |
| Morgan | logging middleware |

> اقرأ أي Express app من أعلى لأسفل كأنه **Stack**: ترتيب التسجيل يحدد رحلة request.


## أسئلة مراجعة

1. ما الذي يضيفه Express فوق Node HTTP؟
2. ما معنى Route؟
3. ما الفرق بين \`req.params\`, \`req.query\`, \`req.body\`؟
4. ما الفرق بين \`res.send\` و\`res.json\`؟
5. ما وظيفة \`app.use\`؟
6. ما هي Middleware؟
7. ماذا تفعل \`next()\` تحديدًا؟
8. ماذا يحدث إذا لم ترسل response ولم تستدع next؟
9. لماذا ترتيب middleware مهم؟
10. ما وظيفة \`express.json()\`؟
11. ما وظيفة \`express.static()\`؟
12. ما هو Morgan؟
13. لماذا قد يظهر "headers already sent"؟
14. أين تضع 404 handler؟
15. ما شكل error-handling middleware؟
16. لماذا نستخدم \`express.Router()\`؟
17. لماذا لا يجب أن تعتمد على Express بدل فهم HTTP؟
`};
