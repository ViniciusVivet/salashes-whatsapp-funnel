"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type {
  Appointment,
  AppointmentRequest,
  AppointmentStatus,
  Customer,
  Expense,
  Feedback,
  Service,
} from "@/lib/dashboard/types";

type ViewMode = "day" | "week" | "month" | "year";
type Tab = "agenda" | "clientes" | "servicos" | "feedbacks" | "caixa" | "gastos";
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

type PaymentMethod = "pix" | "dinheiro" | "cartao" | "outro";
type ToastKind = "success" | "error" | "info";

type ToastMessage = {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
};

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

const paymentLabels: Record<PaymentMethod, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartao",
  outro: "Outro",
};

const leadSourceLabels: Record<string, string> = {
  site: "Site",
  instagram: "Instagram",
  indicacao: "Indicacao / boca a boca",
  publicacao_social_media: "Publicacao social media",
  whatsapp: "WhatsApp",
  google: "Google / Maps",
  cliente_antiga: "Cliente antiga",
  evento: "Evento / acao local",
  trafego_pago: "Trafego pago",
  panfleto: "Panfleto / cartao",
  fachada: "Fachada / passou na frente",
  parceria: "Parceria",
  outro: "Outro",
};

const expenseCategories = [
  "Materiais",
  "Cola e produtos de cilios",
  "Descartaveis",
  "Sobrancelhas",
  "Marketing",
  "Comissao social media",
  "Aluguel",
  "Transporte",
  "Manutencao",
  "Cursos",
  "Taxas",
  "Outros",
];

