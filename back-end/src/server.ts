import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import logger from "jet-logger";
import morgan from "morgan";

import BaseRouter from "@src/routes";

import { NodeEnvs } from "@src/common/constants";
import ENV from "@src/common/constants/ENV";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import Paths from "@src/common/constants/Paths";
import { RouteError } from "@src/common/util/route-errors";
import { connectDB } from "config/mongodb";
import { sendError } from "./common/util/response";
import { setupSwagger } from "./swagger/swaggerConfig";
import { startDeleteOldPendingHousingAreasJob } from "./jobs/HousingAreaCron";
import { notifyExpiringContracts, setExpiredContracts } from "./jobs/ContractCron";
import { checkExpiredBoostingAds } from "./jobs/BoostingAdsCron";
/******************************************************************************
                                Setup
******************************************************************************/
const FRONTEND_URL = process.env.FRONTEND_URL;
const DISABLE_HELMET = process.env.DISABLE_HELMET;

const app = express();
// Connect mongoose to the database
connectDB();

//Cron jobs
startDeleteOldPendingHousingAreasJob();
setExpiredContracts();
notifyExpiringContracts();
checkExpiredBoostingAds();

// Add CORS for NextJS frontend
const allowedOrigins = [
  "http://localhost:3000", // Development
  "https://holarental.website", // Production domain
  "https://www.holarental.website", // Production www
  "https://thue-deploy.vercel.app", // Vercel default domain
];

// Add FRONTEND_URL from env if it exists and not already in list
if (FRONTEND_URL && !allowedOrigins.includes(FRONTEND_URL)) {
  allowedOrigins.push(FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan("dev"));
  setupSwagger(app);
}
// Security
if (ENV.NodeEnv === NodeEnvs.Production) {
  if (!DISABLE_HELMET) {
    app.use(helmet());
  }
  
}
// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);
// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    // Only pass err.errors if it exists, otherwise pass undefined
    sendError(res, err.message, status, (err as any).errors);
  }

  return next(err);
});

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
