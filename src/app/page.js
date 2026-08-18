"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

const STORAGE_KEY = "ystock-v2";
const OLD_STORAGE_KEY = "frp-records-v1";

const DEFAULT_FRP_DB = [
	{ number: "993916000000395", label: "2.2", name: "2.2mmFRP/suppleness-FRP", type: "XB", mmc: false },
	{ number: "993916000000390", label: "0.54/0.58", name: "Coated FRP 0.54mm*0.58mm", type: "XB", mmc: true },
	{ number: "993916000000204", label: "1.2/1.3", name: "Coated FRP 1.2*1.3-/-M", type: "XB", mmc: true },
	{ number: "993916000000254", label: "1.6/1.7", name: "Coated FRP 1.6*1.7-H-M (High Module)", type: "XB", mmc: true },
	{ number: "993916000000404", label: "1.8/1.9", name: "Coated FRP 1.8*1.9-/-M/Diameter positive deviation of bulk FRP 0-0.03(1.8-1.83)", type: "XB", mmc: true },
	{ number: "993916000000255", label: "1.8/1.9", name: "Coated FRP 1.8*1.9-H-M (High Module)", type: "XB", mmc: true },
	{ number: "993916000000076", label: "2.0/2.1", name: "Coated FRP 2.0*2.1-H-M (High Module)", type: "XB", mmc: true },
	{ number: "993916000000256", label: "2.2/2.3", name: "Coated FRP 2.2*2.3-H-M (High Module)", type: "XB", mmc: true },
	{ number: "993916000000128", label: "1.6/1.7", name: "Coated FRP/ 1.6*1.7-/-M", type: "XB", mmc: true },
	{ number: "993916000000129", label: "1.8/1.9", name: "Coated FRP/ 1.8*1.9-/-M", type: "XB", mmc: true },
	{ number: "993916000000351", label: "0.5/0.6", name: "Coated FRP/0.5*0.6(0.5)mm", type: "XB", mmc: true },
	{ number: "993916000000179", label: "0.8/0.9", name: "Coated FRP/0.8*0.9mm(0.8)mm", type: "XB", mmc: true },
	{ number: "993916000000205", label: "1.0/1.1", name: "Coated FRP/1.0mm*1.1(1.1)mm", type: "XB", mmc: true },
	{ number: "993916000000239", label: "1.3/1.4", name: "Coated FRP/1.3mm*1.4mm", type: "XB", mmc: true },
	{ number: "993916000000223", label: "1.4/1.5", name: "Coated FRP/1.4*1.5-/-M", type: "XB", mmc: true },
	{ number: "993916000000130", label: "2.0/2.1", name: "Coated FRP/2.0mm*2.1(2.0)mm", type: "XB", mmc: true },
	{ number: "993916000000261", label: "2.2/2.3", name: "Coated FRP/2.2*2.3-H-M", type: "XB", mmc: true },
	{ number: "993916000000310", label: "1.4", name: "FRP 1.4mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000305", label: "1.5", name: "FRP 1.5mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000329", label: "1.6", name: "FRP 1.6mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000386", label: "1.7", name: "FRP 1.7mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000219", label: "1.8", name: "FRP 1.8mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000361", label: "1.9", name: "FRP 1.9mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000349", label: "2.0", name: "FRP 2.0mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000350", label: "2.1", name: "FRP 2.1mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000303", label: "2.25", name: "FRP 2.25mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000346", label: "2.3", name: "FRP 2.3mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000385", label: "2.4", name: "FRP 2.4mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000306", label: "2.5", name: "FRP 2.5mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000328", label: "2.6", name: "FRP 2.6mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000334", label: "2.8", name: "FRP 2.8mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000307", label: "3.0", name: "FRP 3.0mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000308", label: "3.2", name: "FRP 3.2mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000304", label: "3.5", name: "FRP 3.5mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000335", label: "3.7", name: "FRP 3.7mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000126", label: "1.25", name: "FRP/Φ1.25mm", type: "Z", mmc: false },
	{ number: "993916000000009", label: "1.2", name: "FRP/Φ1.2mm", type: "Z", mmc: false },
	{ number: "993916000000119", label: "1.6", name: "FRP/Φ1.6mm", type: "Z", mmc: false },
	{ number: "993916000000142", label: "1.7", name: "FRP/Φ1.7mm", type: "Z", mmc: false },
	{ number: "993916000000121", label: "1.8", name: "FRP/Φ1.8mm", type: "Z", mmc: false },
	{ number: "993916000000112", label: "2.0", name: "FRP/Φ2.0mm", type: "Z", mmc: false },
	{ number: "993916000000118", label: "2.1", name: "FRP/Φ2.1mm", type: "Z", mmc: false },
	{ number: "993916000000113", label: "2.25", name: "FRP/Φ2.25mm", type: "Z", mmc: false },
	{ number: "993916000000046", label: "2.3", name: "FRP/Φ2.3mm", type: "Z", mmc: false },
	{ number: "993916000000125", label: "2.4", name: "FRP/Φ2.4mm", type: "Z", mmc: false },
	{ number: "993916000000124", label: "2.5", name: "FRP/Φ2.5mm", type: "Z", mmc: false },
	{ number: "993916000000011", label: "2.6", name: "FRP/Φ2.6mm", type: "Z", mmc: false },
	{ number: "993916000000038", label: "2.8", name: "FRP/Φ2.8mm", type: "Z", mmc: false },
	{ number: "993916000000271", label: "2.9", name: "FRP/Φ2.9mm", type: "Z", mmc: false },
	{ number: "993916000000117", label: "3.0", name: "FRP/Φ3.0mm", type: "Z", mmc: false },
	{ number: "993916000000122", label: "3.2", name: "FRP/Φ3.2mm", type: "Z", mmc: false },
	{ number: "993916000000045", label: "3.4", name: "FRP/Φ3.4mm", type: "Z", mmc: false },
	{ number: "993916000000120", label: "3.5", name: "FRP/Φ3.5mm", type: "Z", mmc: false },
	{ number: "993916000000115", label: "3.7", name: "FRP/Φ3.7mm", type: "Z", mmc: false },
	{ number: "993916000000357", label: "1.7", name: "High-strength FRP/1.7mm (for top telecom contract)", type: "XB", mmc: false },
	{ number: "993916000000059", label: "1.8", name: "High-strength FRP/1.8mm (for top telecom contract)", type: "Z", mmc: false },
	{ number: "993916000000110", label: "3.4", name: "FRP 3.4mm/VIP", type: "XB", mmc: false },
	{ number: "993916000000001", label: "0.8", name: "FRP/Φ0.8mm", type: "Z", mmc: false },
	{ number: "993916000000448", label: "0.7/0.75", name: "GFRP/0.7*0.75mm", type: "XB", mmc: true },
	{ number: "993916000000467", label: "0.45/1.5", name: "FRP with steel wire reinforced Φ0.45*1.5mm", type: "XB", mmc: true },
	{ number: "993916000000456", label: "0.45/2.15", name: "FRP with steel wire reinforced Φ0.45*2.15mm", type: "XB", mmc: true },
	{ number: "993916000000468", label: "0.45/3.0", name: "FRP with steel wire reinforced Φ0.45*3.0mm", type: "XB", mmc: true },
	{ number: "993916000000469", label: "0.45/3.2", name: "FRP with steel wire reinforced Φ0.45*3.2mm", type: "XB", mmc: true },
];

const MATERIALS = {
	frp: { label: "FRP" },
	coatedFrp: { label: "Coated FRP" },
	filler: { label: "Filler" },
};


function createId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function digitsOnly(value) {
	return String(value ?? "").replace(/\D/g, "");
}

function formatLengthKm(value) {
	const m = Number(value);
	if (!Number.isFinite(m) || !value) return value || "-";
	return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 3 }).format(m / 1000);
}

function formatLengthKmExport(value) {
	const m = Number(digitsOnly(value));
	if (!m) return "";
	return `${(m / 1000).toFixed(3).replace(".", ",")}`;
}

function formatExportTimestamp(date = new Date()) {
	const pad = (v) => String(v).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
}

function formatDateYMD(date = new Date()) {
	const pad = (v) => String(v).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDiffKm(diffMeters, withSign = true) {
	const km = diffMeters / 1000;
	const sign = withSign && km > 0 ? "+" : "";
	return `${sign}${km.toFixed(3).replace(".", ",")}`;
}

function findFrpBySuffix(value, list = DEFAULT_FRP_DB) {
	const digits = digitsOnly(value);
	if (digits.length < 3) return null;
	const suffix = digits.slice(-3);
	return list.find((item) => item.number.endsWith(suffix)) ?? null;
}

function findFrpCandidates(value, list = DEFAULT_FRP_DB) {
	const digits = digitsOnly(value);
	if (digits.length < 3) return [];
	const suffix = digits.slice(-3);
	return list.filter((item) => item.number.endsWith(suffix));
}

function findFrpByNumber(number, list = DEFAULT_FRP_DB) {
	const digits = digitsOnly(number);
	if (!digits) return null;
	return list.find((item) => item.number === digits) ?? null;
}

function resolveFrpMmc(item, list = DEFAULT_FRP_DB) {
	if (typeof item?.mmc === "boolean") return item.mmc;
	return Boolean(findFrpByNumber(item?.frpNumber ?? item?.itemNumber ?? "", list)?.mmc);
}

function resolveFrpFullName(item, list = DEFAULT_FRP_DB) {
	const matched = findFrpByNumber(item?.frpNumber ?? item?.itemNumber ?? "", list);
	return String(matched?.name ?? item?.frpName ?? item?.frpLabel ?? item?.diameter ?? "").trim();
}


function getDefaultState() {
	return {
		stocks: { frp: [], coatedFrp: [], filler: [] },
		statusMap: { frp: {}, coatedFrp: {}, filler: {} },
		stockCompleted: { frp: false, coatedFrp: false, filler: false },
		selectedIds: { frp: null, coatedFrp: null, filler: null },
		frpDb: DEFAULT_FRP_DB,
		frpMasked: false,
		lastLocation: "",
		lastFillerSettings: { color: "GRAY", location: "PRZED", isincendiary: false },
		frpStockHistory: [],
	};
}

function mergeFrpDb(savedList) {
	const saved = Array.isArray(savedList) ? savedList : [];
	const savedNums = new Set(saved.map((i) => i?.number));
	const missing = DEFAULT_FRP_DB.filter((i) => !savedNums.has(i.number));
	return [...saved, ...missing];
}

function normalizeState(parsed) {
	if (!parsed || typeof parsed !== "object") return getDefaultState();
	const nextStocks = {
		frp: Array.isArray(parsed?.stocks?.frp) ? parsed.stocks.frp : [],
		coatedFrp: Array.isArray(parsed?.stocks?.coatedFrp) ? parsed.stocks.coatedFrp : [],
		filler: Array.isArray(parsed?.stocks?.filler) ? parsed.stocks.filler : [],
	};
	const nextSelectedIds = {
		frp: parsed?.selectedIds?.frp ?? null,
		coatedFrp: parsed?.selectedIds?.coatedFrp ?? null,
		filler: parsed?.selectedIds?.filler ?? null,
	};
	Object.keys(nextSelectedIds).forEach((mat) => {
		const list = nextStocks[mat] ?? [];
		const sel = nextSelectedIds[mat];
		if (!sel || !list.some((i) => i.id === sel)) nextSelectedIds[mat] = null;
	});
	return {
		stocks: nextStocks,
		statusMap: {
			frp: parsed?.statusMap?.frp ?? {},
			coatedFrp: parsed?.statusMap?.coatedFrp ?? {},
			filler: parsed?.statusMap?.filler ?? {},
		},
		stockCompleted: {
			frp: Boolean(parsed?.stockCompleted?.frp),
			coatedFrp: Boolean(parsed?.stockCompleted?.coatedFrp),
			filler: Boolean(parsed?.stockCompleted?.filler),
		},
		selectedIds: nextSelectedIds,
		frpDb: mergeFrpDb(parsed?.frpDb),
		frpMasked: Boolean(parsed?.frpMasked),
		lastLocation: String(parsed?.lastLocation ?? ""),
		lastFillerSettings: {
			color: ["GRAY", "WHITE", "BLACK"].includes(parsed?.lastFillerSettings?.color) ? parsed.lastFillerSettings.color : "GRAY",
			location: ["PRZED", "ZA"].includes(parsed?.lastFillerSettings?.location) ? parsed.lastFillerSettings.location : "PRZED",
			isincendiary: Boolean(parsed?.lastFillerSettings?.isincendiary),
		},
		frpStockHistory: Array.isArray(parsed?.frpStockHistory) ? parsed.frpStockHistory : (Array.isArray(parsed?.stockHistory?.frp) ? parsed.stockHistory.frp : []),
	};
}

function migrateOldData(oldFrps) {
	const state = getDefaultState();
	const statusMap = {};
	state.stocks.frp = oldFrps.map((old) => {
		const id = old.id || createId();
		if (old.status === "available") statusMap[id] = true;
		else if (old.status === "unavailable") statusMap[id] = false;
		const matched = findFrpByNumber(old.itemId ?? "", DEFAULT_FRP_DB);
		return {
			id,
			itemNumber: old.itemId ?? "",
			frpNumber: old.itemId ?? "",
			frpLabel: matched?.label ?? old.diameter ?? "",
			frpName: matched?.name ?? "",
			diameter: matched?.label ?? old.diameter ?? "",
			type: old.company ?? "XB",
			mmc: Boolean(matched?.mmc),
			length: old.length ?? "",
			drumNumber: old.drumNumber ?? "",
			location: old.location ?? "",
			remark: old.remarks ?? "",
		};
	});
	state.statusMap.frp = statusMap;
	return state;
}

function loadState() {
	if (typeof window === "undefined") return getDefaultState();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return normalizeState(JSON.parse(raw));
		const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
		if (oldRaw) {
			const oldData = JSON.parse(oldRaw);
			if (Array.isArray(oldData)) return migrateOldData(oldData);
		}
	} catch {}
	return getDefaultState();
}

