// Open Library's Books API: free, no API key, no billing, ever. Used to
// auto-fill title/author from an ISBN so textbook listings get structured
// data instead of free text. Best-effort: any failure (not found, network
// error, timeout) returns null rather than throwing, same as geocoding --
// enrichment shouldn't be able to block saving a listing.
const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org/api/books";
const REQUEST_TIMEOUT_MS = 5000;

const lookupTextbookByISBN = async (isbn) => {
	if (!isbn) return null;

	const cleanIsbn = String(isbn).replace(/[^0-9Xx]/g, "");
	if (!cleanIsbn) return null;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const url = `${OPEN_LIBRARY_BASE_URL}?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) return null;

		const data = await response.json();
		const book = data[`ISBN:${cleanIsbn}`];
		if (!book) return null;

		return {
			isbn: cleanIsbn,
			title: book.title || undefined,
			author: Array.isArray(book.authors)
				? book.authors.map((a) => a.name).join(", ")
				: undefined,
			// Open Library's book-data endpoint doesn't reliably expose a
			// clean "edition" field -- left for the seller to enter manually.
			edition: undefined,
		};
	} catch (err) {
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
};

module.exports = { lookupTextbookByISBN };
