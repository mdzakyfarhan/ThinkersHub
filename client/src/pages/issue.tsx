import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceCitation } from "@/components/source-citation";
import { Issue, Solution } from "@shared/schema";

export default function IssuePage() {
  const { id } = useParams();

  const { data: issue, isLoading: isLoadingIssue } = useQuery<Issue>({
    queryKey: [`/api/issues/${id}`],
  });

  const { data: solutions, isLoading: isLoadingSolutions } = useQuery<Solution[]>({
    queryKey: [`/api/issues/${id}/solutions`],
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
          <h2 className="text-2xl font-semibold">Proposed Solutions</h2>
          {solutions?.map((solution) => (
            <Card key={solution.id}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">{solution.title}</h3>
                <p className="mb-4">{solution.content}</p>
                <SourceCitation source={solution.source} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
