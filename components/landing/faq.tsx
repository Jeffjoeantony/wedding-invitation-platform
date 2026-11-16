'use client'

import { Reveal } from '@/components/ui/reveal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FAQ_ITEMS } from './constants'
import {
  LandingContainer,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
  ThinDivider,
} from './section'

export function LandingFaq() {
  return (
    <section id="faq" className="relative py-16 md:py-24">
      <LandingContainer>
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionEyebrow>FAQ</SectionEyebrow>
            <SectionTitle>Questions, answered quietly</SectionTitle>
            <SectionLead className="mx-auto">
              A few essentials before you begin creating your invitation.
            </SectionLead>
            <div className="mt-6">
              <ThinDivider />
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-12 max-w-2xl">
          <Accordion
            type="single"
            collapsible
            className="rounded-sm border border-[color:var(--landing-champagne)] bg-[color:var(--landing-card)]/80 px-5 backdrop-blur-sm sm:px-7"
          >
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.q}
                value={item.q}
                className="border-[color:var(--landing-champagne)]"
              >
                <AccordionTrigger className="py-5 text-left font-serif text-lg font-light text-[color:var(--landing-ink)] hover:no-underline hover:text-[color:var(--landing-gold-dark)] data-[state=open]:text-[color:var(--landing-gold-dark)]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 font-sans text-sm font-light leading-relaxed text-[color:var(--landing-muted)]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </LandingContainer>
    </section>
  )
}
