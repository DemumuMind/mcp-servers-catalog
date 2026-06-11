'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useTranslations } from 'next-intl'

const faqKeys = ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'] as const
const answerKeys = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5'] as const

export function FAQAccordion() {
  const t = useTranslations('FAQ')

  return (
    <Accordion className="w-full">
      {faqKeys.map((qKey, index) => (
        <AccordionItem key={qKey} value={`item-${index}`}>
          <AccordionTrigger>{t(qKey)}</AccordionTrigger>
          <AccordionContent>{t(answerKeys[index])}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
