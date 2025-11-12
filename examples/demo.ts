import FinancialDataIngestion from '../src/index';

async function runDemo() {
  console.log('🚀 Starting Financial Data Ingestion Demo\n');

  const app = new FinancialDataIngestion('./demo-data.db');

  console.log('📊 Scheduling jobs...');
  app.scheduleJobs();

  console.log('⏳ Waiting for initial data collection (10 seconds)...\n');
  await sleep(10000);

  console.log('='.repeat(60));
  console.log('📈 MARKET DATA');
  console.log('='.repeat(60));
  const marketData = await app.getMarketData(5);
  marketData.forEach((item) => {
    const data = item.data as any;
    const changeSymbol = data.change >= 0 ? '▲' : '▼';
    const changeColor = data.change >= 0 ? '🟢' : '🔴';
    console.log(`\n${changeColor} ${data.symbol}`);
    console.log(`   Price: $${data.price.toFixed(2)}`);
    console.log(`   Change: ${changeSymbol} ${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)`);
    console.log(`   Volume: ${data.volume?.toLocaleString() || 'N/A'}`);
    console.log(`   Source: ${item.source}`);
    console.log(`   Time: ${new Date(item.timestamp).toLocaleString()}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📰 NEWS DATA');
  console.log('='.repeat(60));
  const newsData = await app.getNewsData(5);
  newsData.forEach((item, index) => {
    const data = item.data as any;
    console.log(`\n${index + 1}. ${data.title}`);
    if (data.summary) {
      console.log(`   ${data.summary.substring(0, 100)}...`);
    }
    console.log(`   🔗 ${data.url}`);
    console.log(`   📅 ${new Date(data.publishedAt).toLocaleString()}`);
    console.log(`   📡 Source: ${item.source}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('⚙️  JOB RESULTS');
  console.log('='.repeat(60));
  const jobResults = await app.getJobResults(undefined, 10);
  jobResults.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    console.log(`\n${status} Job: ${result.jobId}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Items: ${result.data?.length || 0}`);
    console.log(`   Time: ${new Date(result.timestamp).toLocaleString()}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 STATISTICS');
  console.log('='.repeat(60));
  const allData = await app.getAllData(1000);
  const marketCount = allData.filter((d) => d.type === 'market').length;
  const newsCount = allData.filter((d) => d.type === 'news').length;
  console.log(`\nTotal Data Points: ${allData.length}`);
  console.log(`Market Data: ${marketCount}`);
  console.log(`News Items: ${newsCount}`);
  console.log(`Scheduled Jobs: ${app.getScheduler().getScheduledJobs().join(', ')}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Demo Complete!');
  console.log('='.repeat(60));
  console.log('\n💡 Tip: The jobs will continue running in the background.');
  console.log('Press Ctrl+C to stop the application.\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runDemo().catch((error) => {
  console.error('Error running demo:', error);
  process.exit(1);
});
