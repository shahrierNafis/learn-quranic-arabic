export const prefixPOS: { [key in PrefixPOS]: string[] } = {
  DET: ["Al+"],
  P: [
    "bi+",
    "ka+",
    "ta+",
    "sa+",
    "w:P+",
    "l:P+",
    "l:EMPH+",
    "l:PRP+",
    "l:IMPV+",
  ],
  VOC: ["ya+", "ha+", ""],
  INTG: ["A:INTG+"],
  EQ: ["A:EQ+"],
  CONJ: ["w:CONJ+", "f:CONJ+"],
  REM: ["w:REM+", "f:REM+"],
  CIRC: ["w:CIRC+"],
  SUP: ["w:SUP+", "f:SUP+"],
  COM: ["w:COM+"],
  RSLT: ["f:RSLT+"],
  CAUS: ["f:CAUS+"],
};
export type PrefixPOS =
  | "DET"
  | "P"
  | "VOC"
  | "INTG"
  | "EQ"
  | "CONJ"
  | "REM"
  | "CIRC"
  | "SUP"
  | "COM"
  | "RSLT"
  | "CAUS";
