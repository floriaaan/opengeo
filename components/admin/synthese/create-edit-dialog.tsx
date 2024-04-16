import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { getEntityFromContact } from "@/lib/user";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui";
import { useMemo, useState } from "react";

import { useDraggableInPortal } from "@/hooks/useDraggableInPortal";
import { useLazyLoading } from "@/hooks/useLazyLoading";
import { fetcher } from "@/lib/fetchers";
import { getAllSubObject } from "@/lib/fetchers/sub-object";
import { log } from "@/lib/log";
import { SyntheseChild, SyntheseType } from "@/types/synthese";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretSortIcon, CheckIcon, Cross1Icon, DragHandleDots2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { DragDropContext, Draggable, DraggableChildrenFn, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  reference: z.string().min(1, "La référence est obligatoire"),
  label: z.string().min(1, "Le nom est obligatoire"),
  children: z.array(
    z.object({
      _id: z.string(),
      metadata: z.object({
        label: z.string(),
        header: z.string().optional(),
        footer: z.string().optional(),
      }),
    }),
  ),
});

export const SyntheseCreateEditDialogContent = ({
  onCloseModal,
  initialValues,
}: {
  onCloseModal: () => void;
  initialValues?: SyntheseType;
}) => {
  const isEdit = !!initialValues;

  const { user } = useAuth();
  const entity = useMemo(() => getEntityFromContact(user), [user]);
  const { data: api_g, loading: loading_g } = useFetch<APIResult<GenericObject[]>>(
    `/api/generic-object/get?entity=${entity}`,
  );
  const objects = useMemo(() => api_g?.data || [], [api_g]);
  const { data: sub, isLoading: loading_s } = useLazyLoading([], getAllSubObject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reference: initialValues?.metadata.reference || "",
      label: initialValues?.metadata.label || "",
      children: initialValues?.children || [],
    },
  });
  const children = form.watch("children");
  const handleOnDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    const items = [...children];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("children", items);
  };

  const [loading_submit, setLoadingSubmit] = useState(false);
  async function create(values: z.infer<typeof formSchema>) {
    let toastId = toast.loading("Création de la fiche de synthèse en cours...");
    try {
      setLoadingSubmit(true);
      const res = await fetcher("/api/synthese/create", {
        method: "POST",
        body: JSON.stringify({
          metadata: { reference: values.reference, label: values.label },
          children: sub
            .filter((s) => values.children.findIndex((c) => c._id === s._id) !== -1)
            .map((s) => ({
              ...s,
              metadata: {
                ...s.metadata,
                header: values.children.find((c) => c._id === s._id)?.metadata.header,
                footer: values.children.find((c) => c._id === s._id)?.metadata.footer,
              },
            })),
        }),
      });
      if (!res.ok) throw new Error("Une erreur est survenue lors de la création de la fiche de synthèse");
      toast.success("La fiche de synthèse a été créée avec succès", { id: toastId, icon: "✅" });
      form.reset();
      onCloseModal();
    } catch (e) {
      log.error(e);
      toast.error((e as Error).message, { id: toastId, icon: "❌" });
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function update(values: z.infer<typeof formSchema>) {
    let toastId = toast.loading("Mise à jour de la fiche de synthèse en cours...");
    try {
      setLoadingSubmit(true);
      const res = await fetcher("/api/synthese/update", {
        method: "PUT",
        body: JSON.stringify({
          _id: initialValues?._id,
          metadata: { reference: values.reference, label: values.label },
          children: sub
            .filter((s) => values.children.findIndex((c) => c._id === s._id) !== -1)
            .map((s) => ({
              ...s,
              metadata: {
                ...s.metadata,
                header: values.children.find((c) => c._id === s._id)?.metadata.header,
                footer: values.children.find((c) => c._id === s._id)?.metadata.footer,
              },
            })),
        }),
      });
      if (!res.ok) throw new Error("Une erreur est survenue lors de la mise à jour de la fiche de synthèse");
      toast.success("La fiche de synthèse a été mise à jour avec succès", { id: toastId, icon: "✅" });
      form.reset();
      onCloseModal();
    } catch (e) {
      log.error(e);
      toast.error((e as Error).message, { id: toastId, icon: "❌" });
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEdit) update(values);
    else create(values);
  }

  return (
    <DialogContent className="flex flex-col sm:max-w-5xl gap-y-4 max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? `Modifier la fiche de synthèse "${initialValues?.metadata.label}"` : "Créer une fiche de synthèse"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Modifiez les informations de la fiche de synthèse. Vous pouvez ajouter ou retirer des sous-objets à afficher dans la fiche de synthèse."
            : "Veuillez renseigner les informations nécessaires pour créer une nouvelle fiche de synthèse."}
        </DialogDescription>
      </DialogHeader>
      <hr />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4 grow">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la fiche synthèse</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) =>
                !loading_g ? (
                  <FormItem>
                    <FormLabel>{"Référence à l'objet"}</FormLabel>
                    <FormDescription style={{ marginTop: 0 }}>
                      {
                        "La fiche de synthèse sera associée à un objet générique. C'est à partir des objets de ce type que vous pourrez générer cette fiche de synthèse."
                      }
                    </FormDescription>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type d'objet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from(new Set(objects.map((o) => o.metadata.label))).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                ) : (
                  <p className="text-[0.8rem] text-muted-foreground">Chargement des objets...</p>
                )
              }
            />

            <FormField
              control={form.control}
              name="children"
              render={({ field }) =>
                !loading_s ? (
                  <FormItem className="flex flex-col">
                    <FormLabel>Sous-objets à afficher</FormLabel>
                    <DropdownMenu>
                      <div className="relative">
                        <DropdownMenuTrigger className="flex min-h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                          <div className="inline-flex flex-wrap items-center w-full gap-2 grow">
                            {field.value?.length === 0
                              ? "Aucun sous-objet sélectionné"
                              : field.value?.map((a) => (
                                  <div className="bg-gray-100 px-1 py-0.5 text-xs" key={a._id}>
                                    {a.metadata.label}
                                  </div>
                                ))}
                          </div>
                          <CaretSortIcon className="w-4 h-4 opacity-50" />
                        </DropdownMenuTrigger>
                        {children.length > 0 && (
                          <Button
                            size="icon"
                            className="absolute w-5 h-5 transform -translate-y-1/2 pointer-events-auto top-1/2 right-9"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue("children", []);
                            }}
                          >
                            <Cross1Icon className="w-3 h-3 opacity-70" />
                          </Button>
                        )}
                      </div>

                      <DropdownMenuContent className="w-full overflow-y-auto">
                        <ScrollArea className="overflow-y-auto max-h-96">
                          {sub.map((s) => (
                            <DropdownMenuCheckboxItem
                              key={s._id}
                              checked={field.value?.findIndex((o) => o._id === s._id) !== -1}
                              onCheckedChange={(checked) => {
                                form.setValue(
                                  "children",
                                  checked ? [...(field.value || []), s] : field.value?.filter((o) => o._id !== s._id),
                                );
                              }}
                              className="flex flex-row w-full gap-1 text-xs"
                            >
                              <strong className="text-sm font-semibold">{s.metadata.label}</strong> - compris dans{" "}
                              {
                                objects
                                  .map((o) => Object.keys(o.children))
                                  .flat()
                                  .filter((o) => o === s.metadata.label).length
                              }{" "}
                              objets
                            </DropdownMenuCheckboxItem>
                          ))}
                        </ScrollArea>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                  </FormItem>
                ) : (
                  <p className="text-[0.8rem] text-muted-foreground">Chargement des sous-objets...</p>
                )
              }
            />
            <div className="-mt-2">
              <ReorderItems _children={children} handleOnDragEnd={handleOnDragEnd} />
            </div>
            <ChildMetadataHandler form={form} />
          </div>
          <div className="inline-flex items-center justify-end w-full gap-2 ">
            <Button type="button" onClick={() => onCloseModal()} variant="outline">
              <Cross1Icon className="w-4 h-4" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading_submit}>
              {loading_submit ? <UpdateIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
              {loading_submit
                ? "En cours..."
                : isEdit
                ? "Mettre à jour la fiche de synthèse"
                : "Créer la fiche de synthèse"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

const ReorderItems = ({
  _children,
  handleOnDragEnd,
}: {
  _children: { _id: string; metadata: { label: string } }[];
  handleOnDragEnd: OnDragEndResponder;
}) => {
  const renderDraggable = useDraggableInPortal();
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="children">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="relative flex flex-row flex-wrap gap-2">
            {_children.map((a, index) => (
              <Draggable key={a._id} draggableId={a._id} index={index}>
                {
                  renderDraggable((provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="inline-flex items-center justify-center p-2 text-sm font-medium transition-colors bg-transparent border rounded-md whitespace-nowrap focus-visible:outline-none border-input hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-x-2 h-9"
                    >
                      <DragHandleDots2Icon className="w-4 h-4" />
                      <Badge>{index + 1}</Badge>
                      {a.metadata.label}
                    </div>
                  )) as unknown as DraggableChildrenFn
                }
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const ChildMetadataHandler = ({ form }: { form: ReturnType<typeof useForm<z.infer<typeof formSchema>>> }) => {
  const children = form.watch("children") as SyntheseChild[];

  return (
    <>
      <label className="inline-flex items-end text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 gap-x-1">
        Métadonnées des sous-objets
      </label>
      <p className="text-[0.8rem] -mt-2 text-muted-foreground">
        En-tête et pied de page des sous-objets. Ces informations seront affichées en haut et en bas de chaque tableau
      </p>

      {children.length > 0 ? (
        <Accordion type="multiple">
          {children.map((c, index) => (
            <AccordionItem value={c._id} key={`${c._id}-${index}`}>
              <AccordionTrigger>{c.metadata.label}</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name={`children.${index}.metadata.header`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>En-tête</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`children.${index}.metadata.footer`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pied de page</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-[0.8rem] text-muted-foreground">Aucun sous-objet sélectionné</p>
      )}
    </>
  );
};
