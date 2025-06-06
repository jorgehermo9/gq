import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	content: string;
	className?: string;
}

const SimpleEditor = ({ content, className, ...rest }: Props) => {
	return (
		<div className={cn("bg-muted-transparent overflow-auto", className)} {...rest}>
			{content.split("\n").map((line, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<code key={index} className="bg-transparent text-xs flex gap-4">
					<span className="pointer-events-none select-none">{index + 1}</span>
					<span>{line.replaceAll("\t", "\u00a0\u00a0").replaceAll(" ", "\u00a0")}</span>
				</code>
			))}
		</div>
	);
};

export default SimpleEditor;
