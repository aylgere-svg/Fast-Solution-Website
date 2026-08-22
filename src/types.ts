export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  features: string[];
}

export interface MetricItem {
  value: string;
  label: string;
  subtext: string;
  numericTarget?: number;
  suffix?: string;
  prefix?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatarUrl?: string;
}

export interface TechToolItem {
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  iconType: string;
  highlightColor: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
}
