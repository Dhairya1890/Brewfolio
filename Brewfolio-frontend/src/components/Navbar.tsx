import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-void/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-syne text-xl font-bold text-foreground">
          devfolio<span className="text-accent-cyan">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-foreground hover:text-foreground/80 font-dm">
            Sign In
          </Button>
          <Link to="/build">
            <Button className="btn-gradient text-primary-foreground font-syne text-sm px-5 py-2 rounded-lg border-0">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
