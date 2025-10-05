import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'fintech-dashboard',
    title: 'FinTech Analytics Dashboard',
    description: 'Echtzeit-Analytics-Dashboard für Finanztransaktionen mit KI-gestützten Insights',
    longDescription: `Ein hochmodernes Analytics-Dashboard für ein führendes FinTech-Unternehmen.

Die Plattform verarbeitet täglich über 1 Million Transaktionen in Echtzeit und bietet umfassende Einblicke in Geschäftskennzahlen, Nutzerverhalten und Markttrends.

Hauptmerkmale:
- Echtzeit-Datenvisualisierung mit WebSocket-Integration
- KI-gestützte Anomalieerkennung und Fraud Detection
- Customizable Dashboards mit Drag & Drop Builder
- Multi-Tenant-Architektur für verschiedene Unternehmenseinheiten
- Advanced Filtering und Export-Funktionen (PDF, Excel, CSV)
- Role-based Access Control (RBAC) System
- Performance-optimiert für große Datenmengen (10M+ Datensätze)

Die Lösung reduzierte die Reporting-Zeit um 75% und verbesserte die Fraud-Detection-Rate um 40%.`,
    category: 'web',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'WebSocket', 'D3.js', 'Docker', 'Kubernetes'],
    imageUrl: '/images/projects/fintech-dashboard.jpg',
    liveUrl: 'https://demo-fintech.getemergence.com',
    githubUrl: '',
    featured: true,
    createdAt: '2024-03-15',
    display_order: 1,
  },
  {
    id: 'ecommerce-platform',
    title: 'E-Commerce Plattform "ShopMax"',
    description: 'Skalierbare Multi-Vendor E-Commerce Plattform mit Headless Architecture',
    longDescription: `Eine moderne, headless E-Commerce-Plattform für einen Multi-Vendor-Marketplace mit über 500 Händlern und 100.000+ Produkten.

Die Plattform wurde als moderne, API-first Lösung entwickelt, die maximale Flexibilität und Performance bietet.

Technische Highlights:
- Headless Commerce Architecture mit GraphQL API
- Microservices-basierte Backend-Struktur
- Elasticsearch für blitzschnelle Produktsuche
- Stripe & PayPal Integration für Zahlungen
- Automatisierte Inventory Management
- Real-time Order Tracking
- Admin Dashboard für Vendor Management
- Progressive Web App (PWA) für Mobile
- CDN-Integration für globale Performance
- A/B Testing Framework integriert

Ergebnisse:
- 99.9% Uptime
- 2s durchschnittliche Ladezeit
- 45% Conversion-Rate-Steigerung
- Unterstützt 10.000+ gleichzeitige Nutzer`,
    category: 'web',
    technologies: ['Next.js', 'GraphQL', 'Node.js', 'MongoDB', 'Elasticsearch', 'Stripe', 'AWS', 'Docker', 'Redis'],
    imageUrl: '/images/projects/ecommerce-platform.jpg',
    liveUrl: 'https://shopmax-demo.getemergence.com',
    githubUrl: '',
    featured: true,
    createdAt: '2024-02-20',
    display_order: 2,
  },
  {
    id: 'fitness-tracker-ios',
    title: 'FitPro - iOS Fitness Tracker',
    description: 'Native iOS App für personalisiertes Fitness-Training mit HealthKit Integration',
    longDescription: `Eine vollständig native iOS-App für Fitness-Enthusiasten mit KI-gestützten Trainingsplänen und umfassender HealthKit-Integration.

Die App kombiniert modernste iOS-Technologien mit Machine Learning, um personalisierte Trainingsempfehlungen zu liefern.

Features:
- HealthKit Integration für automatisches Activity Tracking
- Personalisierte Trainingspläne basierend auf Fitness-Level
- Video-Tutorials für über 200 Übungen
- Social Features: Challenge-System, Leaderboards
- Apple Watch Companion App
- Offline-Modus für Training ohne Internet
- Core ML für Form-Analyse per Kamera
- CloudKit Sync für Geräte-übergreifende Nutzung
- Nutrition Tracking mit Barcode-Scanner
- Integration mit Apple Music für Workout-Playlists

Auszeichnungen:
- App Store "App des Tages"
- 4.8★ Rating (15.000+ Reviews)
- Über 100.000 Downloads in 6 Monaten`,
    category: 'mobile',
    technologies: ['Swift', 'SwiftUI', 'Core ML', 'HealthKit', 'CloudKit', 'Core Data', 'AVFoundation', 'ARKit'],
    imageUrl: '/images/projects/fitness-tracker.jpg',
    liveUrl: 'https://apps.apple.com/fitpro',
    githubUrl: '',
    featured: true,
    createdAt: '2024-01-10',
    display_order: 3,
  },
  {
    id: 'cloud-infrastructure',
    title: 'Enterprise Cloud Migration',
    description: 'Komplette Cloud-Migration und Infrastruktur-Modernisierung für Fortune 500 Unternehmen',
    longDescription: `Umfassende Cloud-Transformation eines traditionellen On-Premise-Systems zu einer modernen, skalierbaren Cloud-Infrastruktur.

Das Projekt umfasste die Migration von über 200 Services und Applikationen zu einer modernen Microservices-Architektur in der Cloud.

Projekt-Umfang:
- Migration von On-Premise zu AWS Multi-Region Setup
- Implementierung von Kubernetes-basierter Container-Orchestrierung
- Setup von CI/CD Pipelines mit GitOps
- Infrastructure as Code mit Terraform
- Service Mesh mit Istio
- Centralized Logging mit ELK Stack
- Monitoring mit Prometheus & Grafana
- Disaster Recovery & Backup-Strategien
- Security Hardening & Compliance (ISO 27001, SOC 2)
- Cost Optimization: 40% Reduktion der Infrastruktur-Kosten

Technische Achievements:
- Zero-Downtime Migration
- 99.99% Verfügbarkeit
- Auto-Scaling für 10x Traffic-Spikes
- Deployment-Zeit von 4h auf 15min reduziert`,
    category: 'system',
    technologies: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'GitLab CI', 'Prometheus', 'Grafana', 'ELK', 'Istio'],
    imageUrl: '/images/projects/cloud-infrastructure.jpg',
    liveUrl: '',
    githubUrl: '',
    featured: false,
    createdAt: '2023-11-05',
    display_order: 4,
  },
  {
    id: 'ai-chat-platform',
    title: 'AI-Powered Customer Service Platform',
    description: 'Intelligente Chatbot-Plattform mit Natural Language Processing für Enterprise-Kunden',
    longDescription: `Eine KI-gestützte Customer Service Plattform, die natürliche Sprachverarbeitung nutzt, um Kundenanfragen automatisch zu beantworten.

Die Plattform reduziert die Support-Kosten um 60% und verbessert die Kundenzufriedenheit durch 24/7 Verfügbarkeit.

Kernfunktionen:
- Natural Language Understanding (NLU) mit GPT-4
- Multi-Channel Support (Web, WhatsApp, Messenger, Slack)
- Sentiment Analysis für automatische Eskalation
- Live-Chat Handover zu menschlichen Agenten
- Knowledge Base mit automatischem Learning
- Analytics Dashboard für Performance-Tracking
- Multi-Language Support (12 Sprachen)
- Voice-to-Text Integration
- Custom Branding & White-Label Option
- GDPR-compliant Data Handling

Erfolgsmetriken:
- 85% Automatisierungsrate bei Anfragen
- 30s durchschnittliche Antwortzeit
- 92% Customer Satisfaction Score
- Verarbeitet 50.000+ Konversationen täglich

Integration:
- CRM-Systeme (Salesforce, HubSpot)
- Helpdesk-Tools (Zendesk, Freshdesk)
- E-Commerce-Plattformen (Shopify, WooCommerce)`,
    category: 'web',
    technologies: ['Python', 'FastAPI', 'React', 'OpenAI GPT-4', 'PostgreSQL', 'Redis', 'Celery', 'WebSocket', 'Docker'],
    imageUrl: '/images/projects/ai-chat-platform.jpg',
    liveUrl: 'https://chatbot-demo.getemergence.com',
    githubUrl: '',
    featured: false,
    createdAt: '2023-10-12',
    display_order: 5,
  },
];

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(project => project.id === id);
}

// Helper function to get projects by category
export function getProjectsByCategory(category: 'web' | 'mobile' | 'system' | 'all'): Project[] {
  if (category === 'all') return projects;
  return projects.filter(project => project.category === category);
}

// Helper function to get featured projects
export function getFeaturedProjects(): Project[] {
  return projects.filter(project => project.featured);
}
