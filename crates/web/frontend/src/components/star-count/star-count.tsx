import { cn, formatNumber } from "@/lib/utils";
import { Github, Star } from "lucide-react";
import { type MouseEvent, useCallback, useEffect, useState } from "react";
import { Loader } from "../ui/sonner";

interface Props {
	className?: string;
}

const StarCount = ({ className }: Props) => {
	const [stars, setStars] = useState<string>();
	const [clicked, setClicked] = useState<boolean>(false);
	const [fetching, setFetching] = useState<boolean>(true);

	const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
		setClicked(true);
		setTimeout(() => {
			window.open("https://github.com/jorgehermo9/gq", "_blank");
			setClicked(false);
		}, 0);
		e.preventDefault();
	}, []);

	useEffect(() => {
		fetch("https://api.github.com/repos/jorgehermo9/gq")
			.then((res) => res.json())
			.then((data) => setStars(formatNumber(data.stargazers_count)))
			.catch(() => setStars("N/A"))
			.finally(() => setFetching(false));
	}, []);

	return (
		<a
			href="https://github.com/jorgehermo9/gq"
			onClick={handleClick}
			className={cn(
				className,
				"flex items-center border border-accent-background px-4 py-2 rounded-md bg-background cursor-pointer select-none",
			)}
		>
			<Github className="w-4 h-4 mr-2" />
			{fetching ? (
				<Loader />
			) : (
				<div className="animate-in fade-in duration-300 flex items-center">
					<span className="text-sm font-medium mr-1">{stars}</span>
					<Star className="w-3 h-3 text-accent data-[visible=false]:opacity-0 data-[visible=true]:opacity-1 transition-opacity" />
				</div>
			)}
		</a>
	);
};

export default StarCount;
