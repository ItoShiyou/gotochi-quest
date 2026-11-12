import { config } from "./line-config.js";
import { stageForPath, miniAppUrl } from "./line-targets.js?v=4";

const pendingKey = "gotochi_quest_referral_v2";
const codePattern = /^[0-9a-f]{32}$/;
const stage = stageForPath(location.pathname);
let wallet = null;

export function inviteCode() {
  const fromUrl = new URL(location.href).searchParams.get("invite");
  if (fromUrl && codePattern.test(fromUrl)) return fromUrl;
  try {
    const saved = sessionStorage.getItem(pendingKey);
    return saved && codePattern.test(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function rememberInvite() {
  const code = inviteCode();
  if (!code) return;
  try { sessionStorage.setItem(pendingKey, code); } catch { /* Keep the URL intact. */ }
}

export function withInvite(url, code = inviteCode()) {
  const link = new URL(url, location.href);
  if (code) link.searchParams.set("invite", code);
  return link.href;
}

export function hasLineAccount() {
  return Boolean(stage && window.liff?.isLoggedIn?.());
}

export function inviteWallet() {
  return wallet;
}

async function referralRequest(action, fields = {}) {
  const token = window.liff?.getIDToken?.();
  if (!token) throw new Error("LINE login required");
  const response = await fetch("/api/invites/" + action, {
    method: "POST",
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ stage, invite: inviteCode(), ...fields }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("Invite request failed");
  const result = await response.json();
  wallet = result;
  return result;
}

export function refreshInviteWallet() {
  return referralRequest("status");
}

export function startInviteAdventure(departure) {
  return referralRequest("start", { departure });
}

export function inviteUrl() {
  return wallet?.code && stage ? withInvite(miniAppUrl(config[stage]), wallet.code) : null;
}

export async function shareInvite() {
  const link = inviteUrl();
  if (!link) return "manual";
  const message = "ご当地クエストで青島を冒険しよう！ 招待から初めて出発すると、日向夏を持って冒険できます。";
  const liff = window.liff;
  if (liff?.isApiAvailable?.("shareTargetPicker")) {
    const result = await liff.shareTargetPicker([{ type: "text", text: message + "\n" + link }], { isMultiple: false });
    return result?.status === "success" ? "shared" : "cancelled";
  }
  if (navigator.share) {
    await navigator.share({ title: "ご当地クエスト", text: message, url: link });
    return "shared";
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(link);
    return "copied";
  }
  return "manual";
}
