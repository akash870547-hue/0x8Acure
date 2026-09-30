/* Optional backend adapter. The existing MVP remains functional without it. */
window.DPDP_API = {
  base: localStorage.getItem('dpdp-api-base') || '',
  token: localStorage.getItem('dpdp-api-token') || '',
  setBase(url){ this.base = (url||'').replace(/\/$/,''); localStorage.setItem('dpdp-api-base',this.base); },
  setToken(token){ this.token=token||''; localStorage.setItem('dpdp-api-token',this.token); },
  async request(path, options={}){
    if(!this.base) return null;
    const headers={'Content-Type':'application/json',...(options.headers||{})};
    if(this.token) headers.Authorization=`Bearer ${this.token}`;
    const r=await fetch(this.base+path,{...options,headers});
    if(!r.ok) throw new Error((await r.json().catch(()=>({}))).error||`HTTP ${r.status}`);
    return r.json();
  }
};
