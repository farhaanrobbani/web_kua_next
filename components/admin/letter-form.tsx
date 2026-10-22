"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import {
  createLetter,
  updateLetter,
  type LetterFormState,
} from "@/app/actions/letters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { LetterField } from "@/lib/letters";

export type LetterFormInitial = {
  nomor: string;
  tanggalSurat: string;
  perihal: string;
  headerHtml: string;
  showDate: boolean;
  showSignDate: boolean;
  data: Record<string, string>;
};

const TEXTAREA_CLASS =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function LetterForm({
  mode,
  letterId,
  letterTypeId,
  fields,
  initial,
  cancelHref,
  dariId,
}: {
  mode: "create" | "edit";
  letterId?: number;
  letterTypeId: number;
  fields: LetterField[];
  initial: LetterFormInitial;
  cancelHref: string;
  dariId?: number;
}) {
  const action =
    mode === "create" ? createLetter : updateLetter.bind(null, letterId ?? 0);
  const [state, formAction, pending] = useActionState<LetterFormState, FormData>(
    action,
    null,
  );

  const [nomor, setNomor] = useState(initial.nomor);
  const [tanggalSurat, setTanggalSurat] = useState(initial.tanggalSurat);
  const [perihal, setPerihal] = useState(initial.perihal);
  const [headerHtml, setHeaderHtml] = useState(initial.headerHtml);
  const [showDate, setShowDate] = useState(initial.showDate);
  const [showSignDate, setShowSignDate] = useState(initial.showSignDate);
  const [data, setData] = useState<Record<string, string>>(initial.data);
  const [touchedState, setTouchedState] = useState<{
    source: LetterFormState;
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

  const firstInternalIndex = fields.findIndex((field) => field.internal);

  function setFieldValue(name: string, value: string) {
    setData((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="letter_type_id" value={letterTypeId} />
      {dariId ? <input type="hidden" name="dari" value={dariId} /> : null}

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
          <Label htmlFor="nomor">Nomor Surat</Label>
          <Input
            id="nomor"
            name="nomor"
            value={nomor}
            onChange={(event) => {
              setNomor(event.target.value);
              touch("nomor");
            }}
            placeholder="B.001/KUA.01.01/PW.01/01/2026"
          />
          <FieldError message={errorFor("nomor")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggal_surat">Tanggal Surat</Label>
          <Input
            id="tanggal_surat"
            name="tanggal_surat"
            type="date"
            value={tanggalSurat}
            onChange={(event) => {
              setTanggalSurat(event.target.value);
              touch("tanggal_surat");
            }}
          />
          <FieldError message={errorFor("tanggal_surat")} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="tampilkan_tanggal"
            checked={showDate}
            onChange={(event) => setShowDate(event.target.checked)}
            className="size-4 rounded border-input accent-teal-700"
          />
          Tampilkan tanggal di baris atas
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="tampilkan_tanggal_ttd"
            checked={showSignDate}
            onChange={(event) => setShowSignDate(event.target.checked)}
            className="size-4 rounded border-input accent-teal-700"
          />
          Tampilkan tanggal di blok tanda tangan
        </label>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="perihal">
          Perihal Surat <span className="text-destructive">*</span>
        </Label>
        <Input
          id="perihal"
          name="perihal"
          value={perihal}
          onChange={(event) => {
            setPerihal(event.target.value);
            touch("perihal");
          }}
          placeholder="Permohonan Penerbitan Surat Keterangan"
          required
        />
        <FieldError message={errorFor("perihal")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="header_html">Baris Atas Surat</Label>
        <textarea
          id="header_html"
          name="header_html"
          rows={4}
          value={headerHtml}
          onChange={(event) => {
            setHeaderHtml(event.target.value);
            touch("header_html");
          }}
          className={`${TEXTAREA_CLASS} font-mono`}
        />
        <p className="text-xs text-muted-foreground">
          Gunakan <code>{"{nomor}"}</code>, <code>{"{perihal}"}</code>, dan{" "}
          <code>{"{tanggal_surat}"}</code> agar otomatis mengikuti data surat.
          Kosongkan untuk memakai baris otomatis.
        </p>
        <FieldError message={errorFor("header_html")} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-medium">Data Surat</h3>
        </div>

        {fields.map((field, index) => {
          const heading =
            index === firstInternalIndex ? (
              <div className="space-y-1 border-t pt-4">
                <h4 className="text-sm font-medium">Data tambahan (petugas)</h4>
                <p className="text-xs text-muted-foreground">
                  Field berikut hanya diisi oleh petugas saat membuat surat.
                </p>
              </div>
            ) : null;

          const error = errorFor(`data.${field.name}`);
          const value = data[field.name] ?? "";

          return (
            <div key={field.name}>
              {heading}
              <div className="space-y-2">
                <Label htmlFor={`field-${field.name}`}>
                  {field.label}
                  {field.required ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </Label>

                {field.type === "textarea" ? (
                  <textarea
                    id={`field-${field.name}`}
                    name={`data[${field.name}]`}
                    rows={3}
                    value={value}
                    onChange={(event) => {
                      setFieldValue(field.name, event.target.value);
                      touch(`data.${field.name}`);
                    }}
                    required={field.required}
                    className={TEXTAREA_CLASS}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={`field-${field.name}`}
                    name={`data[${field.name}]`}
                    value={value}
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
                    id={`field-${field.name}`}
                    name={`data[${field.name}]`}
                    type={field.type === "date" ? "date" : "text"}
                    value={value}
                    onChange={(event) => {
                      setFieldValue(field.name, event.target.value);
                      touch(`data.${field.name}`);
                    }}
                    required={field.required}
                  />
                )}

                <FieldError message={error} />
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {mode === "create" ? "Simpan Draft" : "Simpan Perubahan"}
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href={cancelHref} />}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
