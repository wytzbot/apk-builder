import { CONFIG, getGitHubUser, triggerGitHubAction } from './data.js';

const welcomeEl = document.getElementById("welcome");
const dashboardEl = document.getElementById("dashboard");

// 1. LOGIN BUTTON
function login() {
  const url = `https://github.com/login/oauth/authorize?client_id=${CONFIG.CLIENT_ID}&scope=repo,workflow&redirect_uri=${CONFIG.REDIRECT_URI}`;
  window.location = url;
}

// 2. SAVE TOKEN
function saveToken() {
  const token = document.getElementById("tokenInput").value;
  if(!token.startsWith("ghp_") && !token.startsWith("github_pat_")) return alert("Invalid token format");
  localStorage.setItem("gh_token", token);
  alert("Token Saved! ✅");
  document.getElementById("tokenInput").value = "";
  loadDashboard();
}

// 3. LOGOUT
function logout() {
  localStorage.removeItem("gh_token");
  localStorage.removeItem("gh_user");
  welcomeEl.classList.remove("hidden");
  dashboardEl.classList.add("hidden");
}

// 4. HANDLE AUTH ON PAGE LOAD
async function handleAuth() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code"); // GitHub will send this once
  
  if(code) {
    // We got redirected back from GitHub. Hide the code from URL
    window.history.replaceState({}, document.title, "/");
    // For now we just need the user to paste PAT manually. 
    // Proper OAuth needs backend. So we skip using the code.
  }
  
  const token = localStorage.getItem("gh_token");
  if(token) {
    await loadDashboard();
  } else {
    welcomeEl.classList.remove("hidden");
    dashboardEl.classList.add("hidden");
  }
}

// 5. LOAD DASHBOARD
async function loadDashboard() {
  const token = localStorage.getItem("gh_token");
  if(!token) return;
  
  try {
    const user = await getGitHubUser(token);
    localStorage.setItem("gh_user", JSON.stringify(user)); // Save user so we don't re-fetch
    
    document.getElementById("username").innerText = user.login;
    document.getElementById("avatar").src = user.avatar_url;
    welcomeEl.classList.add("hidden");
    dashboardEl.classList.remove("hidden");
  } catch {
    alert("Invalid Token. Please add new one");
    logout();
  }
}

// 6. TRIGGER BUILD
async function triggerBuild() {
  const url = document.getElementById("url").value;
  const appName = document.getElementById("appName").value;
  const token = localStorage.getItem("gh_token");
  
  if(!url || !appName) return alert("Fill App Name + URL");
  if(!token) return alert("Add your token in Settings first");
  
  const btn = document.getElementById("buildBtn");
  btn.innerText = "Building...";
  btn.disabled = true;
  
  const res = await triggerGitHubAction(url, appName, token);
  
  if(res.status === 204) alert(`Build Started! ✅\nGo to Actions tab in 2-3 mins to download APK`);
  else alert("Error: " + res.status + ". Check token has 'repo' and 'workflow' scope");
  
  btn.innerText = "Generate APK";
  btn.disabled = false;
}

window.login = login;
window.triggerBuild = triggerBuild;
window.saveToken = saveToken;
window.logout = logout;

handleAuth(); // Run on page load
