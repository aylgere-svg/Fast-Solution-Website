import { ServiceItem, MetricItem, TestimonialItem, TechToolItem } from '../types.ts';

export const BRAND = {
  name: 'FAST Solutions',
  navLogo: 'FAST SOLUTION',
  tagline: 'Empower Your Business with Custom Solutions',
  subtitle: 'Stop juggling tools. Handle your leads, tracking, and automation with a custom setup built for you. Professional business management tools with affordable price.',
  location: 'DMV, USA',
  email: 'Contact@fastsolutiontech.com',
  phone: '240-945-9703',
  phoneClean: '2409459703',
  phone2: '202-840-0984',
  phone2Clean: '2028400984',
  bookingUrl: 'https://outlook.office.com/book/FASsolution@FASSolutions.onmicrosoft.com/?ismsaljsauthenabled',
  copyright: '© 2026 by FAST Solutions',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: "We build AI automations to streamline processes and enhance efficiency. Let's transform your operations with innovative technology.",
    iconName: 'Cpu',
    badge: 'Enterprise AI',
    features: [
      'Intelligent Document & Invoice Processing',
      'Automated Lead Scoring & Follow-ups',
      'Custom LLM Agents & Routine Task Handlers',
      'Workflow Connectors (Slack, Email, CRM)',
    ],
  },
  {
    id: 'business-applications',
    title: 'Business Applications',
    description: 'Custom cloud applications uniquely designed based on your needs within days!',
    iconName: 'LayoutGrid',
    badge: 'Rapid Deployment',
    features: [
      'Bespoke Cloud Portals & Client Dashboards',
      'Centralized Inventory & Order Tracking',
      'Secure Role-Based Access Controls',
      'Mobile-Ready Multi-Platform Interfaces',
    ],
  },
  {
    id: 'website-ads',
    title: 'Website Creation and Ads',
    description: 'We provide all in one solution including internal and external web designs and ad monetization.',
    iconName: 'Globe',
    badge: 'All-In-One',
    features: [
      'Modern High-Converting Responsive Web Design',
      'Internal Team Intranets & Knowledge Bases',
      'Targeted Ad Campaign Integration & Tracking',
      'SEO & Performance Optimization',
    ],
  },
];

export const METRICS: MetricItem[] = [
  {
    value: '8+',
    label: 'Years of Experience',
    subtext: 'Mastering enterprise systems across US top organizations',
    numericTarget: 8,
    suffix: '+',
  },
  {
    value: '200+',
    label: 'Custom solutions built',
    subtext: 'Automations, apps, and bespoke portals delivered',
    numericTarget: 200,
    suffix: '+',
  },
  {
    value: '35%',
    label: 'Our Clients Avg ROI',
    subtext: 'Measurable annual cost savings & efficiency gains',
    numericTarget: 35,
    suffix: '%',
  },
];

export const ABOUT_CONTENT = {
  header: 'ABOUT',
  title: 'Our Experts Are the Finest',
  paragraphs: [
    "High-level custom SaaS shouldn't be a luxury reserved for the Fortune 500. We’ve spent years inside the U.S.’s top enterprises, mastering the tools and strategies that drive their success. Now, we’re bringing that expertise to small and mid-sized businesses.",
    "We bridge the gap between 'standard' and 'extraordinary' by delivering affordable, custom-built solutions that save you time and money, giving you the same competitive edge as the industry giants.",
    "We remove the technical barriers that hold you back. Your vision. Our expertise. No more gaps.",
  ],
  pillars: [
    {
      title: 'Enterprise Caliber',
      desc: 'Proven methodologies refined inside high-scale US tech enterprises.',
    },
    {
      title: 'Built for SMBs',
      desc: 'Priced affordably without bloated subscriptions or unnecessary retainers.',
    },
    {
      title: 'Lightning Delivery',
      desc: 'From initial requirements to live production in days, not quarters.',
    },
  ],
};

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'sophia-grant',
    quote:
      'FAST team transformed the way we work by introducing new AI tools. Their solutions were intuitive, efficient, and helped us hit milestones on time and under budget. A vital asset.',
    author: 'Sophia Grant',
    role: 'Operations Director',
    company: 'Apex Logistics Group',
    rating: 5,
  },
  {
    id: 'ethan-miller',
    quote:
      'Fayl and Soliyana were amazing to work with, easy and great communicators, they built custom apps that automated key processes without massive overhead. Cost-effective, quick and looking forward to working together.',
    author: 'Ethan Miller',
    role: 'Founder & CEO',
    company: 'Miller Media Dynamics',
    rating: 5,
  },
  {
    id: 'lisa-young',
    quote:
      'Invaluable in deploying solutions rapidly. They understood governance, delivered functional apps, and empowered our users. True professionals.',
    author: 'Lisa Young',
    role: 'VP of Technology',
    company: 'Sterling Capital Advisors',
    rating: 5,
  },
];

export const TECH_STACK: TechToolItem[] = [
  {
    name: 'Microsoft Power Platform',
    category: 'Enterprise Low-Code & Workflow',
    description: 'Power Apps, Power Automate, and Dataverse to build secure, robust internal systems at rapid velocity.',
    capabilities: ['Power Automate Workflows', 'Model-Driven & Canvas Apps', 'Secure Dataverse Integration'],
    iconType: 'power-platform',
    highlightColor: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    name: 'Microsoft Azure',
    category: 'Enterprise Cloud & Scalable Infrastructure',
    description: 'High-availability cloud hosting, serverless APIs, secure relational databases, and enterprise identity management.',
    capabilities: ['Azure Cloud Functions & APIs', 'Scalable SQL & Cosmos Databases', 'Enterprise Entra ID & DevOps'],
    iconType: 'azure',
    highlightColor: 'from-sky-500/20 to-blue-500/20',
  },
  {
    name: 'AI Builder',
    category: 'Cognitive Document & Process Intelligence',
    description: 'Prebuilt and custom AI models for form recognition, text classification, and automated object detection.',
    capabilities: ['Document & Receipt Extraction', 'Sentiment & Intent Analysis', 'Prediction Models'],
    iconType: 'ai-builder',
    highlightColor: 'from-violet-500/20 to-fuchsia-500/20',
  },
  {
    name: 'Meta Ads',
    category: 'Targeted Advertising & Lead Funnels',
    description: 'High-converting Facebook & Instagram campaigns, custom audience scaling, and automated lead capture pipelines.',
    capabilities: ['Precision Audience Targeting', 'Automated Lead Gen Funnels', 'Pixel & Conversions API Tracking'],
    iconType: 'meta-ads',
    highlightColor: 'from-blue-500/20 to-sky-500/20',
  },
];
