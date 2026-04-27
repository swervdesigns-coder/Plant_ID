export default async function handler(req, res) {
  const API_KEY = process.env.OPENAI_API_KEY;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY"
    });
  }

  try {
    const { imageBase64, sunlight, soil, symptoms, notes } = req.body;

    if (!imageBase64 || !imageBase64.startsWith("data:image")) {
      return res.status(400).json({
        error: "Invalid image format. Must be base64 data URL."
      });
    }

    const prompt = `
You are a plant expert.

Analyze this plant image and provide:

1. Plant identification (common + scientific name)
2. Confidence level
3. Health status (score 0–100)
4. What is wrong with the plant (if anything)
5. What the plant needs (sunlight, water, soil, care)
6. Specific action steps

User conditions:
Sunlight: ${sunlight}
Soil: ${soil}
Symptoms: ${symptoms}
Notes: ${notes}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              {
                type: "input_image",
                image_url: imageBase64   // ✅ THIS is the fix
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: data
      });
    }

    const report =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "No report returned.";

    return res.status(200).json({ report });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
