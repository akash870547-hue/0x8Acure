/** Canonical 0x8Acure curriculum: 15 CHFI v11 + 6 Cloud Security Engineering modules. */
const modulesData=[
  {
    "id": "chfi-01",
    "track": "CHFI v11",
    "moduleNumber": 1,
    "title": "Computer Forensics in Today's World",
    "summary": "Computer Forensics in Today's World: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes digital evidence characteristics, order of volatility, forensic workstation design, case scoping and authorization, evidence integrity.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Digital evidence model & admissibility",
        "architecture": "Acquisition separates source from analysis through write blocking, bit-stream imaging and cryptographic verification. RAW/DD is transparent; E01 adds metadata and compression.",
        "artifacts": "Record source ID, examiner, acquisition time, tool version, image hash and verification result; keep the original immutable.",
        "offensiveDefensive": "Balance volatility against integrity, document collection decisions and never mount original evidence read-write.",
        "commands": [
          "dc3dd if=/dev/sdX of=evidence.dd hash=sha256 log=acq.log",
          "ewfacquire /dev/sdX",
          "sha256sum evidence.dd"
        ],
        "scenario": "During a Computer Forensics in Today's World investigation, analysts found activity around Digital evidence model & admissibility. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Order of volatility and live response",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Computer Forensics in Today's World investigation, analysts found activity around Order of volatility and live response. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Forensic workstation architecture",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Computer Forensics in Today's World investigation, analysts found activity around Forensic workstation architecture. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Case scoping, authorization & chain of custody",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Computer Forensics in Today's World investigation, analysts found activity around Case scoping, authorization & chain of custody. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Forensic readiness and repeatability",
        "architecture": "Anti-forensics manipulates timestamps, logs, allocation or recovery paths; NTFS retains secondary evidence and VSS can preserve earlier states.",
        "artifacts": "Compare $STANDARD_INFORMATION, $FILE_NAME, $UsnJrnl:$J, $LogFile, Prefetch, Amcache, EVTX gaps and VSS.",
        "offensiveDefensive": "Timestomping shows timestamp disagreement, log clearing shows gaps, and wiping can leave slack or snapshot traces; preserve media and capture volatile evidence first.",
        "commands": [
          "MFTECmd.exe -f $MFT --csv output",
          "vssadmin list shadows",
          "fls -r -p image.raw | grep -i deleted"
        ],
        "scenario": "During a Computer Forensics in Today's World investigation, analysts found activity around Forensic readiness and repeatability. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-02",
    "track": "CHFI v11",
    "moduleNumber": 2,
    "title": "Computer Forensics Investigation Process",
    "summary": "Computer Forensics Investigation Process: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes first responder procedure, scene documentation, live response, volatile collection, dead-box acquisition.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "First responder workflow",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Computer Forensics Investigation Process investigation, analysts found activity around First responder workflow. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Volatile evidence acquisition",
        "architecture": "Acquisition separates source from analysis through write blocking, bit-stream imaging and cryptographic verification. RAW/DD is transparent; E01 adds metadata and compression.",
        "artifacts": "Record source ID, examiner, acquisition time, tool version, image hash and verification result; keep the original immutable.",
        "offensiveDefensive": "Balance volatility against integrity, document collection decisions and never mount original evidence read-write.",
        "commands": [
          "dc3dd if=/dev/sdX of=evidence.dd hash=sha256 log=acq.log",
          "ewfacquire /dev/sdX",
          "sha256sum evidence.dd"
        ],
        "scenario": "During a Computer Forensics Investigation Process investigation, analysts found activity around Volatile evidence acquisition. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Dead-box imaging & verification",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Computer Forensics Investigation Process investigation, analysts found activity around Dead-box imaging & verification. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Examination, analysis & timeline correlation",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Computer Forensics Investigation Process investigation, analysts found activity around Examination, analysis & timeline correlation. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Reporting and expert testimony",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Computer Forensics Investigation Process investigation, analysts found activity around Reporting and expert testimony. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-03",
    "track": "CHFI v11",
    "moduleNumber": 3,
    "title": "Understanding Hard Disks and File Systems",
    "summary": "Understanding Hard Disks and File Systems: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes evidence identifiers, custody transfers, evidence packaging, MD5/SHA-256 verification, authenticity.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Disk geometry, MBR & GPT",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Understanding Hard Disks and File Systems investigation, analysts found activity around Disk geometry, MBR & GPT. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "NTFS internals, MFT records & attributes",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Understanding Hard Disks and File Systems investigation, analysts found activity around NTFS internals, MFT records & attributes. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "NTFS indexes, runlists & deleted-file recovery",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Understanding Hard Disks and File Systems investigation, analysts found activity around NTFS indexes, runlists & deleted-file recovery. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "VSS shadow copies and carving",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Understanding Hard Disks and File Systems investigation, analysts found activity around VSS shadow copies and carving. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "ext4/APFS filesystem structures",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Understanding Hard Disks and File Systems investigation, analysts found activity around ext4/APFS filesystem structures. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-04",
    "track": "CHFI v11",
    "moduleNumber": 4,
    "title": "Data Acquisition and Duplication",
    "summary": "Data Acquisition and Duplication: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes MBR, GPT, protective MBR, FAT32, exFAT.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Write blockers and acquisition modes",
        "architecture": "Acquisition separates source from analysis through write blocking, bit-stream imaging and cryptographic verification. RAW/DD is transparent; E01 adds metadata and compression.",
        "artifacts": "Record source ID, examiner, acquisition time, tool version, image hash and verification result; keep the original immutable.",
        "offensiveDefensive": "Balance volatility against integrity, document collection decisions and never mount original evidence read-write.",
        "commands": [
          "dc3dd if=/dev/sdX of=evidence.dd hash=sha256 log=acq.log",
          "ewfacquire /dev/sdX",
          "sha256sum evidence.dd"
        ],
        "scenario": "During a Data Acquisition and Duplication investigation, analysts found activity around Write blockers and acquisition modes. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "RAW/DD and E01 evidence containers",
        "architecture": "Kubernetes separates API server/controllers from runtimes; RBAC maps identities to verbs. Privileged pods and hostPath mounts can cross container isolation.",
        "artifacts": "Inspect audit logs, API objects, service-account tokens, pod specs and /var/log/containers or /var/log/pods.",
        "offensiveDefensive": "A common escalation is compromised workload, token, excessive RBAC, secret modification and privileged pod; constrain RBAC and Pod Security and alert on exec.",
        "commands": [
          "kubectl auth can-i --list --as=system:serviceaccount:NAMESPACE:SA",
          "kubectl get pods -A -o wide",
          "kubectl get events -A --sort-by=.lastTimestamp"
        ],
        "scenario": "During a Data Acquisition and Duplication investigation, analysts found activity around RAW/DD and E01 evidence containers. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Hashing, verification and provenance",
        "architecture": "Acquisition separates source from analysis through write blocking, bit-stream imaging and cryptographic verification. RAW/DD is transparent; E01 adds metadata and compression.",
        "artifacts": "Record source ID, examiner, acquisition time, tool version, image hash and verification result; keep the original immutable.",
        "offensiveDefensive": "Balance volatility against integrity, document collection decisions and never mount original evidence read-write.",
        "commands": [
          "dc3dd if=/dev/sdX of=evidence.dd hash=sha256 log=acq.log",
          "ewfacquire /dev/sdX",
          "sha256sum evidence.dd"
        ],
        "scenario": "During a Data Acquisition and Duplication investigation, analysts found activity around Hashing, verification and provenance. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Partition-aware acquisition",
        "architecture": "Acquisition separates source from analysis through write blocking, bit-stream imaging and cryptographic verification. RAW/DD is transparent; E01 adds metadata and compression.",
        "artifacts": "Record source ID, examiner, acquisition time, tool version, image hash and verification result; keep the original immutable.",
        "offensiveDefensive": "Balance volatility against integrity, document collection decisions and never mount original evidence read-write.",
        "commands": [
          "dc3dd if=/dev/sdX of=evidence.dd hash=sha256 log=acq.log",
          "ewfacquire /dev/sdX",
          "sha256sum evidence.dd"
        ],
        "scenario": "During a Data Acquisition and Duplication investigation, analysts found activity around Partition-aware acquisition. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Selective and live acquisition trade-offs",
        "architecture": "Acquisition separates source from analysis through write blocking, bit-stream imaging and cryptographic verification. RAW/DD is transparent; E01 adds metadata and compression.",
        "artifacts": "Record source ID, examiner, acquisition time, tool version, image hash and verification result; keep the original immutable.",
        "offensiveDefensive": "Balance volatility against integrity, document collection decisions and never mount original evidence read-write.",
        "commands": [
          "dc3dd if=/dev/sdX of=evidence.dd hash=sha256 log=acq.log",
          "ewfacquire /dev/sdX",
          "sha256sum evidence.dd"
        ],
        "scenario": "During a Data Acquisition and Duplication investigation, analysts found activity around Selective and live acquisition trade-offs. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-05",
    "track": "CHFI v11",
    "moduleNumber": 5,
    "title": "Defeating Anti-Forensics Techniques",
    "summary": "Defeating Anti-Forensics Techniques: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes NTFS $MFT, $UsnJrnl, SYSTEM hive, SOFTWARE hive, SAM.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Timestomping and timestamp triage",
        "architecture": "Anti-forensics manipulates timestamps, logs, allocation or recovery paths; NTFS retains secondary evidence and VSS can preserve earlier states.",
        "artifacts": "Compare $STANDARD_INFORMATION, $FILE_NAME, $UsnJrnl:$J, $LogFile, Prefetch, Amcache, EVTX gaps and VSS.",
        "offensiveDefensive": "Timestomping shows timestamp disagreement, log clearing shows gaps, and wiping can leave slack or snapshot traces; preserve media and capture volatile evidence first.",
        "commands": [
          "MFTECmd.exe -f $MFT --csv output",
          "vssadmin list shadows",
          "fls -r -p image.raw | grep -i deleted"
        ],
        "scenario": "During a Defeating Anti-Forensics Techniques investigation, analysts found activity around Timestomping and timestamp triage. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Log clearing and artifact suppression",
        "architecture": "Anti-forensics manipulates timestamps, logs, allocation or recovery paths; NTFS retains secondary evidence and VSS can preserve earlier states.",
        "artifacts": "Compare $STANDARD_INFORMATION, $FILE_NAME, $UsnJrnl:$J, $LogFile, Prefetch, Amcache, EVTX gaps and VSS.",
        "offensiveDefensive": "Timestomping shows timestamp disagreement, log clearing shows gaps, and wiping can leave slack or snapshot traces; preserve media and capture volatile evidence first.",
        "commands": [
          "MFTECmd.exe -f $MFT --csv output",
          "vssadmin list shadows",
          "fls -r -p image.raw | grep -i deleted"
        ],
        "scenario": "During a Defeating Anti-Forensics Techniques investigation, analysts found activity around Log clearing and artifact suppression. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Secure deletion, wiping and file slack",
        "architecture": "Envelope encryption separates data keys from key-encryption keys; KMS audits encrypt/decrypt/grant operations and key policies govern use.",
        "artifacts": "Review KMS policies, grants, CloudTrail, object versions, backups and secret-manager audit logs.",
        "offensiveDefensive": "Attackers seek broad decrypt rights or cross-account grants; restrict policies, rotate credentials and alert on anomalous decrypt volume.",
        "commands": [
          "aws kms list-grants --key-id KEY_ID",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com",
          "aws s3api list-object-versions --bucket BUCKET"
        ],
        "scenario": "During a Defeating Anti-Forensics Techniques investigation, analysts found activity around Secure deletion, wiping and file slack. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "VSS, $UsnJrnl and $LogFile anti-forensics",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Defeating Anti-Forensics Techniques investigation, analysts found activity around VSS, $UsnJrnl and $LogFile anti-forensics. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Anti-forensic detection and corroboration",
        "architecture": "Anti-forensics manipulates timestamps, logs, allocation or recovery paths; NTFS retains secondary evidence and VSS can preserve earlier states.",
        "artifacts": "Compare $STANDARD_INFORMATION, $FILE_NAME, $UsnJrnl:$J, $LogFile, Prefetch, Amcache, EVTX gaps and VSS.",
        "offensiveDefensive": "Timestomping shows timestamp disagreement, log clearing shows gaps, and wiping can leave slack or snapshot traces; preserve media and capture volatile evidence first.",
        "commands": [
          "MFTECmd.exe -f $MFT --csv output",
          "vssadmin list shadows",
          "fls -r -p image.raw | grep -i deleted"
        ],
        "scenario": "During a Defeating Anti-Forensics Techniques investigation, analysts found activity around Anti-forensic detection and corroboration. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-06",
    "track": "CHFI v11",
    "moduleNumber": 6,
    "title": "Windows Forensics",
    "summary": "Windows Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes write blockers, RAW/DD, E01/Ex01, image segmentation, acquisition logs.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Windows event logging and EVTX internals",
        "architecture": "EVTX stores chunked binary event records, registry hives use bins/cells, and Prefetch/Amcache preserve execution context.",
        "artifacts": "C:\\\\Windows\\\\System32\\\\winevt\\\\Logs\\\\Security.evtx, C:\\\\Windows\\\\Prefetch, C:\\\\Windows\\\\AppCompat\\\\Programs\\\\Amcache.hve and SYSTEM/SOFTWARE/NTUSER.DAT are high-value artifacts.",
        "offensiveDefensive": "Correlate Security 4688, PowerShell/Sysmon, Prefetch and Amcache with process ancestry and timeline gaps; log clearing should be treated as an investigative signal.",
        "commands": [
          "wevtutil qe Security /q:*[System[(EventID=4688)]] /f:text /c:20",
          "MFTECmd.exe -f C:\\\\$MFT --csv output",
          "RECmd.exe -f NTUSER.DAT --knows"
        ],
        "scenario": "During a Windows Forensics investigation, analysts found activity around Windows event logging and EVTX internals. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Registry hives and transaction logs",
        "architecture": "EVTX stores chunked binary event records, registry hives use bins/cells, and Prefetch/Amcache preserve execution context.",
        "artifacts": "C:\\\\Windows\\\\System32\\\\winevt\\\\Logs\\\\Security.evtx, C:\\\\Windows\\\\Prefetch, C:\\\\Windows\\\\AppCompat\\\\Programs\\\\Amcache.hve and SYSTEM/SOFTWARE/NTUSER.DAT are high-value artifacts.",
        "offensiveDefensive": "Correlate Security 4688, PowerShell/Sysmon, Prefetch and Amcache with process ancestry and timeline gaps; log clearing should be treated as an investigative signal.",
        "commands": [
          "wevtutil qe Security /q:*[System[(EventID=4688)]] /f:text /c:20",
          "MFTECmd.exe -f C:\\\\$MFT --csv output",
          "RECmd.exe -f NTUSER.DAT --knows"
        ],
        "scenario": "During a Windows Forensics investigation, analysts found activity around Registry hives and transaction logs. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Prefetch, Amcache and execution artifacts",
        "architecture": "EVTX stores chunked binary event records, registry hives use bins/cells, and Prefetch/Amcache preserve execution context.",
        "artifacts": "C:\\\\Windows\\\\System32\\\\winevt\\\\Logs\\\\Security.evtx, C:\\\\Windows\\\\Prefetch, C:\\\\Windows\\\\AppCompat\\\\Programs\\\\Amcache.hve and SYSTEM/SOFTWARE/NTUSER.DAT are high-value artifacts.",
        "offensiveDefensive": "Correlate Security 4688, PowerShell/Sysmon, Prefetch and Amcache with process ancestry and timeline gaps; log clearing should be treated as an investigative signal.",
        "commands": [
          "wevtutil qe Security /q:*[System[(EventID=4688)]] /f:text /c:20",
          "MFTECmd.exe -f C:\\\\$MFT --csv output",
          "RECmd.exe -f NTUSER.DAT --knows"
        ],
        "scenario": "During a Windows Forensics investigation, analysts found activity around Prefetch, Amcache and execution artifacts. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Shell, LNK, Jump Lists and browser artifacts",
        "architecture": "EVTX stores chunked binary event records, registry hives use bins/cells, and Prefetch/Amcache preserve execution context.",
        "artifacts": "C:\\\\Windows\\\\System32\\\\winevt\\\\Logs\\\\Security.evtx, C:\\\\Windows\\\\Prefetch, C:\\\\Windows\\\\AppCompat\\\\Programs\\\\Amcache.hve and SYSTEM/SOFTWARE/NTUSER.DAT are high-value artifacts.",
        "offensiveDefensive": "Correlate Security 4688, PowerShell/Sysmon, Prefetch and Amcache with process ancestry and timeline gaps; log clearing should be treated as an investigative signal.",
        "commands": [
          "wevtutil qe Security /q:*[System[(EventID=4688)]] /f:text /c:20",
          "MFTECmd.exe -f C:\\\\$MFT --csv output",
          "RECmd.exe -f NTUSER.DAT --knows"
        ],
        "scenario": "During a Windows Forensics investigation, analysts found activity around Shell, LNK, Jump Lists and browser artifacts. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Windows persistence and privilege-escalation traces",
        "architecture": "EVTX stores chunked binary event records, registry hives use bins/cells, and Prefetch/Amcache preserve execution context.",
        "artifacts": "C:\\\\Windows\\\\System32\\\\winevt\\\\Logs\\\\Security.evtx, C:\\\\Windows\\\\Prefetch, C:\\\\Windows\\\\AppCompat\\\\Programs\\\\Amcache.hve and SYSTEM/SOFTWARE/NTUSER.DAT are high-value artifacts.",
        "offensiveDefensive": "Correlate Security 4688, PowerShell/Sysmon, Prefetch and Amcache with process ancestry and timeline gaps; log clearing should be treated as an investigative signal.",
        "commands": [
          "wevtutil qe Security /q:*[System[(EventID=4688)]] /f:text /c:20",
          "MFTECmd.exe -f C:\\\\$MFT --csv output",
          "RECmd.exe -f NTUSER.DAT --knows"
        ],
        "scenario": "During a Windows Forensics investigation, analysts found activity around Windows persistence and privilege-escalation traces. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-07",
    "track": "CHFI v11",
    "moduleNumber": 7,
    "title": "Linux and Mac Forensics",
    "summary": "Linux and Mac Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes RAM acquisition, Volatility 3, windows.pslist, windows.pstree, windows.psscan.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Linux ext4 forensic structures",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Linux and Mac Forensics investigation, analysts found activity around Linux ext4 forensic structures. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Linux authentication and shell history",
        "architecture": "ext4 uses inode/directory metadata and journals; APFS uses snapshots and copy-on-write metadata. systemd-journald and unified logging provide structured event streams.",
        "artifacts": "Linux: /var/log/auth.log, /var/log/secure, ~/.bash_history, /var/log/journal. macOS: /var/db, unified logs, launchd plists and APFS snapshots.",
        "offensiveDefensive": "Correlate authentication with process creation, cron/systemd/launchd changes and SSH keys to expose persistence or privilege escalation.",
        "commands": [
          "last -ai",
          "journalctl --since '24 hours ago' -o short-iso",
          "find /etc/systemd /etc/cron* -type f -mtime -7 -ls"
        ],
        "scenario": "During a Linux and Mac Forensics investigation, analysts found activity around Linux authentication and shell history. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "systemd, journal and process artifacts",
        "architecture": "ext4 uses inode/directory metadata and journals; APFS uses snapshots and copy-on-write metadata. systemd-journald and unified logging provide structured event streams.",
        "artifacts": "Linux: /var/log/auth.log, /var/log/secure, ~/.bash_history, /var/log/journal. macOS: /var/db, unified logs, launchd plists and APFS snapshots.",
        "offensiveDefensive": "Correlate authentication with process creation, cron/systemd/launchd changes and SSH keys to expose persistence or privilege escalation.",
        "commands": [
          "last -ai",
          "journalctl --since '24 hours ago' -o short-iso",
          "find /etc/systemd /etc/cron* -type f -mtime -7 -ls"
        ],
        "scenario": "During a Linux and Mac Forensics investigation, analysts found activity around systemd, journal and process artifacts. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "macOS APFS and unified logs",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Linux and Mac Forensics investigation, analysts found activity around macOS APFS and unified logs. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Linux/macOS persistence and privilege traces",
        "architecture": "ext4 uses inode/directory metadata and journals; APFS uses snapshots and copy-on-write metadata. systemd-journald and unified logging provide structured event streams.",
        "artifacts": "Linux: /var/log/auth.log, /var/log/secure, ~/.bash_history, /var/log/journal. macOS: /var/db, unified logs, launchd plists and APFS snapshots.",
        "offensiveDefensive": "Correlate authentication with process creation, cron/systemd/launchd changes and SSH keys to expose persistence or privilege escalation.",
        "commands": [
          "last -ai",
          "journalctl --since '24 hours ago' -o short-iso",
          "find /etc/systemd /etc/cron* -type f -mtime -7 -ls"
        ],
        "scenario": "During a Linux and Mac Forensics investigation, analysts found activity around Linux/macOS persistence and privilege traces. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-08",
    "track": "CHFI v11",
    "moduleNumber": 8,
    "title": "Network Forensics",
    "summary": "Network Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes /var/log/auth.log, journalctl, Bash/Zsh history, SSH authorized_keys, cron.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "PCAP layers and TCP session reconstruction",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Network Forensics investigation, analysts found activity around PCAP layers and TCP session reconstruction. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "DNS, DHCP and network identity artifacts",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Network Forensics investigation, analysts found activity around DNS, DHCP and network identity artifacts. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Zeek network metadata and detection",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Network Forensics investigation, analysts found activity around Zeek network metadata and detection. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "HTTP/TLS investigation and proxy traces",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Network Forensics investigation, analysts found activity around HTTP/TLS investigation and proxy traces. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Flow telemetry, beaconing and exfiltration",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Network Forensics investigation, analysts found activity around Flow telemetry, beaconing and exfiltration. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-09",
    "track": "CHFI v11",
    "moduleNumber": 9,
    "title": "Malware Forensics",
    "summary": "Malware Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes PCAP/PCAPNG, Ethernet, ARP, IPv4/IPv6, TCP/UDP.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "PE and ELF binary internals",
        "architecture": "PE exposes DOS/PE headers, sections and imports; ELF exposes program/section headers. Injection can keep malicious code resident without a normal file.",
        "artifacts": "Review hashes, YARA hits, process trees, loaded modules, services, autoruns and memory regions; executable private memory is a key pivot.",
        "offensiveDefensive": "Compare parent-child processes, unsigned modules, memory protections and C2 destinations, then isolate before volatile evidence is lost.",
        "commands": [
          "yara -r rules.yar suspicious/",
          "python vol.py -f mem.raw windows.malfind",
          "strings -a suspicious.exe | head -100"
        ],
        "scenario": "During a Malware Forensics investigation, analysts found activity around PE and ELF binary internals. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Static malware triage and YARA",
        "architecture": "PE exposes DOS/PE headers, sections and imports; ELF exposes program/section headers. Injection can keep malicious code resident without a normal file.",
        "artifacts": "Review hashes, YARA hits, process trees, loaded modules, services, autoruns and memory regions; executable private memory is a key pivot.",
        "offensiveDefensive": "Compare parent-child processes, unsigned modules, memory protections and C2 destinations, then isolate before volatile evidence is lost.",
        "commands": [
          "yara -r rules.yar suspicious/",
          "python vol.py -f mem.raw windows.malfind",
          "strings -a suspicious.exe | head -100"
        ],
        "scenario": "During a Malware Forensics investigation, analysts found activity around Static malware triage and YARA. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Process injection and memory-resident malware",
        "architecture": "PE exposes DOS/PE headers, sections and imports; ELF exposes program/section headers. Injection can keep malicious code resident without a normal file.",
        "artifacts": "Review hashes, YARA hits, process trees, loaded modules, services, autoruns and memory regions; executable private memory is a key pivot.",
        "offensiveDefensive": "Compare parent-child processes, unsigned modules, memory protections and C2 destinations, then isolate before volatile evidence is lost.",
        "commands": [
          "yara -r rules.yar suspicious/",
          "python vol.py -f mem.raw windows.malfind",
          "strings -a suspicious.exe | head -100"
        ],
        "scenario": "During a Malware Forensics investigation, analysts found activity around Process injection and memory-resident malware. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Persistence, C2 and behavioral telemetry",
        "architecture": "PE exposes DOS/PE headers, sections and imports; ELF exposes program/section headers. Injection can keep malicious code resident without a normal file.",
        "artifacts": "Review hashes, YARA hits, process trees, loaded modules, services, autoruns and memory regions; executable private memory is a key pivot.",
        "offensiveDefensive": "Compare parent-child processes, unsigned modules, memory protections and C2 destinations, then isolate before volatile evidence is lost.",
        "commands": [
          "yara -r rules.yar suspicious/",
          "python vol.py -f mem.raw windows.malfind",
          "strings -a suspicious.exe | head -100"
        ],
        "scenario": "During a Malware Forensics investigation, analysts found activity around Persistence, C2 and behavioral telemetry. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Sandboxing, reverse engineering and containment",
        "architecture": "PE exposes DOS/PE headers, sections and imports; ELF exposes program/section headers. Injection can keep malicious code resident without a normal file.",
        "artifacts": "Review hashes, YARA hits, process trees, loaded modules, services, autoruns and memory regions; executable private memory is a key pivot.",
        "offensiveDefensive": "Compare parent-child processes, unsigned modules, memory protections and C2 destinations, then isolate before volatile evidence is lost.",
        "commands": [
          "yara -r rules.yar suspicious/",
          "python vol.py -f mem.raw windows.malfind",
          "strings -a suspicious.exe | head -100"
        ],
        "scenario": "During a Malware Forensics investigation, analysts found activity around Sandboxing, reverse engineering and containment. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-10",
    "track": "CHFI v11",
    "moduleNumber": 10,
    "title": "Investigating Web Attacks",
    "summary": "Investigating Web Attacks: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Chromium History, Chromium Cookies, Login Data, cache, downloads.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "HTTP request anatomy and web server logs",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Investigating Web Attacks investigation, analysts found activity around HTTP request anatomy and web server logs. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Browser SQLite artifacts and web cache",
        "architecture": "HTTP carries method, path, headers and body; web frameworks add routing and session logs. Browser History/Cookies are SQLite stores and WAL can retain history.",
        "artifacts": "Inspect IIS/Apache/Nginx logs, reverse-proxy telemetry, browser History/Cookies and web roots for scripts and upload paths.",
        "offensiveDefensive": "Correlate exploit requests with process creation, filesystem changes, user agent and session identifiers to distinguish exploitation from routine traffic.",
        "commands": [
          "sqlite3 History 'select url,title,last_visit_time from urls order by last_visit_time desc limit 25;'",
          "grep -RniE 'cmd=|powershell|eval\\(|base64' /var/www 2>/dev/null",
          "zeek -r web-incident.pcap http.log"
        ],
        "scenario": "During a Investigating Web Attacks investigation, analysts found activity around Browser SQLite artifacts and web cache. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Web shell and server-side persistence",
        "architecture": "ext4 uses inode/directory metadata and journals; APFS uses snapshots and copy-on-write metadata. systemd-journald and unified logging provide structured event streams.",
        "artifacts": "Linux: /var/log/auth.log, /var/log/secure, ~/.bash_history, /var/log/journal. macOS: /var/db, unified logs, launchd plists and APFS snapshots.",
        "offensiveDefensive": "Correlate authentication with process creation, cron/systemd/launchd changes and SSH keys to expose persistence or privilege escalation.",
        "commands": [
          "last -ai",
          "journalctl --since '24 hours ago' -o short-iso",
          "find /etc/systemd /etc/cron* -type f -mtime -7 -ls"
        ],
        "scenario": "During a Investigating Web Attacks investigation, analysts found activity around Web shell and server-side persistence. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Authentication abuse and session attacks",
        "architecture": "HTTP carries method, path, headers and body; web frameworks add routing and session logs. Browser History/Cookies are SQLite stores and WAL can retain history.",
        "artifacts": "Inspect IIS/Apache/Nginx logs, reverse-proxy telemetry, browser History/Cookies and web roots for scripts and upload paths.",
        "offensiveDefensive": "Correlate exploit requests with process creation, filesystem changes, user agent and session identifiers to distinguish exploitation from routine traffic.",
        "commands": [
          "sqlite3 History 'select url,title,last_visit_time from urls order by last_visit_time desc limit 25;'",
          "grep -RniE 'cmd=|powershell|eval\\(|base64' /var/www 2>/dev/null",
          "zeek -r web-incident.pcap http.log"
        ],
        "scenario": "During a Investigating Web Attacks investigation, analysts found activity around Authentication abuse and session attacks. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Timeline correlation across app, host and network logs",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Investigating Web Attacks investigation, analysts found activity around Timeline correlation across app, host and network logs. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-11",
    "track": "CHFI v11",
    "moduleNumber": 11,
    "title": "Dark Web Forensics",
    "summary": "Dark Web Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Received headers, Return-Path, Message-ID, SPF, DKIM.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Tor architecture and onion routing",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a Dark Web Forensics investigation, analysts found activity around Tor architecture and onion routing. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Onion-service evidence and rendezvous metadata",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a Dark Web Forensics investigation, analysts found activity around Onion-service evidence and rendezvous metadata. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Browser and download artifacts",
        "architecture": "HTTP carries method, path, headers and body; web frameworks add routing and session logs. Browser History/Cookies are SQLite stores and WAL can retain history.",
        "artifacts": "Inspect IIS/Apache/Nginx logs, reverse-proxy telemetry, browser History/Cookies and web roots for scripts and upload paths.",
        "offensiveDefensive": "Correlate exploit requests with process creation, filesystem changes, user agent and session identifiers to distinguish exploitation from routine traffic.",
        "commands": [
          "sqlite3 History 'select url,title,last_visit_time from urls order by last_visit_time desc limit 25;'",
          "grep -RniE 'cmd=|powershell|eval\\(|base64' /var/www 2>/dev/null",
          "zeek -r web-incident.pcap http.log"
        ],
        "scenario": "During a Dark Web Forensics investigation, analysts found activity around Browser and download artifacts. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Cryptocurrency and marketplace traces",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a Dark Web Forensics investigation, analysts found activity around Cryptocurrency and marketplace traces. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Attribution limits, OPSEC failures and corroboration",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a Dark Web Forensics investigation, analysts found activity around Attribution limits, OPSEC failures and corroboration. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-12",
    "track": "CHFI v11",
    "moduleNumber": 12,
    "title": "Cloud Forensics",
    "summary": "Cloud Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes Android ADB, Android SQLite, application data, iOS backups, application containers.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Cloud evidence sources and acquisition boundaries",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Forensics investigation, analysts found activity around Cloud evidence sources and acquisition boundaries. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "CloudTrail, audit logs and identity context",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Forensics investigation, analysts found activity around CloudTrail, audit logs and identity context. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Cloud storage snapshots and object versioning",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a Cloud Forensics investigation, analysts found activity around Cloud storage snapshots and object versioning. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Cloud network telemetry and workload artifacts",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Cloud Forensics investigation, analysts found activity around Cloud network telemetry and workload artifacts. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Cloud-native timeline and cross-account correlation",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Forensics investigation, analysts found activity around Cloud-native timeline and cross-account correlation. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-13",
    "track": "CHFI v11",
    "moduleNumber": 13,
    "title": "Email and Social Media Forensics",
    "summary": "Email and Social Media Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes database audit logs, transaction logs, AWS CloudTrail, CloudWatch, S3 versions.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "RFC 5322 headers and mail transport",
        "architecture": "RFC 5322 headers encode message and transport context; MIME separates attachments, while PST/OST preserves mailbox structures.",
        "artifacts": "Collect raw .eml, PST/OST, mail logs, authentication records and attachment hashes; compare Received, Return-Path and SPF/DKIM/DMARC.",
        "offensiveDefensive": "Phishing analysis correlates headers, attachment behavior, URLs and endpoint/network telemetry before containment.",
        "commands": [
          "readpst -r -o extracted mailbox.pst",
          "exiftool suspicious_attachment",
          "grep -E '^(Received|Return-Path|Message-ID|Authentication-Results):' message.eml"
        ],
        "scenario": "During a Email and Social Media Forensics investigation, analysts found activity around RFC 5322 headers and mail transport. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "PST and OST mailbox structures",
        "architecture": "RFC 5322 headers encode message and transport context; MIME separates attachments, while PST/OST preserves mailbox structures.",
        "artifacts": "Collect raw .eml, PST/OST, mail logs, authentication records and attachment hashes; compare Received, Return-Path and SPF/DKIM/DMARC.",
        "offensiveDefensive": "Phishing analysis correlates headers, attachment behavior, URLs and endpoint/network telemetry before containment.",
        "commands": [
          "readpst -r -o extracted mailbox.pst",
          "exiftool suspicious_attachment",
          "grep -E '^(Received|Return-Path|Message-ID|Authentication-Results):' message.eml"
        ],
        "scenario": "During a Email and Social Media Forensics investigation, analysts found activity around PST and OST mailbox structures. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "SPF, DKIM, DMARC and spoofing analysis",
        "architecture": "RFC 5322 headers encode message and transport context; MIME separates attachments, while PST/OST preserves mailbox structures.",
        "artifacts": "Collect raw .eml, PST/OST, mail logs, authentication records and attachment hashes; compare Received, Return-Path and SPF/DKIM/DMARC.",
        "offensiveDefensive": "Phishing analysis correlates headers, attachment behavior, URLs and endpoint/network telemetry before containment.",
        "commands": [
          "readpst -r -o extracted mailbox.pst",
          "exiftool suspicious_attachment",
          "grep -E '^(Received|Return-Path|Message-ID|Authentication-Results):' message.eml"
        ],
        "scenario": "During a Email and Social Media Forensics investigation, analysts found activity around SPF, DKIM, DMARC and spoofing analysis. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Social-media acquisition and metadata",
        "architecture": "RFC 5322 headers encode message and transport context; MIME separates attachments, while PST/OST preserves mailbox structures.",
        "artifacts": "Collect raw .eml, PST/OST, mail logs, authentication records and attachment hashes; compare Received, Return-Path and SPF/DKIM/DMARC.",
        "offensiveDefensive": "Phishing analysis correlates headers, attachment behavior, URLs and endpoint/network telemetry before containment.",
        "commands": [
          "readpst -r -o extracted mailbox.pst",
          "exiftool suspicious_attachment",
          "grep -E '^(Received|Return-Path|Message-ID|Authentication-Results):' message.eml"
        ],
        "scenario": "During a Email and Social Media Forensics investigation, analysts found activity around Social-media acquisition and metadata. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Email timeline, attachment and link investigation",
        "architecture": "RFC 5322 headers encode message and transport context; MIME separates attachments, while PST/OST preserves mailbox structures.",
        "artifacts": "Collect raw .eml, PST/OST, mail logs, authentication records and attachment hashes; compare Received, Return-Path and SPF/DKIM/DMARC.",
        "offensiveDefensive": "Phishing analysis correlates headers, attachment behavior, URLs and endpoint/network telemetry before containment.",
        "commands": [
          "readpst -r -o extracted mailbox.pst",
          "exiftool suspicious_attachment",
          "grep -E '^(Received|Return-Path|Message-ID|Authentication-Results):' message.eml"
        ],
        "scenario": "During a Email and Social Media Forensics investigation, analysts found activity around Email timeline, attachment and link investigation. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-14",
    "track": "CHFI v11",
    "moduleNumber": 14,
    "title": "Mobile Forensics",
    "summary": "Mobile Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes initial triage, initial access, persistence, privilege escalation, lateral movement.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "Android partitions, ADB and app sandboxes",
        "architecture": "PE exposes DOS/PE headers, sections and imports; ELF exposes program/section headers. Injection can keep malicious code resident without a normal file.",
        "artifacts": "Review hashes, YARA hits, process trees, loaded modules, services, autoruns and memory regions; executable private memory is a key pivot.",
        "offensiveDefensive": "Compare parent-child processes, unsigned modules, memory protections and C2 destinations, then isolate before volatile evidence is lost.",
        "commands": [
          "yara -r rules.yar suspicious/",
          "python vol.py -f mem.raw windows.malfind",
          "strings -a suspicious.exe | head -100"
        ],
        "scenario": "During a Mobile Forensics investigation, analysts found activity around Android partitions, ADB and app sandboxes. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Android SQLite, WAL and journal artifacts",
        "architecture": "ext4 uses inode/directory metadata and journals; APFS uses snapshots and copy-on-write metadata. systemd-journald and unified logging provide structured event streams.",
        "artifacts": "Linux: /var/log/auth.log, /var/log/secure, ~/.bash_history, /var/log/journal. macOS: /var/db, unified logs, launchd plists and APFS snapshots.",
        "offensiveDefensive": "Correlate authentication with process creation, cron/systemd/launchd changes and SSH keys to expose persistence or privilege escalation.",
        "commands": [
          "last -ai",
          "journalctl --since '24 hours ago' -o short-iso",
          "find /etc/systemd /etc/cron* -type f -mtime -7 -ls"
        ],
        "scenario": "During a Mobile Forensics investigation, analysts found activity around Android SQLite, WAL and journal artifacts. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "iOS filesystem and backup evidence",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Mobile Forensics investigation, analysts found activity around iOS filesystem and backup evidence. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Mobile location, contacts and communications",
        "architecture": "Android exposes partitions and app sandboxes with SQLite WAL/journal artifacts; iOS evidence commonly comes from backups or app containers.",
        "artifacts": "Android: /data/data/<package>/databases and shared preferences; ADB exposes package and device properties. iOS: backup manifests and app containers.",
        "offensiveDefensive": "Correlate package history, permissions, app databases, device logs and network destinations while preserving acquisition hashes.",
        "commands": [
          "adb shell pm list packages -f",
          "adb shell getprop",
          "adb pull /data/data/<package>/databases ./evidence"
        ],
        "scenario": "During a Mobile Forensics investigation, analysts found activity around Mobile location, contacts and communications. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Mobile acquisition, encryption and integrity",
        "architecture": "Android exposes partitions and app sandboxes with SQLite WAL/journal artifacts; iOS evidence commonly comes from backups or app containers.",
        "artifacts": "Android: /data/data/<package>/databases and shared preferences; ADB exposes package and device properties. iOS: backup manifests and app containers.",
        "offensiveDefensive": "Correlate package history, permissions, app databases, device logs and network destinations while preserving acquisition hashes.",
        "commands": [
          "adb shell pm list packages -f",
          "adb shell getprop",
          "adb pull /data/data/<package>/databases ./evidence"
        ],
        "scenario": "During a Mobile Forensics investigation, analysts found activity around Mobile acquisition, encryption and integrity. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "chfi-15",
    "track": "CHFI v11",
    "moduleNumber": 15,
    "title": "IoT Forensics",
    "summary": "IoT Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification Curriculum basis: EC-Council CHFI v11 official course outline; practical focus includes report structure, scope, methodology, evidence inventory, hash verification.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb",
    "topicDeepDives": [
      {
        "title": "IoT firmware and flash storage",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a IoT Forensics investigation, analysts found activity around IoT firmware and flash storage. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "JTAG/UART and hardware acquisition",
        "architecture": "IoT evidence spans SPI/NAND flash, bootloaders, embedded Linux filesystems and telemetry protocols; firmware may contain SquashFS/JFFS2/UBIFS.",
        "artifacts": "Collect firmware, flash dumps, UART/JTAG output, MQTT/CoAP traffic and device logs; preserve raw flash before extraction.",
        "offensiveDefensive": "Compare firmware hashes, startup scripts, new binaries, configuration drift and outbound traffic to detect persistence or unauthorized control.",
        "commands": [
          "binwalk -Me firmware.bin",
          "strings -a firmware.bin | grep -Ei 'password|token|mqtt|http'",
          "tshark -r iot.pcap -Y 'mqtt || coap'"
        ],
        "scenario": "During a IoT Forensics investigation, analysts found activity around JTAG/UART and hardware acquisition. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "MQTT, CoAP and device network telemetry",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a IoT Forensics investigation, analysts found activity around MQTT, CoAP and device network telemetry. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Embedded Linux persistence and logs",
        "architecture": "ext4 uses inode/directory metadata and journals; APFS uses snapshots and copy-on-write metadata. systemd-journald and unified logging provide structured event streams.",
        "artifacts": "Linux: /var/log/auth.log, /var/log/secure, ~/.bash_history, /var/log/journal. macOS: /var/db, unified logs, launchd plists and APFS snapshots.",
        "offensiveDefensive": "Correlate authentication with process creation, cron/systemd/launchd changes and SSH keys to expose persistence or privilege escalation.",
        "commands": [
          "last -ai",
          "journalctl --since '24 hours ago' -o short-iso",
          "find /etc/systemd /etc/cron* -type f -mtime -7 -ls"
        ],
        "scenario": "During a IoT Forensics investigation, analysts found activity around Embedded Linux persistence and logs. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Firmware extraction, emulation and vulnerability triage",
        "architecture": "IoT evidence spans SPI/NAND flash, bootloaders, embedded Linux filesystems and telemetry protocols; firmware may contain SquashFS/JFFS2/UBIFS.",
        "artifacts": "Collect firmware, flash dumps, UART/JTAG output, MQTT/CoAP traffic and device logs; preserve raw flash before extraction.",
        "offensiveDefensive": "Compare firmware hashes, startup scripts, new binaries, configuration drift and outbound traffic to detect persistence or unauthorized control.",
        "commands": [
          "binwalk -Me firmware.bin",
          "strings -a firmware.bin | grep -Ei 'password|token|mqtt|http'",
          "tshark -r iot.pcap -Y 'mqtt || coap'"
        ],
        "scenario": "During a IoT Forensics investigation, analysts found activity around Firmware extraction, emulation and vulnerability triage. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "cloud-01",
    "track": "Cloud Security Engineering",
    "moduleNumber": 1,
    "title": "Cloud Architecture and Shared Responsibility",
    "summary": "Cloud Architecture and Shared Responsibility: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IaaS/PaaS/SaaS, shared responsibility, control plane, data plane, management plane.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw",
    "topicDeepDives": [
      {
        "title": "IaaS, PaaS and SaaS trust boundaries",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Architecture and Shared Responsibility investigation, analysts found activity around IaaS, PaaS and SaaS trust boundaries. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Shared responsibility and control ownership",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Architecture and Shared Responsibility investigation, analysts found activity around Shared responsibility and control ownership. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Cloud account, region and resource hierarchy",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Architecture and Shared Responsibility investigation, analysts found activity around Cloud account, region and resource hierarchy. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Identity, network and data-plane architecture",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Cloud Architecture and Shared Responsibility investigation, analysts found activity around Identity, network and data-plane architecture. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Threat modeling multi-tenant cloud workloads",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Architecture and Shared Responsibility investigation, analysts found activity around Threat modeling multi-tenant cloud workloads. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "cloud-02",
    "track": "Cloud Security Engineering",
    "moduleNumber": 2,
    "title": "Cloud IAM and Identity Federation",
    "summary": "Cloud IAM and Identity Federation: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes IAM users/groups/roles, identity policies, resource policies, explicit deny, STS AssumeRole.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw",
    "topicDeepDives": [
      {
        "title": "IAM principals, policies and evaluation",
        "architecture": "IAM evaluates principals, actions, resources and conditions; STS issues temporary credentials through trust relationships.",
        "artifacts": "Review IAM policies, CloudTrail AssumeRole events, trust policies and Access Analyzer findings; inspect IMDS configuration for EC2 workloads.",
        "offensiveDefensive": "A PassRole chain can grant execution under an over-privileged service role; also inspect weak AssumeRole trust and IMDS credential theft.",
        "commands": [
          "aws iam simulate-principal-policy --policy-source-arn ARN --action-names s3:GetObject",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole",
          "aws iam get-role --role-name ROLE"
        ],
        "scenario": "During a Cloud IAM and Identity Federation investigation, analysts found activity around IAM principals, policies and evaluation. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "STS AssumeRole and trust policies",
        "architecture": "IAM evaluates principals, actions, resources and conditions; STS issues temporary credentials through trust relationships.",
        "artifacts": "Review IAM policies, CloudTrail AssumeRole events, trust policies and Access Analyzer findings; inspect IMDS configuration for EC2 workloads.",
        "offensiveDefensive": "A PassRole chain can grant execution under an over-privileged service role; also inspect weak AssumeRole trust and IMDS credential theft.",
        "commands": [
          "aws iam simulate-principal-policy --policy-source-arn ARN --action-names s3:GetObject",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole",
          "aws iam get-role --role-name ROLE"
        ],
        "scenario": "During a Cloud IAM and Identity Federation investigation, analysts found activity around STS AssumeRole and trust policies. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "PassRole escalation chains",
        "architecture": "IAM evaluates principals, actions, resources and conditions; STS issues temporary credentials through trust relationships.",
        "artifacts": "Review IAM policies, CloudTrail AssumeRole events, trust policies and Access Analyzer findings; inspect IMDS configuration for EC2 workloads.",
        "offensiveDefensive": "A PassRole chain can grant execution under an over-privileged service role; also inspect weak AssumeRole trust and IMDS credential theft.",
        "commands": [
          "aws iam simulate-principal-policy --policy-source-arn ARN --action-names s3:GetObject",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole",
          "aws iam get-role --role-name ROLE"
        ],
        "scenario": "During a Cloud IAM and Identity Federation investigation, analysts found activity around PassRole escalation chains. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "IMDSv2 and workload credential theft",
        "architecture": "IAM evaluates principals, actions, resources and conditions; STS issues temporary credentials through trust relationships.",
        "artifacts": "Review IAM policies, CloudTrail AssumeRole events, trust policies and Access Analyzer findings; inspect IMDS configuration for EC2 workloads.",
        "offensiveDefensive": "A PassRole chain can grant execution under an over-privileged service role; also inspect weak AssumeRole trust and IMDS credential theft.",
        "commands": [
          "aws iam simulate-principal-policy --policy-source-arn ARN --action-names s3:GetObject",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole",
          "aws iam get-role --role-name ROLE"
        ],
        "scenario": "During a Cloud IAM and Identity Federation investigation, analysts found activity around IMDSv2 and workload credential theft. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Federation, SSO and conditional access",
        "architecture": "IAM evaluates principals, actions, resources and conditions; STS issues temporary credentials through trust relationships.",
        "artifacts": "Review IAM policies, CloudTrail AssumeRole events, trust policies and Access Analyzer findings; inspect IMDS configuration for EC2 workloads.",
        "offensiveDefensive": "A PassRole chain can grant execution under an over-privileged service role; also inspect weak AssumeRole trust and IMDS credential theft.",
        "commands": [
          "aws iam simulate-principal-policy --policy-source-arn ARN --action-names s3:GetObject",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole",
          "aws iam get-role --role-name ROLE"
        ],
        "scenario": "During a Cloud IAM and Identity Federation investigation, analysts found activity around Federation, SSO and conditional access. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "cloud-03",
    "track": "Cloud Security Engineering",
    "moduleNumber": 3,
    "title": "Cloud Network Security",
    "summary": "Cloud Network Security: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes VPC/VNet, public/private subnets, route tables, internet gateways, NAT.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw",
    "topicDeepDives": [
      {
        "title": "VPC and VNet routing and segmentation",
        "architecture": "VPC/VNet routing, subnets, security groups/NACLs and private endpoints form layered controls; stateful and stateless controls behave differently.",
        "artifacts": "Collect flow logs, route tables, security-group/NACL rules, load-balancer logs, DNS and WAF telemetry; preserve rule state at incident time.",
        "offensiveDefensive": "Reconstruct source-to-destination flows and test whether exposed services or permissive egress enabled lateral movement; harden segmentation and egress.",
        "commands": [
          "aws ec2 describe-security-groups --group-ids sg-12345678",
          "aws ec2 describe-route-tables",
          "aws logs filter-log-events --log-group-name /vpc/flow-logs --max-items 50"
        ],
        "scenario": "During a Cloud Network Security investigation, analysts found activity around VPC and VNet routing and segmentation. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Security groups, NACLs and firewall state",
        "architecture": "VPC/VNet routing, subnets, security groups/NACLs and private endpoints form layered controls; stateful and stateless controls behave differently.",
        "artifacts": "Collect flow logs, route tables, security-group/NACL rules, load-balancer logs, DNS and WAF telemetry; preserve rule state at incident time.",
        "offensiveDefensive": "Reconstruct source-to-destination flows and test whether exposed services or permissive egress enabled lateral movement; harden segmentation and egress.",
        "commands": [
          "aws ec2 describe-security-groups --group-ids sg-12345678",
          "aws ec2 describe-route-tables",
          "aws logs filter-log-events --log-group-name /vpc/flow-logs --max-items 50"
        ],
        "scenario": "During a Cloud Network Security investigation, analysts found activity around Security groups, NACLs and firewall state. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Private endpoints, DNS and egress control",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Cloud Network Security investigation, analysts found activity around Private endpoints, DNS and egress control. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Flow logs, packet telemetry and detection",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Cloud Network Security investigation, analysts found activity around Flow logs, packet telemetry and detection. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Cloud load balancers, WAF and DDoS controls",
        "architecture": "VPC/VNet routing, subnets, security groups/NACLs and private endpoints form layered controls; stateful and stateless controls behave differently.",
        "artifacts": "Collect flow logs, route tables, security-group/NACL rules, load-balancer logs, DNS and WAF telemetry; preserve rule state at incident time.",
        "offensiveDefensive": "Reconstruct source-to-destination flows and test whether exposed services or permissive egress enabled lateral movement; harden segmentation and egress.",
        "commands": [
          "aws ec2 describe-security-groups --group-ids sg-12345678",
          "aws ec2 describe-route-tables",
          "aws logs filter-log-events --log-group-name /vpc/flow-logs --max-items 50"
        ],
        "scenario": "During a Cloud Network Security investigation, analysts found activity around Cloud load balancers, WAF and DDoS controls. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "cloud-04",
    "track": "Cloud Security Engineering",
    "moduleNumber": 4,
    "title": "Cloud Data Protection and Key Management",
    "summary": "Cloud Data Protection and Key Management: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes encryption at rest, encryption in transit, TLS, envelope encryption, DEK/KEK.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw",
    "topicDeepDives": [
      {
        "title": "Envelope encryption and KMS key hierarchy",
        "architecture": "Envelope encryption separates data keys from key-encryption keys; KMS audits encrypt/decrypt/grant operations and key policies govern use.",
        "artifacts": "Review KMS policies, grants, CloudTrail, object versions, backups and secret-manager audit logs.",
        "offensiveDefensive": "Attackers seek broad decrypt rights or cross-account grants; restrict policies, rotate credentials and alert on anomalous decrypt volume.",
        "commands": [
          "aws kms list-grants --key-id KEY_ID",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com",
          "aws s3api list-object-versions --bucket BUCKET"
        ],
        "scenario": "During a Cloud Data Protection and Key Management investigation, analysts found activity around Envelope encryption and KMS key hierarchy. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Object storage encryption and versioning",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a Cloud Data Protection and Key Management investigation, analysts found activity around Object storage encryption and versioning. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Secrets, credentials and rotation",
        "architecture": "Envelope encryption separates data keys from key-encryption keys; KMS audits encrypt/decrypt/grant operations and key policies govern use.",
        "artifacts": "Review KMS policies, grants, CloudTrail, object versions, backups and secret-manager audit logs.",
        "offensiveDefensive": "Attackers seek broad decrypt rights or cross-account grants; restrict policies, rotate credentials and alert on anomalous decrypt volume.",
        "commands": [
          "aws kms list-grants --key-id KEY_ID",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com",
          "aws s3api list-object-versions --bucket BUCKET"
        ],
        "scenario": "During a Cloud Data Protection and Key Management investigation, analysts found activity around Secrets, credentials and rotation. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Key policies, grants and cross-account access",
        "architecture": "Envelope encryption separates data keys from key-encryption keys; KMS audits encrypt/decrypt/grant operations and key policies govern use.",
        "artifacts": "Review KMS policies, grants, CloudTrail, object versions, backups and secret-manager audit logs.",
        "offensiveDefensive": "Attackers seek broad decrypt rights or cross-account grants; restrict policies, rotate credentials and alert on anomalous decrypt volume.",
        "commands": [
          "aws kms list-grants --key-id KEY_ID",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com",
          "aws s3api list-object-versions --bucket BUCKET"
        ],
        "scenario": "During a Cloud Data Protection and Key Management investigation, analysts found activity around Key policies, grants and cross-account access. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Data loss prevention, backups and deletion controls",
        "architecture": "Envelope encryption separates data keys from key-encryption keys; KMS audits encrypt/decrypt/grant operations and key policies govern use.",
        "artifacts": "Review KMS policies, grants, CloudTrail, object versions, backups and secret-manager audit logs.",
        "offensiveDefensive": "Attackers seek broad decrypt rights or cross-account grants; restrict policies, rotate credentials and alert on anomalous decrypt volume.",
        "commands": [
          "aws kms list-grants --key-id KEY_ID",
          "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com",
          "aws s3api list-object-versions --bucket BUCKET"
        ],
        "scenario": "During a Cloud Data Protection and Key Management investigation, analysts found activity around Data loss prevention, backups and deletion controls. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "cloud-05",
    "track": "Cloud Security Engineering",
    "moduleNumber": 5,
    "title": "Cloud Workload, Container and Kubernetes Security",
    "summary": "Cloud Workload, Container and Kubernetes Security: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes image layers, minimal bases, image signing, SBOM, Trivy.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw",
    "topicDeepDives": [
      {
        "title": "Container image layers and registries",
        "architecture": "Kubernetes separates API server/controllers from runtimes; RBAC maps identities to verbs. Privileged pods and hostPath mounts can cross container isolation.",
        "artifacts": "Inspect audit logs, API objects, service-account tokens, pod specs and /var/log/containers or /var/log/pods.",
        "offensiveDefensive": "A common escalation is compromised workload, token, excessive RBAC, secret modification and privileged pod; constrain RBAC and Pod Security and alert on exec.",
        "commands": [
          "kubectl auth can-i --list --as=system:serviceaccount:NAMESPACE:SA",
          "kubectl get pods -A -o wide",
          "kubectl get events -A --sort-by=.lastTimestamp"
        ],
        "scenario": "During a Cloud Workload, Container and Kubernetes Security investigation, analysts found activity around Container image layers and registries. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Kubernetes control plane and API",
        "architecture": "Kubernetes separates API server/controllers from runtimes; RBAC maps identities to verbs. Privileged pods and hostPath mounts can cross container isolation.",
        "artifacts": "Inspect audit logs, API objects, service-account tokens, pod specs and /var/log/containers or /var/log/pods.",
        "offensiveDefensive": "A common escalation is compromised workload, token, excessive RBAC, secret modification and privileged pod; constrain RBAC and Pod Security and alert on exec.",
        "commands": [
          "kubectl auth can-i --list --as=system:serviceaccount:NAMESPACE:SA",
          "kubectl get pods -A -o wide",
          "kubectl get events -A --sort-by=.lastTimestamp"
        ],
        "scenario": "During a Cloud Workload, Container and Kubernetes Security investigation, analysts found activity around Kubernetes control plane and API. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "RBAC, service accounts and admission",
        "architecture": "Kubernetes separates API server/controllers from runtimes; RBAC maps identities to verbs. Privileged pods and hostPath mounts can cross container isolation.",
        "artifacts": "Inspect audit logs, API objects, service-account tokens, pod specs and /var/log/containers or /var/log/pods.",
        "offensiveDefensive": "A common escalation is compromised workload, token, excessive RBAC, secret modification and privileged pod; constrain RBAC and Pod Security and alert on exec.",
        "commands": [
          "kubectl auth can-i --list --as=system:serviceaccount:NAMESPACE:SA",
          "kubectl get pods -A -o wide",
          "kubectl get events -A --sort-by=.lastTimestamp"
        ],
        "scenario": "During a Cloud Workload, Container and Kubernetes Security investigation, analysts found activity around RBAC, service accounts and admission. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Runtime isolation, namespaces and escape indicators",
        "architecture": "Tor uses layered encryption and multi-hop circuits; onion services use rendezvous mechanisms, so endpoint evidence is usually more useful than raw network attribution.",
        "artifacts": "Prioritize Tor Browser history, downloads, cookies, local storage and configuration; network timing rarely proves application identity alone.",
        "offensiveDefensive": "Look for OPSEC failures such as reused identities, identical files, local metadata and clearnet activity, then corroborate across endpoint and payment evidence.",
        "commands": [
          "find ~/.tor ~/.config -type f -mtime -7 -ls 2>/dev/null",
          "sqlite3 places.sqlite 'select url,title from moz_places order by last_visit_date desc limit 25;'",
          "sha256sum suspicious_download"
        ],
        "scenario": "During a Cloud Workload, Container and Kubernetes Security investigation, analysts found activity around Runtime isolation, namespaces and escape indicators. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Supply-chain scanning and workload hardening",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Cloud Workload, Container and Kubernetes Security investigation, analysts found activity around Supply-chain scanning and workload hardening. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  },
  {
    "id": "cloud-06",
    "track": "Cloud Security Engineering",
    "moduleNumber": 6,
    "title": "Cloud Detection, Incident Response and Forensics",
    "summary": "Cloud Detection, Incident Response and Forensics: deep technical briefing covering internals, artifact locations, detection mechanics, practical commands and a field investigation scenario Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite Curriculum basis: EC-Council cloud-security course domains plus the 0x8Acure engineering track; practical focus includes CSPM, CIEM, CIS Benchmarks, Prowler, ScoutSuite.",
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
    "driveUrl": "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw",
    "topicDeepDives": [
      {
        "title": "Cloud detection architecture and telemetry",
        "architecture": "Cloud architecture is a graph of accounts/projects, regions, identities, networks, services and data stores. Shared responsibility changes by service model.",
        "artifacts": "Preserve resource IDs, audit logs, configuration snapshots and region/account context for every artifact.",
        "offensiveDefensive": "Model trust boundaries and API abuse paths; reduce blast radius with account separation, least privilege, centralized logging and policy-as-code.",
        "commands": [
          "aws sts get-caller-identity",
          "aws organizations list-accounts",
          "aws cloudtrail lookup-events --max-results 50"
        ],
        "scenario": "During a Cloud Detection, Incident Response and Forensics investigation, analysts found activity around Cloud detection architecture and telemetry. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Identity-led incident response",
        "architecture": "A defensible investigation moves from authorization through preservation, collection, examination, analysis and reporting. Volatility determines collection order.",
        "artifacts": "Record evidence IDs, hashes, acquisition logs, analyst actions, clock offsets, timezone assumptions and tool versions.",
        "offensiveDefensive": "Contain without destroying evidence, capture volatile data when authorized, corroborate endpoint/network/identity evidence and validate eradication against the same timeline.",
        "commands": [
          "date -u",
          "sha256sum memory.raw evidence.dd",
          "log2timeline.py case.plaso evidence/"
        ],
        "scenario": "During a Cloud Detection, Incident Response and Forensics investigation, analysts found activity around Identity-led incident response. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Snapshot, image and disk forensics",
        "architecture": "NTFS uses fixed-size MFT records; record flags at offset 0x16 distinguish in-use and directory records. Resident attributes live inside records, non-resident attributes use data runs, and $INDEX_ROOT/$INDEX_ALLOCATION provide directory indexing.",
        "artifacts": "C:\\\\Windows\\\\$MFT, $Bitmap, $LogFile, $UsnJrnl:$J and VSS snapshots are primary evidence. Preserve the image hash before carving unallocated clusters.",
        "offensiveDefensive": "Compare $STANDARD_INFORMATION and $FILE_NAME timestamps, USN records, $LogFile and VSS to detect timestomping or deletion; corroborate instead of trusting one timestamp.",
        "commands": [
          "sleuthkit fls -r -p image.raw",
          "istat image.raw 128",
          "MFTECmd.exe -f $MFT --csv output"
        ],
        "scenario": "During a Cloud Detection, Incident Response and Forensics investigation, analysts found activity around Snapshot, image and disk forensics. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Cloud network and workload forensics",
        "architecture": "PCAP exposes Ethernet/IP/transport headers and TCP sequence numbers; Zeek converts packets into connection, DNS, HTTP and TLS metadata.",
        "artifacts": "Collect PCAP/PCAPNG, DNS/DHCP logs, firewall/VPC flow logs and Zeek conn.log/dns.log/http.log with timestamps and hashes.",
        "offensiveDefensive": "Detect beaconing, DNS tunneling and exfiltration using periodicity, query entropy, destinations and byte asymmetry, then correlate the endpoint process.",
        "commands": [
          "zeek -r capture.pcap",
          "tshark -r capture.pcap -Y 'dns' -T fields -e frame.time -e ip.src -e dns.qry.name",
          "tcpdump -nn -r capture.pcap 'tcp port 443'"
        ],
        "scenario": "During a Cloud Detection, Incident Response and Forensics investigation, analysts found activity around Cloud network and workload forensics. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      },
      {
        "title": "Containment, eradication and post-incident evidence",
        "architecture": "RFC 5322 headers encode message and transport context; MIME separates attachments, while PST/OST preserves mailbox structures.",
        "artifacts": "Collect raw .eml, PST/OST, mail logs, authentication records and attachment hashes; compare Received, Return-Path and SPF/DKIM/DMARC.",
        "offensiveDefensive": "Phishing analysis correlates headers, attachment behavior, URLs and endpoint/network telemetry before containment.",
        "commands": [
          "readpst -r -o extracted mailbox.pst",
          "exiftool suspicious_attachment",
          "grep -E '^(Received|Return-Path|Message-ID|Authentication-Results):' message.eml"
        ],
        "scenario": "During a Cloud Detection, Incident Response and Forensics investigation, analysts found activity around Containment, eradication and post-incident evidence. They preserved the original evidence, correlated the relevant artifacts with independent host, identity or network telemetry, and reproduced the observation on a working copy. The response team then contained the affected asset, documented the finding and validated remediation without altering the original evidence."
      }
    ]
  }
];

export {modulesData};
export default modulesData;
