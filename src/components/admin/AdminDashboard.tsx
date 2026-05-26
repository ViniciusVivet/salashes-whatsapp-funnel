"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type {
  Appointment,
  AppointmentRequest,
  AppointmentStatus,
  Customer,
  Expense,
  Service,
} from "@/lib/dashboard/types";

type ViewMode = "day" | "week" | "month" | "year";
type Tab = "agenda" | "clientes" | "servicos" | "caixa" | "gastos";
type RangeKey =
  | "7d"
  | "14d"
  | "21d"
  | "30d"
  | "month"
  | "2m"
  | "3m"
  | "6m"
  | "9m"
  | "12m"
  | "all";

const statusLabels: Record<AppointmentStatus, string> = {
  requested: "Solicitado",
  confirmed: "Confirmado",
  done: "Feito",
  cancelled: "Cancelado",
  no_show: "Faltou",
};

const rangeLabels: Record<RangeKey, string> = {
  "7d": "Ultima semana",
  "14d": "Ultimas 2 semanas",
  "21d": "Ultimas 3 semanas",
  "30d": "Ultimos 30 dias",
  month: "Mes atual",
  "2m": "Ultimos 2 meses",
  "3m": "Ultimos 3 meses",
  "6m": "Ultimos 6 meses",
  "9m": "Ultimos 9 meses",
  "12m": "Ultimos 12 meses",
  all: "Total",
};

