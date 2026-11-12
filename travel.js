import { config } from "./line-config.js";
import { validFriendUrl } from "./line-targets.js?v=4";

if (validFriendUrl(config.friendUrl)) {
  document.getElementById("partnership-contact").href = config.friendUrl;
}

async function showSponsor() {
  const response = await fetch("/api/travel/sponsor", { signal: AbortSignal.timeout(4000) });
  if (!response.ok) return;
  const { sponsor } = await response.json();
  if (!sponsor) return;
  document.getElementById("sponsor-title").textContent = sponsor.name;
  document.getElementById("sponsor-description").textContent = sponsor.description;
  document.getElementById("sponsor-link").href = sponsor.url;
  document.getElementById("travel-sponsor").hidden = false;
}
showSponsor().catch(() => {});
