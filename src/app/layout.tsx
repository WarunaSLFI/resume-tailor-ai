import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Resume & Cover Letter Tailor",
  description: "Generate tailored resumes and cover letters for your dream job using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="nav-container">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">✨</span>
              <span className="logo-text">ResumeTailor AI</span>
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <button className="btn-primary-sm">Get Started</button>
            </div>
          </div>
        </nav>
        {children}
        <footer className="footer">
          <p>&copy; 2026 ResumeTailor AI. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
