
import { Solution } from "@shared/schema";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SolutionCardProps {
  solution: Solution;
  issueId: number;
}

export function SolutionCard({ solution, issueId }: SolutionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    setShowApproveDialog(false);
  };

  const handleReject = async () => {
    try {
      const response = await apiRequest("POST", `/api/solutions/${solution.id}/reject`);
      if (!response || response.error) {
        throw new Error(response?.error || "Failed to reject solution");
      }
      toast({
        title: "Solution rejected",
        description: "The solution has been rejected successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
      await queryClient.refetchQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
    } catch (error: any) {
      console.error("Reject error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowRejectDialog(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await apiRequest("DELETE", `/api/solutions/${solution.id}`);
      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to delete solution");
      }
      toast({
        title: "Solution deleted",
        description: "The solution has been deleted successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
      await queryClient.refetchQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Only show approved solutions to non-admin users
  if (!user?.isAdmin && (!solution.approved || solution.rejected)) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">{solution.title}</h3>
            <div className="flex items-center gap-2">
              {solution.approved && !solution.rejected && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Approved</span>
                </div>
              )}
              {solution.rejected && (
                <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded">
                  <XCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
              )}
            </div>
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
              <Button onClick={() => setShowApproveDialog(true)} size="sm" variant="outline" className="text-green-600">
                Approve
              </Button>
            )}
            {!solution.rejected && (
              <Button onClick={() => setShowRejectDialog(true)} size="sm" variant="outline" className="text-red-600">
                Reject
              </Button>
            )}
          <Button onClick={() => setShowDeleteDialog(true)} size="sm" variant="outline" className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Solution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this solution? This action will make the solution visible to all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Solution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this solution? This action will hide the solution from regular users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600">Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Solution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this solution? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
