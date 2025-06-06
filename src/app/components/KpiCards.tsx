interface KpiCardsProps {
  salesData: any[];
  funnelData: any[];
}

export default function KpiCards({ salesData, funnelData }: KpiCardsProps) {
  // Debug output
  console.log("KpiCards received sales data length:", salesData.length);
  if (salesData.length > 0) {
    console.log("Sample record:", salesData[0]);
  }
  
  // Calculate KPI metrics
  const totalFinancedApplications = salesData.length;
  
  const totalAmountFinanced = salesData.reduce(
    (sum, item) => {
      const amount = Number(item.Principal_Amount) || 0;
      if (isNaN(amount)) {
        console.warn("Found NaN Principal_Amount:", item);
        return sum;
      }
      return sum + amount;
    }, 
    0
  );
  
  const averageLoanValue = totalFinancedApplications > 0 
    ? totalAmountFinanced / totalFinancedApplications 
    : 0;
    
  const totalCompletedPurchases = funnelData.reduce(
    (sum, item) => sum + (Number(item.Completed_Purchases) || 0), 
    0
  );
  
  // Find the latest date and calculate total sales for that day
  const getLatestDateAndSales = () => {
    if (salesData.length === 0) return { date: '', totalSales: 0 };
    
    const dates = salesData
      .filter(item => item.Financed_Date)
      .map(item => String(item.Financed_Date));
    
    if (dates.length === 0) return { date: '', totalSales: 0 };
    
    // Log unique dates for debugging
    const uniqueDates = [...new Set(dates)];
    console.log(`Found ${uniqueDates.length} unique dates in data`);
    
    // Sort dates in descending order as strings (YYYY-MM-DD format sorts correctly)
    const latestDate = dates.sort((a, b) => b.localeCompare(a))[0];
    
    // Calculate total sales for the latest date
    const latestDaySales = salesData
      .filter(item => String(item.Financed_Date) === latestDate)
      .reduce((sum, item) => sum + (Number(item.Principal_Amount) || 0), 0);
    
    console.log(`Latest date: ${latestDate}, sales: ${latestDaySales}`);
    
    return { date: latestDate, totalSales: latestDaySales };
  };
  
  const { date: latestDate, totalSales: latestDaySales } = getLatestDateAndSales();
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No data';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <KpiCard 
        title="Total Applications" 
        value={totalFinancedApplications.toLocaleString()} 
        source="Daily_Sales_Dump.csv"
        description=""
      />
      
      <KpiCard 
        title="Total Amount Financed" 
        value={`P ${totalAmountFinanced.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`}
        source="Daily_Sales_Dump.csv"
        description="Sum of Principal_Amount"
      />
      
      <KpiCard 
        title="Financing Approval" 
        value={`P ${averageLoanValue.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`}
        source="Daily_Sales_Dump.csv"
        description="Average of Principal_Amount"
      />
      
      <KpiCard 
        title="Latest Day Sales" 
        value={`P ${latestDaySales.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`}
        source="Daily_Sales_Dump.csv"
        description={`Total sales on ${formatDate(latestDate)}`}
      />
      <KpiCard 
        title="Total Phones" 
        value={salesData.filter(item => (item.Device_Category || '').toLowerCase() === 'phone').length.toLocaleString()} 
        source="Daily_Sales_Dump.csv"
        description=""
      />
      <KpiCard 
        title="Total Tablets" 
        value={salesData.filter(item => (item.Device_Category || '').toLowerCase() === 'tablet').length.toLocaleString()} 
        source="Daily_Sales_Dump.csv"
        description=""
      />
      <KpiCard 
        title="With Trade-In" 
        value={salesData.filter(item => Number(item.TradeIn) > 1).length.toLocaleString()} 
        source="Daily_Sales_Dump.csv"
        description=""
      />
      <KpiCard 
        title="Without Trade-In" 
        value={(salesData.length - salesData.filter(item => Number(item.TradeIn) > 1).length).toLocaleString()} 
        source="Daily_Sales_Dump.csv"
        description=""
      />
      <KpiCard 
        title="With Care Plus" 
        value={salesData.filter(item => Number(item.Careplus_Price) > 1).length.toLocaleString()} 
        source="Daily_Sales_Dump.csv"
        description=""
      />
      <KpiCard 
        title="Without Care Plus" 
        value={(salesData.length - salesData.filter(item => Number(item.Careplus_Price) > 1).length).toLocaleString()} 
        source="Daily_Sales_Dump.csv"
        description=""
      />
    </>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  source: string;
  description: string;
}

function KpiCard({ title, value, source, description }: KpiCardProps) {
  return (
    <div className="stat-card flex flex-col justify-between h-full min-h-[120px] p-4">
      <div className="flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-700 break-words flex-shrink-0">{title}</h3>
        <p className="stat-value text-2xl font-bold text-samsung-blue break-words flex-grow">{value}</p>
      </div>
      <div className="mt-auto flex flex-col">
        <div className="text-xs text-gray-500 mt-2 break-words">
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}
