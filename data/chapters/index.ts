import { authenticationSecurityChapter } from "./authentication-security";
import { eventLoopChapter } from "./event-loop";
import { expressMiddlewareChapter } from "./express-middleware";
import { filesBuffersChapter } from "./files-buffers";
import { foundationsChapter } from "./foundations";
import { httpFundamentalsChapter } from "./http-fundamentals";
import { labsReferenceChapter } from "./labs-reference";
import { libuvThreadpoolChapter } from "./libuv-threadpool";
import { microtasksChapter } from "./microtasks";
import { modulesChapter } from "./modules";
import { mongodbMongooseChapter } from "./mongodb-mongoose";
import { productionApiPatternsChapter } from "./production-api-patterns";
import { restApiCrudValidationChapter } from "./rest-api-crud-validation";
import { rolesUploadsPostmanChapter } from "./roles-uploads-postman";
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
  restApiCrudValidationChapter,
  mongodbMongooseChapter,
  productionApiPatternsChapter,
  authenticationSecurityChapter,
  rolesUploadsPostmanChapter,
];

export const totalReadingMinutes = 1070;
