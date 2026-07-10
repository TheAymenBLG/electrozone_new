import { Router } from "express";
import { searchController } from "../controllers/searchController.js";
import { validateQuery } from "../middleware/validate.js";
import { searchQuerySchema } from "@electrozone/shared";

export const searchRouter = Router();

searchRouter.get("/", validateQuery(searchQuerySchema), searchController);