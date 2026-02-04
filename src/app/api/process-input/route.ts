import { NextRequest, NextResponse } from "next/server";
import { geminiModel, visionModel } from "@/lib/gemini";
import { Part } from "@google/generative-ai";

// We'll use a simple PDF text extractor if possible, or just assume the user sends images for now.
// For PDF, we might need to use a library like 'pdf-parse' which works in Node.
// Since we can't install it yet, I will stub the PDF part or use a basic logic.

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        let prompt = `
      You are an expert English teacher. 
      Analyze the provided content. Extract the most important English vocabulary words that a learner should study.
      Exclude very common basic words (like "the", "and", "is", etc.).
      
      For each word, provide:
      1. The word (original text)
      2. Main definition (in English, simple)
      3. 2-3 Example sentences using the word.
      
      Return the result as a strictly valid JSON array of objects with keys: 
      "originalText", "meanings" (array of strings), "examples" (array of strings).
      Do not wrap in markdown code blocks. Just the JSON.
    `;

        let parts: Part[] = [];

        if (file.type.startsWith("image/")) {
            const bytes = await file.arrayBuffer();
            const base64Data = Buffer.from(bytes).toString("base64");

            parts = [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data,
                    },
                },
            ];

            const result = await visionModel.generateContent({
                contents: [{ role: "user", parts }],
            });

            const responseText = result.response.text();
            // Clean up markdown if present
            const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            const data = JSON.parse(jsonStr);

            return NextResponse.json({ words: data });

        } else if (file.type === "application/pdf") {
            // PDF Handling
            // For now, simpler to reject or mock until we have pdf-parse
            // But I'll try to implement the file upload to Gemini File API if I had the package

            // ALTERNATIVE: Use Gemini Vision with PDF pages converted to images? Hard.
            // Text extraction is best.

            return NextResponse.json({ error: "PDF support coming next step (requires pdf-parse)" }, { status: 501 });
        }

        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

    } catch (error) {
        console.error("Error processing input:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
