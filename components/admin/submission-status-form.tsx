"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  updateSubmissionStatus,
  type SubmissionFormState,
} from "@/app/actions/submissions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const TEXTAREA_CLASS =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function SubmissionStatusForm({
  submissionId,
  status,
  catatan,
}: {
  submissionId: number;
  status: string;
  catatan: string;
}) {
  const [state, formAction, pending] = useActionState<
    SubmissionFormState,
    FormData
  >(updateSubmissionStatus.bind(null, submissionId), null);

  const [value, setValue] = useState(status);
  const [note, setNote] = useState(catatan);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="baru">Baru</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catatan">Catatan (untuk penolakan)</Label>
        <textarea
          id="catatan"
          name="catatan"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={TEXTAREA_CLASS}
        />
        {state?.fieldErrors?.catatan ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.catatan}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Simpan Status
      </Button>
    </form>
  );
}
