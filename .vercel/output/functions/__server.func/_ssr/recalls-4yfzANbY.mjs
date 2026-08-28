//#region node_modules/.nitro/vite/services/ssr/assets/recalls-4yfzANbY.js
function normalizeMakeModel(s) {
	return s.trim().replace(/\s+/g, " ");
}
/** Client → /api/nhtsa/recalls */
async function fetchRecallsViaApi(year, make, model, signal) {
	const y = year.trim();
	const mk = normalizeMakeModel(make);
	const md = normalizeMakeModel(model);
	if (!y || !mk || !md) return {
		ok: false,
		error: "Year, make, and model are required."
	};
	try {
		const qs = new URLSearchParams({
			year: y,
			make: mk,
			model: md
		});
		const resp = await fetch(`/api/nhtsa/recalls?${qs}`, {
			headers: { Accept: "application/json" },
			signal
		});
		const json = await resp.json();
		if (!resp.ok || "error" in json) return {
			ok: false,
			error: "error" in json && json.error ? json.error : `NHTSA recalls failed (${resp.status})`,
			status: resp.status
		};
		return {
			ok: true,
			data: json.data
		};
	} catch (e) {
		if (e instanceof DOMException && e.name === "AbortError" || e instanceof Error && e.name === "AbortError") return {
			ok: false,
			error: "Request cancelled.",
			aborted: true
		};
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Network error talking to NHTSA."
		};
	}
}
//#endregion
export { fetchRecallsViaApi as t };
