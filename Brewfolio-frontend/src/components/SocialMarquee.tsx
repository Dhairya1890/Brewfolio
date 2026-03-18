const platforms = [
  "GitHub", "LeetCode", "Codeforces", "AtCoder", "CodeChef", "Dev.to", "Hashnode",
];

const SocialMarquee = () => {
  const items = [...platforms, ...platforms, ...platforms, ...platforms];

  return (
    <div className="relative overflow-hidden py-8 border-y border-border">
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap w-max">
        {items.map((name, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="text-sm font-dm text-foreground/25 hover:text-foreground/60 transition-colors duration-200 cursor-default uppercase tracking-widest">
              {name}
            </span>
            {i < items.length - 1 && (
              <span className="text-accent-pink text-xs">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SocialMarquee;
