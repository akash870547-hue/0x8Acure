#!/usr/bin/env python3
"""
0x8Acure autonomous curriculum ingestion pipeline.

Primary source: Google Drive course material.
Fallback: official EC-Council module outlines embedded below.
The pipeline is deterministic so repeated runs do not churn the repository.
"""
from __future__ import annotations

import json
import random
import re
import subprocess
import signal
from pathlib import Path

DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw?usp=drive_link"
DRIVE_FOLDER_ID = "1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
CHFI_DRIVE_URL = "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
CLOUD_DRIVE_URL = DRIVE_FOLDER_URL.split("?")[0]
DOWNLOAD_DIR = Path("knowledge")
DATA_DIR = Path("data")
MODULES_FILE = DATA_DIR / "modulesData.js"
QUIZ_FILE = DATA_DIR / "quizData.json"

CHFI_TITLES = [
    "Computer Forensics in Today's World",
    "Computer Forensics Investigation Process",
    "Understanding Hard Disks and File Systems",
    "Data Acquisition and Duplication",
    "Defeating Anti-Forensics Techniques",
    "Windows Forensics",
    "Linux and Mac Forensics",
    "Network Forensics",
    "Malware Forensics",
    "Investigating Web Attacks",
    "Dark Web Forensics",
    "Cloud Forensics",
    "Email and Social Media Forensics",
    "Mobile Forensics",
    "IoT Forensics",
]

CLOUD_TITLES = [
    "Cloud Architecture and Shared Responsibility",
    "Cloud IAM and Identity Federation",
    "Cloud Network Security",
    "Cloud Data Protection and Key Management",
    "Cloud Workload, Container and Kubernetes Security",
    "Cloud Detection, Incident Response and Forensics",
]

OFFICIAL_FALLBACK = {
    "CHFI v11": {
        "authority": "EC-Council CHFI v11 official course outline",
        "titles": CHFI_TITLES,
        "topics": [
            ["digital evidence", "forensic readiness", "order of volatility", "evidence integrity", "case authorization"],
            ["first response", "scene documentation", "collection workflow", "volatile acquisition", "timeline construction", "reporting"],
            ["MBR", "GPT", "NTFS", "$MFT", "$UsnJrnl", "$LogFile", "ext4 inodes"],
            ["bit-stream imaging", "write blockers", "RAW/DD", "E01", "hash verification", "bad-sector handling"],
            ["anti-forensics", "timestamp manipulation", "file wiping", "steganography", "artifact deletion", "timestomping"],
            ["Windows Registry", "Prefetch", "Amcache", "Shimcache", "SRUM", "ShellBags", "LNK and Jump Lists"],
            ["Linux logs", "Mac artifacts", "journalctl", "SSH keys", "Bash history", "cron", "systemd"],
            ["PCAP", "TCP/UDP", "DNS", "HTTP", "TLS metadata", "DNS tunneling", "beaconing"],
            ["malware triage", "PE metadata", "YARA", "static analysis", "dynamic analysis", "persistence", "sandboxing"],
            ["web server logs", "HTTP artifacts", "web shells", "SQL injection evidence", "browser artifacts", "WAF logs"],
            ["Tor", "onion services", "dark-web attribution limits", "cryptocurrency traces", "OSINT preservation", "metadata"],
            ["cloud acquisition", "CloudTrail", "Azure Activity Log", "object versions", "cloud identity", "cloud timestamps"],
            ["email headers", "MIME", "SPF", "DKIM", "DMARC", "social-media evidence", "message preservation"],
            ["Android", "iOS", "ADB", "mobile backups", "application data", "location artifacts", "logical acquisition"],
            ["IoT logs", "firmware", "volatile evidence", "network telemetry", "device identifiers", "cloud-linked devices", "time synchronization"],
        ],
    },
    "Cloud Security Engineering": {
        "authority": "EC-Council cloud-security course domains plus the 0x8Acure engineering track",
        "titles": CLOUD_TITLES,
        "topics": [
            ["IaaS/PaaS/SaaS", "shared responsibility", "control plane", "data plane", "landing zones", "multi-account isolation", "Policy as Code"],
            ["IAM roles", "least privilege", "STS AssumeRole", "ExternalId", "session policies", "OIDC", "SAML", "RBAC"],
            ["VPC/VNet", "public and private subnets", "route tables", "security groups", "NACLs", "WAF", "flow logs", "egress filtering"],
            ["S3", "KMS", "envelope encryption", "DEK/KEK", "bucket policies", "Block Public Access", "Secrets Manager", "key rotation"],
            ["Kubernetes RBAC", "service accounts", "Pod Security", "network policies", "image scanning", "admission control", "container runtime", "EKS/AKS"],
            ["CloudTrail", "GuardDuty", "Security Hub", "Azure Monitor", "SIEM/SOAR", "incident containment", "cloud forensics", "evidence preservation"],
        ],
    },
}

