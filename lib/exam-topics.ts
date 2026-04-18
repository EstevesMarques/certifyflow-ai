export interface ExamTopic {
  topic: string
  subtopics: string[]
}

export const EXAM_TOPICS: Record<string, ExamTopic[]> = {
  "AZ-900": [
    {
      topic: "Cloud Concepts",
      subtopics: [
        "IaaS vs PaaS vs SaaS",
        "Public vs Private vs Hybrid cloud",
        "High availability",
        "Scalability and elasticity",
        "Fault tolerance and disaster recovery",
        "Economies of scale",
      ],
    },
    {
      topic: "Azure Architecture",
      subtopics: [
        "Regions",
        "Availability Zones",
        "Resource Groups",
        "Azure Resource Manager",
        "Virtual Networks",
        "Subnets",
      ],
    },
    {
      topic: "Azure Compute",
      subtopics: [
        "Virtual Machines",
        "Azure App Service",
        "Azure Functions",
        "Azure Kubernetes Service",
        "Containers",
      ],
    },
    {
      topic: "Azure Networking",
      subtopics: [
        "VNets",
        "NSG",
        "VNet Peering",
        "Private Endpoints",
        "Azure VPN Gateway",
        "Azure ExpressRoute",
        "Load Balancer",
        "Application Gateway",
      ],
    },
    {
      topic: "Azure Storage",
      subtopics: [
        "Blob Storage",
        "File Storage",
        "Queue Storage",
        "Disk Storage",
        "Storage Accounts",
        "Redundancy options",
      ],
    },
    {
      topic: "Azure Identity",
      subtopics: [
        "Azure AD",
        "Microsoft Entra ID",
        "RBAC",
        "Conditional Access",
        "Identity Protection",
      ],
    },
    {
      topic: "Azure Security",
      subtopics: [
        "Azure Firewall",
        "DDoS Protection",
        "Key Vault",
        "Security Center",
        "Sentinel",
      ],
    },
    {
      topic: "Azure Cost Management",
      subtopics: [
        "Pricing calculator",
        "Cost Management",
        "Azure Advisor",
        "Resource tags",
        "Reserved instances",
      ],
    },
    {
      topic: "Azure Governance",
      subtopics: [
        "Management groups",
        "Subscriptions",
        "Policy",
        "Blueprints",
        "Resource locks",
      ],
    },
    {
      topic: "Azure Monitoring",
      subtopics: [
        "Azure Monitor",
        "Application Insights",
        "Log Analytics",
        "Alerts",
        "Service Health",
      ],
    },
  ],

  "AZ-104": [
    {
      topic: "Azure Identity",
      subtopics: [
        "Azure AD",
        "Microsoft Entra ID",
        "Hybrid identity",
        "External identities",
        "RBAC",
        "Administrative units",
      ],
    },
    {
      topic: "Azure Networking",
      subtopics: [
        "VNets",
        "Subnets",
        "NSG",
        "VNet Peering",
        "Private Endpoints",
        "VPN Gateway",
        "ExpressRoute",
        "Application Gateway",
        "Load Balancer",
        "Azure DNS",
        "Traffic Manager",
      ],
    },
    {
      topic: "Azure Compute",
      subtopics: [
        "Virtual Machines",
        "VM Scale Sets",
        "Availability Sets",
        "Deselect",
        "VM extensions",
        "Azure Batch",
      ],
    },
    {
      topic: "Azure Storage",
      subtopics: [
        "Blob Storage",
        "File Storage",
        "Disk Storage",
        "Storage Accounts",
        "AzCopy",
        "Azure File Sync",
        "Import/Export",
      ],
    },
    {
      topic: "Azure Virtual Desktop",
      subtopics: [
        "Host pools",
        "Session hosts",
        "Workspaces",
        "App groups",
        "FSLogix",
      ],
    },
    {
      topic: "Azure Backup",
      subtopics: [
        "Azure Backup service",
        "Recovery Services vault",
        "Backup policies",
        "Azure Site Recovery",
      ],
    },
    {
      topic: "Azure Monitoring",
      subtopics: [
        "Azure Monitor",
        "Log Analytics",
        "Application Insights",
        "Alerts",
        "Workbooks",
        "Service Health",
      ],
    },
    {
      topic: "Azure Governance",
      subtopics: [
        "Resource groups",
        "Resource locks",
        "Tags",
        "Policies",
        "Blueprints",
        "Management groups",
      ],
    },
    {
      topic: "Azure Active Directory",
      subtopics: [
        "Domain services",
        "LDAP",
        "Self-service password reset",
        "MFA",
        "Password writeback",
      ],
    },
    {
      topic: "Azure CLI and PowerShell",
      subtopics: [
        "Az CLI commands",
        "PowerShell modules",
        "ARM templates",
        "Bicep",
      ],
    },
  ],

  "AZ-204": [
    {
      topic: "Azure App Service",
      subtopics: [
        "Web Apps",
        "API Apps",
        "Mobile Apps",
        "Deployment slots",
        "Authentication",
        "Custom domains",
        "SSL/TLS",
      ],
    },
    {
      topic: "Azure Functions",
      subtopics: [
        "Triggers and bindings",
        "Durable Functions",
        "Function apps",
        "Scaling",
        "Security",
        "Durable Functions patterns",
      ],
    },
    {
      topic: "Azure Blob Storage",
      subtopics: [
        "Blob containers",
        "Data Lake Gen2",
        "Access tiers",
        "Lifecycle policies",
        "Immutability",
        "Soft delete",
      ],
    },
    {
      topic: "Azure Cosmos DB",
      subtopics: [
        "NoSQL databases",
        "Containers and items",
        "Partitioning",
        "RU/s throughput",
        "Consistency levels",
        "TTL",
        "Change feed",
      ],
    },
    {
      topic: "Azure SQL Database",
      subtopics: [
        "Databases",
        "Servers",
        "Elastic pools",
        "Hyperscale",
        "Geo-replication",
        "Auto-tuning",
      ],
    },
    {
      topic: "Azure Cognitive Services",
      subtopics: [
        "Vision APIs",
        "Speech API",
        "Language API",
        "Decision API",
        "OpenAI integration",
      ],
    },
    {
      topic: "Azure Queue Storage",
      subtopics: [
        "Queues",
        "Message encoding",
        "Dequeue count",
        "Visibility timeout",
      ],
    },
    {
      topic: "Azure Event Grid",
      subtopics: [
        "Topics",
        "Subscriptions",
        "Event filtering",
        "Dead-lettering",
        "Custom topics",
      ],
    },
    {
      topic: "Azure Event Hubs",
      subtopics: [
        "Namespaces",
        "Event hubs",
        "Consumer groups",
        "Throughput units",
        "Capture",
      ],
    },
    {
      topic: "Azure Service Bus",
      subtopics: [
        "Namespaces",
        "Queues",
        "Topics and subscriptions",
        "Relays",
        "Message sessions",
      ],
    },
    {
      topic: "Azure Key Vault",
      subtopics: [
        "Secrets",
        "Keys",
        "Certificates",
        "Soft delete",
        "Access policies",
        "Managed identities",
      ],
    },
    {
      topic: "Azure Monitor",
      subtopics: [
        "Application Insights",
        "Log Analytics",
        "Metrics",
        "Alerts",
        "Workbooks",
        "Autoscale",
      ],
    },
    {
      topic: "Azure Content Delivery Network",
      subtopics: [
        "CDN profiles",
        "Endpoints",
        "Caching rules",
        "Custom domains",
        "HTTPS",
      ],
    },
    {
      topic: "Azure API Management",
      subtopics: [
        "API Gateways",
        "API policies",
        "Developer portal",
        "Subscriptions",
        "Throttling",
      ],
    },
    {
      topic: "Azure Logic Apps",
      subtopics: [
        "Workflows",
        "Connectors",
        "Triggers",
        "Actions",
        "Integration accounts",
      ],
    },
  ],

  "SC-900": [
    {
      topic: "Security, Compliance, and Identity",
      subtopics: [
        "Zero Trust",
        "Defense-in-depth",
        "Least privilege",
        "Shared responsibility model",
      ],
    },
    {
      topic: "Microsoft Azure AD",
      subtopics: [
        "Microsoft Entra ID",
        "Identity types",
        "Hybrid identity",
        "B2B and B2C",
      ],
    },
    {
      topic: "Access Management",
      subtopics: [
        "Conditional Access",
        "MFA",
        "SSO",
        "Identity Protection",
        "Privileged Identity Management",
      ],
    },
    {
      topic: "Azure Resource Permissions",
      subtopics: [
        "RBAC",
        "Built-in roles",
        "Custom roles",
        "Azure roles vs Microsoft 365 roles",
      ],
    },
    {
      topic: "Microsoft 365 Defender",
      subtopics: [
        "Defender for Office 365",
        "Defender for Endpoint",
        "Defender for Identity",
        "Defender for Cloud Apps",
      ],
    },
    {
      topic: "Microsoft Purview",
      subtopics: [
        "Compliance Manager",
        "Data classification",
        "Sensitivity labels",
        "Retention policies",
        "Data Loss Prevention",
      ],
    },
    {
      topic: "Azure Security Center",
      subtopics: [
        "Azure Defender",
        "Security policies",
        "Recommendations",
        "Regulatory compliance",
        "Secure score",
      ],
    },
    {
      topic: "Identity Governance",
      subtopics: [
        "Access Reviews",
        "Entitlement Management",
        "Terms of Use",
        "Conditional Access",
      ],
    },
  ],

  "DP-900": [
    {
      topic: "Data Concepts",
      subtopics: [
        "Relational data",
        "Non-relational data",
        "Big data",
        "Data streaming",
        "Batch processing",
      ],
    },
    {
      topic: "Azure SQL",
      subtopics: [
        "Azure SQL Database",
        "Azure SQL Managed Instance",
        "SQL on VMs",
        "Elastic pools",
        "Hyperscale",
      ],
    },
    {
      topic: "Azure Cosmos DB",
      subtopics: [
        "NoSQL",
        "APIs (SQL, MongoDB, Cassandra, Gremlin, Table)",
        "Partitioning",
        "RU/s",
        "Consistency levels",
      ],
    },
    {
      topic: "Azure Blob Storage",
      subtopics: [
        "Blob storage",
        "Data Lake Storage Gen2",
        "Access tiers",
        "Lifecycle policies",
      ],
    },
    {
      topic: "Azure Data Factory",
      subtopics: [
        "Pipelines",
        "Activities",
        "Triggers",
        "Integration runtime",
        "Copy data",
      ],
    },
    {
      topic: "Azure Synapse Analytics",
      subtopics: [
        "SQL pools",
        "Spark pools",
        "Data explorer",
        "Pipelines",
        "Studio",
      ],
    },
    {
      topic: "Azure Stream Analytics",
      subtopics: [
        "Stream processing",
        "Inputs and outputs",
        "Queries",
        "Windowing functions",
      ],
    },
    {
      topic: "Azure Data Lake",
      subtopics: [
        "Data Lake Storage Gen2",
        "Hierarchical namespace",
        "ACLs",
        "Zone-based storage",
      ],
    },
    {
      topic: "Databricks",
      subtopics: [
        "Spark clusters",
        "Notebooks",
        "Delta Lake",
        "MLflow",
        "Jobs",
      ],
    },
  ],

  "AI-900": [
    {
      topic: "AI Fundamentals",
      subtopics: [
        "Machine Learning",
        "Deep Learning",
        "Neural Networks",
        "Supervised vs Unsupervised learning",
        "AI ethics and responsible AI",
      ],
    },
    {
      topic: "Azure Machine Learning",
      subtopics: [
        "Automated ML",
        "Designer",
        "Compute targets",
        "MLOps",
        "Azure ML Studio",
      ],
    },
    {
      topic: "Azure Cognitive Services",
      subtopics: [
        "Vision APIs",
        "Speech API",
        "Language API",
        "Decision API",
        "Azure OpenAI Service",
      ],
    },
    {
      topic: "Computer Vision",
      subtopics: [
        "Image classification",
        "Object detection",
        "Face detection",
        "Form Recognizer",
        "Custom Vision",
      ],
    },
    {
      topic: "Natural Language Processing",
      subtopics: [
        "Text analytics",
        "Translator",
        "Speech API",
        "Language Understanding",
        "QnA Maker",
      ],
    },
    {
      topic: "Document Intelligence",
      subtopics: [
        "Form Recognizer",
        "Layout API",
        "Prebuilt models",
        "Custom models",
      ],
    },
    {
      topic: "Generative AI",
      subtopics: [
        "Azure OpenAI Service",
        "DALL-E",
        "GPT models",
        "Prompt engineering",
        "Responsible AI",
      ],
    },
    {
      topic: "Azure AI Search",
      subtopics: [
        "Cognitive search",
        "Indexers",
        "Skillets",
        "Semantic search",
        "Knowledge stores",
      ],
    },
  ],
}

export function enrichTopics(examId: string, weakTopics: string[]): ExamTopic[] {
  const exam = EXAM_TOPICS[examId]
  if (!exam) return []

  if (weakTopics.length === 0) {
    return exam.slice(0, 2)
  }

  const matched = exam.filter((t) =>
    weakTopics.some(
      (w) =>
        t.topic.toLowerCase().includes(w.toLowerCase()) ||
        t.subtopics.some((s) => s.toLowerCase().includes(w.toLowerCase()))
    )
  )

  return matched.length > 0 ? matched : exam.slice(0, 2)
}
