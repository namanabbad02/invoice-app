// Import Sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with MySQL details from .env file
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// Define Models (Tables)
// Customer Model
// const Customer = sequelize.define('Customer', {
//   name: { type: Sequelize.STRING, allowNull: false },
//   email: { type: Sequelize.STRING, allowNull: false, unique: true },
//   phone: { type: Sequelize.STRING, allowNull: false }
// }, { timestamps: true });
const Customer = sequelize.define('Customer', {
  name: { type: Sequelize.STRING, allowNull: false },
  
  // --- CHANGE 1: Make email optional ---
  email: { 
    type: Sequelize.STRING, 
    allowNull: true, // No longer required
    unique: false    // No longer needs to be unique
  },

  // --- CHANGE 2: Make phone the mandatory, unique identifier ---
  phone: { 
    type: Sequelize.STRING, 
    allowNull: false,
    unique: true // This will now prevent duplicate customers based on phone
  }
}, { timestamps: true });

// Product Model
const Product = sequelize.define('Product', {
    productId: { // The custom ID provided by the admin
    type: Sequelize.STRING,
    allowNull: false,
    unique: true // Ensures every product has a unique ID
  },
  category: { // The product category
    type: Sequelize.STRING,
    allowNull: false
  },
  name: { type: Sequelize.STRING, allowNull: false },
  price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
  tax: { type: Sequelize.DECIMAL(5, 2), allowNull: false, comment: 'Tax percentage, e.g., 18.00 for 18%' }
}, { timestamps: true });

// Invoice Model
const Invoice = sequelize.define('Invoice', {
  invoiceNumber: { type: Sequelize.STRING, allowNull: false, unique: true },
  subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
  tax: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
  discount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
  grandTotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
  status: { type: Sequelize.STRING, defaultValue: 'Paid' }, // e.g., Unpaid, Paid, Overdue
  pdfUrl: { type: Sequelize.STRING, allowNull: true } 
}, { timestamps: true });

// Invoice Items Model (Line items for each invoice)
const InvoiceItem = sequelize.define('InvoiceItem', {
  quantity: { type: Sequelize.INTEGER, allowNull: false },
  price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
  tax: { type: Sequelize.DECIMAL(10, 2), allowNull: false }
}, { timestamps: true });

// --- Define Relationships ---
Customer.hasMany(Invoice);
Invoice.belongsTo(Customer);

Invoice.hasMany(InvoiceItem);
InvoiceItem.belongsTo(Invoice);

Product.hasMany(InvoiceItem);
InvoiceItem.belongsTo(Product);

// // Export models and sequelize instance
// module.exports = {
//   sequelize,
//   Customer,
//   Product,
//   Invoice,
//   InvoiceItem
// };

// User Model for Authentication
const User = sequelize.define('User', {
  username: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false }
}, { timestamps: true });

// Export the new model
module.exports = {
  sequelize,
  Customer,
  Product,
  Invoice,
  InvoiceItem,
  User // <-- Add this
};