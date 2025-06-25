const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const path = require('path');
const fs = require('fs');

// Create a new invoice
router.post('/', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const invoiceData = req.body;

		// Generate invoice number
		invoiceData.invoiceNumber = await Invoice.generateInvoiceNumber();

		// Ensure dueAmount is set
		if (!invoiceData.dueAmount) {
			invoiceData.dueAmount = invoiceData.totalAmount;
		}

		// Add invoicer information
		invoiceData.invoicer = {
			name: req.user.name,
			userId: req.user._id,
		};

		// Add initial update history entry
		invoiceData.updateHistory = [
			{
				updaterName: req.user.name,
				updaterId: req.user._id,
				updateNotes: 'Invoice created',
				previousStatus: null,
				newStatus: 'draft',
			},
		];

		const invoice = new Invoice(invoiceData);
		await invoice.save();

		res.status(201).json({
			success: true,
			message: 'Invoice created successfully',
			invoice,
		});
	} catch (error) {
		console.error('Invoice creation error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create invoice',
			error: error.message,
		});
	}
});

// Get all invoices with filtering, sorting, and pagination
router.get('/', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			search = '',
			status,
			startDate,
			endDate,
			sortBy = 'createdAt',
			sortOrder = 'desc',
		} = req.query;

		const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

		// Build filter
		const filter = {};

		if (search) {
			filter.$or = [
				{ 'customer.name': { $regex: search, $options: 'i' } },
				{ 'customer.email': { $regex: search, $options: 'i' } },
				{ invoiceNumber: { $regex: search, $options: 'i' } },
			];
		}

		if (status && status !== 'all') {
			filter.status = status;
		}

		if (startDate || endDate) {
			filter.issueDate = {};
			if (startDate) filter.issueDate.$gte = new Date(startDate);
			if (endDate) filter.issueDate.$lte = new Date(endDate);
		}

		// Build sort
		const sort = {};
		sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

		// Execute query with pagination
		const invoices = await Invoice.find(filter).sort(sort).skip(skip).limit(Number.parseInt(limit));

		const total = await Invoice.countDocuments(filter);

		res.status(200).json({
			success: true,
			invoices,
			pagination: {
				total,
				currentPage: Number.parseInt(page),
				totalPages: Math.ceil(total / Number.parseInt(limit)),
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch invoices',
			error: error.message,
		});
	}
});

// Get a single invoice by ID
router.get('/:id', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const invoice = await Invoice.findById(req.params.id);

		if (!invoice) {
			return res.status(404).json({
				success: false,
				message: 'Invoice not found',
			});
		}

		res.status(200).json({
			success: true,
			invoice,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to fetch invoice',
			error: error.message,
		});
	}
});

// Record payment for an invoice
router.post('/:id/payment', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { amount, notes } = req.body;

		if (!amount || Number.parseFloat(amount) <= 0) {
			return res.status(400).json({
				success: false,
				message: 'Invalid payment amount',
			});
		}

		const invoice = await Invoice.findById(req.params.id);

		if (!invoice) {
			return res.status(404).json({
				success: false,
				message: 'Invoice not found',
			});
		}

		if (['cancelled', 'void', 'paid'].includes(invoice.status)) {
			return res.status(400).json({
				success: false,
				message: `Cannot record payment for ${invoice.status} invoice`,
			});
		}

		if (Number.parseFloat(amount) > invoice.dueAmount) {
			return res.status(400).json({
				success: false,
				message: 'Payment amount cannot exceed due amount',
			});
		}

		const previousStatus = invoice.status;
		const previousPaidAmount = invoice.paidAmount;

		// Update paid amount
		invoice.paidAmount += Number.parseFloat(amount);

		// Add to update history
		invoice.updateHistory.push({
			updaterName: req.user.name,
			updaterId: req.user._id,
			updateNotes: notes || 'Payment recorded',
			previousStatus,
			newStatus: invoice.status, // This will be updated by the pre-save hook
			previousPaidAmount,
			newPaidAmount: invoice.paidAmount,
		});

		await invoice.save();

		res.status(200).json({
			success: true,
			message: 'Payment recorded successfully',
			invoice,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to record payment',
			error: error.message,
		});
	}
});

