import type FileType from "@/model/file-type";
import { useCallback } from "react";
import ActionButton from "../action-button/action-button";
import styles from "./editor.module.css";
import { Link2, Link2Off, Unlink2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface Props {
	title: string;
	fileTypes: FileType[];
	currentFileType: FileType;
	linked?: boolean;
	setLinked?: (linked: boolean) => void;
	setFileType?: (fileType: FileType) => void;
}

const EditorTitle = ({
	title,
	fileTypes,
	currentFileType,
	linked,
	setLinked,
	setFileType,
}: Props) => {
	const handleClick = useCallback(() => {
		if (!setFileType) return;
		setFileType(currentFileType === fileTypes[0] ? fileTypes[1] : fileTypes[0]);
	}, [currentFileType, fileTypes, setFileType]);

	const handleLinkClick = useCallback((e: React.MouseEvent) => {
		if (!setLinked) return;
		toast.info(`${linked ? "Unlinked" : "Linked"} editors!`);
		setLinked(!linked);
		e.stopPropagation();
	}, [linked, setLinked]);

	return (
		<h2 className="flex gap-2 justify-center items-center">
			<span className="text-lg">{title}</span>
			{fileTypes.length === 1 ? (
				<span className="text-lg font-bold text-accent">
					{currentFileType.toUpperCase()}
				</span>
			) : (
				<div
					className={styles.languageToggle}
					onClick={handleClick}
				>
					<div className={styles.languageToggleLinkContainer} onClick={(e) => e.stopPropagation()}>
						<ActionButton className="p-2" description={`${linked ? "Link" : "Unlink"} input and output editors`} onClick={handleLinkClick}>
							{
								linked
									? <Link2 className="w-3 h-3" />
									: <Link2Off className="w-3 h-3" />
							}
						</ActionButton>
					</div>
					<span data-active={fileTypes[0] === currentFileType}>
						{fileTypes[0].toUpperCase()}
					</span>
					<span data-active={fileTypes[1] === currentFileType}>
						{fileTypes[1].toUpperCase()}
					</span>
				</div >
			)}
		</h2 >
	);
};

export default EditorTitle;
