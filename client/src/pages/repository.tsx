import { useQuery } from "@tanstack/react-query";
import { TopicSelector } from "@/components/topic-selector";
import { IssueCard } from "@/components/issue-card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Issue } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Repository() {
  const [selectedTopicId, setSelectedTopicId] = useState<number>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: issues, isLoading } = useQuery({
    queryKey: ["/api/issues", selectedTopicId],
  });

  const filteredIssues = issues?.filter((issue: Issue) =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Issue Repository</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <TopicSelector
              value={selectedTopicId}
              onSelect={setSelectedTopicId}
            />
          </div>
          <div className="w-full md:w-2/3">
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))
          ) : filteredIssues?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No issues found. Try adjusting your search or topic selection.
            </p>
          ) : (
            filteredIssues?.map((issue: Issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
