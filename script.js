// --- Airtable via Vercel Proxy Setup ---
const proxyBaseUrl = 'https://linkmatch-proxy-dawnmanning.vercel.app/api/proxy/v0';
const businessesTable = 'Business directory';
const matchesTable = 'Industry matches';
const chatsTable = 'Communication';

// --- State ---
let currentUser = null;
let allBusinesses = [];
let currentIndex = 0;

// --- Profile Setup ---
function showProfileSetup() {
  document.getElementById("app").innerHTML = `
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
      <input id="dr" type="number" placeholder="Your DR/DA score" />
      <button onclick="startSession(event)">Save & Start Matching</button>
    </div>
  `;
}

// --- Save Profile to Airtable via Proxy ---
function startSession(event) {
  if (event) event.preventDefault();

  const name = document.getElementById("bizName").value;
  const url = document.getElementById("bizURL").value;
  const sector = document.getElementById("bizSector").value;
  const dr = parseInt(document.getElementById("dr").value) || Math.floor(Math.random() * 30) + 20;

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
    console.log('Profile created:', data);
    currentUser = data;
    loadBusinesses();
  })
  .catch(error => {
    console.error('Error creating profile:', error);
    alert('Failed to create profile.');
  });
}

// --- Load Other Businesses ---
function loadBusinesses() {
  fetch(`${proxyBaseUrl}/${businessesTable}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(data => {
    allBusinesses = data.records.filter(biz => biz.id !== currentUser.id);
    console.log('Businesses loaded:', allBusinesses);
    goToSwiping();
  })
  .catch(error => {
    console.error('Error loading businesses:', error);
  });
}

// --- Swiping Interface ---
function goToSwiping() {
  document.getElementById("app").innerHTML = `
    <div class="swipe-container">
      <div id="card" class="card">
        <h2 id="bizName"></h2>
        <p id="bizSector"></p>
        <p id="bizURL"></p>
      </div>
      <div class="buttons">
        <button onclick="skip()">❌ Skip</button>
        <button onclick="connect()">✅ Connect</button>
      </div>
      <div id="result"></div>
      <button onclick="showMatches()">📂 View Matches</button>
    </div>
  `;
  loadCard();
}

function loadCard() {
  const biz = allBusinesses[currentIndex];
  if (!biz) {
    document.getElementById("card").style.display = "none";
    document.getElementById("result").innerText = "🎉 No more businesses!";
    return;
  }
  document.getElementById("bizName").innerText = biz.fields["Business Name"] || "Unknown";
  document.getElementById("bizSector").innerText = `Sector: ${biz.fields["Industry Category"] || "Unknown"}`;
  document.getElementById("bizURL").innerHTML = `<a href="${biz.fields["Website URL"]}" target="_blank">${biz.fields["Website URL"]}</a>`;
}

function skip() {
  const card = document.getElementById("card");
  card.classList.add("swipe-left");
  setTimeout(() => {
    currentIndex++;
    card.classList.remove("swipe-left");
    loadCard();
  }, 500);
}

function connect() {
  const biz = allBusinesses[currentIndex];

  fetch(`${proxyBaseUrl}/${matchesTable}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        "Business A": [currentUser.id],
        "Business B": [biz.id],
        "Match Status": "Pending",
        "Match Date": new Date().toISOString()
      }
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Match saved:', data);
    document.getElementById("result").innerText = `💘 Matched with ${biz.fields["Business Name"]}!`;
    currentIndex++;
    loadCard();
  })
  .catch(error => {
    console.error('Error saving match:', error);
  });
}

function showMatches() {
  document.getElementById("app").innerHTML = `
    <div><h1>📂 My Matches (coming soon!)</h1><button onclick="goToSwiping()">⬅️ Back</button></div>
  `;
}

// --- Init ---
window.onload = function() {
  showProfileSetup();
};
// Expose functions globally
window.showProfileSetup = showProfileSetup;
window.startSession = startSession;


