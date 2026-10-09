"use client";

import {
  Activity,
  ArrowLeftRight,
  Boxes,
  Braces,
  Cable,
  CheckCircle2,
  CircleDot,
  Database,
  FileCode2,
  FileUp,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  Package,
  Radio,
  Server,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";

type VisualKind =
  | "runtime"
  | "modules"
  | "files"
  | "streams"
  | "eventloop"
  | "http"
  | "express"
  | "database"
  | "auth"
  | "upload"
  | "socket"
  | "architecture";

function pickVisual(chapterId: string, heading: string): VisualKind {
  const value = (chapterId + " " + heading).toLowerCase();

  if (/socket|websocket|real-time|polling|typing|room|namespace|eventemitter/.test(value)) return "socket";
  if (/upload|multer|file|multipart|diskstorage|memorystorage/.test(value)) return "upload";
  if (/jwt|auth|password|bcrypt|role|permission|login|register|token|hash|salt/.test(value)) return "auth";
  if (/mongo|mongoose|database|schema|model|collection|sequelize|orm|odm/.test(value)) return "database";
  if (/express|middleware|router|route|controller|validation|cors|error handler/.test(value)) return "express";
  if (/http|request|response|header|status|api|crud|rest/.test(value)) return "http";
  if (/event loop|microtask|nexttick|timer|libuv|thread|worker|performance|latency|throughput/.test(value)) return "eventloop";
  if (/stream|buffer|chunk|backpressure/.test(value)) return "streams";
  if (/file system|fs\.|readfile|writefile|json|utf-8/.test(value)) return "files";
  if (/module|commonjs|esm|require|npm|package/.test(value)) return "modules";
  if (/node|v8|runtime|javascript|repl/.test(value)) return "runtime";
  return "architecture";
}

const visualData: Record<VisualKind, {
  label: string;
  left: string;
  middle: string;
  right: string;
  LeftIcon: typeof Server;
  MiddleIcon: typeof Server;
  RightIcon: typeof Server;
}> = {
  runtime: {
    label: "Runtime flow",
    left: "JavaScript",
    middle: "Node.js + V8",
    right: "OS / APIs",
    LeftIcon: Braces,
    MiddleIcon: Zap,
    RightIcon: Server,
  },
  modules: {
    label: "Module flow",
    left: "Your file",
    middle: "Module system",
    right: "Exports / Package",
    LeftIcon: FileCode2,
    MiddleIcon: Boxes,
    RightIcon: Package,
  },
  files: {
    label: "Data flow",
    left: "Application",
    middle: "File System",
    right: "Bytes / JSON",
    LeftIcon: FileCode2,
    MiddleIcon: Layers3,
    RightIcon: Braces,
  },
  streams: {
    label: "Streaming flow",
    left: "Producer",
    middle: "Chunks",
    right: "Consumer",
    LeftIcon: Database,
    MiddleIcon: Activity,
    RightIcon: Server,
  },
  eventloop: {
    label: "Scheduling flow",
    left: "Call Stack",
    middle: "Event Loop",
    right: "Callbacks",
    LeftIcon: Braces,
    MiddleIcon: Gauge,
    RightIcon: CircleDot,
  },
  http: {
    label: "HTTP flow",
    left: "Client",
    middle: "Request / Response",
    right: "Server",
    LeftIcon: Globe2,
    MiddleIcon: ArrowLeftRight,
    RightIcon: Server,
  },
  express: {
    label: "Express pipeline",
    left: "Request",
    middle: "Middleware",
    right: "Controller",
    LeftIcon: Globe2,
    MiddleIcon: Workflow,
    RightIcon: Braces,
  },
  database: {
    label: "Database flow",
    left: "Schema / Query",
    middle: "Model / Driver",
    right: "Database",
    LeftIcon: Braces,
    MiddleIcon: Layers3,
    RightIcon: Database,
  },
  auth: {
    label: "Security flow",
    left: "Credentials",
    middle: "Verify / Authorize",
    right: "Protected Route",
    LeftIcon: KeyRound,
    MiddleIcon: ShieldCheck,
    RightIcon: LockKeyhole,
  },
  upload: {
    label: "Upload flow",
    left: "Form Data",
    middle: "Multer / Validation",
    right: "Storage",
    LeftIcon: FileUp,
    MiddleIcon: ShieldCheck,
    RightIcon: Database,
  },
  socket: {
    label: "Real-time flow",
    left: "Client A",
    middle: "Socket.IO",
    right: "Client B",
    LeftIcon: Cable,
    MiddleIcon: Radio,
    RightIcon: Network,
  },
  architecture: {
    label: "Backend architecture",
    left: "Input",
    middle: "Application",
    right: "Output",
    LeftIcon: Globe2,
    MiddleIcon: Workflow,
    RightIcon: CheckCircle2,
  },
};

export function LessonVisual({
  chapterId,
  heading,
  hero = false,
}: {
  chapterId: string;
  heading: string;
  hero?: boolean;
}) {
  const kind = pickVisual(chapterId, heading);
  const item = visualData[kind];
  const { LeftIcon, MiddleIcon, RightIcon } = item;

  return (
    <div className={hero ? "conceptVisual conceptVisualHero" : "conceptVisual"} aria-label={"رسم توضيحي: " + item.label}>
      <div className="conceptVisualLabel">{item.label}</div>
      <div className="conceptFlow">
        <div className="conceptNode">
          <span className="conceptIcon"><LeftIcon size={21} /></span>
          <strong>{item.left}</strong>
        </div>

        <div className="conceptConnector" aria-hidden="true">
          <span className="flowDot" />
          <span className="flowLine" />
          <span className="flowArrow">←</span>
        </div>

        <div className="conceptNode conceptNodeMain">
          <span className="conceptIcon"><MiddleIcon size={23} /></span>
          <strong>{item.middle}</strong>
          <span className="pulseRing" />
        </div>

        <div className="conceptConnector" aria-hidden="true">
          <span className="flowDot flowDotDelay" />
          <span className="flowLine" />
          <span className="flowArrow">←</span>
        </div>

        <div className="conceptNode">
          <span className="conceptIcon"><RightIcon size={21} /></span>
          <strong>{item.right}</strong>
        </div>
      </div>

      <div className="conceptCaption">
        <span>{heading}</span>
        <span className="liveBadge"><Zap size={13} /> Animated concept</span>
      </div>
    </div>
  );
}
