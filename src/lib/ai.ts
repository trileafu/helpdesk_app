import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./db";

export async function analyzeTicket(ticketId: number, description: string) {
	// Kalau sudah ada, lewatkan
	const existing = await prisma.aISuggestion.findUnique({
		where: { ticket_id: ticketId },
	});
	if (existing) return existing;

	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) return;

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

		const prompt = `Analyze this helpdesk ticket description. Return ONLY a valid JSON object with no markdown formatting.
            Fields required:
            - summary: A concise 1 sentence summary of the issue.
            - category: One of [Hardware, Software, Network, Account, Other].
            - priority: One of [Low, Medium, High].
            
            Description: "${description}"`;

		const result = await model.generateContent(prompt);
		let text = result.response.text();
		text = text
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const data = JSON.parse(text);

		return await prisma.aISuggestion.create({
			data: {
				ticket_id: ticketId,
				ai_summary: data.summary,
				ai_suggested_category: data.category,
				ai_suggested_priority: data.priority,
			},
		});
	} catch (e) {
		console.error("AI Error", e);
		return null;
	}
}
