"use client";

import { useState } from "react";
import { projects } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { ProjectCard } from "@/components/projects/project-card";

const categories = [
  { label: "All", value: "all" },
  { label: "AI Automation", value: "ai-automation" },
  { label: "Data Engineering", value: "data-engineering" },
  { label: "ML Ops", value: "ml-ops" },
  { label: "Chatbots", value: "chatbots" },
] as const;

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredProjects =
    activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <SectionHeader
          title="Projects"
          subtitle="A selection of AI, data, and automation work delivered for clients across industries."
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeFilter === cat.value ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p className="text-center text-foreground-secondary mt-12">
            No projects found in this category.
          </p>
        )}
      </section>
    </main>
  );
}
