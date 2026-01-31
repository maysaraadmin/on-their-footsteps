/**
 * Client-side input validation utilities
 * Provides comprehensive validation before API calls
 */

class InputValidator {
  constructor() {
    // Validation patterns
    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      arabicText: /^[\u0600-\u06FF\s\-\.\,\:\;\!\?\(\)\[\]\"\'\/\\]+$/,
      arabicName: /^[\u0600-\u06FF\s]+$/,
      englishText: /^[a-zA-Z\s\-\.\,\:\;\!\?\(\)\[\]\"\'\/\\]+$/,
      englishName: /^[a-zA-Z\s]+$/,
      slug: /^[a-z0-9-]+$/,
      year: /^(0|[1-9]\d{0,3})$/,
      id: /^\d+$/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    };

    // Islamic categories
    this.islamicCategories = [
      'الأنبياء', 'الصحابة', 'التابعون', 'العلماء', 
      'الخلفاء', 'القادة', 'الفقهاء', 'المحدثون', 'المفكرون'
    ];

    // Valid eras
    this.validEras = [
      'Pre-Islamic', 'Early Islam', 'Rashidun Caliphate', 'Umayyad Caliphate',
      'Abbasid Caliphate', 'Ottoman Empire', 'Modern Era', '7th Century',
      '8th Century', '9th Century', '10th Century', '11th Century',
      '12th Century', '13th Century', '14th Century', '15th Century'
    ];
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  validateEmail(email) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: email
    };

    if (!email || typeof email !== 'string') {
      result.isValid = false;
      result.errors.push('Email is required');
      return result;
    }

    const sanitized = email.trim().toLowerCase();
    result.sanitized = sanitized;

    if (!this.patterns.email.test(sanitized)) {
      result.isValid = false;
      result.errors.push('Invalid email format');
    }

    if (sanitized.length > 254) {
      result.isValid = false;
      result.errors.push('Email is too long');
    }

    return result;
  }

