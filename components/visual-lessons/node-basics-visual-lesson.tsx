"use client";

import { useEffect, useState } from "react";
import { BookOpenText, Check, ChevronLeft, ChevronRight, Code2, Cpu, Database, Globe2, Layers3, Network, RotateCcw, SquareTerminal } from "lucide-react";
import ReactMarkdown from "react-markdown";\nimport remarkGfm from "remark-gfm";

type Slide = { title:string; kicker:string; summary:string; icon:"code"|"node"|"v8"|"memory"|"layers"|"browser"|"terminal"|"review"; details:string };

const slides: Slide[] = [
{title:"JavaScript هي اللغة، لكن أين تعمل؟",kicker:"01 · Language → Runtime",summary:"نبدأ من القاعدة: JavaScript لغة، أما Browser وNode.js فهما بيئتا تشغيل.",icon:"code",details:String.raw`
## JavaScript وRuntime Environment
**Runtime** هي البيئة التي يتم داخلها تنفيذ البرنامج أثناء التشغيل.

\`\`\`text
JavaScript → Browser Runtime
JavaScript → Node.js Runtime
\`\`\`

القاعدة التي سنبني عليها الفصل كله:

\`\`\`text
JavaScript ≠ Browser
JavaScript ≠ Node.js
\`\`\`

JavaScript هي اللغة. Browser وNode.js بيئتا تشغيل توفران للغة محرك تنفيذ وAPIs وإمكانيات مختلفة.
`},
{title:"ما هي Node.js؟",kicker:"02 · Meet Node.js",summary:"ندخل الآن إلى Node.js نفسها: Runtime مفتوحة المصدر، Cross-platform، وتشغّل JavaScript خارج المتصفح.",icon:"node",details:String.raw`
## تعريف Node.js
Node.js هي **JavaScript Runtime Environment** تسمح بتشغيل JavaScript خارج المتصفح. ليست لغة جديدة، وليست Framework أو JavaScript library.

Node.js تستخدم V8 وتضيف حوله Node APIs وlibuv وطبقات C/C++ للوصول إلى إمكانيات نظام التشغيل، ولذلك يمكنها التعامل مع Files وServers وNetwork وProcesses وDatabases وStreams وSockets.

### Open Source
الكود المصدري لـNode.js متاح للعامة؛ يمكن دراسة المشروع، الإبلاغ عن Bugs والمساهمة عبر Pull Requests. المشروع نفسه يستخدم JavaScript وC++ وC.

### Cross-platform
تعمل Node.js على Windows وLinux وmacOS. معظم التطبيق يعمل دون تغيير، لكن File paths وEnvironment variables وPermissions وProcess signals قد تختلف، لذلك توفر Node APIs طبقة تساعد على التعامل مع هذه الاختلافات.

\`\`\`js
const os = require("node:os");
console.log(os.platform()); // win32 | linux | darwin
\`\`\`
`},
{title:"من ينفذ JavaScript داخل Node؟",kicker:"03 · Inside V8",summary:"نفتح Node.js ونجد V8: المحرك المسؤول عن فهم JavaScript وتجهيزها وتنفيذها.",icon:"v8",details:String.raw`
## Node.js وV8
V8 هو JavaScript Engine طُوّر أساسًا بواسطة Google ويُستخدم في Chrome وكذلك Node.js.

\`\`\`text
JavaScript Code → V8 → executable instructions → CPU
\`\`\`

V8 مسؤول عن **Parsing وCompilation/JIT وExecution وMemory Management وGarbage Collection وOptimization**. لكن Node.js ليست V8 فقط.

### Parsing
V8 يقرأ Source Code ويفهم تركيبه النحوي ويحوله إلى تمثيل داخلي/AST-like structure. مثل \`const x = 10 + 20\` يجب فهمه كـvariable declaration وexpression. وإذا كان الكود \`const x = ;\` فسيظهر Syntax Error قبل التنفيذ الطبيعي.

### Compilation وJIT
بعد فهم البنية، يستخدم V8 pipeline من interpreter/compiler وتقنيات JIT لإنتاج تعليمات قابلة للتنفيذ بكفاءة. لذلك وصف JavaScript بأنها interpreted فقط تبسيط غير دقيق.

### Execution
تبدأ التعليمات في العمل، وتدخل function calls إلى Call Stack ثم تخرج عند الانتهاء.

\`\`\`text
Function call → Call Stack → Execute → Return
\`\`\`

هذه المراحل Mental Model وليست خطًا يحدث مرة واحدة فقط؛ أثناء التشغيل تتداخل معها الذاكرة والـGC والـoptimization.
`},
{title:"ماذا يحدث للبيانات أثناء التشغيل؟",kicker:"04 · Memory → GC → Optimization",summary:"بعد تنفيذ الكود نتابع البيانات في الذاكرة، ثم نرى كيف ينظف V8 غير المستخدم ويحسّن الكود المتكرر.",icon:"memory",details:String.raw`
## Memory Management
القيم والـobjects والـfunctions والبيانات المؤقتة تحتاج Memory. V8 يدير تخصيص الذاكرة تلقائيًا.

\`\`\`js
const user = { name: "Osama", age: 28 };
\`\`\`

الفكرة: Create value → Allocate Memory → Use data.

## Garbage Collection
إذا لم يعد object قابلًا للوصول، يمكن للـGarbage Collector استعادة ذاكرته لاحقًا.

\`\`\`js
let user = { name: "Osama" };
user = null;
\`\`\`

هذا لا يعني أن GC يعمل فورًا؛ V8 يحدد متى وكيف يجري عملية التنظيف.

## Optimization وDeoptimization
يراقب V8 التنفيذ. الكود الذي يصبح "hot" قد يخضع لـJIT optimization ليعمل أسرع. وإذا تغيرت assumptions التي بُني عليها التحسين يمكن أن يحدث deoptimization.

\`\`\`text
Source → Parsing → Compilation/JIT → Execution
                         ↕
Memory → GC when needed → Optimization/Deoptimization
\`\`\`
`},
{title:"V8 وحده لا يصنع Node.js",kicker:"05 · Node APIs + libuv + OS",summary:"نخرج من V8 ونرى الطبقات التي تمنح JavaScript الملفات والشبكة والـasync I/O وإمكانيات النظام.",icon:"layers",details:String.raw`
## الصورة الكاملة
**V8** ينفذ JavaScript ويدير Heap وGC وJIT. **Node APIs** هي الواجهة مثل fs/http/net/crypto/timers/streams. **C/C++ bindings** تربط JavaScript بالطبقات native عند الحاجة. **libuv** يوفر Event Loop وThread Pool وطبقة cross-platform للـasync I/O. وفي الأسفل يوجد **Operating System** والموارد الحقيقية.

| الجزء | المسؤولية الأساسية |
|---|---|
| V8 | JavaScript + Memory + GC + JIT |
| Node APIs | fs/http/net/crypto/streams/timers |
| C/C++ bindings | الربط بالطبقات native |
| libuv | Event Loop + Async I/O + Thread Pool + OS abstraction |
| OS | Files + sockets + network + system calls + resources |

### لماذا تحتاج Node إلى C++؟
JavaScript كلغة لا تحتوي \`readFile()\` أو APIs مباشرة للـfilesystem وnetwork sockets والـprocesses. Node هي التي توفر هذه الإمكانيات وتربطها بالنظام.

\`\`\`js
const fs = require("node:fs");
fs.readFile("users.json", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});
\`\`\`

في async filesystem APIs يرتبط العمل غالبًا بـlibuv Thread Pool. أما networking فلا يعني أن كل request يعمل داخل Thread Pool؛ أغلب socket I/O يعتمد على آليات OS مثل epoll/kqueue/IOCP وتنسق libuv معها عبر Event Loop.

\`\`\`text
File: JS → fs → internals/bindings → libuv → Thread Pool/OS → Event Loop → callback → V8
Network: JS → http/net → Node/libuv → OS networking → Event Loop → callback → V8
\`\`\`

الجملة الأساسية: **V8 يشغّل JavaScript، libuv تنسق asynchronous I/O والـEvent Loop، وNode APIs تربط كودك بهذه الإمكانيات ونظام التشغيل.**
`},
{title:"نفس اللغة، عالم مختلف",kicker:"06 · Browser vs Node.js",summary:"نرجع إلى نفس JavaScript ونقارن ما توفره البيئة حولها: DOM في المتصفح مقابل Node APIs في Node.js.",icon:"browser",details:String.raw`
## Browser JavaScript vs Node.js
كلاهما يشغل JavaScript، لكن البيئة المحيطة مختلفة. Browser يوفر \`window\`, \`document\`, \`localStorage\`, \`navigator\`, \`location\` وDOM/Browser APIs. Node يوفر مثلًا \`fs\`, \`path\`, \`http\`, \`process\`.

\`\`\`js
console.log(document); // ReferenceError in Node عادةً
\`\`\`

\`document\` ليست جزءًا من JavaScript؛ هي DOM API يوفرها المتصفح.

## Global Object
الطريقة الحديثة المشتركة للوصول إلى global object هي \`globalThis\`. في Browser يوجد تقليديًا \`window\`، وفي Node يوجد \`global\`.

\`\`\`text
JavaScript → globalThis
             ↙      ↘
         Browser    Node.js
          window     global
\`\`\`

لا تعتمد على \`this\` كأنه دائمًا Global Object؛ قيمته تختلف حسب السياق وModule وStrict mode وطريقة استدعاء function. في CommonJS مثلًا قد يشير top-level \`this\` إلى \`module.exports\`. استخدم \`globalThis\` عند الحاجة إلى Global Object.
`},
{title:"شغّل Node.js بيدك",kicker:"07 · Terminal + REPL",summary:"بعد فهم الداخل، نستخدم Node فعليًا: REPL للتجربة السريعة ثم تشغيل app.js من Terminal.",icon:"terminal",details:String.raw`
## Node REPL
بعد تثبيت Node اكتب \`node\` في Terminal فتدخل إلى REPL: **Read → Evaluate → Print → Loop**.

\`\`\`text
> 1 + 1
2
> const name = "Osama"
undefined
> name
'Osama'
\`\`\`

REPL مفيد لتجربة JavaScript بسرعة، اختبار Functions وNode APIs وdebugging بسيط.

أوامر مهمة: \`.help\`, \`.exit\`, \`.clear\`, \`.save\`, \`.load\`. ويمكن الخروج بـ\`.exit\` أو Ctrl+C مرتين.

## تشغيل JavaScript File
أنشئ \`app.js\`:

\`\`\`js
console.log("Hello from Node.js");
\`\`\`

ثم شغله:

\`\`\`bash
node app.js
# أو
node ./app.js
\`\`\`
`},
{title:"ثبّت الـMental Model",kicker:"08 · Review + Corrections",summary:"نغلق الرحلة بربط Language → Runtime → Engine → APIs → OS وتصحيح أكثر الأخطاء الشائعة.",icon:"review",details:String.raw`
## Mental Model النهائي
\`\`\`text
JavaScript Language
       ↓
Node.js Runtime
       ├── V8 → Parsing / JIT / Execution / Memory / GC
       ├── Node APIs → fs / http / process / path / streams...
       ├── libuv → Event Loop / Async I/O / Thread Pool
       ├── C/C++ bindings
       ↓
Operating System
\`\`\`

لا تقل \`Node.js = V8\`؛ قل **Node.js uses V8**. ولا تقل \`Node.js is JavaScript\`؛ JavaScript = Language وNode.js = Runtime Environment. وللوصول إلى Global Object استخدم \`globalThis\`.

هذا الـMental Model هو الأساس لما سيأتي لاحقًا في Event Loop وAsync I/O وStreams وBuffers وProcesses وWorker Threads وNetworking.

## أسئلة مراجعة
1. ما الفرق بين JavaScript وNode.js؟
2. ما معنى Runtime Environment؟
3. ما وظيفة V8 وما المقصود بـParsing وCompilation/JIT وExecution؟
4. ما المقصود بـMemory Management وGC؟ وهل GC يعمل فور إزالة reference؟
5. ما معنى Optimization وDeoptimization؟
6. ما الفرق بين V8 وlibuv؟
7. ما دور Node APIs وC++ bindings؟
8. هل Network I/O تستخدم Thread Pool لكل request؟
9. لماذا تحتاج Node إلى C/C++ وما معنى Cross-platform؟
10. ما هو REPL وكيف تشغل JavaScript file؟
11. ما الفرق بين Browser APIs وNode APIs ولماذا document غير موجود عادة في Node؟
12. ما هو globalThis ولماذا لا نعتمد على this؟
`}
];

