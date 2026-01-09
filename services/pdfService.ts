
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from '../types';

export const generatePDF = (products: Product[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(200, 0, 0);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 0);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PEX - RELATÓRIO DE VALIDADE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(255, 165, 0);
  doc.text(`GERADO EM: ${new Date().toLocaleString('pt-BR')}`, 105, 30, { align: 'center' });

  const tableRows = products.map(p => [
    p.barcode,
    p.name.toUpperCase(),
    p.quantity.toString(),
    new Date(p.expiryDate).toLocaleDateString('pt-BR'),
    p.daysToExpiry.toString(),
    p.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['CÓDIGO', 'PRODUTO', 'QTD', 'VALIDADE', 'DIAS', 'STATUS']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [150, 0, 0], textColor: [255, 255, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 5) {
        const status = data.cell.raw as string;
        if (status.includes('VENCIDO')) {
          doc.setTextColor(255, 0, 0);
          doc.setFont('helvetica', 'bold');
        } else if (status.includes('CRÍTICO')) {
          doc.setTextColor(255, 140, 0);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(0, 128, 0);
        }
      }
    },
    styles: { fontSize: 8 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de itens monitorados: ${products.length}`, 14, finalY);

  window.open(doc.output('bloburl'), '_blank');
};
