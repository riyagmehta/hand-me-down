const { lookupTextbookByISBN } = require("../../lib/textbookLookup");

describe("lookupTextbookByISBN", () => {
	const realFetch = global.fetch;

	afterEach(() => {
		global.fetch = realFetch;
	});

	it("returns title/author for a known ISBN", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				"ISBN:9780132350884": {
					title: "Clean Code",
					authors: [{ name: "Robert C. Martin" }],
				},
			}),
		});

		const result = await lookupTextbookByISBN("978-0-13-235088-4");

		expect(result).toEqual({
			isbn: "9780132350884",
			title: "Clean Code",
			author: "Robert C. Martin",
			edition: undefined,
		});
	});

	it("returns null when the ISBN isn't found", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

		const result = await lookupTextbookByISBN("0000000000");

		expect(result).toBeNull();
	});

	it("returns null on a network error instead of throwing", async () => {
		global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

		const result = await lookupTextbookByISBN("9780132350884");

		expect(result).toBeNull();
	});

	it("returns null for an empty ISBN without calling fetch", async () => {
		global.fetch = jest.fn();

		const result = await lookupTextbookByISBN("");

		expect(result).toBeNull();
		expect(global.fetch).not.toHaveBeenCalled();
	});
});
