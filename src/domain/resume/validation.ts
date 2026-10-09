import type { Resume } from "./types";

export type ValidationError = {
  path: string;
  message: string;
};

export type ValidationResult =
  | {
      valid: true;
      errors: [];
    }
  | {
      valid: false;
      errors: ValidationError[];
    };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isOptionalString = (value: unknown): value is string | null | undefined =>
  value === null || value === undefined || typeof value === "string";

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateId = (
  value: unknown,
  path: string,
  errors: ValidationError[]
): void => {
  if (!isNonEmptyString(value)) {
    errors.push({
      path,
      message: "ID is required."
    });
  }
};

const validateDate = (
  value: unknown,
  path: string,
  errors: ValidationError[]
): void => {
  if (!isNonEmptyString(value)) {
    errors.push({
      path,
      message: "Date is required."
    });
  }
};

const validateBullet = (
  bullet: unknown,
  path: string,
  errors: ValidationError[]
): void => {
  if (!isObject(bullet)) {
    errors.push({
      path,
      message: "Bullet must be an object."
    });
    return;
  }

  validateId(bullet.id, `${path}.id`, errors);

  if (!isNonEmptyString(bullet.text)) {
    errors.push({
      path: `${path}.text`,
      message: "Bullet text is required."
    });
  }
};

const validateExperience = (
  experience: unknown,
  index: number,
  errors: ValidationError[]
): void => {
  const path = `experience[${index}]`;

  if (!isObject(experience)) {
    errors.push({
      path,
      message: "Experience must be an object."
    });
    return;
  }

  validateId(experience.id, `${path}.id`, errors);

  if (!isNonEmptyString(experience.company)) {
    errors.push({
      path: `${path}.company`,
      message: "Company is required."
    });
  }

  if (!isNonEmptyString(experience.position)) {
    errors.push({
      path: `${path}.position`,
      message: "Position is required."
    });
  }

  validateDate(experience.startDate, `${path}.startDate`, errors);

  if (!isOptionalString(experience.endDate)) {
    errors.push({
      path: `${path}.endDate`,
      message: "End date must be a string or null."
    });
  }

  if (
    experience.endDate !== null &&
    experience.endDate !== undefined &&
    isNonEmptyString(experience.startDate) &&
    experience.endDate < experience.startDate
  ) {
    errors.push({
      path: `${path}.endDate`,
      message: "End date cannot be earlier than start date."
    });
  }

  if (!isArray(experience.bullets)) {
    errors.push({
      path: `${path}.bullets`,
      message: "Bullets must be an array."
    });
  } else {
    experience.bullets.forEach((bullet, bulletIndex) => {
      validateBullet(bullet, `${path}.bullets[${bulletIndex}]`, errors);
    });
  }
};

const validateProject = (
  project: unknown,
  index: number,
  errors: ValidationError[]
): void => {
  const path = `projects[${index}]`;

  if (!isObject(project)) {
    errors.push({
      path,
      message: "Project must be an object."
    });
    return;
  }

  validateId(project.id, `${path}.id`, errors);

  if (!isNonEmptyString(project.name)) {
    errors.push({
      path: `${path}.name`,
      message: "Project name is required."
    });
  }

  if (!isOptionalString(project.description)) {
    errors.push({
      path: `${path}.description`,
      message: "Description must be a string."
    });
  }

  if (!isOptionalString(project.url)) {
    errors.push({
      path: `${path}.url`,
      message: "URL must be a string."
    });
  }

  if (!isOptionalString(project.githubUrl)) {
    errors.push({
      path: `${path}.githubUrl`,
      message: "GitHub URL must be a string."
    });
  }

  if (!isArray(project.technologies)) {
    errors.push({
      path: `${path}.technologies`,
      message: "Technologies must be an array."
    });
  } else {
    project.technologies.forEach((technology, technologyIndex) => {
      if (!isNonEmptyString(technology)) {
        errors.push({
          path: `${path}.technologies[${technologyIndex}]`,
          message: "Technology must be a non-empty string."
        });
      }
    });
  }

  if (!isArray(project.bullets)) {
    errors.push({
      path: `${path}.bullets`,
      message: "Bullets must be an array."
    });
  } else {
    project.bullets.forEach((bullet, bulletIndex) => {
      validateBullet(bullet, `${path}.bullets[${bulletIndex}]`, errors);
    });
  }
};

