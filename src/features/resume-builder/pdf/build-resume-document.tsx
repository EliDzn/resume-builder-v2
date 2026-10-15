import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { ResumeData } from "../model/resume-type";

const PAGE_WIDTH_PT = 612;
const PAGE_MARGIN_PT = 18;
const CONTENT_WIDTH_PT = PAGE_WIDTH_PT - PAGE_MARGIN_PT * 2;
const PREVIEW_BODY_SIZE_PT = 11;

function formatMonthYear(value: string): string {
  if (!value) return "";

  const [year, month] = value.split("-").map(Number);
  if (!year || month < 1 || month > 12) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, 1));
}

function formatDateRange(startDate: string, endDate: string): string {
  return [formatMonthYear(startDate), formatMonthYear(endDate)]
    .filter(Boolean)
    .join(" - ");
}

function sectionHeading(title: string, topMargin: number): Content[] {
  return [
    {
      text: title.toUpperCase(),
      style: "sectionTitle",
      margin: [0, topMargin, 0, 2]
    },
    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: CONTENT_WIDTH_PT,
          y2: 0,
          lineWidth: 0.75,
          lineColor: "#202124"
        }
      ],
      margin: [0, 0, 0, 2]
    }
  ];
}

export function buildResumeDocument(resume: ResumeData): TDocumentDefinitions {
  const content: Content[] = [];
  const { personal } = resume;
  let hasSection = false;

  const addSectionHeading = (title: string) => {
    content.push(...sectionHeading(title, hasSection ? 2 : 0));
    hasSection = true;
  };

  content.push({
    text: personal.fullName || "Your Name",
    style: "name"
  });

  if (personal.role) {
    content.push({
      text: personal.role,
      style: "role"
    });
  }

  const contact = [
    personal.location,
    personal.phone,
    personal.email,
    personal.linkedin,
    personal.github
  ]
    .filter(Boolean)
    .join(" | ");

  if (contact) {
    content.push({
      text: contact,
      style: "contact"
    });
  }

  if (resume.summary.trim()) {
    addSectionHeading("Summary");
    content.push({
      text: resume.summary,
      style: "body",
      margin: [0, 0, 0, 0]
    });
  }

  if (resume.experiences.length > 0) {
    addSectionHeading("Experience");

    for (const experience of resume.experiences) {
      content.push({
        columns: [
          {
            text: experience.company || "Untitled Company",
            style: "entryTitle",
            width: "*"
          },
          {
            text: formatDateRange(experience.startDate, experience.endDate),
            style: "date",
            alignment: "right",
            width: "auto"
          }
        ],
        columnGap: 6,
        margin: [0, 0, 0, 1.5]
      });

      if (experience.role) {
        content.push({
          text: experience.role,
          style: "subEntry"
        });
      }

      const bullets = experience.bullets.filter((bullet) => bullet.trim());

      if (bullets.length > 0) {
        content.push({
          ul: bullets,
          style: "body",
          margin: [0, 2, 0, 10],
          markerColor: "#202124"
        });
      }
    }
  }

  if (resume.projects.length > 0) {
    addSectionHeading("Projects");

    for (const project of resume.projects) {
      content.push({
        columns: [
          {
            text: project.name || "Untitled Project",
            style: "entryTitle",
            width: "*"
          },
          {
            text: formatMonthYear(project.endDate ?? ""),
            style: "date",
            alignment: "right",
            width: "auto"
          }
        ],
        columnGap: 6,
        margin: [0, 0, 0, 1.5]
      });

      if (project.techStack) {
        content.push({
          text: project.techStack,
          style: "subEntry"
        });
      }

      const bullets = project.bullets.filter((bullet) => bullet.trim());

      if (bullets.length > 0) {
        content.push({
          ul: bullets,
          style: "body",
          margin: [0, 2, 0, 10],
          markerColor: "#202124"
        });
      }
    }
  }

  if (resume.certifications.length > 0) {
    addSectionHeading("Certifications");

    for (const certification of resume.certifications) {
      content.push({
        stack: [
          {
            text:
              [certification.provider, certification.title]
                .filter(Boolean)
                .join(" ") || "Certification",
            style: "body"
          },
          {
            text: formatMonthYear(certification.completedDate),
            style: "date"
          }
        ],
        margin: [0, 0, 0, 10]
      });
    }
  }

  return {
    info: {
      title: personal.fullName ? `${personal.fullName}_Resume` : "Resume"
    },
    pageSize: "LETTER",
    pageMargins: [
      PAGE_MARGIN_PT,
      PAGE_MARGIN_PT,
      PAGE_MARGIN_PT,
      PAGE_MARGIN_PT
    ],
    content,
    defaultStyle: {
      font: "Times",
      fontSize: PREVIEW_BODY_SIZE_PT,
      lineHeight: 1.2,
      color: "#202124"
    },
    styles: {
      name: {
        fontSize: 20,
        bold: true,
        alignment: "center",
        margin: [0, 8, 0, 8]
      },
      role: {
        fontSize: 14,
        alignment: "center",
        margin: [0, 0, 0, 10.5]
      },
      contact: {
        fontSize: 10.5,
        alignment: "center"
      },
      sectionTitle: {
        fontSize: 11,
        bold: true,
        characterSpacing: 0,
        margin: [0, 0, 0, 2]
      },
      entryTitle: {
        fontSize: 11,
        bold: true
      },
      date: {
        fontSize: 11
      },
      subEntry: {
        fontSize: 11,
        italics: true
      },
      body: {
        fontSize: PREVIEW_BODY_SIZE_PT
      }
    }
  };
}
