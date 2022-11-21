"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playgroundTabs = exports.BTC_PRICE_QUERY = void 0;
exports.BTC_PRICE_QUERY = `query btcPriceList($range: PriceGraphRange!) {
  btcPriceList(range: $range) {
      timestamp
      price {
      base
      offset
      currencyUnit
      formattedAmount
    }
  }
}`;
exports.playgroundTabs = {
    default: {
        query: exports.BTC_PRICE_QUERY,
        name: "btcPriceList (Sample Query)",
        variables: JSON.stringify({ range: "ONE_DAY" }),
    },
};
//# sourceMappingURL=playground.js.map