const validateEducation = (
  education: unknown,
  index: number,
  errors: ValidationError[]
): void => {
  const path = `education[${index}]`;

  if (!isObject(education)) {
    errors.push({
      path,
      message: "Education must be an object."
    });
    return;
  }

  validateId(education.id, `${path}.id`, errors);

  if (!isNonEmptyString(education.school)) {
    errors.push({
      path: `${path}.school`,
      message: "School is required."
    });
  }

  if (!isNonEmptyString(education.degree)) {
    errors.push({
      path: `${path}.degree`,
      message: "Degree is required."
    });
  }

  if (!isOptionalString(education.field)) {
    errors.push({
      path: `${path}.field`,
      message: "Field must be a string."
    });
  }

  validateDate(education.startDate, `${path}.startDate`, errors);

  if (!isOptionalString(education.endDate)) {
    errors.push({
      path: `${path}.endDate`,
      message: "End date must be a string or null."
    });
  }

  if (
    education.endDate !== null &&
    education.endDate !== undefined &&
    isNonEmptyString(education.startDate) &&
    education.endDate < education.startDate
  ) {
    errors.push({
      path: `${path}.endDate`,
      message: "End date cannot be earlier than start date."
    });
  }
};

const validateSkillCategory = (
  skillCategory: unknown,
  index: number,
  errors: ValidationError[]
): void => {
  const path = `skills[${index}]`;

  if (!isObject(skillCategory)) {
    errors.push({
      path,
      message: "Skill category must be an object."
    });
    return;
  }

  validateId(skillCategory.id, `${path}.id`, errors);

  if (!isNonEmptyString(skillCategory.category)) {
    errors.push({
      path: `${path}.category`,
      message: "Skill category name is required."
    });
  }

  if (!isArray(skillCategory.skills)) {
    errors.push({
      path: `${path}.skills`,
      message: "Skills must be an array."
    });
  } else {
    skillCategory.skills.forEach((skill, skillIndex) => {
      if (!isNonEmptyString(skill)) {
        errors.push({
          path: `${path}.skills[${skillIndex}]`,
          message: "Skill must be a non-empty string."
        });
      }
    });
  }
};

const validateCertification = (
  certification: unknown,
  index: number,
  errors: ValidationError[]
): void => {
  const path = `certifications[${index}]`;

  if (!isObject(certification)) {
    errors.push({
      path,
      message: "Certification must be an object."
    });
    return;
  }

  validateId(certification.id, `${path}.id`, errors);

  if (!isNonEmptyString(certification.name)) {
    errors.push({
      path: `${path}.name`,
      message: "Certification name is required."
    });
  }

  if (!isNonEmptyString(certification.issuer)) {
    errors.push({
      path: `${path}.issuer`,
      message: "Certification issuer is required."
    });
  }

  if (!isNonEmptyString(certification.year)) {
    errors.push({
      path: `${path}.year`,
      message: "Certification year is required."
    });
  }
};

const validateUniqueIds = (
  items: unknown[],
  path: string,
  errors: ValidationError[]
): void => {
  const ids = new Set<string>();

  items.forEach((item, index) => {
    if (!isObject(item) || !isNonEmptyString(item.id)) {
      return;
    }

    if (ids.has(item.id)) {
      errors.push({
        path: `${path}[${index}].id`,
        message: `Duplicate ID "${item.id}".`
      });
      return;
    }

    ids.add(item.id);
  });
};

