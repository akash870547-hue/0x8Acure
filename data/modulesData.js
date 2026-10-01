/** Canonical 0x8Acure curriculum: 15 CHFI v11 + 6 Cloud Security Engineering modules. */
const modulesData=[
  {
    "id": "chfi-01",
    "track": "CHFI v11",
    "moduleNumber": 1,
    "title": "Computer Forensics in Today's World",
    "summary": "Foundations of digital evidence and defensible forensic workflow Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity.",
    "detailedTopics": [
      "digital evidence characteristics",
      "order of volatility",
      "forensic workstation design",
      "case scoping and authorization",
      "evidence integrity",
      "forensic methodology",
      "digital evidence",
      "forensic readiness",
      "case authorization"
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
    "summary": "End-to-end investigation lifecycle from first response to reporting Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition.",
    "detailedTopics": [
      "first responder procedure",
      "scene documentation",
      "live response",
      "volatile collection",
      "dead-box acquisition",
      "examination and analysis",
      "case notes",
      "first response",
      "collection workflow",
      "volatile acquisition"
    ],
    "toolsArsenal": [
      "FTK Imager",
      "KAPE",
      "Velociraptor",
      "Plaso",
      "Magnet RAM Capture",
      "Magnet AXIOM"
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
    "title": "Understanding Hard Disks and File Systems",
    "summary": "Evidence identification, preservation, integrity, custody and admissibility Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity.",
    "detailedTopics": [
      "evidence identifiers",
      "custody transfers",
      "evidence packaging",
      "MD5/SHA-256 verification",
      "authenticity",
      "admissibility",
      "repeatability",
      "reproducibility",
      "MBR",
      "GPT"
    ],
    "toolsArsenal": [
      "Hashdeep",
      "FTK Imager",
      "Autopsy",
      "EnCase",
      "Sleuth Kit",
      "MFTECmd",
      "RECmd"
    ],
    "cliCommands": [
      "sha256sum evidence.dd",
      "hashdeep -c sha256 evidence.dd",
      "sha256sum -c hashes.txt",
      "mmls image.dd",
      "fls -r image.dd",
      "fsstat image.dd"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-04",
    "track": "CHFI v11",
    "moduleNumber": 4,
    "title": "Data Acquisition and Duplication",
    "summary": "Disk structures and filesystem artifacts used in forensic reconstruction Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT.",
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
      "file slack"
    ],
    "toolsArsenal": [
      "Sleuth Kit",
      "Autopsy",
      "FTK Imager",
      "X-Ways",
      "TestDisk",
      "Guymager",
      "dc3dd",
      "ewfacquire"
    ],
    "cliCommands": [
      "mmls image.dd",
      "fls -r image.dd",
      "istat image.dd 128",
      "icat image.dd 128",
      "fsstat image.dd",
      "dc3dd if=/dev/sdb of=evidence.dd hash=sha256",
      "ewfacquire /dev/sdb",
      "ewfverify evidence.E01"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-05",
    "track": "CHFI v11",
    "moduleNumber": 5,
    "title": "Defeating Anti-Forensics Techniques",
    "summary": "Windows Registry and execution artifacts for activity reconstruction Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM.",
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
      "Shimcache"
    ],
    "toolsArsenal": [
      "Eric Zimmerman tools",
      "MFTECmd",
      "RECmd",
      "PECmd",
      "JLECmd",
      "SrumECmd",
      "KAPE",
      "Timestomp detection",
      "Sleuth Kit",
      "Autopsy"
    ],
    "cliCommands": [
      "MFTECmd.exe -f $MFT --csv output",
      "PECmd.exe -d C:\\Windows\\Prefetch --csv output",
      "RECmd.exe -f NTUSER.DAT",
      "JLECmd.exe -d JumpLists --csv output",
      "sha256sum evidence.dd",
      "istat image.dd 128",
      "fls -r image.dd"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-06",
    "track": "CHFI v11",
    "moduleNumber": 6,
    "title": "Windows Forensics",
    "summary": "Bit-stream acquisition, write blocking, image formats and verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs.",
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
      "ddrescue",
      "MFTECmd",
      "RECmd",
      "PECmd",
      "JLECmd"
    ],
    "cliCommands": [
      "dc3dd if=/dev/sdb of=evidence.dd hash=sha256",
      "ewfacquire /dev/sdb",
      "ewfverify evidence.E01",
      "ddrescue -d /dev/sdb image.dd mapfile.log",
      "MFTECmd.exe -f $MFT --csv output",
      "PECmd.exe -d C:\\Windows\\Prefetch --csv output",
      "RECmd.exe -f NTUSER.DAT"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-07",
    "track": "CHFI v11",
    "moduleNumber": 7,
    "title": "Linux and Mac Forensics",
    "summary": "RAM acquisition and Volatility analysis of processes, sockets and injected code Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan.",
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
      "VADs"
    ],
    "toolsArsenal": [
      "Volatility 3",
      "WinPmem",
      "Magnet RAM Capture",
      "MemProcFS",
      "journalctl",
      "Autopsy",
      "Plaso"
    ],
    "cliCommands": [
      "python vol.py -f memory.raw windows.info",
      "python vol.py -f memory.raw windows.pslist",
      "python vol.py -f memory.raw windows.netscan",
      "python vol.py -f memory.raw windows.malfind",
      "journalctl --since '24 hours ago'",
      "last -ai",
      "systemctl list-timers"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-08",
    "track": "CHFI v11",
    "moduleNumber": 8,
    "title": "Network Forensics",
    "summary": "Linux logs, filesystem artifacts, authentication and persistence investigation Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron.",
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
      "inodes"
    ],
    "toolsArsenal": [
      "Autopsy",
      "Sleuth Kit",
      "Plaso",
      "journalctl",
      "Volatility 3",
      "Wireshark",
      "tshark",
      "tcpdump",
      "Zeek"
    ],
    "cliCommands": [
      "journalctl --since '24 hours ago'",
      "grep -i 'failed\\|accepted' /var/log/auth.log",
      "last -ai",
      "systemctl list-timers",
      "find / -perm -4000 -type f 2>/dev/null",
      "tcpdump -i eth0 -nn -w capture.pcap",
      "tshark -r capture.pcap -Y 'dns'",
      "zeek -r capture.pcap"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-09",
    "track": "CHFI v11",
    "moduleNumber": 9,
    "title": "Malware Forensics",
    "summary": "PCAP acquisition and protocol-level investigation Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP.",
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
      "DNS tunneling"
    ],
    "toolsArsenal": [
      "Wireshark",
      "tshark",
      "tcpdump",
      "Zeek",
      "Suricata",
      "NetworkMiner",
      "YARA",
      "Ghidra",
      "REMnux",
      "CAPE"
    ],
    "cliCommands": [
      "tcpdump -i eth0 -nn -w capture.pcap",
      "tshark -r capture.pcap -Y 'dns'",
      "tshark -r capture.pcap -Y 'http.request'",
      "zeek -r capture.pcap",
      "yara malware.yar suspicious.exe",
      "strings -a suspicious.exe",
      "exiftool suspicious.exe"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-10",
    "track": "CHFI v11",
    "moduleNumber": 10,
    "title": "Investigating Web Attacks",
    "summary": "Browser databases and artifacts for reconstructing web activity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads.",
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
      "extensions"
    ],
    "toolsArsenal": [
      "Hindsight",
      "Autopsy",
      "Magnet AXIOM",
      "DB Browser for SQLite",
      "KAPE",
      "Wireshark",
      "Zeek",
      "browser artifact parsers"
    ],
    "cliCommands": [
      "sqlite3 History '.tables'",
      "sqlite3 History 'SELECT url,title,last_visit_time FROM urls;'",
      "find ~/.mozilla/firefox -name places.sqlite",
      "tshark -r capture.pcap -Y 'http.request'",
      "grep -R 'POST' web.log",
      "sha256sum webshell.bin"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-11",
    "track": "CHFI v11",
    "moduleNumber": 11,
    "title": "Dark Web Forensics",
    "summary": "Email routing, authentication, attachment analysis and malware triage Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM.",
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
      "YARA"
    ],
    "toolsArsenal": [
      "YARA",
      "REMnux",
      "CAPE",
      "Ghidra",
      "Detect It Easy",
      "PEStudio",
      "oletools",
      "Tor Browser artifacts",
      "Wireshark",
      "OSINT tooling"
    ],
    "cliCommands": [
      "sha256sum suspicious.exe",
      "strings -a suspicious.exe",
      "yara malware.yar suspicious.exe",
      "olevba suspicious.docm",
      "exiftool suspicious.exe",
      "sha256sum acquired_artifact",
      "strings -a artifact",
      "exiftool artifact"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-12",
    "track": "CHFI v11",
    "moduleNumber": 12,
    "title": "Cloud Forensics",
    "summary": "Android/iOS acquisition and application artifact reconstruction Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers.",
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
      "GPS"
    ],
    "toolsArsenal": [
      "Cellebrite UFED",
      "Magnet AXIOM",
      "Oxygen Forensic Detective",
      "ADB",
      "ALEAPP",
      "iLEAPP",
      "AWS CLI",
      "CloudTrail",
      "Azure CLI",
      "Prowler"
    ],
    "cliCommands": [
      "adb devices",
      "adb shell getprop",
      "adb shell pm list packages",
      "adb pull /sdcard/ ./sdcard/",
      "aws cloudtrail lookup-events --max-results 50",
      "aws s3api list-object-versions --bucket BUCKET",
      "az monitor activity-log list"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-13",
    "track": "CHFI v11",
    "moduleNumber": 13,
    "title": "Email and Social Media Forensics",
    "summary": "Database audit trails and cloud control-plane evidence Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions.",
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
      "cloud identity correlation"
    ],
    "toolsArsenal": [
      "AWS CloudTrail",
      "AWS CLI",
      "AWS GuardDuty",
      "Azure CLI",
      "Azure Monitor",
      "Prowler",
      "ScoutSuite",
      "oletools",
      "YARA",
      "mail-parser"
    ],
    "cliCommands": [
      "aws sts get-caller-identity",
      "aws cloudtrail lookup-events --max-results 50",
      "aws s3api list-object-versions --bucket BUCKET",
      "az monitor activity-log list",
      "exiftool message.eml",
      "grep -i '^Received:' message.eml",
      "sha256sum attachment.bin"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-14",
    "track": "CHFI v11",
    "moduleNumber": 14,
    "title": "Mobile Forensics",
    "summary": "Advanced triage, threat hunting, ransomware investigation and cross-host correlation Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement.",
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
      "MITRE ATT&CK"
    ],
    "toolsArsenal": [
      "Velociraptor",
      "KAPE",
      "Hayabusa",
      "Chainsaw",
      "Volatility 3",
      "Zeek",
      "Sigma",
      "YARA",
      "ADB",
      "ALEAPP"
    ],
    "cliCommands": [
      "hayabusa csv-timeline -d evidence/",
      "chainsaw hunt ./evtx",
      "velociraptor query 'SELECT * FROM info()'",
      "yara -r rules/ ./evidence/",
      "adb devices",
      "adb shell getprop",
      "adb pull /sdcard/ ./sdcard/"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "chfi-15",
    "track": "CHFI v11",
    "moduleNumber": 15,
    "title": "IoT Forensics",
    "summary": "Professional reporting, exhibits, limitations and defensible testimony Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification.",
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
      "exhibits"
    ],
    "toolsArsenal": [
      "Autopsy",
      "Magnet AXIOM",
      "FTK",
      "Plaso",
      "Timeline Explorer",
      "Wireshark",
      "Zeek",
      "firmware tooling"
    ],
    "cliCommands": [
      "sha256sum evidence/*",
      "uname -a",
      "python --version",
      "vol.py --version",
      "tcpdump -i any -nn -w iot.pcap",
      "sha256sum firmware.bin",
      "strings -a firmware.bin"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"
  },
  {
    "id": "cloud-01",
    "track": "Cloud Security Engineering",
    "moduleNumber": 1,
    "title": "Cloud Architecture and Shared Responsibility",
    "summary": "Cloud service models, trust boundaries and account architecture Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane.",
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
      "blast radius"
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
    "summary": "Least privilege, AssumeRole, federation and cloud privilege escalation Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole.",
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
      "SAML"
    ],
    "toolsArsenal": [
      "AWS IAM",
      "AWS STS",
      "AWS Access Analyzer",
      "CloudTrail",
      "PMapper",
      "Pacu",
      "Microsoft Entra ID",
      "Access Analyzer"
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
    "summary": "VPC/VNet segmentation, routing, filtering, WAF and private connectivity Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT.",
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
      "PrivateLink"
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
    "summary": "Encryption, KMS, secrets, storage controls and key lifecycle Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK.",
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
      "Secrets Manager"
    ],
    "toolsArsenal": [
      "AWS KMS",
      "AWS Secrets Manager",
      "AWS S3",
      "Azure Key Vault",
      "Azure Storage",
      "TruffleHog",
      "Gitleaks",
      "Prowler",
      "S3",
      "Secrets Manager"
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
    "title": "Cloud Workload, Container and Kubernetes Security",
    "summary": "Container supply-chain security, Kubernetes RBAC/networking and serverless identity Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy.",
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
      "RBAC"
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
    "title": "Cloud Detection, Incident Response and Forensics",
    "summary": "Continuous posture, entitlement analysis, CIS controls and automated remediation Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite.",
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
      "configuration drift"
    ],
    "toolsArsenal": [
      "Prowler",
      "ScoutSuite",
      "CloudSploit",
      "AWS Config",
      "AWS Security Hub",
      "IAM Access Analyzer",
      "Azure Policy",
      "Microsoft Defender for Cloud",
      "CloudTrail",
      "GuardDuty"
    ],
    "cliCommands": [
      "prowler aws",
      "prowler aws --compliance cis_5.0_aws",
      "scout aws",
      "aws securityhub get-findings",
      "aws iam generate-service-last-accessed-details --arn ARN",
      "az policy assignment list",
      "aws cloudtrail lookup-events --max-results 50",
      "aws guardduty list-findings"
    ],
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"
  }
];

export {modulesData};
export default modulesData;
