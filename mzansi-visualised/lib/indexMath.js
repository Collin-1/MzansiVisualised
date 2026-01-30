// Cost of Living Index Math Library
// All outputs are raw (not rounded)

function getNationalAverages(month, provinces) {
  const categories = Object.keys(month.values[provinces[0]]);
  const avgs = {};
  categories.forEach((cat) => {
    avgs[cat] =
      provinces.reduce((sum, prov) => sum + month.values[prov][cat], 0) /
      provinces.length;
  });
  return avgs;
}

function getRelativeIndexes(month, provinces) {
  const avgs = getNationalAverages(month, provinces);
  const rel = {};
  provinces.forEach((prov) => {
    rel[prov] = {};
    Object.keys(avgs).forEach((cat) => {
      rel[prov][cat] = month.values[prov][cat] / avgs[cat];
    });
  });
  return rel;
}

function getTotalIndex(rel, weights) {
  // rel: { food, housing, utilities, transport }
  // weights: { food, housing, utilities, transport, other }
  let total = 0;
  total += rel.food * weights.food;
  total += rel.housing * weights.housing;
  total += rel.utilities * weights.utilities;
  total += rel.transport * weights.transport;
  total += 1.0 * weights.other;
  return total * 100;
}

function getAllTotalIndexes(month, provinces, weights) {
  const rel = getRelativeIndexes(month, provinces);
  const totals = {};
  provinces.forEach((prov) => {
    totals[prov] = getTotalIndex(rel[prov], weights);
  });
  return totals;
}

function getMoMChange(months, provinces, weights) {
  if (months.length < 2) return null;
  const currTotals = getAllTotalIndexes(
    months[months.length - 1],
    provinces,
    weights,
  );
  const prevTotals = getAllTotalIndexes(
    months[months.length - 2],
    provinces,
    weights,
  );
  const currAvg =
    Object.values(currTotals).reduce((a, b) => a + b, 0) / provinces.length;
  const prevAvg =
    Object.values(prevTotals).reduce((a, b) => a + b, 0) / provinces.length;
  return (currAvg - prevAvg) / prevAvg;
}

module.exports = {
  getNationalAverages,
  getRelativeIndexes,
  getTotalIndex,
  getAllTotalIndexes,
  getMoMChange,
};
