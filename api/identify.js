export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const API_KEY = process.env.PERENUAL_API_KEY;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: "Missing PERENUAL_API_KEY in Vercel environment variables."
    });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const bodyBuffer = Buffer.concat(chunks);

    const response = await fetch(`https://perenual.com/api/identify?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"],
        "Content-Length": bodyBuffer.length.toString()
      },
      body: bodyBuffer
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch (parseError) {
      return res.status(500).json({
        error: "Perenual did not return JSON",
        status: response.status,
        raw: text.slice(0, 1000)
      });
    }

  } catch (error) {
    return res.status(500).json({
      error: "API request failed",
      details: error.message
    });
  }
}
