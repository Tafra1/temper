export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { endpoint, ...params } = req.query;
  const apiKey = process.env.GETSONGBPM_KEY;

  const queryString = new URLSearchParams({ api_key: apiKey, ...params }).toString();
  const url = `https://api.getsongbpm.com/${endpoint}/?${queryString}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
