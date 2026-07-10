import { useEffect, useRef } from "react";

// list 末尾に置く sentinel。可視域に入ったら onVisible を呼ぶ、無限スクロール発火用。
// disabled が true (追加 page 無し / fetch 中) の間は observe を張らない。
export function InfiniteScrollSentinel({
  onVisible,
  disabled,
  label,
}: {
  onVisible: () => void;
  disabled: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onVisible();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, onVisible]);

  return (
    <div ref={ref} className="py-4 text-center text-sm text-neutral-500">
      {label}
    </div>
  );
}
