export const endpoints = {
  development: "line-development.html",
  review: "line-review.html",
  production: "line.html",
};

export function stageForPath(path) {
  const page = path.split("/").pop().replace(/\.html$/, "");
  return Object.keys(endpoints).find(key => endpoints[key].replace(/\.html$/, "") === page);
}

export function validLiffId(value) {
  return typeof value === "string" && /^\d+-[A-Za-z0-9]+$/.test(value);
}

export function validFriendUrl(value) {
  return typeof value === "string"
    && (/^https:\/\/lin\.ee\/[A-Za-z0-9]+\/?$/.test(value)
      || /^https:\/\/line\.me\/R\/ti\/p\/(?:@|%40)[A-Za-z0-9._~-]+\/?$/.test(value));
}

export function miniAppUrl(liffId) {
  return "https://miniapp.line.me/" + liffId;
}
