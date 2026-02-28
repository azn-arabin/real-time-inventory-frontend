import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LogOut, User, Package } from "lucide-react";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="lg:px-16 md:px-12 px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <ShoppingBag className="h-5 w-5" />
          SneakerDrop
        </Link>

        <div className="flex items-center gap-3">
          <ModeToggle />

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-purchases">
                  <Package className="h-4 w-4 mr-1" />
                  My Purchases
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-4 w-4" />
                {user?.username}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
