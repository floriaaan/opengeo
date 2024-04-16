import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { fetcher } from "@/lib/fetchers";
import { deleteAllCollections } from "@/lib/fetchers/collections";
import { log } from "@/lib/log";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  // eslint-disable-next-line no-useless-escape
  json: z.string().regex(/((\[[^\}]+)?\{s*[^\}\{]{3,}?:.*\}([^\{]+\])?)/gm, "Mauvais format de JSON"),
  dropCollections: z.coerce.boolean(),
});

export function DebugImportForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { json: "", dropCollections: false },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.dropCollections)
        deleteAllCollections()
          .then(() => toast("Les collections ont été supprimées", { icon: "🗑️" }))
          .catch(() => toast.error("Une erreur est survenue lors de la suppression des collections", { icon: "🚨" }));
      const res = await fetcher("/api/_/import-database", {
        method: "POST",
        body: values.json,
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      toast("Les données ont été importées", { icon: "🤡" });
    } catch (e) {
      log.error(e);
      toast.error("Une erreur est survenue lors de l'import des données", { icon: "🚨" });
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="json"
          render={({ field }) => (
            <FormItem>
              <FormLabel>JSON</FormLabel>
              <FormControl>
                <Textarea placeholder="{...}" {...field} rows={16} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dropCollections"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-0.5">
              <FormLabel>Supprimer les collections existantes ?</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Envoyer</Button>
      </form>
    </Form>
  );
}
