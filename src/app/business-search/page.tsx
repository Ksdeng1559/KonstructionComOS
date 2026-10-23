"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, CircleHelp, ExternalLink, FileSearch, Search, ShieldCheck, Sparkles } from "lucide-react";

type Candidate = { id: string; name: string; city: string; sector: string; domain: string };
const DEMO: Candidate[] = [
  { id:"example-1",name:"Example Pacific Manufacturing Ltd.",city:"Surrey, BC",sector:"Manufacturing",domain:"example.invalid" },
  { id:"example-2",name:"Example Fraser Freight Services",city:"Delta, BC",sector:"Logistics",domain:"example.invalid" },
  { id:"example-3",name:"Example West Coast Trades Inc.",city:"Burnaby, BC",sector:"Construction services",domain:"example.invalid" }
];
type Enrichment = "leadership"|"signals"|"property"|"finance";
const FEATURES: {id:Enrichment; label:string; description:string}[] = [
  {id:"leadership",label:"Owners and decision-makers",description:"Named leaders and roles with evidence links"},
  {id:"signals",label:"Growth and financing signals",description:"Expansion, acquisitions, contracts and capital spending"},
  {id:"property",label:"Commercial property context",description:"BC parcel, occupancy and verified title-research flags"},
  {id:"finance",label:"Possible financing solutions",description:"Business loans, equipment, mortgages, refinance and construction"}
];

