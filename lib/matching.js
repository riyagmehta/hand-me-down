const { getClassStanding } = require("./academic");

// Weighted tag-overlap scoring, not a graph/PageRank model over a
// students-courses-listings graph -- at this data density (a single
// campus, explicit course/major tags already on hand) the signal that
// matters is already a direct edge, and a graph approach has a *worse*
// cold-start story (zero edges for a brand-new user) while adding real
// infra (a graph structure to build and keep in sync). An exact course
// match is a much stronger signal than same-major, which is why it's
// weighted far higher.
const COURSE_MATCH_WEIGHT = 10;
const MAJOR_MATCH_WEIGHT = 3;
const SENIOR_SELLER_WEIGHT = 2;
const RECENCY_WEIGHT = 1;
const RECENCY_HALF_LIFE_DAYS = 14;

const recencyScore = (createdAt, now = new Date()) => {
	if (!createdAt) return 0;
	const ageDays = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
	if (ageDays < 0) return 1;
	return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
};

// viewer: { major, courses } for the person seeing the feed. listing: a
// Product with textbookDetails and a populated seller. With no major/
// courses set (a brand-new user) or a listing with no textbookDetails
// (dorm furniture, electronics), this degenerates gracefully to a senior-
// boosted recency feed instead of scoring everything as zero and looking
// broken.
const scoreListing = (listing, viewer, now = new Date()) => {
	const courseMatch = Boolean(
		listing.textbookDetails?.courseCode &&
			viewer.courses?.includes(listing.textbookDetails.courseCode)
	);
	const majorMatch = Boolean(
		viewer.major && listing.seller?.major && listing.seller.major === viewer.major
	);
	const sellerIsSenior = getClassStanding(listing.seller?.graduationYear, now) === "senior";

	return (
		(courseMatch ? COURSE_MATCH_WEIGHT : 0) +
		(majorMatch ? MAJOR_MATCH_WEIGHT : 0) +
		(sellerIsSenior ? SENIOR_SELLER_WEIGHT : 0) +
		RECENCY_WEIGHT * recencyScore(listing.createdAt, now)
	);
};

const rankListings = (listings, viewer, now = new Date()) => {
	return [...listings]
		.map((listing) => ({ listing, score: scoreListing(listing, viewer, now) }))
		.sort((a, b) => b.score - a.score)
		.map((entry) => entry.listing);
};

module.exports = {
	scoreListing,
	rankListings,
	COURSE_MATCH_WEIGHT,
	MAJOR_MATCH_WEIGHT,
	SENIOR_SELLER_WEIGHT,
};
