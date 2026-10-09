import type { StudyChapter } from "@/types/study";

export const realtimeSocketIoChapter: StudyChapter = {
  id: "realtime-socketio",
  number: 17,
  title: "Real-Time Applications: WebSocket وSocket.IO",
  subtitle: "فهم الفرق بين HTTP وWebSocket وPolling وLong-Polling، ثم بناء Chat/Typing Indicator باستخدام Socket.IO وشرح on/emit وbroadcast وio.emit والاتصال من نفس أو دومين مختلف.",
  readingTime: "95 دقيقة",
  keywords: ["Real-Time", "WebSocket", "Socket.IO", "Polling", "Long-Polling", "EventEmitter", "socket.on", "socket.emit", "io.emit", "broadcast", "Typing Indicator", "CORS", "Handshake", "Rooms", "Namespaces"],
  content: String.raw`
# قبل أن تبدأ: لماذا Real-Time؟

في REST API التقليدية غالبًا Client تطلب البيانات عندما تحتاجها:

~~~text
Client
  ↓ request
Server
  ↓ response
Client
~~~

لكن في Chat، Notifications، Live Dashboard أو Typing Indicator نحتاج Server تدفع تحديثًا فور حدوثه.

~~~text
Client A
   ↓ event
Server
   ↓ event
Client B
~~~

هذا هو أساس Real-Time Applications.

# 566. ما المقصود بـ Real-Time Application؟

هي Application تحاول إيصال التحديثات للمستخدمين بسرعة شديدة بعد حدوثها.

أمثلة:

- Chat.
- Typing indicator.
- Notifications.
- Live scores.
- Tracking.
- Collaborative editing.
- Live dashboards.

Real-Time هنا لا تعني بالضرورة "صفر تأخير"، بل Low-Latency updates.

# 567. HTTP Request/Response Model

HTTP التقليدية تعمل غالبًا بهذا الشكل:

~~~text
Client
  ↓ Request
Server
  ↓ Response
Client
~~~

Server عادة لا ترسل Response من تلقاء نفسها بدون وجود Request مرتبطة.

لهذا Chat باستخدام REST فقط تحتاج حلول إضافية مثل Polling.

# 568. Polling

Polling تعني أن Client تسأل Server كل فترة:

~~~text
Client: هل هناك رسائل جديدة؟
Server: لا

بعد 2 ثانية

Client: هل هناك رسائل جديدة؟
Server: لا

بعد 2 ثانية

Client: هل هناك رسائل جديدة؟
Server: نعم
~~~

مثال مبسط:

~~~js
setInterval(async () => {
  const response =
    await fetch(
      "/api/messages"
    );

  const messages =
    await response.json();
}, 2000);
~~~

# 569. مشكلة Polling

إذا لا يوجد Data جديدة، ما زلت ترسل Requests بلا داعٍ.

قد يؤدي إلى:

- Requests كثيرة.
- Bandwidth أعلى.
- Load أعلى.
- Delay حتى polling interval القادمة.

إذا interval = 5s، قد ينتظر المستخدم حتى 5 ثوانٍ قبل رؤية الرسالة.

# 570. Long-Polling

Long-Polling تقلل عدد Requests.

Client ترسل Request، وServer لا ترد فورًا إذا لا توجد Data.

~~~text
Client
  ↓ request
Server waits...
Server waits...
New data arrives
  ↓ response
Client
~~~

ثم Client تفتح Request جديدة.

# 571. Polling vs Long-Polling

~~~text
Polling
Client asks repeatedly on timer

Long-Polling
Client asks once
Server keeps request open
Server responds when data arrives or timeout
Client asks again
~~~

Long-Polling ما زالت HTTP Request/Response، وليست WebSocket.

# 572. ما هي WebSocket؟

WebSocket Protocol تتيح Connection طويلة نسبيًا وثنائية الاتجاه بين Client وServer.

~~~text
Client ⇄ Server
      open connection
~~~

بعد نجاح الاتصال، الطرفان يستطيعان إرسال Messages دون فتح HTTP Request جديدة لكل Message.

# 573. HTTP vs WebSocket

HTTP:

~~~text
Request → Response
Request → Response
Request → Response
~~~

WebSocket:

~~~text
Connect once
Client ⇄ Server
Client ⇄ Server
Client ⇄ Server
~~~

هذا مناسب للتحديثات المتكررة منخفضة التأخير.

# 574. WebSocket تبدأ عادة بـ HTTP Handshake

WebSocket ليست HTTP نفسها، لكن الاتصال يبدأ غالبًا بHTTP Upgrade Handshake.

شكل مبسط:

~~~text
Client
  ↓ HTTP Upgrade request
Server
  ↓ 101 Switching Protocols
WebSocket connection
  ⇄
Messages
~~~

بعد Upgrade، الاتصال ينتقل لبروتوكول WebSocket.

# 575. ws وwss

~~~text
ws://
~~~

WebSocket بدون TLS.

~~~text
wss://
~~~

WebSocket فوق TLS.

مثل:

~~~text
http  → ws
https → wss
~~~

في Production عادة نستخدم wss.

# 576. ما هي Socket.IO؟

Socket.IO Library/Framework للاتصال Real-Time بين Client وServer.

مهم:

> Socket.IO ليست WebSocket Protocol نفسها.

هي توفر Abstraction فوق transport mechanisms، وغالبًا تستخدم WebSocket عندما يكون متاحًا، ويمكن أن تستخدم HTTP Long-Polling كFallback حسب الإعداد والبيئة.

# 577. WebSocket API vs Socket.IO

WebSocket native:

~~~js
const socket =
  new WebSocket(
    "ws://localhost:3000"
  );
~~~

Socket.IO client:

~~~js
const socket = io(
  "http://localhost:3000"
);
~~~

Socket.IO تضيف Features جاهزة مثل:

- Automatic reconnection.
- Event-based API.
- Rooms.
- Namespaces.
- Broadcasting.
- Acknowledgements.
- Fallback transport.

# 578. Socket.IO Client ليست Native WebSocket Client

لا تتوقع أن:

~~~js
new WebSocket(...)
~~~

يتصل مباشرة بـ Socket.IO Server بطريقة متوافقة دائمًا.

Socket.IO لديها Protocol خاص بها فوق transport.

Client وServer يجب أن يكونا Socket.IO compatible عندما تستخدم Socket.IO.

# 579. لماذا Socket.IO مناسبة للتعلم؟

بدل التعامل يدويًا مع Frames وReconnect وBroadcasting، تكتب:

~~~js
socket.on(
  "chat message",
  (message) => {
    console.log(message);
  }
);
~~~

وترسل:

~~~js
socket.emit(
  "chat message",
  "Hello"
);
~~~

# 580. Event-Driven Model

Socket.IO تعمل بأسلوب Events.

~~~text
emit event
   ↓
event name + data
   ↓
listener using on()
~~~

مثال:

~~~js
socket.emit(
  "message",
  {
    text: "Hello",
  }
);
~~~

والطرف الآخر:

~~~js
socket.on(
  "message",
  (data) => {
    console.log(data);
  }
);
~~~

# 581. socket.on ليست Request

ملاحظة مهمة على الورقة:

ليس دقيقًا أن نقول:

~~~text
socket.on = request
socket.emit = response
~~~

الأصح:

~~~text
on()
= listen for an event

emit()
= send/trigger an event
~~~

أي طرف يمكنه on أو emit.

# 582. on وemit على Client

Client يمكنها إرسال:

~~~js
socket.emit(
  "typing"
);
~~~

وتستقبل:

~~~js
socket.on(
  "user typing",
  () => {
    // update UI
  }
);
~~~

# 583. on وemit على Server

Server تستقبل:

~~~js
socket.on(
  "typing",
  () => {
    // received from this client
  }
);
~~~

وترسل:

~~~js
socket.emit(
  "welcome",
  "Connected"
);
~~~

إذن on وemit ليستا مرتبطتين باتجاه واحد.

# 584. إعداد Server صحيحة مع Express

عند Socket.IO نربطها بـ HTTP Server نفسها.

~~~js
const express =
  require("express");

const {
  createServer,
} = require("node:http");

const {
  Server,
} = require("socket.io");

const app = express();

const server =
  createServer(app);

const io =
  new Server(server);
~~~

ثم:

~~~js
server.listen(
  3000,
  () => {
    console.log(
      "Server running"
    );
  }
);
~~~

# 585. لماذا لا نستخدم app.listen فقط؟

Socket.IO تحتاج الوصول إلى HTTP Server instance التي ستتعامل مع Upgrade/Transport connections.

لذلك Pattern شائع:

~~~text
Express app
   ↓
createServer(app)
   ↓
HTTP server
   ↓
new Server(httpServer)
~~~

ثم تستخدم:

~~~js
server.listen(...)
~~~

# 586. Connection Event

~~~js
io.on(
  "connection",
  (socket) => {
    console.log(
      "connected:",
      socket.id
    );
  }
);
~~~

كل Client جديدة تحصل على Socket object خاص باتصالها.

# 587. socket.id

كل Connection لديها ID مميزة:

~~~js
console.log(
  socket.id
);
~~~

تستخدمها أحيانًا في:

- tracking.
- direct messaging.
- rooms.
- debugging.

لكن لا تعتبرها User ID دائمة؛ تتغير عند reconnect غالبًا.

# 588. أول Chat Event

Client:

~~~js
socket.emit(
  "chat message",
  "Hello"
);
~~~

Server:

~~~js
socket.on(
  "chat message",
  (msg) => {
    console.log(msg);
  }
);
~~~

# 589. io.emit()

~~~js
io.emit(
  "chat message",
  msg
);
~~~

ترسل Event لكل Clients المتصلة بالNamespace الحالية، وتشمل عادة الـ sender أيضًا.

Mental model:

~~~text
Client A
  ↓ message
Server
  ↓ io.emit
A + B + C
~~~

# 590. socket.emit()

~~~js
socket.emit(
  "welcome",
  "Hello"
);
~~~

ترسل للSocket الحالية فقط.

~~~text
Server
  ↓
Current Client only
~~~

# 591. socket.broadcast.emit()

~~~js
socket.broadcast.emit(
  "user typing"
);
~~~

ترسل لكل Clients الآخرين ما عدا الـ sender.

~~~text
Client A
  ↓ typing
Server
  ↓ broadcast
B + C
not A
~~~

هذه ممتازة لـ Typing Indicator.

# 592. الفرق بين الثلاثة

~~~text
socket.emit()
→ current socket only

socket.broadcast.emit()
→ everyone except current socket

io.emit()
→ everyone including current socket
~~~

# 593. Typing Indicator

Client A:

~~~js
input.addEventListener(
  "keydown",
  () => {
    socket.emit(
      "typing"
    );
  }
);
~~~

Server:

~~~js
socket.on(
  "typing",
  () => {
    socket.broadcast.emit(
      "typing"
    );
  }
);
~~~

Client B:

~~~js
socket.on(
  "typing",
  () => {
    typingText.textContent =
      "Someone is typing...";
  }
);
~~~

# 594. keydown وحدها قد ترسل Events كثيرة

كل ضغطة مفتاح قد ترسل Event.

لو المستخدم يكتب بسرعة:

~~~text
keydown
keydown
keydown
keydown
...
~~~

قد ترسل عشرات Events في الثانية.

الأفضل تطبيق Throttle/Debounce أو إرسال start/stop typing بذكاء.

# 595. Typing Start/Stop Pattern

Client:

~~~js
let typingTimer;

input.addEventListener(
  "input",
  () => {
    socket.emit(
      "typing:start"
    );

    clearTimeout(
      typingTimer
    );

    typingTimer =
      setTimeout(
        () => {
          socket.emit(
            "typing:stop"
          );
        },
        1000
      );
  }
);
~~~

# 596. Server Typing Events

~~~js
socket.on(
  "typing:start",
  () => {
    socket.broadcast.emit(
      "typing:start"
    );
  }
);

socket.on(
  "typing:stop",
  () => {
    socket.broadcast.emit(
      "typing:stop"
    );
  }
);
~~~

# 597. Client يستقبل Typing

~~~js
socket.on(
  "typing:start",
  () => {
    typingText.textContent =
      "Someone is typing...";
  }
);

socket.on(
  "typing:stop",
  () => {
    typingText.textContent =
      "";
  }
);
~~~

# 598. io() بدون URL

لو Client page تُخدم من نفس Origin:

~~~js
const socket = io();
~~~

Socket.IO Client تحاول الاتصال بنفس Host/Origin المناسبة التي جاءت منها الصفحة.

# 599. io("domain") لاتصال مختلف

لو Frontend منفصلة عن Backend:

~~~js
const socket = io(
  "http://localhost:3000"
);
~~~

أو Production:

~~~js
const socket = io(
  "https://api.example.com"
);
~~~

# 600. Same Origin vs Different Origin

Same Origin:

~~~text
Frontend:
http://localhost:3000

Socket server:
http://localhost:3000
~~~

غالبًا:

~~~js
io()
~~~

تكفي.

Different Origin:

~~~text
Frontend:
http://localhost:5500

Socket server:
http://localhost:3000
~~~

تحتاج URL وتضبط CORS على Socket.IO Server.

# 601. Socket.IO CORS

~~~js
const io =
  new Server(
    server,
    {
      cors: {
        origin:
          "http://localhost:5500",
        methods: [
          "GET",
          "POST",
        ],
      },
    }
  );
~~~

مهم:

> \`app.use(cors())\` الخاصة بـ Express ليست بديلًا عن إعداد CORS داخل Socket.IO نفسها لاتصالات Socket.IO.

# 602. لماذا localhost و127.0.0.1 قد تسببان اختلاف Origin؟

هذه:

~~~text
http://localhost:5500
~~~

ليست نفس Origin حرفيًا مثل:

~~~text
http://127.0.0.1:5500
~~~

حتى لو تشير لنفس الجهاز.

Origin تقارن:

~~~text
scheme + host + port
~~~

لهذا يجب أن تكون قيمة CORS مطابقة للOrigin الفعلية للFrontend.

# 603. Serving HTML من Express

~~~js
const path =
  require("node:path");

app.get(
  "/",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "index.html"
      )
    );
  }
);
~~~

ثم Client وSocket Server قد تكونا على نفس Origin.

# 604. Socket.IO Client Script

لو تستخدم Server-provided client bundle:

~~~html
<script src="/socket.io/socket.io.js"></script>
~~~

ثم:

~~~html
<script>
  const socket = io();
</script>
~~~

في Bundler/Frontend Framework عادة تثبت \`socket.io-client\`.

# 605. socket.io-client

~~~bash
npm install socket.io-client
~~~

ثم:

~~~js
import {
  io,
} from "socket.io-client";

const socket =
  io(
    "http://localhost:3000"
  );
~~~

# 606. Disconnect Event

~~~js
socket.on(
  "disconnect",
  (reason) => {
    console.log(
      "Disconnected:",
      reason
    );
  }
);
~~~

Server يمكن أيضًا سماع Disconnect:

~~~js
socket.on(
  "disconnect",
  () => {
    console.log(
      "user disconnected"
    );
  }
);
~~~

# 607. Reconnection

Socket.IO Client تدعم Reconnection تلقائيًا في حالات كثيرة.

لكن لا تفترض أن كل Message أرسلت أثناء الانقطاع وصلت.

Real-Time systems تحتاج التفكير في:

- reconnect.
- missed events.
- retries.
- ordering.
- idempotency.

# 608. Socket.IO لا تجعل Data Persistent

لو أرسلت Chat Message عبر:

~~~js
io.emit(
  "chat message",
  msg
);
~~~

ثم Restart للServer، Message ليست محفوظة تلقائيًا.

Real-Time Transport ≠ Database.

لو تريد Chat history:

~~~text
Receive message
  ↓
Validate
  ↓
Save to DB
  ↓
Emit to clients
~~~

# 609. Validate Socket Events

لا تثق في Data القادمة من Socket.

~~~js
socket.on(
  "chat message",
  async (payload) => {
    // validate payload
  }
);
~~~

مثل HTTP تمامًا تحتاج:

- validation.
- authorization.
- rate limiting عند الحاجة.
- size limits.
- sanitization حسب الاستخدام.

# 610. Authentication مع Socket.IO

يمكن إرسال Token أثناء Handshake.

Client:

~~~js
const socket = io(
  "http://localhost:3000",
  {
    auth: {
      token:
        accessToken,
    },
  }
);
~~~

Server:

~~~js
io.use(
  (socket, next) => {
    const token =
      socket.handshake.auth
        .token;

    // verify token

    next();
  }
);
~~~

# 611. socket.handshake

عند الاتصال، Socket.IO توفر معلومات Handshake مثل:

- auth.
- headers.
- query.
- address.

لكن لا تثق في Data القادمة من Client بدون Verification.

# 612. Rooms

Room مجموعة Sockets منطقية.

~~~js
socket.join(
  "room-123"
);
~~~

ثم:

~~~js
io.to(
  "room-123"
).emit(
  "message",
  msg
);
~~~

تستخدم في:

- Chat rooms.
- Project collaboration.
- Order tracking.
- Per-user notification channels.

# 613. Room ليست Namespace

Room تقسيم داخلي للSockets داخل Namespace.

Namespace نفسها Channel منطقية أعلى.

مثال Namespace:

~~~js
const adminIo =
  io.of("/admin");
~~~

ثم Client:

~~~js
io(
  "/admin"
);
~~~

# 614. Direct Message باستخدام Socket ID

ممكن:

~~~js
io.to(
  targetSocketId
).emit(
  "private message",
  message
);
~~~

لأن كل Socket تنضم تلقائيًا Room باسم socket.id.

لكن في Production الأفضل Mapping بين User ID والConnections بعناية، خصوصًا إذا User لديها أكثر من Tab أو Device.

# 615. EventEmitter في Node

Socket.IO Event API تشبه جدًا EventEmitter mental model.

Node:

~~~js
const {
  EventEmitter,
} = require(
  "node:events"
);

const emitter =
  new EventEmitter();

emitter.on(
  "message",
  (data) => {
    console.log(data);
  }
);

emitter.emit(
  "message",
  "Hello"
);
~~~

# 616. EventEmitter ليست Network

مهم جدًا:

~~~text
EventEmitter
= events داخل نفس Node.js process

Socket.IO
= events بين networked clients/server
~~~

التشابه في API، لكن المشكلة مختلفة.

# 617. on() قد يكون له أكثر من Listener

~~~js
emitter.on(
  "message",
  handlerOne
);

emitter.on(
  "message",
  handlerTwo
);
~~~

عند emit، كلاهما يعملان حسب ترتيب التسجيل عادة.

نفس Event-driven concept يظهر في أجزاء كثيرة من Node.

# 618. once()

~~~js
socket.once(
  "welcome",
  (data) => {
    console.log(data);
  }
);
~~~

Listener تعمل مرة واحدة ثم تزال.

EventEmitter لديها \`once()\` أيضًا.

# 619. Acknowledgements في Socket.IO

يمكن أن ترسل Event وتنتظر callback acknowledgement.

Client:

~~~js
socket.emit(
  "create message",
  {
    text: "Hello",
  },
  (response) => {
    console.log(
      response
    );
  }
);
~~~

Server:

~~~js
socket.on(
  "create message",
  (
    payload,
    callback
  ) => {
    callback({
      ok: true,
    });
  }
);
~~~

هذا ليس HTTP Response، بل Socket.IO acknowledgement pattern.

# 620. Chat Server كامل مبسط

~~~js
const express =
  require("express");

const {
  createServer,
} = require("node:http");

const {
  Server,
} = require("socket.io");

const app =
  express();

const server =
  createServer(app);

const io =
  new Server(
    server,
    {
      cors: {
        origin:
          "http://127.0.0.1:5500",
      },
    }
  );

io.on(
  "connection",
  (socket) => {
    console.log(
      "connected:",
      socket.id
    );

    socket.on(
      "chat message",
      (msg) => {
        io.emit(
          "chat message",
          msg
        );
      }
    );

    socket.on(
      "typing:start",
      () => {
        socket
          .broadcast
          .emit(
            "typing:start"
          );
      }
    );

    socket.on(
      "typing:stop",
      () => {
        socket
          .broadcast
          .emit(
            "typing:stop"
          );
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "disconnected"
        );
      }
    );
  }
);

server.listen(
  3000,
  () => {
    console.log(
      "Server on 3000"
    );
  }
);
~~~

# 621. Client كامل مبسط

~~~js
const socket = io(
  "http://localhost:3000"
);

const form =
  document.querySelector(
    "#form"
  );

const input =
  document.querySelector(
    "#input"
  );

form.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    if (!input.value) {
      return;
    }

    socket.emit(
      "chat message",
      input.value
    );

    input.value = "";
  }
);

socket.on(
  "chat message",
  (message) => {
    console.log(
      message
    );
  }
);
~~~

# 622. متى أستخدم REST ومتى Socket.IO؟

لا تحول كل API إلى Socket.IO.

REST ممتازة لـ:

- CRUD.
- Fetching initial data.
- Authentication endpoints.
- Resource operations.

Socket.IO ممتازة لـ:

- Live updates.
- Chat.
- Notifications.
- Presence.
- Typing.
- Collaborative events.

غالبًا التطبيق الحقيقي يستخدم الاثنين معًا.

# 623. Architecture واقعية

~~~text
Browser
  ├── REST
  │    ├── login
  │    ├── get messages history
  │    └── update profile
  │
  └── Socket.IO
       ├── new message
       ├── typing
       ├── presence
       └── live notifications
~~~

# 624. Scaling Socket.IO

لو لديك Server واحدة، Broadcast سهلة.

لو لديك عدة Instances:

~~~text
Load Balancer
  ↓
Server A
Server B
Server C
~~~

Clients قد تكون موزعة.

تحتاج Adapter/Shared PubSub مثل Redis Adapter أو تقنية مشابهة لتمرير Events بين Instances.

# 625. Sticky Sessions

عند استخدام بعض Transports/Architectures خلف Load Balancer، قد تحتاج Sticky Sessions حسب Transport/configuration.

لا تحفظها كقاعدة مطلقة لكل setup، لكنها نقطة مهمة في Deployment متعدد السيرفرات.

# 626. Security Checklist

في Socket.IO Production:

- Authenticate connections.
- Authorize events/rooms.
- Validate payloads.
- Limit payload sizes.
- Rate-limit abusive events.
- Configure CORS بعناية.
- استخدم TLS.
- لا تثق في socket.id كهوية User دائمة.
- لا ترسل Secrets في Events.
- نظف Listeners/Resources عند disconnect.

# 627. Mental Model النهائي

~~~text
HTTP
Request → Response

Polling
Request every N seconds

Long-Polling
Request waits until data/timeout

WebSocket
Persistent bidirectional connection

Socket.IO
Event-based realtime abstraction
WebSocket when possible
Fallback transport when needed

on()
Listen

emit()
Send event

socket.emit()
Current client

socket.broadcast.emit()
Everyone except sender

io.emit()
Everyone

Rooms
Target logical groups
~~~

## أهم التصحيحات

1. Socket.IO ليست WebSocket نفسها.
2. Socket.IO قد تستخدم WebSocket أو Long-Polling حسب الظروف/config.
3. \`socket.on()\` ليست Request، و\`socket.emit()\` ليست Response.
4. الطرفان Client وServer يستطيعان \`on\` و\`emit\`.
5. \`socket.emit\` للSocket الحالية، و\`broadcast.emit\` للآخرين، و\`io.emit\` للجميع.
6. Polling مختلفة عن Long-Polling.
7. WebSocket تبدأ عادة بـ HTTP Upgrade Handshake ثم تصبح Protocol مستقلة.
8. \`socket.id\` ليست User ID دائمة.
9. Real-Time Transport لا يحفظ البيانات تلقائيًا.
10. EventEmitter ليست Network Communication.
11. Same Host لا تعني Same Origin إذا اختلف Scheme أو Port أو Host name مثل localhost مقابل 127.0.0.1.
12. \`app.use(cors())\` وحدها ليست دائمًا كافية لإعداد Socket.IO CORS.
13. Typing Indicator لا يفضل إرسال Event بلا تحكم مع كل keydown.
14. Rooms ليست Namespaces.
15. Socket.IO لا تلغي الحاجة لـ REST؛ غالبًا تستخدم الاثنين.

## تمارين عملية

1. أنشئ HTTP polling بسيطة كل ثانيتين.
2. اشرح لماذا polling تستهلك Requests زائدة.
3. ارسم Long-Polling flow.
4. ثبت socket.io.
5. اربط Socket.IO بـ createServer(app).
6. أنشئ connection listener.
7. اطبع socket.id.
8. أرسل event من Client إلى Server.
9. أرسل event من Server إلى Client.
10. جرّب socket.emit.
11. جرّب io.emit.
12. جرّب socket.broadcast.emit.
13. ابنِ Chat بسيطة.
14. أضف Typing Indicator.
15. أضف typing:start وtyping:stop.
16. أضف debounce/timeout للTyping.
17. شغل Frontend على 127.0.0.1:5500 وBackend على localhost:3000 واضبط CORS.
18. جرّب io() عندما تكون الصفحة على نفس Origin.
19. جرّب io("http://localhost:3000") من Origin مختلفة.
20. أضف disconnect listener.
21. خزّن Messages في MongoDB قبل emit.
22. أضف JWT في handshake auth.
23. ارفض Socket بدون Token صحيحة.
24. أنشئ Room باسم course-123.
25. أرسل Event للRoom فقط.
26. جرّب EventEmitter داخل Node وقارنها مع Socket.IO.
27. أضف acknowledgement لحدث create message.
28. ارسم Architecture تستخدم REST + Socket.IO معًا.
29. اشرح ماذا تحتاج عند Scale لأكثر من Server.
30. اكتب Security Checklist للEvents.

## أسئلة مراجعة

1. ما معنى Real-Time Application؟
2. كيف يعمل HTTP Request/Response؟
3. ما هي Polling؟
4. ما عيوب Polling؟
5. ما هي Long-Polling؟
6. ما الفرق بين Polling وLong-Polling؟
7. ما هي WebSocket؟
8. ما الفرق بين HTTP وWebSocket؟
9. ما هو HTTP Upgrade Handshake؟
10. ما الفرق بين ws وwss؟
11. ما هي Socket.IO؟
12. هل Socket.IO هي WebSocket Protocol نفسها؟
13. ماذا تضيف Socket.IO فوق WebSocket الخام؟
14. لماذا Native WebSocket Client ليست دائمًا متوافقة مباشرة مع Socket.IO Server؟
15. ما معنى Event-driven؟
16. ماذا تفعل socket.on؟
17. ماذا تفعل socket.emit؟
18. لماذا on ليست Request وemit ليست Response؟
19. لماذا نستخدم createServer(app) مع Socket.IO؟
20. ما هو connection event؟
21. ما هي socket.id؟
22. هل socket.id User ID دائمة؟
23. ماذا تفعل io.emit؟
24. ماذا تفعل socket.emit؟
25. ماذا تفعل socket.broadcast.emit؟
26. أي واحدة تستخدم غالبًا لTyping Indicator للآخرين؟
27. لماذا keydown لكل حرف قد تكون مزعجة؟
28. كيف تنفذ typing:start وtyping:stop؟
29. ماذا يعني io() بدون URL؟
30. متى تستخدم io("http://...")؟
31. لماذا localhost و127.0.0.1 قد تعتبران Origin مختلفة؟
32. كيف تضبط CORS في Socket.IO؟
33. ماذا يفعل /socket.io/socket.io.js؟
34. ما هي socket.io-client؟
35. ما فائدة disconnect event؟
36. هل Reconnection تضمن عدم فقد أي Event؟
37. هل Socket.IO تحفظ Chat History؟
38. لماذا نعمل Validation للSocket payloads؟
39. كيف ترسل JWT أثناء Handshake؟
40. ما هي socket.handshake؟
41. ما هي Rooms؟
42. ما الفرق بين Room وNamespace؟
43. كيف ترسل Direct Message باستخدام socket ID؟
44. ما هي EventEmitter؟
45. لماذا EventEmitter ليست Network؟
46. ماذا تفعل once؟
47. ما هي Acknowledgements؟
48. متى تستخدم REST بدل Socket.IO؟
49. لماذا التطبيق الحقيقي قد يستخدم REST وSocket.IO معًا؟
50. ماذا تحتاج عند Scaling إلى عدة Socket.IO servers؟
`,
};
