/* Backend adapter. Same-origin backends are used automatically; GitHub Pages can be configured with dpdp-api-base. */
window.DPDP_API = {
  base: localStorage.getItem('dpdp-api-base') ?? (location.hostname.endsWith('github.io') ? null : ''),
  token: localStorage.getItem('dpdp-api-token') || '',
  setBase(url){ this.base = (url || '').replace(/\/$/,''); localStorage.setItem('dpdp-api-base',this.base); },
  setToken(token){ this.token=token||''; localStorage.setItem('dpdp-api-token',this.token); },
  async request(path, options={}){
    if(this.base === null) return null;
    const headers={'Content-Type':'application/json',...(options.headers||{})};
    if(this.token) headers.Authorization=`Bearer ${this.token}`;
    const r=await fetch(this.base+path,{...options,headers});
    if(!r.ok) throw new Error((await r.json().catch(()=>({}))).error||`HTTP ${r.status}`);
    return r.json();
  }
};