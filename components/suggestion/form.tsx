"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetchers";
import { Textarea } from "@components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  suggestion: z.string().min(1, "Votre suggestion doit contenir au moins 1 caractère."),
  message: z.string().optional(),
});

export function SuggestionForm({
  path,
  initialValue,
  closeDialog,
}: {
  path: string;
  initialValue: z.infer<typeof formSchema>["suggestion"];
  closeDialog: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { suggestion: initialValue },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.suggestion === initialValue) return toast.error("Votre suggestion n'a pas changé.");
    try {
      const res = await fetcher("/api/suggestion/create", {
        method: "POST",
        body: JSON.stringify({ ...values, path, initialValue }),
      });
      const data = await res.json();
      if (!res.ok && data.error?.message.description) throw new Error(data.error.message.description);
      if (!res.ok) throw new Error("Une erreur est survenue lors de l'envoi de votre suggestion.");
      toast.success("Votre suggestion a été envoyée avec succès. Merci !", {
        icon: "✅",
        description: "Elle sera traitée dans les plus brefs délais.",
      });
      form.reset();
      closeDialog();
    } catch (e) {
      toast.error("Une erreur s'est produite.", { icon: "🚨", description: (e as Error)?.message });
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="suggestion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suggestion</FormLabel>
              <FormControl>
                <Input placeholder="Nouvelle valeur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Message
                <small>(optionnel)</small>
              </FormLabel>
              <FormControl>
                <Textarea rows={8} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="inline-flex justify-end w-full ">
          <Button type="submit">
            <PaperPlaneIcon />
            Envoyer
          </Button>
        </div>
      </form>
    </Form>
  );
}
