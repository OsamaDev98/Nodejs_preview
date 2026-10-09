import type { StudyChapter } from "@/types/study";

export const authenticationSecurityChapter: StudyChapter = {
  id: "authentication-security",
  number: 15,
  title: "Authentication: User Model وPassword Hashing وJWT",
  subtitle: "بناء Authentication صحيحة في Node.js وExpress: User Schema وMongoose Validation وvalidator.js وbcrypt hashing وsalt وlogin flow وJWT وBearer Token وAuth Middleware مع تصحيح المفاهيم الأمنية الشائعة.",
  readingTime: "115 دقيقة",
  keywords: ["Authentication", "User Model", "Mongoose Validation", "validator.js", "bcryptjs", "Hashing", "Salt", "Login", "JWT", "jsonwebtoken", "Bearer Token", "Authorization", "Stateless API", "Password Security"],
  content: String.raw`
# قبل أن تبدأ: ماذا سنبني؟

هذا الفصل يربط كل ما تعلمته سابقًا:

~~~text
Client
  ↓
POST /register أو /login
  ↓
Validation
  ↓
Controller
  ↓
User Model
  ↓
Password Hashing / Compare
  ↓
Database
  ↓
JWT Access Token
  ↓
Client يخزن/يرسل Token
  ↓
Authorization: Bearer <token>
  ↓
Auth Middleware
  ↓
Protected Route
~~~

هدف الفصل ليس فقط أن تحفظ \`bcrypt.hash()\` و\`jwt.sign()\`، بل أن تفهم لماذا نحتاج كل خطوة وما المشكلة التي تحلها.

# 422. ما هي Authentication؟

Authentication تعني:

> التأكد من هوية المستخدم.

مثال:

~~~text
email + password
        ↓
هل هذا المستخدم هو فعلًا صاحب الحساب؟
~~~

أما Authorization فشيء مختلف:

> ماذا يُسمح لهذا المستخدم أن يفعل؟

مثال:

~~~text
User authenticated
        ↓
هل هو Admin؟
        ↓
هل يستطيع حذف Users؟
~~~

إذن:

~~~text
Authentication = من أنت؟
Authorization = ماذا يسمح لك أن تفعل؟
~~~

# 423. User Model

نحتاج Model تمثل Users في قاعدة البيانات.

مثال Mongoose Schema:

~~~js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  {
    timestamps: true,
  }
);
~~~

# 424. Validation داخل Mongoose

Mongoose لديها Built-in Validators مثل:

- \`required\`
- \`min\`
- \`max\`
- \`minlength\`
- \`maxlength\`
- \`enum\`
- \`match\`

مثال:

~~~js
password: {
  type: String,
  required: true,
  minlength: 8,
}
~~~

لكن انتبه:

> Mongoose Validation ليست بديلًا كاملًا عن Request Validation عند حدود الـ API.

# 425. Mongoose Validation vs API Validation

فكر في طبقتين:

~~~text
HTTP Request
   ↓
Zod / express-validator / validator
   ↓
Request Validation
   ↓
Controller
   ↓
Mongoose Schema Validation
   ↓
Database
~~~

الأولى تحمي الـ API وتعيد Errors مناسبة للـ Client.

الثانية تحمي شكل البيانات داخل Data Model.

# 426. validator.js

\`validator\` package هي مكتبة String Validators وSanitizers.

تثبيت:

~~~bash
npm install validator
~~~

استخدام:

~~~js
const validator = require("validator");
~~~

مثال email validation:

~~~js
validator.isEmail("user@example.com");
~~~

تعيد Boolean.

# 427. استخدام validator.js داخل Mongoose

~~~js
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,

    validate: {
      validator: validator.isEmail,
      message:
        "Email must be valid",
    },
  },
});
~~~

يمكن أيضًا كتابة الشكل المختصر:

~~~js
validate: [
  validator.isEmail,
  "Email must be valid",
]
~~~

# 428. validator.js تعمل على Strings

هذه نقطة مهمة.

validator.js مصممة أساسًا للتحقق من Strings.

مثال:

~~~js
validator.isEmail("a@b.com");
~~~

لكن تمرير Number أو Object قد يؤدي لسلوك غير مناسب أو Error حسب الـ API.

لذلك لا تعتبرها Schema Validation Library عامة لكل أنواع البيانات.

# 429. unique: true ليست Validator تقليدية

في Mongoose:

~~~js
email: {
  type: String,
  unique: true,
}
~~~

هذه لا تعني "Mongoose validator عادية".

هي تعبر عن إنشاء Unique Index في MongoDB.

لذلك Duplicate Email قد يظهر كـ Database duplicate key error ويجب التعامل معه.

# 430. Workflow لإضافة Resource جديدة

الملاحظة عندك كانت:

~~~text
Create Model
Create Route
Create Middleware
Create Controller
~~~

الترتيب المفاهيمي جيد.

شكل Project:

~~~text
models/
  user.model.js

routes/
  users.routes.js
  auth.routes.js

controllers/
  auth.controller.js

middleware/
  validationSchema.js
  auth.middleware.js
~~~

# 431. Schema vs Model vs Collection

هذه من أهم النقاط.

~~~text
Schema
= شكل وقواعد البيانات داخل Mongoose

Model
= Interface نتعامل بها مع البيانات

Collection
= المكان الفعلي داخل MongoDB
~~~

مثال:

~~~js
const User = mongoose.model(
  "User",
  userSchema
);
~~~

Mongoose غالبًا تحول Model name إلى Collection name بصيغة pluralized lowercase.

~~~text
User
  ↓
users collection
~~~

# 432. هل Model تنشئ Collection فورًا؟

ليس بالضرورة بالطريقة التي تتخيلها.

مجرد تعريف Model لا يعني دائمًا أن Collection أصبحت مليئة أو أن Document تم إنشاؤها.

Collection تظهر/تستخدم فعليًا عندما تحدث عمليات على قاعدة البيانات، مع وجود تفاصيل تعتمد على MongoDB/Mongoose configuration.

لا تحفظ:

> mongoose.model() = create collection فورًا

هذا تبسيط غير دقيق.

# 433. Register Flow

عند التسجيل:

~~~text
Client
  ↓
POST /register
  ↓
Validate Input
  ↓
Check Email Exists?
  ↓
Hash Password
  ↓
Create User
  ↓
Generate Token
  ↓
Return Response
~~~

# 434. لماذا لا نخزن Password كما هي؟

خطأ كارثي:

~~~js
{
  email: "user@test.com",
  password: "12345678"
}
~~~

إذا تسربت Database، كل Passwords تصبح مكشوفة مباشرة.

نستخدم Password Hashing.

# 435. Hashing ليست Encryption

Hashing:

~~~text
Password
  ↓
One-way function
  ↓
Hash
~~~

لا يوجد "decrypt hash" طبيعي.

أما Encryption:

~~~text
Plaintext
  ↓
Encryption + Key
  ↓
Ciphertext
  ↓
Decryption + Key
  ↓
Plaintext
~~~

Passwords يجب أن تخزن كـ Password Hash مناسب، لا كـ Reversible Encryption.

# 436. bcrypt / bcryptjs

يمكن استخدام:

~~~text
bcrypt
bcryptjs
~~~

\`bcryptjs\` implementation JavaScript متوافقة مع bcrypt APIs بشكل واسع.

تثبيت:

~~~bash
npm install bcryptjs
~~~

ثم:

~~~js
const bcrypt = require("bcryptjs");
~~~

# 437. ما هو Salt؟

Salt قيمة Random تدخل في Password Hashing.

الفكرة:

~~~text
Password + unique random salt
        ↓
Password Hash Function
        ↓
Hash
~~~

الهدف أن نفس Password لدى User A وUser B لا تنتج بالضرورة نفس Stored Hash.

# 438. لماذا نفس Password تنتج Hash مختلفة؟

مثلًا:

~~~text
password = "hello123"

User A salt ≠ User B salt
        ↓
Hash A ≠ Hash B
~~~

هذا مفيد ضد Precomputed Attacks مثل Rainbow Tables ويمنع كشف المستخدمين الذين لديهم نفس Password بمجرد مقارنة الـ hashes.

# 439. هل نخزن Salt في Database منفصلة؟

مع bcrypt غالبًا الـ encoded hash نفسها تحتوي المعلومات اللازمة مثل salt وcost.

يعني غالبًا تخزن String واحدة ناتجة من bcrypt.

لا تحتاج عادة حقل salt منفصل مع bcrypt التقليدية.

# 440. bcrypt.hash()

أسهل طريقة:

~~~js
const hashedPassword =
  await bcrypt.hash(
    password,
    12
  );
~~~

الرقم \`12\` هنا Cost Factor / Salt Rounds، وليس Salt نفسها.

bcrypt تولد salt مناسبة داخليًا.

# 441. generateSalt ثم hash

يمكن أيضًا:

~~~js
const salt =
  await bcrypt.genSalt(12);

const hashedPassword =
  await bcrypt.hash(
    password,
    salt
  );
~~~

الطريقتان صحيحتان.

لكن لا تفهم العملية كأننا نكتب يدويًا:

~~~js
password + salt
~~~

ثم نستخدم أي Hash عادية.

bcrypt لديها Algorithm مصممة مخصوص للـ Password Hashing.

# 442. ما هو Cost Factor؟

كلما زاد Cost، زاد وقت الحساب.

هذا مقصود:

~~~text
User login واحد
→ acceptable cost

Attacker يجرب ملايين passwords
→ expensive جدًا
~~~

لكن زيادة Cost أكثر من اللازم قد تبطئ Server بشكل مؤذٍ.

اختيار القيمة يحتاج Benchmark على بيئة التطبيق.

# 443. لماذا لا نستخدم SHA-256 وحدها للـ Passwords؟

SHA-256 سريعة جدًا.

في Password Storage السرعة ليست دائمًا ميزة؛ المهاجم يستطيع تجربة عدد ضخم جدًا من الاحتمالات بسرعة.

نفضل Password Hashing Functions بطيئة ومتكيفة مثل bcrypt أو Argon2/scrypt حسب النظام.

# 444. Hash عند Register

مثال Controller:

~~~js
const bcrypt =
  require("bcryptjs");

async function register(
  req,
  res,
  next
) {
  const {
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  const existingUser =
    await User.findOne({
      email,
    });

  if (existingUser) {
    return res
      .status(409)
      .json({
        message:
          "Email already exists",
      });
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      12
    );

  const user =
    await User.create({
      firstName,
      lastName,
      email,
      password:
        hashedPassword,
    });

  res
    .status(201)
    .json({
      id: user._id,
      email: user.email,
    });
}
~~~

# 445. لا ترجع Password في Response

حتى لو Password مخزنة كـ Hash، لا ترجعها للـ Client.

خطأ:

~~~js
res.json(user);
~~~

إذا كان user object يحتوي password.

أفضل:

~~~js
res.json({
  id: user._id,
  email: user.email,
});
~~~

أو اجعل password غير selected افتراضيًا في Mongoose.

# 446. select: false

يمكن:

~~~js
password: {
  type: String,
  required: true,
  select: false,
}
~~~

ثم عند Login تحتاجها عمدًا:

~~~js
const user =
  await User
    .findOne({ email })
    .select("+password");
~~~

هذه Pattern مفيدة لتقليل التسريب العرضي.

# 447. Hashing داخل Controller أم Model Hook؟

يمكنك Hash في Controller/Service.

أو Mongoose pre-save hook:

~~~js
userSchema.pre(
  "save",
  async function () {
    if (
      !this.isModified(
        "password"
      )
    ) {
      return;
    }

    this.password =
      await bcrypt.hash(
        this.password,
        12
      );
  }
);
~~~

ميزة Hook: ضمان أكبر أن Save تمر عبر hashing.

لكن يجب فهم متى تعمل Hooks ومتى لا تعمل.

# 448. مشكلة findOneAndUpdate مع pre-save

\`pre("save")\` لا يعني أنها ستعمل تلقائيًا لكل Update Method.

مثال:

~~~js
User.findByIdAndUpdate(...)
~~~

لها Middleware مختلفة عن save.

لذلك Password update تحتاج تصميم واضح، ولا تعتمد على Hook غير مناسبة.

# 449. Login Flow

~~~text
email/password
   ↓
Find User by email
   ↓
User exists?
   ↓
bcrypt.compare()
   ↓
Correct?
   ↓
Generate JWT
   ↓
Return Token
~~~

# 450. bcrypt.compare()

لا تعيد Hash للـ password الجديدة ثم تقارن Strings بنفسك.

استخدم:

~~~js
const isCorrect =
  await bcrypt.compare(
    password,
    user.password
  );
~~~

bcrypt تقرأ salt/cost من stored hash وتنفذ المقارنة الصحيحة.

# 451. Login Example

~~~js
async function login(
  req,
  res
) {
  const {
    email,
    password,
  } = req.body;

  const user =
    await User
      .findOne({ email })
      .select("+password");

  if (!user) {
    return res
      .status(401)
      .json({
        message:
          "Invalid credentials",
      });
  }

  const validPassword =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!validPassword) {
    return res
      .status(401)
      .json({
        message:
          "Invalid credentials",
      });
  }

  // generate token next
}
~~~

# 452. لماذا نفس Message للبريد وكلمة السر؟

بدل:

~~~text
Email not found
Password wrong
~~~

استخدم:

~~~text
Invalid credentials
~~~

حتى لا تعطي Attacker معلومات سهلة تساعده على User Enumeration.

# 453. ما معنى Stateless API؟

HTTP بطبيعته لا يحتفظ Session State داخل كل Request تلقائيًا.

في Token-based Authentication، كل Request تحمل Credential اللازمة مثل JWT.

~~~text
Request 1
Authorization: Bearer token

Request 2
Authorization: Bearer token
~~~

Server تستطيع Verify كل Request بناءً على Token.

لكن كلمة Stateless لا تعني أن التطبيق لا يستخدم Database أو Cache أو لا يملك State إطلاقًا.

# 454. لماذا نحتاج Access Token؟

بعد Login لا نريد إرسال Password في كل Request.

نستبدلها Credential مؤقتة:

~~~text
Login with password
      ↓
Server verifies
      ↓
Access Token
      ↓
Use token on protected requests
~~~

# 455. ما هو JWT؟

JWT = JSON Web Token.

هو Standard لتمثيل Claims في Token Compact يمكن نقلها بين الأطراف.

JWT شائعة في Authentication، لكنها ليست الطريقة الوحيدة.

# 456. JWT ليست Encryption

هذه نقطة أمنية شديدة الأهمية.

JWT العادية الموقعة بـ JWS تكون:

~~~text
Header.Payload.Signature
~~~

Header وPayload Base64URL-encoded، وليستا مشفرتين.

أي شخص يحمل Token يستطيع قراءة Payload بسهولة.

إذن:

> لا تضع Password أو Secret Data داخل JWT Payload.

# 457. أجزاء JWT

JWT موقعة شائعة تتكون من:

~~~text
xxxxx.yyyyy.zzzzz

Header.Payload.Signature
~~~

Header:

~~~json
{
  "alg": "HS256",
  "typ": "JWT"
}
~~~

Payload:

~~~json
{
  "sub": "user-id",
  "email": "user@example.com"
}
~~~

Signature تثبت أن المحتوى لم يتم تعديله بدون المفتاح الصحيح.

# 458. Header

Header تصف Metadata مثل Algorithm ونوع Token.

~~~json
{
  "alg": "HS256",
  "typ": "JWT"
}
~~~

لا تعتمد على Header وحدها لاتخاذ قرارات أمنية بدون Verification صحيحة.

# 459. Payload وClaims

Payload تحتوي Claims.

مثال:

~~~json
{
  "sub": "68d...",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
~~~

Claims قد تكون:

- Registered Claims مثل \`exp\`, \`iat\`, \`iss\`, \`aud\`, \`sub\`
- Custom Claims مثل \`role\`

# 460. Signature هل هي Optional؟

في الاستخدام الأمني للـ Authentication يجب أن تستخدم Signed Token وتتحقق منها.

هناك مفاهيم Standards تسمح بأشكال غير موقعة تاريخيًا، لكن لا تستخدم JWT غير موقعة كـ Access Token آمنة.

في التطبيق:

> Token بدون Signature Verification لا يمكن الوثوق بمحتواها.

# 461. HS256 Secret

إذا تستخدم HS256، تحتاج Secret قوية وعشوائية.

يمكن إنشاء 32 bytes مثلًا:

~~~js
const crypto =
  require("node:crypto");

const secret =
  crypto
    .randomBytes(32)
    .toString("hex");

console.log(secret);
~~~

ثم ضعها في Environment Variable، لا داخل Git.

~~~env
JWT_SECRET=...
~~~

# 462. jsonwebtoken package

~~~bash
npm install jsonwebtoken
~~~

ثم:

~~~js
const jwt =
  require("jsonwebtoken");
~~~

# 463. jwt.sign()

~~~js
const token =
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
~~~

يفضل عدم وضع بيانات كثيرة داخل Payload.

# 464. ما معنى expiresIn؟

تحدد عمر Token.

~~~text
15m
1h
7d
~~~

Token قصيرة العمر تقلل الضرر إذا سُرقت، لكن تحتاج UX/Refresh Strategy مناسبة.

# 465. sub أفضل لهوية المستخدم

بدل:

~~~js
{
  userId: user._id
}
~~~

يمكن استخدام Standard Claim:

~~~js
const token =
  jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject:
        String(user._id),
      expiresIn: "1h",
    }
  );
~~~

ثم عند Verify تستخدم \`decoded.sub\`.

# 466. Register + Token

بعض التطبيقات ترجع Token بعد Register مباشرة.

~~~text
Register
   ↓
Create User
   ↓
Issue Access Token
   ↓
User considered logged in
~~~

وتطبيقات أخرى تطلب Login منفصلة.

كلاهما Architecture Decision.

# 467. Login + Token

بعد نجاح Password Compare:

~~~js
const token =
  jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

res.json({
  status: "success",
  data: {
    token,
  },
});
~~~

# 468. Authorization Header

الأسلوب الشائع:

~~~http
Authorization: Bearer eyJ...
~~~

الـ Header name:

~~~text
Authorization
~~~

والـ Scheme:

~~~text
Bearer
~~~

ثم Token.

# 469. قراءة Bearer Token

~~~js
const authHeader =
  req.headers.authorization;

if (
  !authHeader ||
  !authHeader.startsWith(
    "Bearer "
  )
) {
  return res
    .status(401)
    .json({
      message:
        "Authentication required",
    });
}

const token =
  authHeader.split(" ")[1];
~~~

# 470. jwt.verify()

~~~js
const decoded =
  jwt.verify(
    token,
    process.env.JWT_SECRET
  );
~~~

إذا:

- Token invalid
- Signature wrong
- Token expired

يمكن أن ترمي Error.

لذلك تعامل معها داخل Error Handling مناسب.

# 471. Auth Middleware كاملة

~~~js
const jwt =
  require("jsonwebtoken");

async function auth(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res
        .status(401)
        .json({
          message:
            "Authentication required",
        });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = {
      id:
        decoded.sub ||
        decoded.userId,
      role:
        decoded.role,
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        message:
          "Invalid or expired token",
      });
  }
}
~~~

# 472. Protected Route

~~~js
router.get(
  "/profile",
  auth,
  getProfile
);
~~~

Request Flow:

~~~text
GET /profile
   ↓
auth middleware
   ↓
verify token
   ↓
req.user
   ↓
getProfile controller
~~~

# 473. Authentication vs Authorization Middleware

Authentication:

~~~text
هل Token صحيحة؟
من هو المستخدم؟
~~~

Authorization:

~~~text
هل Role تسمح؟
هل User تملك Resource؟
~~~

مثال:

~~~js
function requireAdmin(
  req,
  res,
  next
) {
  if (
    req.user.role !==
    "admin"
  ) {
    return res
      .status(403)
      .json({
        message:
          "Forbidden",
      });
  }

  next();
}
~~~

# 474. 401 vs 403

~~~text
401 Unauthorized
= لم يتم Authentication بشكل صحيح

403 Forbidden
= المستخدم معروف لكن ليس لديه Permission
~~~

الاسم "Unauthorized" في 401 قد يكون مضلل لغويًا؛ عمليًا 401 مرتبطة غالبًا بالمصادقة.

# 475. أين نخزن JWT في Client؟

يعتمد على Architecture.

في Browser يوجد trade-offs بين:

- Memory
- HttpOnly Secure Cookie
- localStorage

لا يوجد اختيار واحد مناسب لكل حالة.

من منظور XSS، HttpOnly Cookie تمنع JavaScript من قراءة Token.

لكن Cookies تحتاج مراعاة CSRF وSameSite وCORS/Credentials.

# 476. لماذا localStorage ليست دائمًا أفضل مكان؟

أي JavaScript خبيثة تعمل داخل الصفحة بسبب XSS يمكنها قراءة localStorage.

لذلك تخزين Access Token هناك له مخاطر.

في تطبيقات كثيرة نستخدم Cookies آمنة أو Memory حسب Architecture.

# 477. Cookie-based JWT ليست Stateful تلقائيًا

مكان نقل Token لا يغير طبيعتها وحده.

JWT يمكن إرسالها في Cookie بدل Authorization Header.

السؤال الحقيقي:

- أين تخزن Credential؟
- كيف تتحقق منها؟
- هل هناك Server-side Session State؟
- كيف تتم Revocation؟

# 478. Logout مع JWT

لو Access Token Stateless ولا توجد Blocklist، Server لا "يمسحها" من الوجود بمجرد Logout.

عادة Client تحذف Credential.

لكن Token قد تبقى صالحة حتى Expiry لو كانت مسروقة.

لذلك الأنظمة الجادة تستخدم Strategies مثل:

- Short-lived access tokens
- Refresh tokens
- Rotation
- Revocation state عند الحاجة

# 479. Access Token vs Refresh Token

Access Token:

- قصيرة العمر نسبيًا
- تستخدم للوصول للـ APIs

Refresh Token:

- أطول عمرًا
- تستخدم للحصول على Access Token جديدة
- تحتاج حماية شديدة

لا تجعل الاثنين نفس Token ونفس مدة الصلاحية بلا تصميم.

# 480. JWT Verification لا تعني User ما زال صالحًا دائمًا

Token صحيحة cryptographically لا تعني بالضرورة أن User:

- ما زالت موجودة
- لم تُحظر
- لم تتغير Permissions الخاصة بها

بعض التطبيقات بعد Verify تعمل DB Lookup.

~~~text
Verify Token
   ↓
Read userId
   ↓
Load User
   ↓
Check active/role/etc.
~~~

هذا يضيف State/Database Lookup لكنه قد يكون مطلوبًا.

# 481. Minimal Auth Payload

لا تضع User Object بالكامل.

أفضل Payload صغيرة:

~~~js
{
  sub: "user-id",
  role: "admin"
}
~~~

وتحمّل البيانات المتغيرة من Database عند الحاجة.

# 482. لا تضع Password Hash داخل JWT

خطأ:

~~~js
jwt.sign(
  {
    email: user.email,
    password:
      user.password,
  },
  secret
);
~~~

حتى لو password Hash، لا يوجد سبب لإرسالها إلى Client.

Payload قابلة للقراءة.

# 483. Secret Rotation

JWT Secret ليست قيمة أبدية بالضرورة.

في Production قد تحتاج Rotation Strategy.

مع Systems كبيرة تستخدم Key IDs أو asymmetric signing حسب Architecture.

هذا موضوع متقدم، لكن المهم:

> لا hard-code secret في source code.

# 484. HS256 vs RS256 باختصار

HS256:

~~~text
Same shared secret
sign + verify
~~~

RS256:

~~~text
Private Key → sign
Public Key → verify
~~~

RS256 مناسب عندما عدة Services تحتاج Verify بدون امتلاك Signing Private Key.

للمشروع التعليمي الصغير، HS256 مع Secret قوية يكفي كبداية.

# 485. Validation للـ Register

مثال express-validator:

~~~js
const {
  body,
} = require(
  "express-validator"
);

const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail(),

  body("password")
    .isLength({
      min: 8,
    }),

  body("firstName")
    .trim()
    .notEmpty(),

  body("lastName")
    .trim()
    .notEmpty(),
];
~~~

# 486. Sanitization لا تعني Security كاملة

\`trim()\` و\`normalizeEmail()\` تساعد في تنظيف Input.

لكن Sanitization ليست بديلًا عن:

- Validation
- Authorization
- Output escaping في UI
- Query safety
- Business rules

# 487. Full Register Route

~~~js
router.post(
  "/register",
  registerValidation,
  validationMiddleware,
  register
);
~~~

Flow:

~~~text
Request
  ↓
registerValidation
  ↓
validationMiddleware
  ↓
register Controller
~~~

# 488. Full Login Route

~~~js
router.post(
  "/login",
  loginValidation,
  validationMiddleware,
  login
);
~~~

مثال:

~~~js
const loginValidation = [
  body("email")
    .isEmail(),

  body("password")
    .notEmpty(),
];
~~~

# 489. Password Reset مختلف عن Login

لا ترسل Password القديمة أو الجديدة عبر Token عشوائية بدون Flow آمنة.

Password Reset تحتاج عادة:

~~~text
Request reset
   ↓
Generate one-time token
   ↓
Store hash/expiry server-side
   ↓
Send reset link
   ↓
Verify token
   ↓
Set new password
~~~

هذا يختلف عن JWT Access Token.

# 490. Rate Limiting للـ Login

Login Endpoint هدف شائع لـ brute-force attacks.

يمكن إضافة Rate Limiting:

~~~text
POST /login
→ limit attempts
→ temporary throttling
~~~

لكن يجب تصميمها بدون إيذاء المستخدمين الشرعيين أو خلق DoS سهل.

# 491. لا تكشف هل Email موجودة في Forgot Password

Response أفضل:

~~~text
If the account exists,
a reset message has been sent.
~~~

بدل:

~~~text
This email does not exist.
~~~

لمنع Account Enumeration.

# 492. Password Policy

Minimum Length أهم من قواعد معقدة بلا داعٍ.

مثال:

~~~text
min length 8 أو أعلى
allow passphrases
لا تجبر pattern غريب لمجرد التعقيد
~~~

وفي Production يمكن استخدام breached-password checks حسب النظام.

# 493. Timing Attacks بشكل مبسط

إذا Login path للمستخدم غير الموجود أسرع جدًا دائمًا من Password خاطئة، قد يتمكن Attacker من استنتاج وجود الحسابات نظريًا.

في تطبيقات عالية الحساسية قد تستخدم دفاعات إضافية.

هذه نقطة Advanced وليست أول أولوية في مشروع تدريبي.

# 494. Error Handling مع JWT

مثال:

~~~js
try {
  const payload =
    jwt.verify(
      token,
      process.env.JWT_SECRET
    );
} catch (error) {
  // TokenExpiredError
  // JsonWebTokenError
}
~~~

لا ترسل Internal Error Detail كامل للـ Client.

# 495. Authentication Middleware مع AppError

إذا لديك Global Error Handler:

~~~js
function auth(
  req,
  res,
  next
) {
  try {
    // extract + verify
    next();
  } catch (error) {
    next(
      new AppError(
        "Invalid or expired token",
        401
      )
    );
  }
}
~~~

هذا يحافظ على Error Architecture موحدة.

# 496. User Model محسنة

~~~js
const mongoose =
  require("mongoose");

const validator =
  require("validator");

const bcrypt =
  require("bcryptjs");

const userSchema =
  new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

        validate: {
          validator:
            validator.isEmail,
          message:
            "Invalid email",
        },
      },

      password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
      },

      role: {
        type: String,
        enum: [
          "user",
          "admin",
        ],
        default: "user",
      },

      active: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );
~~~

# 497. Hash Password في Model Hook

~~~js
userSchema.pre(
  "save",
  async function () {
    if (
      !this.isModified(
        "password"
      )
    ) {
      return;
    }

    this.password =
      await bcrypt.hash(
        this.password,
        12
      );
  }
);
~~~

ثم Controller لا تحتاج Hash يدويًا عند \`save/create\` التي تمر عبر هذا behavior.

لكن كن واعيًا لطرق Update الأخرى.

# 498. Instance Method لمقارنة Password

~~~js
userSchema.methods
  .comparePassword =
  function (
    candidatePassword
  ) {
    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };
~~~

ثم:

~~~js
const valid =
  await user.comparePassword(
    password
  );
~~~

هذا يجعل Behavior المرتبطة بالـ User Model أقرب للـ Model نفسها.

# 499. Model Export

~~~js
const User =
  mongoose.model(
    "User",
    userSchema
  );

module.exports = User;
~~~

# 500. Auth Controller Architecture

~~~text
auth.controller.js
├── register
├── login
└── maybe refresh/logout

auth.middleware.js
├── authenticate
└── authorize roles

user.model.js
├── schema
├── password hashing
└── comparePassword
~~~

فصل المسؤوليات يجعل الكود أسهل في الاختبار والصيانة.

# 501. Mental Model النهائي

~~~text
REGISTER
Client Data
   ↓
Request Validation
   ↓
User Model Validation
   ↓
Password Hash
   ↓
MongoDB
   ↓
JWT Sign
   ↓
Access Token

LOGIN
Email + Password
   ↓
Find User
   ↓
bcrypt.compare
   ↓
JWT Sign
   ↓
Access Token

PROTECTED REQUEST
Authorization: Bearer token
   ↓
Auth Middleware
   ↓
jwt.verify
   ↓
req.user
   ↓
Authorization Rules
   ↓
Controller
~~~

# 502. أهم التصحيحات على الملاحظات

1. **JWT ليست Encryption**؛ Payload يمكن قراءتها.
2. **Signature ليست شيء نتجاهله** في Access Tokens؛ يجب توقيع Token والتحقق منها.
3. **Salt ليست مجرد String تضيفها يدويًا للـ Password**؛ bcrypt تدير format وخوارزمية Password Hashing كاملة.
4. **bcrypt hash تخزن salt/cost داخل encoded hash عادة**.
5. **Cost Factor ليست Salt**.
6. **API Stateless لا تعني أن التطبيق لا يستخدم Database**.
7. **Authentication ليست Authorization**.
8. **unique: true ليست Mongoose Validator عادية**.
9. **pre-save لا تعمل تلقائيًا مع كل findOneAndUpdate**.
10. **Validator.js ليست Schema Library عامة؛ هي أساسًا String Validators/Sanitizers**.
11. **لا ترجع Password Hash للـ Client**.
12. **لا تضع Secrets أو Passwords داخل JWT Payload**.
13. **401 للمصادقة المفقودة/الفاشلة، و403 للصلاحيات غير الكافية**.
14. **JWT الصحيحة لا تضمن أن User ما زالت active إذا لم تتحقق من Database عند الحاجة**.

## تمارين عملية

1. أنشئ User Schema فيها firstName وlastName وemail وpassword.
2. أضف validator.isEmail.
3. أضف unique index على email.
4. أضف select:false للـ password.
5. أنشئ Register Route.
6. امنع Duplicate Email.
7. اعمل Hash باستخدام bcryptjs.
8. اختبر أن نفس Password تنتج Hash مختلفة في مرتين.
9. استخدم bcrypt.compare.
10. أنشئ Login Route.
11. أعد نفس رسالة Invalid credentials سواء User غير موجودة أو Password خاطئة.
12. أنشئ JWT Secret باستخدام crypto.randomBytes.
13. خزّن JWT_SECRET داخل .env.
14. أنشئ Access Token مدتها ساعة.
15. فك JWT يدويًا ولاحظ أن Payload مقروءة.
16. أنشئ Auth Middleware.
17. اقرأ Bearer Token من Authorization Header.
18. استخدم jwt.verify.
19. أضف req.user.
20. أنشئ Route /profile محمية.
21. أنشئ role=admin وMiddleware Authorization.
22. جرب 401 ثم 403 وافهم الفرق.
23. انقل Password Hashing إلى pre-save hook.
24. أضف comparePassword كـ instance method.
25. جرب findByIdAndUpdate لكلمة السر ولاحظ لماذا تحتاج Strategy مختلفة.
26. أضف Rate Limit على Login.
27. صمم Access Token + Refresh Token Flow على الورق.

## أسئلة مراجعة

1. ما الفرق بين Authentication وAuthorization؟
2. لماذا نحتاج User Model؟
3. ما الفرق بين API Validation وMongoose Validation؟
4. ما هي validator.js؟
5. لماذا validator.js ليست بديلًا كاملًا لـ Zod أو Joi؟
6. ماذا تعني unique:true فعليًا في Mongoose؟
7. ما الفرق بين Schema وModel وCollection؟
8. هل mongoose.model() تنشئ Document؟
9. ما خطوات Register؟
10. لماذا لا نخزن Password Plain Text؟
11. ما الفرق بين Hashing وEncryption؟
12. لماذا نستخدم bcrypt؟
13. ما هو Salt؟
14. لماذا نفس Password تنتج Hash مختلفة؟
15. هل نحتاج حقل Salt منفصل مع bcrypt عادة؟
16. ما الفرق بين Salt Rounds وSalt؟
17. ماذا تفعل bcrypt.hash؟
18. لماذا لا نستخدم SHA-256 وحدها للـ Passwords؟
19. لماذا لا نرجع Password Hash في Response؟
20. ما فائدة select:false؟
21. ما فائدة pre-save hook؟
22. لماذا isModified("password") مهمة؟
23. لماذا pre-save لا تكفي مع كل Update Method؟
24. ما خطوات Login؟
25. ماذا تفعل bcrypt.compare؟
26. لماذا نستخدم Invalid credentials بدل Email not found؟
27. ما معنى Stateless API؟
28. هل Stateless تعني عدم استخدام Database؟
29. لماذا نحتاج Access Token؟
30. ما هو JWT؟
31. هل JWT مشفرة؟
32. ما أجزاء JWT الثلاثة؟
33. ماذا يحتوي Header؟
34. ما هي Claims؟
35. لماذا Signature مهمة؟
36. أين نخزن JWT Secret؟
37. كيف تنشئ Secret عشوائية قوية؟
38. ماذا تفعل jwt.sign؟
39. ماذا يعني expiresIn؟
40. ما فائدة sub claim؟
41. ماذا تعني Bearer Token؟
42. كيف نقرأ Authorization Header؟
43. ماذا تفعل jwt.verify؟
44. ما وظيفة Auth Middleware؟
45. ما الفرق بين 401 و403؟
46. هل Token صحيحة تعني أن User ما زالت active؟
47. لماذا لا نضع Password أو Secret داخل Payload؟
48. ما الفرق بين Access Token وRefresh Token؟
49. لماذا Logout في JWT Stateless يحتاج تفكير مختلف؟
50. ما الفرق بين HS256 وRS256 باختصار؟
51. لماذا localStorage ليست دائمًا أفضل مكان للToken؟
52. ما علاقة HttpOnly Cookie بـ XSS؟
53. لماذا Login تحتاج Rate Limiting؟
54. كيف تمنع Account Enumeration في Forgot Password؟
55. ارسم Register → Login → Protected Route Flow كاملة.
`,
};
