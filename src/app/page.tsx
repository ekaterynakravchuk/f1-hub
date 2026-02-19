import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const modules = [
  {
    name: "Head-to-Head",
    description:
      "Compare any two F1 drivers side-by-side with statistics and interactive charts",
    href: "/head-to-head",
    status: null,
  },
  {
    name: "Quiz",
    description: "Test your Formula 1 knowledge with procedurally generated questions",
    href: "/quiz",
    status: null,
  },
  {
    name: "Team Radio",
    description: "Browse and listen to team radio communications",
    href: "#",
    status: "Planned",
  },
  {
    name: "History",
    description: "Explore an interactive timeline of Formula 1 history",
    href: "#",
    status: "Planned",
  },
  {
    name: "Weather Impact",
    description: "Analyze how weather conditions affect race outcomes",
    href: "#",
    status: "Planned",
  },
  {
    name: "Telemetry",
    description: "Visualize car telemetry data and compare driver performance",
    href: "#",
    status: "Planned",
  },
  {
    name: "Strategy Simulator",
    description: "Simulate pit stop strategies and race scenarios",
    href: "#",
    status: "Planned",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero Section */}
      <section className="py-16 text-center md:py-24">
        <h1 className="text-4xl font-bold md:text-5xl">F1 Hub</h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          Explore Formula 1 data and statistics
        </p>
      </section>

      {/* Module Cards Section */}
      <section className="pb-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const isActive = module.href !== "#";

            if (isActive) {
              return (
                <Link
                  key={module.name}
                  href={module.href}
                  className="block transition-colors hover:bg-accent/50"
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{module.name}</CardTitle>
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            }

            return (
              <div key={module.name} className="opacity-60">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{module.name}</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {module.status}
                      </span>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
