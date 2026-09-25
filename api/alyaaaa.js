export default async function handler(req, res) {
  try {
    const path = req.query.path;

    if (!path) {
      return res.status(400).json({
        status: false,
        message: "Path API tidak ditemukan"
      });
    }

    const apiKey = process.env.ALYA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        status: false,
        message: "ALYA_API_KEY belum dipasang di Vercel"
      });
    }

    const pathArray = Array.isArray(path)
      ? path
      : [path];

    const alyaPath = pathArray
      .map(part => encodeURIComponent(part))
      .join("/");

    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key === "path") continue;

      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, v));
      } else if (value !== undefined) {
        query.append(key, value);
      }
    }

    const queryString = query.toString();

    const targetUrl =
      "https://api.alyachan.dev/api/" +
      alyaPath +
      (queryString ? "?" + queryString : "");

    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    const options = {
      method: req.method,
      headers
    };

    if (
      req.method !== "GET" &&
      req.method !== "HEAD"
    ) {
      if (req.body !== undefined) {
        options.body =
          typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body);
      }
    }

    const response = await fetch(
      targetUrl,
      options
    );

    const contentType =
      response.headers.get("content-type") || "";

    const text = await response.text();

    res.status(response.status);

    if (contentType.includes("application/json")) {
      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    }

    res.setHeader(
      "Content-Type",
      contentType || "text/plain"
    );

    return res.send(text);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Proxy error",
      error: error.message
    });
  }
}