// Cancel an invoice
router.post('/:id/cancel', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { notes } = req.body;

		const invoice = await Invoice.findById(req.params.id);

		if (!invoice) {
			return res.status(404).json({
				success: false,
				message: 'Invoice not found',
			});
		}

		if (['cancelled', 'void', 'paid'].includes(invoice.status)) {
			return res.status(400).json({
				success: false,
				message: `Cannot cancel ${invoice.status} invoice`,
			});
		}

		const previousStatus = invoice.status;

		// Update status
		invoice.status = 'cancelled';

		// Add to update history
		invoice.updateHistory.push({
			updaterName: req.user.name,
			updaterId: req.user._id,
			updateNotes: notes || 'Invoice cancelled',
			previousStatus,
			newStatus: 'cancelled',
		});

		await invoice.save();

		res.status(200).json({
			success: true,
			message: 'Invoice cancelled successfully',
			invoice,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to cancel invoice',
			error: error.message,
		});
	}
});

// Delete an invoice
router.delete('/:id', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const invoice = await Invoice.findById(req.params.id);

		if (!invoice) {
			return res.status(404).json({
				success: false,
				message: 'Invoice not found',
			});
		}

		await Invoice.findByIdAndDelete(req.params.id);

		res.status(200).json({
			success: true,
			message: 'Invoice deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete invoice',
			error: error.message,
		});
	}
});

