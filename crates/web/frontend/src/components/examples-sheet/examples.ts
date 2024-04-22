export interface Example {
	query: string;
	title: string;
	description: string;
}

export interface ExampleSection {
	json: object;
	queries: Example[];
}

export const simpleAccessing: ExampleSection = {
	json: {
		id: "Test",
		totalPrice: 1000,
		products: [
			{
				name: "Product 1",
				quantity: 8,
				price: 9.95,
			},
			{
				name: "Product 2",
				quantity: 5,
				price: 14.95,
			},
			{
				name: "Product 3",
				quantity: 4,
				price: 24.95,
			},
		],
	},
	queries: [
		{
			query: "id",
			title: "Access object property",
			description: "Simple access to a primitive object property",
		},
		{
			query: "products.name",
			title: "Access object properties inside an array",
			description:
				"You can simply use the dot operator in order to access nested properties of objects inside an array",
		},
	],
};

export const arrayFiltering: ExampleSection = {
	json: {},
	queries: [],
};
