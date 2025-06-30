import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get the redirect location
  const from = location.state?.from?.pathname || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    // Validation
    if (!email || !password) {
      setLocalError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Παρακαλώ εισάγετε έγκυρη διεύθυνση email.");
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      
      toast({
        title: "Επιτυχής σύνδεση!",
        description: "Καλώς ήρθατε στο SWEAT24 Admin Panel.",
      });
      
      // Navigation is handled in the AuthContext after successful login
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Show specific error message
      const errorMessage = error.message || "Λανθασμένα στοιχεία σύνδεσης. Παρακαλώ δοκιμάστε ξανά.";
      
      toast({
        title: "Σφάλμα σύνδεσης",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Combine auth error and local error
  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-4">
            <div className="text-3xl font-bold text-primary">SWEAT24</div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Σύνδεση στο SWEAT24
          </CardTitle>
          <CardDescription className="text-center">
            Εισάγετε τα στοιχεία σας για πρόσβαση στο admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sweat24.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLocalError(null);
                  clearError();
                }}
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Κωδικός</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Εισάγετε τον κωδικό σας"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError(null);
                    clearError();
                  }}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Σύνδεση...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Σύνδεση
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo στοιχεία σύνδεσης:</p>
            <p className="mt-1">
              <strong>Email:</strong> admin@sweat24.com<br />
              <strong>Κωδικός:</strong> password
            </p>
          </div>

          {location.state?.from && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}