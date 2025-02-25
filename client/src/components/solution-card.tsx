
import { Solution } from "@shared/schema";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
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

  const handleReject = async () => {
    try {
      await apiRequest("POST", `/api/solutions/${solution.id}/reject`);
      toast({
        title: "Solution rejected",
        description: "The solution has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject solution.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/solutions/${solution.id}`);
      toast({
        title: "Solution deleted",
        description: "The solution has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete solution.",
        variant: "destructive",
      });
    }
  };

  // Only show approved solutions to non-admin users
  if (!user?.isAdmin && (!solution.approved || solution.rejected)) {
    return null;
  }

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
          {solution.rejected && (
            <div className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-1" />
              <span className="text-sm">Rejected</span>
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
      {user?.isAdmin && (
        <CardFooter className="flex gap-2 justify-end">
          {!solution.approved && !solution.rejected && (
            <Button onClick={handleApprove} size="sm" variant="outline" className="text-green-600">
              Approve
            </Button>
          )}
          {!solution.rejected && (
            <Button onClick={handleReject} size="sm" variant="outline" className="text-red-600">
              Reject
            </Button>
          )}
          <Button onClick={handleDelete} size="sm" variant="outline" className="text-red-600">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
