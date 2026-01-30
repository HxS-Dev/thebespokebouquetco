import {defineType} from 'sanity'

export const termsAndConditionsType = defineType({
  name: 'termsAndConditions',
  title: 'Terms and Conditions',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Terms and Conditions',
    },
    {
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'date',
      description: 'When the terms were last updated',
    },
    {
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'section',
          title: 'Section',
          fields: [
            {
              name: 'heading',
              title: 'Section Heading',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              title: 'Content',
              type: 'text',
              rows: 5,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'heading',
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      lastUpdated: 'lastUpdated',
    },
    prepare({title, lastUpdated}) {
      return {
        title: title || 'Terms and Conditions',
        subtitle: lastUpdated ? `Last updated: ${lastUpdated}` : 'Not yet updated',
      }
    },
  },
})
