import type FileType from "@/model/file-type";
import { useCallback } from "react";
import styles from "./editor.module.css";
import ActionButton from "../action-button/action-button";

interface Props {
	title: string;
	fileTypes: FileType[];
	currentFileType: FileType;
	setFileType?: (fileType: FileType) => void;
}

const EditorTitle = ({
	title,
	fileTypes,
	currentFileType,
	setFileType,
}: Props) => {
	const handleClick = useCallback(() => {
		if (!setFileType) return;
		setFileType(currentFileType === fileTypes[0] ? fileTypes[1] : fileTypes[0]);
	}, [currentFileType, fileTypes, setFileType]);

	return (
		<h2 className="flex gap-2 justify-center items-center">
			<span className="text-lg">{title}</span>
			{fileTypes.length === 1 ? (
				<span className="text-lg font-bold text-accent">
					{currentFileType.toUpperCase()}
				</span>
			) : (
				<ActionButton
					className={styles.languageToggle}
					onClick={handleClick}
					description="Change file type"
					variant="ghost"
				>
					<span data-active={fileTypes[0] === currentFileType}>
						{fileTypes[0].toUpperCase()}
					</span>
					<span data-active={fileTypes[1] === currentFileType}>
						{fileTypes[1].toUpperCase()}
					</span>
				</ActionButton>
			)}
		</h2>
	);
};

export default EditorTitle;
