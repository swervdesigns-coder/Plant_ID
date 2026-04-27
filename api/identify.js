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
    const response = await fetch(`https://perenual.com/api/identify?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "content-type": req.headers["content-type"],
      },
      body: req,
      duplex: "half",
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "API request failed",
      details: error.message,
    });
  }
}
