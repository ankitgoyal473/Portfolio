import Link from "next/link";
import { projects } from "@/lib/constants";

const featured = projects.slice(0, 4);

export default function ProjectsSection() {
  return (
    <section id="projects" className="px-6 py-24 border-t border-[#27272A]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-2">
              Production Work
            </p>
            <h2 className="text-3xl font-bold text-[#F8FAFC] tracking-tight">
              AI systems I&apos;ve shipped
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 hidden sm:block"
          >
            All projects →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {featured.map((project) => (
            <div
              key={project.name}
              className="rounded-xl border border-[#27272A] bg-[#141414] p-5 hover:border-[#3f3f46] transition-colors duration-150"
              style={{ borderTopColor: project.color, borderTopWidth: "2px" }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: project.color }}
              >
                {project.tag}
              </span>
              <h3 className="text-base font-bold text-[#F8FAFC] mt-1 mb-2">{project.name}</h3>
              <p className="text-sm text-[#71717A] line-clamp-2 mb-3">{project.description}</p>
              <span className="text-xs text-[#F8FAFC] bg-[#0A0A0A] border border-[#27272A] px-2 py-1 rounded">
                {project.impact}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/projects"
            className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150"
          >
            See all projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
