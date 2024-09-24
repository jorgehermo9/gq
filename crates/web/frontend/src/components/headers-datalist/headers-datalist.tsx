interface HeadersDatalistProps {
	id: string;
}

const HeadersDatalist = ({ id }: HeadersDatalistProps) => {
	return (
		<datalist id={id}>
			<option value="Accept" />
			<option value="Accept-Charset" />
			<option value="Accept-Encoding" />
			<option value="Accept-Language" />
			<option value="Authorization" />
			<option value="Cache-Control" />
			<option value="Connection" />
			<option value="Content-Length" />
			<option value="Content-Type" />
			<option value="Cookie" />
			<option value="Date" />
			<option value="Expect" />
			<option value="Forwarded" />
			<option value="From" />
			<option value="Host" />
			<option value="If-Match" />
			<option value="If-Modified-Since" />
			<option value="If-None-Match" />
			<option value="If-Range" />
			<option value="If-Unmodified-Since" />
			<option value="Max-Forwards" />
			<option value="Origin" />
			<option value="Pragma" />
			<option value="Proxy-Authorization" />
			<option value="Range" />
			<option value="Referer" />
			<option value="TE" />
			<option value="Trailer" />
			<option value="Transfer-Encoding" />
			<option value="Upgrade" />
			<option value="User-Agent" />
			<option value="Via" />
			<option value="Warning" />
		</datalist>
	);
};

export default HeadersDatalist;
