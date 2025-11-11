import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReceiptData } from '@/api/models/receiptModel';
import { numberToWords } from '@/utils/numberToWords';
import logo from '@/assets/ramya constructions logo.png';


interface ReceiptDocumentProps {
  data: ReceiptData;
  branch?: string;
  printedOn?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    fontSize: 10,
    color: '#000000',
  },
  header: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    width: 80,
  },
  logo: {
    width: 140,
    height: 70,
    marginTop: 5,
  },
  companySection: {
    flex: 1,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#25408e',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.3,
  },
  cin: {
    fontSize: 8,
    color: '#666',
    marginTop: 3,
  },
  metaSection: {
    width: 120,
    fontSize: 8,
    color: '#666',
    lineHeight: 1.4,
  },
  printedOn: {
    marginBottom: 4,
    textAlign: 'right',
  },
  branch: {
    fontWeight: 'bold',
    color: '#25408e',
    textAlign: 'right',
  },
  headerLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 15,
    marginTop: 5,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
    color: '#26408A',
    textDecoration: 'underline',
    letterSpacing: 1,
  },
  contentBox: {
    borderWidth: 1,
    borderColor: '#26408A',
    padding: 15,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#666',
    marginTop: 6,
  },
  metaLabel: {
    fontWeight: 'bold',
    color: '#26408A',
  },
  metaText: {
    fontSize: 8,
    color: '#26408A',
  },
  receivedFrom: {
    fontSize: 11,
    marginVertical: 12,
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
  table: {
    width: '100%',
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#f0f4ff',
    borderBottomWidth: 2,
    borderColor: '#26408A',
  },
  tableCell: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 10,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#26408A',
  },
  snoCell: {
    width: '10%',
    borderRightWidth: 1,
    borderColor: '#bfbfbf',
  },
  particularCell: {
    width: '60%',
    borderRightWidth: 1,
    borderColor: '#bfbfbf',
  },
  amountCell: {
    width: '30%',
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
  },
  footerSection: {
    marginTop: 20,
  },
  footerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    fontSize: 11,
    paddingHorizontal: 5,
  },
  footerLabel: {
    width: '28%',
    fontWeight: 'bold',
    color: '#26408A',
  },
  footerValue: {
    width: '72%',
  },
  gstRow: {
    marginTop: 8,
    paddingHorizontal: 5,
  },
  gstText: {
    fontSize: 10,
    color: '#26408A',
  },
  disclaimer: {
    fontSize: 9,
    marginTop: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
  signatureSection: {
    marginTop: 35,
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: 150,
    textAlign: 'center',
    fontSize: 10,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 4,
    width: '100%',
  },
  generatedBy: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
});

// Robust date formatter that handles multiple formats
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // If already in DD/MM/YYYY format
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }
  }
  
  // If in YYYY-MM-DD format
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }
  
  // Fallback for date objects or timestamps
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    // Ignore
  }
  
  return dateString;
};

const userDetails = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
const userName = userDetails.username || "--------";

// Indian currency formatter with commas
const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  
  const numStr = amount.toFixed(2);
  const [intPart, decPart] = numStr.split('.');
  
  // Indian number formatting: 2,00,000
  let formattedInt = '';
  if (intPart.length <= 3) {
    formattedInt = intPart;
  } else {
    const lastThree = intPart.substring(intPart.length - 3);
    const rest = intPart.substring(0, intPart.length - 3);
    if (rest.length > 0) {
      formattedInt = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    } else {
      formattedInt = lastThree;
    }
  }
  
  // Use ₹ symbol (will appear as ¹ if font doesn't support it)
  return `₹${formattedInt}.${decPart}`;
};

