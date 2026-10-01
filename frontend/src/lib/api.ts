export class ApiError extends Error {
  status:number;
  constructor(message:string,status:number){super(message);this.name="ApiError";this.status=status;}
}
export async function api<T>(url:string,options:RequestInit={},token?:string):Promise<T>{
  const apiBase=(import.meta.env.VITE_API_BASE_URL||"").replace(/\/$/,"");
  const headers=new Headers(options.headers);
  if(options.body&&!headers.has("Content-Type")) headers.set("Content-Type","application/json");
  if(token) headers.set("Authorization",`Bearer ${token}`);
  const response=await fetch(apiBase+url,{...options,headers});
  if(response.status===204)return undefined as T;
  const payload=await response.json().catch(()=>({error:"The server returned an invalid response."}));
  if(!response.ok)throw new ApiError(payload?.error||"Request failed.",response.status);
  return payload as T;
}
