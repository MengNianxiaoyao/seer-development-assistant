import { ref } from "vue";
import {
  downloadJson,
  cleanHex,
  getReceivePackets,
  getSendPacket,
} from "@/utils/hex";
import type { InputEntry, AnalysisResult, ExportData } from "@/types";

function parseHexStrings(hexStrings: string[]): InputEntry[] {
  return hexStrings
    .map((h) => cleanHex(h))
    .filter((h) => h.length > 0)
    .map((hex, idx) => ({
      id: idx + 1,
      label: `收包${idx + 1}`,
      value: hex,
      enabled: true,
      order: idx + 1,
    }));
}

function buildExportData(result: AnalysisResult): ExportData {
  return {
    exportTime: new Date().toISOString(),
    validPackets: result.validPackets,
    totalParams: result.totalParams,
    diffCount: result.diffCount,
    packets: result.packets,
    diffs: result.diffs,
  };
}

function restoreFromExportData(data: ExportData): {
  inputs: InputEntry[];
  sendPacket: string;
  result: AnalysisResult;
} {
  const receivePackets = getReceivePackets(data.packets);
  const sendPacketData = getSendPacket(data.packets);

  const inputs: InputEntry[] =
    receivePackets.length > 0
      ? receivePackets.map((p, idx) => ({
          id: idx + 1,
          label: p.label.startsWith("收包") ? p.label : `收包${idx + 1}`,
          value: p.raw,
          enabled: true,
          order: idx + 1,
        }))
      : [
          { id: 1, label: "收包1", value: "", enabled: true, order: 1 },
          { id: 2, label: "收包2", value: "", enabled: true, order: 2 },
          { id: 3, label: "收包3", value: "", enabled: true, order: 3 },
        ];

  return {
    inputs,
    sendPacket: sendPacketData?.raw ?? "",
    result: {
      packets: data.packets,
      diffs: data.diffs,
      diffCount: data.diffCount,
      totalParams: data.totalParams,
      validPackets: data.validPackets,
    },
  };
}

interface ImportedData {
  packets?: Array<{ raw?: string; label?: string }>;
  diffs?: Array<unknown>;
}

export type ImportFormat = "analysis" | "hex" | "unknown";

export function useImportExport() {
  const alertMessage = ref("");
  const showAlertModal = ref(false);

  function parseImportedFile(content: string): {
    format: ImportFormat;
    data: ImportedData | string[];
  } {
    try {
      const json = JSON.parse(content);

      // Exported analysis result format
      if (json.packets && Array.isArray(json.packets)) {
        return { format: "analysis", data: json as ImportedData };
      }

      // Array of hex strings or objects
      if (Array.isArray(json)) {
        const hexStrings: string[] = [];
        for (const item of json) {
          if (typeof item === "string") {
            hexStrings.push(item);
          } else if (item.hex) {
            hexStrings.push(item.hex);
          } else if (item.data) {
            hexStrings.push(item.data);
          } else if (item.value) {
            hexStrings.push(item.value);
          } else if (item.raw) {
            hexStrings.push(item.raw);
          }
        }
        if (hexStrings.length > 0) {
          return { format: "hex", data: hexStrings };
        }
      }

      // Single hex string
      if (typeof json === "string") {
        return { format: "hex", data: [json] };
      }

      return { format: "unknown", data: [] };
    } catch {
      // Not JSON, try as plain text with multiple hex strings
      const lines = content
        .split(/[\r\n]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length > 0 && lines.every((l) => /^[0-9a-fA-F\s]+$/.test(l))) {
        return { format: "hex", data: lines.map((l) => l.replace(/\s/g, "")) };
      }
      return { format: "unknown", data: [] };
    }
  }

  function handleImport(
    content: string,
    onAnalysisLoad: (state: {
      inputs: InputEntry[];
      sendPacket: string;
      result: AnalysisResult;
    }) => void,
    onHexInputs: (inputs: InputEntry[]) => void,
  ) {
    const { format, data } = parseImportedFile(content);

    if (format === "analysis" && !Array.isArray(data)) {
      const state = restoreFromExportData(data as unknown as ExportData);
      onAnalysisLoad(state);
    } else if (format === "hex" && Array.isArray(data)) {
      onHexInputs(parseHexStrings(data as string[]));
    } else {
      alertMessage.value = "无法识别的文件格式";
      showAlertModal.value = true;
    }
  }

  function handleExport(result: AnalysisResult | null): boolean {
    if (!result) {
      alertMessage.value = "请先进行分析";
      showAlertModal.value = true;
      return false;
    }

    const exportData = buildExportData(result);
    downloadJson(exportData, `seer-analysis-${Date.now()}.json`);
    return true;
  }

  function closeAlertModal() {
    showAlertModal.value = false;
    alertMessage.value = "";
  }

  return {
    alertMessage,
    showAlertModal,
    handleImport,
    handleExport,
    closeAlertModal,
    parseImportedFile,
    buildExportData,
  };
}
