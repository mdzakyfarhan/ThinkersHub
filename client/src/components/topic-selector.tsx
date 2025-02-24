import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Topic } from "@shared/schema";

interface TopicSelectorProps {
  value?: number;
  onSelect: (topicId: number | undefined) => void;
}

export function TopicSelector({ value, onSelect }: TopicSelectorProps) {
  const { data: topics, isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => onSelect(value === "all" ? undefined : Number(value))}
      disabled={isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a topic" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Topics</SelectItem>
        {topics?.map((topic) => (
          <SelectItem key={topic.id} value={topic.id.toString()}>
            {topic.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}