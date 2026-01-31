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
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [
                    {title: 'Normal', value: 'normal'},
                    {title: 'Heading', value: 'h4'},
                  ],
                  marks: {
                    decorators: [
                      {title: 'Bold', value: 'strong'},
                      {title: 'Italic', value: 'em'},
                      {title: 'Underline', value: 'underline'},
                    ],
                    annotations: [
                      {
                        name: 'link',
                        type: 'object',
                        title: 'Link',
                        fields: [
                          {
                            name: 'href',
                            type: 'url',
                            title: 'URL',
                          },
                        ],
                      },
                    ],
                  },
                  lists: [
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Numbered', value: 'number'},
                  ],
                },
              ],
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