const emptyAppointment = {
  customerId: "",
  serviceId: "",
  date: "",
  time: "",
  price: "",
  status: "confirmed" as AppointmentStatus,
  paymentMethod: "pix",
  paid: false,
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

function uniqueList(items: (string | null | undefined)[]) {
  return Array.from(
    new Set(items.filter((item): item is string => Boolean(item?.trim())))
  );
}

function matchingSuggestions(value: string, suggestions: string[], limit = 6) {
  const term = value.trim().toLowerCase();
  if (!term) return [];
  return suggestions
    .filter((item) => item.toLowerCase().includes(term))
    .slice(0, limit);
}

function whatsAppUrl(phone: string, text = "Oi! Tudo bem?") {
  const normalized = normalizePhone(phone);
  const withCountry = normalized.startsWith("55") ? normalized : `55${normalized}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}

function appointmentRange(appointment: Appointment) {
  const start = new Date(appointment.starts_at);
  const end = appointment.ends_at
    ? new Date(appointment.ends_at)
    : addMinutes(start, 90);
  return { start, end };
}

function shortTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [metricRanges, setMetricRanges] = useState<Record<string, RangeKey>>({
    revenue: "month",
    appointments: "month",
    ticket: "month",
    profit: "month",
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [cashSearch, setCashSearch] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseRange, setExpenseRange] = useState<RangeKey>("month");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    birthday: "",
    leadSource: "",
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
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  function showToast(
    kind: ToastKind,
    title: string,
    description?: string
  ) {
    const id = Date.now() + Math.random();
    setToasts((current) => [
      ...current.slice(-2),
      { id, kind, title, description },
    ]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function scrollToSection(id: string) {
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

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

    const [
      customersResult,
      servicesResult,
      appointmentsResult,
      requestsResult,
      expensesResult,
      feedbacksResult,
    ] =
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
        supabase
          .from("feedbacks")
          .select("*, feedback_media(*)")
          .order("created_at", { ascending: false }),
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
          paid: Boolean(item.paid),
          payment_method: item.payment_method ?? null,
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
    if (feedbacksResult.data) setFeedbacks(feedbacksResult.data as Feedback[]);

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

  const calendarBuckets = useMemo(() => {
    const selected = new Date(`${selectedDate}T12:00:00`);

    if (viewMode === "week") {
      const start = startOfWeek(selected);
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return {
          key: date.toISOString(),
          label: date.toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          }),
          date,
          muted: false,
          items: visibleAppointments.filter((appointment) =>
            sameDay(new Date(appointment.starts_at), date)
          ),
        };
      });
    }

    if (viewMode === "month") {
      const firstDay = new Date(selected.getFullYear(), selected.getMonth(), 1);
      const gridStart = startOfWeek(firstDay);
      return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return {
          key: date.toISOString(),
          label: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          date,
          muted: date.getMonth() !== selected.getMonth(),
          items: visibleAppointments.filter((appointment) =>
            sameDay(new Date(appointment.starts_at), date)
          ),
        };
      });
    }

    if (viewMode === "year") {
      return Array.from({ length: 12 }, (_, index) => {
        const date = new Date(selected.getFullYear(), index, 1);
        return {
          key: date.toISOString(),
          label: date.toLocaleDateString("pt-BR", { month: "long" }),
          date,
          muted: false,
          items: visibleAppointments.filter(
            (appointment) => new Date(appointment.starts_at).getMonth() === index
          ),
        };
      });
    }

    return [
      {
        key: selectedDate,
        label: selected.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        }),
        date: selected,
        muted: false,
        items: visibleAppointments,
      },
    ];
  }, [selectedDate, viewMode, visibleAppointments]);

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

  function doneAppointmentsForRange(targetRange: RangeKey) {
    const start = rangeStart(targetRange);
    return appointments.filter((appointment) => {
      if (appointment.status !== "done") return false;
      if (!start) return true;
      return new Date(appointment.starts_at) >= start;
    });
  }

  function expensesForRange(targetRange: RangeKey) {
    const start = rangeStart(targetRange);
    return expenses.filter((expense) => {
      if (!start) return true;
      return new Date(`${expense.spent_at}T00:00:00`) >= start;
    });
  }

  const revenueAppointments = doneAppointmentsForRange(metricRanges.revenue);
  const appointmentMetricItems = doneAppointmentsForRange(metricRanges.appointments);
  const ticketAppointments = doneAppointmentsForRange(metricRanges.ticket);
  const profitAppointments = doneAppointmentsForRange(metricRanges.profit);
  const profitExpenses = expensesForRange(metricRanges.profit);

  const metricRevenue = revenueAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.price || 0),
    0
  );
  const metricTicketTotal = ticketAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.price || 0),
    0
  );
  const metricProfitRevenue = profitAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.price || 0),
    0
  );
  const metricProfitExpenses = profitExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  function setMetricRange(metric: string, nextRange: RangeKey) {
    setMetricRanges((current) => ({ ...current, [metric]: nextRange }));
  }

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

  const todayAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter((appointment) => sameDay(new Date(appointment.starts_at), today))
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );
  }, [appointments]);

  const todaySales = todayAppointments
    .filter((appointment) => appointment.status === "done")
    .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);
  const todayCustomersCount = new Set(
    todayAppointments.map(
      (appointment) =>
        appointment.customer_id ??
        appointment.customers?.phone ??
        appointment.customers?.name ??
        appointment.id
    )
  ).size;

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );
  const pendingFeedbacks = feedbacks.filter(
    (feedback) => feedback.status === "pending"
  );

  const filteredCustomers = customers.filter((customer) => {
    const term = customerSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone.toLowerCase().includes(term) ||
      leadSourceLabels[customer.lead_source ?? ""]?.toLowerCase().includes(term)
    );
  });

  const filteredCashAppointments = filteredDoneAppointments.filter((appointment) => {
    const term = cashSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      appointment.customers?.name.toLowerCase().includes(term) ||
      appointment.services?.name.toLowerCase().includes(term) ||
      appointment.payment_method?.toLowerCase().includes(term)
    );
  });

  const filteredExpenseList = expenses.filter((expense) => {
    const start = rangeStart(expenseRange);
    if (start && new Date(`${expense.spent_at}T00:00:00`) < start) return false;
    if (
      expenseCategoryFilter !== "all" &&
      (expense.category ?? "Sem categoria") !== expenseCategoryFilter
    ) {
      return false;
    }
    const term = expenseSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      expense.description.toLowerCase().includes(term) ||
      expense.category?.toLowerCase().includes(term)
    );
  });

  const customerSuggestions = matchingSuggestions(
    customerSearch,
    uniqueList(
      customers.flatMap((customer) => [
        customer.name,
        customer.phone,
        leadSourceLabels[customer.lead_source ?? ""],
      ])
    )
  );

  const cashSuggestions = matchingSuggestions(
    cashSearch,
    uniqueList(
      filteredDoneAppointments.flatMap((appointment) => [
        appointment.customers?.name,
        appointment.services?.name,
        appointment.payment_method,
      ])
    )
  );

  const expenseSuggestions = matchingSuggestions(
    expenseSearch,
    uniqueList(
      expenses.flatMap((expense) => [expense.description, expense.category])
    )
  );

  const expenseCategoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filteredExpenseList.forEach((expense) => {
      const category = expense.category ?? "Sem categoria";
      totals.set(category, (totals.get(category) ?? 0) + Number(expense.amount || 0));
    });
    return Array.from(totals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenseList]);

  const filteredExpenseTotal = filteredExpenseList.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

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
        lead_source: request.lead_source,
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

    if (hasScheduleConflict(start, end)) {
      showToast(
        "error",
        "Horario ocupado",
        "Ja existe um atendimento confirmado nesse horario. Escolha outro antes de aprovar."
      );
      return;
    }

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
        paid: false,
        payment_method: null,
        notes: request.notes,
      });
      if (appointmentError) throw appointmentError;

      const { error: requestError } = await supabase
        .from("appointment_requests")
        .update({ status: "approved" })
        .eq("id", request.id);
      if (requestError) throw requestError;

      showToast(
        "success",
        "Solicitacao aprovada",
        "O horario entrou na agenda como confirmado."
      );
      await loadAll();
    } catch {
      showToast(
        "error",
        "Nao foi possivel aprovar",
        "Confira se o procedimento ainda existe e tente novamente."
      );
    }
  }

  async function rejectRequest(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from("appointment_requests")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) {
      showToast("error", "Nao foi possivel recusar", "Tente novamente em instantes.");
      return;
    }
    showToast("info", "Solicitacao recusada", "Ela saiu da lista de pendentes.");
    await loadAll();
  }

  function hasScheduleConflict(start: Date, end: Date, ignoreId?: string) {
    return appointments.some((appointment) => {
      if (appointment.id === ignoreId) return false;
      if (!["confirmed", "done"].includes(appointment.status)) return false;
      const current = appointmentRange(appointment);
      return start < current.end && end > current.start;
    });
  }

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    const service = services.find((item) => item.id === appointmentForm.serviceId);
    const start = combineDateTime(appointmentForm.date, appointmentForm.time);
    const end = addMinutes(start, service?.duration_minutes ?? 90);

    if (hasScheduleConflict(start, end, editingAppointmentId ?? undefined)) {
      showToast(
        "error",
        "Conflito de horario",
        "Esse periodo bate com outro atendimento confirmado."
      );
      return;
    }

    const payload = {
      customer_id: appointmentForm.customerId,
      service_id: appointmentForm.serviceId || null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: appointmentForm.status,
      price: Number(appointmentForm.price || service?.price || 0),
      payment_method: appointmentForm.paymentMethod || null,
      paid: appointmentForm.paid,
      notes: appointmentForm.notes || null,
    };

    const { error } = editingAppointmentId
      ? await supabase
          .from("appointments")
          .update(payload)
          .eq("id", editingAppointmentId)
      : await supabase.from("appointments").insert(payload);

    if (!error) {
      setAppointmentForm(emptyAppointment);
      setEditingAppointmentId(null);
      showToast(
        "success",
        editingAppointmentId ? "Agendamento atualizado" : "Agendamento criado",
        appointmentForm.status === "done"
          ? "Como esta marcado como Feito, ele entra no caixa."
          : "O horario ficou salvo na agenda."
      );
      await loadAll();
    } else {
      showToast(
        "error",
        "Nao consegui salvar",
        "Revise cliente, procedimento, data e valor antes de tentar de novo."
      );
    }
  }

  function editAppointment(appointment: Appointment) {
    setTab("agenda");
    setEditingAppointmentId(appointment.id);
    setSelectedDate(appointment.starts_at.slice(0, 10));
    setViewMode("day");
    setAppointmentForm({
      customerId: appointment.customer_id,
      serviceId: appointment.service_id ?? "",
      date: appointment.starts_at.slice(0, 10),
      time: new Date(appointment.starts_at).toTimeString().slice(0, 5),
      price: String(appointment.price),
      status: appointment.status,
      paymentMethod: appointment.payment_method ?? "pix",
      paid: appointment.paid,
      notes: appointment.notes ?? "",
    });
    scrollToSection("appointment-form");
  }

  function openDayCalendar(date: Date) {
    setSelectedDate(dateInputValue(date));
    setViewMode("day");
    scrollToSection("calendar-panel");
  }

  function startAppointmentForDate(date: Date) {
    setEditingAppointmentId(null);
    setAppointmentForm({
      ...emptyAppointment,
      date: dateInputValue(date),
    });
    scrollToSection("appointment-form");
  }

  function openTodayAppointments() {
    setTab("agenda");
    openDayCalendar(new Date());
    scrollToSection("calendar-panel");
  }

  function openPendingRequests() {
    setTab("agenda");
    scrollToSection("pending-requests");
  }

  async function deleteAppointment(id: string) {
    if (!supabase) return;
    if (!window.confirm("Excluir este agendamento?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      showToast("error", "Nao foi possivel excluir", "Tente novamente.");
      return;
    }
    showToast("info", "Agendamento excluido", "Ele saiu da agenda.");
    await loadAll();
  }

  async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    if (!supabase) return;
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      showToast("error", "Status nao atualizado", "Tente novamente.");
      return;
    }
    showToast(
      "success",
      `Status: ${statusLabels[status]}`,
      status === "done"
        ? "Esse atendimento agora entra no faturamento."
        : "A agenda foi atualizada."
    );
    await loadAll();
  }

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      name: customerForm.name.trim(),
      phone: normalizePhone(customerForm.phone) || customerForm.phone.trim(),
      birthday: customerForm.birthday || null,
      lead_source: customerForm.leadSource || null,
      notes: customerForm.notes.trim() || null,
    };
    const { error } = editingCustomerId
      ? await supabase.from("customers").update(payload).eq("id", editingCustomerId)
      : await supabase.from("customers").insert(payload);
    if (!error) {
      setCustomerForm({
        name: "",
        phone: "",
        birthday: "",
        leadSource: "",
        notes: "",
      });
      setEditingCustomerId(null);
      showToast(
        "success",
        editingCustomerId ? "Cliente atualizada" : "Cliente cadastrada",
        "Os dados ficaram salvos no painel."
      );
      await loadAll();
    } else {
      showToast(
        "error",
        "Nao consegui salvar a cliente",
        "Confira se o telefone nao esta duplicado."
      );
    }
  }

  function editCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      birthday: customer.birthday ?? "",
      leadSource: customer.lead_source ?? "",
      notes: customer.notes ?? "",
    });
    scrollToSection("customer-form");
  }

  async function deleteCustomer(id: string) {
    if (!supabase) return;
    if (!window.confirm("Excluir esta cliente e o historico dela?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      showToast("error", "Cliente nao excluida", "Tente novamente.");
      return;
    }
    showToast("info", "Cliente excluida", "O historico vinculado tambem foi removido.");
    await loadAll();
  }

  async function createService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      name: serviceForm.name.trim(),
      category: serviceForm.category.trim() || null,
      duration_minutes: Number(serviceForm.duration || 90),
      price: Number(serviceForm.price || 0),
      active: true,
    };
    const { error } = editingServiceId
      ? await supabase.from("services").update(payload).eq("id", editingServiceId)
      : await supabase.from("services").insert(payload);
    if (!error) {
      setServiceForm({ name: "", category: "", duration: "90", price: "" });
      setEditingServiceId(null);
      showToast(
        "success",
        editingServiceId ? "Procedimento atualizado" : "Procedimento criado",
        "Ele ja pode ser usado em agendamentos."
      );
      await loadAll();
    } else {
      showToast(
        "error",
        "Nao consegui salvar o procedimento",
        "Pode existir outro procedimento com o mesmo nome."
      );
    }
  }

  function editService(service: Service) {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      category: service.category ?? "",
      duration: String(service.duration_minutes),
      price: String(service.price),
    });
    scrollToSection("service-form");
  }

  async function toggleService(service: Service) {
    if (!supabase) return;
    const { error } = await supabase
      .from("services")
      .update({ active: !service.active })
      .eq("id", service.id);
    if (error) {
      showToast("error", "Nao consegui alterar", "Tente novamente.");
      return;
    }
    showToast(
      "success",
      service.active ? "Procedimento inativado" : "Procedimento ativado",
      service.active
        ? "Ele nao aparece mais para novas solicitacoes."
        : "Ele voltou a aparecer para novas solicitacoes."
    );
    await loadAll();
  }

  async function deleteService(id: string) {
    if (!supabase) return;
    if (!window.confirm("Excluir este procedimento? Agendamentos antigos ficarao sem procedimento vinculado.")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      showToast("error", "Procedimento nao excluido", "Tente novamente.");
      return;
    }
    showToast("info", "Procedimento excluido", "Agendamentos antigos continuam no historico.");
    await loadAll();
  }

  async function createExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      description: expenseForm.description.trim(),
      amount: Number(expenseForm.amount || 0),
      category: expenseForm.category.trim() || null,
      spent_at: expenseForm.spentAt,
      notes: expenseForm.notes.trim() || null,
    };
    const { error } = editingExpenseId
      ? await supabase.from("expenses").update(payload).eq("id", editingExpenseId)
      : await supabase.from("expenses").insert(payload);
    if (!error) {
      setExpenseForm({
        description: "",
        amount: "",
        category: "",
        spentAt: dateInputValue(),
        notes: "",
      });
      setEditingExpenseId(null);
      showToast(
        "success",
        editingExpenseId ? "Gasto atualizado" : "Gasto registrado",
        "O valor ja entrou no resumo de gastos."
      );
      await loadAll();
    } else {
      showToast(
        "error",
        "Nao consegui salvar o gasto",
        "Confira descricao, valor e data."
      );
    }
  }

  function editExpense(expense: Expense) {
    setEditingExpenseId(expense.id);
    setExpenseForm({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category ?? "",
      spentAt: expense.spent_at,
      notes: expense.notes ?? "",
    });
    scrollToSection("expense-form");
  }

  async function deleteExpense(id: string) {
    if (!supabase) return;
    if (!window.confirm("Excluir este gasto?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      showToast("error", "Gasto nao excluido", "Tente novamente.");
      return;
    }
    showToast("info", "Gasto excluido", "O resumo de gastos foi atualizado.");
    await loadAll();
  }

  async function updateFeedback(
    id: string,
    updates: Partial<
      Pick<Feedback, "customer_name" | "service_name" | "comment" | "status" | "featured">
    >
  ) {
    if (!supabase) return;
    const { error } = await supabase.from("feedbacks").update(updates).eq("id", id);
    if (error) {
      showToast("error", "Feedback nao atualizado", "Tente novamente.");
      return;
    }
    showToast("success", "Feedback atualizado", "A vitrine foi ajustada.");
    await loadAll();
  }

  async function editFeedback(feedback: Feedback) {
    const customerName = window.prompt("Nome da cliente", feedback.customer_name);
    if (customerName === null) return;
    const serviceName = window.prompt(
      "Procedimento",
      feedback.service_name ?? ""
    );
    if (serviceName === null) return;
    const comment = window.prompt("Texto do feedback", feedback.comment);
    if (comment === null) return;

    await updateFeedback(feedback.id, {
      customer_name: customerName.trim() || feedback.customer_name,
      service_name: serviceName.trim() || null,
      comment: comment.trim() || feedback.comment,
    });
  }

  async function deleteFeedback(feedback: Feedback) {
    if (!supabase) return;
    if (!window.confirm("Excluir este feedback e as fotos vinculadas?")) return;

    const paths = (feedback.feedback_media ?? []).map((media) => media.storage_path);
    if (paths.length > 0) {
      await supabase.storage.from("feedback-media").remove(paths);
    }

    const { error } = await supabase.from("feedbacks").delete().eq("id", feedback.id);
    if (error) {
      showToast("error", "Feedback nao excluido", "Tente novamente.");
      return;
    }
    showToast("info", "Feedback excluido", "Ele saiu do painel.");
    await loadAll();
  }

  const calendarPanel = (
    <Panel title="Calendario" className="lg:col-span-2">
      <p className="mb-4 text-sm font-medium text-nude-700">
        Aqui fica a agenda principal. Escolha dia, semana, mes ou ano para ver
        os horarios marcados.
      </p>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month", "year"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                viewMode === mode
                  ? "bg-nude-900 text-white"
                  : "border border-nude-300 bg-white text-nude-800 hover:bg-rose-50"
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
          label="Data de referencia"
          type="date"
          value={selectedDate}
          onChange={setSelectedDate}
        />
      </div>

      <div className={viewMode === "week" || viewMode === "month" ? "-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" : ""}>
        <div className={viewMode === "week" || viewMode === "month" ? "w-max min-w-[588px] sm:min-w-[672px]" : ""}>
          {viewMode !== "day" && viewMode !== "year" && (
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-nude-700">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          )}
          <div
            className={`grid gap-2 ${viewMode !== "day" && viewMode !== "year" ? "mt-2" : ""} ${
              viewMode === "day"
                ? "grid-cols-1"
                : viewMode === "year"
                  ? "md:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-7"
            }`}
          >
            {calendarBuckets.map((bucket) => {
              const visibleItems =
                viewMode === "day" ? bucket.items : bucket.items.slice(0, 3);
              const hiddenCount = bucket.items.length - visibleItems.length;

              return (
                <div
                  key={bucket.key}
                  className={`min-h-[108px] rounded-xl border p-1.5 text-left shadow-sm transition hover:border-rose-400 hover:bg-rose-50 sm:min-h-[126px] sm:p-2 ${
                    bucket.muted
                      ? "border-nude-200 bg-nude-100/70 text-nude-400"
                      : "border-nude-300 bg-white text-nude-900"
                  }`}
                >
                  <span className="mb-2 flex items-center justify-between border-b border-nude-200 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.06em] sm:text-xs sm:tracking-[0.08em]">
                      {bucket.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => startAppointmentForDate(bucket.date)}
                      className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-200 sm:px-2"
                      aria-label={`Criar agendamento em ${bucket.label}`}
                    >
                      +
                    </button>
                  </span>
                  <span className="block space-y-1.5">
                    {bucket.items.length === 0 ? (
                      <span className="block text-xs font-medium text-nude-500">
                        Livre
                      </span>
                    ) : (
                      visibleItems.map((appointment) => (
                        <CalendarEventChip
                          key={appointment.id}
                          appointment={appointment}
                          onEdit={editAppointment}
                        />
                      ))
                    )}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => openDayCalendar(bucket.date)}
                        className="block w-full rounded-md border border-nude-200 bg-white px-1.5 py-1 text-left text-[10px] font-semibold text-nude-700 shadow-sm hover:border-rose-300 hover:bg-rose-50 sm:text-xs"
                        aria-label={`Ver todos os horarios de ${bucket.label}`}
                      >
                        +{hiddenCount} horarios
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );

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
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-rose-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.22em] text-rose-600">
              Sabrina Lashes
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-nude-900 sm:text-4xl">
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
          <div
            className="mt-5 rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-nude-700"
            role="status"
            aria-live="polite"
          >
            {notice}
          </div>
        )}

        <section className="mt-5 rounded-3xl border border-nude-300 bg-white p-4 shadow-md sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-nude-900">
                  Hoje
                </h2>
                <p className="mt-1 text-xs font-medium text-nude-700 sm:text-sm">
                  Marque como Feito para entrar no caixa.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:min-w-[620px]">
              <MiniMetric
                label="Horarios hoje"
                value={String(todayAppointments.length)}
                onClick={openTodayAppointments}
              />
              <MiniMetric label="Clientes hoje" value={String(todayCustomersCount)} />
              <MiniMetric
                label="Pendentes"
                value={String(pendingRequests.length)}
                onClick={openPendingRequests}
              />
              <MiniMetric label="Vendido hoje" value={currency(todaySales)} />
            </div>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="w-[82vw] max-w-[360px] flex-none sm:w-[340px]"
              >
                <AppointmentCard
                  appointment={appointment}
                  onStatus={updateAppointmentStatus}
                  onEdit={editAppointment}
                  onDelete={deleteAppointment}
                />
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <Empty>Nenhum atendimento marcado para hoje.</Empty>
            )}
          </div>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricFilter
            label="Faturamento"
            value={currency(metricRevenue)}
            range={metricRanges.revenue}
            onRangeChange={(nextRange) => setMetricRange("revenue", nextRange)}
          />
          <MetricFilter
            label="Atendimentos"
            value={String(appointmentMetricItems.length)}
            range={metricRanges.appointments}
            onRangeChange={(nextRange) =>
              setMetricRange("appointments", nextRange)
            }
          />
          <MetricFilter
            label="Ticket medio"
            value={currency(
              ticketAppointments.length > 0
                ? metricTicketTotal / ticketAppointments.length
                : 0
            )}
            range={metricRanges.ticket}
            onRangeChange={(nextRange) => setMetricRange("ticket", nextRange)}
          />
          <MetricFilter
            label="Lucro estimado"
            value={currency(metricProfitRevenue - metricProfitExpenses)}
            range={metricRanges.profit}
            onRangeChange={(nextRange) => setMetricRange("profit", nextRange)}
          />
        </div>

        <nav
          className="mt-5 rounded-3xl border border-nude-300 bg-white p-3 shadow-md"
          aria-label="Areas do painel"
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-nude-700">
              Areas do painel
            </p>
            <span className="text-xs font-medium text-nude-500">
              {tab === "agenda" && "Agenda"}
              {tab === "clientes" && "Clientes"}
              {tab === "servicos" && "Servicos"}
              {tab === "feedbacks" && "Feedbacks"}
              {tab === "caixa" && "Caixa"}
              {tab === "gastos" && "Gastos"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {[
              ["agenda", "Agenda"],
              ["clientes", "Clientes"],
              ["servicos", "Serv."],
              ["feedbacks", `Feed. ${pendingFeedbacks.length ? `(${pendingFeedbacks.length})` : ""}`],
              ["caixa", "Caixa"],
              ["gastos", "Gastos"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`min-h-[44px] rounded-2xl px-2 py-2 text-xs font-bold transition sm:text-sm ${
                  tab === key
                    ? "bg-rose-600 text-white shadow-md"
                    : "border border-nude-200 bg-nude-50 text-nude-800 hover:bg-rose-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {tab === "agenda" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div id="calendar-panel" className="scroll-mt-6 lg:col-span-2">
              {calendarPanel}
            </div>

            <div id="pending-requests" className="scroll-mt-6">
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
                          {request.lead_source && (
                            <p className="mt-1 text-xs font-semibold text-rose-700">
                              Origem: {leadSourceLabels[request.lead_source] ?? request.lead_source}
                            </p>
                          )}
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
            </div>

            <div id="appointment-form" className="scroll-mt-6" />
            <Panel title={editingAppointmentId ? "Editar agendamento" : "Novo agendamento"}>
              <p className="mb-4 text-sm text-nude-600">
                Para entrar no caixa, o atendimento precisa estar marcado como
                Feito. Para cadastrar atendimento antigo, escolha uma data
                passada e salve com status Feito.
              </p>
              <form onSubmit={createAppointment} className="grid gap-3">
                <Select
                  label="Cliente"
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
                  label="Procedimento"
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
                    label="Data"
                    type="date"
                    value={appointmentForm.date}
                    onChange={(value) =>
                      setAppointmentForm({ ...appointmentForm, date: value })
                    }
                    required
                  />
                  <Input
                    label="Horario"
                    type="time"
                    value={appointmentForm.time}
                    onChange={(value) =>
                      setAppointmentForm({ ...appointmentForm, time: value })
                    }
                    required
                  />
                </div>
                <Input
                  label="Valor cobrado"
                  type="number"
                  value={appointmentForm.price}
                  onChange={(value) =>
                    setAppointmentForm({ ...appointmentForm, price: value })
                  }
                  placeholder="Valor"
                  required
                />
                <Select
                  label="Forma de pagamento"
                  value={appointmentForm.paymentMethod}
                  onChange={(value) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      paymentMethod: value,
                    })
                  }
                >
                  {(Object.keys(paymentLabels) as PaymentMethod[]).map((key) => (
                    <option key={key} value={key}>
                      {paymentLabels[key]}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Status"
                  value={appointmentForm.status}
                  onChange={(value) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      status: value as AppointmentStatus,
                    })
                  }
                >
                  {(["confirmed", "done", "cancelled", "no_show"] as AppointmentStatus[]).map(
                    (status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    )
                  )}
                </Select>
                <label className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-sm text-nude-700">
                  <input
                    type="checkbox"
                    checked={appointmentForm.paid}
                    onChange={(event) =>
                      setAppointmentForm({
                        ...appointmentForm,
                        paid: event.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-rose-200 text-rose-500"
                  />
                  Pagamento recebido
                </label>
                <Input
                  label="Observacoes"
                  value={appointmentForm.notes}
                  onChange={(value) =>
                    setAppointmentForm({ ...appointmentForm, notes: value })
                  }
                  placeholder="Observacoes"
                />
                <SubmitButton>
                  {editingAppointmentId ? "Salvar alteracoes" : "Criar agendamento"}
                </SubmitButton>
                {editingAppointmentId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAppointmentId(null);
                      setAppointmentForm(emptyAppointment);
                    }}
                    className="rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-nude-700"
                  >
                    Cancelar edicao
                  </button>
                )}
              </form>
            </Panel>

          </section>
        )}

        {tab === "clientes" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div id="customer-form" className="scroll-mt-6">
            <Panel title={editingCustomerId ? "Editar cliente" : "Nova cliente"}>
              <form onSubmit={createCustomer} className="grid gap-3">
                <Input
                  label="Nome"
                  value={customerForm.name}
                  onChange={(value) => setCustomerForm({ ...customerForm, name: value })}
                  placeholder="Nome"
                  required
                />
                <Input
                  label="WhatsApp"
                  value={customerForm.phone}
                  onChange={(value) => setCustomerForm({ ...customerForm, phone: value })}
                  placeholder="WhatsApp"
                  required
                />
                <Input
                  label="Aniversario"
                  type="date"
                  value={customerForm.birthday}
                  onChange={(value) =>
                    setCustomerForm({ ...customerForm, birthday: value })
                  }
                />
                <Select
                  label="Origem da cliente"
                  value={customerForm.leadSource}
                  onChange={(value) =>
                    setCustomerForm({ ...customerForm, leadSource: value })
                  }
                >
                  <option value="">Nao informado</option>
                  {Object.entries(leadSourceLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Observacoes"
                  value={customerForm.notes}
                  onChange={(value) => setCustomerForm({ ...customerForm, notes: value })}
                  placeholder="Observacoes"
                />
                <SubmitButton>
                  {editingCustomerId ? "Salvar alteracoes" : "Salvar cliente"}
                </SubmitButton>
                {editingCustomerId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomerId(null);
                      setCustomerForm({
                        name: "",
                        phone: "",
                        birthday: "",
                        leadSource: "",
                        notes: "",
                      });
                    }}
                    className="rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-nude-700"
                  >
                    Cancelar edicao
                  </button>
                )}
              </form>
            </Panel>
            </div>
            <Panel title="Clientes cadastradas">
              <div className="mb-4">
                <Input
                  label="Buscar cliente"
                  value={customerSearch}
                  onChange={setCustomerSearch}
                  placeholder="Nome ou telefone"
                  suggestions={customerSuggestions}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-nude-500">
                    <tr>
                      <th scope="col" className="py-2">Cliente</th>
                      <th scope="col">Telefone</th>
                      <th scope="col">Aniversario</th>
                      <th scope="col">Origem</th>
                      <th scope="col">Total gasto</th>
                      <th scope="col">Atendimentos</th>
                      <th scope="col">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => {
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
                          <td>{leadSourceLabels[customer.lead_source ?? ""] ?? "-"}</td>
                          <td>{currency(total)}</td>
                          <td>{done.length}</td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={whatsAppUrl(customer.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-[#25D366] px-3 py-1 text-xs font-medium text-white"
                              >
                                WhatsApp
                              </a>
                              <button
                                onClick={() => editCustomer(customer)}
                                className="rounded-full border border-nude-200 px-3 py-1 text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deleteCustomer(customer.id)}
                                className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
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
            <div id="service-form" className="scroll-mt-6">
            <Panel title={editingServiceId ? "Editar procedimento" : "Novo procedimento"}>
              <form onSubmit={createService} className="grid gap-3">
                <Input
                  label="Nome"
                  value={serviceForm.name}
                  onChange={(value) => setServiceForm({ ...serviceForm, name: value })}
                  placeholder="Nome"
                  required
                />
                <Input
                  label="Categoria"
                  value={serviceForm.category}
                  onChange={(value) =>
                    setServiceForm({ ...serviceForm, category: value })
                  }
                  placeholder="Categoria"
                />
                <Input
                  label="Duracao em minutos"
                  type="number"
                  value={serviceForm.duration}
                  onChange={(value) =>
                    setServiceForm({ ...serviceForm, duration: value })
                  }
                  placeholder="Duracao em minutos"
                  required
                />
                <Input
                  label="Valor"
                  type="number"
                  value={serviceForm.price}
                  onChange={(value) => setServiceForm({ ...serviceForm, price: value })}
                  placeholder="Valor"
                  required
                />
                <SubmitButton>
                  {editingServiceId ? "Salvar alteracoes" : "Salvar procedimento"}
                </SubmitButton>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm({
                        name: "",
                        category: "",
                        duration: "90",
                        price: "",
                      });
                    }}
                    className="rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-nude-700"
                  >
                    Cancelar edicao
                  </button>
                )}
              </form>
            </Panel>
            </div>
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => editService(service)}
                        className="rounded-full border border-nude-200 bg-white px-3 py-1 text-xs text-nude-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs text-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {tab === "feedbacks" && (
          <section className="mt-6">
            <Panel title="Feedbacks das clientes">
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Pendentes" value={String(pendingFeedbacks.length)} />
                <MiniMetric
                  label="Aprovados"
                  value={String(feedbacks.filter((item) => item.status === "approved").length)}
                />
                <MiniMetric
                  label="Destaques"
                  value={String(feedbacks.filter((item) => item.featured).length)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {feedbacks.length === 0 && (
                  <Empty>Nenhum feedback recebido ainda.</Empty>
                )}
                {feedbacks.map((feedback) => {
                  const media = feedback.feedback_media ?? [];
                  const avatar = media.find((item) => item.kind === "avatar");
                  const resultImages = media.filter((item) => item.kind === "result");
                  return (
                    <article
                      key={feedback.id}
                      className="rounded-2xl border border-nude-300 bg-nude-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        {avatar ? (
                          <img
                            src={avatar.public_url}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                            {feedback.customer_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-nude-950">
                            {feedback.customer_name}
                          </p>
                          <p className="text-xs font-semibold text-rose-700">
                            {feedback.rating} estrelas
                            {feedback.service_name ? ` - ${feedback.service_name}` : ""}
                          </p>
                          <p className="mt-1 text-xs font-medium text-nude-500">
                            {new Date(feedback.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-nude-700">
                        {feedback.comment}
                      </p>

                      {resultImages.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {resultImages.slice(0, 2).map((image) => (
                            <img
                              key={image.id}
                              src={image.public_url}
                              alt=""
                              className="aspect-square rounded-xl object-cover"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            feedback.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : feedback.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {feedback.status === "approved"
                            ? "Aprovado"
                            : feedback.status === "rejected"
                              ? "Recusado"
                              : "Pendente"}
                        </span>
                        {feedback.featured && (
                          <span className="rounded-full bg-nude-900 px-3 py-1 text-xs font-bold text-white">
                            Destaque
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            updateFeedback(feedback.id, {
                              status: "approved",
                              featured: feedback.featured,
                            })
                          }
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() =>
                            updateFeedback(feedback.id, {
                              status: "rejected",
                              featured: false,
                            })
                          }
                          className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-nude-700"
                        >
                          Recusar
                        </button>
                        <button
                          onClick={() =>
                            updateFeedback(feedback.id, {
                              featured: !feedback.featured,
                            })
                          }
                          className="rounded-full border border-nude-200 bg-white px-3 py-1.5 text-xs font-medium text-nude-700"
                        >
                          {feedback.featured ? "Tirar destaque" : "Destacar"}
                        </button>
                        <button
                          onClick={() => editFeedback(feedback)}
                          className="rounded-full border border-nude-200 bg-white px-3 py-1.5 text-xs font-medium text-nude-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteFeedback(feedback)}
                          className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600"
                        >
                          Excluir
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Panel>
          </section>
        )}

        {tab === "caixa" && (
          <section className="mt-6">
            <Panel title="Resumo financeiro">
              <p className="mb-4 text-sm text-nude-600">
                Este caixa considera apenas atendimentos marcados como Feito.
                Use o campo Pago para separar atendimento realizado de dinheiro recebido.
              </p>
              <RangePicker range={range} onChange={setRange} />
              <div className="mt-4">
                <Input
                  label="Buscar no caixa"
                  value={cashSearch}
                  onChange={setCashSearch}
                  placeholder="Cliente, procedimento ou pagamento"
                  suggestions={cashSuggestions}
                />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-5">
                <Metric label="Periodo" value={rangeLabels[range]} />
                <Metric label="Vendas" value={currency(salesTotal)} />
                <Metric label="Gastos" value={currency(expensesTotal)} />
                <Metric label="Cliente destaque" value={topCustomer} />
                <Metric label="Servico destaque" value={topService} />
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-nude-500">
                    <tr>
                      <th scope="col" className="py-2">Data</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Procedimento</th>
                      <th scope="col">Valor</th>
                      <th scope="col">Status</th>
                      <th scope="col">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCashAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t border-rose-100">
                        <td className="py-3">
                          {new Date(appointment.starts_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td>{appointment.customers?.name ?? "-"}</td>
                        <td>{appointment.services?.name ?? "-"}</td>
                        <td>{currency(appointment.price)}</td>
                        <td>
                          {statusLabels[appointment.status]} ·{" "}
                          {appointment.paid ? "Pago" : "Pendente"}
                          {appointment.payment_method
                            ? ` · ${appointment.payment_method}`
                            : ""}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => editAppointment(appointment)}
                            className="rounded-full border border-nude-200 bg-white px-3 py-1 text-xs text-nude-700 hover:bg-rose-50"
                          >
                            Abrir
                          </button>
                        </td>
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
            <div id="expense-form" className="scroll-mt-6">
            <Panel title={editingExpenseId ? "Editar gasto" : "Novo gasto"}>
              <p className="mb-4 text-sm font-medium text-nude-700">
                Use esta area para registrar custos do negocio, como materiais,
                transporte ou aluguel. Esses valores entram no lucro estimado.
              </p>
              <form onSubmit={createExpense} className="grid gap-3">
                <Input
                  label="Descricao"
                  value={expenseForm.description}
                  onChange={(value) =>
                    setExpenseForm({ ...expenseForm, description: value })
                  }
                  placeholder="Descricao"
                  required
                />
                <Input
                  label="Valor"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(value) => setExpenseForm({ ...expenseForm, amount: value })}
                  placeholder="Valor"
                  required
                />
                <Select
                  label="Categoria"
                  value={expenseForm.category}
                  onChange={(value) =>
                    setExpenseForm({ ...expenseForm, category: value })
                  }
                >
                  <option value="">Selecione uma categoria</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Data"
                  type="date"
                  value={expenseForm.spentAt}
                  onChange={(value) => setExpenseForm({ ...expenseForm, spentAt: value })}
                  required
                />
                <Input
                  label="Observacoes"
                  value={expenseForm.notes}
                  onChange={(value) => setExpenseForm({ ...expenseForm, notes: value })}
                  placeholder="Observacoes"
                />
                <SubmitButton>
                  {editingExpenseId ? "Salvar alteracoes" : "Salvar gasto"}
                </SubmitButton>
                {editingExpenseId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpenseId(null);
                      setExpenseForm({
                        description: "",
                        amount: "",
                        category: "",
                        spentAt: dateInputValue(),
                        notes: "",
                      });
                    }}
                    className="rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-nude-700"
                  >
                    Cancelar edicao
                  </button>
                )}
              </form>
            </Panel>
            </div>
            <Panel title="Gastos cadastrados">
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <Input
                  label="Buscar gasto"
                  value={expenseSearch}
                  onChange={setExpenseSearch}
                  placeholder="Descricao ou categoria"
                  suggestions={expenseSuggestions}
                />
                <Select
                  label="Periodo"
                  value={expenseRange}
                  onChange={(value) => setExpenseRange(value as RangeKey)}
                >
                  {(Object.keys(rangeLabels) as RangeKey[]).map((key) => (
                    <option key={key} value={key}>
                      {rangeLabels[key]}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Categoria"
                  value={expenseCategoryFilter}
                  onChange={setExpenseCategoryFilter}
                >
                  <option value="all">Todas</option>
                  {uniqueList(expenses.map((expense) => expense.category ?? "Sem categoria")).map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  )}
                </Select>
              </div>

              <div className="mb-5 rounded-2xl border border-nude-300 bg-nude-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-nude-900">
                    Resumo dos gastos
                  </p>
                  <span className="font-serif text-xl font-semibold text-red-600">
                    {currency(filteredExpenseTotal)}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {expenseCategoryTotals.length === 0 && (
                    <p className="text-sm font-medium text-nude-600">
                      Nenhum gasto nesse filtro.
                    </p>
                  )}
                  {expenseCategoryTotals.map((item) => {
                    const percent =
                      filteredExpenseTotal > 0
                        ? Math.round((item.total / filteredExpenseTotal) * 100)
                        : 0;
                    return (
                      <div key={item.category}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold text-nude-700">
                          <span>{item.category}</span>
                          <span>
                            {currency(item.total)} · {percent}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-rose-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                {filteredExpenseList.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-nude-50 p-4 sm:flex-row sm:items-center sm:justify-between"
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => editExpense(expense)}
                        className="rounded-full border border-nude-200 bg-white px-3 py-1 text-xs text-nude-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs text-red-600"
                      >
                        Excluir
                      </button>
                    </div>
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
    <main className="min-h-screen bg-[#f6f1ed] px-4 py-6 text-nude-900 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-4 z-[200] space-y-2 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="overflow-hidden rounded-2xl border border-nude-300 bg-white shadow-xl shadow-nude-900/10"
          role={toast.kind === "error" ? "alert" : "status"}
        >
          <div
            className={`h-1.5 ${
              toast.kind === "success"
                ? "bg-emerald-500"
                : toast.kind === "error"
                  ? "bg-rose-600"
                  : "bg-nude-700"
            }`}
          />
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-3 p-4 pr-1">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  toast.kind === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : toast.kind === "error"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-nude-100 text-nude-800"
                }`}
                aria-hidden
              >
                {toast.kind === "success" && "✓"}
                {toast.kind === "error" && "!"}
                {toast.kind === "info" && "i"}
              </span>
              <div>
                <p className="text-sm font-bold text-nude-950">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm font-medium leading-snug text-nude-700">
                    {toast.description}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="mr-3 mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-nude-200 text-xs font-bold text-nude-600 hover:bg-nude-50"
              aria-label="Fechar aviso"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
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
      className={`min-w-0 rounded-3xl border border-nude-300 bg-white p-4 shadow-md sm:p-6 ${className}`}
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
    <div className="rounded-3xl border border-nude-300 bg-white p-5 shadow-md">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-nude-700">
        {label}
      </p>
      <p className="mt-2 break-words font-serif text-2xl font-semibold text-nude-900">
        {value}
      </p>
    </div>
  );
}

function MetricFilter({
  label,
  value,
  range,
  onRangeChange,
}: {
  label: string;
  value: string;
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-nude-300 bg-white p-3 shadow-md sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-nude-700 sm:text-xs sm:tracking-[0.14em]">
          {label}
        </p>
        <label className="relative">
          <span className="sr-only">Filtrar {label}</span>
          <select
            value={range}
            onChange={(event) => onRangeChange(event.target.value as RangeKey)}
            className="w-full appearance-none rounded-full border border-nude-300 bg-rose-50 py-1.5 pl-2 pr-6 text-[10px] font-semibold text-nude-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 sm:max-w-[132px] sm:pl-3 sm:pr-7 sm:text-xs"
          >
            {(Object.keys(rangeLabels) as RangeKey[]).map((key) => (
              <option key={key} value={key}>
                {rangeLabels[key]}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-nude-700"
            aria-hidden
          >
            ▼
          </span>
        </label>
      </div>
      <p className="mt-2 break-words font-serif text-xl font-semibold text-nude-900 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="text-[10px] font-bold leading-tight text-nude-700 sm:text-xs">
        {label}
      </p>
      <p className="mt-1 break-words font-serif text-lg font-semibold text-nude-900 sm:text-2xl">
        {value}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 rounded-2xl border border-nude-300 bg-nude-50 p-2.5 text-left transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 sm:p-4"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="min-w-0 rounded-2xl border border-nude-300 bg-nude-50 p-2.5 sm:p-4">
      {content}
    </div>
  );
}

function AppointmentCard({
  appointment,
  onStatus,
  onEdit,
  onDelete,
}: {
  appointment: Appointment;
  onStatus: (id: string, status: AppointmentStatus) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}) {
  const phone = appointment.customers?.phone;
  return (
    <article className="min-w-0 rounded-2xl border border-nude-300 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-rose-600">
            {new Date(appointment.starts_at).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
          <p className="mt-2 font-medium text-nude-900">
            {appointment.customers?.name ?? "Cliente"}
          </p>
          <p className="text-sm text-nude-700">
            {appointment.services?.name ?? "Procedimento"} -{" "}
            {currency(appointment.price)}
          </p>
          <p className="mt-1 text-xs font-medium text-nude-600">
            {statusLabels[appointment.status]} ·{" "}
            {appointment.paid ? "Pago" : "Pagamento pendente"}
            {appointment.payment_method
              ? ` · ${appointment.payment_method}`
              : ""}
          </p>
        </div>
        {phone && (
          <a
            href={whatsAppUrl(
              phone,
              `Oi! Passando para falar sobre seu horario na Sabrina Lashes.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white"
          >
            WhatsApp
          </a>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["confirmed", "done", "cancelled", "no_show"] as AppointmentStatus[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => onStatus(appointment.id, status)}
              className={`rounded-full px-3 py-1 text-xs ${
                appointment.status === status
                  ? "bg-rose-600 text-white"
                  : "border border-nude-300 bg-white text-nude-700"
              }`}
            >
              {statusLabels[status]}
            </button>
          )
        )}
        <button
          onClick={() => onEdit(appointment)}
          className="rounded-full border border-nude-200 bg-white px-3 py-1 text-xs text-nude-700"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(appointment.id)}
          className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs text-red-600"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

function CalendarEventChip({
  appointment,
  onEdit,
}: {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(appointment)}
      className="block w-full rounded-md border border-rose-200 bg-rose-50 px-1.5 py-1 text-left text-[10px] font-semibold leading-tight text-nude-900 shadow-sm hover:border-rose-400 hover:bg-white sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-[11px]"
      title="Clique para editar este agendamento"
    >
      <span className="block text-rose-700">{shortTime(appointment.starts_at)}</span>
      <span className="block truncate">
        {appointment.customers?.name ?? "Cliente"}
      </span>
      <span className="block truncate font-medium text-nude-600">
        {appointment.services?.name ?? "Procedimento"}
      </span>
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="min-w-[240px] rounded-2xl border border-dashed border-nude-300 bg-rose-50 p-4 text-sm font-medium text-nude-600 md:min-w-0">
      {children}
    </p>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  suggestions = [],
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  suggestions?: string[];
}) {
  return (
    <div className="relative block">
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-nude-700">
          {label}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        aria-label={label ?? placeholder}
        className="w-full rounded-2xl border border-nude-300 bg-white px-4 py-3 text-sm text-nude-950 outline-none transition placeholder:text-nude-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
      />
      {suggestions.length > 0 && (
        <span className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-nude-300 bg-white shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => onChange(suggestion)}
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-nude-800 hover:bg-rose-50"
            >
              {suggestion}
            </button>
          ))}
        </span>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
  required,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-nude-700">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-label={!label ? "Selecao" : undefined}
        className="w-full rounded-2xl border border-nude-300 bg-white px-4 py-3 text-sm text-nude-950 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
      >
        {children}
      </select>
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700">
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
              : "border border-nude-300 bg-white text-nude-800 hover:bg-rose-50"
          }`}
        >
          {rangeLabels[key]}
        </button>
      ))}
    </div>
  );
}
