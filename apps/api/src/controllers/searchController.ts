import type { Request, Response } from "express";
import { getCatalog } from "../services/catalogService.js";
import { semanticSearch } from "../services/searchService.js";

export async function searchController(req: Request, res: Response) {
  const q = (req.query.q as string) ?? "";
  const catalog = await getCatalog();
  const results = await semanticSearch(q, catalog);
  res.json({ query: q, results });
}