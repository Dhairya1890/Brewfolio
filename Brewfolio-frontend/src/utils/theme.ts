export const getAccentBgColor = (color: string) => {
  switch (color) {
    case "violet": return "bg-accent-violet";
    case "cyan": return "bg-accent-cyan";
    case "green": return "bg-green-500";
    case "orange": return "bg-orange-500";
    case "rose": return "bg-rose-500";
    case "mono": return "bg-foreground";
    default: return "bg-accent-violet";
  }
};

export const getAccentTextColor = (color: string) => {
  switch (color) {
    case "violet": return "text-accent-violet";
    case "cyan": return "text-accent-cyan";
    case "green": return "text-green-500";
    case "orange": return "text-orange-500";
    case "rose": return "text-rose-500";
    case "mono": return "text-foreground";
    default: return "text-accent-violet";
  }
};

export const getAccentBorderColor = (color: string) => {
  switch (color) {
    case "violet": return "border-accent-violet/30";
    case "cyan": return "border-accent-cyan/30";
    case "green": return "border-green-500/30";
    case "orange": return "border-orange-500/30";
    case "rose": return "border-rose-500/30";
    case "mono": return "border-foreground/30";
    default: return "border-accent-violet/30";
  }
};

export const getAccentHoverColor = (color: string) => {
  switch (color) {
    case "violet": return "hover:border-accent-violet/60";
    case "cyan": return "hover:border-accent-cyan/60";
    case "green": return "hover:border-green-500/60";
    case "orange": return "hover:border-orange-500/60";
    case "rose": return "hover:border-rose-500/60";
    case "mono": return "hover:border-foreground/60";
    default: return "hover:border-accent-violet/60";
  }
};
