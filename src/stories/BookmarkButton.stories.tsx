import type { Meta, StoryObj } from '@storybook/react'
import { BookmarkButton } from '../components/bookmark-button'

const meta: Meta<typeof BookmarkButton> = {
  title: 'Components/BookmarkButton',
  component: BookmarkButton,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof BookmarkButton>

export const Default: Story = {
  args: {
    serverId: '1',
    userId: 'user-1',
  },
}

export const Loading: Story = {
  args: {
    serverId: '1',
    userId: 'user-1',
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
}
