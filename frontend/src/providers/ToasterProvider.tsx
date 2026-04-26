'use client';

import { Toaster } from 'sonner';

/**
 * Serves as the declarative entry point for the application's feedback notification system.
 * It initializes the notification portal, allowing reactive toast messages to be triggered
 * from anywhere in the component tree without managing individual portal lifetimes.
 */
export default function ToasterProvider() {
  return <Toaster position="top-right" richColors />;
}
