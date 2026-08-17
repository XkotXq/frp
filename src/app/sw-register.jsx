"use client";

import { useEffect } from "react";

export default function SWRegister() {
	useEffect(() => {
		if (!("serviceWorker" in navigator)) {
			return;
		}

		navigator.serviceWorker.register("/sw.js").catch(() => {
			// Ignore SW registration failures in development or unsupported contexts.
		});
	}, []);

	return null;
}
