// --- Airtable Setup ---
const airtableApiKey = 'patU3giw0StF52OLm.a7a6a1351b37a29899ef6cc4f7c43520f480bb0dfbab87719c1b5918b9edc460';
const airtableBaseId = 'appNn1Tpagu4dWwuJ';
const businessesTable = 'Business directory';
const matchesTable = 'Industry matches';
const chatsTable = 'Communication';

// --- State ---
let currentUser = null;
let allBusinesses = [];
let currentIndex = 0;

// --- Profile Setup Screen ---
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
      <button onclick="startSession()">Save & Start Matching</button>
    </div>
  `;
}

// --- Start Session ---
function startSession() {
  const name = document.getElementById("bizName").value;
  const url = document.getElementById("bizURL").value;
  const sector = document.getElementById("bizSector").value;
  const dr = parseInt(document.getElementById("dr").value) || Math.floor(Math.random() * 30) + 20;

  const profileData = {
    "Business Name": name,
    "Website URL": url,
    "Industry Category": sector,
    "Contact Email": `${name.replace(/\s+/g, '').toLowerCase()}@example.com`,
    "Description": "Created by LinkMatch",
    "Logo/Image": [],
    "DR": dr
  };

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
    currentUser = data;
    loadBusinesses();
  })
  .catch(error => {
    console.error('Error creating profile:', error);
    alert('Failed to create profile.');
  });
}

// --- Load Businesses ---
function loadBusinesses() {
  fetch(`https://api.airtable.com/v0/${airtableBaseId}/${businessesTable}`, {
    headers: {
      'Authorization': `Bearer ${airtableApiKey}`,
    }
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

// --- Swiping ---
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
  const card = document.getElementById("card");
  const matchedBiz = allBusinesses[currentIndex];

  fetch(`https://api.airtable.com/v0/${airtableBaseId}/${matchesTable}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        "Business A": [currentUser.id],
        "Business B": [matchedBiz.id],
        "Match Status": "Pending",
        "Match Date": new Date().toISOString()
      }
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Match saved:', data);
    document.getElementById("result").innerText = `💜 Connected with ${matchedBiz.fields["Business Name"]}!`;
    card.classList.add("swipe-right");
    setTimeout(() => {
      currentIndex++;
      card.classList.remove("swipe-right");
      loadCard();
    }, 500);
  })
  .catch(error => {
    console.error('Error saving match:', error);
  });
}

function showMatches() {
  document.getElementById("app").innerHTML = `<div><h1>📂 My Matches (Coming soon!)</h1><button onclick="goToSwiping()">⬅️ Back</button></div>`;
}

// --- Init ---
window.onload = function() {
  showProfileSetup();
};



