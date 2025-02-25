import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSolutionSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface CreateSolutionFormProps {
  issueId: number;
  onSuccess?: () => void;
}

export function CreateSolutionForm({ issueId, onSuccess }: CreateSolutionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertSolutionSchema),
    defaultValues: {
      title: "",
      content: "",
      source: "",
      issueId,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", "/api/solutions", data);
      toast({
        title: "Solution added",
        description: "Your solution has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/solutions`] });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add solution. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter solution title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the solution in detail" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input placeholder="Enter the source of this solution" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit Solution
        </Button>
      </form>
    </Form>
  );
}
