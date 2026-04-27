export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const API_KEY = process.env.PERENUAL_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: "Missing API Key"
    });
  }

  try {
    const formData = new FormData();

    // Pipe the incoming file directly
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    formData.append("file[]", buffer, {
      filename: "plant.jpg",
      contentType: req.headers["content-type"],
    });

    const response = await fetch(
      `https://perenual.com/api/identify?key=${API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const text = await response.text();

    // Try parsing JSON safely
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(500).json({
        error: "Invalid API response",
        raw: text
      });
    }

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
