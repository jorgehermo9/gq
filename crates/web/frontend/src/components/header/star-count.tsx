import { cn } from "@/lib/utils";
import { Github, Star } from "lucide-react";
import { type MouseEvent, useCallback, useEffect, useState } from "react";
import styles from "./header.module.css";

interface Props {
	className?: string;
}

const StarCount = ({ className }: Props) => {
	const [stars, setStars] = useState<number>();
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
			.then((data) => setStars(data.stargazers_count));
	}, []);

	return (
		<a
			href="https://github.com/jorgehermo9/gq"
			onClick={handleClick}
			className={cn(className, styles.starCount)}
			data-visible={!!stars}
		>
			<Github className="w-4 h-4 text-accent mr-2" />
			<span className="text-sm mr-1">{stars}</span>
			<Star
				// data-visible={!clicked}
				className="w-3 h-3 data-[visible=false]:opacity-0 data-[visible=true]:opacity-1 transition-opacity"
			/>
			{/* <Heart
				data-visible={clicked}
				className="w-3 h-3 text-accent data-[visible=false]:opacity-0 data-[visible=true]:opacity-1 transition-opacity"
			/> */}
		</a>
	);
};

export default StarCount;
