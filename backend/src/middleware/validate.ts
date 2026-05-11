import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Validation] ${req.method} ${req.originalUrl}`);
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      return res.status(400).json({
        error: "Validation error",
        details: result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    req.validated = result.data as any;
    return next();
  };
}
