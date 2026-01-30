// Formatting helpers for numbers and dates

function formatNumber(n, decimals = 1) {
  return n == null
    ? "-"
    : n.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
}

function formatPercent(n, decimals = 1) {
  return n == null
    ? "-"
    : (n * 100).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + "%";
}

function formatDateYM(ym) {
  // Expects 'YYYY-MM', returns 'Jan 2025'
  const [year, month] = ym.split("-");
  const date = new Date(year, parseInt(month, 10) - 1);
  return date.toLocaleString("en-ZA", { month: "short", year: "numeric" });
}

module.exports = {
  formatNumber,
  formatPercent,
  formatDateYM,
};
