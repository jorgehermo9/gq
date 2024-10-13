interface HeadersDatalistProps {
	id: string;
}

const RequestHeadersDatalist = ({ id }: HeadersDatalistProps) => {
	return (
		<datalist id={id}>
			<option value="Accept" />
			<option value="Accept-Language" />
			<option value="Authorization" />
			<option value="Cache-Control" />
			<option value="Content-Type" />
			<option value="Forwarded" />
			<option value="From" />
			<option value="If-Match" />
			<option value="If-Modified-Since" />
			<option value="If-None-Match" />
			<option value="If-Range" />
			<option value="If-Unmodified-Since" />
			<option value="Max-Forwards" />
			<option value="Pragma" />
			<option value="Range" />
			<option value="User-Agent" />
			<option value="Warning" />
		</datalist>
	);
};

export default RequestHeadersDatalist;
