import {defineType} from 'sanity'

export const addOnType = defineType({
  name: 'addOn',
  title: 'Add On',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Name of the add-on (e.g., Gift Card, Vase)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price for this add-on',
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'requiresExtraInfo',
      title: 'Requires Extra Information',
      type: 'boolean',
      description: 'Check if this add-on requires additional information from the customer (e.g., gift card message)',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'name',
      price: 'price',
      requiresExtraInfo: 'requiresExtraInfo',
    },
    prepare({title, price, requiresExtraInfo}) {
      return {
        title: title,
        subtitle: `${price ? `£${price}` : 'No price'}${requiresExtraInfo ? ' - Requires extra info' : ''}`,
      }
    },
  },
})