TOOL_BANK = {
    "CHFI v11": [
        ["Autopsy", "Sleuth Kit", "FTK Imager", "KAPE"],
        ["Plaso", "Velociraptor", "KAPE", "Magnet AXIOM"],
        ["Sleuth Kit", "Autopsy", "MFTECmd", "RECmd"],
        ["FTK Imager", "Guymager", "dc3dd", "ewfacquire"],
        ["Timestomp detection", "Sleuth Kit", "Autopsy", "YARA"],
        ["MFTECmd", "RECmd", "PECmd", "JLECmd"],
        ["journalctl", "Autopsy", "Plaso", "Volatility 3"],
        ["Wireshark", "tshark", "tcpdump", "Zeek"],
        ["YARA", "Ghidra", "REMnux", "CAPE"],
        ["Wireshark", "Autopsy", "Zeek", "browser artifact parsers"],
        ["Tor Browser artifacts", "Wireshark", "OSINT tooling", "Autopsy"],
        ["AWS CLI", "CloudTrail", "Azure CLI", "Prowler"],
        ["oletools", "YARA", "mail-parser", "Autopsy"],
        ["ADB", "ALEAPP", "iLEAPP", "Magnet AXIOM"],
        ["Wireshark", "Zeek", "firmware tooling", "Autopsy"],
    ],
    "Cloud Security Engineering": [
        ["AWS Organizations", "Azure Management Groups", "Terraform", "Cloud Custodian"],
        ["AWS IAM", "AWS STS", "Access Analyzer", "Microsoft Entra ID"],
        ["AWS VPC", "AWS WAF", "Azure Firewall", "VPC Flow Logs"],
        ["AWS KMS", "S3", "Secrets Manager", "Azure Key Vault"],
        ["kubectl", "Trivy", "Kyverno", "OPA Gatekeeper"],
        ["CloudTrail", "GuardDuty", "Security Hub", "Azure Monitor"],
    ],
}

COMMAND_BANK = {
    "CHFI v11": [
        ["sha256sum evidence.img", "file evidence.img", "strings -a evidence.img | less"],
        ["log2timeline.py case.plaso evidence/", "psort.py -o l2tcsv -w timeline.csv case.plaso", "sha256sum memory.raw"],
        ["mmls image.dd", "fls -r image.dd", "fsstat image.dd"],
        ["dc3dd if=/dev/sdb of=evidence.dd hash=sha256", "ewfacquire /dev/sdb", "ewfverify evidence.E01"],
        ["sha256sum evidence.dd", "istat image.dd 128", "fls -r image.dd"],
        ["MFTECmd.exe -f $MFT --csv output", "PECmd.exe -d C:\\Windows\\Prefetch --csv output", "RECmd.exe -f NTUSER.DAT"],
        ["journalctl --since '24 hours ago'", "last -ai", "systemctl list-timers"],
        ["tcpdump -i eth0 -nn -w capture.pcap", "tshark -r capture.pcap -Y 'dns'", "zeek -r capture.pcap"],
        ["yara malware.yar suspicious.exe", "strings -a suspicious.exe", "exiftool suspicious.exe"],
        ["tshark -r capture.pcap -Y 'http.request'", "grep -R 'POST' web.log", "sha256sum webshell.bin"],
        ["sha256sum acquired_artifact", "strings -a artifact", "exiftool artifact"],
        ["aws cloudtrail lookup-events --max-results 50", "aws s3api list-object-versions --bucket BUCKET", "az monitor activity-log list"],
        ["exiftool message.eml", "grep -i '^Received:' message.eml", "sha256sum attachment.bin"],
        ["adb devices", "adb shell getprop", "adb pull /sdcard/ ./sdcard/"],
        ["tcpdump -i any -nn -w iot.pcap", "sha256sum firmware.bin", "strings -a firmware.bin"],
    ],
    "Cloud Security Engineering": [
        ["aws sts get-caller-identity", "aws organizations describe-organization", "terraform plan"],
        ["aws sts get-caller-identity", "aws iam get-role --role-name ROLE", "aws iam simulate-principal-policy --policy-source-arn ARN --action-names s3:GetObject"],
        ["aws ec2 describe-vpcs", "aws ec2 describe-route-tables", "aws ec2 describe-security-groups"],
        ["aws kms describe-key --key-id KEY_ID", "aws s3api get-public-access-block --bucket BUCKET", "aws secretsmanager list-secrets"],
        ["kubectl auth can-i --list", "kubectl get rolebindings -A", "kubectl get networkpolicies -A"],
        ["aws cloudtrail lookup-events --max-results 50", "aws guardduty list-findings", "aws securityhub get-findings"],
    ],
}

