import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewMind AI",
  description: "InterviewMind AI, a personalized enterprise AI interviewer platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
