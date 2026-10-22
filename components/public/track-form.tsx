"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2, Search } from "lucide-react";

import {
  trackSubmission,
  type PublicSubmissionState,
} from "@/app/actions/public-submissions";

export function TrackForm() {
  const [state, formAction, pending] = useActionState<
    PublicSubmissionState,
    FormData
  >(trackSubmission, null);
  const [token, setToken] = useState("");

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-teal-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
        <Search className="h-7 w-7 text-teal-700" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-gray-800">
        Cek Status Permohonan
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Masukkan token yang Anda dapatkan saat mengirim permohonan untuk melihat
        status terkini.
      </p>

      {state?.fieldErrors?.token ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
          {state.fieldErrors.token}
        </div>
      ) : null}

      <form action={formAction}>
        <input
          type="text"
          name="token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          placeholder="Masukkan token tracking"
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-teal-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Lacak
        </button>
      </form>

      <Link
        href="/permohonan"
        className="mt-4 inline-block text-sm text-teal-700 hover:underline"
      >
        Ajukan permohonan baru
      </Link>
    </div>
  );
}
