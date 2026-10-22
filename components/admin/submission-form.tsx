"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2, UserRound } from "lucide-react";

import {
  createSubmission,
  type SubmissionFormState,
} from "@/app/actions/submissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { LetterField } from "@/lib/letters";

const TEXTAREA_CLASS =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function SubmissionForm({
  letterTypeCode,
  fields,
  initialData = {},
}: {
  letterTypeCode: string;
  fields: LetterField[];
  initialData?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<
    SubmissionFormState,
    FormData
  >(createSubmission, null);

  const [namaPemohon, setNamaPemohon] = useState("");
  const [kontak, setKontak] = useState("");
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [touchedState, setTouchedState] = useState<{
    source: SubmissionFormState;
    keys: string[];
  }>({ source: null, keys: [] });
  const touched =
    touchedState.source === state ? touchedState.keys : [];

  function touch(key: string) {
    const keys = touched.includes(key) ? touched : [...touched, key];
    setTouchedState({ source: state, keys });
  }

  function errorFor(key: string) {
    return touched.includes(key) ? undefined : state?.fieldErrors?.[key];
  }

  function setFieldValue(name: string, value: string) {
    setData((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="jenis" value={letterTypeCode} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-medium">Data Pemohon</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nama_pemohon">Nama Lengkap Pemohon *</Label>
            <Input
              id="nama_pemohon"
              name="nama_pemohon"
              value={namaPemohon}
              onChange={(event) => {
                setNamaPemohon(event.target.value);
                touch("nama_pemohon");
              }}
              required
            />
            {errorFor("nama_pemohon") ? (
              <p className="text-xs text-destructive">
                {errorFor("nama_pemohon")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontak">No. HP / Email *</Label>
            <Input
              id="kontak"
              name="kontak"
              value={kontak}
              onChange={(event) => {
                setKontak(event.target.value);
                touch("kontak");
              }}
              placeholder="0821xxxx / email@contoh.id"
              required
            />
            {errorFor("kontak") ? (
              <p className="text-xs text-destructive">
                {errorFor("kontak")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Data Surat yang Diminta</h3>

        {fields.map((field) => {
          const fieldValue = data[field.name] ?? "";
          const error = errorFor(`data.${field.name}`);

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={`submission-field-${field.name}`}>
                {field.label}
                {field.required ? (
                  <span className="text-destructive"> *</span>
                ) : null}
              </Label>

              {field.type === "textarea" ? (
                <textarea
                  id={`submission-field-${field.name}`}
                  name={`data[${field.name}]`}
                  rows={3}
                  value={fieldValue}
                  onChange={(event) => {
                    setFieldValue(field.name, event.target.value);
                    touch(`data.${field.name}`);
                  }}
                  required={field.required}
                  className={TEXTAREA_CLASS}
                />
              ) : field.type === "select" ? (
                <select
                  id={`submission-field-${field.name}`}
                  name={`data[${field.name}]`}
                  value={fieldValue}
                  onChange={(event) => {
                    setFieldValue(field.name, event.target.value);
                    touch(`data.${field.name}`);
                  }}
                  required={field.required}
                  className={SELECT_CLASS}
                >
                  <option value="">-- Pilih --</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`submission-field-${field.name}`}
                  name={`data[${field.name}]`}
                  type={field.type === "date" ? "date" : "text"}
                  value={fieldValue}
                  onChange={(event) => {
                    setFieldValue(field.name, event.target.value);
                    touch(`data.${field.name}`);
                  }}
                  required={field.required}
                />
              )}

              {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          Simpan Permohonan
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/submissions" />}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
