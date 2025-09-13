// Import necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, Customer, Product, Invoice, InvoiceItem } = require('./database');
const { generateInvoicePDF } = require('./services/pdfService');
const { sendInvoiceEmail } = require('./services/emailService');
const { User } = require('./database'); // <-- Import User model
const { protect } = require('./middleware/authMiddleware'); // <-- Import auth middleware
const { Op } = require('sequelize');

const { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } = require('date-fns');

// Initialize the app
const app = express();
const PORT = 3001;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(bodyParser.json()); // Parses incoming JSON requests


// const { convertGoogleDriveLink } = require('./utils/linkConverter');
const { sendInvoiceWhatsApp } = require('./services/whatsappService'); // Assuming this exists
const { uploadAndSharePdf } = require('./services/googleDriveApiService');
// At the top of server.js
const { convertToDirectLink } = require('./services/googleDriveService');
// const { sendInvoiceWhatsApp } = require('./services/whatsappService');
// const { uploadAndSharePdf } = require('./services/googleDriveApiService');



// --- API ROUTES ---

// GET /products?search=... - Search for products
app.get('/api/products', async (req, res) => {
    // Implementation for product search would go here
    // For now, let's return all products
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


// --- Server Initialization ---
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    try {
        // Sync all models with the database
        await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
        console.log('Database connected and synced!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});

// --- USER AUTHENTICATION APIS ---

// POST /api/users/register - Register a new user
app.post('/api/users/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ username, password: hashedPassword });

    if (user) {
        res.status(201).json({
            id: user.id,
            username: user.username,
            token: jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '12h' }),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// POST /api/users/login - Authenticate a user
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user.id,
            username: user.username,
            token: jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' }),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


// --- PRODUCT CRUD APIS (NOW PROTECTED) ---

// GET /api/products - Get all products (Public)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// DELETE /api/products/:id - Delete a product (Protected)
app.delete('/api/products/:id', protect, async (req, res) => {
    try {
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send(); // No Content
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Product.findAll({
            attributes: [
                // Use sequelize.fn to apply the DISTINCT function on the 'category' column
                [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
            ],
            order: [['category', 'ASC']] // Order them alphabetically
        });
        // The result is an array of objects, e.g., [{ category: 'Electronics' }]. We map it to a simple array of strings.
        res.json(categories.map(c => c.category));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/products', protect, async (req, res) => {
    try {
        // --- MODIFIED: Include productId and category ---
        const { name, price, tax, productId, category } = req.body;
        const product = await Product.create({ name, price, tax, productId, category });
        res.status(201).json(product);
    } catch (error) {
        // Provide a more specific error for unique constraint violation
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: `Product ID "${req.body.productId}" already exists.` });
        }
        res.status(400).json({ error: 'Failed to create product', details: error });
    }
});

// PUT /api/products/:id - Update a product (Protected)
app.put('/api/products/:id', protect, async (req, res) => {
    try {
        // --- MODIFIED: Include productId and category ---
        const { name, price, tax, productId, category } = req.body;
        const [updated] = await Product.update({ name, price, tax, productId, category }, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: `Product ID "${req.body.productId}" already exists.` });
        }
        res.status(400).json({ error: 'Failed to update product' });
    }
});


app.post('/api/invoices', async (req, res) => {
  const { customer, items, discount } = req.body;

  // Phone number validation (E.164 format)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!customer.phone || !phoneRegex.test(customer.phone)) {
    return res.status(400).json({
      error: 'Invalid phone number format.',
      details: 'Phone number must be in E.164 format (e.g., +919876543210).'
    });
  }

  const t = await sequelize.transaction();
  let newInvoice;

//   try {
//     // === Part 1: Database Transaction ===
//     // --- CHANGE: Use phone as the primary lookup, email is now just another piece of data ---
//     const [customerRecord] = await Customer.findOrCreate({
//       where: { phone: customer.phone },
//       defaults: { 
//         name: customer.name,
//         email: customer.email || null // Save email if provided, otherwise null
//       },
//       transaction: t
//     });
try {
    const [customerRecord, created] = await Customer.findOrCreate({
      where: { phone: customer.phone },
      defaults: { name: customer.name, email: customer.email || null },
      transaction: t
    });

    // If the customer was found (not created) and the details from the form are different, update them.
    if (!created && (customerRecord.name !== customer.name || customerRecord.email !== (customer.email || null))) {
      customerRecord.name = customer.name;
      customerRecord.email = customer.email || null;
      // Save the changes within the same transaction.
      await customerRecord.save({ transaction: t });
    }

    // (The rest of the transaction logic remains the same)
    const productIds = items.map(item => item.id);
    const productsFromDb = await Product.findAll({ where: { id: productIds }, transaction: t });
    if (productsFromDb.length !== productIds.length) { throw new Error(`One or more products not found.`); }
    
    const productMap = productsFromDb.reduce((map, product) => { map[product.id] = product; return map; }, {});
    let subtotal = 0, totalTax = 0;
    const invoiceItemsData = items.map(item => {
            const product = productMap[item.id];
            const itemPrice = parseFloat(product.price);
            const itemTaxAmount = (itemPrice * item.quantity) * (parseFloat(product.tax) / 100);
            subtotal += itemPrice * item.quantity;
            totalTax += itemTaxAmount;
            return {
                ProductId: product.id, quantity: item.quantity, price: itemPrice, tax: itemTaxAmount
            };
        });

        const grandTotal = subtotal + totalTax - (discount || 0);

    newInvoice = await Invoice.create({ invoiceNumber: `INV-${Date.now()}`, CustomerId: customerRecord.id, subtotal, tax: totalTax, discount: discount || 0, grandTotal }, { transaction: t });
    await InvoiceItem.bulkCreate(invoiceItemsData.map(item => ({ ...item, InvoiceId: newInvoice.id })), { transaction: t });
    
    await t.commit(); // The invoice is now safely in the database.

  } catch (error) {
    await t.rollback();
    console.error('Invoice creation failed during transaction:', error);
    // Handle unique constraint error for phone number
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'A customer with this phone number already exists with a different name/email.' });
    }
    return res.status(500).json({ error: 'Failed to save invoice to the database.', details: error.message });
  }

  // === Part 2: Post-Processing (Email Only) ===
  // The upload and link saving logic has been removed from here.
  try {
    // Only attempt to send an email if an email was provided.
    if (customer.email) {
      const finalInvoiceData = {
        invoice: newInvoice,
        customer: await newInvoice.getCustomer(),
        items: await InvoiceItem.findAll({ where: { InvoiceId: newInvoice.id }, include: Product })
    };
      const pdfBuffer = await generateInvoicePDF(finalInvoiceData);
      await sendInvoiceEmail(customer.email, newInvoice.invoiceNumber, pdfBuffer);
    }

    res.status(201).json({
      message: 'Invoice created successfully!',
      invoiceId: newInvoice.id,
    });
  } catch (postProcessError) {
    console.error('Email sending failed after invoice was created:', postProcessError);
    res.status(202).json({
      message: `Invoice created (ID: ${newInvoice.id}), but failed to send the initial email.`,
      invoiceId: newInvoice.id,
      error: postProcessError.message
    });
  }
});

