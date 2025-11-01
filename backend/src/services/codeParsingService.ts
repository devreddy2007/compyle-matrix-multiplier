export interface FileStructure {
  [filePath: string]: string;
}

export const parseAIResponseToFileStructure = (aiResponse: string): FileStructure => {
  try {
    const parsed = JSON.parse(aiResponse);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid JSON structure');
    }
    return parsed as FileStructure;
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON');
  }
};

export const validateFileStructure = (structure: FileStructure): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check that we have some files
  if (Object.keys(structure).length === 0) {
    errors.push('No files generated');
  }

  // Check for essential files
  const hasPackageJson = Object.keys(structure).some(path => path.includes('package.json'));
  if (!hasPackageJson) {
    errors.push('Missing package.json file');
  }

  // Validate each file has content
  for (const [filePath, content] of Object.entries(structure)) {
    if (typeof content !== 'string') {
      errors.push(`File ${filePath} has invalid content type`);
    }
    if (content.length === 0) {
      errors.push(`File ${filePath} is empty`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
