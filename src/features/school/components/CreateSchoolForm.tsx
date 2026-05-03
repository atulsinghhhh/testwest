import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { schoolService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, GraduationCap, MapPin, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CreateSchoolForm() {
  const [name, setName] = useState("");
  const [board, setBoard] = useState("");
  const [city, setCity] = useState("");
  const [principal, setPrincipal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const newSchool = await schoolService.create({
        name,
        board,
        city,
        principal,
      });
      
      // Navigate to the newly created school's dashboard or a success page
      // For now, let's go to the school dashboard route
      navigate({ to: "/dashboard/school" });
    } catch (err: any) {
      setError(err.message || "Failed to create school. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg border-primary/10 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wider uppercase">Institutional Registration</span>
        </div>
        <CardTitle className="text-2xl font-bold">Register your School</CardTitle>
        <CardDescription>
          Enter your school details to start using TestWest Insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="create-school-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">School Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="e.g. Westfield Public School"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="board" className="text-sm font-medium">Education Board</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="board"
                  placeholder="e.g. CBSE, ICSE, IB"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="principal" className="text-sm font-medium">Principal Name</Label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="principal"
                placeholder="e.g. Dr. Meera Iyer"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          form="create-school-form"
          type="submit" 
          className="w-full h-11 text-base font-semibold transition-all hover:shadow-md"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Create School Instance"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
