// app.js
import { CONFIG, getGitHubUser, triggerGitHubAction } from './data.js';

const welcomeEl = document.getElementById("welcome");
const dashboardEl = document.getElementById("dashboard");

function login() {
  const url = `https://github.com/login/oauth/authorize?client_id=${CONFIG.CLIENT_ID}&scope=repo,user&redirect_uri=${CONFIG.REDIRECT_URI}`;
  window.location = url;
}

async function handleAuth() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  
  if(!code) return;
  
  // NOTE: For real app you need backend to exchange code -> token using GITHUB_CLIENT_SECRET
  // For now we save code and tell user to add token manually in settings
  localStorage.setItem("gh_code", code);
  window.history.replaceState({}, document.title, "/"); // clean URL
  
  await loadDashboard();
}

async function loadDashboard() {
  const token = localStorage.getItem("gh_token"); // User pastes token in settings
  if(!token) {
    alert("Please add your GitHub Personal Access Token in Settings");
    return;
  }
  
  const user = await getGitHubUser(token);
  document.getElementById("username").innerText = user.login;
  document.getElementById("avatar").src = user.avatar_url;
  
  welcomeEl.classList.add("hidden");
  dashboardEl.classList.remove("hidden");
}

async function triggerBuild() {
  const url = document.getElementById("url").value;
  const appName = document.getElementById("appName").value;
  const token = localStorage.getItem("gh_token");
  
  if(!url || !appName) return alert("Fill all fields");
  
  document.getElementById("buildBtn").innerText = "Building...";
  const res = await triggerGitHubAction(url, appName, token);
  
  if(res.ok) alert("Build Started! Check Actions tab in 2 mins");
  else alert("Error: " + res.status);
  
  document.getElementById("buildBtn").innerText = "Generate APK";
}

window.login = login;
window.triggerBuild = triggerBuild;
window.loadDashboard = loadDashboard;

handleAuth();
