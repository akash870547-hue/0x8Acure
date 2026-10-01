/** Canonical 0x8Acure curriculum: 15 CHFI v11 + 6 Cloud Security Engineering modules. */
const modulesData=[
  {
    "id": "chfi-01",
    "track": "CHFI v11",
    "moduleNumber": 1,
    "title": "Computer Forensics Fundamentals",
    "summary": "Foundations of digital evidence and defensible forensic workflow.",
    "detailedTopics": [
      "digital evidence characteristics",
      "order of volatility",
      "forensic workstation design",
      "case scoping and authorization",
      "evidence integrity",
      "forensic methodology"
    ],
    "toolsArsenal": [
      "Autopsy",
      "Sleuth Kit",
      "FTK Imager",
      "Magnet AXIOM",
      "KAPE"
    ],
    "cliCommands": [
      "sha256sum evidence.img",
      "file evidence.img",
      "strings -a evidence.img | less"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-02",
    "track": "CHFI v11",
    "moduleNumber": 2,
    "title": "Computer Forensics Investigation Process",
    "summary": "End-to-end investigation lifecycle from first response to reporting.",
    "detailedTopics": [
      "first responder procedure",
      "scene documentation",
      "live response",
      "volatile collection",
      "dead-box acquisition",
      "examination and analysis",
      "case notes"
    ],
    "toolsArsenal": [
      "FTK Imager",
      "KAPE",
      "Velociraptor",
      "Plaso",
      "Magnet RAM Capture"
    ],
    "cliCommands": [
      "log2timeline.py case.plaso evidence/",
      "psort.py -o l2tcsv -w timeline.csv case.plaso",
      "sha256sum memory.raw"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-03",
    "track": "CHFI v11",
    "moduleNumber": 3,
    "title": "Digital Evidence and Chain of Custody",
    "summary": "Evidence identification, preservation, integrity, custody and admissibility.",
    "detailedTopics": [
      "evidence identifiers",
      "custody transfers",
      "evidence packaging",
      "MD5/SHA-256 verification",
      "authenticity",
      "admissibility",
      "repeatability",
      "reproducibility"
    ],
    "toolsArsenal": [
      "Hashdeep",
      "FTK Imager",
      "Autopsy",
      "EnCase"
    ],
    "cliCommands": [
      "sha256sum evidence.dd",
      "hashdeep -c sha256 evidence.dd",
      "sha256sum -c hashes.txt"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-04",
    "track": "CHFI v11",
    "moduleNumber": 4,
    "title": "Hard Disks, Partitions and File Systems",
    "summary": "Disk structures and filesystem artifacts used in forensic reconstruction.",
    "detailedTopics": [
      "MBR",
      "GPT",
      "protective MBR",
      "FAT32",
      "exFAT",
      "NTFS $MFT",
      "$UsnJrnl",
      "$LogFile",
      "unallocated space",
      "file slack",
      "ext4 inodes",
      "journaling"
    ],
    "toolsArsenal": [
      "Sleuth Kit",
      "Autopsy",
      "FTK Imager",
      "X-Ways",
      "TestDisk"
    ],
    "cliCommands": [
      "mmls image.dd",
      "fls -r image.dd",
      "istat image.dd 128",
      "icat image.dd 128",
      "fsstat image.dd"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-05",
    "track": "CHFI v11",
    "moduleNumber": 5,
    "title": "Windows File System and OS Artifacts",
    "summary": "Windows Registry and execution artifacts for activity reconstruction.",
    "detailedTopics": [
      "NTFS $MFT",
      "$UsnJrnl",
      "SYSTEM hive",
      "SOFTWARE hive",
      "SAM",
      "SECURITY",
      "NTUSER.DAT",
      "Prefetch",
      "Amcache",
      "Shimcache",
      "SRUM",
      "ShellBags",
      "LNK",
      "Jump Lists",
      "UserAssist",
      "Recycle Bin"
    ],
    "toolsArsenal": [
      "Eric Zimmerman tools",
      "MFTECmd",
      "RECmd",
      "PECmd",
      "JLECmd",
      "SrumECmd",
      "KAPE"
    ],
    "cliCommands": [
      "MFTECmd.exe -f $MFT --csv output",
      "PECmd.exe -d C:\\Windows\\Prefetch --csv output",
      "RECmd.exe -f NTUSER.DAT",
      "JLECmd.exe -d JumpLists --csv output"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-06",
    "track": "CHFI v11",
    "moduleNumber": 6,
    "title": "Data Acquisition and Forensic Imaging",
    "summary": "Bit-stream acquisition, write blocking, image formats and verification.",
    "detailedTopics": [
      "write blockers",
      "RAW/DD",
      "E01/Ex01",
      "image segmentation",
      "acquisition logs",
      "source hashing",
      "destination hashing",
      "bad-sector handling",
      "ddrescue",
      "remote acquisition"
    ],
    "toolsArsenal": [
      "FTK Imager",
      "Guymager",
      "dc3dd",
      "ewfacquire",
      "ewfverify",
      "ddrescue"
    ],
    "cliCommands": [
      "dc3dd if=/dev/sdb of=evidence.dd hash=sha256",
      "ewfacquire /dev/sdb",
      "ewfverify evidence.E01",
      "ddrescue -d /dev/sdb image.dd mapfile.log"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-07",
    "track": "CHFI v11",
    "moduleNumber": 7,
    "title": "Windows Memory Forensics",
    "summary": "RAM acquisition and Volatility analysis of processes, sockets and injected code.",
    "detailedTopics": [
      "RAM acquisition",
      "Volatility 3",
      "windows.pslist",
      "windows.pstree",
      "windows.psscan",
      "windows.netscan",
      "windows.malfind",
      "windows.dlllist",
      "handles",
      "VADs",
      "process injection",
      "kernel modules"
    ],
    "toolsArsenal": [
      "Volatility 3",
      "WinPmem",
      "Magnet RAM Capture",
      "MemProcFS"
    ],
    "cliCommands": [
      "python vol.py -f memory.raw windows.info",
      "python vol.py -f memory.raw windows.pslist",
      "python vol.py -f memory.raw windows.netscan",
      "python vol.py -f memory.raw windows.malfind"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-08",
    "track": "CHFI v11",
    "moduleNumber": 8,
    "title": "Linux and Unix Forensics",
    "summary": "Linux logs, filesystem artifacts, authentication and persistence investigation.",
    "detailedTopics": [
      "/var/log/auth.log",
      "journalctl",
      "Bash/Zsh history",
      "SSH authorized_keys",
      "cron",
      "systemd timers",
      "systemd services",
      "SUID/SGID",
      "Linux capabilities",
      "inodes",
      "timestamps"
    ],
    "toolsArsenal": [
      "Autopsy",
      "Sleuth Kit",
      "Plaso",
      "journalctl",
      "Volatility 3"
    ],
    "cliCommands": [
      "journalctl --since '24 hours ago'",
      "grep -i 'failed\\|accepted' /var/log/auth.log",
      "last -ai",
      "systemctl list-timers",
      "find / -perm -4000 -type f 2>/dev/null"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-09",
    "track": "CHFI v11",
    "moduleNumber": 9,
    "title": "Network Forensics",
    "summary": "PCAP acquisition and protocol-level investigation.",
    "detailedTopics": [
      "PCAP/PCAPNG",
      "Ethernet",
      "ARP",
      "IPv4/IPv6",
      "TCP/UDP",
      "DNS",
      "HTTP",
      "TLS metadata",
      "TCP streams",
      "DNS tunneling",
      "beaconing",
      "network flows"
    ],
    "toolsArsenal": [
      "Wireshark",
      "tshark",
      "tcpdump",
      "Zeek",
      "Suricata",
      "NetworkMiner"
    ],
    "cliCommands": [
      "tcpdump -i eth0 -nn -w capture.pcap",
      "tshark -r capture.pcap -Y 'dns'",
      "tshark -r capture.pcap -Y 'http.request'",
      "zeek -r capture.pcap"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-10",
    "track": "CHFI v11",
    "moduleNumber": 10,
    "title": "Web and Browser Forensics",
    "summary": "Browser databases and artifacts for reconstructing web activity.",
    "detailedTopics": [
      "Chromium History",
      "Chromium Cookies",
      "Login Data",
      "cache",
      "downloads",
      "Firefox places.sqlite",
      "cookies.sqlite",
      "session storage",
      "IndexedDB",
      "extensions",
      "private browsing limitations",
      "browser timestamps"
    ],
    "toolsArsenal": [
      "Hindsight",
      "Autopsy",
      "Magnet AXIOM",
      "DB Browser for SQLite",
      "KAPE"
    ],
    "cliCommands": [
      "sqlite3 History '.tables'",
      "sqlite3 History 'SELECT url,title,last_visit_time FROM urls;'",
      "find ~/.mozilla/firefox -name places.sqlite"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-11",
    "track": "CHFI v11",
    "moduleNumber": 11,
    "title": "Email and Malware Forensics",
    "summary": "Email routing, authentication, attachment analysis and malware triage.",
    "detailedTopics": [
      "Received headers",
      "Return-Path",
      "Message-ID",
      "SPF",
      "DKIM",
      "DMARC",
      "MIME",
      "Office macros",
      "PE metadata",
      "YARA",
      "static analysis",
      "sandboxing",
      "persistence"
    ],
    "toolsArsenal": [
      "YARA",
      "REMnux",
      "CAPE",
      "Ghidra",
      "Detect It Easy",
      "PEStudio",
      "oletools"
    ],
    "cliCommands": [
      "sha256sum suspicious.exe",
      "strings -a suspicious.exe",
      "yara malware.yar suspicious.exe",
      "olevba suspicious.docm",
      "exiftool suspicious.exe"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-12",
    "track": "CHFI v11",
    "moduleNumber": 12,
    "title": "Mobile Device Forensics",
    "summary": "Android/iOS acquisition and application artifact reconstruction.",
    "detailedTopics": [
      "Android ADB",
      "Android SQLite",
      "application data",
      "iOS backups",
      "application containers",
      "SMS",
      "calls",
      "messaging",
      "location",
      "GPS",
      "Wi-Fi history",
      "logical/filesystem/physical acquisition"
    ],
    "toolsArsenal": [
      "Cellebrite UFED",
      "Magnet AXIOM",
      "Oxygen Forensic Detective",
      "ADB",
      "ALEAPP",
      "iLEAPP"
    ],
    "cliCommands": [
      "adb devices",
      "adb shell getprop",
      "adb shell pm list packages",
      "adb pull /sdcard/ ./sdcard/"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-13",
    "track": "CHFI v11",
    "moduleNumber": 13,
    "title": "Database and Cloud Forensics",
    "summary": "Database audit trails and cloud control-plane evidence.",
    "detailedTopics": [
      "database audit logs",
      "transaction logs",
      "AWS CloudTrail",
      "CloudWatch",
      "S3 versions",
      "IAM events",
      "GuardDuty",
      "Azure Activity Log",
      "Entra audit logs",
      "cloud identity correlation",
      "timestamp normalization"
    ],
    "toolsArsenal": [
      "AWS CloudTrail",
      "AWS CLI",
      "AWS GuardDuty",
      "Azure CLI",
      "Azure Monitor",
      "Prowler",
      "ScoutSuite"
    ],
    "cliCommands": [
      "aws sts get-caller-identity",
      "aws cloudtrail lookup-events --max-results 50",
      "aws s3api list-object-versions --bucket BUCKET",
      "az monitor activity-log list"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-14",
    "track": "CHFI v11",
    "moduleNumber": 14,
    "title": "Incident Response and Advanced DFIR",
    "summary": "Advanced triage, threat hunting, ransomware investigation and cross-host correlation.",
    "detailedTopics": [
      "initial triage",
      "initial access",
      "persistence",
      "privilege escalation",
      "lateral movement",
      "C2",
      "exfiltration",
      "ransomware",
      "IOC/IOA",
      "MITRE ATT&CK",
      "super timelines",
      "containment",
      "eradication",
      "recovery"
    ],
    "toolsArsenal": [
      "Velociraptor",
      "KAPE",
      "Hayabusa",
      "Chainsaw",
      "Volatility 3",
      "Zeek",
      "Sigma",
      "YARA"
    ],
    "cliCommands": [
      "hayabusa csv-timeline -d evidence/",
      "chainsaw hunt ./evtx",
      "velociraptor query 'SELECT * FROM info()'",
      "yara -r rules/ ./evidence/"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-15",
    "track": "CHFI v11",
    "moduleNumber": 15,
    "title": "Forensic Reporting and Expert Testimony",
    "summary": "Professional reporting, exhibits, limitations and defensible testimony.",
    "detailedTopics": [
      "report structure",
      "scope",
      "methodology",
      "evidence inventory",
      "hash verification",
      "timelines",
      "technical findings",
      "limitations",
      "confidence",
      "exhibits",
      "tool versions",
      "reproducibility",
      "expert testimony",
      "ethics"
    ],
    "toolsArsenal": [
      "Autopsy",
      "Magnet AXIOM",
      "FTK",
      "Plaso",
      "Timeline Explorer"
    ],
    "cliCommands": [
      "sha256sum evidence/*",
      "uname -a",
      "python --version",
      "vol.py --version"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "cloud-01",
    "track": "Cloud Security Engineering",
    "moduleNumber": 1,
    "title": "Cloud Architecture and Shared Responsibility",
    "summary": "Cloud service models, trust boundaries and account architecture.",
    "detailedTopics": [
      "IaaS/PaaS/SaaS",
      "shared responsibility",
      "control plane",
      "data plane",
      "management plane",
      "multi-account design",
      "landing zones",
      "resource hierarchy",
      "environment isolation",
      "blast radius",
      "IaC",
      "Policy as Code"
    ],
    "toolsArsenal": [
      "AWS Organizations",
      "AWS Control Tower",
      "Azure Management Groups",
      "Azure Policy",
      "Terraform",
      "Cloud Custodian"
    ],
    "cliCommands": [
      "aws sts get-caller-identity",
      "aws organizations describe-organization",
      "az account show",
      "az management-group list",
      "terraform plan"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
  },
  {
    "id": "cloud-02",
    "track": "Cloud Security Engineering",
    "moduleNumber": 2,
    "title": "Cloud IAM and Identity Federation",
    "summary": "Least privilege, AssumeRole, federation and cloud privilege escalation.",
    "detailedTopics": [
      "IAM users/groups/roles",
      "identity policies",
      "resource policies",
      "explicit deny",
      "STS AssumeRole",
      "ExternalId",
      "session policies",
      "OIDC",
      "OAuth2",
      "SAML",
      "SSO",
      "managed identities",
      "service principals",
      "Access Analyzer",
      "privilege escalation"
    ],
    "toolsArsenal": [
      "AWS IAM",
      "AWS STS",
      "AWS Access Analyzer",
      "CloudTrail",
      "PMapper",
      "Pacu",
      "Microsoft Entra ID"
    ],
    "cliCommands": [
      "aws sts get-caller-identity",
      "aws iam get-role --role-name ROLE",
      "aws iam simulate-principal-policy --policy-source-arn ARN --action-names s3:GetObject",
      "az role assignment list"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
  },
  {
    "id": "cloud-03",
    "track": "Cloud Security Engineering",
    "moduleNumber": 3,
    "title": "Cloud Network Security",
    "summary": "VPC/VNet segmentation, routing, filtering, WAF and private connectivity.",
    "detailedTopics": [
      "VPC/VNet",
      "public/private subnets",
      "route tables",
      "internet gateways",
      "NAT",
      "security groups",
      "NACLs",
      "Transit Gateway",
      "peering",
      "PrivateLink",
      "private endpoints",
      "WAF",
      "DDoS",
      "flow logs",
      "egress filtering"
    ],
    "toolsArsenal": [
      "AWS VPC",
      "AWS WAF",
      "AWS Shield",
      "VPC Flow Logs",
      "Azure VNet",
      "Azure Firewall",
      "Azure WAF"
    ],
    "cliCommands": [
      "aws ec2 describe-vpcs",
      "aws ec2 describe-subnets",
      "aws ec2 describe-route-tables",
      "aws ec2 describe-security-groups",
      "aws ec2 describe-flow-logs",
      "az network vnet list",
      "az network nsg list"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
  },
  {
    "id": "cloud-04",
    "track": "Cloud Security Engineering",
    "moduleNumber": 4,
    "title": "Cloud Data Protection and Key Management",
    "summary": "Encryption, KMS, secrets, storage controls and key lifecycle.",
    "detailedTopics": [
      "encryption at rest",
      "encryption in transit",
      "TLS",
      "envelope encryption",
      "DEK/KEK",
      "AWS KMS",
      "key policies",
      "KMS grants",
      "rotation",
      "Secrets Manager",
      "Parameter Store",
      "Azure Key Vault",
      "S3 Block Public Access",
      "bucket policies",
      "versioning",
      "Object Lock",
      "secret rotation"
    ],
    "toolsArsenal": [
      "AWS KMS",
      "AWS Secrets Manager",
      "AWS S3",
      "Azure Key Vault",
      "Azure Storage",
      "TruffleHog",
      "Gitleaks",
      "Prowler"
    ],
    "cliCommands": [
      "aws kms list-keys",
      "aws kms describe-key --key-id KEY_ID",
      "aws kms list-grants --key-id KEY_ID",
      "aws secretsmanager list-secrets",
      "aws s3api get-public-access-block --bucket BUCKET",
      "az keyvault list"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
  },
  {
    "id": "cloud-05",
    "track": "Cloud Security Engineering",
    "moduleNumber": 5,
    "title": "Container, Kubernetes and Serverless Security",
    "summary": "Container supply-chain security, Kubernetes RBAC/networking and serverless identity.",
    "detailedTopics": [
      "image layers",
      "minimal bases",
      "image signing",
      "SBOM",
      "Trivy",
      "Grype",
      "Dockerfile hardening",
      "rootless containers",
      "Kubernetes API",
      "RBAC",
      "Role",
      "ClusterRole",
      "RoleBinding",
      "ClusterRoleBinding",
      "service accounts",
      "Secrets",
      "NetworkPolicy",
      "Pod Security Admission",
      "admission controllers",
      "Falco",
      "Lambda execution roles"
    ],
    "toolsArsenal": [
      "Docker",
      "Trivy",
      "Grype",
      "Syft",
      "kubectl",
      "Falco",
      "Kyverno",
      "OPA Gatekeeper",
      "kube-bench",
      "Kube Hunter"
    ],
    "cliCommands": [
      "docker image inspect IMAGE",
      "trivy image IMAGE",
      "grype IMAGE",
      "syft IMAGE -o spdx-json",
      "kubectl auth can-i --list",
      "kubectl get rolebindings -A",
      "kubectl get clusterrolebindings",
      "kubectl get networkpolicy -A"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
  },
  {
    "id": "cloud-06",
    "track": "Cloud Security Engineering",
    "moduleNumber": 6,
    "title": "CSPM, CIEM and Cloud Compliance",
    "summary": "Continuous posture, entitlement analysis, CIS controls and automated remediation.",
    "detailedTopics": [
      "CSPM",
      "CIEM",
      "CIS Benchmarks",
      "Prowler",
      "ScoutSuite",
      "AWS Config",
      "Security Hub",
      "Azure Policy",
      "Defender for Cloud",
      "configuration drift",
      "unused permissions",
      "excess permissions",
      "risk prioritization",
      "compliance evidence",
      "Policy as Code",
      "exceptions",
      "audit readiness"
    ],
    "toolsArsenal": [
      "Prowler",
      "ScoutSuite",
      "CloudSploit",
      "AWS Config",
      "AWS Security Hub",
      "IAM Access Analyzer",
      "Azure Policy",
      "Microsoft Defender for Cloud"
    ],
    "cliCommands": [
      "prowler aws",
      "prowler aws --compliance cis_5.0_aws",
      "scout aws",
      "aws securityhub get-findings",
      "aws iam generate-service-last-accessed-details --arn ARN",
      "az policy assignment list"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
  }
];
if(modulesData.length!==21) throw new Error("Curriculum integrity failure");
if(modulesData.filter(m=>m.track==="CHFI v11").length!==15) throw new Error("CHFI curriculum integrity failure");
if(modulesData.filter(m=>m.track==="Cloud Security Engineering").length!==6) throw new Error("Cloud curriculum integrity failure");
export {modulesData};
export default modulesData;
