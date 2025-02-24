import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTopicSchema } from "@shared/schema";
import { type Topic } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TopicsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: topics } = useQuery<Topic[]>({ queryKey: ["/api/topics"] });

  const form = useForm({
    resolver: zodResolver(insertTopicSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: any) {
    try {
      await apiRequest("POST", "/api/topics", values);
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      form.reset();
      toast({
        title: "Success",
        description: "Topic added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add topic",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Add Topic</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topics?.map((topic) => (
                <div key={topic.id} className="p-4 border rounded">
                  <h3 className="font-semibold">{topic.name}</h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
