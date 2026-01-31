import streamlit as st
import pandas as pd
import plotly.express as px
import json
import geopandas as gpd

st.set_page_config(layout="wide")

# Load data
df = pd.read_csv("data/processed/cost_of_living.csv")
geo = gpd.read_file("geo/za_provinces.geojson")

# Title
st.title("Mzansi Visualised")
st.subheader("Cost of Living Per Province — South Africa")

st.markdown("""
Composite index using:
- Average Rent (60%)
- CPI All Items (40%)

Not an official government index.
""")

# Table
st.header("Provincial Ranking")
st.dataframe(df)

# Bar chart (Rent)
st.header("Average Rent by Province")

fig_rent = px.bar(
    df,
    x="province",
    y="avg_rent",
    title="Average Monthly Rent (ZAR)",
)

st.plotly_chart(fig_rent, use_container_width=True)

# Map merge
geo["province"] = geo["ADM1_EN"]

map_df = geo.merge(df, on="province")

# Choropleth map
st.header("Cost of Living Map")

fig_map = px.choropleth(
    map_df,
    geojson=map_df.geometry,
    locations=map_df.index,
    color="score",
    hover_name="province",
    projection="mercator",
)

fig_map.update_geos(fitbounds="locations", visible=False)

st.plotly_chart(fig_map, use_container_width=True)

# Downloads
st.header("Download Data")

with open("data/processed/cost_of_living.csv", "rb") as f:
    st.download_button("Download CSV", f, "cost_of_living.csv")

with open("data/processed/cost_of_living.json", "rb") as f:
    st.download_button("Download JSON", f, "cost_of_living.json")
