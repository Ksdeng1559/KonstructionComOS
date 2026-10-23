/**
 * Server-only multi-directory discovery prototype.
 * No persistence, resale, marketing automation or credit decisions.
 * Each provider requires an explicit approval flag from an operator who has
 * reviewed current API terms and the actual intended use.
 */
import "server-only";

export type Source = "google_places" | "yelp" | "yellow_pages";
export type DirectoryCandidate = {
  source: Source;
  providerId: string;
  name: string;
  address?: string;
  website?: string;
  category?: string;
  observedAt: string;
  sourceUrl?: string;
};
export type SearchInput = { industry: string; location: string; limit?: number };
export type SearchResult = {
  source: Source;
  status: "ready" | "disabled" | "error" | "license_required";
  candidates: DirectoryCandidate[];
  message?: string;
};
const env = (key: string) => process.env[key]?.trim();
const enabled = (key: string) => env(key) === "true";
const clamp = (n?: number) => Math.min(20, Math.max(1, Math.floor(n ?? 10)));
const timestamp = () => new Date().toISOString();
const text = (v: unknown): string | undefined => typeof v === "string" && v.trim() ? v.trim() : undefined;

export async function searchGoogle(input: SearchInput): Promise<SearchResult> {
  const source = "google_places" as const;
  if (!enabled("GOOGLE_PLACES_APPROVED") || !env("GOOGLE_PLACES_API_KEY"))
    return {source,status:"disabled",candidates:[],message:"Requires approved use and API key"};
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Goog-Api-Key":env("GOOGLE_PLACES_API_KEY")!,
        "X-Goog-FieldMask":"places.id,places.displayName,places.formattedAddress,places.googleMapsUri"
      },
      body:JSON.stringify({textQuery:`${input.industry} in ${input.location}`,pageSize:clamp(input.limit)}),
      cache:"no-store"
    });
    if(!response.ok) throw new Error(`Google HTTP ${response.status}`);
    const data = await response.json() as {places?:Array<{id?:string;displayName?:{text?:string};formattedAddress?:string;googleMapsUri?:string}>};
    return {source,status:"ready",candidates:(data.places??[]).filter(p=>p.id&&p.displayName?.text).map(p=>({
      source,providerId:p.id!,name:p.displayName!.text!,
      address:text(p.formattedAddress),sourceUrl:text(p.googleMapsUri),observedAt:timestamp()
    }))};
  } catch(e) {return {source,status:"error",candidates:[],message:e instanceof Error?e.message:"Unknown error"};}
}

export async function searchYelp(input: SearchInput): Promise<SearchResult> {
  const source = "yelp" as const;
  if (!enabled("YELP_FUSION_APPROVED") || !env("YELP_FUSION_API_KEY"))
    return {source,status:"disabled",candidates:[],message:"Requires confirmation of commercial use rights and API key"};
  try {
    const params=new URLSearchParams({term:input.industry,location:input.location,limit:String(clamp(input.limit))});
    const response=await fetch(`https://api.yelp.com/v3/businesses/search?${params}`,{
      headers:{Authorization:`Bearer ${env("YELP_FUSION_API_KEY")}`},cache:"no-store"
    });
    if(!response.ok) throw new Error(`Yelp HTTP ${response.status}`);
    const data=await response.json() as {businesses?:Array<{id?:string;name?:string;url?:string;location?:{display_address?:string[]};categories?:Array<{title?:string}>}>};
    return {source,status:"ready",candidates:(data.businesses??[]).filter(b=>b.id&&b.name).map(b=>({
      source,providerId:b.id!,name:b.name!,address:b.location?.display_address?.join(", "),
      category:b.categories?.[0]?.title,sourceUrl:text(b.url),observedAt:timestamp()
    }))};
  } catch(e) {return {source,status:"error",candidates:[],message:e instanceof Error?e.message:"Unknown error"};}
}

/** Intentional non-implementation. Only an explicitly licensed feed adapter may be added. */
export async function searchYellowPages(_input: SearchInput): Promise<SearchResult> {
  return {source:"yellow_pages",status:"license_required",candidates:[],
    message:"No scraping or automatic querying. Execute a separate licensed-data agreement before implementing."};
}

export async function discover(input: SearchInput): Promise<SearchResult[]> {
  if (!input.industry.trim() || !input.location.trim()) throw new Error("Industry and location required");
  return Promise.all([searchGoogle(input),searchYelp(input),searchYellowPages(input)]);
}

/** Short-lived in-request grouping only. Not a durable provider-data directory. */
export function groupCandidateReferences(candidates: DirectoryCandidate[]) {
  const groups=new Map<string,DirectoryCandidate[]>();
  for(const c of candidates){
    const key=[c.name,c.address??""].map(v=>v.toLowerCase().replace(/[^a-z0-9]/g,"")).join("|");
    const prior=groups.get(key)??[]; prior.push(c); groups.set(key,prior);
  }
  return [...groups.values()].map(group=>({primary:group[0],sources:group.map(x=>x.source),matches:group}));
}
