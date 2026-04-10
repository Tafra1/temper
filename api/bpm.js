export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  
  const { endpoint, ...params } = req.query;
  const apiKey = process.env.GETSONGBPM_KEY;

  // DEBUG temporaire
  if (!endpoint) {
    return res.status(200).json({ 
      keyPresent: !!apiKey, 
      keyLength: apiKey?.length,
      keyStart: apiKey?.slice(0, 4)
    });
  }

  const queryString = new URLSearchParams({ api_key: apiKey, ...params }).toString();
  const url = `https://api.getsongbpm.com/${endpoint}/?${queryString}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch {
      res.status(500).json({ error: "Not JSON", preview: text.slice(0, 200) });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}