// Generate PDF for an invoice
// NOTE: This is V1.0 and working with broken layout
router.get('/:id/pdf', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const invoice = await Invoice.findById(req.params.id);

		if (!invoice) {
			return res.status(404).json({
				success: false,
				message: 'Invoice not found',
			});
		}

		// Create a PDF document with better margins
		const doc = new PDFDocument({
			margin: 50,
			size: 'A4',
			bufferPages: true,
		});

		// Set response headers for file download
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

		// Pipe the PDF to the response
		doc.pipe(res);

		// Define page dimensions and positions
		const pageWidth = doc.page.width;
		const contentWidth = pageWidth - 100; // Accounting for margins

		// Add company logo and info
		const logoPath = path.join(__dirname, '../assets/logo.png'); // Update this path as needed
		if (fs.existsSync(logoPath)) {
			doc.image(logoPath, 50, 45, { width: 70, align: 'left' });
		}

		doc.fontSize(20).text('Inspite Travels Ltd.', { align: 'right' });
		doc.fontSize(10).text('Mirpur 1', { align: 'right' });
		doc.text('Dhaka, Bangladesh', { align: 'right' });
		doc.text('Phone: +880 1318 446398', { align: 'right' });
		doc.text('Email: info@inspire.com', { align: 'right' });

		doc.moveDown();

		// Add invoice header
		doc.fontSize(20).text('INVOICE', { align: 'left' });
		doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'left' });
		doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, { align: 'left' });
		doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'left' });
		doc.text(`Status: ${invoice.status.toUpperCase()}`, { align: 'left' });

		doc.moveDown();

		// Add customer info
		doc.fontSize(12).text('Bill To:', { align: 'left' });
		doc.fontSize(10).text(`Name: ${invoice.customer.name}`, { align: 'left' });
		doc.text(`Email: ${invoice.customer.email}`, { align: 'left' });
		doc.text(`Phone: ${invoice.customer.phone}`, { align: 'left' });
		if (invoice.customer.address) {
			doc.text(`Address: ${invoice.customer.address}`, { align: 'left' });
		}

		doc.moveDown();

		// Add invoice items - improved table layout
		const tableTop = doc.y + 20;

		// Define column widths and positions
		const itemWidth = contentWidth * 0.25;
		const descWidth = contentWidth * 0.25;
		const qtyWidth = contentWidth * 0.1;
		const priceWidth = contentWidth * 0.13;
		const discountWidth = contentWidth * 0.1;
		const taxWidth = contentWidth * 0.07;
		const totalWidth = contentWidth * 0.1;

		// Calculate column positions
		const itemX = 50;
		const descX = itemX + itemWidth;
		const qtyX = descX + descWidth;
		const priceX = qtyX + qtyWidth;
		const discountX = priceX + priceWidth;
		const taxX = discountX + discountWidth;
		const totalX = taxX + taxWidth;

		// Add table headers
		doc
			.fontSize(10)
			.font('Helvetica-Bold')
			.text('Item', itemX, tableTop, { width: itemWidth })
			.text('Description', descX, tableTop, { width: descWidth })
			.text('Qty', qtyX, tableTop, { width: qtyWidth, align: 'right' })
			.text('Price', priceX, tableTop, { width: priceWidth, align: 'right' })
			.text('Discount', discountX, tableTop, { width: discountWidth, align: 'right' })
			.text('Tax', taxX, tableTop, { width: taxWidth, align: 'right' })
			.text('Total', totalX, tableTop, { width: totalWidth, align: 'right' })
			.font('Helvetica');

		// Add horizontal line
		doc
			.moveTo(50, tableTop + 15)
			.lineTo(pageWidth - 50, tableTop + 15)
			.stroke();

		// Add table rows
		let tableRow = tableTop + 25;

		invoice.items.forEach((item) => {
			// Check if we need a new page
			if (tableRow + 20 > doc.page.height - 100) {
				doc.addPage();
				tableRow = 50; // Reset to top of new page
			}

			doc
				.fontSize(9)
				.text(item.name, itemX, tableRow, { width: itemWidth })
				.text(item.description || '', descX, tableRow, { width: descWidth })
				.text(item.quantity.toString(), qtyX, tableRow, { width: qtyWidth, align: 'right' })
				.text(`${invoice.currency} ${item.unitPrice.toFixed(2)}`, priceX, tableRow, {
					width: priceWidth,
					align: 'right',
				})
				.text(item.discount > 0 ? `${item.discount}%` : '-', discountX, tableRow, {
					width: discountWidth,
					align: 'right',
				})
				.text(item.tax > 0 ? `${item.tax}%` : '-', taxX, tableRow, { width: taxWidth, align: 'right' })
				.text(`${invoice.currency} ${item.total.toFixed(2)}`, totalX, tableRow, { width: totalWidth, align: 'right' });

			tableRow += 20;
		});

		// Add horizontal line
		doc
			.moveTo(50, tableRow)
			.lineTo(pageWidth - 50, tableRow)
			.stroke();

		tableRow += 20;

		// Add totals with better layout
		const totalsX = pageWidth - 260; // Position for totals section
		const totalsLabelWidth = 120;
		const totalsValueWidth = 80;

		// Helper function for adding total rows
		const addTotalRow = (label, value, isBold = false) => {
			if (tableRow + 15 > doc.page.height - 100) {
				doc.addPage();
				tableRow = 50; // Reset to top of new page
			}

			if (isBold) {
				doc.font('Helvetica-Bold');
			} else {
				doc.font('Helvetica');
			}

			doc
				.fontSize(10)
				.text(label, totalsX, tableRow, { width: totalsLabelWidth, align: 'left' })
				.text(value, totalsX + totalsLabelWidth + 10, tableRow, { width: totalsValueWidth, align: 'right' });

			tableRow += 15;
		};

		// Add totals
		addTotalRow('Subtotal:', `${invoice.currency} ${invoice.subtotal.toFixed(2)}`);
		addTotalRow('Item Discounts:', `${invoice.currency} ${invoice.totalDiscount.toFixed(2)}`);

		// Additional discount if present
		if (invoice.additionalDiscount > 0) {
			const additionalDiscountAmount = (invoice.subtotal - invoice.totalDiscount) * (invoice.additionalDiscount / 100);
			addTotalRow(
				`Additional Discount (${invoice.additionalDiscount}%):`,
				`${invoice.currency} ${additionalDiscountAmount.toFixed(2)}`
			);
		}

		addTotalRow('Tax:', `${invoice.currency} ${invoice.totalTax.toFixed(2)}`);

		// Add horizontal line for total
		doc
			.moveTo(totalsX, tableRow)
			.lineTo(pageWidth - 50, tableRow)
			.stroke();
		tableRow += 10;

		// Total amount
		addTotalRow('Total:', `${invoice.currency} ${invoice.totalAmount.toFixed(2)}`, true);

		// Payment info
		addTotalRow('Amount Paid:', `${invoice.currency} ${invoice.paidAmount.toFixed(2)}`);

		// Add horizontal line for balance due
		doc
			.moveTo(totalsX, tableRow)
			.lineTo(pageWidth - 50, tableRow)
			.stroke();
		tableRow += 10;

		// Balance due
		addTotalRow('Balance Due:', `${invoice.currency} ${invoice.dueAmount.toFixed(2)}`, true);

		tableRow += 20;

		// Add notes and terms
		if (invoice.notes || invoice.terms) {
			// Check if we need a new page
			if (tableRow + 60 > doc.page.height - 100) {
				doc.addPage();
				tableRow = 50; // Reset to top of new page
			}

			if (invoice.notes) {
				doc.fontSize(12).font('Helvetica-Bold').text('Notes:', 50, tableRow);
				doc
					.font('Helvetica')
					.fontSize(10)
					.text(invoice.notes, 50, tableRow + 15, { width: contentWidth });
				tableRow += 40;
			}

			if (invoice.terms) {
				// Check if we need a new page
				if (tableRow + 60 > doc.page.height - 100) {
					doc.addPage();
					tableRow = 50; // Reset to top of new page
				}

				doc.fontSize(12).font('Helvetica-Bold').text('Terms and Conditions:', 50, tableRow);
				doc
					.font('Helvetica')
					.fontSize(10)
					.text(invoice.terms, 50, tableRow + 15, { width: contentWidth });
			}
		}

		// Add page numbers
		const pageCount = doc.bufferedPageCount;
		for (let i = 0; i < pageCount; i++) {
			doc.switchToPage(i);
			doc
				.fontSize(8)
				.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'center', width: contentWidth });
		}

		// Finalize the PDF
		doc.end();
	} catch (error) {
		console.error('PDF generation error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to generate PDF',
			error: error.message,
		});
	}
});

