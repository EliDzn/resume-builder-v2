import type { ResumeData, ResumeSkills } from "../model/resume-type";

type Section =
  | "contact"
  | "summary"
  | "experience"
  | "projects"
  | "certifications"
  | "skills"
  | "ignored";

const headings: Record<string, Section> = {
  summary: "summary",
  profile: "summary",
  objective: "summary",
  "professional summary": "summary",
  experience: "experience",
  "work experience": "experience",
  "professional experience": "experience",
  employment: "experience",
  projects: "projects",
  "technical projects": "projects",
  "personal projects": "projects",
  certifications: "certifications",
  certificates: "certifications",
  "licenses & certifications": "certifications",
  "licenses and certifications": "certifications",
  skills: "skills",
  organizations: "ignored",
  education: "ignored"
};

const MONTH_PATTERN =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";

const DATE_RANGE = new RegExp(
  `(${MONTH_PATTERN})\\.?\\s+(\\d{4})(?:\\s*[-–—]\\s*(${MONTH_PATTERN})\\.?\\s+(\\d{4})|\\s*[-–—]\\s*(present|current))?`,
  "i"
);

const MONTH_YEAR = new RegExp(`\\b${MONTH_PATTERN}\\.?\\s+\\d{4}\\b`, "i");

const DATE_SUFFIX = new RegExp(
  `\\s+${MONTH_PATTERN}\\.?\\s+\\d{4}(?:\\s*[-–—]\\s*(?:${MONTH_PATTERN}\\.?\\s+\\d{4}|present|current))?\\s*$`,
  "i"
);

const MONTH_NUMBERS: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12"
};

const toInputMonth = (month: string, year: string) =>
  `${year}-${MONTH_NUMBERS[month.slice(0, 3).toLowerCase()]}`;

const parseDateRange = (text: string) => {
  const match = text.match(DATE_RANGE);
  if (!match) return { startDate: "", endDate: "" };

  const firstDate = toInputMonth(match[1], match[2]);

  if (match[5]) {
    return { startDate: firstDate, endDate: "" };
  }

  if (match[3]) {
    return {
      startDate: firstDate,
      endDate: toInputMonth(match[3], match[4])
    };
  }

  return { startDate: "", endDate: firstDate };
};

const BULLET_PREFIX = /^[•●▪◦‣∙·\uF0B7*-]\s*/u;

const normalizeLine = (line: string) =>
  line.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

const isBulletLine = (line: string) => BULLET_PREFIX.test(normalizeLine(line));

const cleanBullet = (line: string) =>
  normalizeLine(line).replace(BULLET_PREFIX, "").trim();

const splitDatedEntries = (lines: string[]) => {
  const entries: string[][] = [];
  let current: string[] = [];

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);

    if (MONTH_YEAR.test(line) && current.length > 0) {
      entries.push(current);
      current = [];
    }

    if (line) current.push(line);
  }

  if (current.length > 0) entries.push(current);
  return entries;
};

const collectBulletText = (lines: string[]) => {
  const bullets: string[] = [];

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line) continue;

    if (isBulletLine(line) || bullets.length === 0) {
      bullets.push(cleanBullet(line));
    } else {
      bullets[bullets.length - 1] += ` ${line}`;
    }
  }

  return bullets;
};

export function parseResumeText(text: string): ResumeData {
  const sections: Record<Section, string[]> = {
    contact: [],
    summary: [],
    experience: [],
    projects: [],
    certifications: [],
    skills: [],
    ignored: []
  };

  let activeSection: Section = "contact";

  for (const rawLine of text.split(/\r?\n/)) {
    const line = normalizeLine(rawLine);
    const heading = headings[line.replace(/:$/, "").toLowerCase()];

    if (heading) {
      activeSection = heading;
    } else {
      sections[activeSection].push(line);
    }
  }

  const contactText = sections.contact.join("\n");
  const contactLines = sections.contact.filter(
    (line) =>
      line &&
      !line.includes("@") &&
      !/https?:\/\//i.test(line) &&
      !/linkedin\.com|github\.com/i.test(line) &&
      !/^\+?[\d().\s-]{8,}$/.test(line)
  );

  const email =
    contactText.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] ?? "";
  const phone = contactText.match(/\+?[\d][\d().\s-]{7,}\d/)?.[0]?.trim() ?? "";
  const linkedin =
    contactText.match(
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,)]+/i
    )?.[0] ?? "";
  const github =
    contactText.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,)]+/i
    )?.[0] ?? "";

  const experiences = splitDatedEntries(sections.experience).map((block) => {
    const dates = parseDateRange(block[0] ?? "");

    return {
      id: crypto.randomUUID(),
      company: (block[0] ?? "").replace(DATE_SUFFIX, "").trim(),
      role: block[1] ?? "",
      ...dates,
      bullets: collectBulletText(block.slice(2))
    };
  });

  const projects = splitDatedEntries(sections.projects).map((block) => ({
    id: crypto.randomUUID(),
    name: (block[0] ?? "").replace(DATE_SUFFIX, "").trim(),
    techStack: block[1] ?? "",
    endDate: parseDateRange(block[0] ?? "").endDate,
    bullets: collectBulletText(block.slice(2))
  }));

  const certificationDate = new RegExp(
    `\\(?\\s*(${MONTH_PATTERN})\\.?\\s+(\\d{4})\\s*\\)?`,
    "i"
  );

  const certifications = sections.certifications
    .map(cleanBullet)
    .filter(Boolean)
    .map((entry) => {
      const dateMatch = entry.match(certificationDate);
      const title = dateMatch
        ? entry
            .replace(dateMatch[0], "")
            .replace(/[|,–—-]\s*$/, "")
            .trim()
        : entry;

      return {
        id: crypto.randomUUID(),
        title,
        completedDate: dateMatch ? toInputMonth(dateMatch[1], dateMatch[2]) : ""
      };
    });

  const skills: ResumeSkills = { frontend: [], backend: [], tools: [] };

  for (const line of sections.skills) {
    const match = cleanBullet(line).match(
      /^(Frontend|Backend|Tools)\s*:\s*(.*)$/i
    );
    const category = match?.[1]?.toLowerCase();
    const value = match?.[2]?.trim();

    if (
      value &&
      (category === "frontend" ||
        category === "backend" ||
        category === "tools")
    ) {
      skills[category] = value
        .split(/[,;]/)
        .map((skill) => skill.trim())
        .filter(Boolean);
    }
  }

  return {
    personal: {
      fullName: contactLines[0] ?? "",
      role: "",
      location: "",
      phone,
      email,
      linkedin,
      github
    },
    summary: sections.summary.filter(Boolean).join("\n"),
    experiences,
    projects,
    certifications,
    skills,
    fontFamily: "inter"
  };
}
