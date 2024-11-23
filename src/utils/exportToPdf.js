import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (transactions, monthlyBudget) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add title
  doc.setFontSize(20);
  doc.text('Budget Report', pageWidth / 2, 20, { align: 'center' });

  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

  // Add budget overview
  doc.setFontSize(14);
  doc.text('Budget Overview', 14, 45);

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const remaining = monthlyBudget - totalSpent;

  doc.setFontSize(12);
  doc.text([
    `Monthly Budget: $${monthlyBudget.toLocaleString()}`,
    `Total Spent: $${totalSpent.toLocaleString()}`,
    `Total Income: $${totalIncome.toLocaleString()}`,
    `Remaining: $${remaining.toLocaleString()}`
  ], 14, 55);

  // Add category breakdown
  doc.setFontSize(14);
  doc.text('Category Breakdown', 14, 85);

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const categoryData = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => [
      category,
      `$${amount.toLocaleString()}`,
      `${((amount / totalSpent) * 100).toFixed(1)}%`
    ]);

  doc.autoTable({
    startY: 90,
    head: [['Category', 'Amount', 'Percentage']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 }
  });

  // Add recent transactions
  doc.setFontSize(14);
  doc.text('Recent Transactions', 14, doc.lastAutoTable.finalY + 20);

  const transactionData = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.type === 'expense' ? '-' : '+',
      `$${t.amount.toLocaleString()}`
    ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: transactionData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 }
  });

  // Save the PDF
  doc.save('budget-report.pdf');
};

export const exportToCSV = (transactions) => {
  // Convert transactions to CSV format
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const csvData = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.type,
      t.amount
    ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'budget-transactions.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};