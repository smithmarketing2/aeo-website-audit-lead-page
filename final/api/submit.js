export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { name, email, website, business } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ status: 'error', message: 'Name and email are required' });
  }

  const GC_API_KEY = process.env.GC_API_KEY || '547b49b19c1bf6abb8abec2328d487221f4bc13c6b5359199001bf46d0e58ebe';
  const GC_BASE_URL = 'https://api.globalcontrol.io/api/ai';
  const GC_TAG_ID = '69e91ff580a5749c2a6e58a2';

  try {
    // Step 1: Create contact in Global Control
    const contactResponse = await fetch(`${GC_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GC_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        customFields: [
          { key: 'website_url', value: website || '' },
          { key: 'business_name', value: business || '' },
          { key: 'lead_source', value: 'AEO Website Audit Lead Page' }
        ]
      })
    });

    const contactData = await contactResponse.json();

    if (contactData.type !== 'response' || !contactData.data) {
      throw new Error('Failed to create contact');
    }

    // Step 2: Apply the tag
    await fetch(`${GC_BASE_URL}/tags/fire-tag/${GC_TAG_ID}`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GC_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    });

    return res.status(200).json({
      status: 'success',
      message: "Thanks! We'll send your audit within 24 hours.",
      contactId: contactData.data._id,
      redirectUrl: 'https://digitalmarketingproreviews.com'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again.'
    });
  }
}