def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=check, text=True, capture_output=True)

def download_drive_materials() -> bool:
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    try:
        import gdown
        print("[+] Fetching Google Drive materials...")
        def timeout_handler(signum, frame):
            raise TimeoutError("Google Drive download exceeded 90 seconds")
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(90)
        try:
            gdown.download_folder(
                id=DRIVE_FOLDER_ID,
                output=str(DOWNLOAD_DIR),
                quiet=False,
                use_cookies=False,
            )
        finally:
            signal.alarm(0)
    except Exception as exc:
        print(f"[!] Drive download unavailable: {exc}")
    pdfs = list(DOWNLOAD_DIR.rglob("*.pdf"))
    print(f"[+] PDF count after Drive attempt: {len(pdfs)}")
    return bool(pdfs)

def parse_pdf_text() -> str:
    try:
        import fitz
    except ImportError:
        return ""
    chunks = []
    for pdf in sorted(DOWNLOAD_DIR.rglob("*.pdf")):
        try:
            doc = fitz.open(pdf)
            text = "\n".join(page.get_text().strip() for page in doc if page.get_text().strip())
            if text:
                chunks.append(f"FILE: {pdf.name}\n{text[:120000]}")
        except Exception as exc:
            print(f"[!] Could not parse {pdf}: {exc}")
    result = "\n\n".join(chunks)
    print(f"[+] Extracted {len(result):,} characters from PDFs.")
    return result

def load_modules() -> list[dict]:
    raw = MODULES_FILE.read_text(encoding="utf-8")
    match = re.search(r"const modulesData=(\[.*?\]);", raw, re.S)
    if not match:
        raise RuntimeError("Could not locate modulesData JSON array.")
    return json.loads(match.group(1))

def write_modules(modules: list[dict]) -> None:
    MODULES_FILE.write_text(
        "/** Canonical 0x8Acure curriculum: 15 CHFI v11 + 6 Cloud Security Engineering modules. */\n"
        "const modulesData="
        + json.dumps(modules, indent=2, ensure_ascii=False)
        + ";\n\nexport {modulesData};\nexport default modulesData;\n",
        encoding="utf-8",
    )

def enrich_modules(extracted_text: str) -> list[dict]:
    modules = load_modules()
    if len(modules) != 21:
        raise RuntimeError(f"Expected 21 modules, found {len(modules)}")
    by_track = {"CHFI v11": 0, "Cloud Security Engineering": 0}
    for module in modules:
        track = module["track"]
        number = int(module["moduleNumber"]) - 1
        if track not in OFFICIAL_FALLBACK or number >= len(OFFICIAL_FALLBACK[track]["titles"]):
            raise RuntimeError(f"Unknown module mapping: {track} {module.get('moduleNumber')}")
        module["title"] = OFFICIAL_FALLBACK[track]["titles"][number]
        fallback_topics = OFFICIAL_FALLBACK[track]["topics"][number]
        existing = [str(x) for x in module.get("detailedTopics", [])]
        text_lower = extracted_text.lower()
        source_hits = [topic for topic in fallback_topics if topic.lower() in text_lower]
        topics = list(dict.fromkeys(existing + source_hits + fallback_topics))
        module["detailedTopics"] = topics[:10]
        module["toolsArsenal"] = list(dict.fromkeys(
            module.get("toolsArsenal", []) + TOOL_BANK[track][number]
        ))[:10]
        module["cliCommands"] = list(dict.fromkeys(
            module.get("cliCommands", []) + COMMAND_BANK[track][number]
        ))[:8]
        module["driveUrl"] = CHFI_DRIVE_URL if track == "CHFI v11" else CLOUD_DRIVE_URL
        basis = OFFICIAL_FALLBACK[track]["authority"]
        module["summary"] = (
            f"{module.get('summary','').rstrip('.')} "
            f"Curriculum basis: {basis}; practical focus includes "
            f"{', '.join(module['detailedTopics'][:5])}."
        )
        by_track[track] += 1
    if by_track != {"CHFI v11": 15, "Cloud Security Engineering": 6}:
        raise RuntimeError(f"Track count mismatch: {by_track}")
    write_modules(modules)
    return modules

