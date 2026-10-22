"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  submitPublicSubmission,
  type PublicSubmissionState,
} from "@/app/actions/public-submissions";
import type { LetterField } from "@/lib/letters";

const INPUT_CLASS =
  "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export function PublicSubmissionForm({
  letterTypeCode,
  letterTypeName,
  fields,
  informasi,
}: {
  letterTypeCode: string;
  letterTypeName: string;
  fields: LetterField[];
  informasi: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    PublicSubmissionState,
    FormData
  >(submitPublicSubmission, null);

  const [namaPemohon, setNamaPemohon] = useState("");
  const [kontak, setKontak] = useState("");
  const [data, setData] = useState<Record<string, string>>({});

  const errors = Object.values(state?.fieldErrors ?? {});

  function setFieldValue(name: string, value: string) {
    setData((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{letterTypeName}</h2>
          <Link
            href="/permohonan"
            className="text-sm text-gray-500 hover:underline"
          >
            Ganti jenis
          </Link>
        </div>

        {state?.error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}

        {errors.length > 0 ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ul className="list-inside list-disc">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <form action={formAction}>
          <input type="hidden" name="jenis" value={letterTypeCode} />
          <input
            type="text"
            name="website"
            defaultValue=""
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nama_pemohon"
                className="text-sm font-medium text-gray-700"
              >
                Nama Lengkap Pemohon *
              </label>
              <input
                id="nama_pemohon"
                name="nama_pemohon"
                value={namaPemohon}
                onChange={(event) => setNamaPemohon(event.target.value)}
                required
                className={INPUT_CLASS}
              />
              {state?.fieldErrors?.nama_pemohon ? (
                <p className="mt-1 text-xs text-red-600">
                  {state.fieldErrors.nama_pemohon}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="kontak"
                className="text-sm font-medium text-gray-700"
              >
                No. HP / Email *
              </label>
              <input
                id="kontak"
                name="kontak"
                value={kontak}
                onChange={(event) => setKontak(event.target.value)}
                placeholder="0821xxxx / email@contoh.id"
                required
                className={INPUT_CLASS}
              />
              {state?.fieldErrors?.kontak ? (
                <p className="mt-1 text-xs text-red-600">
                  {state.fieldErrors.kontak}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {fields.map((field) => {
              const fieldValue = data[field.name] ?? "";
              const error = state?.fieldErrors?.[`data.${field.name}`];
              const id = `field-${field.name}`;

              return (
                <div key={field.name}>
                  <label
                    htmlFor={id}
                    className="text-sm font-medium text-gray-700"
                  >
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      id={id}
                      name={`data[${field.name}]`}
                      rows={3}
                      value={fieldValue}
                      onChange={(event) =>
                        setFieldValue(field.name, event.target.value)
                      }
                      required={field.required}
                      className={INPUT_CLASS}
                    />
                  ) : field.type === "date" ? (
                    <input
                      id={id}
                      name={`data[${field.name}]`}
                      type="date"
                      value={fieldValue}
                      onChange={(event) =>
                        setFieldValue(field.name, event.target.value)
                      }
                      required={field.required}
                      className={INPUT_CLASS}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={id}
                      name={`data[${field.name}]`}
                      value={fieldValue}
                      onChange={(event) =>
                        setFieldValue(field.name, event.target.value)
                      }
                      required={field.required}
                      className={INPUT_CLASS}
                    >
                      <option value="">-- Pilih --</option>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      name={`data[${field.name}]`}
                      value={fieldValue}
                      onChange={(event) =>
                        setFieldValue(field.name, event.target.value)
                      }
                      required={field.required}
                      className={INPUT_CLASS}
                    />
                  )}

                  {error ? (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-teal-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Kirim Permohonan
            </button>
            <Link
              href="/permohonan"
              className="text-sm text-gray-600 hover:underline"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>

      {informasi ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-sm leading-relaxed text-gray-600 shadow-sm">
          <p className="whitespace-pre-line">{informasi}</p>
        </div>
      ) : null}
    </>
  );
}
