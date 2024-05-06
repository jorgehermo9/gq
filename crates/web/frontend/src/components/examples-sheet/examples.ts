export interface Example {
    query: string;
    title: string;
    description: string;
}

export interface ExampleSection {
    title: string;
    json: object;
    queries: Example[];
}

const propertyAccessing: ExampleSection = {
    title: "Property accessing",
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
            title: "Primitive property",
            description: "Simple access to a primitive object property",
        },
        {
            query: "products.name",
            title: "Property inside array",
            description:
                "You can simply use the dot operator in order to access nested properties in objects inside an array",
        },
        {
            query: "{\n\tid\n\tproducts {\n\t\tname\n\t\tprice\n\t}\n}",
            title: "Multiple properties",
            description:
                "Use curly braces to select multiple properties in the same query either over an object or an array",
        },
    ],
};

const arrayFiltering: ExampleSection = {
    title: "Array filtering",
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
            query: "products(name = 'Product 2')",
            title: "Exact match",
            description:
                "You can use the '=' or '!=' operators to match exactly any primitive value",
        },
        {
            query: "products(quantity >= 5)",
            title: "Numeric condition",
            description:
                "Numeric filtering over the objects using any of the most common operators: '<', '>', '<=' or '>='",
        },
        {
            query: "products(name !~ '.*3$')",
            title: "Regex match",
            description: "String regex matching using the '~' or '!~' operators",
        },
        {
            query: "products(quantity < 5).name",
            title: "Filter + accessing",
            description:
                "Furthermore, you can always chain field accessing after any array filtering",
        },
    ],
};

const fieldAliasing: ExampleSection = {
    title: "Field aliasing",
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
            query: "{\n\tid: identifier\n}",
            title: "Primitive property aliasing",
            description: "You can modify the output property using the ':' token",
        },
        {
            query: "{\n\tproducts.name: productNames\n}",
            title: "Complex aliasing",
            description: "You can also define an alias for any other valid query key",
        },
    ],
};

const otherExamples: ExampleSection = {
    title: "Other examples",
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
            query:
                "{\n\tproducts(price < 15).name: cheap\n\tproducts(price >= 15).name: expensive\n}",
            title: "Multiple filters + accessing",
            description:
                "Combine multiple filters in the same query to create complex queries",
        },
    ],
};

export const queryExamples = [
    propertyAccessing,
    arrayFiltering,
    fieldAliasing,
    otherExamples,
];
