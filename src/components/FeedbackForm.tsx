"use client";

import { FormEvent, useMemo, useState } from "react";
import { servicesData } from "@/data/services";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

type FeedbackFormState = {
  name: string;
  rating: string;
  serviceName: string;
  comment: string;
};

const initialForm: FeedbackFormState = {
  name: "",
  rating: "5",
  serviceName: "",
  comment: "",
};

const MAX_ORIGINAL_FILE_SIZE = 5 * 1024 * 1024;
const MAX_COMPRESSED_FILE_SIZE = 1024 * 1024;

function fileExtension(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  return "webp";
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Imagem invalida."));
    };
    image.src = url;
  });
}

async function compressImage(file: File, maxSide: number, quality: number) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie apenas imagens.");
  }

  if (file.size > MAX_ORIGINAL_FILE_SIZE) {
    throw new Error("Cada imagem precisa ter ate 5MB.");
  }

  const image = await loadImage(file);
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Nao consegui processar a imagem.");
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality)
  );

  if (!blob) throw new Error("Nao consegui comprimir a imagem.");
  if (blob.size > MAX_COMPRESSED_FILE_SIZE) {
    throw new Error("A imagem ficou pesada demais. Tente outra foto.");
  }

  return new File(
    [blob],
    `${file.name.replace(/\.[^.]+$/, "") || "feedback"}.webp`,
    { type: blob.type || "image/webp" }
  );
}

export default function FeedbackForm() {
  const [form, setForm] = useState(initialForm);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [resultImages, setResultImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const services = useMemo(
    () =>
      servicesData.flatMap((category) =>
        category.services.map((service) => service.name)
      ),
    []
  );

  async function uploadMedia(feedbackId: string, kind: "avatar" | "result", file: File) {
    if (!supabase) throw new Error("Supabase nao configurado.");

    const compressed =
      kind === "avatar"
        ? await compressImage(file, 240, 0.78)
        : await compressImage(file, 1200, 0.72);
    const path = `${feedbackId}/${kind}-${crypto.randomUUID()}.${fileExtension(
      compressed.type
    )}`;

    const { error: uploadError } = await supabase.storage
      .from("feedback-media")
      .upload(path, compressed, {
        cacheControl: "31536000",
        contentType: compressed.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("feedback-media").getPublicUrl(path);
    return {
      feedback_id: feedbackId,
      kind,
      storage_path: path,
      public_url: data.publicUrl,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setError("O envio de feedback ainda nao foi conectado ao Supabase.");
      return;
    }

    if (form.comment.trim().length < 12) {
      setError("Escreva um feedback um pouquinho mais completo.");
      return;
    }

    setSubmitting(true);
    const feedbackId = crypto.randomUUID();

    try {
      const { error: feedbackError } = await supabase.from("feedbacks").insert({
        id: feedbackId,
        customer_name: form.name.trim(),
        rating: Number(form.rating),
        service_name: form.serviceName || null,
        comment: form.comment.trim(),
        status: "pending",
        featured: false,
      });

      if (feedbackError) throw feedbackError;

      const mediaPayloads = [];
      if (avatar) mediaPayloads.push(await uploadMedia(feedbackId, "avatar", avatar));
      for (const file of resultImages.slice(0, 2)) {
        mediaPayloads.push(await uploadMedia(feedbackId, "result", file));
      }

      if (mediaPayloads.length > 0) {
        const { error: mediaError } = await supabase
          .from("feedback_media")
          .insert(mediaPayloads);
        if (mediaError) throw mediaError;
      }

      setForm(initialForm);
      setAvatar(null);
      setResultImages([]);
      setMessage("Obrigada pelo carinho, seu feedback foi enviado.");
    } catch {
      setError("Nao consegui enviar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl border border-rose-100/70 bg-white/95 p-5 shadow-sm md:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-nude-800">Seu nome</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            maxLength={80}
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="Como podemos te identificar?"
          />
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">Nota</span>
          <select
            value={form.rating}
            onChange={(event) => setForm({ ...form, rating: event.target.value })}
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} estrelas
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">Procedimento</span>
          <select
            value={form.serviceName}
            onChange={(event) =>
              setForm({ ...form, serviceName: event.target.value })
            }
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            <option value="">Prefiro nao informar</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-nude-800">Feedback</span>
          <textarea
            value={form.comment}
            onChange={(event) =>
              setForm({ ...form, comment: event.target.value })
            }
            required
            maxLength={420}
            rows={4}
            className="mt-1.5 w-full resize-none rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-nude-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="Conta como foi sua experiencia com a Sabrina."
          />
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">Foto de perfil</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-sm text-nude-700 file:mr-3 file:rounded-full file:border-0 file:bg-rose-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-rose-700"
          />
        </label>

        <label>
          <span className="text-sm font-medium text-nude-800">Fotos do resultado</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) =>
              setResultImages(Array.from(event.target.files ?? []).slice(0, 2))
            }
            className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-nude-50 px-4 py-3 text-sm text-nude-700 file:mr-3 file:rounded-full file:border-0 file:bg-rose-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-rose-700"
          />
          <span className="mt-1 block text-xs text-nude-500">
            Ate 2 fotos. A gente otimiza antes de enviar.
          </span>
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 text-sm font-medium text-emerald-700" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-rose-500 px-6 py-3 font-medium text-white shadow-md transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Enviando..." : "Deixar meu feedback"}
      </button>
    </form>
  );
}
