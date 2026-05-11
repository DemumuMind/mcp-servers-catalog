import type { Meta, StoryObj } from '@storybook/react'
import { LocaleSwitcher } from '../components/locale-switcher'

const meta: Meta<typeof LocaleSwitcher> = {
  title: 'Components/LocaleSwitcher',
  component: LocaleSwitcher,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof LocaleSwitcher>

export const Default: Story = {}
