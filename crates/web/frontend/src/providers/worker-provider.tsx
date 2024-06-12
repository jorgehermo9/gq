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
	const [formatWorker, setFormatWorker] = useState<PromiseWorker | undefined>(undefined);
	const [gqWorker, setGqWorker] = useState<PromiseWorker | undefined>(undefined);
	const [lspWorker, setLspWorker] = useState<PromiseWorker | undefined>(undefined);
	const [convertWorker, setConvertWorker] = useState<PromiseWorker | undefined>(undefined);

	useEffect(() => {
		setFormatWorker(new PromiseWorker(new Worker(new URL("../worker/format.ts", import.meta.url))));
		setGqWorker(new PromiseWorker(new Worker(new URL("../worker/gq.ts", import.meta.url))));
		setLspWorker(new PromiseWorker(new Worker(new URL("../worker/lsp.ts", import.meta.url))));
		setConvertWorker(
			new PromiseWorker(new Worker(new URL("../worker/convert.ts", import.meta.url))),
		);
	}, []);

	return (
		<WorkerContext.Provider value={{ formatWorker, gqWorker, lspWorker, convertWorker }}>
			{children}
		</WorkerContext.Provider>
	);
};
