import {defineType} from 'sanity'

export const carouselImageType = defineType({
  name: 'carouselImage',
  title: 'Carousel Image',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Title for the carousel image',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Description for the carousel image',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Order in which the image should appear in the carousel',
    },
  ],
})