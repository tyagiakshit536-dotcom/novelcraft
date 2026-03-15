import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageNodeView from '../components/ResizableImageNodeView';

const alignStyles: Record<'left' | 'center' | 'right', string> = {
  left: 'margin-left: 0; margin-right: auto;',
  center: 'margin-left: auto; margin-right: auto;',
  right: 'margin-left: auto; margin-right: 0;',
};

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 360,
        parseHTML: element => {
          const fromData = Number(element.getAttribute('data-width'));
          if (Number.isFinite(fromData) && fromData > 0) return fromData;
          const fromWidthAttr = Number(element.getAttribute('width'));
          if (Number.isFinite(fromWidthAttr) && fromWidthAttr > 0) return fromWidthAttr;
          const fromStyle = Number.parseInt(element.style.width || '', 10);
          if (Number.isFinite(fromStyle) && fromStyle > 0) return fromStyle;
          return 360;
        },
        renderHTML: attributes => ({ 'data-width': attributes.width }),
      },
      align: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-align') || 'left',
        renderHTML: attributes => ({ 'data-align': attributes.align || 'left' }),
      },
      xOffset: {
        default: 0,
        parseHTML: element => Number(element.getAttribute('data-x-offset') || 0),
        renderHTML: attributes => ({ 'data-x-offset': attributes.xOffset || 0 }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const align = (HTMLAttributes.align || 'left') as 'left' | 'center' | 'right';
    const width = Number(HTMLAttributes.width || 360);
    const xOffset = Number(HTMLAttributes.xOffset || 0);

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        draggable: 'true',
        style: `display: block; max-width: 100%; width: ${width}px; ${alignStyles[align] || alignStyles.left} transform: translateX(${xOffset}px);`,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});
