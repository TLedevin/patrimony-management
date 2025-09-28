import pandas as pd
import plotly.express as px
import plotly.colors
import plotly
import streamlit as st
from settings import conf


def get_owner_palette(owner):
    palette_name = conf["theme_bis"]["palettes"][owner]
    palette = getattr(plotly.colors.sequential, palette_name)
    return palette


def get_account_color_map(df):
    owners = sorted(df["Owner"].unique())
    color_map = {}
    for owner in owners:
        accounts = sorted(df[df["Owner"] == owner]["Account"].unique())
        palette = get_owner_palette(owner)
        for i, acc in enumerate(accounts):
            color_map[acc] = palette[i % len(palette)]
    return color_map


def display_area_stack_chart(df):
    df["Date"] = pd.to_datetime(df["Date"])
    # Group by Date and Account, sum values
    grouped = df.groupby(["Date", "Account"])["Value"].sum().reset_index()
    # Pivot for stacked area
    pivoted = grouped.pivot(
        index="Date", columns="Account", values="Value"
    ).fillna(0)
    color_map = get_account_color_map(df)
    fig = px.area(
        pivoted,
        x=pivoted.index,
        y=pivoted.columns,
        title="Stacked Area Chart - Account Evolution",
        color_discrete_map=color_map,
    )
    fig.update_layout(
        # height=600,
        showlegend=True,
        legend_title_text=None,
        xaxis_title=None,
        yaxis_title=None,
    )
    st.plotly_chart(fig, use_container_width=True)


def display_pie_chart(df):
    # Get latest date
    latest_date = pd.to_datetime(df["Date"]).max()
    latest_df = df[pd.to_datetime(df["Date"]) == latest_date]
    # Group by Account and sum Value
    color_map = get_account_color_map(df)
    pie_data = (
        latest_df.groupby(["Account", "Owner"])["Value"].sum().reset_index()
    )
    print(pie_data)
    fig = px.pie(
        pie_data,
        names="Account",
        values="Value",
        color="Account",
        color_discrete_map=color_map,
        title=f"Distribution ({latest_date.date()})",
        hole=0.6,
    )
    fig.update_traces(textinfo=None, pull=[0.01] * len(pie_data))
    total_value = pie_data["Value"].sum()
    fig.update_layout(
        # height=600,
        showlegend=False,
        legend=dict(orientation="h", y=0),
        annotations=[
            dict(
                text=f"{total_value:,.0f} €".replace(",", " "),
                x=0.5,
                y=0.5,
                font_size=24,
                showarrow=False,
            )
        ],
    )
    st.plotly_chart(fig, use_container_width=True)
