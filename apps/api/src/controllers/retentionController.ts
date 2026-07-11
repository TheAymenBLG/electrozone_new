import type { Request, Response } from "express";
import { sendRetentionEmail } from "../services/emailService.js";

export async function triggerRetentionController(req: Request, res: Response) {
  const { type, orderId, toEmail } = req.body;
  const result = await sendRetentionEmail(type, orderId, toEmail);
  if (result.ok) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}