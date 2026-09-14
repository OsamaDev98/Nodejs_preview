import { eventLoopChapter } from "./event-loop";
import { expressMiddlewareChapter } from "./express-middleware";
import { filesBuffersChapter } from "./files-buffers";
import { foundationsChapter } from "./foundations";
import { httpFundamentalsChapter } from "./http-fundamentals";
import { labsReferenceChapter } from "./labs-reference";
import { libuvThreadpoolChapter } from "./libuv-threadpool";
import { microtasksChapter } from "./microtasks";
import { modulesChapter } from "./modules";
import { streamsNpmChapter } from "./streams-npm";
import { workersPerformanceChapter } from "./workers-performance";

export const chapters = [
  foundationsChapter,
  modulesChapter,
  filesBuffersChapter,
  streamsNpmChapter,
  libuvThreadpoolChapter,
  eventLoopChapter,
  microtasksChapter,
  workersPerformanceChapter,
  labsReferenceChapter,
  httpFundamentalsChapter,
  expressMiddlewareChapter,
];

export const totalReadingMinutes = 565;
