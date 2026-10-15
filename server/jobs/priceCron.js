const cron = require('node-cron');
const priceService = require('../services/priceService');

const initPriceCron = () => {
  const intervalHours = parseInt(process.env.PRICE_UPDATE_INTERVAL_HOURS || '6', 10);
  // Default to every 6 hours: '0 */6 * * *'
  const cronExpression = `0 */${intervalHours} * * *`;

  console.log(`[Scheduled Jobs]: Initializing Price Update Cron (Runs every ${intervalHours} hours: "${cronExpression}")...`);

  cron.schedule(cronExpression, async () => {
    console.log(`[Scheduled Cron Triggered]: Initiating scheduled price refresh...`);
    try {
      await priceService.updateAllProductPrices(15);
    } catch (error) {
      console.error('[Scheduled Cron Failed]:', error.message);
    }
  });
};

module.exports = initPriceCron;
