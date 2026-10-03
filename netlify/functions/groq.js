exports.handler = async (event) => {
  // Debug info
  const debug = {
    method: event.httpMethod,
    keyExists: !!process.env.GROQ_API_KEY,
    keyPrefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 7) : 'NONE',
    keyLength: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0
  };

  // GET request pe debug info dikhao
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debug, null, 2)
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, category } = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GROQ_API_KEY not set', debug })
      };
    }

    const prompt = `Ek Indian handicraft product ke liye 2-3 line ka attractive Hindi description likho. Product: "${name}", Category: "${category}". Sirf description likho, koi heading ya extra text nahi.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      })
    }); 

    const data = await res.json();
    
    if (!res.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Groq API error', details: data, debug })
      };
    }

    const text = data.choices?.[0]?.message?.content?.trim() || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