// Export invoices as CSV
router.get('/export/csv', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { status, startDate, endDate } = req.query;

		// Build filter
		const filter = {};

		if (status && status !== 'all') {
			filter.status = status;
		}

		if (startDate || endDate) {
			filter.issueDate = {};
			if (startDate) filter.issueDate.$gte = new Date(startDate);
			if (endDate) filter.issueDate.$lte = new Date(endDate);
		}

		const invoices = await Invoice.find(filter).sort({ createdAt: -1 });

		// Prepare data for CSV
		const invoicesData = invoices.map((invoice) => ({
			'Invoice Number': invoice.invoiceNumber,
			'Customer Name': invoice.customer.name,
			'Customer Email': invoice.customer.email,
			'Customer Phone': invoice.customer.phone,
			'Issue Date': new Date(invoice.issueDate).toLocaleDateString(),
			'Due Date': new Date(invoice.dueDate).toLocaleDateString(),
			Status: invoice.status,
			Subtotal: invoice.subtotal,
			'Item Discounts': invoice.totalDiscount,
			'Additional Discount': invoice.additionalDiscount ? `${invoice.additionalDiscount}%` : '0%',
			Tax: invoice.totalTax,
			'Total Amount': invoice.totalAmount,
			'Paid Amount': invoice.paidAmount,
			'Due Amount': invoice.dueAmount,
			Currency: invoice.currency,
			'Created By': invoice.invoicer.name,
			'Created At': new Date(invoice.createdAt).toLocaleString(),
		}));

		// Generate CSV
		const fields = Object.keys(invoicesData[0] || {});
		const parser = new Parser({ fields });
		const csv = parser.parse(invoicesData);

		// Set response headers for file download
		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');

		// Send CSV
		res.status(200).send(csv);
	} catch (error) {
		console.error('CSV export error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to export invoices',
			error: error.message,
		});
	}
});