function saveState(state) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {}
}


async function downloadXlsx({ fileName, sheets }) {
	const XLSX = (await import("xlsx-js-style")).default;
	const borderThin = { style: "thin", color: { rgb: "000000" } };
	const headerStyle = {
		fill: { fgColor: { rgb: "1F3864" } },
		font: { bold: true, color: { rgb: "FFFFFF" } },
		alignment: { horizontal: "center", vertical: "center", wrapText: true },
		border: { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin },
	};
	const cellStyle = {
		border: { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin },
	};
	const workbook = XLSX.utils.book_new();
	sheets.forEach(({ sheetName, headers, rows }) => {
		const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
		headers.forEach((_, c) => {
			const ref = XLSX.utils.encode_cell({ r: 0, c });
			if (sheet[ref]) sheet[ref].s = headerStyle;
		});
		rows.forEach((_, r) =>
			headers.forEach((__, c) => {
				const ref = XLSX.utils.encode_cell({ r: r + 1, c });
				if (sheet[ref]) sheet[ref].s = cellStyle;
			}),
		);
		XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
	});
	const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
	const byteChars = atob(base64);
	const bytes = new Uint8Array(byteChars.length);
	for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
	const blob = new Blob([bytes], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function triggerWorkbookDownload(XLSX, workbook, fileName) {
	const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
	const byteChars = atob(base64);
	const bytes = new Uint8Array(byteChars.length);
	for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
	const blob = new Blob([bytes], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// rows: [{ cells: string[], status: "ZUZYTA" | "NOWA SZPULA" | null, diffColIndex: number, diffValue: number }]
async function downloadBalanceXlsx({ fileName, sheetName, headers, rows }) {
	const XLSX = (await import("xlsx-js-style")).default;
	const borderThin = { style: "thin", color: { rgb: "000000" } };
	const border = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };
	const headerStyle = {
		fill: { fgColor: { rgb: "002060" } },
		font: { bold: true, size: 13, color: { rgb: "FFFFFF" } },
		alignment: { horizontal: "center", vertical: "center", wrapText: true },
		border,
	};

	const workbook = XLSX.utils.book_new();
	const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows.map((r) => r.cells)]);

	headers.forEach((_, c) => {
		const ref = XLSX.utils.encode_cell({ r: 0, c });
		if (sheet[ref]) sheet[ref].s = headerStyle;
	});

	rows.forEach((row, r) => {
		const rowFillRgb = row.status === "ZUZYTA" ? "FDEBEB" : row.status === "NOWA SZPULA" ? "EBF8EB" : r % 2 === 1 ? "F0F0F0" : "FFFFFF";
		row.cells.forEach((_, c) => {
			const ref = XLSX.utils.encode_cell({ r: r + 1, c });
			if (!sheet[ref]) return;
			const style = { border, fill: { fgColor: { rgb: rowFillRgb } } };
			if (c === row.diffColIndex && typeof row.diffValue === "number") {
				const bold = row.diffValue !== 0;
				const color = row.diffValue < 0 ? "C00000" : row.diffValue > 0 ? "008000" : "000000";
				style.font = { bold, color: { rgb: color } };
			}
			sheet[ref].s = style;
		});
	});

	sheet["!cols"] = headers.map((header, c) => {
		let max = String(header).length;
		rows.forEach((row) => {
			const len = String(row.cells[c] ?? "").length;
			if (len > max) max = len;
		});
		return { wch: max + 2 };
	});

	XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
	triggerWorkbookDownload(XLSX, workbook, fileName);
}


const DEFAULT_SEARCH_FILTERS = {
	frp: { item: "", diameter: "", type: "all", location: "", mmc: "all", drum: "", lengthMin: "", lengthMax: "" },
	coatedFrp: { diameter: "", location: "", drum: "", lengthMin: "", lengthMax: "" },
	filler: { diameter: "", color: "all", location: "all", incendiary: "all", drum: "", lengthMin: "", lengthMax: "" },
};

function textIncludes(value, needle) {
	const n = String(needle ?? "").trim().toLowerCase();
	if (!n) return true;
	return String(value ?? "").toLowerCase().includes(n);
}

function matchesLengthRange(value, min, max) {
	const minNum = min !== "" ? Number(min) : null;
	const maxNum = max !== "" ? Number(max) : null;
	if (minNum === null && maxNum === null) return true;
	const num = Number(value);
	if (!Number.isFinite(num)) return false;
	if (minNum !== null && num < minNum) return false;
	if (maxNum !== null && num > maxNum) return false;
	return true;
}

function matchesSearchFilters(material, item, filters) {
	const f = filters?.[material];
	if (!f) return true;
	if (material === "frp") {
		if (!textIncludes(item.itemNumber, f.item) && !textIncludes(item.frpNumber, f.item)) return false;
		if (!textIncludes(item.frpLabel || item.diameter, f.diameter)) return false;
		if (f.type !== "all" && item.type !== f.type) return false;
		if (!textIncludes(item.location, f.location)) return false;
		if (f.mmc !== "all" && Boolean(item.mmc) !== (f.mmc === "yes")) return false;
		if (!textIncludes(item.drumNumber, f.drum)) return false;
		if (!matchesLengthRange(item.length, f.lengthMin, f.lengthMax)) return false;
		return true;
	}
	if (material === "coatedFrp") {
		if (!textIncludes(item.diameter, f.diameter)) return false;
		if (!textIncludes(item.location, f.location)) return false;
		if (!textIncludes(item.drumNumber, f.drum)) return false;
		if (!matchesLengthRange(item.length, f.lengthMin, f.lengthMax)) return false;
		return true;
	}
	if (material === "filler") {
		if (!textIncludes(item.diameter, f.diameter)) return false;
		if (f.color !== "all" && item.color !== f.color) return false;
		if (f.location !== "all" && item.location !== f.location) return false;
		if (f.incendiary !== "all" && Boolean(item.isincendiary) !== (f.incendiary === "yes")) return false;
		if (!textIncludes(item.drumNumber, f.drum)) return false;
		if (!matchesLengthRange(item.length, f.lengthMin, f.lengthMax)) return false;
		return true;
	}
	return true;
}

function hasActiveSearchFilters(material, filters) {
	const f = filters?.[material];
	if (!f) return false;
	return Object.values(f).some((v) => v !== "" && v !== "all");
}

function SortableFrpRow({ frp, rowClass, onSelect, onDeselect, onRowRef, disabled, children }) {
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: frp.id, disabled });
	const style = { transform: CSS.Transform.toString(transform), transition: transition || "transform 240ms ease" };
	return (
		<tr
			ref={(node) => { setNodeRef(node); onRowRef?.(node); }}
			style={style}
			className={`${rowClass} ${isDragging ? "opacity-60" : ""}`}
			onClick={onSelect}
			onDoubleClick={onDeselect}
			{...attributes}
			{...(disabled ? {} : listeners)}>
			{children}
		</tr>
	);
}


function createDefaultDraft(material, lastLocation = "", lastFillerSettings = { color: "GRAY", location: "PRZED", isincendiary: false }) {
	if (material === "frp")
		return { itemNumber: "", frpNumber: "", frpLabel: "", frpName: "", type: "XB", mmc: false, length: "", drumNumber: "", location: lastLocation, remark: "" };
	if (material === "coatedFrp")
		return { diameter: "", length: "", drumNumber: "", location: lastLocation, remark: "" };
	if (material === "filler")
		return { color: lastFillerSettings.color, diameter: "", length: "", drumNumber: "", location: lastFillerSettings.location, isincendiary: lastFillerSettings.isincendiary, remark: "" };
	return {};
}

function createDraftFromItem(material, item) {
	if (material === "frp")
		return {
			itemNumber: digitsOnly(item.itemNumber || item.frpNumber || ""),
			frpNumber: String(item.frpNumber || item.itemNumber || ""),
			frpLabel: String(item.frpLabel || item.diameter || ""),
			frpName: String(item.frpName || ""),
			type: String(item.type || "XB"),
			mmc: Boolean(item.mmc),
			length: digitsOnly(item.length),
			drumNumber: String(item.drumNumber ?? "").trim(),
			location: String(item.location ?? "").trim(),
			remark: String(item.remark ?? "").trim(),
		};
	if (material === "coatedFrp")
		return {
			diameter: String(item.diameter ?? "").trim(),
			length: digitsOnly(item.length),
			drumNumber: String(item.drumNumber ?? "").trim(),
			location: String(item.location ?? "").trim(),
			remark: String(item.remark ?? "").trim(),
		};
	if (material === "filler")
		return {
			color: String(item.color || "GRAY"),
			diameter: String(item.diameter ?? "").trim(),
			length: digitsOnly(item.length),
			drumNumber: String(item.drumNumber ?? "").trim(),
			location: String(item.location || "PRZED"),
			isincendiary: Boolean(item.isincendiary),
			remark: String(item.remark ?? "").trim(),
		};
	return {};
}

function buildEntry(material, draft, id) {
	const base = { id };
	if (material === "frp")
		return { ...base, itemNumber: draft.frpNumber || draft.itemNumber || "", frpNumber: draft.frpNumber || draft.itemNumber || "", frpLabel: draft.frpLabel || "", frpName: draft.frpName || "", diameter: draft.frpLabel || "", type: draft.type || "XB", mmc: Boolean(draft.mmc), length: String(draft.length ?? "").trim(), drumNumber: String(draft.drumNumber ?? "").trim(), location: String(draft.location ?? "").trim(), remark: String(draft.remark ?? "").trim() };
	if (material === "coatedFrp")
		return { ...base, diameter: String(draft.diameter ?? "").trim(), length: String(draft.length ?? "").trim(), drumNumber: String(draft.drumNumber ?? "").trim(), location: String(draft.location ?? "").trim(), remark: String(draft.remark ?? "").trim() };
	if (material === "filler")
		return { ...base, color: draft.color || "GRAY", diameter: String(draft.diameter ?? "").trim(), length: String(draft.length ?? "").trim(), drumNumber: String(draft.drumNumber ?? "").trim(), location: draft.location || "PRZED", isincendiary: Boolean(draft.isincendiary), remark: String(draft.remark ?? "").trim() };
	return base;
}

function validateDraft(material, draft) {
	if (material === "frp") {
		if (!draft.itemNumber?.trim()) return "Wpisz itemId lub jego końcówkę.";
		if (!draft.frpNumber?.trim()) return "Wybierz pełny itemId albo doprecyzuj końcówkę.";
		if (!draft.length?.trim()) return "Uzupełnij długość.";
		if (!draft.drumNumber?.trim()) return "Uzupełnij numer szpuli.";
		if (!draft.location?.trim()) return "Uzupełnij lokalizację.";
	} else if (material === "coatedFrp") {
		if (!draft.diameter?.trim()) return "Uzupełnij średnicę.";
		if (!draft.length?.trim()) return "Uzupełnij długość.";
		if (!draft.drumNumber?.trim()) return "Uzupełnij numer szpuli.";
		if (!draft.location?.trim()) return "Uzupełnij lokalizację.";
	} else if (material === "filler") {
		if (!draft.color) return "Wybierz kolor.";
		if (!draft.diameter?.trim()) return "Uzupełnij średnicę.";
		if (!draft.length?.trim()) return "Uzupełnij długość.";
		if (!draft.drumNumber?.trim()) return "Uzupełnij numer szpuli.";
		if (!draft.location) return "Wybierz lokalizację.";
	}
	return null;
}