  /**
   * Validate Arabic text
   * @param {string} text - Arabic text to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateArabicText(text, options = {}) {
    const { minLength = 1, maxLength = 1000, allowEmpty = false } = options;
    const result = {
      isValid: true,
      errors: [],
      sanitized: text
    };

    if (!text) {
      if (allowEmpty) {
        return result;
      }
      result.isValid = false;
      result.errors.push('Arabic text is required');
      return result;
    }

    const sanitized = text.trim();
    result.sanitized = sanitized;

    if (sanitized.length < minLength) {
      result.isValid = false;
      result.errors.push(`Arabic text must be at least ${minLength} characters`);
    }

    if (sanitized.length > maxLength) {
      result.isValid = false;
      result.errors.push(`Arabic text must not exceed ${maxLength} characters`);
    }

    if (!this.patterns.arabicText.test(sanitized)) {
      result.isValid = false;
      result.errors.push('Invalid Arabic text format');
    }

    return result;
  }

  /**
   * Validate Arabic name
   * @param {string} name - Arabic name to validate
   * @returns {Object} Validation result
   */
  validateArabicName(name) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: name
    };

    if (!name || typeof name !== 'string') {
      result.isValid = false;
      result.errors.push('Arabic name is required');
      return result;
    }

    const sanitized = name.trim();
    result.sanitized = sanitized;

    if (sanitized.length < 2) {
      result.isValid = false;
      result.errors.push('Arabic name must be at least 2 characters');
    }

    if (sanitized.length > 100) {
      result.isValid = false;
      result.errors.push('Arabic name must not exceed 100 characters');
    }

    if (!this.patterns.arabicName.test(sanitized)) {
      result.isValid = false;
      result.errors.push('Invalid Arabic name format');
    }

    return result;
  }

  /**
   * Validate year
   * @param {number|string} year - Year to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateYear(year, options = {}) {
    const { min = 500, max = 2024, allowEmpty = false } = options;
    const result = {
      isValid: true,
      errors: [],
      sanitized: year
    };

    if (year === null || year === undefined || year === '') {
      if (allowEmpty) {
        return result;
      }
      result.isValid = false;
      result.errors.push('Year is required');
      return result;
    }

    const yearNum = parseInt(year, 10);
    result.sanitized = yearNum;

    if (isNaN(yearNum)) {
      result.isValid = false;
      result.errors.push('Year must be a valid number');
      return result;
    }

    if (yearNum < min || yearNum > max) {
      result.isValid = false;
      result.errors.push(`Year must be between ${min} and ${max}`);
    }

    return result;
  }

  /**
   * Validate category
   * @param {string} category - Category to validate
   * @returns {Object} Validation result
   */
  validateCategory(category) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: category
    };

    if (!category || typeof category !== 'string') {
      result.isValid = false;
      result.errors.push('Category is required');
      return result;
    }

    const sanitized = category.trim();
    result.sanitized = sanitized;

    if (!this.islamicCategories.includes(sanitized)) {
      result.isValid = false;
      result.errors.push(`Invalid category. Must be one of: ${this.islamicCategories.join(', ')}`);
    }

    return result;
  }

  /**
   * Validate era
   * @param {string} era - Era to validate
   * @returns {Object} Validation result
   */
  validateEra(era) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: era
    };

    if (!era || typeof era !== 'string') {
      result.isValid = false;
      result.errors.push('Era is required');
      return result;
    }

    const sanitized = era.trim();
    result.sanitized = sanitized;

    if (!this.validEras.includes(sanitized)) {
      result.isValid = false;
      result.errors.push(`Invalid era. Must be one of: ${this.validEras.join(', ')}`);
    }

    return result;
  }

  /**
   * Validate slug
   * @param {string} slug - Slug to validate
   * @returns {Object} Validation result
   */
  validateSlug(slug) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: slug
    };

    if (!slug || typeof slug !== 'string') {
      result.isValid = false;
      result.errors.push('Slug is required');
      return result;
    }

    const sanitized = slug.trim().toLowerCase();
    result.sanitized = sanitized;

    if (!this.patterns.slug.test(sanitized)) {
      result.isValid = false;
      result.errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }

    if (sanitized.length < 3) {
      result.isValid = false;
      result.errors.push('Slug must be at least 3 characters');
    }

    if (sanitized.length > 100) {
      result.isValid = false;
      result.errors.push('Slug must not exceed 100 characters');
    }

    return result;
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {Object} Validation result
   */
  validateURL(url) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: url
    };

    if (!url || typeof url !== 'string') {
      result.isValid = false;
      result.errors.push('URL is required');
      return result;
    }

    const sanitized = url.trim();
    result.sanitized = sanitized;

    if (!this.patterns.url.test(sanitized)) {
      result.isValid = false;
      result.errors.push('Invalid URL format');
    }

    if (sanitized.length > 2048) {
      result.isValid = false;
      result.errors.push('URL is too long');
    }

    return result;
  }

  /**
   * Validate ID
   * @param {number|string} id - ID to validate
   * @returns {Object} Validation result
   */
  validateID(id) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: id
    };

    if (id === null || id === undefined || id === '') {
      result.isValid = false;
      result.errors.push('ID is required');
      return result;
    }

    const idStr = String(id).trim();
    result.sanitized = idStr;

    if (!this.patterns.id.test(idStr)) {
      result.isValid = false;
      result.errors.push('ID must be a valid number');
    }

    return result;
  }

  /**
   * Validate search query
   * @param {string} query - Search query to validate
   * @returns {Object} Validation result
   */
  validateSearchQuery(query) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: query
    };

    if (!query || typeof query !== 'string') {
      result.isValid = false;
      result.errors.push('Search query is required');
      return result;
    }

    const sanitized = query.trim();
    result.sanitized = sanitized;

    if (sanitized.length < 2) {
      result.isValid = false;
      result.errors.push('Search query must be at least 2 characters');
    }

    if (sanitized.length > 100) {
      result.isValid = false;
      result.errors.push('Search query must not exceed 100 characters');
    }

    // Check for potentially dangerous content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        result.isValid = false;
        result.errors.push('Search query contains potentially dangerous content');
        break;
      }
    }

    return result;
  }

  /**
   * Validate pagination parameters
   * @param {Object} params - Pagination parameters
   * @returns {Object} Validation result
   */
  validatePagination(params) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: { ...params }
    };

    const { page = 1, limit = 20 } = params;

    // Validate page
    const pageValidation = this.validateID(page);
    if (!pageValidation.isValid) {
      result.isValid = false;
      result.errors.push(...pageValidation.errors.map(e => `Page: ${e}`));
    } else {
      const pageNum = parseInt(page, 10);
      if (pageNum < 1) {
        result.isValid = false;
        result.errors.push('Page must be at least 1');
      }
      if (pageNum > 1000) {
        result.isValid = false;
        result.errors.push('Page must not exceed 1000');
      }
      result.sanitized.page = pageNum;
    }

    // Validate limit
    const limitValidation = this.validateID(limit);
    if (!limitValidation.isValid) {
      result.isValid = false;
      result.errors.push(...limitValidation.errors.map(e => `Limit: ${e}`));
    } else {
      const limitNum = parseInt(limit, 10);
      if (limitNum < 1) {
        result.isValid = false;
        result.errors.push('Limit must be at least 1');
      }
      if (limitNum > 100) {
        result.isValid = false;
        result.errors.push('Limit must not exceed 100');
      }
      result.sanitized.limit = limitNum;
    }

    return result;
  }

  /**
   * Comprehensive character data validation
   * @param {Object} characterData - Character data to validate
   * @returns {Object} Validation result
   */
  validateCharacterData(characterData) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: {}
    };

    const requiredFields = ['name', 'arabic_name', 'category'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!characterData[field]) {
        result.isValid = false;
        result.errors.push(`${field} is required`);
      }
    }

    // Validate each field
    const validations = {
      name: () => this.validateEnglishText(characterData.name, { minLength: 2, maxLength: 100 }),
      arabic_name: () => this.validateArabicName(characterData.arabic_name),
      title: () => characterData.title ? this.validateEnglishText(characterData.title, { minLength: 2, maxLength: 200, allowEmpty: true }) : { isValid: true, errors: [], sanitized: '' },
      description: () => characterData.description ? this.validateEnglishText(characterData.description, { minLength: 10, maxLength: 1000, allowEmpty: true }) : { isValid: true, errors: [], sanitized: '' },
      birth_year: () => characterData.birth_year ? this.validateYear(characterData.birth_year, { allowEmpty: true }) : { isValid: true, errors: [], sanitized: null },
      death_year: () => characterData.death_year ? this.validateYear(characterData.death_year, { allowEmpty: true }) : { isValid: true, errors: [], sanitized: null },
      category: () => this.validateCategory(characterData.category),
      era: () => characterData.era ? this.validateEra(characterData.era) : { isValid: true, errors: [], sanitized: '' },
      slug: () => characterData.slug ? this.validateSlug(characterData.slug) : { isValid: true, errors: [], sanitized: '' }
    };

    // Run validations
    for (const [field, validator] of Object.entries(validations)) {
      const validation = validator();
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(...validation.errors.map(e => `${field}: ${e}`));
      }
      result.sanitized[field] = validation.sanitized;
    }

    // Validate year logic
    if (result.sanitized.birth_year && result.sanitized.death_year) {
      if (result.sanitized.birth_year >= result.sanitized.death_year) {
        result.isValid = false;
        result.errors.push('Birth year must be before death year');
      }
    }

    return result;
  }

  /**
   * Validate English text
   * @param {string} text - English text to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateEnglishText(text, options = {}) {
    const { minLength = 1, maxLength = 1000, allowEmpty = false } = options;
    const result = {
      isValid: true,
      errors: [],
      sanitized: text
    };

    if (!text) {
      if (allowEmpty) {
        return result;
      }
      result.isValid = false;
      result.errors.push('English text is required');
      return result;
    }

    const sanitized = text.trim();
    result.sanitized = sanitized;

    if (sanitized.length < minLength) {
      result.isValid = false;
      result.errors.push(`English text must be at least ${minLength} characters`);
    }

    if (sanitized.length > maxLength) {
      result.isValid = false;
      result.errors.push(`English text must not exceed ${maxLength} characters`);
    }

    if (!this.patterns.englishText.test(sanitized)) {
      result.isValid = false;
      result.errors.push('Invalid English text format');
    }

    return result;
  }
}

// Export singleton instance
export const inputValidator = new InputValidator();
export default inputValidator;
