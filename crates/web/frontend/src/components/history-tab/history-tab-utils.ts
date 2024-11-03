import type { UserQuery } from "@/model/user-query";

type GroupedQueries = {
	[key: string]: UserQuery[];
};

export const groupQueries = (queries: UserQuery[]): GroupedQueries => {
	const groupedQueries: GroupedQueries = {};
	const now = Date.now();
	const buckets = [
		{
			label: "Today",
			dayDiff: 1,
		},
		{
			label: "Yesterday",
			dayDiff: 2,
		},
		{
			label: "Two days ago",
			dayDiff: 3,
		},
		{
			label: "Three days ago",
			dayDiff: 4,
		},
		{
			label: "Four days ago",
			dayDiff: 5,
		},
		{
			label: "Five days ago",
			dayDiff: 6,
		},
		{
			label: "Six days ago",
			dayDiff: 7,
		},
		{
			label: "One week ago",
			dayDiff: 14,
		},
		{
			label: "Two weeks ago",
			dayDiff: 21,
		},
		{
			label: "Three weeks ago",
			dayDiff: 28,
		},
		{
			label: "One month ago",
			dayDiff: 60,
		},
		{
			label: "Two months ago",
			dayDiff: 90,
		},
		{
			label: "Three months  ago",
			dayDiff: 120,
		},
	];
	const stepsTimestamps = buckets.map((bucket) => ({
		label: bucket.label,
		timestamp: now - bucket.dayDiff * 24 * 60 * 60 * 1000,
	}));
	stepsTimestamps.push({
		label: "A long time ago",
		timestamp: 0,
	});

	let currentStep = 0;
	for (const query of queries) {
		while (query.timestamp < stepsTimestamps[currentStep].timestamp) {
			currentStep++;
		}
		console.log(currentStep);
		const step = stepsTimestamps[currentStep];
		const stepKey = step.label;
		if (!groupedQueries[stepKey]) {
			groupedQueries[stepKey] = [];
		}
		groupedQueries[stepKey].push(query);
	}

	return groupedQueries;
};
