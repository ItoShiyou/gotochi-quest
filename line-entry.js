import { config } from "./line-config.js";
import { stageForPath, miniAppUrl, validFriendUrl, validLiffId } from "./line-targets.js?v=4";
import { traveler, mochi, drawSprite } from "./pixel-art.js";
import { rememberInvite, withInvite } from "./invites.js?v=5";

const get = (id) => document.getElementById(id);
const friendUrl = validFriendUrl(config.friendUrl) ? config.friendUrl : "";
const production = Boolean(friendUrl && validLiffId(config.production));
const stage = stageForPath(location.pathname);
const liffId = stage ? config[stage] : "";
const localPlay = !stage && !production;
const reopen = () => location.assign(withInvite(miniAppUrl(liffId)));
const reload = () => location.reload();

function showLink(link, url, label, isLine = false) {
  link.href = url;
  link.textContent = label;
  link.classList.toggle("line", isLine);
  link.hidden = false;
}

function showHome() {
  get("entry-note").textContent = production
    ? "公式 LINE のトークから、いつでも冒険に戻れます。"
    : "ひなたもちと青島へ出発しよう。";
  get("line-route").hidden = !production;
  if (production) {
    showLink(get("entry-primary"), friendUrl, "公式 LINE を友だち追加", true);
    showLink(get("entry-secondary"), miniAppUrl(config.production), "LINE で冒険する");
  } else {
    showLink(get("entry-primary"), "game.html", "冒険をはじめる →");
  }
  get("entry-actions").removeAttribute("aria-busy");
  drawSprite(document.querySelector(".hero-player").getContext("2d"), 0, 0, traveler.front[0], 1);
  drawSprite(document.querySelector(".hero-mochi").getContext("2d"), 0, 0, mochi, 1);
}

function showPrivacy() {
  if (!config.operator || !friendUrl) return;
  get("operator-name").textContent = config.operator;
  get("operator-info").hidden = false;
  get("operator-contact").href = friendUrl;
}

function withinTime(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("LINE request timed out")), 12000);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function loadSdk() {
  return withinTime(new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  }));
}

function showGate(message, actionLabel, action, offerFriend = false) {
  get("gate-status").textContent = message;
  const add = get("gate-friend");
  add.hidden = !offerFriend;
  add.onclick = null;
  if (offerFriend) add.href = friendUrl;

  const retry = get("gate-retry");
  retry.hidden = !action;
  retry.textContent = actionLabel || "";
  retry.onclick = action || null;
}

async function launchGame() {
  showGate("ゲームを読み込んでいます…");
  try {
    await import("./game-core.js?v=8");
    get("line-gate").hidden = true;
    document.body.classList.remove("gate-pending");
    document.querySelector("#btn-resume:not([hidden]), #btn-start").focus({ preventScroll: true });
  } catch {
    showGate("ゲームを読み込めませんでした。", "もう一度読み込む", reload);
  }
}

function askToAddFriend(liff) {
  showGate("公式 LINE を友だち追加すると冒険できます。追加したら、もう一度確認してください。",
    "友だち登録を確認する", () => checkFriendship(liff), true);
  if (!liff.isInClient() || typeof liff.requestFriendship !== "function") return;

  get("gate-friend").onclick = async (event) => {
    event.preventDefault();
    showGate("LINE の画面で友だち追加またはブロック解除を選んでください。");
    try {
      await liff.requestFriendship();
    } catch {
      location.assign(friendUrl);
      return;
    }
    await checkFriendship(liff);
  };
}

function offerConsent(liff, message) {
  showGate(message, "LINE の許可画面へ", () => checkFriendship(liff, true));
}

async function checkFriendship(liff, fromConsentButton = false) {
  showGate("友だち登録を確認しています…");
  let showingConsent = false;
  try {
    const { state } = await withinTime(liff.permission.query("profile"));
    if (state === "unavailable") {
      showGate("LINE で確認できませんでした。公式 LINE のトークから開き直してください。", "LINE で開く", reopen);
      return;
    }
    if (state === "prompt" && !fromConsentButton) {
      offerConsent(liff, "冒険を始めるため、公式 LINE の友だち登録を確認します。");
      return;
    }
    showingConsent = state === "prompt";
    // getFriendship opens LINE's access dialog when profile consent is pending.
    const request = liff.getFriendship();
    const friendship = showingConsent ? await request : await withinTime(request);
    if (friendship.friendFlag === true) await launchGame();
    else askToAddFriend(liff);
  } catch {
    if (showingConsent) {
      offerConsent(liff, "友だち登録を確認するには、LINE でアクセスを許可してください。");
      return;
    }
    showGate("友だち登録を確認できませんでした。時間をおいてもう一度お試しください。",
      "もう一度確認する", () => checkFriendship(liff));
  }
}

async function enterLine() {
  showGate("LINE と接続しています…");
  try {
    await loadSdk();
    const liff = window.liff;
    await withinTime(liff.init({ liffId }));
    rememberInvite();
    if (liff.isLoggedIn()) {
      await checkFriendship(liff);
      return;
    }
    if (liff.isInClient()) {
      showGate("公式 LINE のトークから開き直してください。", "LINE で開く", reopen);
      return;
    }
    showGate("LINE にログインすると、友だち登録を確認できます。", "LINE でログイン", () => {
      try {
        const redirect = new URL(location.pathname, location.href);
        liff.login({ redirectUri: withInvite(redirect) });
      } catch {
        showGate("LINE ログインを開始できませんでした。", "もう一度読み込む", reload);
      }
    });
  } catch {
    showGate("LINE に接続できませんでした。", "もう一度読み込む", reload);
  }
}

switch (document.body.dataset.page) {
  case "home":
    showHome();
    break;
  case "privacy":
    showPrivacy();
    break;
  case "game":
    if (localPlay) launchGame();
    else if (friendUrl && validLiffId(liffId)) enterLine();
    else if (production) showGate("公式 LINE から冒険を始めましょう。", "LINE で冒険する",
      () => location.assign(withInvite(miniAppUrl(config.production))), true);
    else showGate("冒険を開けませんでした。", "案内に戻る", () => location.assign("./"));
    break;
}
