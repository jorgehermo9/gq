"use client";

import { createContext, useContext, useEffect, useState } from "react";
import PromiseWorker from "webworker-promise";

export const WorkerContext = createContext<
	| {
			formatWorker: PromiseWorker | undefined;
			gqWorker: PromiseWorker | undefined;
			lspWorker: PromiseWorker | undefined;
			convertWorker: PromiseWorker | undefined;
	  }
	| undefined
>(undefined);

export const useWorker = () => {
	const context = useContext(WorkerContext);
	if (context === undefined) {
		throw new Error("useWorker must be used within a WorkerProvider");
	}
	return context;
};

interface Props {
	children: React.ReactNode;
}

export const WorkerProvider = ({ children }: Props) => {
	const [formatWorker, setFormatWorker] = useState<PromiseWorker>();
	const [gqWorker, setGqWorker] = useState<PromiseWorker>();
	const [lspWorker, setLspWorker] = useState<PromiseWorker>();
	const [convertWorker, setConvertWorker] = useState<PromiseWorker>();

	useEffect(() => {
		setFormatWorker(
			new PromiseWorker(new Worker(new URL("../workers/format.ts", import.meta.url))),
		);
		setGqWorker(new PromiseWorker(new Worker(new URL("../workers/gq.ts", import.meta.url))));
		setLspWorker(new PromiseWorker(new Worker(new URL("../workers/lsp.ts", import.meta.url))));
		setConvertWorker(
			new PromiseWorker(new Worker(new URL("../workers/convert.ts", import.meta.url))),
		);
	}, []);

	return (
		<WorkerContext.Provider value={{ formatWorker, gqWorker, lspWorker, convertWorker }}>
			{children}
		</WorkerContext.Provider>
	);
};