// GET /api/invoices - Get all invoices
app.get('/api/invoices', protect, async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            // Include the associated Customer model to get the customer's name
            include: [Customer],
            // Order by the creation date, newest first
            order: [['createdAt', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// GET /api/invoices/:id - Get a single invoice by its ID
app.get('/api/invoices/:id', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            // Include all associated data: the customer and the line items
            include: [
                { model: Customer },
                { model: InvoiceItem, include: [Product] } // Also include the Product details for each item
            ]
        });

        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ error: 'Invoice not found' });
        }
    } catch (error) {
        console.error("Failed to fetch single invoice:", error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});

// GET /api/invoices/:id/pdf
app.get('/api/invoices/:id/pdf', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                { model: Customer },
                { model: InvoiceItem, include: [Product] }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Ensure items are properly shaped for the PDF service
        const items = (invoice.InvoiceItems || []).map(item => ({
            quantity: item.quantity,
            price: item.price ?? item.Product?.price ?? 0,
            tax: item.tax ?? item.Product?.tax ?? 0,
            Product: item.Product || { name: "Unknown Product" }
        }));

        const invoiceDataForPdf = {
            invoice: invoice,
            customer: invoice.Customer,
            items: items
        };

        const pdfBuffer = await generateInvoicePDF(invoiceDataForPdf);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Failed to generate PDF for download:", error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});


// POST /api/invoices/:id/resend - Resend the invoice email
app.post('/api/invoices/:id/resend', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                { model: Customer },
                { model: InvoiceItem, include: [Product] }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Ensure items are properly shaped for the PDF service
        const items = (invoice.InvoiceItems || []).map(item => ({
            quantity: item.quantity,
            price: item.price ?? item.Product?.price ?? 0,
            tax: item.tax ?? item.Product?.tax ?? 0,
            Product: item.Product || { name: "Unknown Product" }
        }));

        const invoiceDataForPdf = {
            invoice: invoice,
            customer: invoice.Customer,
            items: items
        };

        // Generate the PDF
        const pdfBuffer = await generateInvoicePDF(invoiceDataForPdf);

        // Send the email using the existing email service
        await sendInvoiceEmail(invoice.Customer.email, invoice.invoiceNumber, pdfBuffer);

        res.status(200).json({ message: 'Invoice email resent successfully!' });

    } catch (error) {
        console.error("Failed to resend invoice email:", error);
        res.status(500).json({ error: 'Failed to resend email' });
    }
});

