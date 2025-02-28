import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Issue, Solution } from "@shared/schema";
import { SolutionCard } from "@/components/solution-card";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateSolutionForm } from "@/components/create-solution-form";

export default function IssuePage() {
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: issue, isLoading: isLoadingIssue } = useQuery<Issue>({
    queryKey: [`/api/issues/${id}`],
  });

  const { data: solutions, isLoading: isLoadingSolutions, isError, error } = useQuery<Solution[]>({
    queryKey: [`/api/issues/${id}/solutions`],
    queryFn: async () => {
      console.log(`[FETCH] Fetching solutions for issue ${id}`);
      try {
        const result = await apiRequest("GET", `/api/issues/${id}/solutions`);
        console.log(`[FETCH] Received ${result?.length || 0} solutions:`, result);
        return result || [];
      } catch (err) {
        console.error('[FETCH] Error fetching solutions:', err);
        return [];
      }
    },
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  if (isLoadingIssue || isLoadingSolutions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!issue) return <div>Issue not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{issue.title}</h1>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Problem Description</h2>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{issue.content}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Key Facts</h2>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              {issue.keyFacts.map((fact, index) => (
                <li key={index}>{fact}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Proposed Solutions</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Solution
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Solution</DialogTitle>
                </DialogHeader>
                <CreateSolutionForm 
                  issueId={Number(id)} 
                  onSuccess={() => setIsDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {isError && (
              <p className="text-center text-red-500 py-8">
                Error loading solutions. Please refresh the page.
              </p>
            )}
            {!isError && solutions && solutions.length > 0 ? (
              solutions.map((solution) => (
                <SolutionCard 
                  key={solution.id} 
                  solution={solution} 
                  issueId={Number(id)}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No solutions have been proposed yet. Be the first to add a solution!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}