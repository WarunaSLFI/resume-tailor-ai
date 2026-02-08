"use client";

import { useState, useRef } from "react";
import { generateDocx } from "@/lib/generator";
// @ts-ignore
import { saveAs } from "file-saver";

export default function Home() {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    rewrittenResume: string;
    coverLetter: string;
    files?: { jobTitle: string; companyName: string }
  } | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleGenerate = async () => {
    if (!jd) {
      setError("Please paste a job description.");
      return;
    }
    if (!file) {
      setError("Please upload your current resume.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jd);

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDoc = async (content: string, type: string) => {
    try {
      let filename = type;
      if (result?.files?.jobTitle) {
        const cleanJob = result.files.jobTitle.replace(/[^a-zA-Z0-9]/g, "");
        const cleanCompany = result.files.companyName ? result.files.companyName.replace(/[^a-zA-Z0-9]/g, "") : "Job";
        filename = `${type}_${cleanJob}_${cleanCompany}`;
      }

      const buffer = await generateDocx(content, filename);
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      saveAs(blob, `${filename}.docx`);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to generate Word document.");
    }
  };

  return (
    <main className="animate-fade-in">
      <section className="hero">
        <h1 className="section-title">
          Tailor Your Future <br />
          <span className="text-gradient">in Seconds</span>
        </h1>
        <p className="section-subtitle">
          Upload your resume and the job description. Our AI will craft a
          perfectly matched resume and cover letter that beats the ATS and wows recruiters.
        </p>
      </section>

      <div className="main-grid">
        <div className="card glass input-card" style={{ animationDelay: '0.1s' }}>
          <div className="input-group">
            <label htmlFor="job-description">Job Description</label>
            <textarea
              id="job-description"
              placeholder="Paste the job description here..."
              rows={12}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="card glass upload-card" style={{ animationDelay: '0.2s' }}>
          <div className="input-group">
            <label>Your Current Resume</label>
            <div
              className={`upload-zone ${file ? 'active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">{file ? "✅" : "📄"}</div>
              <p>{file ? file.name : "Click to upload or drag and drop"}</p>
              <span className="file-hint">PDF or DOCX (Max 2MB)</span>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="action-area">
            <button
              className="btn-primary w-full"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? "Tailoring Content... ⚡" : "Generate Tailored Documents ✨"}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <section className="results-section animate-fade-in">
          <h2 className="section-title">Your Tailored Documents</h2>
          <div className="results-grid">
            <div className="card glass result-card">
              <h3>Tailored Resume</h3>
              <div className="preview-area">
                <pre>{result.rewrittenResume}</pre>
              </div>
              <button
                className="btn-primary-sm"
                onClick={() => downloadDoc(result.rewrittenResume, "Resume")}
              >
                Download Word Doc ⬇️
              </button>
            </div>
            <div className="card glass result-card">
              <h3>Custom Cover Letter</h3>
              <div className="preview-area">
                <pre>{result.coverLetter}</pre>
              </div>
              <button
                className="btn-primary-sm"
                onClick={() => downloadDoc(result.coverLetter, "CoverLetter")}
              >
                Download Word Doc ⬇️
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="features-section" id="features">
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3>ATS Optimized</h3>
            <p>Smart keyword integration to ensure your resume passes through screening systems.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✍️</span>
            <h3>AI Rewriting</h3>
            <p>Gemini-powered rewriting of your experience to align with the specific job role.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📄</span>
            <h3>Word Download</h3>
            <p>Get your final documents in professional Microsoft Word format, ready to send.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
