import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Use Vite-friendly worker URL (ships with pdfjs-dist)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfPreviewProps {
  url: string;
  className?: string;
  /** 1-indexed */
  page?: number;
}

export function PdfPreview({ url, className, page = 1 }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const safePage = useMemo(() => (page < 1 ? 1 : page), [page]);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth);
    });

    ro.observe(el);
    setContainerWidth(el.clientWidth);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch ourselves (works for blob: URLs and avoids iframe/embed restrictions)
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load PDF (${res.status})`);
        const data = await res.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        const pdfPage = await pdf.getPage(safePage);

        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const initialViewport = pdfPage.getViewport({ scale: 1 });
        const targetWidth = Math.max(1, containerWidth || initialViewport.width);
        const scale = targetWidth / initialViewport.width;
        const viewport = pdfPage.getViewport({ scale });

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context not available");

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Clear before render
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = pdfPage.render({
          canvas,
          canvasContext: context,
          viewport,
        });
        await renderTask.promise;

        if (!cancelled) setIsLoading(false);
      } catch (e) {
        if (!cancelled) {
          setIsLoading(false);
          setError(e instanceof Error ? e.message : "Failed to render PDF");
        }
      }
    }

    if (url) void render();

    return () => {
      cancelled = true;
    };
  }, [url, safePage, containerWidth]);

  return (
    <div ref={containerRef} className={className}>
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="w-full h-full flex items-center justify-center p-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">PDF preview unavailable</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Rendered PDF page */}
      <canvas
        ref={canvasRef}
        className={isLoading || !!error ? "hidden" : "w-full h-auto"}
      />
    </div>
  );
}