app.post('/api/invoices/:id/send-whatsapp', protect, async (req, res) => {
  try {
    // 1. Fetch the complete invoice details from the database
    const invoice = await Invoice.findByPk(req.params.id, { include: [Customer] });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    // --- 2. THIS IS THE LOGIC THAT RETRIEVES THE URL FROM THE DATABASE ---
    // We get the direct link directly from the 'pdfUrl' property of the invoice object.
    const directLink = invoice.pdfUrl; 

    // 3. Validate that the link exists
    if (!directLink) {
      return res.status(400).json({ error: 'Could not find a Google Drive link for this invoice. It may have failed to upload during creation.' });
    }

    // 4. Send the WhatsApp message using the retrieved link
    await sendInvoiceWhatsApp(invoice.Customer.phone, invoice.invoiceNumber, directLink);

    res.status(200).json({ message: `WhatsApp message sent successfully to ${invoice.Customer.name}!` });

  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    res.status(500).json({ error: 'Failed to send WhatsApp message.' });
  }
});

app.post('/api/invoices/:id/upload', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: Customer }, { model: InvoiceItem, include: [Product] }]
    });

    if (!invoice) { return res.status(404).json({ error: 'Invoice not found.' }); }

    // 1. Generate PDF
    const invoiceDataForPdf = { invoice, customer: invoice.Customer, items: invoice.InvoiceItems };
    const pdfBuffer = await generateInvoicePDF(invoiceDataForPdf);

    // 2. Upload to Drive
    const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;
    const { webViewLink } = await uploadAndSharePdf(pdfBuffer, fileName);

    // 3. Convert to Direct Link
    const directLink = convertToDirectLink(webViewLink);
    if (!directLink) { throw new Error("Failed to convert Google Drive link."); }

    // 4. Update the database with the new link
    await invoice.update({ pdfUrl: directLink });

    res.status(200).json({
      message: 'File uploaded and shared successfully!',
      pdfUrl: directLink // Send the link back to the frontend
    });
  } catch (error) {
    console.error("Failed during upload process:", error);
    res.status(500).json({ error: 'Failed to upload invoice.' });
  }
});

// In /backend/server.js

// POST /api/invoices/:id/resend - Resend the invoice email
app.post('/api/invoices/:id/resend', protect, async (req, res) => {
  try {
    // 1. Fetch the invoice and all its related data
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { model: InvoiceItem, include: [Product] }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // --- THE FIX ---
    // 2. Create the correctly structured object that the PDF service expects.
    const invoiceDataForPdf = {
      invoice: invoice,
      customer: invoice.Customer,
      items: invoice.InvoiceItems // Map the correct property name
    };

    // 3. Generate the PDF using the correctly shaped object
    const pdfBuffer = await generateInvoicePDF(invoiceDataForPdf);

    // 4. Send the email using the existing email service
    await sendInvoiceEmail(invoice.Customer.email, invoice.invoiceNumber, pdfBuffer);

    res.status(200).json({ message: 'Invoice email resent successfully!' });

  } catch (error) {
    console.error("Failed to resend invoice email:", error);
    res.status(500).json({ error: 'Failed to resend email' });
  }
});

