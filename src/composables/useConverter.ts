import { ref, computed } from "vue";
import { hexToDecimal, decimalToHex, cleanHex } from "@/utils/hex";
import type { ParsedParam } from "@/types";

function parseHexToParams(hex: string): {
  commandId: string;
  params: ParsedParam[];
  error?: string;
} {
  const cleaned = cleanHex(hex);
  if (cleaned.length < 34) {
    return {
      commandId: "",
      params: [],
      error: `封包头不完整：需要34位，当前${cleaned.length}位`,
    };
  }

  const cmdId = cleaned.substring(10, 18);
  const paramsHex = cleaned.substring(34);
  const params: ParsedParam[] = [];

  for (let i = 0; i < paramsHex.length; i += 8) {
    if (paramsHex.substring(i, i + 8).length === 8) {
      params.push({
        index: params.length + 1,
        value: String(hexToDecimal(paramsHex.substring(i, i + 8))),
        selected: true,
      });
    }
  }

  return {
    commandId: String(hexToDecimal(cmdId)),
    params,
    error: params.length === 0 ? "当前封包无参数，仅有封包头" : undefined,
  };
}

function convertFormatToHex(format: string): {
  output: string;
  error?: string;
} {
  const m = format.trim().match(/^\{(\d+)(?:,(\d+(?:,\d+)*))?\}$/);
  if (!m)
    return {
      output: "",
      error: "格式错误，请输入 {commandId} 或 {commandId,param1,...}",
    };

  const [, cmdId, paramsStr] = m;
  const params = paramsStr ? paramsStr.split(",").map(Number) : [];
  const packetLength = 17 + params.length * 4;

  return {
    output:
      decimalToHex(packetLength, 8) +
      "00" +
      decimalToHex(Number(cmdId), 8) +
      "00000000" +
      "00000000" +
      params.map((p) => decimalToHex(p, 8)).join(""),
    error: params.length === 0 ? "当前封包无参数，仅有封包头" : undefined,
  };
}

export function useConverter() {
  const hexToFormatInput = ref("");
  const parsedParams = ref<ParsedParam[]>([]);
  const commandId = ref("");
  const hexToFormatError = ref("");
  const formatToHexInput = ref("");

  const filteredParams = computed(() =>
    parsedParams.value.filter((p) => p.selected),
  );
  const hexToFormatOutput = computed(() => {
    if (!commandId.value) return "";
    const params = filteredParams.value.map((p) => p.value).join(",");
    return params ? `{${commandId.value},${params}}` : `{${commandId.value}}`;
  });
  const hasHexToFormatResult = computed(() => !!commandId.value);

  const formatToHexResult = computed(() =>
    formatToHexInput.value.trim()
      ? convertFormatToHex(formatToHexInput.value.trim())
      : { output: "", error: "" },
  );
  const formatToHexOutput = computed(() => formatToHexResult.value.output);
  const formatToHexError = computed(() => formatToHexResult.value.error || "");
  const hasFormatToHexResult = computed(
    () => formatToHexInput.value.trim().length > 0,
  );

  function handleHexToFormatConvert() {
    const input = hexToFormatInput.value.trim();
    if (!input) return;
    const result = parseHexToParams(input);
    commandId.value = result.commandId;
    parsedParams.value = result.params;
    hexToFormatError.value = result.error || "";
  }

  function handleHexToFormatReset() {
    hexToFormatInput.value = "";
    parsedParams.value = [];
    commandId.value = "";
    hexToFormatError.value = "";
  }

  return {
    hexToFormatInput,
    parsedParams,
    commandId,
    filteredParams,
    hexToFormatOutput,
    hexToFormatError,
    hasHexToFormatResult,
    handleHexToFormatConvert,
    handleHexToFormatReset,
    selectAll: () => parsedParams.value.forEach((p) => (p.selected = true)),
    deselectAll: () => parsedParams.value.forEach((p) => (p.selected = false)),
    toggleParam: (idx: number) => {
      const p = parsedParams.value.find((p) => p.index === idx);
      if (p) p.selected = !p.selected;
    },
    formatToHexInput,
    formatToHexOutput,
    formatToHexError,
    hasFormatToHexResult,
    handleFormatToHexReset: () => (formatToHexInput.value = ""),
  };
}
