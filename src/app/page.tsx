"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

const SUGGESTED_SKILLS = [
  "Full Stack Development",
  "Data Science",
  "UI/UX Design",
  "Machine Learning",
  "DevOps",
  "Mobile App Development",
  "Cybersecurity",
  "Cloud Computing",
];

export default function Home() {
  const [skill, setSkill] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!skill.trim()) return;
    setIsGenerating(true);
    const slug = skill
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    router.push(`/roadmap/${slug}?q=${encodeURIComponent(skill.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Logo / Title */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Skill<span className="text-primary">Roadmap</span>
          </h1>
        </div>

        <p className="mb-10 text-lg text-muted-foreground">
          Enter any skill and get a structured, AI-powered roadmap to mastery.
        </p>

        {/* Search Input */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "Full Stack Development", "Python", "Photography"'
            className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-base outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={!skill.trim() || isGenerating}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Generate
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Suggested Skills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {SUGGESTED_SKILLS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSkill(s);
                const slug = s
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                router.push(
                  `/roadmap/${slug}?q=${encodeURIComponent(s)}`
                );
              }}
              className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm text-secondary-foreground transition-all hover:bg-secondary"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
