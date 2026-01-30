import {defineType} from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQs',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Frequently Asked Questions',
    },
    {
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            {
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'order',
              title: 'Display Order',
              type: 'number',
              description: 'Lower numbers appear first',
            },
          ],
          preview: {
            select: {
              title: 'question',
              order: 'order',
            },
            prepare({title, order}) {
              return {
                title: title,
                subtitle: order ? `Order: ${order}` : '',
              }
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      questions: 'questions',
    },
    prepare({title, questions}) {
      return {
        title: title || 'FAQs',
        subtitle: questions ? `${questions.length} questions` : 'No questions yet',
      }
    },
  },
})
