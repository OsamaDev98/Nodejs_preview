export const lessonSummaries: Record<string, string> = {
  foundations: `
- **Node.js** هي JavaScript Runtime وليست لغة أو Framework.
- **V8** ينفذ JavaScript ويقوم بـ Parsing وCompilation/JIT وExecution وإدارة الـ Heap والـ Garbage Collection والـ Optimization.
- **libuv** مسؤولة عن Event Loop وThread Pool وطبقة asynchronous I/O والتكامل مع نظام التشغيل.
- **Node APIs** مثل fs وhttp وnet وcrypto هي الواجهة التي تستخدمها من JavaScript للوصول إلى إمكانيات Node.
- Node.js ليست V8 فقط؛ هي منظومة تجمع V8 وNode APIs وlibuv وC/C++ bindings وOperating System.
- JavaScript نفسها لغة، بينما Browser وNode.js بيئات تشغيل مختلفة ولكل منهما APIs خاصة.
- **globalThis** هو الأسلوب القياسي للوصول إلى الـ global object.
- **REPL** أداة سريعة لتجربة JavaScript وNode APIs من الـ terminal.
`,

  modules: `
- الـ **Module** يقسم التطبيق إلى وحدات مستقلة وقابلة لإعادة الاستخدام.
- Node يدعم **CommonJS** باستخدام require/module.exports و**ESM** باستخدام import/export.
- Built-in modules تأتي مع Node، Local modules داخل مشروعك، وNPM modules حزم خارجية.
- CommonJS module يُغلف داخليًا بـ Module Wrapper يوفر require وmodule وexports و__filename و__dirname.
- كل module لديه scope مستقل.
- **Module Cache** تجعل require يعيد نفس exports غالبًا بدل إعادة تنفيذ الملف كل مرة.
- require.resolve يحدد المسار الفعلي للموديول، وrequire.cache يسمح برؤية الكاش في CommonJS.
- Internal bindings تربط Node JavaScript APIs بالكود native ونظام التشغيل، لكنها ليست API عامة للتطبيقات.
`,

  "files-buffers": `
- **node:fs** توفر APIs لقراءة الملفات وكتابتها وإضافتها وحذفها والتعامل مع الـ filesystem.
- Sync APIs مثل readFileSync تعمل **Blocking**؛ Async APIs تسمح لـ Node بمتابعة أعمال أخرى.
- await مع fs/promises لا يساوي synchronous I/O؛ الـ async function تتوقف منطقيًا بينما Event Loop تستمر.
- **Error-first callback** تستخدم النمط (err, data) ويجب التعامل مع الخطأ أولًا.
- **Buffer** يمثل sequence من bytes في الذاكرة ويستخدم مع الملفات والشبكات والصور والـ streams والبيانات الثنائية.
- **Encoding** هو القاعدة التي تحدد تحويل Characters ↔ Bytes.
- **UTF-8** أشهر encoding للنصوص الحديثة ويدعم العربية وUnicode.
- بدون encoding ترجع readFile عادة Buffer؛ مع "utf8" ترجع String بعد decoding.
- buffer.length يقيس bytes، لذلك لا يساوي دائمًا عدد الأحرف.
- التعامل مع JSON file غالبًا: Read → Parse → Modify → Stringify → Write.
`,

  "streams-npm": `
- **Streams** تعالج البيانات تدريجيًا على شكل chunks بدل تحميل كل شيء في الذاكرة.
- Readable وWritable streams أساس التعامل مع الملفات الكبيرة والشبكات.
- pipe() يربط stream بأخرى ويساعد في إدارة تدفق البيانات.
- **Backpressure** تمنع producer السريع من إغراق consumer الأبطأ.
- async لا يعني دائمًا memory efficient؛ قراءة ملف ضخم كاملًا قد تستهلك ذاكرة كبيرة رغم أنها non-blocking.
- **npm** يدير packages والdependencies والscripts ويتعامل مع npm Registry.
- package.json يصف المشروع واعتمادياته، وpackage-lock.json يثبت dependency tree والنسخ resolved بدقة أكبر.
- node_modules يحتوي الحزم المثبتة ولا يُرفع إلى Git عادة.
- dependencies مطلوبة للتطبيق غالبًا، بينما devDependencies أدوات للتطوير والبناء والاختبار.
`,

  "libuv-threadpool": `
- **libuv** مكتبة C cross-platform تشكل جزءًا أساسيًا من بنية Node asynchronous.
- كود JavaScript يعمل افتراضيًا على Main JS Thread واحد، لكن Node process تستخدم threads أخرى داخليًا.
- **Offloading** يعني نقل العمل إلى OS mechanisms أو libuv Thread Pool بدل حجز main thread.
- ليست كل async operation تستخدم Thread Pool.
- Network sockets تعتمد غالبًا على kernel event mechanisms، بينما Async File I/O وبعض crypto وzlib وبعض DNS تستخدم Thread Pool.
- الحجم الافتراضي الشائع للـ libuv Thread Pool هو 4 ويمكن تعديله بـ UV_THREADPOOL_SIZE.
- زيادة عدد workers ليست حلًا سحريًا؛ قد تسبب contention وcontext switching.
- pbkdf2Sync blocking، بينما pbkdf2 async تستطيع استخدام Thread Pool.
- Thread Pool Starvation تحدث عندما تنشغل كل workers بأعمال طويلة فتنتظر مهام أخرى.
`,

  "event-loop": `
- **Event Loop** تنسق تنفيذ callbacks عندما تصبح العمليات جاهزة ويصبح main thread متاحًا.
- Event Loop لا تنفذ I/O نفسها بالضرورة؛ العمل الفعلي قد يكون في OS أو Thread Pool.
- Concurrency تختلف عن Parallelism؛ Node ممتازة خصوصًا في I/O-heavy workloads.
- أهم phases المبسطة: timers، pending callbacks، poll، check، close callbacks.
- setTimeout/setInterval يرتبطان بالـ timers، وsetImmediate يرتبط بالـ check phase.
- timer delay هو minimum threshold وليس موعد تنفيذ مضمون.
- داخل I/O callback غالبًا setImmediate يسبق setTimeout(0) لأن check تأتي بعد poll.
- أي CPU-heavy JavaScript طويل يحجز main thread ويسبب Event Loop Lag.
- قاعدة Backend المهمة: **Keep the Event Loop free**.
`,

  microtasks: `
- **Microtasks** مثل Promise callbacks وqueueMicrotask لها scheduling أولوية عالية.
- Node لديها أيضًا **process.nextTick queue** ذات أولوية خاصة.
- الترتيب الذهني المبسط: synchronous code → nextTick → Promise microtasks → متابعة Event Loop.
- process.nextTick أو microtasks المتكررة بلا نهاية قد تسبب **Starvation**.
- Promise وasync/await لا تنشئ threads تلقائيًا.
- setImmediate وsetTimeout(0) لهما semantics مختلفة ولا تعتمد على ترتيب ثابت بينهما في top-level.
- بعد await، استكمال الـ async function يعود عادة عبر microtask.
- فرّق دائمًا بين I/O-bound وCPU-bound عند تصميم backend workload.
`,

  "workers-performance": `
- CPU-heavy JavaScript على main thread تؤخر جميع requests والcallbacks.
- **Worker Threads** تسمح بتشغيل JavaScript CPU-heavy في threads منفصلة.
- Worker Threads ليست هي libuv Thread Pool؛ الأولى تنشئها أنت للـ JavaScript، والثانية تديرها Node لعمليات native معينة.
- Child Process عملية مستقلة بذاكرة وPID منفصلين، بينما Worker Thread داخل نفس process.
- **Event Loop Lag** يقيس تأخر callback بسبب انشغال main thread.
- **Latency** زمن إنجاز عملية واحدة، و**Throughput** عدد العمليات التي تُنجز في وحدة الزمن.
- اختيار strategy للـ CPU-heavy work قد يشمل Worker Threads أو Child Processes أو job queues أو services منفصلة.
- الأداء لا يُحسن بالتخمين؛ benchmark ثم measure ثم adjust.
`,

  "labs-reference": `
- هذا الفصل يجمع التمارين العملية التي تثبت فهم Node internals بدل الحفظ النظري.
- قارن Sync وAsync File System عمليًا وشاهد أثر الـ blocking.
- اختبر Streams وراقب فكرة chunks واستهلاك الذاكرة.
- قارن pbkdf2Sync مع pbkdf2 async لفهم Thread Pool.
- غيّر UV_THREADPOOL_SIZE وراقب النتائج بدل افتراض أن رقمًا أكبر أفضل.
- في Event Loop labs، توقع الـ output أولًا ثم شغّل الكود وفسر لماذا.
- افهم nextTick وPromises وtimers وsetImmediate داخل سياقات مختلفة.
- راقب starvation وevent loop delay بعناية.
- الخلاصة المعمارية: V8 ينفذ JavaScript، libuv تنسق async I/O، والـ OS أو Thread Pool ينفذان العمل المناسب حسب الـ API.
`,

  "http-fundamentals": `
- HTTP هو Application-layer protocol للتواصل بين Client وServer.
- Request يحتوي method وURL وheaders وربما body، وResponse يحتوي status code وheaders وbody.
- IP يحدد الجهاز، والـ Port يحدد الخدمة داخل الجهاز.
- node:http يسمح بإنشاء HTTP server بدون Framework.
- req هو IncomingMessage وres هو ServerResponse.
- res.write ترسل chunks، وres.end تنهي response.
- HTTP Methods تحدد intent مثل GET وPOST وPUT وPATCH وDELETE.
- Status codes تنقسم إلى 1xx و2xx و3xx و4xx و5xx.
- Request body في raw Node يصل كـ Stream ويحتاج parsing.
- Routing اليدوي مفيد للفهم لكنه يصبح صعب الصيانة عندما يكبر التطبيق.
`,

  "express-middleware": `
- Express تبني abstraction مريحة فوق Node HTTP لكنها لا تلغي الحاجة لفهم HTTP.
- Route = HTTP Method + Path + Handler.
- req.params للمسار الديناميكي، req.query للـ query string، وreq.body للـ parsed body.
- res.send وres.json وres.status helpers لبناء response بسهولة.
- **Middleware** تعمل على req/res وقد تمرر التحكم باستخدام next().
- ترتيب تسجيل middleware مهم لأن Express تنفذ stack بالترتيب.
- express.json parses JSON body، وexpress.static تخدم static files.
- إرسال response ثم محاولة إرسال أخرى يسبب مشكلة headers already sent.
- 404 handler يوضع بعد routes، وError Middleware تستخدم signature من أربعة parameters.
- express.Router يساعد في تقسيم routes وتنظيم المشروع إلى طبقات قابلة للتوسع.
`,
};
