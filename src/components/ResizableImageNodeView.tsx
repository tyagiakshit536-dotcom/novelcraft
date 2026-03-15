import { useRef, useState, type CSSProperties } from 'react';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';

type ImageAlign = 'left' | 'center' | 'right';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const alignStyle: Record<ImageAlign, CSSProperties> = {
  left: { marginLeft: 0, marginRight: 'auto' },
  center: { marginLeft: 'auto', marginRight: 'auto' },
  right: { marginLeft: 'auto', marginRight: 0 },
};

export default function ResizableImageNodeView({ node, selected, updateAttributes, editor }: NodeViewProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const [moving, setMoving] = useState(false);

  const src = String(node.attrs.src || '');
  const alt = String(node.attrs.alt || '');
  const width = Number(node.attrs.width || 360);
  const align = (node.attrs.align || 'left') as ImageAlign;
  const xOffset = Number(node.attrs.xOffset || 0);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const host = wrapperRef.current?.parentElement;
    const startX = e.clientX;
    const startWidth = wrapperRef.current?.getBoundingClientRect().width || 360;
    const hostWidth = host?.getBoundingClientRect().width || window.innerWidth;

    setResizing(true);

    const onMove = (evt: MouseEvent) => {
      const delta = evt.clientX - startX;
      const nextWidth = clamp(startWidth + delta, 120, Math.max(160, hostWidth - 20));
      updateAttributes({ width: Math.round(nextWidth) });
    };

    const onUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const host = wrapperRef.current?.parentElement;
    if (!host || !wrapperRef.current) return;

    const hostRect = host.getBoundingClientRect();
    const imageRect = wrapperRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startOffset = xOffset;

    setMoving(true);

    const onMove = (evt: MouseEvent) => {
      const delta = evt.clientX - startX;
      const desiredOffset = startOffset + delta;
      const maxOffset = Math.max(0, (hostRect.width - imageRect.width) / 2);
      const nextOffset = clamp(desiredOffset, -maxOffset, maxOffset);
      updateAttributes({ xOffset: Math.round(nextOffset) });
    };

    const onUp = () => {
      setMoving(false);
      const finalRect = wrapperRef.current?.getBoundingClientRect() || imageRect;
      const centerX = finalRect.left + finalRect.width / 2;
      const relativeCenter = (centerX - hostRect.left) / Math.max(hostRect.width, 1);
      let nextAlign: ImageAlign = 'center';
      if (relativeCenter <= 0.34) nextAlign = 'left';
      if (relativeCenter >= 0.66) nextAlign = 'right';
      updateAttributes({ align: nextAlign });
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <NodeViewWrapper as="div" className="resizable-image-node-block">
      <div
        ref={wrapperRef}
        className={`resizable-image-node ${selected ? 'is-selected' : ''} ${resizing ? 'is-resizing' : ''} ${moving ? 'is-moving' : ''}`}
        style={{ width: `${width}px`, transform: `translateX(${xOffset}px)`, ...alignStyle[align] }}
        contentEditable={false}
        draggable={false}
        onMouseDown={() => editor.commands.focus()}
      >
        <button
          type="button"
          className="image-move-handle"
          onMouseDown={startMove}
          title="Drag to move image"
          aria-label="Drag to move image"
        >
          Move
        </button>

        <img src={src} alt={alt} draggable={false} />

        <button
          type="button"
          className="image-resize-handle"
          onMouseDown={startResize}
          title="Drag to resize image"
          aria-label="Drag to resize image"
        />
      </div>
    </NodeViewWrapper>
  );
}
