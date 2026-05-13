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
  metadataBase: new URL("https://cgpamate.vercel.app"),
  title: "CGPA Mate | Best CGPA & SGPA Calculator Online",
  description: "The ultimate connected CGPA planning workspace for students. Calculate your semester SGPA, estimate your subject results effortlessly, and track your overall academic progress.",
  keywords: [
    "cgpa calculator",
    "sgpa calculator",
    "gpa calculator",
    "result calculation",
    "semester result",
    "university cgpa calculator",
    "cgpa DIU",
    "DIU cgpa calculation",
    "daffodil international university cgpa calculator",
    "diu grading system",
    "college grade tracking",
    "grading system",
    "cgpa mate",
    "academic planner"
  ],
  authors: [{ name: "Khandaker Samin Yeasar" }],
  creator: "Khandaker Samin Yeasar",
  openGraph: {
    title: "CGPA Mate | Best CGPA & SGPA Calculator",
    description: "Calculate your semester GPA, estimate subject results, and track your overall academic progress smoothly.",
    url: "https://cgpamate.vercel.app",
    siteName: "CGPA Mate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "CGPA Mate Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CGPA Mate | Best CGPA & SGPA Calculator",
    description: "Calculate your semester GPA, estimate subject results, and track your overall academic progress smoothly.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://cgpamate.vercel.app",
  },
  icons: {
    icon: "/favicon.png",
  },
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
