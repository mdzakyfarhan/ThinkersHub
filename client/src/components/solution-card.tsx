import { Solution } from "@shared/schema";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface SolutionCardProps {
  solution: Solution;
  issueId: number;
}

export function SolutionCard({ solution, issueId }: SolutionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    try {
      await apiRequest("POST", `/api/solutions/${solution.id}/approve`);
      toast({
        title: "Solution approved",
        description: "The solution has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve solution.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{solution.title}</h3>
          {solution.approved && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm">Approved</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap mb-4">{solution.content}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Source: {solution.source}</span>
        </div>
      </CardContent>
      {user?.isAdmin && !solution.approved && (
        <CardFooter>
          <Button onClick={handleApprove} className="ml-auto" size="sm">
            Approve Solution
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
