// Sample data generator for testing the dashboard

interface SalesDataItem {
  Loan_Number: string;
  Principal_Amount: number;
  Financed_Date: string;
  City: string;
  Financer: string;
  Channel_Name: string;
  Store_Name: string;
  Purchased_Model_Name: string;
}

interface FunnelDataItem {
  Store_Name: string;
  Channel_Name: string;
  Purchases_Started: number;
  Info_Submitted: number;
  KYC_Completed: number;
  Agreement_Signed: number;
  Completed_Purchases: number;
}

// Sample city names
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

// Sample financers
const financers = ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'Bajaj Finance', 'Tata Capital'];

// Sample store names
const storeNames = ['Store Alpha', 'Store Beta', 'Store Gamma', 'Store Delta', 'Store Epsilon'];

// Sample channel names
const channelNames = ['Online', 'Retail', 'Partner', 'Direct Sales'];

// Sample model names
const modelNames = [
  'Premium X1', 'Premium X2', 'Premium X3', 
  'Standard Y1', 'Standard Y2', 'Standard Y3',
  'Budget Z1', 'Budget Z2', 'Budget Z3',
  'Ultra Pro Max', 'Ultra Lite', 'Ultra Basic'
];

// Generate a random number between min and max (inclusive)
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random date within a range
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Generate sample sales data
export const generateSampleSalesData = (count: number = 100): SalesDataItem[] => {
  const data: SalesDataItem[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 3); // 3 months of data
  
  for (let i = 0; i < count; i++) {
    data.push({
      Loan_Number: `LOAN${100000 + i}`,
      Principal_Amount: randomInt(10000, 500000),
      Financed_Date: randomDate(startDate, endDate),
      City: cities[randomInt(0, cities.length - 1)],
      Financer: financers[randomInt(0, financers.length - 1)],
      Channel_Name: channelNames[randomInt(0, channelNames.length - 1)],
      Store_Name: storeNames[randomInt(0, storeNames.length - 1)],
      Purchased_Model_Name: modelNames[randomInt(0, modelNames.length - 1)],
    });
  }
  
  return data;
};

// Generate sample funnel data
export const generateSampleFunnelData = (count: number = 15): FunnelDataItem[] => {
  const data: FunnelDataItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const store = i % 2 === 0 
      ? { Store_Name: storeNames[i % storeNames.length], Channel_Name: '' }
      : { Store_Name: '', Channel_Name: channelNames[i % channelNames.length] };
    
    const purchasesStarted = randomInt(80, 150);
    const infoSubmitted = randomInt(Math.floor(purchasesStarted * 0.7), purchasesStarted);
    const kycCompleted = randomInt(Math.floor(infoSubmitted * 0.7), infoSubmitted);
    const agreementSigned = randomInt(Math.floor(kycCompleted * 0.8), kycCompleted);
    const completedPurchases = randomInt(Math.floor(agreementSigned * 0.9), agreementSigned);
    
    data.push({
      ...store,
      Purchases_Started: purchasesStarted,
      Info_Submitted: infoSubmitted,
      KYC_Completed: kycCompleted,
      Agreement_Signed: agreementSigned,
      Completed_Purchases: completedPurchases,
    });
  }
  
  return data;
};
