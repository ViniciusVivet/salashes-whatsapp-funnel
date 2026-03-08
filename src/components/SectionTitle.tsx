import { cn } from "@/lib/utils";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  withOrnament?: boolean;
  className?: string;
};

export default function SectionTitle({
  title,
  subtitle,
  withOrnament = true,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "text-center max-w-2xl mx-auto mb-14 md:mb-20",
        withOrnament && "ornament-dot",
        className
      )}
    >
      <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.5rem] font-semibold text-nude-900 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-nude-600 md:text-nude-700 text-base md:text-lg font-normal leading-relaxed max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
