import type { StudyChapter } from "@/types/study";

export const mongodbMongooseChapter: StudyChapter = {
  id: "mongodb-mongoose",
  number: 13,
  title: "MongoDB وMongoose من الصفر",
  subtitle: "Database وDBMS وSQL/NoSQL ثم MongoDB وBSON وCollections وDocuments وObjectId وAtlas وCompass والـ Native Driver، وبعدها Mongoose: Schema وModel وValidation وCRUD ولماذا نستخدمها.",
  readingTime: "100 دقيقة",
  keywords: ["Database", "DBMS", "SQL", "NoSQL", "MongoDB", "BSON", "Collection", "Document", "ObjectId", "Atlas", "Compass", "MongoDB Driver", "Mongoose", "Schema", "Model", "Validation", "CRUD"],
  content: String.raw`
# قبل أن تبدأ: الصورة الكبيرة

أنت الآن وصلت للجزء الذي تنتقل فيه من API تخزن البيانات مؤقتًا داخل Array إلى API تتعامل مع **Database حقيقية**.

\`\`\`text
Client
  ↓
Express API
  ↓
Controller
  ↓
Service
  ↓
MongoDB Driver أو Mongoose
  ↓
MongoDB Server
  ↓
Database
  ↓
Collection
  ↓
Documents
\`\`\`

وسنبدأ من الأساس حتى لا تستخدم MongoDB أو Mongoose كأنهما مجرد أوامر تحفظها.

# 276. ما هي Database؟

Database هي مجموعة منظمة من البيانات يتم تخزينها بطريقة تسمح بالوصول إليها والبحث فيها وتعديلها وإدارتها.

مثال:

\`\`\`text
courses
users
orders
products
\`\`\`

الهدف ليس مجرد "حفظ بيانات"، بل أن تستطيع:

- إنشاء بيانات.
- قراءتها.
- البحث فيها.
- تعديلها.
- حذفها.
- تنظيمها.
- فرض قيود عليها.
- التعامل مع عدد كبير من السجلات بكفاءة.

# 277. ما هو DBMS؟

DBMS اختصار:

**Database Management System**

وهو البرنامج الذي يدير قاعدة البيانات.

أمثلة:

- PostgreSQL
- MySQL
- SQL Server
- MongoDB

الـ DBMS مسؤول عن أشياء مثل:

- التخزين.
- الاستعلامات.
- الفهارس Indexes.
- الصلاحيات.
- الاتصالات.
- الـ transactions.
- إدارة البيانات على القرص والذاكرة.

إذن:

\`\`\`text
Database = البيانات نفسها
DBMS = البرنامج الذي يدير هذه البيانات
\`\`\`

# 278. SQL vs NoSQL

يوجد أكثر من Database Model.

أشهر تقسيم مبسط:

| النوع | الشكل الشائع |
|---|---|
| Relational / SQL | Tables / Rows / Columns |
| Document / NoSQL | Collections / Documents |

مثال Relational:

\`\`\`text
courses table

id | title   | price
1  | Node.js | 1000
2  | React   | 800
\`\`\`

مثال MongoDB:

\`\`\`json
{
  "_id": "...",
  "title": "Node.js",
  "price": 1000
}
\`\`\`

# 279. هل NoSQL معناها "بدون SQL فقط"؟

الاسم يستخدم تاريخيًا لمجموعة Databases غير relational بالمعنى التقليدي.

لكن لا تحفظ:

\`\`\`text
SQL = structured
NoSQL = unstructured
\`\`\`

هذا تبسيط غير دقيق.

MongoDB لديها structure واضح جدًا داخل الـ documents، لكنها لا تعتمد model الجداول والعلاقات التقليدي نفسه.

# 280. ما هي MongoDB؟

MongoDB هي Document Database.

بدل أن تفكر في:

\`\`\`text
Table
Row
Column
\`\`\`

فكر في:

\`\`\`text
Database
  ↓
Collection
  ↓
Document
  ↓
Fields
\`\`\`

مثال:

\`\`\`json
{
  "title": "Node.js",
  "price": 1000,
  "active": true
}
\`\`\`

# 281. Database → Collection → Document

في MongoDB:

\`\`\`text
school
│
├── courses
│   ├── document 1
│   ├── document 2
│   └── document 3
│
└── users
    ├── document 1
    └── document 2
\`\`\`

Database تحتوي Collections.

Collection تحتوي Documents.

Document تحتوي Fields.

# 282. JSON وBSON

MongoDB تعرض البيانات بشكل قريب جدًا من JSON، لكن التخزين الداخلي يعتمد **BSON**.

BSON = Binary JSON.

الهدف ليس فقط "JSON لكن Binary"، بل BSON تدعم أنواعًا إضافية لا يوفرها JSON القياسي بنفس الصورة مثل:

- ObjectId
- Date
- Binary data
- Decimal128
- Int32 / Int64

مثال منطقي:

\`\`\`js
{
  _id: ObjectId("..."),
  createdAt: new Date(),
  price: 1000
}
\`\`\`

# 283. هل BSON دائمًا أصغر من JSON؟

لا.

كلمة Binary قد توحي أنه دائمًا أصغر، لكن BSON قد تكون أكبر من JSON في بعض الحالات لأنها تحتفظ بمعلومات type وأسماء الحقول.

الفائدة الأساسية هي:

- دعم أنواع بيانات إضافية.
- سهولة المعالجة داخل MongoDB.
- تمثيل binary structured data مناسب للمحرك.

# 284. ما هو Document؟

Document هو unit أساسية للبيانات في MongoDB.

مثال:

\`\`\`json
{
  "_id": "ObjectId(...)",
  "title": "Node.js",
  "price": 1000,
  "tags": ["backend", "javascript"],
  "instructor": {
    "name": "Ahmed",
    "experience": 5
  }
}
\`\`\`

لاحظ أن Document يمكن أن تحتوي:

- String
- Number
- Boolean
- Array
- Nested Object
- Date
- ObjectId
- أنواع BSON أخرى

# 285. ما هي Collection؟

Collection هي مجموعة من Documents مرتبطة منطقيًا ببعضها.

مثال:

\`\`\`text
courses collection
users collection
orders collection
\`\`\`

يمكن تشبيهها بشكل تقريبي بـ table، لكن لا تعتبرها table حرفيًا لأن model مختلف.

# 286. MongoDB Flexible Schema

يقال كثيرًا إن MongoDB "Schemaless".

الأدق:

> MongoDB لديها flexible schema افتراضيًا.

يعني يمكن أن توجد Documents داخل نفس Collection بأشكال مختلفة.

مثلًا:

\`\`\`js
{ title: "Node.js", price: 1000 }

{ title: "React", level: "beginner" }
\`\`\`

لكن هذا لا يعني أن التصميم العشوائي فكرة جيدة.

يمكنك أيضًا فرض قواعد Validation داخل MongoDB نفسها.

# 287. مشكلة المرونة الزائدة

لو تركت كل شيء بدون قواعد:

\`\`\`js
{ title: "Node.js", price: 1000 }

{ title: 500, price: "free" }

{ name: "Express" }
\`\`\`

ستصبح بياناتك غير متناسقة.

وهنا يبدأ سبب استخدام Schema validation أو أدوات مثل Mongoose.

# 288. ما هو _id؟

MongoDB تحتاج identifier مميز لكل Document.

الاسم الافتراضي:

\`\`\`text
_id
\`\`\`

إذا لم ترسل _id، MongoDB Driver عادة ينشئ واحدة تلقائيًا قبل إرسال document للسيرفر.

مثال:

\`\`\`js
{
  _id: ObjectId("68d..."),
  title: "Node.js"
}
\`\`\`

# 289. ما هو ObjectId؟

ObjectId نوع BSON شائع جدًا كقيمة لـ _id.

وهو 12 bytes.

التركيب الحديث منطقيًا يتضمن:

\`\`\`text
4 bytes  timestamp
5 bytes  random value
3 bytes  incrementing counter
\`\`\`

وعند تمثيله كنص hexadecimal يظهر غالبًا في 24 character.

# 290. هل ObjectId رقم Auto Increment؟

لا.

MongoDB لا تستخدم auto-increment integer افتراضيًا مثل بعض SQL designs.

ObjectId مختلفة تمامًا.

لا تعتمد على _id لترتيب business data بدل حقل واضح مثل:

\`\`\`js
createdAt
\`\`\`

# 291. MongoDB Server

MongoDB Server هو الـ database engine الذي يخزن ويدير البيانات.

التطبيق لا "يتعامل مع Compass".

التطبيق يتصل بـ MongoDB Server.

Mental model:

\`\`\`text
Node.js App
    ↓
MongoDB Driver
    ↓
MongoDB Server
\`\`\`

# 292. MongoDB Compass

Compass هي GUI لإدارة وفحص MongoDB.

تستخدمها لكي:

- ترى databases.
- ترى collections.
- تشاهد documents.
- تنفذ queries.
- تضيف أو تعدل بيانات.
- ترى indexes.
- تفحص schema.

لكن Compass ليست هي database نفسها.

هي Client Tool.

# 293. mongosh

mongosh هي MongoDB Shell.

بدل GUI تكتب أوامر في Terminal.

مثل:

\`\`\`js
use school

db.courses.find()

db.courses.insertOne({
  title: "Node.js",
  price: 1000
})
\`\`\`

إذن:

\`\`\`text
Compass = GUI Client
mongosh = Command-line Client
\`\`\`

# 294. MongoDB Atlas

Atlas هي خدمة Cloud managed لتشغيل MongoDB.

بدل أن تشغل MongoDB Server بنفسك على جهازك أو server تديره أنت، Atlas تدير البنية التحتية لك.

مصطلح مهم:

**Cluster**

هو البيئة التي تعمل عليها MongoDB databases في Atlas.

# 295. Local MongoDB vs Atlas

Local:

\`\`\`text
Node App
  ↓
mongodb://127.0.0.1:27017
  ↓
MongoDB على جهازك
\`\`\`

Atlas:

\`\`\`text
Node App
  ↓
mongodb+srv://...
  ↓
MongoDB Atlas Cluster
\`\`\`

نفس المفاهيم الأساسية؛ الفرق في مكان تشغيل MongoDB وإدارتها.

# 296. كيف يتصل Node.js بـ MongoDB؟

Node لا يفهم بروتوكول MongoDB وحده.

يحتاج **Driver**.

الحزمة الرسمية:

\`\`\`bash
npm install mongodb
\`\`\`

ثم:

\`\`\`js
const { MongoClient } = require("mongodb");

const client = new MongoClient(
  "mongodb://127.0.0.1:27017"
);
\`\`\`

# 297. ما معنى Driver؟

Driver هي مكتبة تتكلم بروتوكول Database نيابة عن تطبيقك وتحوّل استدعاءات JavaScript إلى عمليات تفهمها MongoDB.

\`\`\`text
Your JavaScript
      ↓
MongoDB Node.js Driver
      ↓
MongoDB Wire Protocol
      ↓
MongoDB Server
\`\`\`

# 298. Native MongoDB Driver

عندما نقول "MongoDB Native Driver" في Node نقصد غالبًا package الرسمية:

\`\`\`text
mongodb
\`\`\`

تستخدمها مباشرة بدون Mongoose.

مثال Connection:

\`\`\`js
const { MongoClient } = require("mongodb");

const client = new MongoClient(
  "mongodb://127.0.0.1:27017"
);

async function main() {
  await client.connect();

  const db = client.db("school");
  const courses = db.collection("courses");

  console.log("Connected");
}

main().catch(console.error);
\`\`\`

# 299. insertOne بالـ Native Driver

\`\`\`js
const result = await courses.insertOne({
  title: "Node.js",
  price: 1000,
});

console.log(result.insertedId);
\`\`\`

# 300. find بالـ Native Driver

\`\`\`js
const data = await courses.find({
  price: { $gte: 900 }
}).toArray();

console.log(data);
\`\`\`

لاحظ أن \`find()\` تعيد Cursor، لذلك غالبًا تستخدم \`toArray()\` عندما تريد النتائج كلها داخل Array.

# 301. findOne

\`\`\`js
const course = await courses.findOne({
  title: "Node.js"
});
\`\`\`

هذا يعيد Document واحدة أو null إذا لم يجد.

# 302. updateOne

\`\`\`js
await courses.updateOne(
  { title: "Node.js" },
  {
    $set: {
      price: 1200
    }
  }
);
\`\`\`

\`$set\` update operator لتعديل fields محددة.

# 303. deleteOne

\`\`\`js
await courses.deleteOne({
  title: "Node.js"
});
\`\`\`

إذن MongoDB Native Driver وحدها قادرة فعلًا على تنفيذ CRUD كاملة.

وهذا يقودنا لسؤالك الأساسي.

# 304. إذا كانت MongoDB Driver كافية، لماذا Mongoose؟

الإجابة المختصرة:

> نعم، MongoDB Driver وحدها كافية تمامًا لبناء تطبيق Production. Mongoose ليست شرطًا.

Mongoose تضيف **طبقة أعلى من abstraction والتنظيم** فوق MongoDB Driver.

\`\`\`text
App
 ↓
Mongoose
 ↓
MongoDB Driver
 ↓
MongoDB Server
\`\`\`

في التطبيقات الحديثة، Mongoose تعتمد داخليًا على MongoDB Node.js Driver للتواصل مع MongoDB.

# 305. ما الذي تضيفه Mongoose؟

أهم الإضافات:

1. Schema واضحة داخل الكود.
2. Validation.
3. Casting للأنواع.
4. Models.
5. Document methods.
6. Query helpers.
7. Middleware/Hooks.
8. Virtuals.
9. Population للعلاقات المرجعية.
10. Plugins.
11. تنظيم ثابت للـ data layer.

إذن القيمة الأساسية ليست "الوصول إلى MongoDB"، لأن Driver تفعل ذلك بالفعل.

القيمة هي:

> تنظيم البيانات وسلوكها داخل التطبيق.

# 306. هل إضافة Mongoose كبيرة؟

من ناحية المفاهيم: نعم، تضيف Layer مهمة.

من ناحية ضرورة المشروع: لا، ليست إجبارية.

فكر فيها هكذا:

\`\`\`text
MongoDB Driver
= low-level database access

Mongoose
= ODM + modeling layer فوق الـ driver
\`\`\`

كلما كبر المشروع وزادت Models والValidation والBusiness rules، تظهر فائدة Mongoose أكثر.

أما في API صغيرة وبسيطة فقد تكون Native Driver كافية وأوضح.

# 307. ما هو ODM؟

Mongoose توصف عادة بأنها **ODM**.

ODM = Object Document Mapper / Modeling.

الفكرة:

\`\`\`text
JavaScript Objects
      ↕
Mongoose Models
      ↕
MongoDB Documents
\`\`\`

تشبه فكرة ORM مع relational databases لكن لا تساويها حرفيًا لأن MongoDB document database.

# 308. تثبيت Mongoose

\`\`\`bash
npm install mongoose
\`\`\`

ثم:

\`\`\`js
const mongoose = require("mongoose");
\`\`\`

# 309. الاتصال باستخدام Mongoose

\`\`\`js
const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(
    "mongodb://127.0.0.1:27017/school"
  );

  console.log("MongoDB connected");
}

connectDB().catch(console.error);
\`\`\`

هنا Mongoose تدير الاتصال فوق Driver.

# 310. ما هي Schema في Mongoose؟

Schema تصف شكل Document وقواعد fields.

\`\`\`js
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});
\`\`\`

هنا أنت تقول للتطبيق:

\`\`\`text
Course
├── title → String + required
└── price → Number + required
\`\`\`

# 311. Schema ليست Collection

هذه نقطة مهمة.

Schema ليست database ولا collection.

هي metadata/configuration داخل تطبيق Node تحدد كيف تريد Mongoose التعامل مع documents.

\`\`\`text
Schema
= definition

Model
= interface/class-like object للعمل مع collection

Document
= instance/data record
\`\`\`

# 312. ما هو Model؟

Model يتم بناؤه من Schema:

\`\`\`js
const Course = mongoose.model(
  "Course",
  courseSchema
);
\`\`\`

الـ Model هو الواجهة الرئيسية التي تستخدمها لتنفيذ CRUD على collection.

مثل:

\`\`\`js
Course.find();
Course.findById();
Course.create();
Course.updateOne();
Course.deleteOne();
\`\`\`

# 313. هل Model = Class؟

يمكن التفكير فيه بشكل قريب من Class لأغراض الفهم، لأنك تنشئ Documents منه:

\`\`\`js
const course = new Course({
  title: "Node.js",
  price: 1000,
});
\`\`\`

لكن Mongoose Model لديها behavior خاص مرتبط بالـ schema والcollection والqueries، فلا تختزلها في JavaScript class عادية.

# 314. ما هو Document في Mongoose؟

عندما تكتب:

\`\`\`js
const course = new Course({
  title: "Node.js",
  price: 1000,
});
\`\`\`

\`course\` هي Mongoose Document instance.

تحتوي:

- البيانات.
- methods مثل save.
- tracking للتغييرات.
- schema behavior.

ثم:

\`\`\`js
await course.save();
\`\`\`

# 315. create()

اختصار شائع:

\`\`\`js
const course = await Course.create({
  title: "Node.js",
  price: 1000,
});
\`\`\`

بدل:

\`\`\`js
const course = new Course({
  title: "Node.js",
  price: 1000,
});

await course.save();
\`\`\`

# 316. find()

\`\`\`js
const courses = await Course.find();
\`\`\`

مع filter:

\`\`\`js
const courses = await Course.find({
  price: { $gte: 1000 }
});
\`\`\`

# 317. findById()

\`\`\`js
const course = await Course.findById(
  req.params.id
);
\`\`\`

Mongoose لديها helpers كثيرة تقلل boilerplate مقارنة بالـ raw driver.

# 318. findOne()

\`\`\`js
const course = await Course.findOne({
  title: "Node.js"
});
\`\`\`

# 319. findByIdAndUpdate()

\`\`\`js
const course = await Course.findByIdAndUpdate(
  req.params.id,
  {
    price: 1200
  },
  {
    new: true,
    runValidators: true,
  }
);
\`\`\`

مهم جدًا:

\`new: true\` تعيد Document بعد التعديل.

\`runValidators: true\` تجعل update validators تعمل في هذه العملية.

# 320. findByIdAndDelete()

\`\`\`js
const course = await Course.findByIdAndDelete(
  req.params.id
);
\`\`\`

إذا لم توجد Document تكون النتيجة عادة null.

# 321. Validation في Mongoose

مثال:

\`\`\`js
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },
});
\`\`\`

هذه القواعد تصبح مرتبطة بالـ Model.

# 322. Casting

لو Schema تقول:

\`\`\`js
price: Number
\`\`\`

وقد وصلت قيمة قابلة للتحويل:

\`\`\`js
price: "1000"
\`\`\`

Mongoose قد تحاول cast القيمة إلى Number.

هذا convenience مفيد، لكنه لا يعني أن كل input أصبح آمنًا.

ما زلت تحتاج API validation واضحة عند حدود التطبيق.

# 323. API Validation vs Mongoose Validation

لا تجعل Mongoose Validation بديلًا وحيدًا لكل validation.

فكر في طبقتين:

\`\`\`text
HTTP Request
   ↓
Zod / express-validator
API boundary validation
   ↓
Controller / Service
   ↓
Mongoose Schema Validation
Data model protection
   ↓
MongoDB
\`\`\`

API validation تعطي errors مناسبة للـ client.

Mongoose validation تحمي data model أيضًا.

# 324. Default Values

\`\`\`js
const courseSchema = new mongoose.Schema({
  title: String,

  active: {
    type: Boolean,
    default: true,
  },
});
\`\`\`

لو لم ترسل active:

\`\`\`js
{
  title: "Node.js",
  active: true
}
\`\`\`

# 325. enum

\`\`\`js
level: {
  type: String,
  enum: ["beginner", "intermediate", "advanced"],
}
\`\`\`

هذا يمنع قيمًا خارج القائمة في validation الخاصة بـ Mongoose.

# 326. timestamps

يمكن أن تطلب من Mongoose إضافة:

- createdAt
- updatedAt

\`\`\`js
const courseSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
  },
  {
    timestamps: true,
  }
);
\`\`\`

# 327. Instance Methods

يمكن إضافة method على documents.

\`\`\`js
courseSchema.methods.getLabel = function () {
  return this.title + " - " + this.price;
};
\`\`\`

ثم:

\`\`\`js
const course = await Course.findById(id);

console.log(course.getLabel());
\`\`\`

# 328. Static Methods

Methods على Model نفسها:

\`\`\`js
courseSchema.statics.findExpensive = function () {
  return this.find({
    price: { $gte: 1000 }
  });
};
\`\`\`

ثم:

\`\`\`js
const courses = await Course.findExpensive();
\`\`\`

# 329. Middleware / Hooks

Mongoose تسمح بتشغيل code قبل أو بعد عمليات معينة.

مثال:

\`\`\`js
courseSchema.pre("save", function () {
  console.log("Before saving course");
});
\`\`\`

يمكن استخدام hooks لأشياء مرتبطة بدورة حياة document، لكن لا تضع فيها business logic عشوائية يصعب تتبعها.

# 330. Virtuals

Virtual field ليست مخزنة فعليًا في MongoDB.

مثال:

\`\`\`js
courseSchema.virtual("label").get(function () {
  return this.title + " - " + this.price;
});
\`\`\`

هي computed value داخل application layer.

# 331. populate()

لو لديك reference:

\`\`\`js
instructor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
}
\`\`\`

يمكن:

\`\`\`js
const courses = await Course
  .find()
  .populate("instructor");
\`\`\`

Mongoose تجلب referenced documents وتضعها لك في النتيجة حسب query.

لكن populate ليست SQL JOIN حرفيًا، ولها تكلفة ويجب استخدامها بفهم.

# 332. lean()

بشكل افتراضي بعض Mongoose queries تعيد Mongoose Documents.

إذا كنت تريد plain JavaScript objects للقراءة فقط:

\`\`\`js
const courses = await Course
  .find()
  .lean();
\`\`\`

\`lean()\` تقلل overhead لأنها لا تنشئ full Mongoose documents بنفس features.

# 333. Mongoose Query ليست Promise حرفيًا

Mongoose query objects لها API خاصة ويمكن await عليها.

مثل:

\`\`\`js
const query = Course.find({
  price: { $gte: 1000 }
});

const courses = await query;
\`\`\`

لكن لا تختزلها ذهنيًا في "Promise عادية" لأن Query لها chaining وسلوك إضافي.

# 334. Query Chaining

\`\`\`js
const courses = await Course
  .find({ active: true })
  .sort({ price: -1 })
  .limit(10)
  .select("title price");
\`\`\`

هذا يجعل query building منظمة جدًا.

# 335. أين نضع Model في المشروع؟

مثال:

\`\`\`text
src/
├── models/
│   └── course.model.js
├── controllers/
│   └── courses.controller.js
├── routes/
│   └── courses.routes.js
├── services/
│   └── courses.service.js
└── db/
    └── connect.js
\`\`\`

# 336. course.model.js

\`\`\`js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
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

const Course = mongoose.model(
  "Course",
  courseSchema
);

module.exports = Course;
\`\`\`

# 337. Controller باستخدام Mongoose

\`\`\`js
const Course = require("../models/course.model");

async function getCourses(req, res, next) {
  try {
    const courses = await Course.find();

    res.json({
      data: courses,
    });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const course = await Course.create({
      title: req.body.title,
      price: req.body.price,
    });

    res.status(201).json({
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCourses,
  createCourse,
};
\`\`\`

# 338. Native Driver vs Mongoose — نفس العملية

Native Driver:

\`\`\`js
await db.collection("courses").insertOne({
  title: "Node.js",
  price: 1000,
});
\`\`\`

Mongoose:

\`\`\`js
await Course.create({
  title: "Node.js",
  price: 1000,
});
\`\`\`

الفرق ليس أن واحدة "تستطيع" والثانية "لا تستطيع".

الاثنتان تصلان إلى MongoDB.

الفرق في مستوى abstraction والتنظيم.

# 339. مقارنة واضحة: Driver vs Mongoose

| الموضوع | MongoDB Driver | Mongoose |
|---|---|---|
| الاتصال بـ MongoDB | نعم | نعم، عبر driver |
| CRUD | نعم | نعم |
| Schema داخل app | يدوي/اختياري | built-in concept |
| Validation | تكتبها أنت أو تستخدم library | built-in schema validation |
| Casting | محدود حسب driver/BSON APIs | extensive casting |
| Models | لا بنفس مفهوم Mongoose | نعم |
| Hooks | تكتب orchestration بنفسك | middleware/hooks |
| Virtuals | يدوي | built-in |
| Populate | يدوي عبر queries/aggregation | built-in helper |
| أقل abstraction | نعم | لا |
| تحكم مباشر | أعلى | أقل قليلًا |
| Boilerplate modeling | أعلى | أقل غالبًا |

# 340. متى أستخدم MongoDB Driver فقط؟

استخدم Driver مباشرة عندما:

- المشروع صغير أو بسيط.
- تريد تحكمًا مباشرًا في queries.
- تريد أقل abstraction ممكنة.
- لا تحتاج modeling layer كبيرة.
- لديك validation architecture مستقلة أصلًا.
- فريقك يفضل MongoDB APIs مباشرة.

مثال: microservice صغير جدًا قد لا يستفيد كثيرًا من Mongoose.

# 341. متى أستخدم Mongoose؟

Mongoose مفيدة عندما:

- لديك Models كثيرة.
- تريد Schemas واضحة.
- تريد validators مرتبطة بالmodels.
- تريد hooks/virtuals/populate.
- تريد conventions موحدة في الفريق.
- المشروع CRUD-heavy.
- تريد تقليل boilerplate في modeling layer.

# 342. هل Mongoose تجعل MongoDB أفضل؟

لا.

MongoDB نفسها لا تصبح أسرع أو أقوى لمجرد استخدام Mongoose.

Mongoose تحسن **developer experience وتنظيم application code**.

وقد تضيف overhead مقارنة باستخدام Driver مباشرة.

إذن القرار Architecture/Developer Experience، وليس ترقية لقدرات database الأساسية.

# 343. هل أحتاج Mongoose لو أستخدم Zod؟

ليس بالضرورة.

Zod وMongoose لا تؤديان نفس الدور بالكامل.

Zod ممتازة لـ:

\`\`\`text
API input validation
Parsing
Type inference
\`\`\`

Mongoose تضيف:

\`\`\`text
MongoDB modeling
Model APIs
Document behavior
Query helpers
Hooks
Populate
Schema-level data rules
\`\`\`

يمكن استخدامهما معًا، أو تستخدم Zod + Native Driver.

# 344. Architecture بدون Mongoose

\`\`\`text
Request
  ↓
Zod
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
MongoDB Driver
  ↓
MongoDB
\`\`\`

هذا Architecture ممتازة ومشروعة تمامًا.

# 345. Architecture مع Mongoose

\`\`\`text
Request
  ↓
Zod / express-validator
  ↓
Controller
  ↓
Service
  ↓
Mongoose Model
  ↓
MongoDB Driver
  ↓
MongoDB
\`\`\`

هنا Mongoose تمثل data modeling layer.

# 346. خطأ شائع: Mongoose هي Database

خطأ.

\`\`\`text
MongoDB = Database system
Mongoose = Node.js ODM library
\`\`\`

إذا حذفت Mongoose، MongoDB ما زالت تعمل ويمكنك الاتصال بها باستخدام Driver الرسمية.

# 347. خطأ شائع: MongoDB Schemaless يعني بدون قواعد

خطأ.

يمكنك فرض:

- application validation.
- MongoDB collection schema validation.
- indexes.
- unique constraints عبر indexes.
- Mongoose schema rules إذا كنت تستخدم Mongoose.

Flexible schema لا تعني chaotic data.

# 348. unique في Mongoose

مثال:

\`\`\`js
email: {
  type: String,
  required: true,
  unique: true,
}
\`\`\`

نقطة مهمة:

\`unique: true\` ليست validator عادية بالمعنى التقليدي؛ هي shortcut لإنشاء unique index.

يجب التعامل مع duplicate key error أيضًا.

# 349. Indexes

Index تساعد MongoDB في الوصول للبيانات بسرعة بدل scan لكل documents في كثير من الاستعلامات.

مثال:

\`\`\`js
courseSchema.index({
  title: 1
});
\`\`\`

لكن indexes لها تكلفة:

- مساحة تخزين.
- تكلفة إضافية عند writes.
- تحتاج تصميم حسب queries الحقيقية.

# 350. Connection Pool

لا تفتح connection جديدة لكل request.

Driver وMongoose يديران connection pool.

المفهوم:

\`\`\`text
App
  ↓
Connection Pool
├── connection
├── connection
├── connection
└── connection
  ↓
MongoDB
\`\`\`

عادة تنشئ connection عند بدء التطبيق وتعيد استخدامها.

# 351. Connection في ملف منفصل

\`db/connect.js\`:

\`\`\`js
const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Database connected");
}

module.exports = connectDB;
\`\`\`

ثم في server:

\`\`\`js
const app = require("./app");
const connectDB = require("./db/connect");

async function start() {
  await connectDB();

  app.listen(3000, () => {
    console.log("Server running");
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
\`\`\`

# 352. لماذا ننتظر DB قبل listen؟

إذا بدأ API في استقبال requests قبل أن يصبح database connection جاهزًا، قد تحصل requests على failures غير لازمة في startup.

لذلك كثير من التطبيقات تعمل:

\`\`\`text
Connect DB
   ↓
Success
   ↓
Start HTTP Server
\`\`\`

# 353. MongoDB CRUD داخل REST API

الربط النهائي:

\`\`\`text
POST /api/courses
      ↓
Validate Body
      ↓
Course.create()
      ↓
MongoDB
      ↓
201 Created
\`\`\`

GET:

\`\`\`text
GET /api/courses
      ↓
Course.find()
      ↓
MongoDB Query
      ↓
Documents
      ↓
200 JSON
\`\`\`

# 354. ماذا تتعلم أولًا: Driver أم Mongoose؟

للتعلم العميق:

1. افهم MongoDB نفسها.
2. جرّب CRUD في mongosh/Compass.
3. استخدم Native Driver مرة واحدة على الأقل.
4. بعدها تعلم Mongoose.

السبب: لو بدأت Mongoose مباشرة قد تظن أن:

\`find\`, \`ObjectId\`, collections، queries

أشياء اخترعتها Mongoose، بينما معظم المفاهيم أصلها MongoDB.

# 355. قراري لك في هذا الكورس

بما أنك تتعلم Backend وتريد فهم ما يحدث لا مجرد حفظ syntax:

> تعلم Native MongoDB Driver أولًا بشكل مختصر، ثم استخدم Mongoose في مشروع CRUD متوسط.

بهذه الطريقة ستفهم الفرق الحقيقي.

لا تتعامل مع Mongoose كأنها "ضرورية"، ولا ترفضها لمجرد أن Driver تستطيع CRUD.

السؤال الصحيح:

> هل المشروع يستفيد من modeling layer أم الأفضل أن أبقى أقرب للـ MongoDB APIs؟

# 356. Mental Model النهائي

\`\`\`text
MongoDB Ecosystem

MongoDB Server
│
├── Database
│   └── Collection
│       └── Document
│           └── Fields
│
├── BSON
│   └── ObjectId
│
└── Clients
    ├── Compass
    ├── mongosh
    └── Node.js App
          │
          ├── MongoDB Driver
          │
          └── Mongoose
                ↓
          MongoDB Driver
\`\`\`

احفظها بهذا الشكل:

> MongoDB هي الـ Database system. Driver هي طريقة Node للتحدث معها. Mongoose طبقة Modeling اختيارية فوق Driver.

## أخطاء شائعة وتصحيحها

1. **MongoDB = Mongoose** → خطأ؛ Mongoose library فوق MongoDB Driver.
2. **Mongoose ضرورية** → خطأ؛ Native Driver كافية لبناء تطبيق كامل.
3. **Schemaless = بدون أي structure** → خطأ؛ MongoDB flexible schema ويمكن فرض validation.
4. **ObjectId = auto increment number** → خطأ.
5. **Compass = database** → خطأ؛ Compass client GUI.
6. **Atlas = MongoDB مختلفة** → لا؛ Atlas خدمة managed لتشغيل MongoDB.
7. **BSON دائمًا أصغر من JSON** → خطأ.
8. **Schema في Mongoose = Collection** → خطأ.
9. **Model = Document** → خطأ؛ Model تنشئ/تستعلم عن Documents.
10. **unique: true مجرد validator** → غير دقيق؛ يعتمد على unique index.
11. **Mongoose تغني عن API validation** → خطأ.
12. **يجب فتح DB connection لكل request** → خطأ؛ استخدم connection pooling وإعادة الاستخدام.

## تمارين عملية

1. أنشئ database باسم school.
2. أنشئ courses collection من Compass أو mongosh.
3. نفذ insertOne وfind وupdateOne وdeleteOne.
4. اعرض _id وافهم نوع ObjectId.
5. اكتب Node script باستخدام package mongodb.
6. نفذ insertOne وfindOne باستخدام Native Driver.
7. أنشئ نفس المشروع باستخدام Mongoose.
8. أنشئ Course Schema فيها title وprice وactive.
9. أضف required وmin وdefault.
10. جرّب إدخال price سالبة ولاحظ validation error.
11. جرّب find وfindById.
12. جرّب findByIdAndUpdate مع runValidators.
13. أضف timestamps.
14. استخدم lean في GET endpoint.
15. اكتب نسخة Repository باستخدام Native Driver ثم نسخة باستخدام Mongoose وقارن كمية الكود.

## أسئلة مراجعة

1. ما الفرق بين Database وDBMS؟
2. ما الفرق الأساسي بين relational database وdocument database؟
3. ما هي MongoDB؟
4. ما الفرق بين Database وCollection وDocument؟
5. ما هو BSON؟ ولماذا لا نقول إنه مجرد JSON text؟
6. هل BSON دائمًا أصغر من JSON؟
7. ماذا يعني flexible schema؟
8. لماذا كلمة Schemaless قد تكون مضللة؟
9. ما هو _id؟
10. ما هو ObjectId؟
11. هل ObjectId auto-increment integer؟
12. ما الفرق بين MongoDB Server وCompass؟
13. ما وظيفة mongosh؟
14. ما هي Atlas؟
15. ما هو MongoDB Driver؟
16. لماذا يحتاج Node Driver للتعامل مع MongoDB؟
17. هل Native Driver وحدها تكفي لبناء CRUD كاملة؟
18. لماذا نستخدم Mongoose إذا كانت Driver تكفي؟
19. ما هو ODM؟
20. ما هي Schema في Mongoose؟
21. ما الفرق بين Schema وModel وDocument؟
22. ماذا تفعل Course.create()؟
23. ما الفرق بين find وfindOne وfindById؟
24. لماذا نستخدم runValidators في بعض updates؟
25. ما معنى Casting في Mongoose؟
26. هل Mongoose Validation تغني عن Zod أو API validation؟
27. ما فائدة timestamps؟
28. ما هي hooks؟
29. ما هي virtuals؟
30. ما وظيفة populate؟
31. ما فائدة lean؟
32. متى تكون Native Driver اختيارًا أفضل؟
33. متى تكون Mongoose مفيدة أكثر؟
34. هل Mongoose تجعل MongoDB نفسها أسرع؟
35. هل Zod تغني عن Mongoose؟
36. لماذا unique: true ليست validator عادية فقط؟
37. ما هي Indexes وما تكلفتها؟
38. لماذا لا نفتح connection جديدة لكل request؟
39. لماذا قد ننتظر DB connection قبل app.listen؟
40. ما الترتيب الأفضل لتعلم MongoDB ثم Driver ثم Mongoose؟
`,
};
