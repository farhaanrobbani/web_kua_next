"use client";

import { useActionState, useState } from "react";

import { rejectLetter, type LetterFormState } from "@/app/actions/letters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function RejectLetterDialog({ letterId }: { letterId: number }) {
  const [state, formAction, pending] = useActionState<LetterFormState, FormData>(
    rejectLetter.bind(null, letterId),
    null,
  );
  const [keterangan, setKeterangan] = useState("");

  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-8 items-center justify-center rounded-lg bg-destructive/10 px-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/20">
        Tolak
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak surat</DialogTitle>
          <DialogDescription>
            Berikan catatan agar pembuat surat tahu bagian yang perlu diperbaiki.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="keterangan">Catatan penolakan</Label>
            <textarea
              id="keterangan"
              name="keterangan"
              rows={4}
              value={keterangan}
              onChange={(event) => setKeterangan(event.target.value)}
              required
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="Contoh: Nama pada template belum sesuai dengan data permohonan."
            />
            {state?.fieldErrors?.keterangan ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.keterangan}
              </p>
            ) : null}
            {state?.error ? (
              <p className="text-xs text-destructive">{state.error}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Memproses…" : "Tolak Surat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