app.get('/api/dashboard/kpis', protect, async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const todaysRevenue = await Invoice.sum('grandTotal', { where: { createdAt: { [Op.between]: [todayStart, todayEnd] } } });
    const monthlyRevenue = await Invoice.sum('grandTotal', { where: { createdAt: { [Op.between]: [monthStart, monthEnd] } } });
    const monthlyDiscount = await Invoice.sum('discount', { where: { createdAt: { [Op.between]: [monthStart, monthEnd] } } });
    
    const bestSellingProduct = await InvoiceItem.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']],
      include: [{ model: Product, attributes: ['name'] }],
      where: { createdAt: { [Op.between]: [monthStart, monthEnd] } },
      group: ['Product.id'],
      order: [[sequelize.literal('totalQuantity'), 'DESC']],
      raw: true, // Use raw: true to get a clean object
    });

    res.json({
      todaysRevenue: todaysRevenue || 0,
      monthlyRevenue: monthlyRevenue || 0,
      monthlyDiscount: monthlyDiscount || 0,
      // Pass both name and quantity back to the frontend
      bestSellingProduct: bestSellingProduct ? { name: bestSellingProduct['Product.name'], quantity: bestSellingProduct.totalQuantity } : { name: 'N/A', quantity: 0 },
    });
  } catch (error) {
    console.error("Failed to fetch KPIs:", error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

app.get('/api/dashboard/top-products', protect, async (req, res) => {
  try {
    const topProducts = await InvoiceItem.findAll({
      attributes: [
        [sequelize.col('Product.name'), 'name'], // Get the name directly
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        // --- THE FIX: Use sequelize.literal() for the calculation ---
        [sequelize.literal('SUM(quantity * InvoiceItem.price)'), 'totalRevenue']
      ],
      include: [{ model: Product, attributes: [] }], // Include but don't select columns from it
      group: ['Product.id'],
      order: [[sequelize.literal(req.query.by === 'revenue' ? 'totalRevenue' : 'totalQuantity'), 'DESC']],
      limit: 5,
      raw: true,
    });
    res.json(topProducts);
  } catch (error) {
    console.error("Failed to fetch top products:", error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// In /backend/server.js

app.get('/api/dashboard/category-sales', protect, async (req, res) => {
  try {
    const categorySales = await InvoiceItem.findAll({
      attributes: [
        [sequelize.col('Product.category'), 'category'],
        [sequelize.literal('SUM(quantity * InvoiceItem.price)'), 'totalRevenue']
      ],
      include: [{ model: Product, attributes: [] }],
      group: ['Product.category'],
      raw: true,
    });

    // --- THE DEFINITIVE FIX IS HERE ---
    // Manually parse the revenue for each category to ensure it's a valid number.
    // This protects against the database returning strings, nulls, or other odd types.
    const cleanedSales = categorySales.map(sale => ({
      ...sale,
      totalRevenue: parseFloat(sale.totalRevenue) || 0 // Convert to float, fallback to 0 if null/NaN
    }));

    // Filter out categories that genuinely have zero revenue.
    const validSales = cleanedSales.filter(sale => sale.totalRevenue > 0);

    res.json(validSales);
    
  } catch (error) {
    console.error("Failed to fetch category sales:", error);
    res.status(500).json({ error: 'Failed to fetch category sales' });
  }
});

app.get('/api/dashboard/recent-invoices', protect, async (req, res) => {
  try {
    const recentInvoices = await Invoice.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [Customer]
    });
    res.json(recentInvoices);
  } catch (error) {
    console.error("Failed to fetch recent invoices:", error);
    res.status(500).json({ error: 'Failed to fetch recent invoices' });
  }
});
app.get('/api/dashboard/revenue-trend', protect, async (req, res) => {
  try {
    const { period = 'daily' } = req.query; // Default to 'daily'
    let dateFilter;
    let groupBy;
    let labelFormat;

    const now = new Date();

    if (period === 'hourly') {
      // Date filter remains in UTC as it's a safe, universal boundary
      dateFilter = { [Op.between]: [startOfDay(now), endOfDay(now)] };
      
      // --- THE FIX IS HERE ---
      // Use sequelize.literal() to tell MySQL to convert the time zone before grouping.
      // 'Asia/Kolkata' is the standard identifier for IST.
      groupBy = sequelize.literal("HOUR(CONVERT_TZ(createdAt, '+00:00', '+05:30'))");

      labelFormat = (hour) => `${String(hour).padStart(2, '0')}:00`; // Format as HH:00
    
    } else { // Daily (default)
      dateFilter = { [Op.between]: [startOfDay(subDays(now, 6)), endOfDay(now)] };
      // For daily, we can also apply the conversion to be perfectly accurate
      groupBy = sequelize.literal("DATE(CONVERT_TZ(createdAt, '+00:00', '+05:30'))");
      labelFormat = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    }

    const revenueData = await Invoice.findAll({
      attributes: [
        [groupBy, 'label'],
        [sequelize.fn('SUM', sequelize.col('grandTotal')), 'revenue']
      ],
      where: { createdAt: dateFilter },
      group: ['label'],
      order: [[sequelize.literal('label'), 'ASC']],
      raw: true,
    });

    // --- NEW: Post-processing to ensure all hours of the day are present ---
    let formattedData = [];
    if (period === 'hourly') {
        const hourlyMap = new Map();
        revenueData.forEach(item => {
            hourlyMap.set(parseInt(item.label), parseFloat(item.revenue) || 0);
        });

        // Create a data point for every hour from 0 to 23
        for (let i = 0; i < 24; i++) {
            formattedData.push({
                label: labelFormat(i),
                revenue: hourlyMap.get(i) || 0 // Use 0 for hours with no sales
            });
        }
    } else {
        // Daily data formatting
        formattedData = revenueData.map(item => ({
            label: labelFormat(item.label),
            revenue: parseFloat(item.revenue) || 0
        }));
    }
    
    res.json(formattedData);

  } catch (error) {
    console.error(`Failed to fetch revenue trend for period: ${req.query.period}`, error);
    res.status(500).json({ error: 'Failed to fetch revenue trend' });
  }
});




//---------------------------END OF CODE---------------------------



















// // POST /api/invoices - Create a new invoice
// app.post('/api/invoices', async (req, res) => {
//   const { customer, items, discount } = req.body; // Expects customer object and items array

//   // Start a database transaction to ensure all or nothing is saved
//   const t = await sequelize.transaction();

//   try {
//     // Step 1: Find or create the customer
//     const [customerRecord, created] = await Customer.findOrCreate({
//       where: { email: customer.email },
//       defaults: { name: customer.name, phone: customer.phone },
//       transaction: t,
//     });

//     // Step 2: Fetch all product details from DB to ensure prices are correct
//     const productIds = items.map(item => item.id);
//     const productsFromDb = await Product.findAll({ where: { id: productIds } });

//     if (productsFromDb.length !== productIds.length) {
//       throw new Error("One or more products not found.");
//     }

//     // Map DB products for easy lookup
//     const productMap = productsFromDb.reduce((map, product) => {
//       map[product.id] = product;
//       return map;
//     }, {});

//     // Step 3: Calculate totals and create invoice items
//     let subtotal = 0;
//     let totalTax = 0;

//     const invoiceItemsData = items.map(item => {
//       const product = productMap[item.id];
//       const itemPrice = parseFloat(product.price);
//       const itemTaxAmount = (itemPrice * item.quantity) * (parseFloat(product.tax) / 100);

//       subtotal += itemPrice * item.quantity;
//       totalTax += itemTaxAmount;

//       return {
//         ProductId: product.id,
//         quantity: item.quantity,
//         price: itemPrice,
//         tax: itemTaxAmount,
//       };
//     });

//     const grandTotal = subtotal + totalTax - (discount || 0);

//     // Step 4: Create the invoice record
//     const newInvoice = await Invoice.create({
//       invoiceNumber: `INV-${Date.now()}`,
//       CustomerId: customerRecord.id,
//       subtotal,
//       tax: totalTax,
//       discount: discount || 0,
//       grandTotal,
//     }, { transaction: t });

//     // Step 5: Create the associated invoice items
//     await InvoiceItem.bulkCreate(
//       invoiceItemsData.map(item => ({ ...item, InvoiceId: newInvoice.id })),
//       { transaction: t }
//     );

//     // Commit the transaction
//     await t.commit();

//     // --- Post-DB Operations: PDF Generation & Email ---

//     // Refetch the full invoice data for the PDF
//     const finalInvoiceData = {
//         invoice: newInvoice,
//         customer: customerRecord,
//         items: await InvoiceItem.findAll({ where: { InvoiceId: newInvoice.id }, include: Product })
//     };

//     // Step 6: Generate PDF
//     const pdfBuffer = await generateInvoicePDF(finalInvoiceData);

//     // Step 7: Send Email
//     await sendInvoiceEmail(customerRecord.email, newInvoice.invoiceNumber, pdfBuffer);

//     res.status(201).json({
//       message: 'Invoice created successfully!',
//       invoiceId: newInvoice.id,
//       // In a real app, you might save the PDF to S3/Drive and return a URL
//     });

//   } catch (error) {
//     // If any step fails, roll back the transaction
//     await t.rollback();
//     console.error('Invoice creation failed:', error);
//     res.status(500).json({ error: 'Failed to create invoice.' });
//   }
// });




// // POST /api/products - Add a new product (Protected)
// app.post('/api/products', protect, async (req, res) => {
//   try {
//     const { name, price, tax } = req.body;
//     const product = await Product.create({ name, price, tax });
//     res.status(201).json(product);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to create product', details: error });
//   }
// });

// // PUT /api/products/:id - Update a product (Protected)
// app.put('/api/products/:id', protect, async (req, res) => {
//   try {
//     const { name, price, tax } = req.body;
//     const [updated] = await Product.update({ name, price, tax }, {
//       where: { id: req.params.id }
//     });
//     if (updated) {
//       const updatedProduct = await Product.findByPk(req.params.id);
//       res.status(200).json(updatedProduct);
//     } else {
//       res.status(404).json({ error: 'Product not found' });
//     }
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to update product' });
//   }
// });





// // POST /api/invoices - Create a new invoice
// app.post('/api/invoices', async (req, res) => {
//   const { customer, items, discount } = req.body; 

//   const t = await sequelize.transaction();

//   try {
//     const [customerRecord, created] = await Customer.findOrCreate({
//       where: { email: customer.email },
//       defaults: { name: customer.name, phone: customer.phone },
//       transaction: t,
//     });

//     const productIds = items.map(item => item.id);
//     const productsFromDb = await Product.findAll({ where: { id: productIds } });

//     // =================================================================
//     // --- START: THE FIX ---
//     // Add this validation block to prevent the crash.
//     // This checks if the number of products found in the DB matches the
//     // number of unique product IDs sent from the frontend.
//     if (productsFromDb.length !== productIds.length) {
//       // Find which product was not found to give a better error message.
//       const foundIds = productsFromDb.map(p => p.id);
//       const missingId = productIds.find(id => !foundIds.includes(id));

//       // We must roll back the transaction before sending the response.
//       await t.rollback();

//       return res.status(404).json({
//         error: `Product not found.`,
//         details: `A product with ID ${missingId} could not be found in the database. It may have been deleted.`
//       });
//     }
//     // --- END: THE FIX ---
//     // =================================================================


//     const productMap = productsFromDb.reduce((map, product) => {
//       map[product.id] = product;
//       return map;
//     }, {});

//     let subtotal = 0;
//     let totalTax = 0;

//     const invoiceItemsData = items.map(item => {
//       const product = productMap[item.id];
//       // Now 'product' is guaranteed to exist, so the line below is safe.
//       const itemPrice = parseFloat(product.price);
//       const itemTaxAmount = (itemPrice * item.quantity) * (parseFloat(product.tax) / 100);

//       subtotal += itemPrice * item.quantity;
//       totalTax += itemTaxAmount;

//       return {
//         ProductId: product.id,
//         quantity: item.quantity,
//         price: itemPrice,
//         tax: itemTaxAmount,
//       };
//     });

//     // ... The rest of the function remains the same ...
//     const grandTotal = subtotal + totalTax - (discount || 0);

//     const newInvoice = await Invoice.create({
//       invoiceNumber: `INV-${Date.now()}`,
//       CustomerId: customerRecord.id,
//       subtotal,
//       tax: totalTax,
//       discount: discount || 0,
//       grandTotal,
//     }, { transaction: t });

//     await InvoiceItem.bulkCreate(
//       invoiceItemsData.map(item => ({ ...item, InvoiceId: newInvoice.id })),
//       { transaction: t }
//     );

//     await t.commit();

//     const finalInvoiceData = {
//         invoice: newInvoice,
//         customer: customerRecord,
//         items: await InvoiceItem.findAll({ where: { InvoiceId: newInvoice.id }, include: Product })
//     };

//     const pdfBuffer = await generateInvoicePDF(finalInvoiceData);
//     await sendInvoiceEmail(customerRecord.email, newInvoice.invoiceNumber, pdfBuffer);

//     res.status(201).json({
//       message: 'Invoice created successfully!',
//       invoiceId: newInvoice.id,
//     });

//   } catch (error) {
//     await t.rollback();
//     console.error('Invoice creation failed:', error); // The full error will still be logged here on the server
//     console.error('Invoice creation failed:', error);
//     res.status(500).json({ error: 'Failed to create invoice.' });
//   }
// });

// POST /api/invoices - Create a new invoice
// app.post('/api/invoices', async (req, res) => {
//     const { customer, items, discount } = req.body;

//     const t = await sequelize.transaction();
//     let newInvoice; // Define newInvoice outside the try block to access it later

//     try {
//         // --- DATABASE TRANSACTION LOGIC ---
//         const [customerRecord] = await Customer.findOrCreate({
//             where: { email: customer.email },
//             defaults: { name: customer.name, phone: customer.phone },
//             transaction: t,
//         });

//         const productIds = items.map(item => item.id);
//         const productsFromDb = await Product.findAll({ where: { id: productIds }, transaction: t });

//         if (productsFromDb.length !== productIds.length) {
//             const foundIds = productsFromDb.map(p => p.id);
//             const missingId = productIds.find(id => !foundIds.includes(id));
//             // No need to rollback here, the error will trigger the catch block
//             throw new Error(`Product with ID ${missingId} not found.`);
//         }

//         const productMap = productsFromDb.reduce((map, product) => {
//             map[product.id] = product;
//             return map;
//         }, {});

//         let subtotal = 0;
//         let totalTax = 0;

//         const invoiceItemsData = items.map(item => {
//             const product = productMap[item.id];
//             const itemPrice = parseFloat(product.price);
//             const itemTaxAmount = (itemPrice * item.quantity) * (parseFloat(product.tax) / 100);
//             subtotal += itemPrice * item.quantity;
//             totalTax += itemTaxAmount;
//             return {
//                 ProductId: product.id, quantity: item.quantity, price: itemPrice, tax: itemTaxAmount
//             };
//         });

//         const grandTotal = subtotal + totalTax - (discount || 0);

//         newInvoice = await Invoice.create({
//             invoiceNumber: `INV-${Date.now()}`,
//             CustomerId: customerRecord.id,
//             subtotal, tax: totalTax, discount: discount || 0, grandTotal,
//         }, { transaction: t });

//         await InvoiceItem.bulkCreate(
//             invoiceItemsData.map(item => ({ ...item, InvoiceId: newInvoice.id })),
//             { transaction: t }
//         );

//         // This is the final step of the transaction.
//         await t.commit();
//         // --- END OF DATABASE TRANSACTION LOGIC ---

//     } catch (error) {
//         // If anything in the try block fails, undo all database changes.
//         await t.rollback();
//         console.error('Invoice creation failed during transaction:', error);
//         // Send a specific error response
//         return res.status(500).json({ error: 'Failed to save invoice to the database.', details: error.message });
//     }

//     // --- POST-PROCESSING (PDF & EMAIL) ---
//     // This happens only if the transaction was successful.
//     try {
//         const finalInvoiceData = {
//             invoice: newInvoice,
//             customer: await newInvoice.getCustomer(), // Fetch the associated customer
//             items: await InvoiceItem.findAll({ where: { InvoiceId: newInvoice.id }, include: Product })
//         };

//         const pdfBuffer = await generateInvoicePDF(finalInvoiceData);
//         await sendInvoiceEmail(finalInvoiceData.customer.email, newInvoice.invoiceNumber, pdfBuffer);

//         // Everything was successful!
//         res.status(201).json({
//             message: 'Invoice created and sent successfully!',
//             invoiceId: newInvoice.id,
//         });

//     } catch (postProcessError) {
//         // This catch block runs if PDF generation or emailing fails.
//         console.error('Post-processing failed after invoice was created:', postProcessError);
//         // The invoice was CREATED, but something else failed. Let the user know.
//         res.status(202).json({
//             message: `Invoice created successfully (ID: ${newInvoice.id}), but failed to send email. Please try resending manually.`,
//             invoiceId: newInvoice.id,
//             error: postProcessError.message
//         });
//     }
// });
// // --- Replace the existing POST /api/invoices route with this ---
// app.post('/api/invoices', async (req, res) => {
//   const { customer, items, discount } = req.body;

//   const phoneRegex = /^\+[1-9]\d{1,14}$/;
//   if (!customer.phone || !phoneRegex.test(customer.phone)) {
//     return res.status(400).json({
//       error: 'Invalid phone number format.',
//       details: 'Phone number must be in E.164 format (e.g., +919876543210).'
//     });
//   }
//   // --- END OF FIX ---


//   const t = await sequelize.transaction();
//   let newInvoice;

//   try {
//     // === Part 1: Database Transaction ===
//     // (This part is the same as before - it's fast and reliable)
//     const [customerRecord] = await Customer.findOrCreate({ where: { email: customer.email }, defaults: { name: customer.name, phone: customer.phone }, transaction: t });
//     const productIds = items.map(item => item.id);
//     const productsFromDb = await Product.findAll({ where: { id: productIds }, transaction: t });
//     if (productsFromDb.length !== productIds.length) { throw new Error(`One or more products not found.`); }
    
//     const productMap = productsFromDb.reduce((map, product) => { map[product.id] = product; return map; }, {});
//     let subtotal = 0, totalTax = 0;
//     const invoiceItemsData = items.map(item => {
//             const product = productMap[item.id];
//             const itemPrice = parseFloat(product.price);
//             const itemTaxAmount = (itemPrice * item.quantity) * (parseFloat(product.tax) / 100);
//             subtotal += itemPrice * item.quantity;
//             totalTax += itemTaxAmount;
//             return {
//                 ProductId: product.id, quantity: item.quantity, price: itemPrice, tax: itemTaxAmount
//             };
//         });

//         const grandTotal = subtotal + totalTax - (discount || 0);

//     newInvoice = await Invoice.create({ invoiceNumber: `INV-${Date.now()}`, CustomerId: customerRecord.id, subtotal, tax: totalTax, discount: discount || 0, grandTotal }, { transaction: t });
//     await InvoiceItem.bulkCreate(invoiceItemsData.map(item => ({ ...item, InvoiceId: newInvoice.id })), { transaction: t });
    
//     await t.commit(); // The core invoice data is now safely in the database.

//   } catch (error) {
//     await t.rollback();
//     console.error('Invoice creation failed during transaction:', error);
//     return res.status(500).json({ error: 'Failed to save invoice to the database.', details: error.message });
//   }

//   // === Part 2: Post-Processing (PDF, Upload, Link Conversion) ===
//   // This happens after the transaction is safely committed.
//   try {
//     const finalInvoiceData = {
//         invoice: newInvoice,
//         customer: await newInvoice.getCustomer(),
//         items: await InvoiceItem.findAll({ where: { InvoiceId: newInvoice.id }, include: Product })
//     };

//     // 1. Generate the PDF in memory
//     const pdfBuffer = await generateInvoicePDF(finalInvoiceData);

//     // 2. Upload the PDF to Google Drive and get the share link
//     const fileName = `Invoice-${newInvoice.invoiceNumber}.pdf`;
//     const { webViewLink } = await uploadAndSharePdf(pdfBuffer, fileName);

//     // 3. Convert the share link to a direct download link
//     const directLink = convertToDirectLink(webViewLink);
//     if (!directLink) { throw new Error("Failed to convert Google Drive link."); }

//     // --- 4. THIS IS THE LOGIC THAT STORES THE URL IN THE DATABASE ---
//     // The .update() command saves the directLink to the pdfUrl column for this specific invoice.
//     await newInvoice.update({ pdfUrl: directLink });

//     // 5. Send initial email (optional)
//     if (finalInvoiceData.customer.email) {
//       await sendInvoiceEmail(finalInvoiceData.customer.email, newInvoice.invoiceNumber, pdfBuffer);
//     }

//     res.status(201).json({
//       message: 'Invoice created and uploaded successfully!',
//       invoiceId: newInvoice.id,
//     });

//   } catch (postProcessError) {
//     console.error('Post-processing failed after invoice was created:', postProcessError);
//     // Even if this part fails, the invoice is still created.
//     res.status(202).json({
//       message: `Invoice created (ID: ${newInvoice.id}), but failed during PDF upload or email sending.`,
//       invoiceId: newInvoice.id,
//       error: postProcessError.message
//     });
//   }
// });


// // POST /api/invoices/:id/send-whatsapp - Sends an invoice using the LINK FROM THE DATABASE
// app.post('/api/invoices/:id/send-whatsapp', protect, async (req, res) => {
//   try {
//     const invoiceId = req.params.id;

//     // 1. Fetch the invoice from the database
//     const invoice = await Invoice.findByPk(invoiceId, { include: [Customer] });

//     if (!invoice) {
//       return res.status(404).json({ error: 'Invoice not found.' });
//     }

//     // 2. Check if the PDF URL exists (meaning it has been uploaded)
//     if (!invoice.pdfUrl) {
//       return res.status(400).json({ error: 'Invoice has not been uploaded to Google Drive yet. Please upload it first.' });
//     }

//     // 3. Convert the saved Google Drive link to a direct download link
//     const directLink = convertToDirectLink(invoice.pdfUrl);

//     if (!directLink) {
//       return res.status(400).json({ error: 'The saved Google Drive link is in an invalid format.' });
//     }

//     // 4. Send the message via Twilio
//     await sendInvoiceWhatsApp(invoice.Customer.phone, invoice.invoiceNumber, directLink);

//     res.status(200).json({ message: `WhatsApp message sent successfully to ${invoice.Customer.name}!` });

//   } catch (error) {
//     console.error("Failed to send WhatsApp message:", error);
//     res.status(500).json({ error: 'Failed to send WhatsApp message.' });
//   }
// });

// app.post('/api/invoices/:id/send-whatsapp', protect, async (req, res) => {
//   try {
//     const invoice = await Invoice.findByPk(req.params.id, { include: [Customer] });

//     if (!invoice) {
//       return res.status(404).json({ error: 'Invoice not found.' });
//     }

//     // This is the direct link we saved during creation. No conversion needed.
//     const directLink = invoice.pdfUrl; 

//     if (!directLink) {
//       return res.status(400).json({ error: 'Could not find a Google Drive link for this invoice. It may have failed to upload during creation.' });
//     }

//     await sendInvoiceWhatsApp(invoice.Customer.phone, invoice.invoiceNumber, directLink);

//     res.status(200).json({ message: `WhatsApp message sent successfully to ${invoice.Customer.name}!` });

//   } catch (error) {
//     console.error("Failed to send WhatsApp message:", error);
//     res.status(500).json({ error: 'Failed to send WhatsApp message.' });
//   }
// });


// // POST /api/invoices/:id/upload - Generates, uploads, and shares an invoice PDF
// app.post('/api/invoices/:id/upload', protect, async (req, res) => {
//   try {
//     const invoiceId = req.params.id;
//     const invoice = await Invoice.findByPk(invoiceId, {
//       include: [{ model: Customer }, { model: InvoiceItem, include: [Product] }]
//     });

//     if (!invoice) {
//       return res.status(404).json({ error: 'Invoice not found.' });
//     }

//     // 1. Regenerate the PDF buffer in memory
//     const invoiceDataForPdf = { invoice, customer: invoice.Customer, items: invoice.InvoiceItems };
//     const pdfBuffer = await generateInvoicePDF(invoiceDataForPdf);

//     // 2. Upload the buffer to Google Drive
//     const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;
//     const { webViewLink } = await uploadAndSharePdf(pdfBuffer, fileName);

//     // 3. Save the new public link to our database
//     await invoice.update({ pdfUrl: webViewLink });

//     res.status(200).json({
//       message: 'File uploaded and shared successfully!',
//       pdfUrl: webViewLink // Send the new URL back to the frontend
//     });

//   } catch (error) {
//     console.error("Failed during upload process:", error);
//     res.status(500).json({ error: 'Failed to upload invoice.' });
//   }
// });

// --- Add this route back to your server ---