export default function BusinessSearchPage() {
  const [query,setQuery]=useState("");
  const [city,setCity]=useState("British Columbia");
  useEffect(()=>{const initial=new URLSearchParams(window.location.search).get("q");if(initial) setQuery(initial.slice(0,200));},[]);
  const [selected,setSelected]=useState<string|null>(null);
  const [features,setFeatures]=useState<Enrichment[]>(["leadership","signals","finance"]);
  const [requested,setRequested]=useState(false);
  const results=useMemo(()=>{
    const term=query.trim().toLowerCase();
    return term ? DEMO.filter(c=>[c.name,c.city,c.sector].join(" ").toLowerCase().includes(term)) : DEMO;
  },[query]);
  const company=DEMO.find(c=>c.id===selected);
  function choose(c:Candidate){setSelected(c.id);setRequested(false);}
  function toggle(id:Enrichment){setRequested(false);setFeatures(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
  return <main className="min-h-screen bg-[#091523] text-slate-100">
    <div className="mx-auto max-w-6xl p-5 md:p-12">
      <Link href="/" className="inline-flex gap-2 items-center text-sm text-cyan-300 hover:underline"><ArrowLeft size={16}/> Executive dashboard</Link>
      <div className="mt-10 flex flex-wrap gap-4 justify-between items-start">
        <div><p className="text-xs uppercase tracking-[.2em] text-cyan-400">Broker workspace</p><h1 className="text-3xl md:text-4xl font-semibold mt-2">Search & Enrich a Business</h1><p className="text-slate-400 mt-3 max-w-2xl">Find the exact company your broker wants to research. Review the match, then choose what intelligence you need.</p></div>
        <span className="text-xs rounded-full border border-amber-700 bg-amber-500/10 text-amber-200 px-3 py-2">Prototype · no live data</span>
      </div>
      <section className="mt-8 rounded-2xl border border-slate-700 bg-[#112337] p-6">
        <label htmlFor="company-query" className="text-sm font-semibold">Company name or website</label>
        <div className="mt-3 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 rounded-xl border border-slate-600 bg-[#091523] px-4">
            <Search className="text-cyan-300" size={20}/><input id="company-query" className="min-w-0 flex-1 bg-transparent py-4 outline-none placeholder:text-slate-500" placeholder="e.g. manufacturing business in Surrey" value={query} onChange={e=>{setQuery(e.target.value);setSelected(null);setRequested(false)}}/>
          </div>
          <select aria-label="Search territory" value={city} onChange={e=>setCity(e.target.value)} className="rounded-xl border border-slate-600 bg-[#091523] px-4 py-3"><option>British Columbia</option><option>Metro Vancouver</option><option>Fraser Valley</option></select>
        </div>
        <p className="text-xs text-slate-500 mt-3">The search currently filters fictional sample records. Future live search will support company name, domain and business ID, with licensed business-source matching.</p>
      </section>
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 mt-6">
        <section className="rounded-2xl border border-slate-700 bg-[#112337] p-6">
          <div className="flex items-center gap-2"><Building2 className="text-cyan-400" size={20}/><h2 className="text-lg font-semibold">1. Confirm the business</h2></div>
          <p className="text-slate-400 text-sm mt-2">Select the correct company before enrichment. Avoid mixing similarly named branches or legal entities.</p>
          <div className="space-y-3 mt-6">{results.length ? results.map(c=><button key={c.id} type="button" onClick={()=>choose(c)} className={`w-full text-left rounded-xl border p-4 hover:border-cyan-400 transition ${selected===c.id?"border-cyan-400 bg-cyan-500/10":"border-slate-700 bg-[#091523]"}`}><div className="flex justify-between items-start gap-2"><strong>{c.name}</strong>{selected===c.id&&<CheckCircle2 className="text-cyan-300 shrink-0" size={18}/>}</div><p className="text-sm text-slate-400 mt-2">{c.city} · {c.sector}</p><p className="text-xs text-slate-500 mt-1">{c.domain}</p></button>):<div className="text-sm text-slate-400 border border-dashed border-slate-600 rounded-xl p-5">No demo matches. Live company search is not yet connected.</div>}</div>
        </section>
        <section className="rounded-2xl border border-slate-700 bg-[#112337] p-6">
          <div className="flex items-center gap-2"><Sparkles className="text-cyan-400" size={20}/><h2 className="text-lg font-semibold">2. Choose enrichment</h2></div>
          <p className="text-slate-400 text-sm mt-2">Run only the research needed for this prospect. A live workflow will show a cost estimate and require approval before paid calls.</p>
          <p className="text-sm mt-5 text-cyan-200">{company ? company.name : "Select a company to continue"}</p>
          <fieldset className="space-y-3 mt-4" disabled={!company}>{FEATURES.map(f=><label key={f.id} className="flex gap-3 items-start rounded-xl border border-slate-700 p-3 cursor-pointer"><input type="checkbox" className="mt-1 accent-cyan-400" checked={features.includes(f.id)} onChange={()=>toggle(f.id)}/><span><span className="font-medium text-sm">{f.label}</span><span className="block text-xs text-slate-400 mt-1">{f.description}</span></span></label>)}</fieldset>
          <button disabled={!company || !features.length} type="button" onClick={()=>setRequested(true)} className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Preview intelligence card</button>
          {requested && company && <div role="status" className="mt-5 rounded-xl border border-cyan-800 bg-cyan-900/20 p-4">
            <div className="flex gap-2 items-center font-semibold"><FileSearch size={18} className="text-cyan-300"/> Demo intelligence request</div>
            <p className="text-sm text-slate-300 mt-3">{company.name} · {city}</p>
            <p className="text-xs text-slate-400 mt-2">Requested: {FEATURES.filter(f=>features.includes(f.id)).map(f=>f.label).join(", ")}.</p>
            <p className="text-sm mt-3"><strong>Research status:</strong> Not run. No owner, financing intent, property ownership or credit data is claimed.</p>
            <p className="text-sm mt-2"><strong>Suggested workflow:</strong> verify entity → collect evidence → confirm person/title → map possible products → broker review.</p>
          </div>}
        </section>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 p-5 flex gap-3"><ShieldCheck className="text-cyan-400 shrink-0" size={21}/><div><strong className="text-sm">Evidence-first research</strong><p className="text-xs text-slate-400 mt-2">Every material claim should include a source and date. Financing need must remain unconfirmed until a borrower conversation.</p></div></div>
        <div className="rounded-xl border border-slate-800 p-5 flex gap-3"><CircleHelp className="text-cyan-400 shrink-0" size={21}/><div><strong className="text-sm">Production integration required</strong><p className="text-xs text-slate-400 mt-2">Authentication, approved sources, paid job orchestration, tenant-isolated storage, audit logs and rate limits precede live enrichment.</p></div></div>
      </div>
    </div>
  </main>;
}
