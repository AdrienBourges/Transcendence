import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			return res.status(400).json({
				message: "Validation error",
				errors: result.error.flatten(),
			});
		}

		req.body = result.data;
		next();
	};
}
