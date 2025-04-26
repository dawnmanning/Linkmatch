// --- FIREBASE INIT ---
const auth = firebase.auth();
const db = firebase.firestore();

// --- STATE ---
let userProfile = {};
let currentIndex = 0;
let myLikes = [];
let matches = [];
let filteredBusinesses = [];
let currentUser = null;

// Dummy businesses
const businesses = [
  { logo: "https://via.placeholder.com/80", name: "PixelForge Games", sector: "Game Development", url: "https://pixelforge.games", dr: 42 },
  { logo: "https://via.placeholder.com/80", name: "SaaSify Cloud", sector: "SaaS", url: "https://saasify.com", dr: 58 },
  { logo: "https://via.placeholder.com/80", name: "Nutrify Health", sector: "Health & Wellness", url: "https://nutrify.health", dr: 37 },
  { logo: "https://via.placeholder.com/80", name: "CoinVibe", sector: "Crypto / Blockchain", url: "https://coinvibe.io", dr: 66 },
  { logo: "https://via.placeholder.com/80", name: "TrendSet Fashion", sector: "Fashion", url: "https://trendset.fashion", dr: 44 }
];

// --- LOGIN/REGISTER ---

function showLogin() {
  document.getElementById("app").innerHTML = `
    <div class="login-container">
      <h1>Backlink Match 💘</h1>
      <p>Find your perfect SEO partner 🚀</p>
      <input id="email" type="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button onclick="firebaseLogin()">Login / Signup</button>
      <p id="status"></p>
    </div>
  `;
}

function firebaseLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      document.getElementById("status").innerText = `Welcome, ${currentUser.email}!`;
      loadUserProfile();
    })
    .catch(error => {
      if (error.code === 'auth/user-not-found') {
        // If no user, create a new one
        auth.createUserWithEmailAndPassword(email, password)
          .then(userCredential => {
            currentUser = userCredential.user;
            createNewUserProfile();
          });
      } else {
        document.getElementById("status").innerText = `Error: ${error.message}`;
      }
    });
}

// --- PROFILE SETUP ---

function createNewUserProfile() {
  userProfile = {
    name: "",
    url: "",
    sector: "",
    dr: 0,
    matches: []
  };

  db.collection('users').doc(currentUser.uid).set(userProfile)
    .then(() => {
      showProfileSetup();
    });
}

function loadUserProfile() {
  db.collection('users').doc(currentUser.uid).get()
    .then(doc => {
      if (doc.exists) {
        userProfile = doc.data();
        matches = userProfile.matches || [];
        filteredBusinesses = [...businesses];
        if (userProfile.name) {
          goToSwiping();
        } else {
          showProfileSetup();
        }
      } else {
        createNewUserProfile();
      }
    });
}

function saveUserProfile() {
  db.collection('users').doc(currentUser.uid).update(userProfile);
}

// --- BUILD PROFILE UI ---

function showProfileSetup() {
  document.getElementById("app").innerHTML = `
    <div class="profile-setup">
      <h1>🚀 Build Your Business Profile</h1>
      <input id="bizName" type="text" placeholder="Business Name" value="${userProfile.name || ''}" />
      <input id="bizURL" type="url" placeholder="Website URL" value="${userProfile.url || ''}" />
      <label>Choose Business Sector:</label>
      <select id="bizSector">
        <option value="">-- Choose Sector --</option>
        ${[
          "Technology", "SaaS", "E-commerce", "Marketing Agency", "Finance", "Game Development",
          "AI / Machine Learning", "Health & Wellness", "Education", "Travel",
          "Food & Beverage", "Fashion", "Crypto / Blockchain", "Real Estate", "Entertainment"
        ].map(opt => `<option value="${opt}" ${userProfile.sector === opt ? 'selected' : ''}>${opt}</option>`).join("")}
      </select>
      <input id="dr" type="number" placeholder="Your DR/DA score" value="${userProfile.dr || ''}" />
      <button onclick="submitProfile()">Save Profile</button>
    </div>
  `;
}

function submitProfile() {
  const name = document.getElementById("bizName").value;
  const url = document.getElementById("bizURL").value;
  const sector = document.getElementById("bizSector").value;
  const drInput = document.getElementById("dr").value;
  const dr = drInput ? parseInt(drInput) : Math.floor(Math.random() * 30) + 20;

  userProfile = { name, url, sector, dr, matches };
  saveUserProfile();
  filteredBusinesses = [...businesses];
  goToSwiping();
}

// --- SWIPING + FILTERING ---

function goToSwiping() {
  document.getElementById("app").innerHTML = `
    <div class="filter-bar">
      <label>Sector:</label>
      <select id="filterSector">
        <option value="">All</option>
        ${["SaaS", "Game Development", "Health & Wellness", "Crypto / Blockchain", "Fashion"].map(s => `<option value="${s}">${s}</option>`).join("")}
      </select>
      <label>DR Range:</label>
      <input id="minDR" type="number" placeholder="Min" />
      <input id="maxDR" type="number" placeholder="Max" />
      <button onclick="applyFilters()">Apply Filters</button>
    </div>

    <div class="swipe-container">
      <div id="card" class="card">
        <img id="logo" src="" alt="Business Logo" />
        <h2 id="bizName"></h2>
        <p id="bizSector"></p>
        <p id="bizURL"></p>
        <p id="bizDR"></p>
      </div>

      <div class="buttons">
        <button onclick="skip()">❌ Skip</button>
        <button onclick="connect()">✅ Connect</button>
      </div>

      <div id="result"></div>
      <button onclick="showMatches()">📂 View Matches</button>
      <button onclick="showSettings()">⚙️ Settings</button>
    </div>
  `;
  loadCard();
}

