import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Что такое Model Context Protocol (MCP)?',
    answer:
      'Model Context Protocol (MCP) — это открытый протокол, разработанный Anthropic, который позволяет AI-моделям безопасно подключаться к внешним источникам данных и инструментам. MCP стандартизирует взаимодействие между AI и различными сервисами.',
  },
  {
    question: 'Как установить MCP сервер?',
    answer:
      'Установка MCP сервера обычно выполняется через npm или другой пакетный менеджер. Большинство серверов имеют подробную документацию с инструкциями по установке и настройке в файле README репозитория.',
  },
  {
    question: 'Чем MCP отличается от традиционных API?',
    answer:
      'В отличие от традиционных API, где разработчик вручную интегрирует endpoints, MCP предоставляет стандартизированный способ для AI моделей автоматически обнаруживать и использовать доступные инструменты и данные.',
  },
  {
    question: 'Какие клиенты поддерживают MCP?',
    answer:
      'MCP поддерживается в Claude Desktop, Claude Code, а также в различных редакторах кода и AI-инструментах. Список поддерживаемых клиентов постоянно растет.',
  },
  {
    question: 'Могу ли я создать свой MCP сервер?',
    answer:
      'Да, вы можете создать собственный MCP сервер используя SDK для TypeScript, Python или других языков. MCP SDK предоставляет все необходимые инструменты для разработки серверов.',
  },
  {
    question: 'Безопасен ли MCP протокол?',
    answer:
      'MCP разработан с учетом безопасности. Пользователь всегда контролирует, какие серверы запущены и какие разрешения им предоставлены. Каждый сервер работает в изолированном процессе.',
  },
]

export function FAQAccordion() {
  return (
    <Accordion className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
