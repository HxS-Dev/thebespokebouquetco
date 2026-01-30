import {defineType} from 'sanity'

export const bouquetSizeType = defineType({
  name: 'bouquetSize',
  title: 'Bouquet Size',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Name of the bouquet size (e.g., Small, Medium, Large)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'numberOfRoses',
      title: 'Number of Roses',
      type: 'number',
      description: 'How many roses are included in this size',
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price for this bouquet size',
      validation: (Rule) => Rule.required().min(0),
    },
  ],
  preview: {
    select: {
      title: 'name',
      roses: 'numberOfRoses',
      price: 'price',
    },
    prepare({title, roses, price}) {
      return {
        title: title,
        subtitle: `${roses} roses - £${price}`,
      }
    },
  },
})
