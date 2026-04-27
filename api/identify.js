export default async function handler(req, res) {
  const API_KEY = process.env.PERENUAL_API_KEY;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = req.body;

    const response = await fetch(
      `https://perenual.com/api/identify?key=${API_KEY}`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "API request failed" });
  }
}
