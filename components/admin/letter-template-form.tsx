"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  createLetterTemplate,
  updateLetterTemplate,
  type LetterTemplateFormState,
} from "@/app/actions/letter-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LetterTemplateInitial = {
  letterTypeId: number;
  name: string;
  body: string;
  active: boolean;
};

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function LetterTemplateForm({
  mode,
  templateId,
  letterTypes,
  initial,
}: {
  mode: "create" | "edit";
  templateId?: number;
  letterTypes: { id: number; name: string }[];
  initial: LetterTemplateInitial;
}) {
  const action =
    mode === "create"
      ? createLetterTemplate
      : updateLetterTemplate.bind(null, templateId ?? 0);

  const [state, formAction, pending] = useActionState<
    LetterTemplateFormState,
    FormData
  >(action, null);

  const [letterTypeId, setLetterTypeId] = useState(
    initial.letterTypeId > 0 ? String(initial.letterTypeId) : "",
  );
  const [name, setName] = useState(initial.name);
  const [body, setBody] = useState(initial.body);
  const [active, setActive] = useState(initial.active);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="active" value={active ? "1" : "0"} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="letter_type_id">Jenis Surat</Label>
          <select
            id="letter_type_id"
            name="letter_type_id"
            value={letterTypeId}
            onChange={(event) => setLetterTypeId(event.target.value)}
            required
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">-- Pilih Jenis Surat --</option>
            {letterTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.letter_type_id ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.letter_type_id}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nama Template</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Template Surat Keterangan Nikah"
            required
          />
          {state?.fieldErrors?.name ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Isi Template Surat</Label>
        <p className="text-xs text-muted-foreground">
          Gunakan placeholder <code>[nama_field]</code> sesuai field pada jenis
          surat. Body adalah isi surat setelah kop dan baris atas.
        </p>
        <textarea
          id="body"
          name="body"
          rows={16}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          className={`${TEXTAREA_CLASS} font-mono`}
        />
        {state?.fieldErrors?.body ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.body}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="size-4 rounded border-input accent-teal-700"
        />
        Aktif
        <span className="text-xs text-muted-foreground">
          Template aktif digunakan saat surat dirender.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {mode === "create" ? "Simpan Template" : "Simpan Perubahan"}
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/letter-templates" />}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