const validateResumeStructure = (
  resume: unknown,
  errors: ValidationError[]
): void => {
  if (!isObject(resume)) {
    errors.push({
      path: "",
      message: "Resume must be an object."
    });
    return;
  }

  if (!isNonEmptyString(resume.id)) {
    errors.push({
      path: "id",
      message: "Resume ID is required."
    });
  }

  if (!isNonEmptyString(resume.name)) {
    errors.push({
      path: "name",
      message: "Name is required."
    });
  }

  if (!isOptionalString(resume.title)) {
    errors.push({
      path: "title",
      message: "Title must be a string."
    });
  }

  if (!isOptionalString(resume.summary)) {
    errors.push({
      path: "summary",
      message: "Summary must be a string."
    });
  }

  if (!isArray(resume.experience)) {
    errors.push({
      path: "experience",
      message: "Experience must be an array."
    });
  } else {
    resume.experience.forEach((experience, index) => {
      validateExperience(experience, index, errors);
    });

    validateUniqueIds(resume.experience, "experience", errors);

    if (resume.experience.length === 0) {
      errors.push({
        path: "experience",
        message: "At least one experience entry is required."
      });
    }
  }

  if (!isArray(resume.projects)) {
    errors.push({
      path: "projects",
      message: "Projects must be an array."
    });
  } else {
    resume.projects.forEach((project, index) => {
      validateProject(project, index, errors);
    });

    validateUniqueIds(resume.projects, "projects", errors);

    if (resume.projects.length === 0) {
      errors.push({
        path: "projects",
        message: "At least one project is required."
      });
    }
  }

  if (!isArray(resume.education)) {
    errors.push({
      path: "education",
      message: "Education must be an array."
    });
  } else {
    resume.education.forEach((education, index) => {
      validateEducation(education, index, errors);
    });

    validateUniqueIds(resume.education, "education", errors);
  }

  if (!isArray(resume.skills)) {
    errors.push({
      path: "skills",
      message: "Skills must be an array."
    });
  } else {
    resume.skills.forEach((skillCategory, index) => {
      validateSkillCategory(skillCategory, index, errors);
    });

    validateUniqueIds(resume.skills, "skills", errors);
  }

  if (!isArray(resume.certifications)) {
    errors.push({
      path: "certifications",
      message: "Certifications must be an array."
    });
  } else {
    resume.certifications.forEach((certification, index) => {
      validateCertification(certification, index, errors);
    });

    validateUniqueIds(resume.certifications, "certifications", errors);
  }

  if (!isArray(resume.sectionOrder)) {
    errors.push({
      path: "sectionOrder",
      message: "Section order must be an array."
    });
  } else {
    const validSections = new Set([
      "summary",
      "experience",
      "projects",
      "education",
      "skills",
      "certifications"
    ]);

    const seenSections = new Set<string>();

    resume.sectionOrder.forEach((section, index) => {
      if (!isNonEmptyString(section)) {
        errors.push({
          path: `sectionOrder[${index}]`,
          message: "Section must be a non-empty string."
        });
        return;
      }

      if (!validSections.has(section)) {
        errors.push({
          path: `sectionOrder[${index}]`,
          message: `Unknown section "${section}".`
        });
      }

      if (seenSections.has(section)) {
        errors.push({
          path: `sectionOrder[${index}]`,
          message: `Duplicate section "${section}".`
        });
      }

      seenSections.add(section);
    });
  }
};

export function validateResume(resume: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  validateResumeStructure(resume, errors);

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    errors: []
  };
}

export function isValidResume(resume: unknown): resume is Resume {
  return validateResume(resume).valid;
}

export function validateExperienceEntry(experience: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  validateExperience(experience, 0, errors);

  return errors.length > 0
    ? {
        valid: false,
        errors
      }
    : {
        valid: true,
        errors: []
      };
}

export function validateProjectEntry(project: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  validateProject(project, 0, errors);

  return errors.length > 0
    ? {
        valid: false,
        errors
      }
    : {
        valid: true,
        errors: []
      };
}

export function validateEducationEntry(education: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  validateEducation(education, 0, errors);

  return errors.length > 0
    ? {
        valid: false,
        errors
      }
    : {
        valid: true,
        errors: []
      };
}

export function validateSkillCategoryEntry(
  skillCategory: unknown
): ValidationResult {
  const errors: ValidationError[] = [];

  validateSkillCategory(skillCategory, 0, errors);

  return errors.length > 0
    ? {
        valid: false,
        errors
      }
    : {
        valid: true,
        errors: []
      };
}

export function validateCertificationEntry(
  certification: unknown
): ValidationResult {
  const errors: ValidationError[] = [];

  validateCertification(certification, 0, errors);

  return errors.length > 0
    ? {
        valid: false,
        errors
      }
    : {
        valid: true,
        errors: []
      };
}

export function validateBulletEntry(bullet: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  validateBullet(bullet, "bullet", errors);

  return errors.length > 0
    ? {
        valid: false,
        errors
      }
    : {
        valid: true,
        errors: []
      };
}
