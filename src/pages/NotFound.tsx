import { Link } from "react-router-dom";
import { Home, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative text-center space-y-8 animate-fade-in">
        <h1 className="text-9xl font-bold text-gradient">404</h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        
        <div className="flex items-center justify-center gap-4">
          <Button asChild variant="gold" size="lg">
            <Link to="/"><Home className="w-5 h-5 mr-2" />Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/songs"><Music className="w-5 h-5 mr-2" />Browse Music</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
