const fs = require('fs');
const path = require('path');

console.log('🚀 Creating content types for Strapi v5...');

const contentTypes = {
  'article': {
    kind: 'collectionType',
    collectionName: 'articles',
    info: {
      singularName: 'article',
      pluralName: 'articles',
      displayName: 'Article',
      description: 'Manage blog articles'
    },
    options: { draftAndPublish: true },
    attributes: {
      title: {
        type: 'string',
        required: true,
        unique: true
      },
      content: {
        type: 'richtext',
        required: true
      },
      slug: {
        type: 'uid',
        targetField: 'title'
      },
      excerpt: {
        type: 'text',
        maxLength: 200
      },
      published_at: {
        type: 'datetime'
      }
    }
  },
  'product': {
    kind: 'collectionType',
    collectionName: 'products',
    info: {
      singularName: 'product',
      pluralName: 'products',
      displayName: 'Product',
      description: 'Manage products'
    },
    options: { draftAndPublish: true },
    attributes: {
      name: {
        type: 'string',
        required: true
      },
      price: {
        type: 'decimal',
        required: true
      },
      description: {
        type: 'text'
      },
      sku: {
        type: 'string',
        unique: true
      },
      in_stock: {
        type: 'boolean',
        default: true
      }
    }
  },
  'category': {
    kind: 'collectionType',
    collectionName: 'categories',
    info: {
      singularName: 'category',
      pluralName: 'categories',
      displayName: 'Category',
      description: 'Organize content into categories'
    },
    options: { draftAndPublish: false },
    attributes: {
      name: {
        type: 'string',
        required: true,
        unique: true
      },
      slug: {
        type: 'uid',
        targetField: 'name'
      },
      description: {
        type: 'text'
      }
    }
  }
};

// Tạo content types
Object.entries(contentTypes).forEach(([name, schema]) => {
  const dirPath = path.join('src', 'api', name, 'content-types', name);
  
  // Tạo thư mục nếu chưa tồn tại
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
  
  // Tạo file schema.json
  const filePath = path.join(dirPath, 'schema.json');
  fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
  console.log(`✅ Created ${name} content type: ${filePath}`);
});