function SceneIcon({kind}:{kind:Slide["icon"]}) {
  const p={size:42,strokeWidth:1.5};
  if(kind==="code") return <Code2 {...p}/>;
  if(kind==="node") return <Network {...p}/>;
  if(kind==="v8") return <Cpu {...p}/>;
  if(kind==="memory") return <Database {...p}/>;
  if(kind==="layers") return <Layers3 {...p}/>;
  if(kind==="browser") return <Globe2 {...p}/>;
  if(kind==="terminal") return <SquareTerminal {...p}/>;
  return <Check {...p}/>;
}

export function NodeBasicsVisualLesson() {
  const [index,setIndex]=useState(0);
  const [details,setDetails]=useState(false);
  const slide=slides[index];
  const [phase,setPhase]=useState(0);
  const go=(next:number)=>{setIndex(next);setDetails(false);setPhase(0);};

  useEffect(()=>{
    if(details) return;
    setPhase(0);
    const timers=[700,1800,3100].map((delay,i)=>window.setTimeout(()=>setPhase(i+1),delay));
    return ()=>timers.forEach((timer)=>window.clearTimeout(timer));
  },[index,details]);

  return <section className="visualLesson visualJourney chapterMovie">
    <div className="visualLessonTopbar">
      <div><span className="visualLive"><i/> CHAPTER MOVIE</span><span className="visualLessonMeta">الفصل 01 · {slide.kicker}</span></div>
      <div className="visualLessonProgress">{slides.map((_,i)=><span key={i} className={i<=index?"active":""}/>)}</div>
    </div>

    {details ? <div className="visualDetailsPanel slideDetails">
      <div className="visualDetailsHeader"><div><span>تفاصيل السلايد {String(index+1).padStart(2,"0")}</span><strong>{slide.title}</strong></div><button onClick={()=>setDetails(false)}><RotateCcw size={15}/> العودة للمشهد</button></div>
      <div className="visualDetailsScroll movieDetailsContent">
        <div className="movieDetailsLead"><SceneIcon kind={slide.icon}/><div><span>{slide.kicker}</span><h2>{slide.title}</h2><p>{slide.summary}</p></div></div>
        <article className="movieMarkdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{slide.details}</ReactMarkdown></article>
      </div>
    </div> :
    <div className="visualLessonStage movieStage">
      <div className="visualAmbient visualAmbientOne"/><div className="visualAmbient visualAmbientTwo"/><div className="visualGrid"/>
      <div className={`movieSceneIcon autoPhase phase-${phase}`}><SceneIcon kind={slide.icon}/><span>{String(index+1).padStart(2,"0")}</span></div>
      <div className={`visualCopy movieCopy autoPhase phase-${phase}`}><span className="visualEyebrow">{slide.kicker}</span><h2>{slide.title}</h2><p>{slide.summary}</p></div>
      <div className={`movieFlow autoPhase phase-${phase}`}>
        {index===0 && <><span>JavaScript</span><b>→</b><span>Browser Runtime</span><b>/</b><span>Node.js Runtime</span></>}
        {index===1 && <><span>V8</span><b>+</b><span>Node APIs</span><b>+</b><span>libuv</span><b>→</b><span>OS</span></>}
        {index===2 && <><span>Source</span><b>→</b><span>Parsing</span><b>→</b><span>JIT</span><b>→</b><span>Execution</span></>}
        {index===3 && <><span>Memory</span><b>→</b><span>GC</span><b>↔</b><span>Optimization</span></>}
        {index===4 && <><span>JavaScript</span><b>→</b><span>Node APIs</span><b>→</b><span>libuv / Native</span><b>→</b><span>OS</span></>}
        {index===5 && <><span>Browser APIs</span><b>←</b><span>JavaScript</span><b>→</b><span>Node APIs</span></>}
        {index===6 && <><span>Terminal</span><b>→</b><span>node</span><b>→</b><span>REPL / app.js</span></>}
        {index===7 && <><span>Language</span><b>→</b><span>Runtime</span><b>→</b><span>Engine + APIs</span><b>→</b><span>OS</span></>}
      </div>
      <div className={`visualLessonCaption autoPhase phase-${phase}`}>المشهد {index+1} من {slides.length} · {slide.summary}</div>
    </div>}

    <div className="visualLessonControls movieControls">
      <div className="visualPlayback">
        <button className="visualSecondaryButton" disabled={index===0} onClick={()=>go(index-1)}><ChevronRight size={16}/> السابق</button>
        <span className="movieCounter">{index+1} / {slides.length}</span>
        <button className="visualNextButton" disabled={index===slides.length-1} onClick={()=>go(index+1)}>التالي <ChevronLeft size={16}/></button>
      </div>
      <button className="visualReferenceButton" onClick={()=>setDetails(!details)}><BookOpenText size={16}/>{details?"العودة للمشهد":"التفاصيل والمرجع"}</button>
    </div>
  </section>;
}
