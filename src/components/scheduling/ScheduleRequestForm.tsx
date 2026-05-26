"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Service } from "@/lib/dashboard/types";

type FormState = {
  name: string;
  phone: string;
  birthday: string;
  serviceId: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
};

const initialForm: FormState = {
  name: "",
  phone: "",
  birthday: "",
  serviceId: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

const fallbackServices = [
  { id: "fallback-brasileiro", name: "Volume brasileiro", price: 110 },
  { id: "fallback-egipcio", name: "Volume egipcio", price: 130 },
  { id: "fallback-fox", name: "Fox eyes", price: 150 },
  { id: "fallback-design", name: "Design personalizado", price: 30 },
];

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ScheduleRequestForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      if (!supabase) {
        setLoadingServices(false);
        return;
      }

      const { data, error: servicesError } = await supabase
        .from("services")
        .select("id,name,category,duration_minutes,price,active,created_at,updated_at")
        .eq("active", true)
        .order("name");

      if (!servicesError && data) {
        setServices(
          data.map((item) => ({
            ...item,
            price: Number(item.price),
          }))
        );
      }

      setLoadingServices(false);
    }

    loadServices();
  }, []);

  const availableServices = useMemo(
    () => (services.length > 0 ? services : fallbackServices),
    [services]
  );

  const selectedService = availableServices.find(
    (service) => service.id === form.serviceId
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setError("O agendamento online ainda nao foi conectado ao Supabase.");
      return;
    }

    if (!selectedService) {
      setError("Escolha um procedimento para continuar.");
      return;
    }

    setSubmitting(true);

    const isFallback = form.serviceId.startsWith("fallback-");
    const { error: requestError } = await supabase
      .from("appointment_requests")
      .insert({
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_birthday: form.birthday || null,
        service_id: isFallback ? null : form.serviceId,
        service_name: selectedService.name,
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime,
        notes: form.notes.trim() || null,
      });

    setSubmitting(false);

    if (requestError) {
      setError("Nao consegui enviar agora. Tente chamar pelo WhatsApp.");
      return;
    }

    setForm(initialForm);
    setMessage("Pedido enviado. A Sabrina vai confirmar o horario pelo WhatsApp.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-rose-100/70 bg-white/95 p-5 shadow-sm sm:p-7"
    >
      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configure o Supabase para liberar o envio do formulario.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-nude-800">Nome completo</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="Seu nome"
          />
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">WhatsApp</span>
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
            inputMode="tel"
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="(11) 99999-9999"
          />
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">Aniversario</span>
          <input
            type="date"
            value={form.birthday}
            onChange={(event) =>
              setForm({ ...form, birthday: event.target.value })
            }
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-nude-800">Procedimento</span>
          <select
            value={form.serviceId}
            onChange={(event) =>
              setForm({ ...form, serviceId: event.target.value })
            }
            required
            disabled={loadingServices}
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            <option value="">
              {loadingServices ? "Carregando procedimentos..." : "Escolha"}
            </option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {money(Number(service.price))}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">Data desejada</span>
          <input
            type="date"
            value={form.preferredDate}
            onChange={(event) =>
              setForm({ ...form, preferredDate: event.target.value })
            }
            required
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">Horario desejado</span>
          <input
            type="time"
            value={form.preferredTime}
            onChange={(event) =>
              setForm({ ...form, preferredTime: event.target.value })
            }
            required
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-nude-800">Observacao</span>
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            rows={4}
            className="mt-1.5 w-full resize-none rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="Conte se prefere algo natural, marcado ou se tem alguma duvida."
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p
          className="mt-4 text-sm font-medium text-emerald-700"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-rose-500 px-6 py-3 font-medium text-white shadow-md transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Solicitar horario"}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-rose-200 px-6 py-3 font-medium text-nude-800 transition hover:bg-rose-50"
        >
          Voltar ao site
        </Link>
      </div>
    </form>
  );
}
