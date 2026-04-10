export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { endpoint, ...params } = req.query;
  const apiKey = process.env.GETSONGBPM_KEY;

  const queryString = new URLSearchParams({ api_key: apiKey, ...params }).toString();
  const url = `https://api.getsongbpm.com/${endpoint}/?${queryString}`;

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://getsongbpm.com/",
        "Origin": "https://getsongbpm.com"
      }
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch {
      res.status(500).json({ error: "Not JSON", preview: text.slice(0, 300) });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}