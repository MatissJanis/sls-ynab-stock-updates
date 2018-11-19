const yahooFinance = require('yahoo-finance');
const ynab = require('ynab');

module.exports.run = async (event, context, callback) => {
  const ynabAPI = new ynab.API(process.env.YNAB_API_TOKEN);
  const automaticApproval = process.env.AUTOMATIC_APPROVAL === true || process.env.AUTOMATIC_APPROVAL === 'true';
  const transactions = [];

  // Retrieve all the budgets
  const budgetsResponse = await ynabAPI.budgets.getBudgets();
  const budgets = budgetsResponse.data.budgets;

  for (const budget of budgets) {
    // Retrieve accounts of budgets
    const accountsResponse = await ynabAPI.accounts.getAccounts(budget.id);
    const accounts = accountsResponse.data.accounts;

    // Filter out only the configured investment accounts
    const investmentAccounts = accounts.filter((account) => /^INVESTMENTS:/i.test(account.note || ''));

    for (const account of investmentAccounts) {
      // Convert the investment configuration string to a nice object
      const investments = account.note.replace(/^INVESTMENTS:/i, '').split(',').map((row) => {
        const parts = row.trim().match(/^(.*)[\s\t]+([0-9]+)$/);

        return {
          symbol: parts[1],
          amount: parseInt(parts[2], 10),
        };
      });

      // Retrieve prices of all stock symbols
      const prices = await yahooFinance.quote({
        symbols: investments.map(({ symbol }) => symbol),
        modules: ['price'],
      });

      // Calculate the total price of the portfolio
      const totalPrice = investments.map((investment) =>
        prices[investment.symbol].price.regularMarketPrice * investment.amount,
      ).reduce((a, b) => a + b, 0);

      // Calculate the diff from the current account value
      const diffPrice = parseInt(totalPrice * 1000, 10) - account.balance;

      // Do not create a transaction if the diff is 0
      if (diffPrice === 0) {
        continue;
      }

      // Add a new transaction to update the account value
      const transaction = await ynabAPI.transactions.createTransaction(budget.id, {
        transaction: {
          account_id: account.id,
          amount: diffPrice,
          date: (new Date).toISOString().substr(0, 10),
          memo: 'Automatic investment account update',
          approved: automaticApproval,
        },
      });

      transactions.push(transaction);
    }
  }

  callback(null, `Created ${transactions.length} transactions.`);
}
