import { twMerge } from 'tailwind-merge'

const cardClass = "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl"

console.log('Merged:', twMerge(cardClass))

const h3Class = "font-semibold text-lg"
console.log('H3 merged:', twMerge(h3Class))

const mixed = "text-sm text-lg"
console.log('Mixed:', twMerge(mixed))