function applyFilters() {
  const selectedSector = document.getElementById("filterSector").value;
  const minDR = parseInt(document.getElementById("minDR").value) || 0;
  const maxDR = parseInt(document.getElementById("maxDR").value) || 100;

  filteredBusinesses = businesses.filter(biz => {
    const matchSector = !selectedSector || biz.sector === selectedSector;
    const matchDR = biz.dr >= minDR && biz.dr <= maxDR;
    return matchSector && matchDR;
  });

  currentIndex = 0;
  loadCard();
}

function loadCard() {
  const biz = filteredBusinesses[currentIndex];
  if (!biz) {
    document.getElementById("card").style.display = "none";
    document.getElementById("result").innerText = "🎉 No more businesses!";
    return;
  }
  document.getElementById("logo").src = biz.logo;
  document.getElementById("bizName").innerText = biz.name;
  document.getElementById("bizSector").innerText = `Sector: ${biz.sector}`;
  document.getElementById("bizURL").innerHTML = `<a href="${biz.url}" target="_blank">${biz.url}</a>`;
  document.getElementById("bizDR").innerText = `DR/DA Score: ${biz.dr}`;
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
  const biz = filteredBusinesses[currentIndex];
  myLikes.push(biz);

  const likesBack = Math.random() < 0.6;
  if (likesBack) {
    matches.push(biz);
    saveMatches();
    showMatchScreen(biz);
  } else {
    document.getElementById("result").innerText = `No match this time!`;
    card.classList.add("swipe-right");
    setTimeout(() => {
      currentIndex++;
      card.classList.remove("swipe-right");
      loadCard();
    }, 500);
  }
}

// --- MATCH + CHAT ---

function showMatchScreen(biz) {
  const boostDR = Math.floor(Math.random() * 15) + 5;
  const boostTraffic = Math.floor(Math.random() * 300) + 100;

  document.getElementById("app").innerHTML = `
    <div class="match-screen">
      <h1>🎉 It's a Match!</h1>
      <img src="${biz.logo}" alt="Business Logo" style="width:100px;height:100px;border-radius:50%;">
      <h2>${biz.name}</h2>
      <p>Sector: ${biz.sector}</p>
      <p><strong>🔧 Estimated Boost:</strong><br> +${boostDR}% DR | +${boostTraffic} visits/mo</p>
      <button onclick="startChat('${biz.name}')">Start Chat 💬</button>
      <button onclick="continueSwiping()">Keep Swiping ➡️</button>
    </div>
  `;
}

function startChat(bizName) {
  document.getElementById("app").innerHTML = `
    <div class="chat-window">
      <h1>💬 Chat with ${bizName}</h1>
      <div id="chatMessages" style="height:200px;overflow-y:auto;margin-bottom:10px;background:white;padding:10px;border-radius:10px;color:#111;">
        <p><strong>${bizName}:</strong> Hey there! Excited to swap links? 🚀</p>
      </div>
      <input id="chatInput" type="text" placeholder="Type your message..." style="width:100%; padding:10px; border-radius:10px; border:none; margin-bottom:10px;" />
      <button onclick="sendMessage('${bizName}')">Send</button>
      <button onclick="showMatches()" style="margin-top: 10px;">⬅️ Back to Matches</button>
    </div>
  `;
}

function sendMessage(bizName) {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message === "") return;
  const chatBox = document.getElementById("chatMessages");
  chatBox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
  input.value = "";
  setTimeout(() => {
    chatBox.innerHTML += `<p><strong>${bizName}:</strong> Awesome! I'll link to you today 🚀</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);
}

// --- SAVE MATCHES ---

function saveMatches() {
  userProfile.matches = matches;
  db.collection('users').doc(currentUser.uid).update({ matches });
}

// --- SETTINGS + LOGOUT ---

function showMatches() {
  if (matches.length === 0) {
    document.getElementById("app").innerHTML = `
      <div class="match-list">
        <h1>📂 My Matches</h1>
        <p>No matches yet. Keep swiping!</p>
        <button onclick="goToSwiping()">Back to Swiping</button>
      </div>
    `;
    return;
  }

  let html = `<div class="match-list"><h1>📂 My Matches</h1>`;
  matches.forEach((biz) => {
    html += `
      <div class="match-card">
        <img src="${biz.logo}" alt="${biz.name}" style="width:60px;height:60px;border-radius:50%;float:left;margin-right:10px;">
        <strong>${biz.name}</strong><br>
        <span>Sector: ${biz.sector}</span><br>
        <button onclick="startChat('${biz.name}')">💬 Chat Again</button>
      </div>
    `;
  });
  html += `<button onclick="goToSwiping()">⬅️ Back to Swiping</button></div>`;
  document.getElementById("app").innerHTML = html;
}

function showSettings() {
  document.getElementById("app").innerHTML = `
    <div class="settings">
      <h1>⚙️ Settings</h1>
      <button onclick="showProfileSetup()">Edit Profile</button>
      <button onclick="logout()">Log Out</button>
    </div>
  `;
}

function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    matches = [];
    userProfile = {};
    currentIndex = 0;
    showLogin();
  });
}

// --- INIT ---
showLogin();



