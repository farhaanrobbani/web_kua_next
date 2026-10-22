"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createLetterType,
  updateLetterType,
  type LetterTypeFormState,
} from "@/app/actions/letter-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { LetterField, LetterFieldType } from "@/lib/letters";

type EditableField = LetterField & { optionsText: string };

export type LetterTypeInitial = {
  code: string;
  name: string;
  permohonanJudul: string;
  description: string;
  permohonanBody: string;
  permohonanInformasi: string;
  active: boolean;
  publik: boolean;
  kopEnabled: boolean;
  kopFooter: string;
  kopFooterEnabled: boolean;
  fields: LetterField[];
  permohonanFields: string[];
};

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const FIELD_TYPES: { value: LetterFieldType; label: string }[] = [
  { value: "text", label: "Teks" },
  { value: "textarea", label: "Teks Panjang" },
  { value: "date", label: "Tanggal" },
  { value: "select", label: "Pilihan" },
];

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function Checkbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 rounded border-input accent-teal-700"
      />
      <span>
        {label}
        {description ? (
          <span className="block text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function LetterTypeForm({
  mode,
  letterTypeId,
  initial,
  cloneNote,
}: {
  mode: "create" | "edit";
  letterTypeId?: number;
  initial: LetterTypeInitial;
  cloneNote?: string;
}) {
  const action =
    mode === "create"
      ? createLetterType
      : updateLetterType.bind(null, letterTypeId ?? 0);
  const [state, formAction, pending] = useActionState<
    LetterTypeFormState,
    FormData
  >(action, null);

  const [code, setCode] = useState(initial.code);
  const [name, setName] = useState(initial.name);
  const [permohonanJudul, setPermohonanJudul] = useState(
    initial.permohonanJudul,
  );
  const [description, setDescription] = useState(initial.description);
  const [permohonanBody, setPermohonanBody] = useState(initial.permohonanBody);
  const [permohonanInformasi, setPermohonanInformasi] = useState(
    initial.permohonanInformasi,
  );
  const [kopFooter, setKopFooter] = useState(initial.kopFooter);
  const [fields, setFields] = useState<EditableField[]>(
    initial.fields.map((field) => ({
      ...field,
      optionsText: (field.options ?? []).join(", "),
    })),
  );
  const [permohonanFields, setPermohonanFields] = useState<string[]>(
    initial.permohonanFields,
  );
  const [active, setActive] = useState(initial.active);
  const [publik, setPublik] = useState(initial.publik);
  const [kopEnabled, setKopEnabled] = useState(initial.kopEnabled);
  const [kopFooterEnabled, setKopFooterEnabled] = useState(
    initial.kopFooterEnabled,
  );

  function updateField(index: number, patch: Partial<EditableField>) {
    setFields((current) =>
      current.map((field, position) =>
        position === index ? { ...field, ...patch } : field,
      ),
    );
  }

  function removeField(index: number) {
    setFields((current) => current.filter((_, position) => position !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    setFields((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function togglePermohonanField(name: string, checked: boolean) {
    setPermohonanFields((current) =>
      checked
        ? [...new Set([...current, name])]
        : current.filter((item) => item !== name),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="field_count" value={fields.length} />
      <input type="hidden" name="active" value={active ? "1" : "0"} />
      <input type="hidden" name="publik" value={publik ? "1" : "0"} />
      <input type="hidden" name="kop_enabled" value={kopEnabled ? "1" : "0"} />
      <input
        type="hidden"
        name="kop_footer_enabled"
        value={kopFooterEnabled ? "1" : "0"}
      />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      {cloneNote ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          {cloneNote}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Kode</Label>
          <Input
            id="code"
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="SKN"
            className="font-mono uppercase"
            required
          />
          <p className="text-xs text-muted-foreground">
            Kode unik, contoh: SKN, SKU, SPM.
          </p>
          <ErrorText message={state?.fieldErrors?.code} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nama Jenis Surat</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Surat Keterangan Nikah"
            required
          />
          <ErrorText message={state?.fieldErrors?.name} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="permohonan_judul">Judul Surat Permohonan</Label>
        <Input
          id="permohonan_judul"
          name="permohonan_judul"
          value={permohonanJudul}
          onChange={(event) => setPermohonanJudul(event.target.value)}
          placeholder="Surat Keterangan Domisili"
          required
        />
        <p className="text-xs text-muted-foreground">
          Judul yang dicetak di bagian atas PDF Surat Permohonan.
        </p>
        <ErrorText message={state?.fieldErrors?.permohonan_judul} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={TEXTAREA_CLASS}
        />
        <ErrorText message={state?.fieldErrors?.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="permohonan_body">Narasi Surat Permohonan</Label>
        <textarea
          id="permohonan_body"
          name="permohonan_body"
          rows={4}
          value={permohonanBody}
          onChange={(event) => setPermohonanBody(event.target.value)}
          className={TEXTAREA_CLASS}
        />
        <p className="text-xs text-muted-foreground">
          Gunakan placeholder <code>[nama_field]</code> dari field di bawah,
          serta <code>[nama_pemohon]</code> dan <code>[kontak]</code>.
        </p>
        <ErrorText message={state?.fieldErrors?.permohonan_body} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="permohonan_informasi">
          Informasi di Bawah Form Permohonan
        </Label>
        <textarea
          id="permohonan_informasi"
          name="permohonan_informasi"
          rows={4}
          value={permohonanInformasi}
          onChange={(event) => setPermohonanInformasi(event.target.value)}
          className={TEXTAREA_CLASS}
          placeholder="Daftar berkas yang harus dibawa ke KUA."
        />
        <ErrorText message={state?.fieldErrors?.permohonan_informasi} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">Field / Data Surat</h3>
            <p className="text-xs text-muted-foreground">
              Field ini menjadi formulir pengisian saat membuat surat. Gunakan
              nama field sebagai placeholder <code>[nama_field]</code>.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFields((current) => [
                ...current,
                {
                  name: "",
                  label: "",
                  type: "text",
                  required: true,
                  optionsText: "",
                },
              ])
            }
          >
            <Plus />
            Tambah Field
          </Button>
        </div>

        <ErrorText message={state?.fieldErrors?.fields} />

        {fields.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Belum ada field. Klik Tambah Field.
          </p>
        ) : null}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="rounded-lg border bg-muted/20 p-3">
              <input
                type="hidden"
                name={`fields[${index}][required]`}
                value={field.required ? "1" : "0"}
              />
              <input
                type="hidden"
                name={`fields[${index}][internal]`}
                value={field.internal ? "1" : "0"}
              />

              <div className="grid gap-3 sm:grid-cols-6">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor={`field-name-${index}`}>Nama field</Label>
                  <Input
                    id={`field-name-${index}`}
                    name={`fields[${index}][name]`}
                    value={field.name}
                    onChange={(event) =>
                      updateField(index, { name: event.target.value })
                    }
                    placeholder="nama"
                    className="font-mono"
                  />
                  <ErrorText
                    message={state?.fieldErrors?.[`fields.${index}.name`]}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor={`field-label-${index}`}>Label</Label>
                  <Input
                    id={`field-label-${index}`}
                    name={`fields[${index}][label]`}
                    value={field.label}
                    onChange={(event) =>
                      updateField(index, { label: event.target.value })
                    }
                    placeholder="Nama Lengkap"
                  />
                  <ErrorText
                    message={state?.fieldErrors?.[`fields.${index}.label`]}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`field-type-${index}`}>Tipe</Label>
                  <select
                    id={`field-type-${index}`}
                    name={`fields[${index}][type]`}
                    value={field.type}
                    onChange={(event) =>
                      updateField(index, {
                        type: event.target.value as LetterFieldType,
                      })
                    }
                    className={SELECT_CLASS}
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveField(index, -1)}
                    disabled={index === 0}
                    aria-label="Naikkan field"
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveField(index, 1)}
                    disabled={index === fields.length - 1}
                    aria-label="Turunkan field"
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => removeField(index)}
                    aria-label="Hapus field"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <Checkbox
                  checked={field.required}
                  onChange={(checked) =>
                    updateField(index, { required: checked })
                  }
                  label="Wajib diisi"
                />
                <Checkbox
                  checked={Boolean(field.internal)}
                  onChange={(checked) =>
                    updateField(index, { internal: checked })
                  }
                  label="Internal"
                  description="Hanya diisi petugas, tidak tampil di permohonan publik."
                />
              </div>

              {field.type === "select" ? (
                <div className="mt-3 space-y-1">
                  <Label htmlFor={`field-options-${index}`}>Pilihan</Label>
                  <Input
                    id={`field-options-${index}`}
                    name={`fields[${index}][options]`}
                    value={field.optionsText}
                    onChange={(event) =>
                      updateField(index, { optionsText: event.target.value })
                    }
                    placeholder="Pilihan 1, Pilihan 2, Pilihan 3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pisahkan pilihan dengan koma.
                  </p>
                  <ErrorText
                    message={state?.fieldErrors?.[`fields.${index}.options`]}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">
            Field yang Tampil di Surat Permohonan
          </h3>
          <p className="text-xs text-muted-foreground">
            Kosongkan semua untuk menampilkan seluruh field.
          </p>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tambahkan field terlebih dahulu.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((field, index) => (
              <Checkbox
                key={`${field.name}-${index}`}
                checked={permohonanFields.includes(field.name)}
                onChange={(checked) =>
                  togglePermohonanField(field.name, checked)
                }
                label={field.label || field.name || `Field ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Publikasi</h3>
        </div>
        <Checkbox
          checked={publik}
          onChange={setPublik}
          label="Tampil di permohonan publik"
          description="Jenis surat dapat dimohonkan melalui halaman publik."
        />
        <Checkbox
          checked={active}
          onChange={setActive}
          label="Aktif"
          description="Bisa dipilih saat membuat surat baru."
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Kop Surat</h3>
        <Checkbox
          checked={kopEnabled}
          onChange={setKopEnabled}
          label="Tampilkan kop surat + garis di bagian atas surat"
          description="Jika dimatikan, PDF diawali judul tengah dari nama template aktif."
        />
        <Checkbox
          checked={kopFooterEnabled}
          onChange={setKopFooterEnabled}
          label="Tampilkan footer di bagian bawah surat"
        />
        <div className="space-y-2">
          <Label htmlFor="kop_footer">Isi Teks Footer Surat</Label>
          <textarea
            id="kop_footer"
            name="kop_footer"
            rows={3}
            value={kopFooter}
            onChange={(event) => setKopFooter(event.target.value)}
            className={TEXTAREA_CLASS}
            placeholder="Contoh: Surat ini diterbitkan secara elektronik melalui sistem surat digital KUA."
          />
          <ErrorText message={state?.fieldErrors?.kop_footer} />
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {mode === "create" ? "Simpan Jenis Surat" : "Simpan Perubahan"}
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/letter-types" />}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
