import { useState } from "react";
import { teacherService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddTeacherFormProps {
  schoolId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddTeacherForm({ schoolId, onSuccess, onCancel }: AddTeacherFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subjects, setSubjects] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await teacherService.create({
        user: {
          firstName,
          lastName,
          email,
          password,
        },
        profile: {
          schoolId,
          subjects: subjects.split(",").map(s => s.trim()).filter(Boolean),
        },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input 
            id="firstName" 
            value={firstName} 
            onChange={e => setFirstName(e.target.value)} 
            placeholder="John" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input 
            id="lastName" 
            value={lastName} 
            onChange={e => setLastName(e.target.value)} 
            placeholder="Doe" 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="teacher@school.com" 
            className="pl-10" 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Initial Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="••••••••" 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subjects">Subjects (comma separated)</Label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="subjects" 
            value={subjects} 
            onChange={e => setSubjects(e.target.value)} 
            placeholder="Mathematics, Physics" 
            className="pl-10" 
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Teacher"}
        </Button>
      </div>
    </form>
  );
}
