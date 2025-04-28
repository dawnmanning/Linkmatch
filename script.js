// --- Airtable via Vercel Proxy Setup ---
const proxyBaseUrl = 'https://linkmatch-proxy-dawnmanning.vercel.app/api/proxy/v0';
const businessesTable = 'Business directory';
const matchesTable = 'Industry matches';
const chatsTable = 'Communication';

// --- State ---
let currentUser = null;
let allBusinesses = [];
let currentIndex = 0;

// --- Profile Setup Screen ---
function showProfileSetup() {
  console.log("Running showProfileSetup...");
  const appDiv = document.getElementById("app");
  if (!appDiv) {
    console.error('App div not found!');
    return;
  }
  appDiv.innerHTML = `
    <div class="profile-setup">
      <h1>🚀 Build Your Business Profile</h1>
      <input id="bizName" type="text" placeholder="Business Name" />
      <input id="bizURL" type="url" placeholder="Website URL" />
      <label>Choose Business Sector:</label>
      <select id="bizSector">
        <option value="">-- Choose Sector --</option>
        <option value="Technology">Technology</option>
        <option value="Health & Wellness">Health & Wellness</option>
        <option value="Game Development">Game Development</option>
        <option value="Fashion">Fashion</option>
        <option value="Crypto / Blockchain">Crypto / Blockchain</option>
      </select>
      <input id="dr" type="number" placeholder="Your DR/DA Score" />
      <button onclick="startSession()">Save & Start Matching</button>
    </div>
  `;
}

// --- Save Profile to Airtable ---
function startSession() {
  console.log("Saving profile...");
  const name = document.getElementById("bizName").value.trim();
  const url = document.getElementById("bizURL").value.trim();
  const sector = document.getElementById("bizSector").value;
  const dr = parseInt(document.getElementById("dr").value) || Math.floor(Math.random() * 30) + 20;

  if (!name || !url || !sector) {
    alert('Please complete all fields.');
    return;
  }

  const profileData = {
    "Business Name": name,
    "Website URL": url,
    "Industry Category": sector,
    "Contact Email": `${name.replace(/\s+/g, '').toLowerCase()}@example.com`,
    "Description": "Created via LinkMatch",
    "Logo/Image": [],
    "DR": dr
  };

  fetch(`${proxyBaseUrl}/${businessesTable}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: profileData })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Profile saved:', data);
    currentUser = data;
    loadBusinesses();
  })
  .catch(error => {
    console.error('Error saving profile:', error);
    alert('Failed to save profile.');
  });
}

// --- Load Businesses (Dummy for now) ---
function loadBusinesses() {
  console.log("Loading businesses...");
  const appDiv = document.getElementById("app");
  appDiv.innerHTML = `
    <div class="swipe-container">
      <h1>🎉 Profile Created Successfully!</h1>
      <p>Swipe businesses coming soon...</p>
    </div>
  `;
}

// --- Expose functions globally ---
window.showProfileSetup = showProfileSetup;
window.startSession = startSession;



