import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { THEME_MAP } from "@/themes";
import { portfolio } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Portfolio() {
  const { slug } = useParams<{ slug: string }>();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['portfolio', slug],
    queryFn: () => portfolio.get(slug as string),
    enabled: !!slug,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-syne text-4xl font-bold text-foreground mb-4">Portfolio not found</h1>
        <p className="font-dm text-text-secondary">
          The developer portfolio "{slug}" you are looking for doesn't exist.
        </p>
      </div>
    );
  }

  const ThemeComponent = THEME_MAP[profile.theme] || THEME_MAP.minimal;

  return <ThemeComponent profile={profile} />;
}
