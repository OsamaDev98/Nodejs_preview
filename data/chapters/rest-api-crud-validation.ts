import type { StudyChapter } from "@/types/study";

export const restApiCrudValidationChapter: StudyChapter = {
  id: "rest-api-crud-validation",
  number: 12,
  title: "REST API وCRUD وValidation وتنظيم المشروع",
  subtitle: "من معنى API وResource إلى CRUD كامل بـ Express، أدوات الاختبار، body parsing، validation، route chaining وتنظيم Controllers وRoutes وMiddlewares.",
  readingTime: "90 دقيقة",
  keywords: ["API", "REST", "CRUD", "Postman", "JSON", "express.json", "body-parser", "express-validator", "Joi", "Zod", "Controller", "Router", "Resource", "app.route"],
  content: String.raw`
# قبل أن تبدأ: الصورة الكاملة

في هذا الفصل سنجمع ما تعلمته عن HTTP وExpress ونحوّله إلى **REST API حقيقية**.

\`\`\`text
Client
Postman / Frontend / Mobile App
        ↓
HTTP Request
Method + URL + Headers + Body
        ↓
Express Middleware
JSON Parser → Validation → Auth ...
        ↓
Router
        ↓
Controller
        ↓
Service / Data Layer
        ↓
Response
Status Code + Headers + JSON
\`\`\`

الفكرة الأساسية: الـ API ليست مجرد مجموعة Routes، بل **عقد Contract** بين Client وServer يحدد كيف يطلب العميل البيانات وكيف يرد السيرفر.

# 230. ما هي API؟

API اختصار:

**Application Programming Interface**

هي واجهة تسمح لبرنامج أن يتعامل مع برنامج آخر من خلال قواعد واضحة.

مثال:

\`\`\`text
React Frontend
      ↓
GET /api/courses
      ↓
Node.js API
      ↓
Database
\`\`\`

الـ Frontend لا يحتاج أن يعرف كيف تخزن البيانات داخليًا. كل ما يحتاجه هو معرفة الـ endpoint وطريقة الطلب وشكل الـ response.

# 231. API ليست بالضرورة HTTP

كلمة API أوسع من Web API.

مثلًا:

- Node.js File System API.
- Browser DOM API.
- GitHub REST API.
- Database Driver API.

لكن عندما نقول Backend API في هذا السياق فنحن نقصد غالبًا **HTTP API**.

# 232. هل API كانت XML وأصبحت JSON؟

هذه ملاحظة شائعة لكنها تحتاج تصحيحًا.

قديمًا كان XML شائعًا جدًا في Web Services، خصوصًا SOAP. اليوم JSON هو الأكثر شيوعًا في REST APIs، لكن لا يوجد قانون يقول إن API يجب أن تستخدم JSON فقط.

الـ response يمكن أن يكون:

- JSON
- XML
- Text
- HTML
- File
- Binary
- Stream

إذن العبارة الأدق:

> كثير من Web APIs الحديثة تستخدم JSON لأنه خفيف وسهل التعامل معه في JavaScript، وليس لأن API نفسها مرتبطة بـ JSON.

# 233. ما هو Endpoint؟

Endpoint هو نقطة وصول محددة داخل API.

مثال:

\`\`\`text
GET /api/courses
GET /api/courses/5
POST /api/courses
DELETE /api/courses/5
\`\`\`

كل Endpoint يتكون عادة من:

\`\`\`text
HTTP Method + Path
\`\`\`

مثال:

\`GET /api/courses\`

هو Endpoint مختلف عن:

\`POST /api/courses\`

حتى لو كان الـ path نفسه.

# 234. ما هو Resource؟

في REST نفكر في البيانات على أنها **Resources**.

أمثلة:

- Course
- User
- Product
- Order
- Article

إذا كان لدينا Course resource، فالمسار الطبيعي غالبًا:

\`\`\`text
/api/courses
\`\`\`

وليس:

\`\`\`text
/api/getCourses
/api/createCourse
\`\`\`

لأن HTTP Method نفسه يوضح العملية المطلوبة.

# 235. معنى Route

Route في Express هي قاعدة تقول:

> عندما يأتي Request بطريقة HTTP معينة وعلى Path معين، شغّل Handler محددة.

مثال:

\`\`\`js
app.get("/api/courses", (req, res) => {
  res.json([]);
});
\`\`\`

هنا:

- Method = GET
- Path = /api/courses
- Handler = callback function

# 236. CRUD

CRUD اختصار لأربع عمليات أساسية على البيانات:

| CRUD | المعنى | HTTP Method الشائع |
|---|---|---|
| Create | إنشاء | POST |
| Read | قراءة | GET |
| Update | تعديل | PUT / PATCH |
| Delete | حذف | DELETE |

مثال Courses API:

\`\`\`text
POST   /api/courses       Create
GET    /api/courses       Read all
GET    /api/courses/2     Read one
PATCH  /api/courses/2     Update
DELETE /api/courses/2     Delete
\`\`\`

# 237. POST — Create

POST يستخدم عادة لإنشاء Resource جديد.

\`\`\`http
POST /api/courses
Content-Type: application/json

{
  "title": "Node.js",
  "price": 1000
}
\`\`\`

Express:

\`\`\`js
app.post("/api/courses", (req, res) => {
  const newCourse = {
    id: courses.length + 1,
    title: req.body.title,
    price: req.body.price,
  };

  courses.push(newCourse);

  res.status(201).json(newCourse);
});
\`\`\`

\`201 Created\` مناسب عند نجاح إنشاء Resource.

# 238. GET — Read

لإرجاع كل الكورسات:

\`\`\`js
app.get("/api/courses", (req, res) => {
  res.status(200).json(courses);
});
\`\`\`

لإرجاع كورس واحد:

\`\`\`js
app.get("/api/courses/:id", (req, res) => {
  const id = Number(req.params.id);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  res.json(course);
});
\`\`\`

# 239. PUT vs PATCH

كلاهما Update، لكن الفرق الدلالي مهم.

**PUT** يعني غالبًا استبدال representation كاملة للـ resource.

**PATCH** يعني تعديل جزء من الـ resource.

مثال PATCH:

\`\`\`http
PATCH /api/courses/2

{
  "price": 900
}
\`\`\`

لا نرسل title إذا لم نرد تغييره.

مثال:

\`\`\`js
app.patch("/api/courses/:id", (req, res) => {
  const id = Number(req.params.id);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (req.body.title !== undefined) {
    course.title = req.body.title;
  }

  if (req.body.price !== undefined) {
    course.price = req.body.price;
  }

  res.json(course);
});
\`\`\`

# 240. DELETE

\`\`\`js
app.delete("/api/courses/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = courses.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  const deletedCourse = courses.splice(index, 1)[0];

  res.json({
    message: "Course deleted",
    course: deletedCourse,
  });
});
\`\`\`

يمكن أيضًا استخدام \`204 No Content\` إذا لم ترد إرسال body.

# 241. Array.find()

\`find()\` تبحث عن **أول عنصر** يحقق الشرط وتعيد العنصر نفسه.

\`\`\`js
const course = courses.find((item) => item.id === 2);
\`\`\`

إذا وجدته:

\`\`\`js
{ id: 2, title: "React course", price: 800 }
\`\`\`

إذا لم تجده:

\`\`\`js
undefined
\`\`\`

هي مناسبة جدًا في GET single resource.

# 242. Array.findIndex()

\`findIndex()\` تشبه find، لكنها تعيد **رقم الـ index** بدل العنصر.

\`\`\`js
const index = courses.findIndex((item) => item.id === 2);
\`\`\`

إذا لم يوجد العنصر تكون النتيجة:

\`\`\`js
-1
\`\`\`

تستخدم كثيرًا عند الحذف أو الاستبدال.

# 243. Array.splice()

\`splice()\` تعدل الـ original array.

مثال حذف عنصر واحد عند index معين:

\`\`\`js
courses.splice(index, 1);
\`\`\`

المعامل الأول: أين تبدأ.

المعامل الثاني: كم عنصرًا تحذف.

انتبه: \`splice\` تختلف عن \`slice\`. الأولى تغير الـ array الأصلية، الثانية لا تغيرها.

# 244. Array.filter()

\`filter()\` تعيد Array جديدة تحتوي على كل العناصر التي حققت الشرط.

مثال حذف بطريقة immutable:

\`\`\`js
courses = courses.filter((item) => item.id !== id);
\`\`\`

لكن لو \`courses\` معرفة بـ \`const\` فلن تستطيع إعادة إسناد array جديدة لها. عندها إما تستخدم \`let\` أو طريقة أخرى.

# 245. Client Tools وPostman

Postman مثال على API Client Tool.

وظيفته أن يجعلك ترسل HTTP Requests بدون الحاجة إلى بناء Frontend.

يمكنك تحديد:

- Method
- URL
- Query params
- Headers
- Body
- Authorization

ثم مشاهدة:

- Status code
- Response body
- Response headers
- Response time

بدائل معروفة:

- Insomnia
- Bruno
- Thunder Client
- curl

# 246. مثال Request من Postman

لو السيرفر يعمل على port 3000:

\`\`\`text
POST http://localhost:3000/api/courses
\`\`\`

Body → raw → JSON:

\`\`\`json
{
  "title": "Node.js Advanced",
  "price": 1200
}
\`\`\`

وتأكد من:

\`\`\`http
Content-Type: application/json
\`\`\`

# 247. هل أي API ترجع String؟

لا.

هذه نقطة يجب تصحيحها من الملاحظات.

API قد ترجع JSON أو Text أو File أو Stream أو غير ذلك. وفي REST APIs الحديثة، JSON شائع جدًا.

مثلًا:

\`\`\`js
res.json({ message: "ok" });
\`\`\`

Express يقوم بعمل serialization إلى JSON bytes وإرسال Content-Type مناسب.

# 248. لماذا req.body لا تعمل وحدها؟

HTTP request body تصل كسلسلة bytes/stream.

Express يحتاج Middleware لقراءة الـ body وتحويل JSON إلى JavaScript object.

لهذا نستخدم:

\`\`\`js
app.use(express.json());
\`\`\`

ثم:

\`\`\`js
app.post("/api/courses", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});
\`\`\`

# 249. express.json() بالتحديد

\`express.json()\` ترجع Middleware.

هذه الـ middleware:

1. تفحص Content-Type.
2. تقرأ request body.
3. تحاول parse JSON.
4. تضع النتيجة في \`req.body\`.
5. ثم تمرر التحكم للطبقة التالية.

Mental model:

\`\`\`text
Raw JSON bytes
      ↓
express.json()
      ↓
JavaScript Object
      ↓
req.body
\`\`\`

# 250. body-parser: هل ما زلنا نحتاجه؟

تاريخيًا كان \`body-parser\` package منفصلة شائعة جدًا مع Express.

مثلًا:

\`\`\`js
const bodyParser = require("body-parser");

app.use(bodyParser.json());
\`\`\`

في Express الحديثة توجد parsers أساسية built-in:

\`\`\`js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
\`\`\`

لذلك غالبًا لا تحتاج تثبيت \`body-parser\` فقط من أجل JSON وURL-encoded bodies.

المفهوم نفسه ما زال مهمًا: **Body Parsing Middleware**.

# 251. Request Data تأتي من أكثر من مكان

في Express لديك غالبًا:

\`\`\`text
req.params   → path parameters
req.query    → query string
req.body     → request body
req.headers  → HTTP headers
req.cookies  → إذا استخدمت cookie parser
\`\`\`

مثال:

\`\`\`http
PATCH /api/courses/5?notify=true
Authorization: Bearer TOKEN

{
  "price": 950
}
\`\`\`

هنا:

- \`req.params.id\` = "5"
- \`req.query.notify\` = "true"
- \`req.body.price\` = 950
- \`req.headers.authorization\` = token header

# 252. لماذا نحتاج Validation؟

لأن كل input يأتي من Client يجب اعتباره **غير موثوق**.

لا تفترض أن:

\`\`\`json
{
  "title": "Node.js",
  "price": 1000
}
\`\`\`

ستأتي دائمًا صحيحة.

قد يأتي:

\`\`\`json
{
  "title": "",
  "price": "free"
}
\`\`\`

أو:

\`\`\`json
{
  "admin": true
}
\`\`\`

لذلك Validation جزء أساسي من API boundary.

# 253. Validation vs Sanitization

Validation تسأل:

> هل القيمة صحيحة حسب القواعد؟

مثال: هل email صالح؟ هل price رقم موجب؟

Sanitization تغير أو تنظف القيمة.

مثال:

- trim spaces
- normalize email
- escape / transform input

لا تخلط بين الاثنين.

# 254. express-validator

\`express-validator\` مجموعة Middleware مبنية فوق validator.js وتتكامل مع Express.

تثبيت:

\`\`\`bash
npm install express-validator
\`\`\`

مثال:

\`\`\`js
const { body, validationResult } = require("express-validator");

app.post(
  "/api/courses",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("title is required")
      .isLength({ min: 2 })
      .withMessage("title must be at least 2 characters"),

    body("price")
      .isFloat({ min: 0 })
      .withMessage("price must be a positive number"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    res.status(201).json(req.body);
  }
);
\`\`\`

# 255. ماذا يحدث داخل express-validator؟

الـ validation rules نفسها Middlewares.

رحلة request:

\`\`\`text
POST /api/courses
      ↓
body("title") validator
      ↓
body("price") validator
      ↓
validationResult(req)
      ↓
Controller
\`\`\`

وهذا يفسر لماذا تمرر Array من validators قبل الـ handler.

# 256. Joi

Joi تستخدم Schema تصف شكل البيانات المتوقع.

مثال:

\`\`\`js
const Joi = require("joi");

const courseSchema = Joi.object({
  title: Joi.string().min(2).required(),
  price: Joi.number().min(0).required(),
});

const result = courseSchema.validate(req.body);

if (result.error) {
  return res.status(400).json({
    message: result.error.details[0].message,
  });
}
\`\`\`

ميزة هذا الأسلوب أن Schema منفصلة عن Route نفسها.

# 257. Zod

Zod شائعة جدًا في TypeScript projects لأنها تجمع Runtime Validation مع Type Inference.

مثال:

\`\`\`ts
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(2),
  price: z.number().nonnegative(),
});

const result = courseSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({
    errors: result.error.issues,
  });
}

const data = result.data;
\`\`\`

ميزة مهمة: بعد نجاح parse يصبح \`data\` هو input validated وليس مجرد \`req.body\` غير موثوقة.

# 258. أي Validation Library أختار؟

الفكرة أهم من المكتبة.

- express-validator: ممتازة عندما تريد Validation كـ Express middleware chains.
- Joi: Schema-based ومستخدمة منذ سنوات.
- Zod: مناسبة جدًا مع TypeScript وmodern full-stack projects.

في كل الحالات الهدف واحد:

\`\`\`text
Untrusted Input
      ↓
Validate / Parse
      ↓
Trusted Application Data
\`\`\`

# 259. Status Codes في CRUD API

أكثر status codes التي ستستخدمها هنا:

| Code | المعنى العملي |
|---:|---|
| 200 | Request نجح |
| 201 | Resource تم إنشاؤه |
| 204 | نجح ولا يوجد body |
| 400 | Input غير صالح / Bad Request |
| 401 | Authentication مطلوبة أو غير صالحة |
| 403 | المستخدم معروف لكن غير مسموح له |
| 404 | Resource غير موجود |
| 409 | Conflict مثل duplicate unique value |
| 422 | Validation semantics غير مقبولة في بعض API designs |
| 500 | Server Error غير متوقع |

اختر status code حسب معنى النتيجة، لا بشكل عشوائي.

# 260. app.route() وRoute Chaining

بدل تكرار نفس path:

\`\`\`js
app.get("/api/courses", getCourses);
app.post("/api/courses", createCourse);
\`\`\`

يمكن:

\`\`\`js
app
  .route("/api/courses")
  .get(getCourses)
  .post(createCourse);
\`\`\`

ولـ single resource:

\`\`\`js
app
  .route("/api/courses/:id")
  .get(getCourse)
  .patch(updateCourse)
  .delete(deleteCourse);
\`\`\`

هذا يسمى route chaining ويقلل تكرار اسم المسار.

# 261. Router أفضل عندما يكبر المشروع

\`app.route()\` مفيدة، لكن لا تجعل \`app.js\` ملفًا ضخمًا.

استخدم Router:

\`\`\`js
const express = require("express");
const router = express.Router();

router
  .route("/")
  .get(getCourses)
  .post(validateCreateCourse, createCourse);

router
  .route("/:id")
  .get(getCourse)
  .patch(validateUpdateCourse, updateCourse)
  .delete(deleteCourse);

module.exports = router;
\`\`\`

ثم:

\`\`\`js
app.use("/api/courses", coursesRouter);
\`\`\`

# 262. لماذا نفصل Controller عن Route؟

Route يجب أن تعرف:

- Method
- Path
- Middleware
- Controller

ولا يفضل أن تحتوي كل Business Logic.

\`\`\`js
router.get("/:id", getCourse);
\`\`\`

Controller:

\`\`\`js
function getCourse(req, res) {
  const id = Number(req.params.id);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
}
\`\`\`

هذا يجعل Routes سهلة القراءة.

# 263. تنظيم المشروع

تنظيم مناسب لمشروع تعلم أو API متوسطة:

\`\`\`text
src/
├── app.js
├── server.js
├── data/
│   └── courses.js
├── controllers/
│   └── courses.controller.js
├── routes/
│   └── courses.routes.js
├── middlewares/
│   ├── validate-course.js
│   ├── not-found.js
│   └── error-handler.js
├── services/
│   └── courses.service.js
└── schemas/
    └── course.schema.js
\`\`\`

وظيفة كل طبقة:

\`\`\`text
routes
→ تحدد endpoint والـ middleware والـ controller

controllers
→ تتعامل مع req/res

services
→ business logic

data / repositories
→ الوصول للبيانات

schemas
→ validation rules

middlewares
→ منطق يعبر request pipeline
\`\`\`

# 264. مثال Files منفصلة

\`data/courses.js\`:

\`\`\`js
const courses = [
  { id: 1, title: "JavaScript course", price: 1000 },
  { id: 2, title: "React course", price: 800 },
];

module.exports = courses;
\`\`\`

\`controllers/courses.controller.js\`:

\`\`\`js
const courses = require("../data/courses");

function getCourses(req, res) {
  res.json(courses);
}

function getCourse(req, res) {
  const id = Number(req.params.id);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
}

function createCourse(req, res) {
  const course = {
    id: courses.length + 1,
    title: req.body.title,
    price: req.body.price,
  };

  courses.push(course);

  res.status(201).json(course);
}

function updateCourse(req, res) {
  const id = Number(req.params.id);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (req.body.title !== undefined) {
    course.title = req.body.title;
  }

  if (req.body.price !== undefined) {
    course.price = req.body.price;
  }

  res.json(course);
}

function deleteCourse(req, res) {
  const id = Number(req.params.id);
  const index = courses.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  const deleted = courses.splice(index, 1)[0];

  res.json({
    message: "Course deleted",
    course: deleted,
  });
}

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
\`\`\`

# 265. Validation Middleware منفصلة

\`middlewares/validate-course.js\`:

\`\`\`js
const { body, validationResult } = require("express-validator");

const createCourseRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required")
    .isLength({ min: 2 })
    .withMessage("title must be at least 2 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("price must be a positive number"),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
}

module.exports = {
  createCourseRules,
  handleValidationErrors,
};
\`\`\`

ثم في Router:

\`\`\`js
router.post(
  "/",
  createCourseRules,
  handleValidationErrors,
  createCourse
);
\`\`\`

# 266. courses.routes.js

\`\`\`js
const express = require("express");
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses.controller");

const {
  createCourseRules,
  handleValidationErrors,
} = require("../middlewares/validate-course");

const router = express.Router();

router
  .route("/")
  .get(getCourses)
  .post(
    createCourseRules,
    handleValidationErrors,
    createCourse
  );

router
  .route("/:id")
  .get(getCourse)
  .patch(updateCourse)
  .delete(deleteCourse);

module.exports = router;
\`\`\`

# 267. app.js

\`\`\`js
const express = require("express");
const coursesRouter = require("./routes/courses.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Courses API",
    status: "running",
  });
});

app.use("/api/courses", coursesRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

module.exports = app;
\`\`\`

# 268. server.js

\`\`\`js
const app = require("./app");

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
\`\`\`

الفصل بين \`app.js\` و\`server.js\` يصبح مفيدًا لاحقًا في Testing لأنك تستطيع import للـ app بدون تشغيل network listener تلقائيًا.

# 269. رحلة POST كاملة

لو أرسلت:

\`\`\`http
POST /api/courses
Content-Type: application/json

{
  "title": "Node.js",
  "price": 1000
}
\`\`\`

فالرحلة:

\`\`\`text
Client
  ↓
Express App
  ↓
express.json()
  ↓
coursesRouter
  ↓
createCourseRules
  ↓
handleValidationErrors
  ↓
createCourse Controller
  ↓
courses.push(...)
  ↓
201 Created
  ↓
JSON Response
\`\`\`

# 270. ماذا لو Validation فشلت؟

Request:

\`\`\`json
{
  "title": "",
  "price": -5
}
\`\`\`

Pipeline:

\`\`\`text
express.json()
      ↓
validators
      ↓
validationResult()
      ↓
Errors exist
      ↓
400 Response
      X
Controller does NOT run
\`\`\`

وهذه نقطة مهمة: Validation Middleware تحمي الـ controller من input غير صالح.

# 271. In-Memory Array ليست Database

الأمثلة تستخدم:

\`\`\`js
const courses = [];
\`\`\`

لأغراض التعلم فقط.

لو أوقفت Node process ستفقد البيانات.

في المشروع الحقيقي تصبح الطبقات مثل:

\`\`\`text
Controller
   ↓
Service
   ↓
Repository / ORM
   ↓
PostgreSQL
\`\`\`

لكن CRUD concepts تبقى نفسها.

# 272. لا تثق في id القادم من URL

\`req.params.id\` تكون String.

\`\`\`js
console.log(typeof req.params.id);
// "string"
\`\`\`

لذلك:

\`\`\`js
const id = Number(req.params.id);

if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    message: "Invalid course id",
  });
}
\`\`\`

التحويل بدون validation قد ينتج \`NaN\`.

# 273. API Response Shape

يفضل أن تكون responses متناسقة.

مثال success:

\`\`\`json
{
  "data": {
    "id": 1,
    "title": "Node.js"
  }
}
\`\`\`

مثال error:

\`\`\`json
{
  "error": {
    "message": "Course not found"
  }
}
\`\`\`

ليس هناك shape واحدة إجبارية، لكن consistency مهمة للـ client.

# 274. لا ترسل كل req.body مباشرة إلى Data Layer

مثال خطر:

\`\`\`js
const user = await createUser(req.body);
\`\`\`

إذا كان req.body يحتوي حقولًا لا تريد السماح بها مثل:

\`\`\`json
{
  "name": "User",
  "role": "admin"
}
\`\`\`

فقد تقع في Mass Assignment bug حسب تصميم data layer.

الأفضل استخدام validated/whitelisted data:

\`\`\`js
const data = {
  title: req.body.title,
  price: req.body.price,
};
\`\`\`

أو Schema parser يعيد فقط الحقول المسموحة حسب إعدادك.

# 275. Mental Model النهائي

\`\`\`text
API
│
├── Resources
│   └── courses
│
├── Endpoints
│   ├── GET    /api/courses
│   ├── GET    /api/courses/:id
│   ├── POST   /api/courses
│   ├── PATCH  /api/courses/:id
│   └── DELETE /api/courses/:id
│
├── Middleware
│   ├── express.json()
│   ├── validation
│   ├── auth
│   └── error handling
│
├── Router
│
├── Controller
│
├── Service
│
└── Data / Database
\`\`\`

احفظ العلاقة التالية:

> Route تحدد **أين** يذهب request، Middleware تحدد **ما الذي يجب أن يمر به**، Controller تحدد **كيف نتعامل مع HTTP request/response**، Service تحدد **business logic**، وData layer تتعامل مع **التخزين**.

## أخطاء شائعة وتصحيحها

1. **"أي API ترجع String"** → خطأ. Response body قد تكون JSON/Text/File/Binary/Stream.
2. **"API كانت XML والآن JSON"** → تبسيط زائد. XML وJSON formats، وJSON هو الأشهر حاليًا في REST APIs.
3. **"PUT وPATCH نفس الشيء تمامًا"** → كلاهما Update لكن semantics مختلفة.
4. **"express.json() تحول أي body إلى JSON"** → هي parser للطلبات ذات JSON content المناسب، وليست لكل أنواع bodies.
5. **"body-parser لازم دائمًا"** → Express الحديثة تحتوي JSON وURL-encoded parsers built-in.
6. **"find تحذف العنصر"** → find تبحث وتعيد عنصرًا؛ الحذف يحتاج splice/filter/database operation.
7. **"findIndex تعيد العنصر"** → تعيد index أو -1.
8. **"Validation مجرد تحسين اختياري"** → في API حقيقية هي جزء أساسي من حدود الثقة.
9. **"Route = Resource"** → Resource هو الكيان، Route هي Method + Path + handler/pipeline.
10. **"Controller يجب أن يحتوي كل شيء"** → عندما يكبر المشروع افصل business logic والوصول للبيانات.

## تمارين عملية

1. أنشئ GET /api/courses.
2. أضف GET /api/courses/:id مع 404.
3. أضف POST مع express.json().
4. امنع title الفارغة وprice السالبة.
5. أضف PATCH يسمح بتعديل title أو price فقط.
6. أضف DELETE باستخدام findIndex وsplice.
7. أعد كتابة routes باستخدام app.route أو router.route.
8. افصل controllers عن routes.
9. جرّب كل endpoints في Postman.
10. جرّب إرسال Content-Type خاطئ ولاحظ النتيجة.
11. جرّب id غير رقمي.
12. جرّب request body يحتوي field غير مسموح به.
13. استبدل express-validator بـ Zod في نسخة ثانية وقارن التنظيم.

## أسئلة مراجعة

1. ما الفرق بين API وWeb API؟
2. ما معنى Endpoint؟
3. ما الفرق بين Resource وRoute؟
4. ما معنى CRUD؟
5. لماذا POST مرتبطة غالبًا بـ Create؟
6. ما الفرق بين PUT وPATCH؟
7. ماذا تعيد find إذا لم تجد عنصرًا؟
8. ماذا تعيد findIndex إذا لم تجد عنصرًا؟
9. ما الفرق بين splice وfilter؟
10. لماذا نستخدم Postman؟
11. لماذا req.body تحتاج parser؟
12. ماذا تفعل express.json()؟
13. ما دور body-parser تاريخيًا؟
14. ما الفرق بين params/query/body/headers؟
15. لماذا كل Client Input غير موثوق؟
16. ما الفرق بين Validation وSanitization؟
17. كيف تعمل express-validator كـ middleware؟
18. ما الفرق بين express-validator وJoi وZod من حيث الأسلوب؟
19. لماذا 201 مناسبة بعد Create؟
20. متى قد تستخدم 204؟
21. ماذا تفعل app.route()؟
22. لماذا نستخدم express.Router()؟
23. ما وظيفة Controller؟
24. ما وظيفة Service؟
25. لماذا فصل app.js عن server.js مفيد؟
26. لماذا In-Memory Array ليست بديلًا عن Database؟
27. لماذا يجب validate لـ req.params.id؟
28. ما خطر تمرير req.body كلها مباشرة إلى data layer؟
29. ارسم رحلة POST request من Postman حتى response.
30. كيف تتحول Raw JSON bytes إلى req.body؟
`,
};
