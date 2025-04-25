// --- LOGIN PAGE ---
function showLogin() {
  document.getElementById("app").innerHTML = `
    <div class="login-container">
      <h1>Backlink Match 💘</h1>
      <p>Find your perfect SEO partner 🚀</p>

      <input id="username" type="text" placeholder="Username" />
      <input id="password" type="password" placeholder="Password" />
      <button onclick="fakeLogin()">Login</button>

      <p id="status"></p>
    </div>
  `;
}

function fakeLogin() {
  const username = document.getElementById("username").value;
  if (username.trim() === "") {
    document.getElementById("status").innerText = "Please enter a username.";
    return;
  }
  document.getElementById("status").innerText = `Welcome, ${username}! Redirecting...`;
  setTimeout(() => {
    showProfileSetup();
  }, 1000);
}

// --- PROFILE SETUP ---
function showProfileSetup() {
  document.getElementById("app").innerHTML = `
    <div class="profile-setup">
      <h1>🚀 Build Your Business Profile</h1>
      
      <input id="bizName" type="text" placeholder="Business Name" />
      <input id="bizURL" type="url" placeholder="Website URL" />

      <label>Choose Business Sector:</label>
      <select id="bizSector">
        <option value="Technology">Technology</option>
        <option value="SaaS">SaaS</option>
        <option value="E-commerce">E-commerce</option>
        <option value="Marketing Agency">Marketing Agency</option>
        <option value="Finance">Finance</option>
        <option value="Game Development">Game Development</option>
        <option value="AI / Machine Learning">AI / Machine Learning</option>
        <option value="Health & Wellness">Health & Wellness</option>
        <option value="Education">Education</option>
        <option value="Travel">Travel</option>
        <option value="Food & Beverage">Food & Beverage</option>
        <option value="Fashion">Fashion</option>
        <option value="Crypto / Blockchain">Crypto / Blockchain</option>
        <option value="Real Estate">Real Estate</option>
        <option value="Entertainment">Entertainment</option>
      </select>

      <input id="dr" type="number" placeholder="Your DR/DA score (optional)" />

      <button onclick="submitProfile()">Save Profile</button>

      <div id="profileResult"></div>
    </div>
  `;
}

function submitProfile() {
  const name = document.getElementById("bizName").value;
  const url = document.getElementById("bizURL").value;
  const sector = document.getElementById("bizSector").value;
  const drInput = document.getElementById("dr").value;
  const dr = drInput ? drInput : Math.floor(Math.random() * 30) + 20;

  userProfile = { name, url, sector, dr };
  goToSwiping();
}

// --- SWIPING ---
const businesses = [
  { logo: "https://via.placeholder.com/80", name: "PixelForge Games", sector: "Game Development", url: "https://pixelforge.games", dr: 42 },
  { logo: "https://via.placeholder.com/80", name: "SaaSify Cloud", sector: "SaaS", url: "https://saasify.com", dr: 58 },
  { logo: "https://via.placeholder.com/80", name: "Nutrify Health", sector: "Health & Wellness", url: "https://nutrify.health", dr: 37 },
  { logo: "https://via.placeholder.com/80", name: "CoinVibe", sector: "Crypto / Blockchain", url: "https://coinvibe.io", dr: 66 },
  { logo: "https://via.placeholder.com/80", name: "TrendSet Fashion", sector: "Fashion", url: "https://trendset.fashion", dr: 44 }
];

let userProfile = {};
let currentIndex = 0;

function goToSwiping() {
  document.getElementById("app").innerHTML = `
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
    </div>
  `;

  loadCard();
}

function loadCard() {
  const biz = businesses[currentIndex];
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
  currentIndex++;
  loadCard();
}

function connect() {
  const boostDR = Math.floor(Math.random() * 10) + 5;
  const boostTraffic = Math.floor(Math.random() * 20) + 10;

  document.getElementById("result").innerHTML = `
    🌟 Potential boost:<br>
    +${boostDR}% DR | +${boostTraffic}% Traffic
  `;

  currentIndex++;
  setTimeout(loadCard, 1500);
}

// Start the app
showLogin();
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
  const boostDR = Math.floor(Math.random() * 10) + 5;
  const boostTraffic = Math.floor(Math.random() * 20) + 10;

  document.getElementById("result").innerHTML = `
    🌟 Potential boost:<br>
    +${boostDR}% DR | +${boostTraffic}% Traffic
  `;

  card.classList.add("swipe-right");
  setTimeout(() => {
    currentIndex++;
    card.classList.remove("swipe-right");
    loadCard();
  }, 500);
}

