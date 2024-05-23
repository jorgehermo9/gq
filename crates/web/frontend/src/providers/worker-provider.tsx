"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import PromiseWorker from "webworker-promise";

export const WorkerContext = createContext<
	| {
<<<<<<< Updated upstream
			formatWorker: PromiseWorker | undefined;
			gqWorker: PromiseWorker | undefined;
	  }
=======
		formatWorker: PromiseWorker | undefined;
		gqWorker: PromiseWorker | undefined;
		lspWorker: PromiseWorker | undefined;
		converterWorker: PromiseWorker | undefined;
	}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
	const [lspWorker, setLspWorker] = useState<PromiseWorker | undefined>(
		undefined,
	);
	const [converterWorker, setConverterWorker] = useState<PromiseWorker | undefined>(
		undefined,
	);
>>>>>>> Stashed changes

	useEffect(() => {
		setFormatWorker(
			new PromiseWorker(
				new Worker(new URL("../lib/format.ts", import.meta.url)),
			),
		);
		setGqWorker(
			new PromiseWorker(new Worker(new URL("../lib/gq.ts", import.meta.url))),
		);
		setConverterWorker(
			new PromiseWorker(
				new Worker(new URL("../worker/converter.ts", import.meta.url)),
			),
		);
	}, []);

	return (
<<<<<<< Updated upstream
		<WorkerContext.Provider value={{ formatWorker, gqWorker }}>
=======
		<WorkerContext.Provider value={{ formatWorker, gqWorker, lspWorker, converterWorker }}>
>>>>>>> Stashed changes
			{children}
		</WorkerContext.Provider>
	);
};
