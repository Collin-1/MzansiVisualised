import pandas as pd
import numpy as np

# Load data
rent = pd.read_csv("data/raw/rent.csv")
cpi = pd.read_csv("data/raw/cpi.csv")

print("CPI columns:", cpi.columns)

# YOU MAY NEED TO CHANGE THESE COLUMN NAMES
PROVINCE_COL = "Province"
VALUE_COL = "Value"
DATE_COL = "Date"

# Convert date column
cpi[DATE_COL] = pd.to_datetime(cpi[DATE_COL])

# Get latest month
latest_date = cpi[DATE_COL].max()
latest_cpi = cpi[cpi[DATE_COL] == latest_date]

latest_cpi = latest_cpi[[PROVINCE_COL, VALUE_COL]]
latest_cpi.columns = ["province", "cpi_index"]

# Merge datasets
df = rent.merge(latest_cpi, on="province")

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
