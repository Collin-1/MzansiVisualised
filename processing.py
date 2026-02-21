import pandas as pd
import numpy as np
import os
import json

# Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))
STRICT_COVERAGE = False

# Load data
rent = pd.read_csv(os.path.join(script_dir, "data/raw/rent.csv"))
cpi = pd.read_csv(os.path.join(script_dir, "data/raw/cpi.csv"), sep=';')


# The province is in column index 4 (5th column)
# Values start from column index 9
value_cols = cpi.columns[9:]
id_vars = cpi.columns[:5]

# Melt the CPI data to long format
cpi_long = cpi.melt(id_vars=id_vars, value_vars=value_cols, var_name='Date', value_name='Value')

# Rename columns
cpi_long = cpi_long.rename(columns={cpi.columns[4]: 'Province'})

# Filter to provinces only (not totals), normalize names for matching
rent_provinces = set(rent['province'].str.replace('-', '').str.lower())
cpi_long['province_norm'] = cpi_long['Province'].str.replace('-', '').str.lower()
cpi_long = cpi_long[cpi_long['province_norm'].isin(rent_provinces)]

# Extract date from Date column, e.g., MO012008 -> 2008-01
cpi_long['Date'] = cpi_long['Date'].str.replace('MO', '').apply(lambda x: f"{x[2:]}-{x[:2]}")

# Convert to datetime
cpi_long['Date'] = pd.to_datetime(cpi_long['Date'])

# Convert Value to float, replace commas with dots
cpi_long['Value'] = cpi_long['Value'].str.replace(',', '.').astype(float)

# Use the long format
cpi = cpi_long

# YOU MAY NEED TO CHANGE THESE COLUMN NAMES
PROVINCE_COL = "Province"
VALUE_COL = "Value"
DATE_COL = "Date"

# Convert date column
cpi[DATE_COL] = pd.to_datetime(cpi[DATE_COL])

# Get latest month per province
latest_cpi = cpi.loc[cpi.groupby(PROVINCE_COL)[DATE_COL].idxmax()]

latest_cpi = latest_cpi[[PROVINCE_COL, VALUE_COL]]
latest_cpi.columns = ["province", "cpi_index"]

# Normalize province names for merge
rent['province_norm'] = rent['province'].str.replace('-', '').str.lower()
latest_cpi['province_norm'] = latest_cpi['province'].str.replace('-', '').str.lower()

# Coverage check before merge
rent_province_set = set(rent['province_norm'])
cpi_province_set = set(latest_cpi['province_norm'])
missing_in_cpi = sorted(rent_province_set - cpi_province_set)
extra_in_cpi = sorted(cpi_province_set - rent_province_set)

coverage_report = {
	"rent_provinces_count": len(rent_province_set),
	"cpi_provinces_count": len(cpi_province_set),
	"missing_in_cpi": missing_in_cpi,
	"extra_in_cpi": extra_in_cpi,
}

coverage_report_path = os.path.join(script_dir, "data/processed/coverage_report.json")
with open(coverage_report_path, "w", encoding="utf-8") as report_file:
	json.dump(coverage_report, report_file, indent=2)

if missing_in_cpi:
	message = f"Missing CPI province data for: {missing_in_cpi}"
	if STRICT_COVERAGE:
		raise ValueError(message)
	print(f"WARNING: {message}")

# Merge datasets
df = rent.merge(latest_cpi, on="province_norm", suffixes=('', '_cpi'))

# Drop norm columns
df = df.drop(columns=['province_norm', 'province_cpi'])

# Normalize (median-based)
df["rent_norm"] = df["avg_rent"] / df["avg_rent"].median()
df["cpi_norm"] = df["cpi_index"] / df["cpi_index"].median()

# Composite score
df["score"] = 0.6 * df["rent_norm"] + 0.4 * df["cpi_norm"]

# Ranking
df["rank"] = df["score"].rank(ascending=False).astype(int)

# Sort by cost
df = df.sort_values("rank")

# Save outputs
df.to_csv("data/processed/cost_of_living.csv", index=False)
df.to_json("data/processed/cost_of_living.json", orient="records", indent=2)

print("Processing complete")
print(df)
