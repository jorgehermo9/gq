import { cn } from "@/lib/utils";

export const SidebarContent = ({
	className,
	children,
	...props
}: React.HTMLProps<HTMLDivElement>) => {
	return (
		<div className={cn("flex flex-col", className)} {...props}>
			{children}
		</div>
	);
};

export const SidebarHeader = ({
	className,
	children,
	...props
}: React.HTMLProps<HTMLDivElement>) => {
	return (
		<div
			className={cn("p-4 flex flex-col space-y-1.5 text-center sm:text-left", className)}
			{...props}
		>
			{children}
		</div>
	);
};

export const SidebarTitle = ({
	className,
	children,
	...props
}: React.HTMLProps<HTMLHeadingElement>) => {
	return (
		<h4 className={className} {...props}>
			{children}
		</h4>
	);
};

export const SidebarDescription = ({
	className,
	children,
	...props
}: React.HTMLProps<HTMLParagraphElement>) => {
	return (
		<p className={className} {...props}>
			{children}
		</p>
	);
};
