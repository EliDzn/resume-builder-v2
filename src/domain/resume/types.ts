export type DateOrder = "asc" | "desc";

export type ResumeSection =
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "certifications";

export interface ResumeDate {
  year: number;
  month: number;
}

export interface PersonalInfo {
  name: string;
  title?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Bullet {
  id: string;
  text: string;
}

export interface Experience {
  id: string;
  company: string;
  jobTitle: string;
  startDate?: ResumeDate;
  endDate: ResumeDate | null;
  bullets: Bullet[];
}

export interface Project {
  id: string;
  name: string;
  technologies?: string[];
  startDate?: ResumeDate;
  endDate: ResumeDate;
  bullets: Bullet[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fields?: string[];
  specializations?: string[];
  startDate?: ResumeDate;
  endDate: ResumeDate | null;
  coursework?: string[];
  gpa?: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: ResumeDate;
}

export interface Resume {
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: SkillCategory[];
  certifications: Certification[];
  sectionOrder: ResumeSection[];
  dateOrder: {
    experience: DateOrder;
    education: DateOrder;
    certifications: DateOrder;
  };
}
