import type { Schema, Struct } from '@strapi/strapi';

export interface SeoComponentSeoArticle extends Struct.ComponentSchema {
  collectionName: 'components_seo_component_seo_articles';
  info: {
    displayName: 'SEOArticle';
    icon: 'eye';
  };
  attributes: {
    metaDescription: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    metaTitle: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'seo-component.seo-article': SeoComponentSeoArticle;
    }
  }
}
