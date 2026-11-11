export type ReportSection = {
  heading: string;
  paragraphs?: string[];
  entries?: {
    heading: string;
    fields: { label: string; text: string }[];
  }[];
};

type ReportImage = {
  title: string;
  coverage: string;
  summary: string;
  sections: ReportSection[];
  footer: string;
};

const typography = {
  brand: { font: "700 22px system-ui, sans-serif", line: 31, color: "#815128" },
  title: { font: "650 52px system-ui, sans-serif", line: 65, color: "#192329" },
  heading: {
    font: "650 32px system-ui, sans-serif",
    line: 42,
    color: "#192329",
  },
  label: { font: "650 22px system-ui, sans-serif", line: 31, color: "#192329" },
  body: { font: "400 24px system-ui, sans-serif", line: 36, color: "#25333b" },
  meta: { font: "500 21px system-ui, sans-serif", line: 31, color: "#4d5a63" },
};

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  segmenter?: Intl.Segmenter,
) {
  const lines: string[] = [];
  let line = "";
  const fits = (value: string) => context.measureText(value).width <= width;
  const nextLine = () => {
    lines.push(line.trimEnd());
    line = "";
  };
  for (const paragraph of text.split(/\r?\n/)) {
    for (const piece of paragraph.split(/(\s+)/u)) {
      if (fits(line + piece)) {
        line = (line + piece).trimStart();
        continue;
      }
      if (line) nextLine();
      const word = piece.trimStart();
      if (fits(word)) {
        line = word;
        continue;
      }
      const characters = segmenter
        ? Array.from(segmenter.segment(word), ({ segment }) => segment)
        : Array.from(word);
      for (const character of characters) {
        if (line && !fits(line + character)) nextLine();
        line += character;
      }
    }
    nextLine();
  }
  return lines;
}

export function createDrivingReportImage(report: ReportImage, locale: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  const width = 1080;
  const margin = 64;
  const contentWidth = width - margin * 2;
  const segmenter =
    typeof Intl.Segmenter === "function"
      ? new Intl.Segmenter(locale, { granularity: "grapheme" })
      : undefined;
  const lines: { text: string; style: keyof typeof typography; y: number }[] =
    [];
  const rules: number[] = [];
  let y = margin;

  const append = (text: string, style: keyof typeof typography, gap = 0) => {
    context.font = typography[style].font;
    for (const line of wrapText(context, text, contentWidth, segmenter)) {
      lines.push({ text: line, style, y });
      y += typography[style].line;
    }
    y += gap;
  };

  function divider() {
    y += 12;
    rules.push(y);
    y += 24;
  }

  append("CAPCAR", "brand", 12);
  append(report.title, "title", 6);
  append(report.coverage, "meta", 18);
  append(report.summary, "body", 14);
  for (const section of report.sections) {
    divider();
    append(section.heading, "heading", 10);
    for (const paragraph of section.paragraphs ?? [])
      append(paragraph, "body", 10);
    for (const entry of section.entries ?? []) {
      append(entry.heading, "meta", 8);
      for (const field of entry.fields) {
        if (field.label) append(field.label, "label");
        append(field.text, "body", 10);
      }
      y += 6;
    }
  }
  divider();
  append(report.footer, "meta");

  const height = y + margin;
  const scale = Math.min(1, 4096 / height);
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  context.scale(scale, scale);
  context.fillStyle = "#fbfaf7";
  context.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
  context.fillStyle = "#c89159";
  context.fillRect(0, 0, width, 8);
  context.fillStyle = "#d5d7d4";
  for (const rule of rules) context.fillRect(margin, rule, contentWidth, 1);
  context.textBaseline = "top";
  for (const line of lines) {
    context.font = typography[line.style].font;
    context.fillStyle = typography[line.style].color;
    context.fillText(line.text, margin, line.y);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode PNG"));
    }, "image/png");
  });
}
