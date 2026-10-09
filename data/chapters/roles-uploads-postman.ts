import type { StudyChapter } from "@/types/study";

export const rolesUploadsPostmanChapter: StudyChapter = {
  id: "roles-uploads-postman",
  number: 16,
  title: "Roles & Permissions وPostman Environments وFile Uploads",
  subtitle: "تنظيم اختبار الـ API في Postman، Role-Based Authorization، Higher-Order Middleware، Rest Parameters، رفع الملفات بـ multipart/form-data وMulter، التخزين، fileFilter، limits وخدمة الملفات بأمان.",
  readingTime: "105 دقيقة",
  keywords: ["Postman", "Environment", "Variables", "Roles", "Permissions", "RBAC", "Authorization", "Rest Parameters", "Multer", "multipart/form-data", "File Upload", "diskStorage", "fileFilter", "express.static"],
  content: String.raw`
# قبل أن تبدأ: Mental Model

هذا الفصل يكمل Authentication وJWT عمليًا:

~~~text
Login
  ↓
JWT
  ↓
Postman Environment
  ↓
Protected Route
  ↓
Authentication Middleware
  ↓
Authorization / Roles
  ↓
Controller

File Upload
  ↓
multipart/form-data
  ↓
Multer
  ↓
req.file / req.files
  ↓
Storage + Database Metadata
~~~

# 503. لماذا Postman Collection؟

Collection تجمع Requests الخاصة بمشروع واحد بدل تركها متفرقة.

~~~text
Node API
├── Auth
│   ├── Register
│   └── Login
├── Users
│   ├── Get Users
│   └── Delete User
└── Courses
    ├── Get Courses
    ├── Create Course
    └── Delete Course
~~~

الفائدة: تنظيم، مشاركة، إعادة استخدام Variables، Tests وScripts.

# 504. Postman Environment

Environment هي مجموعة Variables لبيئة معينة.

~~~text
Development
BASE_URL = http://localhost:4000
JWT = ...

Production
BASE_URL = https://api.example.com
JWT = ...
~~~

بدل:

~~~text
http://localhost:4000/api/users/login
~~~

استخدم:

~~~text
{{BASE_URL}}/api/users/login
~~~

# 505. لماذا Variables مفيدة؟

إذا تغير Port أو Domain تعدل Variable واحدة فقط.

أمثلة:

- BASE_URL
- JWT
- USER_ID
- COURSE_ID
- API_VERSION

# 506. حفظ JWT تلقائيًا بعد Login

لو Response:

~~~json
{
  "status": "success",
  "data": {
    "token": "eyJ..."
  }
}
~~~

في Post-response Script:

~~~js
const body = pm.response.json();

pm.environment.set(
  "JWT",
  body.data.token
);
~~~

ثم تستخدم:

~~~text
Authorization: Bearer {{JWT}}
~~~

# 507. Environment ليست Secret Manager

Variables مفيدة للاختبار، لكنها قد تحتوي Tokens حساسة.

لا تشارك Environment فيها Production Secrets بلا داعٍ، واستخدم Secret/Masked Variables عندما تكون متاحة ومناسبة.

# 508. Roles وPermissions

Authentication تجيب:

~~~text
من هو المستخدم؟
~~~

Authorization تجيب:

~~~text
ماذا يسمح له أن يفعل؟
~~~

قد يكون لديك Roles:

~~~text
user
manager
admin
~~~

# 509. Role داخل User Schema

~~~js
role: {
  type: String,
  enum: [
    "user",
    "manager",
    "admin",
  ],
  default: "user",
}
~~~

enum تمنع قيمًا خارج القائمة على مستوى Mongoose Validation.

# 510. Role ليست Permission

Role تصنيف أو مجموعة Permissions.

Permission عملية محددة.

~~~text
Role: admin

Permissions:
users:read
users:delete
courses:create
courses:update
~~~

في Project صغير قد يكفي Role Check. في Project أكبر Permissions أكثر مرونة.

# 511. RBAC

RBAC = Role-Based Access Control.

~~~text
User
  ↓
Role
  ↓
Allowed Actions
~~~

مثال:

~~~text
Admin → delete user
Manager → edit course
User → read course
~~~

# 512. Route محمية على مرحلتين

~~~js
router.delete(
  "/:id",
  verifyToken,
  userAllowed(
    "admin",
    "manager"
  ),
  removeUser
);
~~~

الترتيب:

~~~text
verifyToken
   ↓
req.user
   ↓
userAllowed
   ↓
Controller
~~~

# 513. لماذا Authorization بعد Authentication؟

لأن Authorization تحتاج تعرف المستخدم أولًا.

~~~js
req.user.role
~~~

لن تكون موثوقة قبل Verify Token أو تحميل User.

# 514. Higher-Order Authorization Middleware

~~~js
const userAllowed =
  (...allowedRoles) => {
    return (
      req,
      res,
      next
    ) => {
      const userRole =
        req.user.role;

      if (
        !allowedRoles.includes(
          userRole
        )
      ) {
        return res
          .status(403)
          .json({
            message:
              "Forbidden",
          });
      }

      next();
    };
  };
~~~

هي Higher-Order Function لأنها ترجع Middleware Function.

# 515. ...allowedRoles هنا Rest Parameter

في Function Parameters:

~~~js
function userAllowed(
  ...allowedRoles
) {}
~~~

استدعاء:

~~~js
userAllowed(
  "admin",
  "manager"
);
~~~

داخل Function:

~~~js
[
  "admin",
  "manager",
]
~~~

# 516. Rest vs Spread

نفس syntax \`...\`، لكن حسب السياق.

Rest = يجمع:

~~~js
function example(...values) {
  console.log(values);
}
~~~

Spread = يفرد:

~~~js
const roles = [
  "admin",
  "manager",
];

const allRoles = [
  ...roles,
  "user",
];
~~~

احفظ:

~~~text
Rest = collect
Spread = expand
~~~

# 517. includes()

~~~js
allowedRoles.includes(
  req.user.role
)
~~~

تعيد \`true\` أو \`false\`.

# 518. 401 vs 403

~~~text
401
Authentication missing/invalid

403
Authenticated but not allowed
~~~

لو User عادية تحاول Admin Route: 403.

# 519. لا تثق في role من req.body

خطأ:

~~~js
const role =
  req.body.role;
~~~

ثم تعتمد عليها للصلاحيات.

Client تستطيع إرسال:

~~~json
{
  "role": "admin"
}
~~~

الصلاحية يجب أن تأتي من مصدر Server-controlled موثوق.

# 520. Role داخل JWT: فائدة ومشكلة

يمكن:

~~~js
jwt.sign(
  {
    userId: user._id,
    role: user.role,
  },
  secret
);
~~~

لكن إذا تغيرت Role في Database، Token القديمة قد تظل تحمل القيمة القديمة حتى تنتهي.

لهذا بعض الأنظمة تعمل DB lookup أو Token Versioning/Revocation.

# 521. Permission-based Middleware

~~~js
const requirePermission =
  (permission) => {
    return (
      req,
      res,
      next
    ) => {
      const permissions =
        req.user.permissions ||
        [];

      if (
        !permissions.includes(
          permission
        )
      ) {
        return res
          .status(403)
          .json({
            message:
              "Forbidden",
          });
      }

      next();
    };
  };
~~~

ثم:

~~~js
router.delete(
  "/:id",
  verifyToken,
  requirePermission(
    "users:delete"
  ),
  removeUser
);
~~~

# 522. File Upload ليست JSON

رفع File حقيقية لا يتم عادة بإرسال JSON عادية.

نستخدم غالبًا:

~~~text
multipart/form-data
~~~

لأن Request قد تحتوي Text Fields + Binary File.

# 523. multipart/form-data

Request تقسم إلى Parts:

~~~text
Part 1
title = Node.js

Part 2
price = 1000

Part 3
avatar = binary bytes
~~~

كل Part لها Headers وBody.

# 524. لماذا express.json() لا تكفي؟

\`express.json()\` مخصصة لـ JSON bodies.

\`multipart/form-data\` تحتاج Parser متخصص.

وهنا تأتي Multer.

# 525. ما هي Multer؟

Multer Middleware لـ Express لمعالجة:

~~~text
multipart/form-data
~~~

وتستخدم كثيرًا في File Uploads.

~~~bash
npm install multer
~~~

# 526. مكان Multer في Pipeline

~~~text
Request
  ↓
Multer
  ↓
req.file / req.files
  ↓
Controller
~~~

مثال:

~~~js
router.post(
  "/avatar",
  upload.single("avatar"),
  uploadAvatar
);
~~~

# 527. upload.single()

~~~js
upload.single("avatar")
~~~

تعني File واحدة في Form Field اسمها \`avatar\`.

بعدها:

~~~js
req.file
~~~

والـ Text Fields عادة في:

~~~js
req.body
~~~

# 528. اسم Field يجب أن يطابق Postman

Server:

~~~js
upload.single("avatar")
~~~

Postman:

~~~text
Body → form-data
Key: avatar
Type: File
~~~

لو الاسم مختلف، لن تتعامل Middleware معها كما تتوقع.

# 529. upload.array()

عدة Files لنفس Field:

~~~js
upload.array(
  "photos",
  5
);
~~~

ثم:

~~~js
req.files
~~~

Array، وبحد أقصى 5 هنا.

# 530. upload.fields()

~~~js
upload.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
  {
    name: "gallery",
    maxCount: 5,
  },
]);
~~~

هنا \`req.files\` تكون Object مقسمة حسب Field names.

# 531. MemoryStorage vs DiskStorage

Memory:

~~~text
File → RAM Buffer → req.file.buffer
~~~

Disk:

~~~text
File → Disk → req.file.path
~~~

الاختيار حسب Architecture.

# 532. MemoryStorage تحتاج Limits

File كبيرة في RAM قد تستهلك Memory بسرعة.

لذلك لا تستخدمها بلا:

- fileSize limit.
- concurrency planning.
- storage flow واضح.

مفيدة عندما سترفع Buffer مباشرة إلى Object Storage.

# 533. DiskStorage

~~~js
const multer =
  require("multer");

const storage =
  multer.diskStorage({
    destination(
      req,
      file,
      cb
    ) {
      cb(
        null,
        "uploads/"
      );
    },

    filename(
      req,
      file,
      cb
    ) {
      const uniqueName =
        Date.now() +
        "-" +
        file.originalname;

      cb(
        null,
        uniqueName
      );
    },
  });

const upload =
  multer({
    storage,
  });
~~~

هذا Example تعليمي، وسنحسن Filename بعد قليل.

# 534. لماذا لا نستخدم originalname وحدها؟

لو مستخدمان رفعا:

~~~text
avatar.png
~~~

قد يحدث Collision أو Overwrite حسب النظام.

كما أن Filename من Client ليست قيمة موثوقة.

# 535. Filename عشوائية Server-controlled

~~~js
const crypto =
  require("node:crypto");

const path =
  require("node:path");

function createFileName(
  file
) {
  const ext =
    path.extname(
      file.originalname
    );

  const id =
    crypto
      .randomBytes(16)
      .toString("hex");

  return id + ext;
}
~~~

في Systems أكثر حساسية قد تحدد Extension بعد فحص نوع المحتوى بدل الثقة في originalname.

# 536. fileFilter

~~~js
const upload =
  multer({
    storage,

    fileFilter(
      req,
      file,
      cb
    ) {
      const allowed =
        [
          "image/jpeg",
          "image/png",
        ].includes(
          file.mimetype
        );

      if (allowed) {
        return cb(
          null,
          true
        );
      }

      cb(
        new Error(
          "Only images allowed"
        )
      );
    },
  });
~~~

# 537. mimetype ليست إثباتًا أمنيًا كافيًا

\`file.mimetype\` تأتي من Multipart Metadata ويمكن التلاعب بها.

للملفات الحساسة أو Uploads الخطرة:

- تحقق من File Signature / Magic Bytes.
- استخدم Allowlist.
- أعد Encode الصور عند الحاجة.
- لا تنفذ Uploaded Files.
- ضع Limits.
- افصل Private Files عن Public Web Root.

# 538. File Size Limit

~~~js
const upload =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });
~~~

تقريبًا 5 MB.

# 539. لماذا Limit مهمة؟

بدون Limit قد يحدث:

- RAM pressure.
- Disk exhaustion.
- Bandwidth abuse.
- DoS.

Upload Endpoint Attack Surface حقيقية.

# 540. express.static()

لخدمة Public Files:

~~~js
const path =
  require("node:path");

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);
~~~

ثم:

~~~text
GET /uploads/image.png
~~~

# 541. path.join()

~~~js
path.join(
  __dirname,
  "uploads"
)
~~~

تبني Path بطريقة Portable أفضل من جمع Strings يدويًا.

# 542. __dirname

في CommonJS، \`__dirname\` تعطي Directory الخاصة بالملف الحالي.

في ESM لا توجد بنفس الشكل Built-in، وتحتاج Pattern باستخدام \`import.meta.url\`.

# 543. Relative Path vs Absolute Path

~~~js
express.static(
  "uploads"
)
~~~

قد تعتمد على Current Working Directory.

Absolute Path المحسوبة بوضوح تقلل المفاجآت.

# 544. هل كل Uploads يجب أن تكون Public؟

لا.

Private Files مثل:

~~~text
passport.pdf
invoice.pdf
private-photo.jpg
~~~

لا تقدمها ببساطة عبر \`express.static()\`.

بدلًا من ذلك:

~~~text
GET /files/:id
  ↓
Authentication
  ↓
Authorization
  ↓
Stream File
~~~

أو استخدم Signed URLs من Object Storage.

# 545. Local Disk vs Object Storage

Local Disk مناسبة للتطوير أو Server واحد بسيط.

في Production قد تواجه:

- Ephemeral filesystem.
- Multiple instances.
- Scaling.
- Backups.
- Deployment replacements.

Object Storage غالبًا أفضل للتطبيقات الموزعة.

# 546. ماذا نخزن في MongoDB؟

غالبًا تخزن URL أو Storage Key:

~~~js
{
  avatarUrl:
    "/uploads/abc.png"
}
~~~

أو:

~~~js
{
  storageKey:
    "users/123/avatar/abc.png"
}
~~~

والملف نفسه في Disk/Object Storage.

# 547. Upload Controller

~~~js
async function uploadAvatar(
  req,
  res
) {
  if (!req.file) {
    return res
      .status(400)
      .json({
        message:
          "File is required",
      });
  }

  const avatarUrl =
    "/uploads/" +
    req.file.filename;

  const user =
    await User
      .findByIdAndUpdate(
        req.user.id,
        {
          avatarUrl,
        },
        {
          new: true,
        }
      );

  res.json({
    status: "success",
    data: {
      user,
    },
  });
}
~~~

# 548. Protected Upload Route

~~~js
router.post(
  "/me/avatar",
  verifyToken,
  upload.single(
    "avatar"
  ),
  uploadAvatar
);
~~~

الأفضل غالبًا Authentication قبل معالجة Upload حتى ترفض Client غير مصرح بها مبكرًا.

# 549. Multer Errors

~~~js
const multer =
  require("multer");

app.use(
  (err, req, res, next) => {
    if (
      err instanceof
      multer.MulterError
    ) {
      return res
        .status(400)
        .json({
          message:
            err.message,
        });
    }

    next(err);
  }
);
~~~

يمكن دمجها داخل Global Error Architecture.

# 550. لماذا upload.any() تحتاج حذرًا؟

\`upload.any()\` تقبل Files من Fields مختلفة بلا تحديد مسبق.

هذا يوسع Surface أكثر من اللازم.

فضل:

~~~text
single
array
fields
~~~

عندما تعرف Contract الخاصة بالEndpoint.

# 551. Path Traversal

لا تجعل Client تتحكم في Storage Path مباشرة.

قيمة مثل:

~~~text
../../secret.txt
~~~

قد تسبب Path Traversal في Designs غير الآمنة.

Server يجب أن تولد Storage Key/Filename بنفسها.

# 552. Extension ليست دليلًا

اسم:

~~~text
photo.jpg
~~~

لا يثبت أن Bytes JPEG.

Extension مجرد اسم، وmimetype أيضًا ليست Security Proof كاملة.

# 553. رفع File من Postman

~~~text
Body
  ↓
form-data
  ↓
Key: avatar
Type: File
Value: choose file
~~~

لا تضبط \`Content-Type: multipart/form-data\` يدويًا عادة في Postman؛ اتركها تضيف Boundary المناسبة.

# 554. ما هي Boundary؟

Multipart تستخدم Boundary لفصل الأجزاء.

~~~text
------boundary
Content-Disposition: form-data; name="title"

Node.js
------boundary
Content-Disposition: form-data; name="avatar"; filename="a.png"

<binary bytes>
------boundary--
~~~

لو Header لا تحتوي Boundary الصحيحة قد يفشل Parser.

# 555. ربط Login بالUpload في Postman

~~~text
1. Login
2. Postman Script يحفظ JWT
3. Upload Request تستخدم Bearer {{JWT}}
4. Body = form-data
5. avatar = File
6. Multer تستقبل File
7. Controller تحفظ URL/Key
~~~

# 556. Ownership في Uploads

كون المستخدم authenticated لا يعني أنه يحق له تعديل ملفات مستخدم آخر.

الأفضل غالبًا:

~~~text
POST /me/avatar
~~~

أو:

~~~text
POST /users/:id/avatar
  ↓
verifyToken
  ↓
owner/admin check
  ↓
upload
~~~

# 557. Role Middleware محسنة

~~~js
const allowRoles =
  (...roles) => {
    return (
      req,
      res,
      next
    ) => {
      if (!req.user) {
        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });
      }

      if (
        !roles.includes(
          req.user.role
        )
      ) {
        return res
          .status(403)
          .json({
            message:
              "Forbidden",
          });
      }

      next();
    };
  };
~~~

# 558. Role Constants

~~~js
const USER_ROLE = {
  USER: "user",
  MANAGER: "manager",
  ADMIN: "admin",
};

module.exports =
  USER_ROLE;
~~~

ثم:

~~~js
allowRoles(
  USER_ROLE.ADMIN,
  USER_ROLE.MANAGER
);
~~~

# 559. enum لا تمنع Privilege Escalation وحدها

لو Public Register تفعل:

~~~js
await User.create(
  req.body
);
~~~

وSchema تسمح بـ \`admin\` داخل enum، Client قد ترسل Role صحيحة لكنها غير مسموح لها اختيارها.

المشكلة ليست Validation فقط؛ المشكلة Authorization وMass Assignment.

# 560. Mass Assignment

بدل:

~~~js
await User.create(
  req.body
);
~~~

استخدم Whitelist:

~~~js
const {
  firstName,
  lastName,
  email,
  password,
} = req.body;

await User.create({
  firstName,
  lastName,
  email,
  password,
  role: "user",
});
~~~

# 561. File Metadata غير موثوقة

هذه قيم قادمة من Client Metadata:

~~~js
req.file.originalname
req.file.mimetype
~~~

لا تستخدمها كحد أمني وحيد.

# 562. استبدال Avatar قديمة

Pattern أفضل:

~~~text
Upload new file
   ↓
Update DB
   ↓
Success?
   ↓
Delete old file safely
~~~

لا تحذف القديمة أولًا ثم تكتشف أن الجديدة فشلت.

# 563. DB + Filesystem ليست Transaction واحدة

قد يحدث:

~~~text
File saved
DB update failed
→ orphan file
~~~

أو العكس.

لذلك تحتاج Cleanup/Compensation Strategy.

# 564. Logging للUploads

سجل Metadata مفيدة مثل:

- userId
- file size
- storage key
- result
- request id

ولا تسجل Contents أو Secrets بلا داعٍ.

# 565. Mental Model النهائي

~~~text
POSTMAN
Environment
├── BASE_URL
└── JWT
     ↑
Login Script

PROTECTED REQUEST
Bearer JWT
   ↓
verifyToken
   ↓
req.user
   ↓
allowRoles(...roles)
   ↓
Controller

FILE UPLOAD
multipart/form-data
   ↓
Multer
├── storage
├── limits
└── fileFilter
   ↓
req.file / req.files
   ↓
Storage
   ↓
DB stores URL / key
~~~

## أهم التصحيحات

1. \`...allowedRoles\` في Parameters هي Rest Parameter، وليس Spread.
2. Role ليست Permission.
3. Authentication تسبق Authorization.
4. 401 تختلف عن 403.
5. لا تثق في role من Request Body.
6. \`express.json()\` لا تعالج multipart/form-data.
7. Multer Middleware لمعالجة Uploads وليست Storage Service.
8. \`file.mimetype\` ليست إثباتًا كافيًا لنوع الملف.
9. Extension ليست دليلًا على Content.
10. \`express.static()\` تجعل الملفات Public حسب المسار؛ لا تستخدمها للملفات الخاصة بلا Authorization.
11. لا تستخدم \`upload.any()\` بلا حاجة.
12. ضع File Size Limits.
13. لا تعتمد على Original Filename.
14. Postman تضبط Multipart Boundary عادة بنفسها.
15. Local Disk قد تكون Ephemeral في بعض منصات النشر.
16. DB وFilesystem ليست Transaction واحدة.
17. enum للRole لا تمنع Privilege Escalation إذا سمحت Mass Assignment.

## تمارين عملية

1. أنشئ Postman Environment فيها BASE_URL وJWT.
2. استخدم {{BASE_URL}} في Requests.
3. اجعل Login تحفظ JWT تلقائيًا.
4. استخدم Bearer {{JWT}}.
5. أضف role enum.
6. أنشئ USER_ROLE constants.
7. أنشئ allowRoles باستخدام Rest Parameters.
8. جرّب user وmanager وadmin.
9. اختبر 403.
10. امنع Register من تعيين admin.
11. ثبت Multer.
12. أنشئ upload.single("avatar").
13. ارفع File من Postman.
14. افحص req.file.
15. أضف DiskStorage.
16. ولّد Filename عشوائية.
17. أضف fileFilter.
18. أضف fileSize limit.
19. جرّب File Type غير مسموح.
20. جرّب File أكبر من Limit.
21. اخدم Public uploads بـ express.static في Development.
22. أنشئ /me/avatar محمية.
23. خزّن avatarUrl.
24. تعامل مع MulterError.
25. صمم Private File Route.
26. قارن Local Disk وObject Storage.
27. صمم Cleanup لو DB update فشلت.

## أسئلة مراجعة

1. ما فائدة Postman Collection؟
2. ما هو Environment؟
3. لماذا نستخدم BASE_URL؟
4. كيف تحفظ JWT تلقائيًا؟
5. لماذا Variables الحساسة تحتاج حذرًا؟
6. ما الفرق بين Authentication وAuthorization؟
7. ما الفرق بين Role وPermission؟
8. ما معنى RBAC؟
9. لماذا verifyToken تسبق allowRoles؟
10. لماذا allowRoles Higher-Order Function؟
11. ماذا تفعل ...allowedRoles؟
12. ما الفرق بين Rest وSpread؟
13. ماذا تفعل includes؟
14. متى نستخدم 401 ومتى 403؟
15. لماذا لا نثق في role من req.body؟
16. ما مشكلة role داخل JWT عند تغيرها؟
17. ما فائدة Permission-based Authorization؟
18. لماذا File Upload ليست JSON؟
19. ما هي multipart/form-data؟
20. لماذا express.json لا تكفي؟
21. ما هي Multer؟
22. ماذا تفعل upload.single؟
23. أين نجد File بعد Multer؟
24. ما الفرق بين single وarray وfields؟
25. ما الفرق بين MemoryStorage وDiskStorage؟
26. لماذا MemoryStorage تحتاج Limits؟
27. ماذا تفعل diskStorage؟
28. لماذا originalname وحدها غير مناسبة؟
29. ما فائدة fileFilter؟
30. لماذا mimetype وحدها ليست Security Proof؟
31. لماذا fileSize limit مهمة؟
32. ماذا تفعل express.static؟
33. ما فائدة path.join؟
34. ما هي __dirname؟
35. لماذا لا نجعل كل Uploads Public؟
36. ما مشكلة Local Disk في Multiple Instances؟
37. ماذا نخزن في DB غالبًا للFiles؟
38. كيف نتعامل مع MulterError؟
39. لماذا upload.any تحتاج حذرًا؟
40. ما هو Path Traversal؟
41. لماذا Extension لا تثبت النوع؟
42. كيف ترفع File من Postman؟
43. لماذا لا تكتب multipart Content-Type يدويًا غالبًا؟
44. ما هي Boundary؟
45. كيف تربط Login Script مع Upload؟
46. كيف تفحص Ownership؟
47. لماذا enum لا تمنع Privilege Escalation؟
48. ما هو Mass Assignment؟
49. كيف تستبدل Avatar قديمة بأمان نسبي؟
50. لماذا DB وFilesystem ليست Transaction واحدة؟
`,
};
