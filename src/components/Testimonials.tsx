"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";
import { testimonialsData } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import FeedbackForm from "./FeedbackForm";
import type { Feedback, FeedbackMedia } from "@/lib/dashboard/types";

type DisplayTestimonial = {
  id: string;
  name: string;
  text: string;
  initials?: string;
  rating?: number;
  serviceName?: string | null;
  avatarUrl?: string | null;
  resultImages?: FeedbackMedia[];
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function feedbackToDisplay(feedback: Feedback): DisplayTestimonial {
  const media = feedback.feedback_media ?? [];
  return {
    id: feedback.id,
    name: feedback.customer_name,
    text: feedback.comment,
    rating: feedback.rating,
    serviceName: feedback.service_name,
    initials: initialsFor(feedback.customer_name),
    avatarUrl: media.find((item) => item.kind === "avatar")?.public_url,
    resultImages: media.filter((item) => item.kind === "result").slice(0, 2),
  };
}

export default function Testimonials() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function loadFeedbacks() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("feedbacks")
        .select("*, feedback_media(*)")
        .eq("status", "approved")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(9);

      if (!error && data) {
        setFeedbacks(data as Feedback[]);
      }
    }

    loadFeedbacks();
  }, []);

  const testimonials = useMemo<DisplayTestimonial[]>(
    () =>
      feedbacks.length > 0
        ? feedbacks.map(feedbackToDisplay)
        : testimonialsData.map((testimonial) => ({
            id: testimonial.id,
            name: testimonial.name,
            text: testimonial.text,
            initials: testimonial.initials,
          })),
    [feedbacks]
  );

  return (
    <section
      id="depoimentos"
      className="relative overflow-hidden section-spacing-lg bg-testimonials-soft border-t border-rose-100/40"
    >
      <div className="ornament-floral-right" aria-hidden />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Depoimentos"
          subtitle="O que quem passou por aqui comenta"
        />
        <div className="flex gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={cn(
                "relative min-w-[82vw] bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:min-w-0 md:p-7 border border-rose-100/50",
                "card-hover"
              )}
            >
              <span
                className="absolute top-5 left-6 font-serif text-3xl text-rose-200/80 leading-none select-none"
                aria-hidden
              >
                “
              </span>
              <div className="flex items-center gap-3 mb-4 mt-1">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-700 font-semibold text-sm shrink-0">
                    {t.initials ?? initialsFor(t.name)}
                  </div>
                )}
                <div>
                  <span className="font-medium text-nude-900">{t.name}</span>
                  {t.serviceName && (
                    <p className="text-xs font-medium text-rose-700">
                      {t.serviceName}
                    </p>
                  )}
                </div>
              </div>
              {t.rating && (
                <p className="mb-3 text-sm text-rose-600" aria-label={`${t.rating} estrelas`}>
                  {"★".repeat(t.rating)}
                </p>
              )}
              <p className="text-nude-700 leading-relaxed text-sm md:text-base pl-0">
                {t.text}
              </p>
              {t.resultImages && t.resultImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {t.resultImages.map((image) => (
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
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-nude-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-nude-800"
          >
            {showForm ? "Fechar feedback" : "Deixar meu feedback"}
          </button>
        </div>
        {showForm && <FeedbackForm />}
      </div>
    </section>
  );
}
