import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Responsive hero review",
  robots: { index: false, follow: false },
};
export default function HeroReviewPage() {
  return (
    <main style={{ padding: 24, background: "#151d28", color: "#f0f1f3" }}>
      <h1>Responsive preview — review only</h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          marginTop: 24,
          alignItems: "start",
        }}
      >
        <iframe
          title="Phone · 375px"
          src="/"
          width={375}
          height={812}
          style={{ border: "1px solid #8599b1", flexShrink: 0 }}
        />
        <iframe
          title="Tablet · 768px"
          src="/de"
          width={768}
          height={1024}
          style={{ border: "1px solid #8599b1", flexShrink: 0 }}
        />
      </div>
    </main>
  );
}
