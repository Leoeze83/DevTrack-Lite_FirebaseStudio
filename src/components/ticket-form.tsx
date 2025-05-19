"use client";

import type { FC } from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTicketStore } from "@/lib/hooks/use-ticket-store";
import type { Priority } from "@/lib/types";
import { categorizeTicketDescription, CategorizationResult } from "@/app/actions";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const ticketFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(1000),
  category: z.string().min(1, "Category is required.").max(50),
  priority: z.enum(["low", "medium", "high"], { required_error: "Priority is required." }),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export const TicketForm: FC = () => {
  const { addTicket } = useTicketStore();
  const { toast } = useToast();
  const router = useRouter();
  const [isCategorizing, setIsCategorizing] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: undefined,
    },
  });

  const handleAutoCategorize = async () => {
    const description = form.getValues("description");
    if (!description.trim()) {
      toast({
        title: "Cannot Categorize",
        description: "Please enter a description first.",
        variant: "destructive",
      });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeTicketDescription(description);
      if ("error" in result) {
        toast({
          title: "AI Categorization Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        form.setValue("category", result.category, { shouldValidate: true });
        form.setValue("priority", result.priority, { shouldValidate: true });
        toast({
          title: "AI Categorization Successful",
          description: `Category set to "${result.category}" and priority to "${result.priority}".`,
        });
      }
    } catch (error) {
       toast({
          title: "AI Categorization Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (data: TicketFormValues) => {
    const newTicket = addTicket(data);
    toast({
      title: "Ticket Created!",
      description: `Ticket "${newTicket.title}" has been successfully created.`,
    });
    form.reset();
    router.push("/"); // Navigate to dashboard after creation
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Create New Support Ticket</CardTitle>
        <CardDescription>Fill in the details below to submit a new ticket. Use the AI categorize feature for help!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Login issue on mobile app" {...field} />
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
                    <Textarea placeholder="Describe the issue in detail..." {...field} rows={5} />
                  </FormControl>
                  <FormDescription>
                    The more detail you provide, the faster we can help.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="button" variant="outline" onClick={handleAutoCategorize} disabled={isCategorizing} className="w-full sm:w-auto">
              {isCategorizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              AI Auto-Categorize & Prioritize
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bug Report, Feature Request" {...field} />
                    </FormControl>
                    <FormDescription>
                      AI suggestion or manual input.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                     <FormDescription>
                      AI suggestion or manual input.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full sm:w-auto ml-auto" disabled={form.formState.isSubmitting || isCategorizing}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Ticket
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
