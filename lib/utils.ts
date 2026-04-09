export const formatPhoneNumber = (phone?: string | null) => {
	if (!phone) return '';

	// Remove all non-numeric characters
	const cleaned = phone.replace(/\D/g, '');

	// Check if it has 998 prefix (12 digits)
	if (cleaned.length === 12 && cleaned.startsWith('998')) {
		const match = cleaned.match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/);
		if (match) {
			return `(${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
		}
	}

	// Check if it is a 9-digit number
	if (cleaned.length === 9) {
		const match = cleaned.match(/^(\d{2})(\d{3})(\d{2})(\d{2})$/);
		if (match) {
			return `(${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
		}
	}

	// Return the original phone string if it doesn't match expected formats
	return phone;
};
