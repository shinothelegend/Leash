'use client';

import { animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function Counter({
  from = 0,
  to,
  duration = 1.5,
  formatter = (v: number) => Math.round(v).toString(),
}: {
  from?: number;
  to: number;
  duration?: number;
  formatter?: (value: number) => string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate(value) {
        node.textContent = formatter(value);
      },
    });

    return () => controls.stop();
  }, [from, to, duration, formatter]);

  return <span ref={nodeRef} />;
}
