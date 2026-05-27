export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "done"
  | "cancelled"
  | "no_show";

export type RequestStatus = "pending" | "approved" | "rejected";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  birthday: string | null;
  lead_source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  customer_id: string;
  service_id: string | null;
  starts_at: string;
  ends_at: string | null;
  status: AppointmentStatus;
  price: number;
  payment_method: string | null;
  paid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: Pick<Customer, "id" | "name" | "phone"> | null;
  services?: Pick<Service, "id" | "name" | "category"> | null;
};

export type AppointmentRequest = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_birthday: string | null;
  lead_source: string | null;
  service_id: string | null;
  service_name: string | null;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  services?: Pick<Service, "id" | "name" | "price" | "duration_minutes"> | null;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  spent_at: string;
  notes: string | null;
  created_at: string;
};
