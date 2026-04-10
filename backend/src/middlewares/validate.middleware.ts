import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import type { ZodTypeAny } from "zod";

type ValidateSource = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, source: ValidateSource = "body") {
	return (req: Request, res: Response, next: NextFunction) => {
		const data =
			source === "body"
				? req.body
				: source === "query"
				? req.query
				: req.params;

		const result = schema.safeParse(data);

		if (!result.success) {
			return res.status(400).json({
				message: "Validation error",
				errors: result.error.flatten(),
			});
		}

		if (source === "body") {
			req.body = result.data;
		}

		next();
	};
}
