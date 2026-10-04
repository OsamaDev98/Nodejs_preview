import type { StudyChapter } from "@/types/study";

export const productionApiPatternsChapter: StudyChapter = {
  id: "production-api-patterns",
  number: 14,
  title: "Production API Patterns: Sequelize وJSend وENV وPagination وCORS وError Handling",
  subtitle: "تنظيم API أقرب للـ production: Sequelize وORM، response contracts، utils، environment variables، pagination، 404، CORS، async wrapper وglobal error handling.",
  readingTime: "95 دقيقة",
  keywords: ["Sequelize", "ORM", "JSend", "dotenv", "process.env", "Pagination", "skip", "limit", "CORS", "404", "async wrapper", "express-async-handler", "AppError", "Express 5"],
  content: String.raw`
# قبل أن تبدأ: الصورة الكاملة

هذا الدرس لا يضيف مجرد Packages جديدة؛ هو يجمع مجموعة Patterns تجعل الـ API أكثر تنظيمًا وأقرب لأسلوب Production.

~~~text
Browser / Frontend
      ↓
     CORS
      ↓
Global Middleware
      ↓
    Router
      ↓
Validation
      ↓
 Controller
      ↓
Service / ORM / ODM
      ↓
   Database
      ↓
Structured JSON Response

No matching route
      ↓
404 Middleware
      ↓
Global Error Handler
~~~

# 357. ما هي Sequelize؟

Sequelize هي ORM تستخدم أساسًا مع قواعد البيانات Relational / SQL مثل PostgreSQL وMySQL وMariaDB وSQLite وSQL Server.

الملاحظة "Sequelize مثل Mongoose لكن لقواعد بيانات أخرى" مفيدة للتقريب، لكن ليست دقيقة بالكامل.

~~~text
Mongoose
  ↓
MongoDB
Document Database

Sequelize
  ↓
SQL Database
Tables / Rows / Relations
~~~

# 358. ORM vs ODM

ORM = Object Relational Mapping.

ODM = Object Document Mapping / Modeling.

~~~text
ORM
Objects ↔ Tables/Rows
         ↓
PostgreSQL / MySQL

ODM
Objects ↔ Documents
         ↓
MongoDB
~~~

Mongoose أقرب لـ ODM، بينما Sequelize ORM.

# 359. مثال Sequelize Model

~~~js
const { DataTypes } = require("sequelize");
const sequelize = require("./database");

const Course = sequelize.define("Course", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
});
~~~

ثم:

~~~js
const courses = await Course.findAll();
~~~

أو:

~~~js
const course = await Course.create({
  title: "Node.js",
  price: 1000,
});
~~~

# 360. هل Sequelize بديل مباشر لـ Mongoose؟

لا تختار بينهما قبل تحديد نوع قاعدة البيانات.

~~~text
MongoDB
→ MongoDB Driver
→ أو Mongoose

SQL Database
→ Driver / Query Builder
→ أو ORM مثل Sequelize
~~~

إذن لو مشروعك MongoDB، Sequelize ليست الاختيار الطبيعي بدل Mongoose.

# 361. ما هي JSend؟

JSend ليست Package ضرورية. هي Specification / Convention لتنظيم شكل JSON responses.

الهدف أن Frontend وBackend يتفقان على Response Contract ثابت.

بدل أن Endpoint ترجع:

~~~json
{ "course": {} }
~~~

وأخرى:

~~~json
{ "result": {} }
~~~

تستخدم Structure موحدة.

# 362. حالات JSend

JSend تعتمد ثلاث حالات أساسية:

~~~text
success
fail
error
~~~

هذه ليست بديلًا عن HTTP Status Codes.

# 363. success

~~~json
{
  "status": "success",
  "data": {
    "course": {
      "id": 1,
      "title": "Node.js"
    }
  }
}
~~~

Express:

~~~js
res.status(200).json({
  status: "success",
  data: { course },
});
~~~

# 364. fail

fail تستخدم لمشكلة متوقعة مرتبطة بالطلب أو البيانات.

~~~json
{
  "status": "fail",
  "data": {
    "title": "title is required"
  }
}
~~~

# 365. error

error تستخدم عادة لمشكلة أثناء تنفيذ الطلب.

~~~json
{
  "status": "error",
  "message": "Internal Server Error"
}
~~~

في Production لا ترسل stack trace أو أسرار داخلية للعميل.

# 366. HTTP Status ليست JSend Status

HTTP:

~~~text
200
201
400
404
500
~~~

Application response:

~~~text
success
fail
error
~~~

مثال:

~~~js
res.status(404).json({
  status: "fail",
  data: {
    message: "Course not found",
  },
});
~~~

# 367. Constants

بدل تكرار strings في كل Controller:

~~~js
const HTTP_STATUS_TEXT = {
  SUCCESS: "success",
  FAIL: "fail",
  ERROR: "error",
};

module.exports = HTTP_STATUS_TEXT;
~~~

ثم:

~~~js
status: HTTP_STATUS_TEXT.SUCCESS
~~~

هذا يقلل spelling mistakes ويوحد المعاني.

# 368. لماذا UPPER_CASE؟

هي Naming Convention، وليست قاعدة JavaScript.

~~~js
const MAX_PAGE_SIZE = 100;
const API_VERSION = "v1";
~~~

لكن هذا طبيعي أيضًا:

~~~js
const user = {};
~~~

كون المتغير const لا يعني أن كل اسمه يجب أن يكون uppercase.

# 369. utils folder

utils يحتوي Helpers أو Constants عامة يمكن أن تستخدمها أجزاء مختلفة.

~~~text
utils/
├── httpStatusText.js
├── AppError.js
├── pagination.js
└── logger.js
~~~

لكن لا تجعل utils مكانًا لكل شيء. Business Logic الخاصة بـ Courses مثلًا يفضل أن تبقى في Service/Domain مناسب.

# 370. ما هو .env؟

ملف .env يستخدم عادة لتخزين Configuration تختلف بين البيئات.

~~~env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/courses
NODE_ENV=development
JWT_SECRET=replace-me
~~~

مناسب للـ database URLs، API keys، ports وsecrets.

# 371. process.env

Node توفر process object، وداخلها process.env.

~~~js
const port = process.env.PORT;

console.log(port);
~~~

Mental model:

~~~text
OS / Shell / Env Loader
        ↓
Environment Variables
        ↓
Node.js Process
        ↓
process.env
~~~

# 372. Environment Variables غالبًا Strings

~~~env
PORT=4000
PAGE_LIMIT=10
~~~

داخل التطبيق اعمل parsing:

~~~js
const port = Number(
  process.env.PORT || 4000
);

const pageLimit = Number(
  process.env.PAGE_LIMIT || 10
);
~~~

ولا تفترض أن Configuration صحيحة؛ اعمل Validation عند startup.

# 373. dotenv

الطريقة الشائعة:

~~~bash
npm install dotenv
~~~

ثم:

~~~js
require("dotenv").config();
~~~

فتصبح القيم متاحة في process.env.

# 374. هل dotenv لازمة دائمًا؟

لا. Node الحديثة تدعم Env Files مباشرة أيضًا.

~~~bash
node --env-file=.env server.js
~~~

ثم:

~~~js
console.log(process.env.PORT);
~~~

إذن dotenv شائعة، لكنها ليست الطريقة الوحيدة.

# 375. لا ترفع .env إلى Git

عادة:

~~~gitignore
.env
.env.local
.env.production
~~~

لكن ارفع ملفًا مثل:

~~~text
.env.example
~~~

وفيه أسماء المتغيرات بدون secrets حقيقية.

# 376. Config Module

بدل process.env المبعثرة:

~~~js
const config = {
  port: Number(
    process.env.PORT || 4000
  ),
  mongoUri:
    process.env.MONGODB_URI,
  nodeEnv:
    process.env.NODE_ENV ||
    "development",
};

if (!config.mongoUri) {
  throw new Error(
    "MONGODB_URI is required"
  );
}

module.exports = config;
~~~

هذا يجعل التطبيق يفشل مبكرًا لو Configuration ناقصة.

# 377. ما هي Pagination؟

إذا عندك 100,000 record، لا ترجعهم كلهم في Request واحدة.

~~~text
Page 1 → items 1..10
Page 2 → items 11..20
Page 3 → items 21..30
~~~

مثال:

~~~text
GET /api/courses?page=2&limit=10
~~~

# 378. page وlimit

~~~js
const page =
  Number(req.query.page) || 1;

const limit =
  Number(req.query.limit) || 10;
~~~

page = الصفحة المطلوبة.

limit = عدد العناصر في الصفحة.

# 379. معادلة skip

Offset Pagination:

~~~text
skip = (page - 1) * limit
~~~

لو page=3 وlimit=10:

~~~text
skip = (3 - 1) * 10
skip = 20
~~~

أي نتجاوز أول 20 عنصرًا ثم نأخذ 10.

# 380. Pagination مع Mongoose

~~~js
const page = Math.max(
  1,
  Number(req.query.page) || 1
);

const limit = Math.min(
  100,
  Math.max(
    1,
    Number(req.query.limit) || 10
  )
);

const skip =
  (page - 1) * limit;

const courses = await Course
  .find()
  .skip(skip)
  .limit(limit);
~~~

Maximum Limit مهمة حتى لا يطلب Client كمية ضخمة جدًا.

# 381. هل find جلبت كل البيانات قبل skip؟

لا.

Mongoose Query methods تبني Database Query.

~~~js
Course.find()
  .skip(skip)
  .limit(limit);
~~~

عند التنفيذ/await ترسل Query مناسبة للـ database. لا تتخيل أن JavaScript حملت كل Documents ثم حذفت أول N عنصر داخل Array.

# 382. totalItems وtotalPages

~~~js
const totalItems =
  await Course.countDocuments();

const totalPages = Math.ceil(
  totalItems / limit
);
~~~

Response:

~~~json
{
  "status": "success",
  "data": {
    "courses": []
  },
  "pagination": {
    "page": 2,
    "limit": 10,
    "totalItems": 57,
    "totalPages": 6
  }
}
~~~

# 383. Pagination Controller كامل

~~~js
async function getCourses(req, res) {
  const page = Math.max(
    1,
    Number(req.query.page) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(req.query.limit) || 10
    )
  );

  const skip =
    (page - 1) * limit;

  const [
    courses,
    totalItems,
  ] = await Promise.all([
    Course.find()
      .skip(skip)
      .limit(limit)
      .lean(),

    Course.countDocuments(),
  ]);

  res.json({
    status: "success",
    data: { courses },
    pagination: {
      page,
      limit,
      totalItems,
      totalPages:
        Math.ceil(
          totalItems / limit
        ),
    },
  });
}
~~~

# 384. هل skip دائمًا الأفضل؟

لا. Offset Pagination سهلة، لكنها قد تصبح أقل كفاءة مع offsets ضخمة.

~~~text
skip 500000
limit 20
~~~

في أنظمة كبيرة قد تستخدم Cursor-based Pagination أو Range Pagination اعتمادًا على _id أو createdAt مع Index مناسب.

# 385. 404 Handler

بعد تسجيل Routes:

~~~js
app.use(
  "/api/courses",
  coursesRouter
);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    data: {
      message: "Route not found",
    },
  });
});
~~~

لو Request وصلت لهذه النقطة، Routes السابقة لم تنه request-response cycle.

# 386. Catch-all باستخدام app.all

في Express 5، wildcard يجب أن تكون named.

~~~js
app.all(
  "/*splat",
  (req, res) => {
    res.status(404).json({
      status: "fail",
      data: {
        message: "Route not found",
      },
    });
  }
);
~~~

ولو تريد Root أيضًا:

~~~js
app.all(
  "/{*splat}",
  (req, res) => {
    res.status(404).json({
      status: "fail",
      data: {
        message: "Route not found",
      },
    });
  }
);
~~~

# 387. لماذا app.all("*") قد تفشل في Express 5؟

Express 5 غيرت Path Matching Syntax. Wildcard تحتاج اسمًا.

بدل:

~~~text
*
~~~

استخدم:

~~~text
/*splat
~~~

أو:

~~~text
/{*splat}
~~~

ولهذا قد ترى Missing parameter name من path-to-regexp عند استخدام syntax قديمة.

# 388. 404 ليست Error Middleware تلقائيًا

هذه:

~~~js
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});
~~~

Normal Middleware.

Error Middleware signature هي:

~~~js
(err, req, res, next)
~~~

# 389. تحويل 404 إلى Error Pipeline

~~~js
app.use(
  (req, res, next) => {
    const error = new Error(
      "Route not found: " +
        req.originalUrl
    );

    error.statusCode = 404;

    next(error);
  }
);
~~~

عند next(error)، Express تنتقل إلى Error-handling Middleware.

# 390. AppError Class

~~~js
class AppError extends Error {
  constructor(
    message,
    statusCode
  ) {
    super(message);

    this.statusCode =
      statusCode;

    this.isOperational =
      true;
  }
}

module.exports = AppError;
~~~

الاستخدام:

~~~js
return next(
  new AppError(
    "Course not found",
    404
  )
);
~~~

# 391. لماذا نمدد Error؟

Error العادية فيها message وstack.

لكن API تحتاج Metadata إضافية مثل statusCode أو error code أو isOperational.

Custom Error تجعل الأخطاء موحدة وقابلة للمعالجة مركزيًا.

# 392. Global Error Handler

~~~js
app.use(
  (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    const statusCode =
      err.statusCode || 500;

    res
      .status(statusCode)
      .json({
        status:
          statusCode >= 500
            ? "error"
            : "fail",

        message:
          statusCode >= 500
            ? "Internal Server Error"
            : err.message,
      });
  }
);
~~~

وجود أربعة Parameters مهم في Express لتعريف Error Handler.

# 393. Middleware Order

~~~text
CORS
 ↓
Body Parser
 ↓
Routes
 ↓
404
 ↓
Global Error Handler
~~~

الترتيب جزء من Logic التطبيق.

# 394. مشكلة Async Errors في Express 4

في Express 4 كان شائعًا أن تكتب:

~~~js
app.get(
  "/courses",
  async (req, res, next) => {
    try {
      const courses =
        await Course.find();

      res.json(courses);
    } catch (error) {
      next(error);
    }
  }
);
~~~

مع كثرة Controllers يصبح try/catch متكررًا.

# 395. Async Wrapper

Async Wrapper هي Higher-Order Function.

~~~js
function asyncWrapper(
  controller
) {
  return function (
    req,
    res,
    next
  ) {
    Promise
      .resolve(
        controller(
          req,
          res,
          next
        )
      )
      .catch(next);
  };
}
~~~

ثم:

~~~js
router.get(
  "/",
  asyncWrapper(
    async (req, res) => {
      const courses =
        await Course.find();

      res.json({
        status: "success",
        data: { courses },
      });
    }
  )
);
~~~

# 396. لماذا Higher-Order Function؟

لأنها تأخذ Function وتعيد Function أخرى.

~~~text
Controller
   ↓
asyncWrapper(controller)
   ↓
Express Middleware جديدة
~~~

# 397. express-async-handler

Package جاهزة لنفس الفكرة الأساسية:

~~~bash
npm install express-async-handler
~~~

~~~js
const asyncHandler =
  require(
    "express-async-handler"
  );

router.get(
  "/",
  asyncHandler(
    async (req, res) => {
      const courses =
        await Course.find();

      res.json({
        status: "success",
        data: { courses },
      });
    }
  )
);
~~~

# 398. هل express-async-handler ضرورية مع Express 5؟

غالبًا لا تحتاجها **لنفس غرض التقاط rejected promises من async handlers**.

Express 5 تمرر rejected Promise أو thrown error من async handler إلى Error Pipeline تلقائيًا.

~~~js
app.get(
  "/courses",
  async (req, res) => {
    const courses =
      await Course.find();

    res.json(courses);
  }
);
~~~

هذه نقطة مهمة لأن كثيرًا من الكورسات القديمة مبنية على Express 4.

# 399. هل Async Wrapper أصبحت بلا فائدة؟

لا.

تفيدك لفهم Higher-Order Functions وPromise Error Forwarding، وفي Legacy Projects أو لو Wrapper تضيف Logging/Metrics/Behavior آخر.

لكن لا تثبت Package لمجرد أن Tutorial قديم استخدمها.

# 400. Callback-based Async Errors

لا تفترض أن كل Async Error ستلتقطها Express تلقائيًا.

~~~js
fs.readFile(
  "missing.txt",
  (error, data) => {
    if (error) {
      // تعامل مع الخطأ
    }
  }
);
~~~

Express 5 automatic forwarding تتعلق بالـ handlers التي تعيد Promise/reject بالشكل الذي تستطيع Express متابعته.

# 401. ما هي CORS؟

CORS = Cross-Origin Resource Sharing.

هي آلية تعتمد على HTTP Headers تسمح للـ Browser بتحديد هل JavaScript من Origin معينة مسموح لها بقراءة Response من Origin أخرى.

CORS ليست Authentication وليست Firewall.

# 402. ما هي Origin؟

Origin تتكون من:

~~~text
scheme + host + port
~~~

لذلك:

~~~text
http://localhost:4000
~~~

مختلفة عن:

~~~text
http://localhost:8080
~~~

# 403. لماذا يظهر CORS Error؟

لو Frontend:

~~~text
http://127.0.0.1:8080
~~~

والـ Backend:

~~~text
http://localhost:4000
~~~

فهذه Origins مختلفة. إذا Server لا ترسل CORS Headers المناسبة، Browser قد تمنع JavaScript من قراءة Response.

# 404. لماذا Postman تعمل والـ Browser لا؟

CORS Enforcement يحدث أساسًا في Browsers.

لذلك قد ترى:

~~~text
Postman → works
Browser → blocked by CORS
~~~

لا تستخدم CORS كطريقة لحماية API من curl أو server-to-server clients.

# 405. cors package

~~~bash
npm install cors
~~~

ثم:

~~~js
const cors = require("cors");

app.use(cors());
~~~

هذا مناسب كبداية، لكنه ليس دائمًا أفضل Production Configuration.

# 406. تقييد Origin

~~~js
app.use(
  cors({
    origin:
      "https://example.com",
  })
);
~~~

Allowlist:

~~~js
const allowedOrigins = [
  "https://example.com",
  "https://admin.example.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      callback(
        new Error(
          "Origin not allowed"
        )
      );
    },
  })
);
~~~

# 407. Preflight Request

في بعض Cross-Origin Requests ترسل Browser:

~~~http
OPTIONS /api/courses
~~~

قبل Request الفعلية.

هذا يسمى Preflight، وتتحقق Browser من السماح بالـ Origin والـ Method والـ Headers وغيرها.

# 408. أشهر CORS Headers

~~~text
Access-Control-Allow-Origin
Access-Control-Allow-Methods
Access-Control-Allow-Headers
Access-Control-Allow-Credentials
~~~

Package cors تديرها حسب Configuration.

# 409. Credentials

مع Cookies cross-origin:

~~~js
app.use(
  cors({
    origin:
      "https://example.com",
    credentials: true,
  })
);
~~~

Frontend:

~~~js
fetch(url, {
  credentials: "include",
});
~~~

لا تستخدم Wildcard Origin مع Credentials بشكل عشوائي.

# 410. CORS ليست Security Boundary كاملة

Attacker يستطيع استخدام curl أو Postman أو Backend Script.

إذن الحماية الحقيقية تحتاج Authentication وAuthorization وValidation وسياسات أمنية مناسبة.

# 411. Response Helper

~~~js
function sendSuccess(
  res,
  data,
  statusCode = 200
) {
  return res
    .status(statusCode)
    .json({
      status: "success",
      data,
    });
}
~~~

ثم:

~~~js
return sendSuccess(
  res,
  { courses },
  200
);
~~~

لكن لا تبالغ في Abstraction.

# 412. Development vs Production Errors

في Development قد تعرض stack للمطور.

في Production لا تعرض Internal Details للعميل.

~~~js
const isDevelopment =
  process.env.NODE_ENV ===
  "development";
~~~

# 413. Operational vs Programmer Error

Operational Error:

- Resource not found.
- Validation failed.
- Duplicate key.
- Authentication failed.

Programmer Error:

- Undefined variable.
- Bug في logic.
- استدعاء Function بطريقة خاطئة.

التمييز مهم للـ logging والـ monitoring والتعامل مع failures.

# 414. Folder Structure

~~~text
src/
├── app.js
├── server.js
├── config/
│   └── env.js
├── controllers/
│   └── courses.controller.js
├── routes/
│   └── courses.routes.js
├── models/
│   └── course.model.js
├── services/
│   └── courses.service.js
├── middleware/
│   ├── notFound.js
│   ├── errorHandler.js
│   └── asyncWrapper.js
└── utils/
    ├── AppError.js
    ├── httpStatusText.js
    └── pagination.js
~~~

هذه ليست قاعدة إجبارية، لكنها فصل منطقي للمسؤوليات.

# 415. Pagination Helper

~~~js
function getPagination(query) {
  const page = Math.max(
    1,
    Number(query.page) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(query.limit) || 10
    )
  );

  return {
    page,
    limit,
    skip:
      (page - 1) * limit,
  };
}

module.exports = getPagination;
~~~

# 416. Controller منظم

~~~js
const getPagination =
  require(
    "../utils/pagination"
  );

async function getCourses(
  req,
  res
) {
  const {
    page,
    limit,
    skip,
  } = getPagination(
    req.query
  );

  const [
    courses,
    totalItems,
  ] = await Promise.all([
    Course.find()
      .skip(skip)
      .limit(limit)
      .lean(),

    Course.countDocuments(),
  ]);

  res.json({
    status: "success",
    data: { courses },
    pagination: {
      page,
      limit,
      totalItems,
      totalPages:
        Math.ceil(
          totalItems / limit
        ),
    },
  });
}
~~~

# 417. notFound Middleware

~~~js
const AppError =
  require(
    "../utils/AppError"
  );

function notFound(
  req,
  res,
  next
) {
  next(
    new AppError(
      "Route not found: " +
        req.originalUrl,
      404
    )
  );
}

module.exports = notFound;
~~~

# 418. Error Handler منفصلة

~~~js
function errorHandler(
  err,
  req,
  res,
  next
) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    err.statusCode || 500;

  res
    .status(statusCode)
    .json({
      status:
        statusCode >= 500
          ? "error"
          : "fail",
      message:
        statusCode >= 500
          ? "Internal Server Error"
          : err.message,
    });
}

module.exports = errorHandler;
~~~

# 419. app.js النهائي

~~~js
const express =
  require("express");

const cors =
  require("cors");

const coursesRouter =
  require(
    "./routes/courses.routes"
  );

const notFound =
  require(
    "./middleware/notFound"
  );

const errorHandler =
  require(
    "./middleware/errorHandler"
  );

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api/courses",
  coursesRouter
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
~~~

# 420. server.js وEnvironment

~~~js
require("dotenv").config();

const app =
  require("./app");

const port = Number(
  process.env.PORT || 4000
);

app.listen(
  port,
  () => {
    console.log(
      "Server running on port " +
        port
    );
  }
);
~~~

أو مع Node Env File Support:

~~~bash
node --env-file=.env server.js
~~~

# 421. Mental Model النهائي

~~~text
Environment / .env
        ↓
      Config
        ↓
Browser Request
        ↓
      CORS
        ↓
 Body Parsing
        ↓
      Router
        ↓
   Validation
        ↓
   Controller
        ↓
     Service
        ↓
ORM / ODM / Driver
        ↓
    Database
        ↓
Structured Response

No Matching Route
        ↓
       404
        ↓
Global Error Handler

Rejected Async Handler
        ↓
Express 5 Promise Forwarding
or Wrapper in older patterns
        ↓
Global Error Handler
~~~

## أخطاء شائعة وتصحيحها

1. **Sequelize = Mongoose لكل Database** → تبسيط غير دقيق؛ Sequelize ORM لقواعد SQL أساسًا.
2. **JSend Package لازم تثبيتها** → لا؛ هي Specification/Convention.
3. **JSend status تغني عن HTTP status** → خطأ.
4. **كل const يجب أن تكون UPPER_CASE** → خطأ.
5. **.env تشفر Secrets** → خطأ؛ هي Plain Text.
6. **dotenv جزء من Node** → لا؛ Package خارجية.
7. **process.env.PORT Number** → غالبًا String.
8. **skip = page * limit** → خطأ؛ الصحيح المعتاد (page - 1) * limit.
9. **Pagination = limit فقط** → لا.
10. **app.all("*") تعمل بنفس الطريقة في Express 5** → لا؛ Wildcard Syntax تغيرت.
11. **404 هي Error Middleware تلقائيًا** → لا.
12. **express-async-handler ضرورية دائمًا** → لا، خصوصًا مع Promise forwarding في Express 5.
13. **CORS تمنع Postman وcurl** → خطأ.
14. **نفس host يعني نفس Origin دائمًا** → خطأ؛ Scheme وPort أيضًا مهمان.
15. **app.use(cors()) أفضل Production config دائمًا** → ليس بالضرورة.
16. **Global Error Handler يجب أن تسبق Routes** → خطأ.

## تمارين عملية

1. أنشئ httpStatusText.js.
2. وحد Response Shapes.
3. أنشئ .env تحتوي PORT.
4. اقرأ PORT من process.env.
5. جرب dotenv ثم --env-file.
6. أنشئ .env.example.
7. أضف page وlimit.
8. احسب skip للصفحات 1 و2 و3.
9. أضف totalItems وtotalPages.
10. ضع maximum للـ limit.
11. أنشئ 404 middleware.
12. جرب wildcard القديمة في Express 5 ثم named wildcard.
13. أنشئ AppError.
14. أنشئ Global Error Handler.
15. اكتب asyncWrapper بنفسك.
16. جرب express-async-handler.
17. في Express 5 جرب async route ترمي Error بدون wrapper.
18. شغل Frontend وBackend على ports مختلفة.
19. أضف cors.
20. قيد CORS على Origin محددة.
21. راقب OPTIONS preflight.
22. رتب Middleware بالترتيب الصحيح.

## أسئلة مراجعة

1. ما هي Sequelize؟
2. ما الفرق بين ORM وODM؟
3. هل Sequelize بديل مباشر لـ Mongoose مع MongoDB؟
4. ما هي JSend؟
5. ما الحالات الأساسية في JSend؟
6. ما الفرق بين HTTP Status وJSend Status؟
7. لماذا نستخدم Constants؟
8. هل كل const يجب أن تكون UPPER_CASE؟
9. ما وظيفة utils folder؟
10. ما هي .env؟
11. ما هي process.env؟
12. لماذا Environment Variables تحتاج Parsing؟
13. ماذا تفعل dotenv؟
14. هل dotenv ضرورية دائمًا؟
15. لماذا لا نرفع .env إلى Git؟
16. ما فائدة .env.example؟
17. لماذا Config Module أفضل؟
18. ما هي Pagination؟
19. ما الفرق بين page وlimit؟
20. ما معادلة skip؟
21. ما قيمة skip إذا page=3 وlimit=10؟
22. لماذا نضع Maximum للـ limit؟
23. ما دور countDocuments؟
24. كيف نحسب totalPages؟
25. لماذا skip قد تصبح مكلفة؟
26. ما هي 404 Handler؟
27. لماذا توضع بعد Routes؟
28. ما الفرق بين 404 وError Middleware؟
29. لماذا app.all("*") قد تفشل في Express 5؟
30. ما الفرق بين /*splat و/{*splat}؟
31. لماذا ننشئ AppError؟
32. ما وظيفة Global Error Handler؟
33. لماذا Middleware Order مهم؟
34. ما مشكلة Async Handlers في Express 4؟
35. ما هي Async Wrapper؟
36. لماذا هي Higher-Order Function؟
37. ماذا تفعل express-async-handler؟
38. هل تحتاجها عادة في Express 5 لنفس الغرض؟
39. ما هي CORS؟
40. ما هي Origin؟
41. لماذا localhost:4000 وlocalhost:8080 مختلفتان؟
42. هل CORS تحمي API من curl وPostman؟
43. ما هي Preflight Request؟
44. ما وظيفة Access-Control-Allow-Origin؟
45. متى نستخدم credentials: true؟
46. لماذا لا نعتمد على CORS بدل Authentication؟
47. لماذا لا نرسل Stack Trace في Production؟
48. ما الفرق بين Operational Error وProgrammer Error؟
49. ما ترتيب Middleware الأساسية؟
50. ارسم رحلة Request من Browser إلى Database ثم Response أو Error Handler.
`,
};
