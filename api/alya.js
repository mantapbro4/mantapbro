export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).end();
    }

    const apiKey = process.env.ALYA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        status: false,
        message: "ALYA_API_KEY belum dipasang di Vercel"
      });
    }

    const endpoint = req.query.endpoint;

    if (!endpoint) {
      return res.status(400).json({
        status: false,
        message: "Parameter endpoint wajib diisi"
      });
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key === "endpoint") continue;

      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    }

    const target =
      "https://api.alyachan.dev/api/" +
      endpoint +
      (params.toString()
        ? "?" + params.toString()
        : "");

    const response = await fetch(target, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );

    res.status(response.status);

    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Proxy error",
      error: error.message
    });
  }
}