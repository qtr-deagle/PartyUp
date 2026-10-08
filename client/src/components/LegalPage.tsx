import { ArrowLeft } from 'lucide-react';
import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED, type LegalSection } from '@/content/legal';

/** Public, readable layout shared by /terms and /privacy. */
export default function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
        <a href="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> PartyUp
        </a>

        <header className="mt-8 border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {LEGAL_LAST_UPDATED}</p>
          <nav className="mt-6 flex flex-wrap gap-2 text-sm">
            <a href="/terms" className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Terms &amp; Conditions</a>
            <a href="/privacy" className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Privacy Policy</a>
          </nav>
        </header>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              {section.body.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-2 leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          Questions? Email{' '}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="font-medium text-foreground underline">
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