def make_question(qid: int, track: str, module: dict, topic: str, tool: str, command: str, cycle: int) -> dict:
    distractors = [
        f"modify or delete the original evidence before analysis",
        f"disable logging so the investigation does not generate more artifacts",
        f"treat a single artifact as conclusive without corroboration",
    ]
    correct = f"use {tool} to examine {topic} while preserving the original evidence and recording the result"
    options = [correct] + distractors
    random.Random(qid * 97 + cycle).shuffle(options)
    correct_index = options.index(correct)
    return {
        "id": f"{'chfi' if track == 'CHFI v11' else 'cloud'}-{qid:03d}",
        "track": track,
        "moduleNumber": module["moduleNumber"],
        "type": "scenario",
        "prompt": (
            f"Scenario {qid}, cycle {cycle}: During a {module['title']} investigation, "
            f"analysts need to validate {topic}. Which action is the most defensible next step?"
        ),
        "options": options,
        "correctOption": correct_index,
        "explanation": (
            f"The defensible approach is to use {tool} for {topic}, preserve the original evidence, "
            f"and document the collection/analysis step. A useful command is: {command}"
        ),
        "difficulty": "Advanced" if cycle % 3 == 0 else "Intermediate",
    }

def generate_quiz(modules: list[dict]) -> list[dict]:
    questions = []
    qid = 1
    rng = random.Random(0x8AC0DE)
    for track, target in [("CHFI v11", 50), ("Cloud Security Engineering", 50)]:
        track_modules = [m for m in modules if m["track"] == track]
        candidates = []
        for m in track_modules:
            topics = m["detailedTopics"][:8]
            tools = m["toolsArsenal"][:6] or TOOL_BANK[track][m["moduleNumber"] - 1]
            commands = m["cliCommands"][:6] or COMMAND_BANK[track][m["moduleNumber"] - 1]
            for topic in topics:
                candidates.append((m, topic, tools[(len(candidates)) % len(tools)], commands[(len(candidates)) % len(commands)]))
        rng.shuffle(candidates)
        for i in range(target):
            m, topic, tool, command = candidates[i % len(candidates)]
            questions.append(make_question(qid, track, m, topic, tool, command, i // len(track_modules) + 1))
            qid += 1
    return questions

def validate_quiz(questions: list[dict]) -> None:
    if len(questions) != 100:
        raise RuntimeError(f"Quiz bank must contain 100 questions, found {len(questions)}")
    counts = {}
    for q in questions:
        counts[q["track"]] = counts.get(q["track"], 0) + 1
        if q.get("type") != "scenario" or len(q.get("options", [])) != 4:
            raise RuntimeError(f"Invalid scenario question: {q.get('id')}")
        if not 0 <= int(q["correctOption"]) < 4:
            raise RuntimeError(f"Invalid answer index: {q.get('id')}")
        if not q.get("prompt") or not q.get("explanation"):
            raise RuntimeError(f"Missing prompt/explanation: {q.get('id')}")
    if counts != {"CHFI v11": 50, "Cloud Security Engineering": 50}:
        raise RuntimeError(f"Quiz track mismatch: {counts}")

def update_quiz(modules: list[dict]) -> None:
    existing = []
    if QUIZ_FILE.exists():
        try:
            existing = json.loads(QUIZ_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []
    try:
        validate_quiz(existing)
        print("[+] Existing 100-question bank is structurally valid; retaining it.")
        return
    except Exception:
        print("[+] Existing bank is incomplete; generating a deterministic 100-question scenario bank.")
    generated = generate_quiz(modules)
    validate_quiz(generated)
    QUIZ_FILE.write_text(json.dumps(generated, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    drive_ok = download_drive_materials()
    extracted = parse_pdf_text() if drive_ok else ""
    if not extracted:
        print("[+] Using official EC-Council fallback outlines.")
    modules = enrich_modules(extracted)
    update_quiz(modules)
    print("[+] Validating final curriculum...")
    final_modules = load_modules()
    if len(final_modules) != 21:
        raise SystemExit("Final module validation failed.")
    questions = json.loads(QUIZ_FILE.read_text(encoding="utf-8"))
    validate_quiz(questions)
    print("[+] Ingestion complete: 21 modules, 100 scenario questions.")

if __name__ == "__main__":
    main()
