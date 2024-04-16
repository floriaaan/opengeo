import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { getEntityFromContact } from "@/lib/user";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createHabilitation } from "@/lib/fetchers/habilitation";
import { roles } from "@components/habilitations/roles";
import { useState } from "react";

const DEFAULT_ROLE = roles.find((r) => r.label === "Utilisateur")?.value;

export const HabilitationsModal = () => {
  const { user } = useAuth();

  const [role, setRole] = useState(DEFAULT_ROLE ?? "");

  if (!user) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="inline-flex gap-1 text-xs items-center ml-auto rounded-sm  select-none py-0.5 h-auto px-2  font-medium font-title ">
          Demander une habilitation
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{"Faire une demande d'habilitation"}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            <p>{"Vous pouvez faire une demande d'habilitation pour accéder à des informations supplémentaires."}</p>
            <p>
              {"Il n'est, pour l'instant, pas possible de faire une demande d'habilitation pour un autre utilisateur."}
            </p>
          </div>
        </DialogHeader>
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <div className="">
            <Label htmlFor="cn">Agent concerné.e</Label>
            <Input id="cn" disabled value={user?.cn} />
          </div>
          <div className="">
            <Label htmlFor="entity">Direction régionale</Label>
            <Input id="entity" disabled value={getEntityFromContact(user)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="role">Rôle souhaité</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="w-full placeholder:text-opacity-50">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogClose asChild>
          <Button
            className="mt-4 ml-auto"
            disabled={role === DEFAULT_ROLE || role === undefined}
            onClick={() => createHabilitation({ ...user, entity: getEntityFromContact(user) ?? "" }, role)}
          >
            Envoyer la demande
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
