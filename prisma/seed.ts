import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const password = await bcrypt.hash("admin123", 10);

	const admin = await prisma.user.upsert({
		where: { email: "superadmin@bonet.co.id" },
		update: {},
		create: {
			email: "superadmin@bonet.co.id",
			name: "Super Admin",
			password: password,
			role: "superadmin",
		},
	});

	console.log({ admin });

	const categories = ["Hardware", "Software", "Network", "General"];
	for (const cat of categories) {
		const exists = await prisma.category.findFirst({
			where: { category_name: cat },
		});
		if (!exists) {
			await prisma.category.create({
				data: { category_name: cat },
			});
		}
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
