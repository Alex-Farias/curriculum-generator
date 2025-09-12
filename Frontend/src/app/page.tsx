
"use client";

import { useState } from "react";
import { generateCurriculum } from "../services/api";

export default function Home() {
  const [language, setLanguage] = useState("");
  const [enterprise, setEnterprise] = useState("");
  const [candidate, setCandidate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    const result = await generateCurriculum(language, enterprise, candidate);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "An unknown error occurred.");
    }
  };

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1">
        <h1 className="text-4xl font-bold">Curriculum Generator</h1>
      </header>

      <main className="row-start-2 flex flex-col gap-8 items-center">
        <div className="flex flex-col gap-4">
          <label htmlFor="language">Language</label>
          <input
            id="language"
            type="text"
            className="border border-gray-300 rounded-md p-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4">
          <label htmlFor="enterprise">Enterprise</label>
          <input
            id="enterprise"
            type="text"
            className="border border-gray-300 rounded-md p-2"
            value={enterprise}
            onChange={(e) => setEnterprise(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4">
          <label htmlFor="candidate">Candidate</label>
          <input
            id="candidate"
            type="text"
            className="border border-gray-300 rounded-md p-2"
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Submit"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </main>

      <footer className="row-start-3 flex gap-8 items-center justify-center">
        <p>
          Powered by{" "}
          <a
            className="hover:underline"
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gemini
          </a>
        </p>
      </footer>
    </div>
  );
}
