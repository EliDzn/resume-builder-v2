export type PersonalInfo = {
  fullName: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type Project = {
  id: string;
  name: string;
  techStack: string;
  bullets: string[];
};

export type Certification = {
  id: string;
  provider: string;
  title: string;
  completedDate: string;
};

export type ResumeData = {
  personal: PersonalInfo;
  summary: string;
  experiences: Experience[];
  projects: Project[];
  certifications: Certification[];
};
