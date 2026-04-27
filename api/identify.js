export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  const API_KEY = process.env.OPENAI_API_KEY;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY in Vercel environment variables.",
    });
  }

  try {
    const { imageBase64, sunlight, soil, symptoms, notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided." });
    }

    const prompt = `
You are a plant identification and plant health assistant.

Analyze the uploaded plant photo and the user-provided conditions.

Return a detailed, practical report with these sections:

1. Plant Identification
- Common name
- Scientific name if possible
- Confidence level
- Similar possibilities if uncertain

2. Health Status
- Overall health score from 0-100
- Health status: Healthy, Stressed, High Concern, Critical, or Likely Dead
- What appears to be going on with the plant

3. What the Plant Needs
- Sunlight
- Watering
- Soil/drainage
- Mulch
- Fertilizer
- Pruning
- Pest/disease concerns

4. Placement Advice
- Whether the selected yard condition sounds appropriate
- What to change if placement is poor

5. Next Steps
- Clear action list

User conditions:
Sunlight: ${sunlight || "Not provided"}
Soil/drainage: ${soil || "Not provided"}
Visible symptoms: ${symptoms || "Not provided"}
Extra notes: ${notes || "Not provided"}

Be honest if identification is uncertain.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
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
                image_url: imageBase64,
                detail: "high",
              },
            ],
          },
        ],
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({
        error: "OpenAI API error",
        details: data,
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
      details: error.message,
    });
  }
}
