export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL FIXA para produção (Render)
export const getLoginUrl = () => {
  const oauthPortalUrl = "https://memory-game-server-uxur.onrender.com";
  const appId = "memory-game";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
