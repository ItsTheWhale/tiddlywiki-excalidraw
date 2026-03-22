import type { JSX } from 'react';

export function WebEmbed({ link }: { link: string }): JSX.Element {
  return (
    <iframe
      src={link}
      className='excalidraw__embeddable'
      title='Excalidraw Embedded Content'
      referrerPolicy='no-referrer-when-downgrade'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      allowFullScreen={true}
      allow-scripts
      allow-forms
      allow-popups
      allow-popups-to-escape-sandbox
      allow-presentation
      allow-downloads
    />
  );
}
