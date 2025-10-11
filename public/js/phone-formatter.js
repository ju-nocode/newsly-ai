// ================================================
// Phone Number Formatter
// Auto-format phone numbers with spaces based on country
// ================================================

/**
 * Format phone number with spaces based on country dial code
 * @param {string} phone - Raw phone number
 * @param {string} dialCode - Country dial code (e.g., '+33', '+1')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, dialCode) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    if (!cleaned) return '';

    // Format based on country
    switch (dialCode) {
        case '+33': // France: 6 12 34 56 78
        case '+32': // Belgium: Similar format
        case '+41': // Switzerland: Similar format
            if (cleaned.length <= 1) return cleaned;
            if (cleaned.length <= 3) return cleaned.slice(0, 1) + ' ' + cleaned.slice(1);
            if (cleaned.length <= 5) return cleaned.slice(0, 1) + ' ' + cleaned.slice(1, 3) + ' ' + cleaned.slice(3);
            if (cleaned.length <= 7) return cleaned.slice(0, 1) + ' ' + cleaned.slice(1, 3) + ' ' + cleaned.slice(3, 5) + ' ' + cleaned.slice(5);
            return cleaned.slice(0, 1) + ' ' + cleaned.slice(1, 3) + ' ' + cleaned.slice(3, 5) + ' ' + cleaned.slice(5, 7) + ' ' + cleaned.slice(7, 9);

        case '+1': // US/Canada: (123) 456-7890
            if (cleaned.length <= 3) return cleaned;
            if (cleaned.length <= 6) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
            return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 10);

        case '+44': // UK: 7123 456789
            if (cleaned.length <= 4) return cleaned;
            if (cleaned.length <= 7) return cleaned.slice(0, 4) + ' ' + cleaned.slice(4);
            return cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 10);

        case '+49': // Germany: 123 4567890
        case '+31': // Netherlands: Similar
        case '+34': // Spain: Similar
        case '+39': // Italy: Similar
        case '+351': // Portugal: Similar
            if (cleaned.length <= 3) return cleaned;
            return cleaned.slice(0, 3) + ' ' + cleaned.slice(3);

        default:
            // Generic format: groups of 3 digits
            if (cleaned.length <= 3) return cleaned;
            if (cleaned.length <= 6) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
            if (cleaned.length <= 9) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
            return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 9) + ' ' + cleaned.slice(9);
    }
};

/**
 * Attach phone formatter to an input element
 * @param {HTMLInputElement} input - Phone input element
 * @param {HTMLSelectElement} codeSelect - Country code select element
 */
export const attachPhoneFormatter = (input, codeSelect) => {
    if (!input || !codeSelect) return;

    input.addEventListener('input', (e) => {
        const dialCode = codeSelect.value;
        const cursorPos = e.target.selectionStart;
        const oldValue = e.target.value;
        const formatted = formatPhoneNumber(oldValue, dialCode);

        // Only update if the formatted value is different
        if (formatted !== oldValue) {
            e.target.value = formatted;

            // Restore cursor position (adjust for added spaces)
            const diff = formatted.length - oldValue.length;
            const newCursorPos = cursorPos + diff;
            e.target.setSelectionRange(newCursorPos, newCursorPos);
        }
    });

    // Also format when country code changes
    codeSelect.addEventListener('change', () => {
        const dialCode = codeSelect.value;
        input.value = formatPhoneNumber(input.value, dialCode);
    });
};
