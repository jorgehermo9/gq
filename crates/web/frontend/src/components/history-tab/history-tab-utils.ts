import { UserQuery } from "@/model/user-query";

type GroupedQueries = {
	[key: string]: UserQuery[];
};

export const groupQueries = (queries: UserQuery[]): GroupedQueries => {
	const groupedQueries: GroupedQueries = {};
	const now = Date.now();
	const buckets = [
		{
			label: "today",
			dayDiff: 1,
		},
		{
			label: "1 day",
			dayDiff: 2,
		},
		{
			label: "2 days",
			dayDiff: 3,
		},
		{
			label: "3 days",
			dayDiff: 4,
		},
		{
			label: "4 days",
			dayDiff: 5,
		},
		{
			label: "5 days",
			dayDiff: 6,
		},
		{
			label: "6 days",
			dayDiff: 7,
		},
		{
			label: "1 week",
			dayDiff: 14,
		},
		{
			label: "2 weeks",
			dayDiff: 21,
		},
		{
			label: "3 weeks",
			dayDiff: 28,
		},
		{
			label: "1 month",
			dayDiff: 60,
		},
		{
			label: "2 months",
			dayDiff: 90,
		},
		{
			label: "3 months",
			dayDiff: 120,
		},
	];
	const stepsTimestamps = buckets.map((bucket) => ({
		label: bucket.label,
		timestamp: now - bucket.dayDiff * 24 * 60 * 60 * 1000,
	}));

	let currentStep = 0;
	for (const query of queries) {
		const queryTimestamp = query.timestamp;
		while (queryTimestamp < stepsTimestamps[currentStep].timestamp) {
			currentStep++;
		}
		const step = buckets[currentStep];
		const stepKey = step.label;
		if (!groupedQueries[stepKey]) {
			groupedQueries[stepKey] = [];
		}
		groupedQueries[stepKey].push(query);
	}

	return groupedQueries;
};
