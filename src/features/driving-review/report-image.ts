export type ReportSection = {
  heading: string;
  tone?: "moment" | "improvement" | "strength";
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
  timeline?: { duration: number; times: number[]; focusTime?: number };
  sections: ReportSection[];
  footer: string;
};

const sectionTones = {
  moment: { fill: "#e8f2ff", accent: "#2665a0" },
  improvement: { fill: "#fbf0e2", accent: "#985a21" },
  strength: { fill: "#e7f4ed", accent: "#39715b" },
};

const typography = {
  brand: { font: "700 22px system-ui, sans-serif", line: 31, color: "#efbd91" },
  title: { font: "650 52px system-ui, sans-serif", line: 65, color: "#f6f8fa" },
  headerMeta: {
    font: "500 22px system-ui, sans-serif",
    line: 31,
    color: "#becbda",
  },
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
  const lines: {
    text: string;
    style: keyof typeof typography;
    y: number;
    x: number;
  }[] = [];
  const rules: number[] = [];
  const cards: {
    top: number;
    bottom: number;
    tone: keyof typeof sectionTones;
  }[] = [];
  let y = margin;
  let inset = 0;

  const append = (text: string, style: keyof typeof typography, gap = 0) => {
    context.font = typography[style].font;
    for (const line of wrapText(
      context,
      text,
      contentWidth - 2 * inset,
      segmenter,
    )) {
      lines.push({ text: line, style, y, x: margin + inset });
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
  append(report.coverage, "headerMeta", 16);
  const timelineY = y;
  if (report.timeline) y += 20;
  const headerHeight = y + 22;
  y = headerHeight + 28;
  if (report.summary) append(report.summary, "body", 14);
  for (const section of report.sections) {
    const top = y;
    if (section.tone) {
      inset = 24;
      y += 24;
    } else {
      divider();
    }
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
    if (section.tone) {
      y += 12;
      cards.push({ top, bottom: y, tone: section.tone });
      y += 18;
      inset = 0;
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
  context.fillStyle = "#151d28";
  context.fillRect(0, 0, width, headerHeight);
  context.fillStyle = "#efbd91";
  context.fillRect(0, 0, width, 8);
  if (report.timeline) {
    const { times, duration, focusTime } = report.timeline;
    const position = (time: number) =>
      margin + (time / duration) * contentWidth;
    context.fillStyle = "#516078";
    context.fillRect(margin, timelineY, contentWidth, 3);
    context.fillStyle = "#a7ceff";
    for (const time of times)
      context.fillRect(position(time) - 2, timelineY - 5, 4, 13);
    if (focusTime !== undefined) {
      context.fillStyle = "#efbd91";
      context.fillRect(position(focusTime) - 4, timelineY - 10, 8, 23);
    }
  }
  for (const { top, bottom, tone } of cards) {
    context.fillStyle = sectionTones[tone].fill;
    context.fillRect(margin, top, contentWidth, bottom - top);
    context.fillStyle = sectionTones[tone].accent;
    context.fillRect(margin, top, 5, bottom - top);
  }
  context.fillStyle = "#d5d7d4";
  for (const rule of rules) context.fillRect(margin, rule, contentWidth, 1);
  context.textBaseline = "top";
  for (const line of lines) {
    context.font = typography[line.style].font;
    context.fillStyle = typography[line.style].color;
    context.fillText(line.text, line.x, line.y);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode PNG"));
    }, "image/png");
  });
}
