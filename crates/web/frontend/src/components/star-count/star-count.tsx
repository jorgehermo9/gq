import { formatNumber } from "@/lib/utils";
import { Github, Star } from "lucide-react";
import { type MouseEvent, useCallback, useEffect, useState } from "react";
import ActionButton from "../action-button/action-button";
import { Loader } from "../ui/sonner";

interface Props {
	className?: string;
}

const StarCount = ({ className }: Props) => {
	const [stars, setStars] = useState<string>();
	const [fetching, setFetching] = useState<boolean>(true);

	const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		window.open("https://github.com/jorgehermo9/gq", "_blank");
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
		<ActionButton
			description="Check the GQ Github repository"
			className={className}
			variant="subtle"
			onClick={handleClick}
		>
			<a href="https://github.com/jorgehermo9/gq" className="flex items-center select-none">
				<Github className="w-3.5 h-3.5 mr-2" />
				{fetching ? (
					<Loader />
				) : (
					<div className="animate-in fade-in duration-300 flex items-center mt-[2px]">
						<span className="text-xxs font-normal mr-1">{stars}</span>
						<Star className="w-2 h-2 mb-[1px] text-accent data-[visible=false]:opacity-0 data-[visible=true]:opacity-1 transition-opacity" />
					</div>
				)}
			</a>
		</ActionButton>
	);
};

export default StarCount;
