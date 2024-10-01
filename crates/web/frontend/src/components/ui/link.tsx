export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	children: React.ReactNode;
}

const Link = (props: LinkProps) => {
	return (
		<a {...props} className={`text-xs text-foreground hover:underline ${props.className}`}>
			{props.children}
		</a>
	);
};

export default Link;
