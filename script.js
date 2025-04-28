// Airtable setup
const airtableApiKey = 'YOUR_AIRTABLE_API_KEY';
const airtableBaseId = 'YOUR_AIRTABLE_BASE_ID';
const businessesTable = 'Business directory';
const matchesTable = 'Industry matches';
const chatsTable = 'Communication';

// Simulated "currentUser" session
let currentUser = null;

// --- LOGIN / SIGNUP ---
function startSession() {
  const name = document.getElementById("bizName").value;
  const url = document.getElementById("bizURL").value;
  const sector = document.getElementById("bizSector").value;
  const dr = parseInt(document.getElementById("dr").value) || Math.floor(Math.random() * 30) + 20;

  const profileData = {
    "Business Name": name,
    "Website URL": url,
    "Industry Category": sector,
    "Contact Email": `${name.replace(/\s+/g, '').toLowerCase()}@example.com`, // Fake email for now
    "Description": "Automatically created user",
    "Logo/Image": [], // Optional - we can upload later
    "DR": dr
  };

  // Save to Airtable
  fetch(`https://api.airtable.com/v0/${airtableBaseId}/${businessesTable}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: profileData })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Profile created:', data);
    currentUser = data; // Save the current Airtable record
    loadBusinesses();
  })
  .catch(error => {
    console.error('Error creating profile:', error);
    alert('Failed to create profile.');
  });
}



