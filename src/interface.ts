export interface Company {
  name: string;
  url: string;
}

export interface Founder {
  name: string;
  linkedIn?: string;
  about?: string;
}

export interface Job {
  role: string;
  locations?: string;
  pay?: string;
  exp?: string;
  url?: string;
}

export interface News {
  title: string;
  url?: string;
  timeline?: string;
}

export interface CompanyData {
  name?: string;
  brief?: string;
  description: string;
  founded?: string;
  teamSize?: string;
  founders?: Founder[];
  jobs?: Job[];
  latestNews?: News[];
}

export interface ExtractedDataObject {
  url: string;
  companyData: CompanyData;
}