const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({ data, branch = 'KAPIL HOMES-CRF-CO', printedOn }) => {
  // Defensive property access
  const paymentMethod = data.payment_method || {
    mode: 'UNKNOWN',
    group: '',
    details: {},
    payment_time: ''
  };

  const mode = paymentMethod.mode || 'UNKNOWN';
  const details = paymentMethod.details || {};
  const bankReference = data.references?.bank_reference || '';
  const investorId = data.property?.investor_id || '';
  const customerName = data.customer_info?.name || '';
  const amount = data.financials?.amount || 0;
  const transactionType = data.property?.transaction_type || '';

  const getTransactionTypeDisplay = () => {
    return transactionType.replace(/_/g, ' ').toUpperCase() || 'UNIT PAYMENT';
  };

  const getPaymentDisplay = () => {
    const parts: string[] = [];

    if (mode === 'upi') {
      parts.push(`Reference No : ${bankReference}`);
      if (paymentMethod.payment_time) {
        const paymentDate = formatDate(paymentMethod.payment_time.split('T')[0]);
        parts.push(`Date : ${paymentDate}`);
      }
      if (details.upi_id) {
        parts.push(`UPI ID : ${details.upi_id}`);
      }
    } else if (mode === 'card') {
      parts.push(`Reference No : ${bankReference}`);
      if (paymentMethod.payment_time) {
        const paymentDate = formatDate(paymentMethod.payment_time.split('T')[0]);
        parts.push(`Date : ${paymentDate}`);
      }
      if (details.card_network) {
        parts.push(`Network : ${details.card_network}`);
      }
      if (details.card_bank_name) {
        parts.push(`Bank : ${details.card_bank_name}`);
      }
    } else if (mode === 'net_banking') {
      parts.push(`Reference No : ${bankReference}`);
      if (paymentMethod.payment_time) {
        const paymentDate = formatDate(paymentMethod.payment_time.split('T')[0]);
        parts.push(`Date : ${paymentDate}`);
      }
      if (details.netbanking_bank_name) {
        parts.push(`Bank : ${details.netbanking_bank_name}`);
      }
    } else {
      return `BANK (${mode.toUpperCase()}, Reference No : ${bankReference})`;
    }

    return `BANK (${parts.join(', ')})`;
  };

  const receiptDate = formatDate(data.receipt_date);
  const printedDate = printedOn || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(/, /g, ' ').toUpperCase();

  const serviceTax = data.financials?.platform_fees?.service_tax || 0;
  const cgst = serviceTax / 2;
  const sgst = serviceTax / 2;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src={logo} />
          </View>

          <View style={styles.companySection}>
            <Text style={styles.companyName}>RAMYA CONSTRUCTIONS LIMITED</Text>
            <Text style={styles.companyAddress}>
              SY NO115/1, 15th Floor, Kapil Towers, Financial District,{'\n'}
              Nanakramguda, Rangareddy, Telangana - 500032
            </Text>
            <Text style={styles.cin}>CIN : U45200AP1992PLC014532</Text>
          </View>
        </View>

        {/* This is the next line */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Printed On: {printedDate}</Text>
          <Text style={styles.metaText}>Branch: {branch}</Text>
        </View>
      </View>

        {/* Line below header */}
        <View style={styles.headerLine} />

        {/* Receipt Title */}
        <Text style={styles.receiptTitle}>Receipt</Text>

        {/* Content Box with Border */}
        <View style={styles.contentBox}>
          {/* Meta Information */}
          <View style={styles.metaRow}>
            <Text><Text style={styles.metaLabel}>Receipt No:</Text> {data.receipt_id}</Text>
            <Text><Text style={styles.metaLabel}>Booking ID:</Text> {investorId}</Text>
            <Text><Text style={styles.metaLabel}>Date:</Text> {receiptDate}</Text>
          </View>

          {/* Received From */}
          <Text style={styles.receivedFrom}>
            Received With Thanks From Mr./Ms./M/s: <Text style={{ fontWeight: 'normal' }}>{customerName}</Text>
          </Text>

          {/* Items Table */}
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCell, styles.snoCell, styles.tableCellHeader]}>
                <Text>S.no</Text>
              </View>
              <View style={[styles.tableCell, styles.particularCell, styles.tableCellHeader]}>
                <Text>Particular</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell, styles.tableCellHeader]}>
                <Text>Amount</Text>
              </View>
            </View>
            
            {/* Data Row */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.snoCell]}>
                <Text>1</Text>
              </View>
              <View style={[styles.tableCell, styles.particularCell]}>
                <Text>{getTransactionTypeDisplay()}</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{formatCurrency(amount)}</Text>
              </View>
            </View>
            
            {/* Total Row */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <View style={[styles.tableCell, styles.snoCell]} />
              <View style={[styles.tableCell, styles.particularCell]}>
                <Text style={{ fontWeight: 'bold' }}>Total</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={{ fontWeight: 'bold' }}>
                  {formatCurrency(amount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Details */}
          <View style={styles.footerSection}>
            {/* Amount in Words */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Amount In Words:</Text>
              <Text style={styles.footerValue}>
                Rupees {numberToWords(Math.floor(amount))} Only
              </Text>
            </View>

            {/* Narration */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Narration:</Text>
              <Text style={styles.footerValue}>
                Being The Amount Received Towards {getTransactionTypeDisplay()}
              </Text>
            </View>

            {/* Mode of Receipt */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Mode of Receipt:</Text>
              <Text style={styles.footerValue}>
                {getPaymentDisplay()}
              </Text>
            </View>

            {/* GST Section */}
            {serviceTax > 0 && (
              <View style={styles.gstRow}>
                <Text style={styles.gstText}>
                  GST (Include) : Rs.{serviceTax.toFixed(0)}/-(CGST: {cgst.toFixed(2)}, SGST: {sgst.toFixed(2)})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This is an electronically generated receipt and does not require physical signature.
        </Text>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text>{userName}</Text>
            <Text style={styles.generatedBy}>(Generated By)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptDocument;