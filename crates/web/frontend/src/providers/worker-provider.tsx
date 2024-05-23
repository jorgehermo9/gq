"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import PromiseWorker from "webworker-promise";

export const WorkerContext = createContext<
	| {
		formatWorker: PromiseWorker | undefined;
		gqWorker: PromiseWorker | undefined;
		lspWorker: PromiseWorker | undefined;
		converterWorker: PromiseWorker | undefined;
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
	const [formatWorker, setFormatWorker] = useState<PromiseWorker | undefined>(
		undefined,
	);
	const [gqWorker, setGqWorker] = useState<PromiseWorker | undefined>(
		undefined,
	);
	const [lspWorker, setLspWorker] = useState<PromiseWorker | undefined>(
		undefined,
	);
	const [converterWorker, setConverterWorker] = useState<PromiseWorker | undefined>(
		undefined,
	);

	useEffect(() => {
		setFormatWorker(
			new PromiseWorker(
				new Worker(new URL("../lib/format.ts", import.meta.url)),
			),
		);
		setGqWorker(
			new PromiseWorker(
				new Worker(new URL("../worker/gq.ts", import.meta.url)),
			),
		);
		setLspWorker(
			new PromiseWorker(
				new Worker(new URL("../worker/lsp.ts", import.meta.url)),
			),
		);
		setConverterWorker(
			new PromiseWorker(
				new Worker(new URL("../worker/converter.ts", import.meta.url)),
			),
		);
	}, []);

	return (
		<WorkerContext.Provider value={{ formatWorker, gqWorker, lspWorker, converterWorker }}>
			{children}
		</WorkerContext.Provider>
	);
};
