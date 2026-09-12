// Class standing is derived, not stored, so it can't go stale relative to
// graduationYear the way a saved label would.
//
// Assumes a standard on-track 4-year timeline and an Aug-Jul academic year
// (a student graduating in the spring of `graduationYear` is a senior for
// the academic year that starts the August before it). A real system
// serving many institutions would need per-school calendar data; this is a
// deliberate, stated simplification.
const CLASS_STANDINGS = ["freshman", "sophomore", "junior", "senior"];

const getCurrentAcademicYear = (now = new Date()) => {
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth(); // 0-11
	return month >= 7 ? year + 1 : year; // Aug (7) or later rolls into next year's academic year
};

const getClassStanding = (graduationYear, now = new Date()) => {
	if (!graduationYear) return null;

	const yearsUntilGraduation = graduationYear - getCurrentAcademicYear(now);

	if (yearsUntilGraduation < 0) return "alumni";
	if (yearsUntilGraduation > 3) return "freshman"; // clamp rather than invent new labels
	return CLASS_STANDINGS[3 - yearsUntilGraduation];
};

module.exports = { getClassStanding, getCurrentAcademicYear, CLASS_STANDINGS };
