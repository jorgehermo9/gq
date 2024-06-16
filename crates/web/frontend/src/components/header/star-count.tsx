import { cn, formatNumber } from "@/lib/utils";
import { Github, Star } from "lucide-react";
import { type MouseEvent, useCallback, useEffect, useState } from "react";
import styles from "./header.module.css";

interface Props {
	className?: string;
}

const StarCount = ({ className }: Props) => {
	const [stars, setStars] = useState<string>();
	const [clicked, setClicked] = useState<boolean>(false);

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
			.catch(() => setStars("N/A"));
	}, []);

	return (
		<a
			href="https://github.com/jorgehermo9/gq"
			onClick={handleClick}
			className={cn(styles.starCount, className)}
			data-visible={!!stars}
		>
			<Github className="w-4 h-4 mr-2" />
			<span className="text-sm font-medium mr-1">{stars}</span>
			<Star className="w-3 h-3 text-accent data-[visible=false]:opacity-0 data-[visible=true]:opacity-1 transition-opacity" />
		</a>
	);
};

export default StarCount;
