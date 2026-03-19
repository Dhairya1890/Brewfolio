import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, login, logout, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-void/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-syne text-xl font-bold text-foreground">
          brewfolio<span className="text-accent-cyan">.</span>
        </Link>
        <div className="flex items-center gap-3">
          {loading ? (
            <Button variant="ghost" disabled className="font-dm">
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-foreground/80 font-dm gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username || 'Profile'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-void border-border/40">
                <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" onClick={login} className="text-foreground hover:text-foreground/80 font-dm">
              Sign In
            </Button>
          )}
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
