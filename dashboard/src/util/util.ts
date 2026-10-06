// import { setWebsites, setSelected, setLoading, setData } from "../state";
/*
 * I want to include all methods related to loading sites and analytics.
 */

export async function loadSites() {
  const res = await fetch(
    (import.meta as any).env.VITE_APP_API + "/api/v1/websites",
  );
  const sites = await res.json();
  //   setWebsites(sites);
  if (sites) return sites;
}

export const loadAnalytics = async function (site: any) {
  if (!site) return;
  //   setLoading(true);
  const res = await fetch(
    (import.meta as any).env.VITE_APP_API +
      "/api/v1/analytics/" +
      site.id +
      "/summary",
  );

  return await res.json();
  //   setData(await res.json());
  //   setLoading(false);
};

export async function addWebsite(name: string, domain: string) {
  const res = await fetch(
    (import.meta as any).env.VITE_APP_API + "/api/v1/websites",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    },
  );
  const w = await res.json();
  await loadSites();
  return w;
}
