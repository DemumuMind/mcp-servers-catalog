import type { Meta, StoryObj } from '@storybook/react'
import { RatingStars } from '../components/rating-stars'

const meta: Meta<typeof RatingStars> = {
  title: 'Components/RatingStars',
  component: RatingStars,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof RatingStars>

export const Interactive: Story = {
  args: {
    serverId: '1',
    userId: 'user-1',
  },
}

export const ReadOnly3Stars: Story = {
  args: {
    serverId: '1',
    userId: 'user-1',
  },
  render: () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-5 w-5 ${star <= 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  ),
}
