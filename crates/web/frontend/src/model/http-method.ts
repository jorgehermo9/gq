enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
}

export const fromString = (method: string): HttpMethod => {
	switch (method) {
		case 'GET':
			return HttpMethod.GET;
		case 'POST':
			return HttpMethod.POST;
		default:
			throw new Error('Invalid http method');
	}
}
