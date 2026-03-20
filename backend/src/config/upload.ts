import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads/avatars");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadDir);
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const extension = path.extname(file.originalname).toLowerCase();
		cb(null, `${uniqueSuffix}${extension}`);
	},
});

function fileFilter(
	_req: Express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) {
	if (!file.mimetype.startsWith("image/")) {
		cb(new Error("Only image files are allowed"));
		return;
	}

	cb(null, true);
}

export const uploadAvatar = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});
