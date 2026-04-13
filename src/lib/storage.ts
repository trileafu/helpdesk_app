import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadFile(file: File): Promise<string | null> {
	if (!file || file.size === 0) return null;

	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);

	const uploadDir = path.join(process.cwd(), "public", "uploads");
	try {
		await mkdir(uploadDir, { recursive: true });
	} catch (e) {
		console.error("Upload error: ", e);
	}

	const fileExtension = path.extname(file.name);
	const fileName = `${uuidv4()}${fileExtension}`;
	const filePath = path.join(uploadDir, fileName);

	await writeFile(filePath, buffer);

	return `/uploads/${fileName}`;
}
