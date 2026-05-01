import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata = {
  title: "CGPA Mate",
  description: "A connected CGPA planning workspace for students.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
