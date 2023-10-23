/**
 * A function to test if a string contains a lowercase letter
 * @param input The string to test
 * @returns A boolean true if the string contains a lowercase letter, false otherwise
 */
export const hasLowercaseLetter = (input: string): boolean =>
    /[a-z]/.test(input);

/**
 * A function to test if a string contains a uppercase letter
 * @param input The string to test
 * @returns A boolean indicating whether the string contains a uppercase letter
 */
export const hasUppercaseLetter = (input: string): boolean =>
    /[A-Z]/.test(input);

/**
 * A function to test if a string contains a number
 * @param input The string to test
 * @returns A boolean indicating whether the string contains a number
 */
export const hasNumber = (input: string): boolean => /[0-9]/.test(input);

export const specialCharacters = '!@#$%^&*()_-[]{}?/\\|,.<>~`\'"';

export const hasSpecialCharacter = (
    input: string,
    chars = specialCharacters,
): boolean => {
    for (const char of chars) if (input.includes(char)) return true;

    return false;
};