// Get invoice analytics
router.get('/analytics/summary', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		// Get total invoices count
		const totalInvoices = await Invoice.countDocuments();

		// Get total revenue (sum of all paid amounts)
		const revenueData = await Invoice.aggregate([
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: '$paidAmount' },
					totalDue: { $sum: '$dueAmount' },
					totalAmount: { $sum: '$totalAmount' },
				},
			},
		]);

		const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
		const totalDue = revenueData.length > 0 ? revenueData[0].totalDue : 0;
		const totalAmount = revenueData.length > 0 ? revenueData[0].totalAmount : 0;

		// Get invoice status counts
		const statusCounts = await Invoice.aggregate([
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]);

		// Format status counts
		const formattedStatusCounts = {};
		statusCounts.forEach((status) => {
			formattedStatusCounts[status._id] = status.count;
		});

		// Get recent invoices
		const recentInvoices = await Invoice.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.select('invoiceNumber customer.name totalAmount paidAmount status createdAt');

		res.status(200).json({
			success: true,
			data: {
				totalInvoices,
				totalRevenue,
				totalDue,
				totalAmount,
				collectionRate: totalAmount > 0 ? (totalRevenue / totalAmount) * 100 : 0,
				statusCounts: formattedStatusCounts,
				recentInvoices,
			},
		});
	} catch (error) {
		console.error('Analytics error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch analytics data',
			error: error.message,
		});
	}
});

// Get monthly revenue data
router.get('/analytics/monthly-revenue', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const { year = new Date().getFullYear() } = req.query;

		// Get monthly revenue data for the specified year
		const monthlyRevenue = await Invoice.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`),
					},
				},
			},
			{
				$group: {
					_id: { $month: '$createdAt' },
					totalAmount: { $sum: '$totalAmount' },
					paidAmount: { $sum: '$paidAmount' },
					count: { $sum: 1 },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		// Format the data for all months (including months with no invoices)
		const formattedData = Array(12)
			.fill(0)
			.map((_, index) => {
				const monthData = monthlyRevenue.find((item) => item._id === index + 1);
				return {
					month: index + 1,
					monthName: new Date(0, index).toLocaleString('default', { month: 'long' }),
					totalAmount: monthData ? monthData.totalAmount : 0,
					paidAmount: monthData ? monthData.paidAmount : 0,
					count: monthData ? monthData.count : 0,
				};
			});

		res.status(200).json({
			success: true,
			data: formattedData,
			year,
		});
	} catch (error) {
		console.error('Monthly revenue analytics error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch monthly revenue data',
			error: error.message,
		});
	}
});

// Get top customers
router.get('/analytics/top-customers', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const { limit = 5 } = req.query;

		// Get top customers by total amount
		const topCustomers = await Invoice.aggregate([
			{
				$group: {
					_id: '$customer.email',
					customerName: { $first: '$customer.name' },
					customerEmail: { $first: '$customer.email' },
					customerPhone: { $first: '$customer.phone' },
					totalSpent: { $sum: '$totalAmount' },
					paidAmount: { $sum: '$paidAmount' },
					invoiceCount: { $sum: 1 },
				},
			},
			{
				$sort: { totalSpent: -1 },
			},
			{
				$limit: Number(limit),
			},
		]);

		res.status(200).json({
			success: true,
			data: topCustomers,
		});
	} catch (error) {
		console.error('Top customers analytics error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch top customers data',
			error: error.message,
		});
	}
});

module.exports = router;