export default function Home() {
	const [loaded, setLoaded] = useState(false);
	const [activeMaterial, setActiveMaterial] = useState(null);

	const [stocks, setStocks] = useState({ frp: [], coatedFrp: [], filler: [] });
	const [statusMap, setStatusMap] = useState({ frp: {}, coatedFrp: {}, filler: {} });
	const [stockCompleted, setStockCompleted] = useState({ frp: false, coatedFrp: false, filler: false });
	const [selectedIds, setSelectedIds] = useState({ frp: null, coatedFrp: null, filler: null });
	const [frpDb, setFrpDb] = useState(DEFAULT_FRP_DB);
	const [frpMasked, setFrpMasked] = useState(false);
	const [lastLocation, setLastLocation] = useState("");
	const [lastFillerSettings, setLastFillerSettings] = useState({ color: "GRAY", location: "PRZED", isincendiary: false });
	const [frpStockHistory, setFrpStockHistory] = useState([]);

	const [sheetVisible, setSheetVisible] = useState(false);
	const [sheetMaterial, setSheetMaterial] = useState(null);
	const [sheetMode, setSheetMode] = useState("add");
	const [sheetEditingId, setSheetEditingId] = useState(null);
	const [sheetDraft, setSheetDraft] = useState(null);
	const [sheetError, setSheetError] = useState("");

	const [calcVisible, setCalcVisible] = useState(false);
	const [calcField, setCalcField] = useState(null);
	const [calcDisplay, setCalcDisplay] = useState("0");
	const [calcStored, setCalcStored] = useState(null);
	const [calcOp, setCalcOp] = useState(null);
	const [calcResetNext, setCalcResetNext] = useState(true);

	const [scannerVisible, setScannerVisible] = useState(false);
	const [scannerError, setScannerError] = useState("");
	const [torchOn, setTorchOn] = useState(false);
	const [torchSupported, setTorchSupported] = useState(false);
	const scannerVideoRef = useRef(null);
	const scannerControlsRef = useRef(null);
	const scannerTrackRef = useRef(null);

	const [frpDbVisible, setFrpDbVisible] = useState(false);
	const [frpDbSheetVisible, setFrpDbSheetVisible] = useState(false);
	const [frpDbDraft, setFrpDbDraft] = useState(null);
	const [frpDbMode, setFrpDbMode] = useState("add");
	const [frpDbEditingNumber, setFrpDbEditingNumber] = useState(null);

	const [activeDragId, setActiveDragId] = useState(null);
	const [itemIdDisplayMode, setItemIdDisplayMode] = useState("full");
	const [dragLocked, setDragLocked] = useState({ frp: false, coatedFrp: false, filler: false });
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchFilters, setSearchFilters] = useState(DEFAULT_SEARCH_FILTERS);
	const [toasts, setToasts] = useState([]);

	function showToast(message, type = "info") {
		const id = createId();
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
	}

	function dismissToast(id) {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}

	const tableScrollRef = useRef(null);
	const rowRefs = useRef(new Map());
	const scrollPositionsRef = useRef({});
	const undoStackRef = useRef([]);
	const [canUndo, setCanUndo] = useState(false);

	function pushUndoSnapshot() {
		undoStackRef.current.push({ stocks, statusMap, stockCompleted, selectedIds });
		if (undoStackRef.current.length > 20) undoStackRef.current.shift();
		setCanUndo(true);
	}

	function handleUndo() {
		const snap = undoStackRef.current.pop();
		if (!snap) return;
		setStocks(snap.stocks);
		setStatusMap(snap.statusMap);
		setStockCompleted(snap.stockCompleted);
		setSelectedIds(snap.selectedIds);
		setCanUndo(undoStackRef.current.length > 0);
	}


	useEffect(() => {
		const s = loadState();
		setStocks(s.stocks);
		setStatusMap(s.statusMap);
		setStockCompleted(s.stockCompleted);
		setSelectedIds(s.selectedIds);
		setFrpDb(s.frpDb);
		setFrpMasked(s.frpMasked);
		setLastLocation(s.lastLocation);
		setLastFillerSettings(s.lastFillerSettings);
		setFrpStockHistory(s.frpStockHistory);
		setLoaded(true);
		window.history.replaceState({ material: null }, "");
	}, []);

	useEffect(() => {
		function onPopState(e) {
			setActiveMaterial(e.state?.material ?? null);
		}
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	useEffect(() => {
		if (!activeMaterial || !("wakeLock" in navigator)) return;
		let wakeLock = null;
		let cancelled = false;
		async function requestWakeLock() {
			try {
				wakeLock = await navigator.wakeLock.request("screen");
			} catch {
				wakeLock = null;
			}
		}
		function onVisibilityChange() {
			if (!cancelled && document.visibilityState === "visible" && !wakeLock) {
				requestWakeLock();
			}
		}
		requestWakeLock();
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			cancelled = true;
			document.removeEventListener("visibilitychange", onVisibilityChange);
			wakeLock?.release().catch(() => {});
			wakeLock = null;
		};
	}, [activeMaterial]);

	function openMaterial(key) {
		window.history.pushState({ material: key }, "");
		setActiveMaterial(key);
	}

	function goToMenu() {
		if (window.history.state?.material) {
			window.history.back();
		} else {
			setActiveMaterial(null);
		}
	}

	function handleTableScroll(e) {
		if (!activeMaterial) return;
		scrollPositionsRef.current[activeMaterial] = e.currentTarget.scrollTop;
	}

	useLayoutEffect(() => {
		if (activeMaterial && tableScrollRef.current) {
			tableScrollRef.current.scrollTop = scrollPositionsRef.current[activeMaterial] ?? 0;
		}
	}, [activeMaterial]);

	useEffect(() => {
		if (!loaded) return;
		saveState({ stocks, statusMap, stockCompleted, selectedIds, frpDb, frpMasked, lastLocation, lastFillerSettings, frpStockHistory });
	}, [loaded, stocks, statusMap, stockCompleted, selectedIds, frpDb, frpMasked, lastLocation, lastFillerSettings, frpStockHistory]);


	const activeItems = useMemo(
		() => (activeMaterial ? stocks[activeMaterial] ?? [] : []),
		[activeMaterial, stocks],
	);
	const activeSelectedId = activeMaterial ? selectedIds[activeMaterial] : null;
	const activeSelectedItem = useMemo(
		() => activeItems.find((i) => i.id === activeSelectedId) ?? null,
		[activeItems, activeSelectedId],
	);
	const activeStatusMap = useMemo(
		() => (activeMaterial ? statusMap[activeMaterial] ?? {} : {}),
		[activeMaterial, statusMap],
	);
	const isStockCompleted = activeMaterial ? Boolean(stockCompleted[activeMaterial]) : false;
	const isDragLocked = isStockCompleted || Boolean(activeMaterial && dragLocked[activeMaterial]);
	const isSearchActive = Boolean(activeMaterial && hasActiveSearchFilters(activeMaterial, searchFilters));
	const displayedItems = useMemo(
		() => (activeMaterial ? activeItems.filter((item) => matchesSearchFilters(activeMaterial, item, searchFilters)) : []),
		[activeMaterial, activeItems, searchFilters],
	);
	const allStatusesMarked =
		Boolean(activeMaterial) &&
		!isStockCompleted &&
		activeItems.length > 0 &&
		activeItems.every((item) => item.id in activeStatusMap);
	const finishedYesCount = activeItems.filter((i) => activeStatusMap[i.id] === true).length;
	const finishedNoCount = activeItems.filter((i) => activeStatusMap[i.id] === false).length;

	const duplicateDrums = useMemo(() => {
		const seen = new Set();
		const dupes = new Set();
		for (const item of [...stocks.frp, ...stocks.coatedFrp, ...stocks.filler]) {
			const drum = String(item.drumNumber ?? "").trim();
			if (!drum) continue;
			if (seen.has(drum)) dupes.add(drum);
			seen.add(drum);
		}
		return dupes;
	}, [stocks]);

	const sheetDrumDuplicate = useMemo(() => {
		if (sheetMode === "transfer") return false;
		const drum = String(sheetDraft?.drumNumber ?? "").trim();
		if (!drum) return false;
		const excludeId = sheetMode === "edit" ? sheetEditingId : null;
		return allDrums(excludeId).some((i) => String(i.drumNumber ?? "").trim() === drum);
	}, [sheetDraft?.drumNumber, sheetMode, sheetEditingId, stocks]);

	const frpMatchCandidates = useMemo(() => {
		if (!sheetDraft?.itemNumber || sheetMaterial !== "frp") return [];
		return findFrpCandidates(sheetDraft.itemNumber, frpDb);
	}, [sheetDraft?.itemNumber, sheetMaterial, frpDb]);

	const frpMatchedItem = frpMatchCandidates.length === 1 ? frpMatchCandidates[0] : null;

	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
	);


	function closeSheet() {
		setSheetVisible(false);
		setSheetError("");
	}

	function openAddSheet(material) {
		setSheetMode("add");
		setSheetEditingId(null);
		setSheetMaterial(material);
		setSheetDraft(createDefaultDraft(material, lastLocation, lastFillerSettings));
		setSheetError("");
		setSheetVisible(true);
	}

	function openEditSheet(item) {
		if (!activeMaterial || !item) return;
		setSheetMode("edit");
		setSheetEditingId(item.id);
		setSheetMaterial(activeMaterial);
		setSheetDraft(createDraftFromItem(activeMaterial, item));
		setSheetError("");
		setSelectedIds((prev) => ({ ...prev, [activeMaterial]: item.id }));
		setSheetVisible(true);
	}

	function openTransferSheet() {
		if (!activeMaterial || !activeSelectedItem) return;
		setSheetMode("transfer");
		setSheetEditingId(activeSelectedItem.id);
		setSheetMaterial(activeMaterial);
		setSheetDraft({ drumNumber: "", length: "", location: activeMaterial === "filler" ? "PRZED" : lastLocation, remark: "" });
		setSheetError("");
		setSheetVisible(true);
	}

	function updateSheetField(key, value) {
		setSheetDraft((prev) => {
			const next = { ...prev };
			if (key === "itemNumber" || key === "length") value = digitsOnly(value);
			next[key] = value;

			if (sheetMaterial === "frp" && key === "itemNumber") {
				const matched = findFrpBySuffix(value, frpDb);
				if (matched) {
					next.frpNumber = matched.number;
					next.frpLabel = matched.label;
					next.frpName = matched.name;
					next.type = matched.type;
					next.mmc = matched.mmc;
				} else {
					next.frpNumber = "";
					next.frpLabel = "";
					next.frpName = "";
				}
			}

			if (sheetMode === "transfer" && key === "drumNumber") {
				const trimmed = String(value).trim();
				const matched = activeItems.find((i) => String(i.drumNumber ?? "").trim() === trimmed);
				if (matched) {
					next.length = digitsOnly(matched.length);
					next.location = String(matched.location ?? "").trim() || (sheetMaterial === "filler" ? "PRZED" : "");
					next.remark = String(matched.remark ?? "").trim();
				} else {
					next.length = "";
					next.location = sheetMaterial === "filler" ? "PRZED" : "";
					next.remark = "";
				}
			}

			return next;
		});
	}

	function selectFrpMatch(item) {
		setSheetDraft((prev) => ({
			...prev,
			itemNumber: item.number,
			frpNumber: item.number,
			frpLabel: item.label,
			frpName: item.name,
			type: item.type,
			mmc: item.mmc,
		}));
	}

	function saveSheet(e) {
		e?.preventDefault();
		setSheetError("");
		if (!sheetMaterial || !sheetDraft) return;
		if (sheetMode === "transfer") { handleTransfer(); return; }
		if (sheetMode === "edit") { handleEdit(); return; }
		handleAdd();
	}

	function allDrums(excludeId = null) {
		return [...stocks.frp, ...stocks.coatedFrp, ...stocks.filler].filter((i) => i.id !== excludeId);
	}

	function handleAdd() {
		const err = validateDraft(sheetMaterial, sheetDraft);
		if (err) { setSheetError(err); return; }
		pushUndoSnapshot();
		const newId = createId();
		const entry = buildEntry(sheetMaterial, sheetDraft, newId);
		if (entry.location) setLastLocation(entry.location);
		if (sheetMaterial === "filler") {
			setLastFillerSettings({ color: entry.color, location: entry.location, isincendiary: Boolean(entry.isincendiary) });
		}

		const mat = sheetMaterial;
		const hadSelection = Boolean(selectedIds[mat]);
		setStocks((prev) => {
			const list = prev[mat] ?? [];
			const selId = selectedIds[mat];
			const insertIdx = selId ? list.findIndex((i) => i.id === selId) : -1;
			const idx = insertIdx >= 0 ? insertIdx : list.length;
			const next = [...list];
			next.splice(idx, 0, entry);
			return { ...prev, [mat]: next };
		});
		if (hadSelection) setSelectedIds((prev) => ({ ...prev, [mat]: newId }));
		closeSheet();
		requestAnimationFrame(() => scrollRowIntoView(newId));
	}

	function handleEdit() {
		const err = validateDraft(sheetMaterial, sheetDraft);
		if (err) { setSheetError(err); return; }
		pushUndoSnapshot();
		const updated = buildEntry(sheetMaterial, sheetDraft, sheetEditingId);
		if (updated.location) setLastLocation(updated.location);
		const mat = sheetMaterial;
		const id = sheetEditingId;
		setStocks((prev) => ({
			...prev,
			[mat]: (prev[mat] ?? []).map((i) => (i.id === id ? updated : i)),
		}));
		setSelectedIds((prev) => ({ ...prev, [mat]: id }));
		closeSheet();
		requestAnimationFrame(() => scrollRowIntoView(id));
	}

	function handleTransfer() {
		const drum = String(sheetDraft.drumNumber ?? "").trim();
		if (!drum) { setSheetError("Wpisz numer szpuli."); return; }
		if (!String(sheetDraft.length ?? "").trim()) { setSheetError("Uzupełnij długość."); return; }
		if (sheetMaterial !== "filler" && !String(sheetDraft.location ?? "").trim()) { setSheetError("Uzupełnij lokalizację."); return; }

		const currentList = stocks[sheetMaterial] ?? [];
		const srcIdx = currentList.findIndex((i) => String(i.drumNumber ?? "").trim() === drum);
		if (srcIdx < 0) { setSheetError("Taki numer szpuli nie istnieje na liście."); return; }

		const srcItem = currentList[srcIdx];
		const updated = { ...srcItem, length: String(sheetDraft.length ?? "").trim(), location: String(sheetDraft.location ?? "").trim(), remark: String(sheetDraft.remark ?? "").trim() };
		const targetId = sheetEditingId;
		const mat = sheetMaterial;

		pushUndoSnapshot();
		setStocks((prev) => {
			const list = [...(prev[mat] ?? [])];
			if (srcItem.id === targetId) {
				const i = list.findIndex((x) => x.id === srcItem.id);
				if (i >= 0) list[i] = updated;
				return { ...prev, [mat]: list };
			}
			const filtered = list.filter((x) => x.id !== srcItem.id);
			const tIdx = filtered.findIndex((x) => x.id === targetId);
			filtered.splice(tIdx >= 0 ? tIdx : filtered.length, 0, updated);
			return { ...prev, [mat]: filtered };
		});

		if (updated.location) setLastLocation(updated.location);
		setSelectedIds((prev) => ({ ...prev, [mat]: srcItem.id }));
		closeSheet();
		requestAnimationFrame(() => scrollRowIntoView(srcItem.id));
	}

	function deleteItem() {
		if (!sheetMaterial || !sheetEditingId) return;
		if (!window.confirm("Na pewno chcesz usunąć ten wpis?")) return;
		pushUndoSnapshot();
		const mat = sheetMaterial;
		const id = sheetEditingId;
		setStatusMap((prev) => {
			const m = { ...prev[mat] };
			delete m[id];
			return { ...prev, [mat]: m };
		});
		setStocks((prev) => {
			const next = (prev[mat] ?? []).filter((i) => i.id !== id);
			setSelectedIds((s) => ({ ...s, [mat]: next[0]?.id ?? null }));
			return { ...prev, [mat]: next };
		});
		closeSheet();
	}


	function markStatus(value) {
		if (!activeMaterial || !activeSelectedItem) return;
		const id = activeSelectedItem.id;
		const mat = activeMaterial;
		pushUndoSnapshot();
		setStatusMap((prev) => ({ ...prev, [mat]: { ...prev[mat], [id]: value } }));
		const idx = activeItems.findIndex((i) => i.id === id);
		const next = activeItems[idx + 1] ?? activeItems[0] ?? null;
		if (next) {
			setSelectedIds((prev) => ({ ...prev, [mat]: next.id }));
			requestAnimationFrame(() => scrollRowIntoView(next.id));
		}
	}

	function startNewStock() {
		if (!activeMaterial) return;
		if (!window.confirm("Usunąć pozycje oznaczone jako 'Brak' i wyczyścić statusy?")) return;
		pushUndoSnapshot();
		const mat = activeMaterial;
		const keptIds = new Set(
			Object.entries(activeStatusMap)
				.filter(([, v]) => v === true)
				.map(([k]) => k),
		);
		const nextList = (stocks[mat] ?? []).filter((i) => keptIds.has(i.id));
		setStocks((prev) => ({ ...prev, [mat]: nextList }));
		setStatusMap((prev) => ({ ...prev, [mat]: {} }));
		setSelectedIds((prev) => ({ ...prev, [mat]: nextList[0]?.id ?? null }));
		setStockCompleted((prev) => ({ ...prev, [mat]: false }));
	}

	async function exportStock() {
		if (!activeMaterial) return;
		const mat = activeMaterial;
		const yesItems = activeItems.filter((i) => activeStatusMap[i.id] === true);
		const timestamp = formatExportTimestamp();
		let sheets;
		let summary;

		if (mat === "frp") {
			const frpItems = yesItems.filter((i) => !resolveFrpMmc(i, frpDb));
			const mmcItems = yesItems.filter((i) => resolveFrpMmc(i, frpDb));
			sheets = [
				{ sheetName: "FRP", headers: ["ITEM", "DIAMETER / ŚREDNICA", "LENGTH / DŁUGOŚĆ [KM]", "DRUM NUMBER / NR SZPULI", "XB / Z", "LOCALIZATION / LOKALIZACJA", "REMARKS / UWAGI"], rows: frpItems.map((i) => [String(i.frpNumber ?? i.itemNumber ?? ""), resolveFrpFullName(i, frpDb), formatLengthKmExport(i.length), String(i.drumNumber ?? ""), String(i.type ?? ""), String(i.location ?? ""), String(i.remark ?? "")]) },
				{ sheetName: "FRP MMC", headers: ["ITEM", "DIAMETER / ŚREDNICA", "LENGTH / DŁUGOŚĆ [KM]", "DRUM NUMBER / NR SZPULI", "LOCALIZATION / LOKALIZACJA", "REMARKS / UWAGI"], rows: mmcItems.map((i) => [String(i.frpNumber ?? i.itemNumber ?? ""), resolveFrpFullName(i, frpDb), formatLengthKmExport(i.length), String(i.drumNumber ?? ""), String(i.location ?? ""), String(i.remark ?? "")]) },
			];
			summary = `Jest: ${finishedYesCount}, Brak: ${finishedNoCount}.\nWyeksportowano: ${frpItems.length} FRP i ${mmcItems.length} FRP MMC.`;
		} else if (mat === "coatedFrp") {
			sheets = [{ sheetName: "Coated FRP", headers: ["DIAMETER / ŚREDNICA", "LENGTH / DŁUGOŚĆ [KM]", "DRUM NUMBER / NR SZPULI", "LOCALIZATION / LOKALIZACJA", "REMARKS / UWAGI"], rows: yesItems.map((i) => [String(i.diameter ?? ""), formatLengthKmExport(i.length), String(i.drumNumber ?? ""), String(i.location ?? ""), String(i.remark ?? "")]) }];
			summary = `Jest: ${finishedYesCount}, Brak: ${finishedNoCount}.\nWyeksportowano: ${yesItems.length} Coated FRP.`;
		} else {
			sheets = [{ sheetName: "Filler", headers: ["NO. / NR", "COLOUR / KOLOR", "DIAMETER / ŚREDNICA", "LENGTH / DŁUGOŚĆ", "DRUM NUMBER / NR SZPULI", "NIEPALNY / ZWYKŁY", "PRZED / ZA FILLEREM", "REMARKS / UWAGI"], rows: yesItems.map((i, idx) => [String(idx + 1), String(i.color ?? ""), String(i.diameter ?? ""), formatLengthKmExport(i.length), String(i.drumNumber ?? ""), i.isincendiary ? "NIEPALNY" : "ZWYKŁY", String(i.location ?? ""), String(i.remark ?? "")]) }];
			summary = `Jest: ${finishedYesCount}, Brak: ${finishedNoCount}.\nWyeksportowano: ${yesItems.length} Filler.`;
		}

		try {
			await downloadXlsx({ fileName: `stock_${mat}_${timestamp}.xlsx`, sheets });
			pushUndoSnapshot();
			setStockCompleted((prev) => ({ ...prev, [mat]: true }));
			if (mat === "frp") {
				const snapshotItems = yesItems.map((i) => ({
					drumNumber: String(i.drumNumber ?? "").trim(),
					itemNumber: String(i.frpNumber ?? i.itemNumber ?? ""),
					name: resolveFrpFullName(i, frpDb),
					length: String(i.length ?? ""),
				}));
				setFrpStockHistory((prev) => [...prev, { date: formatDateYMD(), items: snapshotItems }].slice(-5));
			}
			showToast(`Stock zakończony!\n${summary}`, "success");
		} catch (err) {
			showToast("Błąd eksportu: " + err.message, "error");
		}
	}

	function generateBalance() {
		if (activeMaterial !== "frp") return;
		const history = frpStockHistory;
		if (history.length < 2) return;
		const prevSnap = history[history.length - 2];
		const currSnap = history[history.length - 1];

		const prevMap = new Map(prevSnap.items.map((i) => [i.drumNumber, i]));
		const currMap = new Map(currSnap.items.map((i) => [i.drumNumber, i]));
		const drums = [...new Set([...prevMap.keys(), ...currMap.keys()])].filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

		const rows = drums.map((drum) => {
			const prevItem = prevMap.get(drum);
			const currItem = currMap.get(drum);
			const source = currItem ?? prevItem;
			const prevMeters = prevItem ? Number(digitsOnly(prevItem.length)) : 0;
			const currMeters = currItem ? Number(digitsOnly(currItem.length)) : 0;
			const diffMeters = currMeters - prevMeters;
			const status = prevItem && !currItem ? "ZUZYTA" : !prevItem && currItem ? "NOWA SZPULA" : "";

			return {
				cells: [
					source.itemNumber ?? "",
					source.name ?? "",
					drum,
					prevItem ? formatLengthKmExport(prevItem.length) : "",
					currItem ? formatLengthKmExport(currItem.length) : "",
					formatDiffKm(diffMeters, status !== "NOWA SZPULA"),
					status,
				],
				status: status || null,
				diffColIndex: 5,
				diffValue: diffMeters,
			};
		});

		const headers = ["ITEM", "NAZWA", "SZPULA", `DŁUGOŚĆ ${prevSnap.date}`, `DŁUGOŚĆ ${currSnap.date}`, "RÓŻNICA", "INFO"];
		downloadBalanceXlsx({
			fileName: `bilans_${activeMaterial}_${formatExportTimestamp()}.xlsx`,
			sheetName: "Bilans",
			headers,
			rows,
		});
	}


	function openCalculator(field) {
		setCalcField(field);
		setCalcDisplay(String(sheetDraft?.[field] ?? "0") || "0");
		setCalcStored(null);
		setCalcOp(null);
		setCalcResetNext(true);
		setCalcVisible(true);
	}

	function closeCalculator() {
		setCalcVisible(false);
		setCalcField(null);
	}

	function openScanner() {
		setScannerError("");
		setTorchOn(false);
		setTorchSupported(false);
		setScannerVisible(true);
	}

	function closeScanner() {
		scannerControlsRef.current?.stop();
		scannerControlsRef.current = null;
		scannerTrackRef.current = null;
		setTorchOn(false);
		setScannerVisible(false);
	}

	async function toggleTorch() {
		const track = scannerTrackRef.current;
		if (!track) return;
		const next = !torchOn;
		try {
			await track.applyConstraints({ advanced: [{ torch: next }] });
			setTorchOn(next);
		} catch {
			setTorchSupported(false);
			showToast("Latarka niedostępna na tym urządzeniu.", "error");
		}
	}

	function handleScanResult(text) {
		const parts = String(text ?? "").split("#");
		const itemPart = parts[0]?.trim();
		if (!itemPart) return;
		updateSheetField("itemNumber", itemPart);
		if (parts.length > 1) {
			const lengthKm = Number(parts[parts.length - 1].trim().replace(",", "."));
			if (Number.isFinite(lengthKm) && lengthKm > 0) {
				updateSheetField("length", String(Math.round(lengthKm * 1000)));
			}
		}
		closeScanner();
	}

	useEffect(() => {
		if (!scannerVisible) return;
		let cancelled = false;
		scannerTrackRef.current = null;
		const hints = new Map();
		hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
		hints.set(DecodeHintType.TRY_HARDER, true);
		const codeReader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 100, delayBetweenScanSuccess: 300 });
		const constraints = {
			video: {
				facingMode: "environment",
				width: { ideal: 1920 },
				height: { ideal: 1080 },
				advanced: [{ focusMode: "continuous" }],
			},
		};
		codeReader
			.decodeFromConstraints(constraints, scannerVideoRef.current, (result, _err, controls) => {
				scannerControlsRef.current = controls;
				if (!cancelled && !scannerTrackRef.current) {
					const track = scannerVideoRef.current?.srcObject?.getVideoTracks?.()[0];
					if (track) {
						scannerTrackRef.current = track;
						setTorchSupported(true);
					}
				}
				if (result) handleScanResult(result.getText());
			})
			.catch(() => {
				if (!cancelled) setScannerError("Nie udało się uruchomić kamery. Sprawdź uprawnienia.");
			});
		return () => {
			cancelled = true;
			scannerControlsRef.current?.stop();
			scannerControlsRef.current = null;
			scannerTrackRef.current = null;
		};
	}, [scannerVisible]);

	function calcApplyOp(a, b, op) {
		if (op === "+") return a + b;
		if (op === "-") return a - b;
		if (op === "*") return a * b;
		if (op === "/") return b === 0 ? NaN : a / b;
		return b;
	}

	function pressCalcDigit(digit) {
		if (calcResetNext) { setCalcDisplay(digit); setCalcResetNext(false); return; }
		setCalcDisplay((prev) => (prev === "0" ? digit : prev + digit));
	}

	function pressCalcDecimal() {
		if (calcResetNext) { setCalcDisplay("0."); setCalcResetNext(false); return; }
		setCalcDisplay((prev) => (prev.includes(".") ? prev : prev + "."));
	}

	function pressCalcOp(op) {
		const cur = parseFloat(calcDisplay);
		if (calcStored !== null && calcOp && !calcResetNext) {
			const result = calcApplyOp(calcStored, cur, calcOp);
			setCalcStored(result);
			setCalcDisplay(String(result));
		} else {
			setCalcStored(cur);
		}
		setCalcOp(op);
		setCalcResetNext(true);
	}

	function pressCalcEquals() {
		if (!calcOp || calcStored === null) return;
		const result = calcApplyOp(calcStored, parseFloat(calcDisplay), calcOp);
		setCalcDisplay(Number.isFinite(result) ? String(result) : "Błąd");
		setCalcStored(null);
		setCalcOp(null);
		setCalcResetNext(true);
	}

	function pressCalcClear() {
		setCalcDisplay("0");
		setCalcStored(null);
		setCalcOp(null);
		setCalcResetNext(true);
	}

	function pressCalcBackspace() {
		if (calcResetNext) { setCalcDisplay("0"); return; }
		setCalcDisplay((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
	}

	function transferCalcResult() {
		if (!calcField) return;
		const value = parseFloat(calcDisplay);
		if (!Number.isFinite(value)) { showToast("Wynik nie jest poprawną liczbą.", "error"); return; }
		updateSheetField(calcField, String(Math.round(value)));
		closeCalculator();
	}

	function openAddFrpDbSheet() {
		setFrpDbMode("add");
		setFrpDbEditingNumber(null);
		setFrpDbDraft({ number: "", label: "", name: "", type: "XB", mmc: false });
		setFrpDbSheetVisible(true);
	}

	function openEditFrpDbSheet(item) {
		setFrpDbMode("edit");
		setFrpDbEditingNumber(item.number);
		setFrpDbDraft({ number: String(item.number ?? ""), label: String(item.label ?? ""), name: String(item.name ?? ""), type: String(item.type ?? "XB"), mmc: Boolean(item.mmc) });
		setFrpDbSheetVisible(true);
	}

	function closeFrpDbSheet() {
		setFrpDbSheetVisible(false);
		setFrpDbDraft(null);
	}

	function saveFrpDbDraft() {
		if (!frpDbDraft) return;
		const number = digitsOnly(frpDbDraft.number);
		const label = String(frpDbDraft.label ?? "").trim();
		const name = String(frpDbDraft.name ?? "").trim();
		const type = String(frpDbDraft.type ?? "").trim();
		if (!number || !label || !name || !type) { showToast("Uzupełnij wszystkie pola.", "error"); return; }
		if (frpDb.some((i) => i.number === number && i.number !== frpDbEditingNumber)) { showToast("Ten numer FRP już istnieje w bazie.", "error"); return; }
		const entry = { number, label, name, type, mmc: Boolean(frpDbDraft.mmc) };
		setFrpDb((prev) =>
			frpDbMode === "edit" && frpDbEditingNumber
				? prev.map((i) => (i.number === frpDbEditingNumber ? entry : i))
				: [...prev, entry],
		);
		closeFrpDbSheet();
	}

	function deleteFrpDbItem() {
		if (!frpDbEditingNumber) return;
		if (!window.confirm("Na pewno chcesz usunąć ten wpis z bazy?")) return;
		setFrpDb((prev) => prev.filter((i) => i.number !== frpDbEditingNumber));
		closeFrpDbSheet();
	}


	function exportBackup() {
		const data = {
			version: 1,
			exportedAt: new Date().toISOString(),
			stocks,
			statusMap,
			stockCompleted,
			selectedIds,
			frpDb,
			frpMasked,
			lastLocation,
			lastFillerSettings,
			frpStockHistory,
		};
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ystock_backup_${formatExportTimestamp()}.json`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 5000);
	}

	const importInputRef = useRef(null);

	function triggerImport() {
		importInputRef.current?.click();
	}

	function handleImportFile(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const parsed = JSON.parse(ev.target.result);
				const state = normalizeState(parsed);
				if (!window.confirm("Zastąpić wszystkie aktualne dane danymi z pliku?\nTa operacja nadpisze listy FRP, Coated FRP, Filler, statusy i bazę FRP.")) return;
				setStocks(state.stocks);
				setStatusMap(state.statusMap);
				setStockCompleted(state.stockCompleted);
				setSelectedIds(state.selectedIds);
				setFrpDb(state.frpDb);
				setFrpMasked(state.frpMasked);
				setLastLocation(state.lastLocation);
				setLastFillerSettings(state.lastFillerSettings);
				setFrpStockHistory(state.frpStockHistory);
			} catch {
				showToast("Nie udało się odczytać pliku. Upewnij się, że to poprawny plik backup (.json).", "error");
			}
		};
		reader.readAsText(file);
		e.target.value = "";
	}


	function handleDragStart(event) {
		if (!activeMaterial) return;
		setActiveDragId(event.active.id);
		setSelectedIds((prev) => ({ ...prev, [activeMaterial]: event.active.id }));
	}
	function handleDragCancel() { setActiveDragId(null); }
	function handleDragEnd(event) {
		const { active, over } = event;
		setActiveDragId(null);
		if (!activeMaterial || !over || active.id === over.id) return;
		const mat = activeMaterial;
		const list = stocks[mat];
		const oldIdx = list.findIndex((i) => i.id === active.id);
		const newIdx = list.findIndex((i) => i.id === over.id);
		if (oldIdx < 0 || newIdx < 0) return;
		const next = arrayMove(list, oldIdx, newIdx);
		pushUndoSnapshot();
		setStocks((prev) => ({ ...prev, [mat]: next }));
		setSelectedIds((prev) => ({ ...prev, [mat]: active.id }));
		requestAnimationFrame(() => scrollRowIntoView(active.id));
	}

	function scrollRowIntoView(id) {
		rowRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
	}

	function updateSearchFilter(key, value) {
		if (!activeMaterial) return;
		setSearchFilters((prev) => ({ ...prev, [activeMaterial]: { ...prev[activeMaterial], [key]: value } }));
	}

	function clearSearchFilters() {
		if (!activeMaterial) return;
		setSearchFilters((prev) => ({ ...prev, [activeMaterial]: DEFAULT_SEARCH_FILTERS[activeMaterial] }));
	}


	function getRowClass(material, item, index) {
		const isSelected = item.id === selectedIds[material];
		const rowStatus = statusMap[material]?.[item.id];
		const isDupe = duplicateDrums.has(String(item.drumNumber ?? "").trim());
		const statusClass = isSelected
			? "bg-blue-400 text-white"
			: rowStatus === true
				? "bg-emerald-100"
				: rowStatus === false
					? "bg-rose-50"
					: index % 2 === 0
						? "bg-white"
						: "bg-slate-50";
		const dupeClass = isDupe ? "border-l-4 border-l-amber-400" : "";
		return `cursor-pointer ${statusClass} ${dupeClass}`;
	}

	function getStatusLabel(material, itemId) {
		const v = statusMap[material]?.[itemId];
		if (v === true) return { label: "Jest", cls: "text-emerald-700" };
		if (v === false) return { label: "Brak", cls: "text-rose-700" };
		return { label: "-", cls: "text-slate-400" };
	}

	function formatItemNumber(value) {
		const text = String(value ?? "");
		if (!text || (!frpMasked && itemIdDisplayMode !== "short")) return text;
		return text.length <= 3 ? text : text.slice(-3);
	}


	const inputCls = "w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500";
	const inputReadonlyCls = "w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none";
	const labelCls = "flex flex-col gap-1";
	const labelTextCls = "text-sm text-slate-600";

	function ToggleGroup({ options, value, onChange }) {
		return (
			<div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
				{options.map((opt) => (
					<button
						key={opt}
						type="button"
						onClick={() => onChange(opt)}
						className={`flex-1 rounded px-3 py-1.5 text-sm font-bold transition ${value === opt ? "bg-blue-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
						{opt}
					</button>
				))}
			</div>
		);
	}

	function ToggleSwitch({ value, onChange }) {
		return (
			<button
				type="button"
				onClick={() => onChange(!value)}
				className={`relative h-7 w-13 rounded-full transition-colors ${value ? "bg-blue-800" : "bg-slate-200"}`}>
				<span
					className={`absolute top-0.5 h-6 w-6 left-0.5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-0"}`}
				/>
			</button>
		);
	}


	function CalcButton({ onClick }) {
		return (
			<button type="button" onClick={onClick} className="shrink-0 rounded-md bg-blue-900 px-3 py-2 text-white transition hover:bg-blue-800" title="Kalkulator">
				<svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L64 0zM96 64l192 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32L96 160c-17.7 0-32-14.3-32-32l0-32c0-17.7 14.3-32 32-32zm16 168a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zm80 24a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm128-24a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zM88 352a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm128-24a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zm80 24a24 24 0 1 1 0-48 24 24 0 1 1 0 48zM64 424c0-13.3 10.7-24 24-24l112 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 448c-13.3 0-24-10.7-24-24zm232-24c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24z" /></svg>
			</button>
		);
	}

	if (!loaded) return null;

	if (!activeMaterial) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6">
				<h1 className="text-center text-3xl font-extrabold text-slate-900">Stocki materiałów</h1>

				<div className="mt-8 flex w-full max-w-sm flex-col gap-4">
					{Object.entries(MATERIALS).map(([key, mat]) => (
						<button
							key={key}
							onClick={() => openMaterial(key)}
							className="w-full rounded-2xl bg-blue-900 px-5 py-5 text-lg font-extrabold text-white transition hover:bg-blue-800">
							{mat.label}
							{(stocks[key]?.length ?? 0) > 0 && (
								<span className="ml-2 text-sm font-normal opacity-70">
									({stocks[key].length} poz.)
								</span>
							)}
						</button>
					))}
				</div>

				<div className="mt-auto w-full max-w-sm pt-8">
					<button
						onClick={() => setFrpDbVisible(true)}
						className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-5 text-lg font-extrabold text-slate-800 transition hover:bg-slate-50">
						Baza FRP
					</button>
					<div className="flex gap-3 mt-3">
						<button
							onClick={exportBackup}
							className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
							⬇ Eksportuj backup
						</button>
						<button
							onClick={triggerImport}
							className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
							⬆ Importuj backup
						</button>
					</div>
					<input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
				</div>
				<div className="mt-3">
					<p className="text-neutral-400">Creted by <span className="font-bold">Barłomiej Grotek</span></p>
				</div>

				{/* FRP DB list modal */}
				<AnimatePresence>
					{frpDbVisible && (
						<motion.div
							className="fixed inset-0 z-50 bg-slate-950/45"
							initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
							transition={{ duration: 0.22 }}
							onClick={() => setFrpDbVisible(false)}>
							<motion.div
								className="absolute inset-x-0 bottom-0"
								initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
								transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
								onClick={(e) => e.stopPropagation()}>
								<div className="mx-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl">
									<div className="mb-4 flex items-start justify-between gap-4">
										<div>
											<h2 className="text-2xl font-semibold text-slate-900">Baza FRP</h2>
											<p className="mt-1 text-sm text-slate-500">Przytrzymaj (długie kliknięcie) pozycję, aby ją edytować.</p>
										</div>
										<button onClick={() => setFrpDbVisible(false)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Zamknij</button>
									</div>
									<div className="flex flex-col gap-2">
										{frpDb.map((item) => (
											<button
												key={item.number}
												onContextMenu={(e) => { e.preventDefault(); openEditFrpDbSheet(item); }}
												onDoubleClick={() => openEditFrpDbSheet(item)}
												className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 active:bg-slate-200">
												<div className="flex items-center justify-between">
													<span className="text-base font-extrabold text-slate-900">{item.label}</span>
													<span className="text-sm font-bold text-slate-500">{item.type}{item.mmc ? " · MMC" : ""}</span>
												</div>
												<p className="mt-0.5 text-sm text-slate-700">{item.name}</p>
												<p className="mt-0.5 text-xs text-slate-400">{item.number}</p>
											</button>
										))}
									</div>
									<button
										onClick={openAddFrpDbSheet}
										className="mt-4 w-full rounded-2xl bg-blue-900 px-4 py-4 text-base font-extrabold text-white transition hover:bg-blue-800">
										Dodaj FRP
									</button>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* FRP DB add/edit sheet */}
				<AnimatePresence>
					{frpDbSheetVisible && (
						<motion.div
							className="fixed inset-0 z-50 bg-slate-950/45"
							initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
							transition={{ duration: 0.22 }}
							onClick={closeFrpDbSheet}>
							<motion.div
								className="absolute inset-x-0 bottom-0"
								initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
								transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
								onClick={(e) => e.stopPropagation()}>
								<div className="mx-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl">
									<div className="mb-5 flex items-start justify-between gap-4">
										<h2 className="text-2xl font-semibold text-slate-900">{frpDbMode === "edit" ? "Edytuj FRP" : "Nowy FRP"}</h2>
										<button onClick={closeFrpDbSheet} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Zamknij</button>
									</div>
									<div className="flex flex-col gap-4">
										<label className={labelCls}>
											<span className={labelTextCls}>Numer itemu</span>
											<input value={frpDbDraft?.number ?? ""} onChange={(e) => setFrpDbDraft((p) => ({ ...p, number: digitsOnly(e.target.value) }))} type="tel" inputMode="numeric" className={inputCls} placeholder="Wpisz numer" />
										</label>
										<label className={labelCls}>
											<span className={labelTextCls}>Średnica (label)</span>
											<input value={frpDbDraft?.label ?? ""} onChange={(e) => setFrpDbDraft((p) => ({ ...p, label: e.target.value }))} className={inputCls} placeholder="np. 2.2" />
										</label>
										<label className={labelCls}>
											<span className={labelTextCls}>Nazwa</span>
											<input value={frpDbDraft?.name ?? ""} onChange={(e) => setFrpDbDraft((p) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Pełna nazwa FRP" />
										</label>
										<label className={labelCls}>
											<span className={labelTextCls}>XB / Z</span>
											<ToggleGroup options={["XB", "Z"]} value={frpDbDraft?.type ?? "XB"} onChange={(v) => setFrpDbDraft((p) => ({ ...p, type: v }))} />
										</label>
										<div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
											<span className={labelTextCls}>MMC</span>
											<ToggleSwitch value={Boolean(frpDbDraft?.mmc)} onChange={(v) => setFrpDbDraft((p) => ({ ...p, mmc: v }))} />
										</div>
									</div>
									<div className="mt-6 flex gap-3">
										{frpDbMode === "edit" ? (
											<button onClick={deleteFrpDbItem} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600">Usuń</button>
										) : (
											<button onClick={closeFrpDbSheet} className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100">Anuluj</button>
										)}
										<button onClick={saveFrpDbDraft} className="flex-1 rounded-2xl bg-blue-900 px-4 py-3 font-semibold text-white transition hover:bg-blue-800">{frpDbMode === "edit" ? "Zapisz" : "Dodaj FRP"}</button>
									</div>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		);
	}


	const matLabel = MATERIALS[activeMaterial]?.label ?? activeMaterial;

	const thCls = "border-r border-blue-950 bg-blue-900 px-2 py-1.5 text-xs font-semibold text-slate-100 last:border-r-0";
	const tdCls = "border-b border-r border-slate-200 px-1.5 py-1 text-sm last:border-r-0";
	const tdStatusCls = "border-b border-slate-200 px-1.5 py-1 text-xs font-bold";

	function renderTableHead() {
		if (activeMaterial === "frp") {
			return (
				<tr>
					<th onClick={() => setItemIdDisplayMode((c) => (c === "full" ? "short" : "full"))} className={`${thCls} cursor-pointer select-none hover:bg-blue-800 ${itemIdDisplayMode === "short" ? "w-16" : "min-w-[9rem]"}`}>item</th>
					<th className={thCls}>średnica</th>
					<th className={thCls}>długość (km)</th>
					<th className={thCls}>XB/Z</th>
					<th className={thCls}>nr szpuli</th>
					<th className={thCls}>lokalizacja</th>
					<th className={thCls}>notatka</th>
					<th className="bg-blue-900 px-2 py-1.5 text-xs font-semibold text-slate-100">status</th>
				</tr>
			);
		}
		if (activeMaterial === "coatedFrp") {
			return (
				<tr>
					<th className={thCls}>średnica</th>
					<th className={thCls}>długość (km)</th>
					<th className={thCls}>nr szpuli</th>
					<th className={thCls}>lokalizacja</th>
					<th className={thCls}>notatka</th>
					<th className="bg-blue-900 px-2 py-1.5 text-xs font-semibold text-slate-100">status</th>
				</tr>
			);
		}
		return (
			<tr>
				<th className={thCls}>kolor</th>
				<th className={thCls}>średnica</th>
				<th className={thCls}>długość</th>
				<th className={thCls}>nr szpuli</th>
				<th className={thCls}>niepalny</th>
				<th className={thCls}>lokalizacja</th>
				<th className={thCls}>notatka</th>
				<th className="bg-blue-900 px-2 py-1.5 text-xs font-semibold text-slate-100">status</th>
			</tr>
		);
	}

	function renderTableCells(item) {
		const isSelected = item.id === selectedIds[activeMaterial];
		const { label: statusLabel, cls: statusCls } = getStatusLabel(activeMaterial, item.id);
		const textCls = isSelected ? "text-white" : "text-neutral-900";

		if (activeMaterial === "frp") {
			return (
				<>
					<td className={`${tdCls} ${itemIdDisplayMode === "short" ? "w-16" : ""} ${textCls}`}>{formatItemNumber(item.itemNumber)}</td>
					<td className={`${tdCls} ${textCls}`}>{item.frpLabel || item.diameter || "-"}</td>
					<td className={`${tdCls} ${textCls}`}>{formatLengthKm(item.length)}</td>
					<td className={`${tdCls} ${textCls}`}>{item.type}</td>
					<td className={`${tdCls} ${textCls}`}>{item.drumNumber}</td>
					<td className={`${tdCls} ${textCls}`}>{item.location}</td>
					<td className={`${tdCls} ${textCls}`}>{item.remark || "-"}</td>
					<td className={`${tdStatusCls} ${isSelected ? "text-white" : statusCls}`}>{statusLabel}</td>
				</>
			);
		}
		if (activeMaterial === "coatedFrp") {
			return (
				<>
					<td className={`${tdCls} ${textCls}`}>{item.diameter}</td>
					<td className={`${tdCls} ${textCls}`}>{formatLengthKm(item.length)}</td>
					<td className={`${tdCls} ${textCls}`}>{item.drumNumber}</td>
					<td className={`${tdCls} ${textCls}`}>{item.location}</td>
					<td className={`${tdCls} ${textCls}`}>{item.remark || "-"}</td>
					<td className={`${tdStatusCls} ${isSelected ? "text-white" : statusCls}`}>{statusLabel}</td>
				</>
			);
		}
		return (
			<>
				<td className={`${tdCls} ${textCls}`}>{item.color}</td>
				<td className={`${tdCls} ${textCls}`}>{item.diameter}</td>
				<td className={`${tdCls} ${textCls}`}>{formatLengthKm(item.length)}</td>
				<td className={`${tdCls} ${textCls}`}>{item.drumNumber}</td>
				<td className={`${tdCls} ${textCls}`}>{item.isincendiary ? "Tak" : "Nie"}</td>
				<td className={`${tdCls} ${textCls}`}>{item.location}</td>
				<td className={`${tdCls} ${textCls}`}>{item.remark || "-"}</td>
				<td className={`${tdStatusCls} ${isSelected ? "text-white" : statusCls}`}>{statusLabel}</td>
			</>
		);
	}

	function renderSearchPanel() {
		if (!activeMaterial) return null;
		const f = searchFilters[activeMaterial];
		const fieldCls = "rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500";
		const labelCls = "flex flex-col gap-1 text-xs font-semibold text-slate-500";
		return (
			<div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
				{activeMaterial === "frp" && (
					<>
						<label className={labelCls}>item<input value={f.item} onChange={(e) => updateSearchFilter("item", e.target.value)} className={`${fieldCls} w-28`} placeholder="np. 395" /></label>
						<label className={labelCls}>średnica<input value={f.diameter} onChange={(e) => updateSearchFilter("diameter", e.target.value)} className={`${fieldCls} w-24`} placeholder="np. 2.2" /></label>
						<label className={labelCls}>XB/Z
							<select value={f.type} onChange={(e) => updateSearchFilter("type", e.target.value)} className={fieldCls}>
								<option value="all">Wszystkie</option>
								<option value="XB">XB</option>
								<option value="Z">Z</option>
							</select>
						</label>
						<label className={labelCls}>MMC
							<select value={f.mmc} onChange={(e) => updateSearchFilter("mmc", e.target.value)} className={fieldCls}>
								<option value="all">Wszystkie</option>
								<option value="yes">Tak</option>
								<option value="no">Nie</option>
							</select>
						</label>
						<label className={labelCls}>nr szpuli<input value={f.drum} onChange={(e) => updateSearchFilter("drum", e.target.value)} className={`${fieldCls} w-28`} /></label>
						<label className={labelCls}>lokalizacja<input value={f.location} onChange={(e) => updateSearchFilter("location", e.target.value)} className={`${fieldCls} w-32`} /></label>
						<label className={labelCls}>dł. min (m)<input value={f.lengthMin} onChange={(e) => updateSearchFilter("lengthMin", digitsOnly(e.target.value))} type="number" min="0" step="1" className={`${fieldCls} w-24`} /></label>
						<label className={labelCls}>dł. max (m)<input value={f.lengthMax} onChange={(e) => updateSearchFilter("lengthMax", digitsOnly(e.target.value))} type="number" min="0" step="1" className={`${fieldCls} w-24`} /></label>
					</>
				)}
				{activeMaterial === "coatedFrp" && (
					<>
						<label className={labelCls}>średnica<input value={f.diameter} onChange={(e) => updateSearchFilter("diameter", e.target.value)} className={`${fieldCls} w-24`} placeholder="np. 1.6" /></label>
						<label className={labelCls}>nr szpuli<input value={f.drum} onChange={(e) => updateSearchFilter("drum", e.target.value)} className={`${fieldCls} w-28`} /></label>
						<label className={labelCls}>lokalizacja<input value={f.location} onChange={(e) => updateSearchFilter("location", e.target.value)} className={`${fieldCls} w-32`} /></label>
						<label className={labelCls}>dł. min (m)<input value={f.lengthMin} onChange={(e) => updateSearchFilter("lengthMin", digitsOnly(e.target.value))} type="number" min="0" step="1" className={`${fieldCls} w-24`} /></label>
						<label className={labelCls}>dł. max (m)<input value={f.lengthMax} onChange={(e) => updateSearchFilter("lengthMax", digitsOnly(e.target.value))} type="number" min="0" step="1" className={`${fieldCls} w-24`} /></label>
					</>
				)}
				{activeMaterial === "filler" && (
					<>
						<label className={labelCls}>średnica<input value={f.diameter} onChange={(e) => updateSearchFilter("diameter", e.target.value)} className={`${fieldCls} w-24`} /></label>
						<label className={labelCls}>kolor
							<select value={f.color} onChange={(e) => updateSearchFilter("color", e.target.value)} className={fieldCls}>
								<option value="all">Wszystkie</option>
								<option value="GRAY">GRAY</option>
								<option value="WHITE">WHITE</option>
								<option value="BLACK">BLACK</option>
							</select>
						</label>
						<label className={labelCls}>nr szpuli<input value={f.drum} onChange={(e) => updateSearchFilter("drum", e.target.value)} className={`${fieldCls} w-28`} /></label>
						<label className={labelCls}>niepalny
							<select value={f.incendiary} onChange={(e) => updateSearchFilter("incendiary", e.target.value)} className={fieldCls}>
								<option value="all">Wszystkie</option>
								<option value="yes">Tak</option>
								<option value="no">Nie</option>
							</select>
						</label>
						<label className={labelCls}>lokalizacja
							<select value={f.location} onChange={(e) => updateSearchFilter("location", e.target.value)} className={fieldCls}>
								<option value="all">Wszystkie</option>
								<option value="PRZED">PRZED</option>
								<option value="ZA">ZA</option>
							</select>
						</label>
						<label className={labelCls}>dł. min (m)<input value={f.lengthMin} onChange={(e) => updateSearchFilter("lengthMin", digitsOnly(e.target.value))} type="number" min="0" step="1" className={`${fieldCls} w-24`} /></label>
						<label className={labelCls}>dł. max (m)<input value={f.lengthMax} onChange={(e) => updateSearchFilter("lengthMax", digitsOnly(e.target.value))} type="number" min="0" step="1" className={`${fieldCls} w-24`} /></label>
					</>
				)}
				{isSearchActive && (
					<button type="button" onClick={clearSearchFilters} className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-300">Wyczyść filtry</button>
				)}
			</div>
		);
	}

	function renderEmptyRow() {
		const cols = activeMaterial === "frp" ? 8 : activeMaterial === "coatedFrp" ? 6 : 8;
		return (
			<tr><td colSpan={cols} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
				{isSearchActive ? "Brak wyników dla wybranych filtrów." : "Brak pozycji. Dodaj pierwszy wpis, żeby zobaczyć listę."}
			</td></tr>
		);
	}

	return (
		<div className="flex h-screen max-h-screen flex-col bg-neutral-50">
			{/* header */}
			<div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-sm">
				<button onClick={goToMenu} className="shrink-0 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200">← Wstecz</button>
				<button
					type="button"
					onClick={() => activeSelectedId && scrollRowIntoView(activeSelectedId)}
					className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-center text-xl font-extrabold text-slate-900 transition hover:text-blue-700"
					title={activeSelectedId ? `Przewiń do zaznaczonego wpisu (${matLabel})` : matLabel}
				>
					{matLabel}
				</button>
				<div className="flex shrink-0 items-center gap-2">
					{activeMaterial && (
						<button
							type="button"
							onClick={() => setSearchOpen((v) => !v)}
							aria-label={searchOpen ? "Ukryj wyszukiwarkę" : "Pokaż wyszukiwarkę"}
							title={searchOpen ? "Ukryj wyszukiwarkę" : "Pokaż wyszukiwarkę"}
							className={`rounded-full p-1.5 transition ${isSearchActive ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : searchOpen ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
						</button>
					)}
					{activeMaterial && (
						<button
							type="button"
							onClick={() => setDragLocked((prev) => ({ ...prev, [activeMaterial]: !prev[activeMaterial] }))}
							disabled={isStockCompleted}
							aria-label={isDragLocked ? "Odblokuj przestawianie" : "Zablokuj przestawianie"}
							title={isDragLocked ? "Odblokuj przestawianie" : "Zablokuj przestawianie"}
							className={`rounded-full p-1.5 transition ${isStockCompleted ? "cursor-not-allowed text-slate-300" : isDragLocked ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
							{isDragLocked ? (
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" /></svg>
							) : (
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 11V7a4 4 0 017.446-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
							)}
						</button>
					)}
					{canUndo && (
						<button
							type="button"
							onClick={handleUndo}
							aria-label="Cofnij ostatnią akcję"
							title="Cofnij ostatnią akcję"
							className="rounded-full bg-slate-100 p-1.5 text-slate-600 transition hover:bg-slate-200">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 7L4 12L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 12H14C17.3137 12 20 14.6863 20 18V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
						</button>
					)}
			</div>
			</div>

			{searchOpen && renderSearchPanel()}

			{/* table */}
			<div className="relative min-h-0 flex-1">
				{activeMaterial ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragStart={handleDragStart}
						onDragCancel={handleDragCancel}
						onDragEnd={handleDragEnd}>
						<div ref={tableScrollRef} onScroll={handleTableScroll} className="h-full overflow-auto">
							<table className="min-w-full border-separate border-spacing-0 text-left text-sm">
								<thead className="sticky top-0 z-40">{renderTableHead()}</thead>
								{displayedItems.length > 0 ? (
									<SortableContext items={displayedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
										<tbody>
											{displayedItems.map((item, index) => (
												<SortableFrpRow
													key={item.id}
													frp={item}
													rowClass={getRowClass(activeMaterial, item, index)}
													disabled={isDragLocked}
													onSelect={() => setSelectedIds((prev) => ({ ...prev, [activeMaterial]: item.id }))}
													onDeselect={() => setSelectedIds((prev) => ({ ...prev, [activeMaterial]: prev[activeMaterial] === item.id ? null : prev[activeMaterial] }))}
													onRowRef={(node) => { if (node) rowRefs.current.set(item.id, node); else rowRefs.current.delete(item.id); }}>
													{renderTableCells(item)}
												</SortableFrpRow>
											))}
											<tr><td colSpan={activeMaterial === "coatedFrp" ? 6 : 8} className="h-16" /></tr>
										</tbody>
									</SortableContext>
								) : (
									<tbody>{renderEmptyRow()}</tbody>
								)}
							</table>
						</div>
						<DragOverlay modifiers={[restrictToWindowEdges]}>
							{activeDragId ? (
								<div className="w-screen border border-blue-300 bg-white/95 px-3 py-2 text-sm font-medium text-slate-900 shadow-xl backdrop-blur">
									<div className="truncate text-center">{stocks[activeMaterial]?.find((i) => i.id === activeDragId)?.drumNumber || matLabel}</div>
								</div>
							) : null}
						</DragOverlay>
					</DndContext>
				) : (
					<div className="h-full overflow-auto">
						<table className="min-w-full border-separate border-spacing-0 text-left text-sm">
							<thead className="sticky top-0 z-40">{renderTableHead()}</thead>
							<tbody>{renderEmptyRow()}</tbody>
						</table>
					</div>
				)}

				{/* add button */}
				{!isStockCompleted && (
					<button
						type="button"
						onClick={() => openAddSheet(activeMaterial)}
						className="absolute bottom-3 right-3 rounded-md bg-blue-900 p-2.5 text-white shadow-lg transition hover:bg-blue-800">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 4C16.93 4 17.395 4 17.7765 4.10222C18.8117 4.37962 19.6204 5.18827 19.8978 6.22354C20 6.60504 20 7.07003 20 8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V8C4 7.07003 4 6.60504 4.10222 6.22354C4.37962 5.18827 5.18827 4.37962 6.22354 4.10222C6.60504 4 7.07003 4 8 4M12 17V11M9 14H15M9.6 6H14.4C14.9601 6 15.2401 6 15.454 5.89101C15.6422 5.79513 15.7951 5.64215 15.891 5.45399C16 5.24008 16 4.96005 16 4.4V3.6C16 3.03995 16 2.75992 15.891 2.54601C15.7951 2.35785 15.6422 2.20487 15.454 2.10899C15.2401 2 14.9601 2 14.4 2H9.6C9.03995 2 8.75992 2 8.54601 2.10899C8.35785 2.20487 8.20487 2.35785 8.10899 2.54601C8 2.75992 8 3.03995 8 3.6V4.4C8 4.96005 8 5.24008 8.10899 5.45399C8.20487 5.64215 8.35785 5.79513 8.54601 5.89101C8.75992 6 9.03995 6 9.6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
					</button>
				)}
			</div>

			{/* bottom actions */}
			<div className="border-t border-slate-200 bg-white px-3 pb-4 pt-3">
				{isStockCompleted ? (
					<div className="flex flex-col gap-3">
						<button onClick={startNewStock} className="rounded-xl bg-blue-900 py-4 text-base font-extrabold text-white transition hover:bg-blue-800">Nowy stock</button>
						{activeMaterial === "frp" && frpStockHistory.length >= 2 && (
							<button onClick={generateBalance} className="rounded-xl border border-blue-900 py-3 text-sm font-bold text-blue-900 transition hover:bg-blue-50">Wygeneruj bilans</button>
						)}
					</div>
				) : (
					<>
						{allStatusesMarked && (
							<button onClick={exportStock} className="mb-3 w-full rounded-xl bg-blue-900 py-4 text-base font-extrabold text-white transition hover:bg-blue-800">Zakończ stock</button>
						)}
						<div className="flex gap-3">
							<button
								disabled={!activeSelectedItem}
								onClick={() => openEditSheet(activeSelectedItem)}
								className="flex-1 rounded-xl bg-blue-900 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40">
								Edytuj
							</button>
							<button
								disabled={!activeSelectedItem}
								onClick={openTransferSheet}
								className="flex-1 rounded-xl bg-neutral-200 py-3 text-sm font-bold text-black transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40">
								Przenieś
							</button>
						</div>
						<div className="mt-3 flex gap-3">
							<button
								disabled={!activeSelectedItem}
								onClick={() => markStatus(true)}
								className="flex-1 rounded-xl bg-emerald-500 py-4 text-base font-extrabold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40">
								Jest
							</button>
							<button
								disabled={!activeSelectedItem}
								onClick={() => markStatus(false)}
								className="flex-1 rounded-xl bg-rose-500 py-4 text-base font-extrabold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40">
								Brak
							</button>
						</div>
						<p className="mt-2 text-center text-xs text-slate-500">
							Wszystkie: <span className="font-bold text-slate-700">{activeItems.length}</span> · Jest: <span className="font-bold text-emerald-700">{finishedYesCount}</span> · Brak: <span className="font-bold text-rose-700">{finishedNoCount}</span> · Nieznany: <span className="font-bold">{activeItems.length - finishedYesCount - finishedNoCount}</span>
						</p>
					</>
				)}
			</div>

			{/* ── sheet (add / edit / transfer) ─────────────────────────────── */}
			<AnimatePresence>
				{sheetVisible && (
					<motion.div
						className="fixed inset-0 z-50 bg-slate-950/45"
						initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
						transition={{ duration: 0.22 }}
						onClick={closeSheet}>
						<motion.div
							className="absolute inset-x-0 bottom-0"
							initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
							transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
							onClick={(e) => e.stopPropagation()}>
							<div className="mx-auto w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl">
								{/* sheet header */}
								<div className="mb-5 flex items-start justify-between gap-4">
									<div>
										<h2 className="text-2xl font-semibold text-slate-900">
											{sheetMode === "transfer" ? `Przenieś ${MATERIALS[sheetMaterial]?.label ?? ""}` : sheetMode === "edit" ? `Edytuj ${MATERIALS[sheetMaterial]?.label ?? ""}` : `Nowe ${MATERIALS[sheetMaterial]?.label ?? ""}`}
										</h2>
										<p className="mt-1 text-sm text-slate-500">
											{sheetMode === "transfer" ? "Wpisz numer szpuli i zaktualizuj dane przenoszonej pozycji." : sheetMode === "edit" ? "Zmień dane wybranego wpisu." : "Dodaj nowy wpis do lokalnej bazy."}
										</p>
									</div>
									<button onClick={closeSheet} className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Zamknij</button>
								</div>

								<form onSubmit={saveSheet} className="flex flex-col gap-4">
									{/* transfer fields */}
									{sheetMode === "transfer" && (
										<>
											<div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
												Zaznaczone FRP docelowe: <strong>{activeSelectedItem?.drumNumber ?? "—"}</strong>
											</div>
											<label className={labelCls}>
												<span className={labelTextCls}>Numer szpuli (przenoszonej)</span>
												<input value={sheetDraft?.drumNumber ?? ""} onChange={(e) => updateSheetField("drumNumber", e.target.value)} className={inputCls} placeholder="Wpisz istniejący numer" />
												<span className="text-xs text-slate-400">Wpisane FRP zostanie przeniesione nad zaznaczony wpis.</span>
											</label>
											<label className={labelCls}>
												<span className={labelTextCls}>Długość (m)</span>
												<div className="flex gap-2">
													<input value={sheetDraft?.length ?? ""} onChange={(e) => updateSheetField("length", e.target.value)} type="number" min="0" step="1" className={`${inputCls} flex-1`} placeholder="np. 1200" />
													<CalcButton onClick={() => openCalculator("length")} />
												</div>
											</label>
											{sheetMaterial === "filler" ? (
												<label className={labelCls}>
													<span className={labelTextCls}>Lokalizacja</span>
													<ToggleGroup options={["PRZED", "ZA"]} value={sheetDraft?.location || "PRZED"} onChange={(v) => updateSheetField("location", v)} />
												</label>
											) : (
												<label className={labelCls}>
													<div className="flex items-center justify-between gap-2">
														<span className={labelTextCls}>Lokalizacja</span>
														{(sheetMaterial === "frp" || sheetMaterial === "coatedFrp") && lastLocation && lastLocation !== sheetDraft?.location && (
															<button type="button" onClick={() => updateSheetField("location", lastLocation)} className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200">
																Ostatnia: {lastLocation}
															</button>
														)}
													</div>
													<input value={sheetDraft?.location ?? ""} onChange={(e) => updateSheetField("location", e.target.value)} className={inputCls} placeholder="np. hala A / regał 3" />
												</label>
											)}
											<label className={labelCls}>
												<span className={labelTextCls}>Notatka</span>
												<textarea value={sheetDraft?.remark ?? ""} onChange={(e) => updateSheetField("remark", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Dowolne dodatkowe informacje" />
											</label>
										</>
									)}

									{/* FRP add/edit fields */}
									{sheetMode !== "transfer" && sheetMaterial === "frp" && (
										<>
											<div className="flex items-end gap-2">
												<label className={`${labelCls} flex-1 min-w-0`}>
													<span className={labelTextCls}>Item ID</span>
													<input value={sheetDraft?.itemNumber ?? ""} onChange={(e) => updateSheetField("itemNumber", e.target.value)} type="tel" inputMode="numeric" pattern="[0-9]*" className={inputCls} placeholder="Wpisz końcówkę, np. 395" />
												</label>
												<label className={`${labelCls} flex-1 min-w-0`}>
													<span className={labelTextCls}>Średnica</span>
													<input value={sheetDraft?.frpLabel ?? ""} readOnly className={inputReadonlyCls} placeholder="Auto" />
												</label>
												<label className={`${labelCls} shrink-0`}>
													<span className={labelTextCls}>XB / Z</span>
													<ToggleGroup options={["XB", "Z"]} value={sheetDraft?.type ?? "XB"} onChange={(v) => updateSheetField("type", v)} />
												</label>
											</div>

											{frpMatchCandidates.length > 1 && (
												<div className="flex flex-wrap gap-1.5">
													{frpMatchCandidates.map((item) => (
														<button key={item.number} type="button" onClick={() => selectFrpMatch(item)} className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-50">
															...{item.number.slice(-6)} / {item.label}
														</button>
													))}
												</div>
											)}
											<div className="grid grid-cols-2 gap-3">
												<label className={labelCls}>
													<span className={labelTextCls}>Długość (m)</span>
													<input value={sheetDraft?.length ?? ""} onChange={(e) => updateSheetField("length", e.target.value)} type="number" min="0" step="1" className={inputCls} placeholder="np. 1200" />
												</label>
												<label className={labelCls}>
													<span className={labelTextCls}>Numer szpuli</span>
													<input value={sheetDraft?.drumNumber ?? ""} onChange={(e) => updateSheetField("drumNumber", e.target.value)} className={inputCls} placeholder="Musi być unikalny" />
													{sheetDrumDuplicate && (
														<p className="text-xs font-medium text-amber-700">Taki numer szpuli już istnieje.</p>
													)}
												</label>
											</div>
											<label className={labelCls}>
												<div className="flex items-center justify-between gap-2">
													<span className={labelTextCls}>Lokalizacja</span>
													{sheetMode === "edit" && lastLocation && lastLocation !== sheetDraft?.location && (
														<button type="button" onClick={() => updateSheetField("location", lastLocation)} className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200">
															Ostatnia: {lastLocation}
														</button>
													)}
												</div>
												<div className="flex gap-2">
													<input value={sheetDraft?.location ?? ""} onChange={(e) => updateSheetField("location", e.target.value)} className={`${inputCls} flex-1`} placeholder="np. hala A / regał 3" />
													<button type="button" onClick={openScanner} aria-label="Skanuj kod kreskowy" title="Skanuj kod kreskowy" className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 text-slate-700 transition hover:bg-slate-100">
														<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
													</button>
													<CalcButton onClick={() => openCalculator("length")} />
												</div>
											</label>
											<label className={labelCls}>
												<span className={labelTextCls}>Notatka</span>
												<textarea value={sheetDraft?.remark ?? ""} onChange={(e) => updateSheetField("remark", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Dowolne dodatkowe informacje" />
											</label>
										</>
									)}

									{/* Coated FRP add/edit fields */}
									{sheetMode !== "transfer" && sheetMaterial === "coatedFrp" && (
										<>
											<label className={labelCls}>
												<span className={labelTextCls}>Średnica</span>
												<input value={sheetDraft?.diameter ?? ""} onChange={(e) => updateSheetField("diameter", e.target.value)} className={inputCls} placeholder="np. 1.8/1.9" />
											</label>
											<div className="grid grid-cols-2 gap-3">
												<label className={labelCls}>
													<span className={labelTextCls}>Długość (m)</span>
													<div className="flex gap-2">
														<input value={sheetDraft?.length ?? ""} onChange={(e) => updateSheetField("length", e.target.value)} type="number" min="0" step="1" className={`${inputCls} flex-1`} placeholder="np. 1200" />
														<CalcButton onClick={() => openCalculator("length")} />
													</div>
												</label>
												<label className={labelCls}>
													<span className={labelTextCls}>Numer szpuli</span>
													<input value={sheetDraft?.drumNumber ?? ""} onChange={(e) => updateSheetField("drumNumber", e.target.value)} className={inputCls} placeholder="Musi być unikalny" />
													{sheetDrumDuplicate && (
														<p className="text-xs font-medium text-amber-700">Taki numer szpuli już istnieje.</p>
													)}
												</label>
											</div>
											<label className={labelCls}>
												<div className="flex items-center justify-between gap-2">
													<span className={labelTextCls}>Lokalizacja</span>
													{sheetMode === "edit" && lastLocation && lastLocation !== sheetDraft?.location && (
														<button type="button" onClick={() => updateSheetField("location", lastLocation)} className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200">
															Ostatnia: {lastLocation}
														</button>
													)}
												</div>
												<input value={sheetDraft?.location ?? ""} onChange={(e) => updateSheetField("location", e.target.value)} className={inputCls} placeholder="np. hala A / regał 3" />
											</label>
											<label className={labelCls}>
												<span className={labelTextCls}>Notatka</span>
												<textarea value={sheetDraft?.remark ?? ""} onChange={(e) => updateSheetField("remark", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Dowolne dodatkowe informacje" />
											</label>
										</>
									)}

									{/* Filler add/edit fields */}
									{sheetMode !== "transfer" && sheetMaterial === "filler" && (
										<>
											<label className={labelCls}>
												<span className={labelTextCls}>Kolor</span>
												<ToggleGroup options={["GRAY", "WHITE", "BLACK"]} value={sheetDraft?.color ?? "GRAY"} onChange={(v) => updateSheetField("color", v)} />
											</label>
											<label className={labelCls}>
												<span className={labelTextCls}>Średnica</span>
												<input value={sheetDraft?.diameter ?? ""} onChange={(e) => updateSheetField("diameter", e.target.value)} className={inputCls} placeholder="np. 2.4" />
											</label>
											<div className="grid grid-cols-2 gap-3">
												<label className={labelCls}>
													<span className={labelTextCls}>Długość (m)</span>
													<div className="flex gap-2">
														<input value={sheetDraft?.length ?? ""} onChange={(e) => updateSheetField("length", e.target.value)} type="number" min="0" step="1" className={`${inputCls} flex-1`} placeholder="np. 1200" />
														<CalcButton onClick={() => openCalculator("length")} />
													</div>
												</label>
												<label className={labelCls}>
													<span className={labelTextCls}>Numer szpuli</span>
													<input value={sheetDraft?.drumNumber ?? ""} onChange={(e) => updateSheetField("drumNumber", e.target.value)} className={inputCls} placeholder="Musi być unikalny" />
													{sheetDrumDuplicate && (
														<p className="text-xs font-medium text-amber-700">Taki numer szpuli już istnieje.</p>
													)}
												</label>
											</div>
											<label className={labelCls}>
												<span className={labelTextCls}>Lokalizacja</span>
												<ToggleGroup options={["PRZED", "ZA"]} value={sheetDraft?.location || "PRZED"} onChange={(v) => updateSheetField("location", v)} />
											</label>
											<div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
												<span className={labelTextCls}>Niepalny</span>
												<ToggleSwitch value={Boolean(sheetDraft?.isincendiary)} onChange={(v) => updateSheetField("isincendiary", v)} />
											</div>
											<label className={labelCls}>
												<span className={labelTextCls}>Notatka</span>
												<textarea value={sheetDraft?.remark ?? ""} onChange={(e) => updateSheetField("remark", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Dowolne dodatkowe informacje" />
											</label>
										</>
									)}

									{sheetError && (
										<p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{sheetError}</p>
									)}

									<div className="flex gap-3 pt-2">
										{sheetMode === "edit" ? (
											<button type="button" onClick={deleteItem} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600">Usuń</button>
										) : (
											<button type="button" onClick={closeSheet} className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100">Anuluj</button>
										)}
										<button type="submit" className="flex-1 rounded-2xl bg-blue-900 px-4 py-3 font-semibold text-white transition hover:bg-blue-800">
											{sheetMode === "transfer" ? "Przenieś" : sheetMode === "edit" ? "Zapisz zmiany" : `Dodaj ${MATERIALS[sheetMaterial]?.label ?? ""}`}
										</button>
									</div>
								</form>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ── calculator ─────────────────────────────────────────────────── */}
			<AnimatePresence>
				{calcVisible && (
					<motion.div
						className="fixed inset-0 z-60 bg-slate-950/45"
						initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
						transition={{ duration: 0.22 }}
						onClick={closeCalculator}>
						<motion.div
							className="absolute inset-x-0 bottom-0"
							initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
							transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
							onClick={(e) => e.stopPropagation()}>
							<div className="mx-auto w-full max-w-sm rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-2xl font-extrabold text-slate-900">Kalkulator</h3>
									<button onClick={closeCalculator} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Zamknij</button>
								</div>

								<div className="rounded-2xl bg-slate-100 px-4 py-5 mb-4">
									<p className="text-right text-sm font-bold text-slate-400 h-5">
										{calcOp && calcStored !== null ? `${calcStored} ${{ "+": "+", "-": "−", "*": "×", "/": "÷" }[calcOp]}` : ""}
									</p>
									<p className="text-right text-4xl font-extrabold text-slate-900 truncate">{calcDisplay}</p>
								</div>

								{[["7", "8", "9", "/"], ["4", "5", "6", "*"], ["1", "2", "3", "-"], ["0", ".", "⌫", "+"]].map((row) => (
									<div key={row.join("")} className="mb-3 grid grid-cols-4 gap-2">
										{row.map((key) => {
											const isOp = ["+", "-", "*", "/"].includes(key);
											const isActiveOp = isOp && calcOp === key;
											return (
												<button
													key={key}
													onClick={() => {
														if (key === "⌫") pressCalcBackspace();
														else if (key === ".") pressCalcDecimal();
														else if (isOp) pressCalcOp(key);
														else pressCalcDigit(key);
													}}
													className={`rounded-2xl py-4 text-lg font-extrabold transition ${isActiveOp ? "bg-amber-500 text-white" : isOp ? "bg-blue-900 text-white hover:bg-blue-800" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}>
													{key === "*" ? "×" : key === "/" ? "÷" : key}
												</button>
											);
										})}
									</div>
								))}

								<div className="mb-3 grid grid-cols-2 gap-2">
									<button onClick={pressCalcClear} className="rounded-2xl bg-rose-500 py-4 text-lg font-extrabold text-white transition hover:bg-rose-600">C</button>
									<button onClick={pressCalcEquals} className="rounded-2xl bg-emerald-600 py-4 text-lg font-extrabold text-white transition hover:bg-emerald-700">=</button>
								</div>
								<button onClick={transferCalcResult} className="w-full rounded-2xl bg-blue-900 py-4 text-base font-extrabold text-white transition hover:bg-blue-800">
									Przenieś wynik
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{scannerVisible && (
					<motion.div
						className="fixed inset-0 z-60 bg-slate-950/70"
						initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
						transition={{ duration: 0.22 }}
						onClick={closeScanner}>
						<motion.div
							className="absolute inset-x-0 bottom-0"
							initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
							transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
							onClick={(e) => e.stopPropagation()}>
							<div className="mx-auto w-full max-w-sm rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-2xl font-extrabold text-slate-900">Skanuj kod</h3>
									<button onClick={closeScanner} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Zamknij</button>
								</div>
								{scannerError ? (
									<p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{scannerError}</p>
								) : (
									<>
									<div className="relative overflow-hidden rounded-2xl bg-black" onClick={toggleTorch}>
										<video ref={scannerVideoRef} className="aspect-square w-full object-cover" muted playsInline />
										{torchSupported && (
											<div className={`pointer-events-none absolute bottom-3 right-3 rounded-full p-2 ${torchOn ? "bg-amber-400 text-slate-900" : "bg-black/50 text-white"}`}>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
													<path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 1 1-1.42 1.41L4.22 5.64a1 1 0 0 1 0-1.42Zm12.73 12.73a1 1 0 0 1 1.41 0l1.42 1.41a1 1 0 1 1-1.42 1.42l-1.41-1.42a1 1 0 0 1 0-1.41ZM2 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm16 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM5.64 19.78a1 1 0 0 1 0-1.41l1.41-1.42a1 1 0 1 1 1.42 1.42l-1.42 1.41a1 1 0 0 1-1.41 0ZM18.36 4.22a1 1 0 0 1 0 1.42l-1.42 1.41a1 1 0 1 1-1.41-1.41l1.41-1.42a1 1 0 0 1 1.42 0Z" opacity="0.4" />
													<path d="M12 6a6 6 0 0 0-3.5 10.87c.32.23.5.6.5.99V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.14c0-.39.18-.76.5-.99A6 6 0 0 0 12 6Zm-1 15a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-.5h-2V21Z" />
												</svg>
											</div>
										)}
									</div>
									{torchSupported && <p className="mt-2 text-center text-xs text-slate-500">Dotknij obrazu, aby włączyć/wyłączyć latarkę</p>}
									</>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3">
				<AnimatePresence>
					{toasts.map((toast) => (
						<motion.div
							key={toast.id}
							initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
							transition={{ duration: 0.2 }}
							onClick={() => dismissToast(toast.id)}
							className={`pointer-events-auto w-full max-w-sm cursor-pointer whitespace-pre-line rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${toast.type === "error" ? "border-rose-300 bg-rose-50 text-rose-800" : toast.type === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-800"}`}>
							{toast.message}
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}
