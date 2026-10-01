export const CLOUD_SECURITY_DRIVE_URL = "https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw?usp=drive_link";

export const cloudSecurityData = [
  {
    id: "cloud-01",
    title: "Cloud Architecture & Shared Responsibility Model",
    track: "Cloud Security",
    category: "Foundations",
    type: "Guide & Slides",
    level: "Associate",
    topics: ["IaaS / PaaS / SaaS Security", "Cloud Control Matrix (CCM)", "AWS/Azure Shared Model"],
    keywords: ["AWS", "Azure", "cloud architecture", "shared responsibility"],
    driveUrl: CLOUD_SECURITY_DRIVE_URL
  },
  {
    id: "cloud-02",
    title: "Cloud Identity & Access Management (IAM) Hardening",
    track: "Cloud Security",
    category: "IAM & Access Control",
    type: "Lab Manual",
    level: "Intermediate",
    topics: ["Least Privilege Policies", "AssumeRole & Privilege Escalation", "OAuth2 & SSO Federation"],
    keywords: ["AWS IAM", "Azure IAM", "IAM", "identity", "SSO"],
    driveUrl: CLOUD_SECURITY_DRIVE_URL
  },
  {
    id: "cloud-03",
    title: "Cloud Network Security & Perimeter Defense",
    track: "Cloud Security",
    category: "Network Defense",
    type: "Architecture Blueprint",
    level: "Intermediate",
    topics: ["VPC Peering & Transit Gateway", "Security Groups & NACLs", "WAF & DDoS Mitigation"],
    keywords: ["AWS", "Azure", "VPC", "network security", "perimeter"],
    driveUrl: CLOUD_SECURITY_DRIVE_URL
  },
  {
    id: "cloud-04",
    title: "Data Protection, Key Management & Storage Security",
    track: "Cloud Security",
    category: "Data Security",
    type: "PDF Guide",
    level: "Intermediate",
    topics: ["AWS KMS & Azure Key Vault", "S3 Bucket Misconfiguration & Hardening", "Envelope Encryption"],
    keywords: ["AWS", "Azure", "KMS", "S3", "Key Vault", "storage security"],
    driveUrl: CLOUD_SECURITY_DRIVE_URL
  },
  {
    id: "cloud-05",
    title: "Container, Kubernetes & Serverless Security",
    track: "Cloud Security",
    category: "App & Container Security",
    type: "Cheat Sheet & Lab",
    level: "Advanced",
    topics: ["Docker Image Vulnerability Scanning", "Kubernetes RBAC & NetworkPolicies", "Lambda Security"],
    keywords: ["Docker", "Kubernetes", "K8s", "serverless", "Lambda"],
    driveUrl: CLOUD_SECURITY_DRIVE_URL
  },
  {
    id: "cloud-06",
    title: "Cloud Posture Management (CSPM), CIEM & Compliance",
    track: "Cloud Security",
    category: "Auditing & Compliance",
    type: "Framework Guide",
    level: "Advanced",
    topics: ["CIS Benchmarks for Cloud", "ScoutSuite & Prowler Automation", "Continuous Threat Detection"],
    keywords: ["CSPM", "CIEM", "CIS", "Prowler", "ScoutSuite", "compliance"],
    driveUrl: CLOUD_SECURITY_DRIVE_URL
  }
];