const emptyAppointment = {
  customerId: "",
  serviceId: "",
  date: "",
  time: "",
  price: "",
  notes: "",
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function dateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function toLocalDate(value: string) {
  return new Date(value);
}

function sameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function rangeStart(range: RangeKey) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === "all") return null;
  if (range === "month") {
    start.setDate(1);
    return start;
  }

  const days: Partial<Record<RangeKey, number>> = {
    "7d": 7,
    "14d": 14,
    "21d": 21,
    "30d": 30,
  };

  if (days[range]) {
    start.setDate(start.getDate() - Number(days[range]) + 1);
    return start;
  }

  const months: Partial<Record<RangeKey, number>> = {
    "2m": 2,
    "3m": 3,
    "6m": 6,
    "9m": 9,
    "12m": 12,
  };
  start.setMonth(start.getMonth() - Number(months[range]) + 1);
  start.setDate(1);
  return start;
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time || "09:00"}:00`);
}

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("agenda");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(dateInputValue());
  const [range, setRange] = useState<RangeKey>("month");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    birthday: "",
    notes: "",
  });
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "",
    duration: "90",
    price: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "",
    spentAt: dateInputValue(),
    notes: "",
  });

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadAll() {
    if (!supabase) return;
    setLoading(true);
    setNotice(null);

    const [customersResult, servicesResult, appointmentsResult, requestsResult, expensesResult] =
      await Promise.all([
        supabase.from("customers").select("*").order("name"),
        supabase.from("services").select("*").order("name"),
        supabase
          .from("appointments")
          .select("*, customers(id,name,phone), services(id,name,category)")
          .order("starts_at", { ascending: false }),
        supabase
          .from("appointment_requests")
          .select("*, services(id,name,price,duration_minutes)")
          .order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("spent_at", { ascending: false }),
      ]);

    if (customersResult.data) setCustomers(customersResult.data);
    if (servicesResult.data) {
      setServices(
        servicesResult.data.map((item) => ({
          ...item,
          price: Number(item.price),
        }))
      );
    }
    if (appointmentsResult.data) {
      setAppointments(
        appointmentsResult.data.map((item) => ({
          ...item,
          price: Number(item.price),
        })) as Appointment[]
      );
    }
    if (requestsResult.data) setRequests(requestsResult.data as AppointmentRequest[]);
    if (expensesResult.data) {
      setExpenses(
        expensesResult.data.map((item) => ({
          ...item,
          amount: Number(item.amount),
        }))
      );
    }

    setLoading(false);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setAuthError("E-mail ou senha invalido.");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  const visibleAppointments = useMemo(() => {
    const selected = new Date(`${selectedDate}T12:00:00`);

    return appointments
      .filter((appointment) => {
        const date = toLocalDate(appointment.starts_at);
        if (viewMode === "day") return sameDay(date, selected);
        if (viewMode === "week") {
          const start = startOfWeek(selected);
          const end = new Date(start);
          end.setDate(start.getDate() + 7);
          return date >= start && date < end;
        }
        if (viewMode === "month") {
          return (
            date.getFullYear() === selected.getFullYear() &&
            date.getMonth() === selected.getMonth()
          );
        }
        return date.getFullYear() === selected.getFullYear();
      })
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );
  }, [appointments, selectedDate, viewMode]);

  const filteredDoneAppointments = useMemo(() => {
    const start = rangeStart(range);
    return appointments.filter((appointment) => {
      if (appointment.status !== "done") return false;
      if (!start) return true;
      return new Date(appointment.starts_at) >= start;
    });
  }, [appointments, range]);

  const filteredExpenses = useMemo(() => {
    const start = rangeStart(range);
    return expenses.filter((expense) => {
      if (!start) return true;
      return new Date(`${expense.spent_at}T00:00:00`) >= start;
    });
  }, [expenses, range]);

  const salesTotal = filteredDoneAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.price || 0),
    0
  );
  const expensesTotal = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const ticketAverage =
    filteredDoneAppointments.length > 0
      ? salesTotal / filteredDoneAppointments.length
      : 0;

  const topService = useMemo(() => {
    const count = new Map<string, number>();
    filteredDoneAppointments.forEach((appointment) => {
      const name = appointment.services?.name ?? "Sem servico";
      count.set(name, (count.get(name) ?? 0) + 1);
    });
    return Array.from(count.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  }, [filteredDoneAppointments]);

  const topCustomer = useMemo(() => {
    const totals = new Map<string, number>();
    filteredDoneAppointments.forEach((appointment) => {
      const name = appointment.customers?.name ?? "Cliente";
      totals.set(name, (totals.get(name) ?? 0) + Number(appointment.price || 0));
    });
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  }, [filteredDoneAppointments]);

  async function upsertCustomerFromRequest(request: AppointmentRequest) {
    if (!supabase) return null;
    const phone = normalizePhone(request.customer_phone) || request.customer_phone;

    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) return existing as Customer;

    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: request.customer_name,
        phone,
        birthday: request.customer_birthday,
        notes: request.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  }

  async function approveRequest(request: AppointmentRequest) {
    if (!supabase) return;
    setNotice(null);

    const service = services.find((item) => item.id === request.service_id);
    const start = combineDateTime(request.preferred_date, request.preferred_time);
    const end = addMinutes(start, service?.duration_minutes ?? 90);

    try {
      const customer = await upsertCustomerFromRequest(request);
      if (!customer) throw new Error("customer");

      const { error: appointmentError } = await supabase.from("appointments").insert({
        customer_id: customer.id,
        service_id: request.service_id,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: "confirmed",
        price: service?.price ?? 0,
        notes: request.notes,
      });
      if (appointmentError) throw appointmentError;

      const { error: requestError } = await supabase
        .from("appointment_requests")
        .update({ status: "approved" })
        .eq("id", request.id);
      if (requestError) throw requestError;

      setNotice("Solicitacao aprovada e agendamento criado.");
      await loadAll();
    } catch {
      setNotice("Nao foi possivel aprovar essa solicitacao.");
    }
  }

  async function rejectRequest(id: string) {
    if (!supabase) return;
    await supabase.from("appointment_requests").update({ status: "rejected" }).eq("id", id);
    await loadAll();
  }

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    const service = services.find((item) => item.id === appointmentForm.serviceId);
    const start = combineDateTime(appointmentForm.date, appointmentForm.time);
    const end = addMinutes(start, service?.duration_minutes ?? 90);

    const { error } = await supabase.from("appointments").insert({
      customer_id: appointmentForm.customerId,
      service_id: appointmentForm.serviceId || null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: "confirmed",
      price: Number(appointmentForm.price || service?.price || 0),
      notes: appointmentForm.notes || null,
    });

    if (!error) {
      setAppointmentForm(emptyAppointment);
      await loadAll();
    }
  }

  async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    if (!supabase) return;
    await supabase.from("appointments").update({ status }).eq("id", id);
    await loadAll();
  }

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from("customers").insert({
      name: customerForm.name.trim(),
      phone: normalizePhone(customerForm.phone) || customerForm.phone.trim(),
      birthday: customerForm.birthday || null,
      notes: customerForm.notes.trim() || null,
    });
    if (!error) {
      setCustomerForm({ name: "", phone: "", birthday: "", notes: "" });
      await loadAll();
    }
  }

  async function createService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from("services").insert({
      name: serviceForm.name.trim(),
      category: serviceForm.category.trim() || null,
      duration_minutes: Number(serviceForm.duration || 90),
      price: Number(serviceForm.price || 0),
      active: true,
    });
    if (!error) {
      setServiceForm({ name: "", category: "", duration: "90", price: "" });
      await loadAll();
    }
  }

  async function toggleService(service: Service) {
    if (!supabase) return;
    await supabase.from("services").update({ active: !service.active }).eq("id", service.id);
    await loadAll();
  }

  async function createExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from("expenses").insert({
      description: expenseForm.description.trim(),
      amount: Number(expenseForm.amount || 0),
      category: expenseForm.category.trim() || null,
      spent_at: expenseForm.spentAt,
      notes: expenseForm.notes.trim() || null,
    });
    if (!error) {
      setExpenseForm({
        description: "",
        amount: "",
        category: "",
        spentAt: dateInputValue(),
        notes: "",
      });
      await loadAll();
    }
  }

  if (authLoading) {
    return <AdminShell>Carregando painel...</AdminShell>;
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Configure `NEXT_PUBLIC_SUPABASE_URL` e
          `NEXT_PUBLIC_SUPABASE_ANON_KEY` para liberar o painel.
        </div>
      </AdminShell>
    );
  }

  if (!session) {
    return (
      <AdminShell>
        <form
          onSubmit={signIn}
          className="mx-auto max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-sm"
        >
          <p className="font-serif text-3xl font-semibold text-nude-900">
            Entrar no painel
          </p>
          <p className="mt-2 text-sm text-nude-600">
            Acesso reservado para administrar agenda, caixa e clientes.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-nude-800">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 outline-none focus:border-rose-300"
              required
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-nude-800">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 outline-none focus:border-rose-300"
              required
            />
          </label>

          {authError && <p className="mt-4 text-sm text-red-600">{authError}</p>}

          <button className="mt-6 w-full rounded-full bg-rose-500 px-6 py-3 font-medium text-white hover:bg-rose-600">
            Entrar
          </button>
        </form>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-rose-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.22em] text-rose-600">
              Sabrina Lashes
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-nude-900">
              Painel de agenda e caixa
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadAll}
              className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-nude-700 hover:bg-rose-50"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
            <button
              onClick={signOut}
              className="rounded-full bg-nude-900 px-4 py-2 text-sm font-medium text-white hover:bg-nude-800"
            >
              Sair
            </button>
          </div>
        </header>

        {notice && (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-nude-700">
            {notice}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="Faturamento" value={currency(salesTotal)} />
          <Metric label="Atendimentos" value={String(filteredDoneAppointments.length)} />
          <Metric label="Ticket medio" value={currency(ticketAverage)} />
          <Metric label="Lucro estimado" value={currency(salesTotal - expensesTotal)} />
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {[
            ["agenda", "Agenda"],
            ["clientes", "Clientes"],
            ["servicos", "Servicos"],
            ["caixa", "Caixa"],
            ["gastos", "Gastos"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === key
                  ? "bg-rose-500 text-white"
                  : "border border-rose-100 bg-white text-nude-700 hover:bg-rose-50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "agenda" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Panel title="Solicitacoes pendentes">
              <div className="space-y-3">
                {requests.filter((request) => request.status === "pending").length === 0 && (
                  <Empty>Nenhuma solicitacao pendente.</Empty>
                )}
                {requests
                  .filter((request) => request.status === "pending")
                  .map((request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-rose-100 bg-nude-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-nude-900">
                            {request.customer_name}
                          </p>
                          <p className="text-sm text-nude-600">
                            {request.customer_phone}
                          </p>
                          <p className="mt-2 text-sm text-nude-700">
                            {request.service_name ?? request.services?.name} em{" "}
                            {request.preferred_date} as {request.preferred_time}
                          </p>
                          {request.notes && (
                            <p className="mt-1 text-sm text-nude-500">
                              {request.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveRequest(request)}
                            className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="rounded-full border border-rose-200 px-3 py-2 text-xs font-medium text-nude-700"
                          >
                            Recusar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Panel>

            <Panel title="Novo agendamento">
              <form onSubmit={createAppointment} className="grid gap-3">
                <Select
                  value={appointmentForm.customerId}
                  onChange={(value) =>
                    setAppointmentForm({ ...appointmentForm, customerId: value })
                  }
                  required
                >
                  <option value="">Cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
                <Select
                  value={appointmentForm.serviceId}
                  onChange={(value) => {
                    const service = services.find((item) => item.id === value);
                    setAppointmentForm({
                      ...appointmentForm,
                      serviceId: value,
                      price: service ? String(service.price) : appointmentForm.price,
                    });
                  }}
                  required
                >
                  <option value="">Procedimento</option>
                  {services
                    .filter((service) => service.active)
                    .map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {currency(service.price)}
                      </option>
                    ))}
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(value) =>
                      setAppointmentForm({ ...appointmentForm, date: value })
                    }
                    required
                  />
                  <Input
                    type="time"
                    value={appointmentForm.time}
                    onChange={(value) =>
                      setAppointmentForm({ ...appointmentForm, time: value })
                    }
                    required
                  />
                </div>
                <Input
                  type="number"
                  value={appointmentForm.price}
                  onChange={(value) =>
                    setAppointmentForm({ ...appointmentForm, price: value })
                  }
                  placeholder="Valor"
                  required
                />
                <Input
                  value={appointmentForm.notes}
                  onChange={(value) =>
                    setAppointmentForm({ ...appointmentForm, notes: value })
                  }
                  placeholder="Observacoes"
                />
                <SubmitButton>Criar agendamento</SubmitButton>
              </form>
            </Panel>

            <Panel title="Calendario" className="lg:col-span-2">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(["day", "week", "month", "year"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        viewMode === mode
                          ? "bg-nude-900 text-white"
                          : "border border-rose-100 bg-white text-nude-700"
                      }`}
                    >
                      {mode === "day" && "Dia"}
                      {mode === "week" && "Semana"}
                      {mode === "month" && "Mes"}
                      {mode === "year" && "Ano"}
                    </button>
                  ))}
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleAppointments.length === 0 && (
                  <Empty>Nenhum horario nesse periodo.</Empty>
                )}
                {visibleAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-rose-100 bg-nude-50 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-rose-600">
                      {new Date(appointment.starts_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="mt-2 font-medium text-nude-900">
                      {appointment.customers?.name ?? "Cliente"}
                    </p>
                    <p className="text-sm text-nude-600">
                      {appointment.services?.name ?? "Procedimento"} -{" "}
                      {currency(appointment.price)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(
                        [
                          "confirmed",
                          "done",
                          "cancelled",
                          "no_show",
                        ] as AppointmentStatus[]
                      ).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateAppointmentStatus(appointment.id, status)}
                          className={`rounded-full px-3 py-1 text-xs ${
                            appointment.status === status
                              ? "bg-rose-500 text-white"
                              : "border border-rose-100 bg-white text-nude-600"
                          }`}
                        >
                          {statusLabels[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {tab === "clientes" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nova cliente">
              <form onSubmit={createCustomer} className="grid gap-3">
                <Input
                  value={customerForm.name}
                  onChange={(value) => setCustomerForm({ ...customerForm, name: value })}
                  placeholder="Nome"
                  required
                />
                <Input
                  value={customerForm.phone}
                  onChange={(value) => setCustomerForm({ ...customerForm, phone: value })}
                  placeholder="WhatsApp"
                  required
                />
                <Input
                  type="date"
                  value={customerForm.birthday}
                  onChange={(value) =>
                    setCustomerForm({ ...customerForm, birthday: value })
                  }
                />
                <Input
                  value={customerForm.notes}
                  onChange={(value) => setCustomerForm({ ...customerForm, notes: value })}
                  placeholder="Observacoes"
                />
                <SubmitButton>Salvar cliente</SubmitButton>
              </form>
            </Panel>
            <Panel title="Clientes cadastradas">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-nude-500">
                    <tr>
                      <th className="py-2">Cliente</th>
                      <th>Telefone</th>
                      <th>Aniversario</th>
                      <th>Total gasto</th>
                      <th>Atendimentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => {
                      const done = appointments.filter(
                        (appointment) =>
                          appointment.customer_id === customer.id &&
                          appointment.status === "done"
                      );
                      const total = done.reduce(
                        (sum, appointment) => sum + Number(appointment.price || 0),
                        0
                      );
                      return (
                        <tr key={customer.id} className="border-t border-rose-100">
                          <td className="py-3 font-medium text-nude-900">
                            {customer.name}
                          </td>
                          <td>{customer.phone}</td>
                          <td>{customer.birthday ?? "-"}</td>
                          <td>{currency(total)}</td>
                          <td>{done.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </section>
        )}

        {tab === "servicos" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Novo procedimento">
              <form onSubmit={createService} className="grid gap-3">
                <Input
                  value={serviceForm.name}
                  onChange={(value) => setServiceForm({ ...serviceForm, name: value })}
                  placeholder="Nome"
                  required
                />
                <Input
                  value={serviceForm.category}
                  onChange={(value) =>
                    setServiceForm({ ...serviceForm, category: value })
                  }
                  placeholder="Categoria"
                />
                <Input
                  type="number"
                  value={serviceForm.duration}
                  onChange={(value) =>
                    setServiceForm({ ...serviceForm, duration: value })
                  }
                  placeholder="Duracao em minutos"
                  required
                />
                <Input
                  type="number"
                  value={serviceForm.price}
                  onChange={(value) => setServiceForm({ ...serviceForm, price: value })}
                  placeholder="Valor"
                  required
                />
                <SubmitButton>Salvar procedimento</SubmitButton>
              </form>
            </Panel>
            <Panel title="Procedimentos">
              <div className="grid gap-3 md:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-rose-100 bg-nude-50 p-4"
                  >
                    <p className="font-medium text-nude-900">{service.name}</p>
                    <p className="text-sm text-nude-600">
                      {service.category ?? "Sem categoria"} - {service.duration_minutes} min
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-semibold text-rose-700">
                        {currency(service.price)}
                      </span>
                      <button
                        onClick={() => toggleService(service)}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs text-nude-700"
                      >
                        {service.active ? "Ativo" : "Inativo"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {tab === "caixa" && (
          <section className="mt-6">
            <Panel title="Resumo financeiro">
              <RangePicker range={range} onChange={setRange} />
              <div className="mt-5 grid gap-4 md:grid-cols-5">
                <Metric label="Periodo" value={rangeLabels[range]} />
                <Metric label="Vendas" value={currency(salesTotal)} />
                <Metric label="Gastos" value={currency(expensesTotal)} />
                <Metric label="Cliente destaque" value={topCustomer} />
                <Metric label="Servico destaque" value={topService} />
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-nude-500">
                    <tr>
                      <th className="py-2">Data</th>
                      <th>Cliente</th>
                      <th>Procedimento</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoneAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t border-rose-100">
                        <td className="py-3">
                          {new Date(appointment.starts_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td>{appointment.customers?.name ?? "-"}</td>
                        <td>{appointment.services?.name ?? "-"}</td>
                        <td>{currency(appointment.price)}</td>
                        <td>{statusLabels[appointment.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </section>
        )}

        {tab === "gastos" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Novo gasto">
              <form onSubmit={createExpense} className="grid gap-3">
                <Input
                  value={expenseForm.description}
                  onChange={(value) =>
                    setExpenseForm({ ...expenseForm, description: value })
                  }
                  placeholder="Descricao"
                  required
                />
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(value) => setExpenseForm({ ...expenseForm, amount: value })}
                  placeholder="Valor"
                  required
                />
                <Input
                  value={expenseForm.category}
                  onChange={(value) =>
                    setExpenseForm({ ...expenseForm, category: value })
                  }
                  placeholder="Categoria"
                />
                <Input
                  type="date"
                  value={expenseForm.spentAt}
                  onChange={(value) => setExpenseForm({ ...expenseForm, spentAt: value })}
                  required
                />
                <Input
                  value={expenseForm.notes}
                  onChange={(value) => setExpenseForm({ ...expenseForm, notes: value })}
                  placeholder="Observacoes"
                />
                <SubmitButton>Salvar gasto</SubmitButton>
              </form>
            </Panel>
            <Panel title="Gastos cadastrados">
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-nude-50 p-4"
                  >
                    <div>
                      <p className="font-medium text-nude-900">{expense.description}</p>
                      <p className="text-sm text-nude-600">
                        {expense.category ?? "Sem categoria"} - {expense.spent_at}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600">
                      {currency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}
      </div>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-nude-50 px-4 py-6 text-nude-800 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <h2 className="mb-4 font-serif text-2xl font-semibold text-nude-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-nude-500">
        {label}
      </p>
      <p className="mt-2 break-words font-serif text-2xl font-semibold text-nude-900">
        {value}
      </p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-4 text-sm text-nude-500">
      {children}
    </p>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
    />
  );
}

function Select({
  value,
  onChange,
  children,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
    >
      {children}
    </select>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-full bg-rose-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600">
      {children}
    </button>
  );
}

function RangePicker({
  range,
  onChange,
}: {
  range: RangeKey;
  onChange: (range: RangeKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(rangeLabels) as RangeKey[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            range === key
              ? "bg-nude-900 text-white"
              : "border border-rose-100 bg-white text-nude-700 hover:bg-rose-50"
          }`}
        >
          {rangeLabels[key]}
        </button>
      ))}
    </div>
  );
}
