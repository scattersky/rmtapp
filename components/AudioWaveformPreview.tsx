"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function AudioWaveformPreview({
                                               file,
                                             }: {
  file: File | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!file || !containerRef.current) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (!containerRef.current) return;

      if (waveRef.current) {
        waveRef.current.destroy();
      }

      waveRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#42B27B",
        progressColor: "#42B27B",
        height: 80,
        barWidth: 2,
      });

      waveRef.current.load(reader.result as string);
    };

    reader.readAsDataURL(file);
  }, [file]);

  return <div ref={containerRef} className="w-full" />;
}