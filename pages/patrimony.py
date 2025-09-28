import streamlit as st
import pandas as pd
from pages.utils.patrimony_graph import (
    display_area_stack_chart,
    display_pie_chart,
)
from settings import conf
import plotly
from pages.utils.data_management import load_patrimony_history


def main():
    df = load_patrimony_history()
    # Interactive filters
    owners = df["Owner"].unique().tolist()

    selected_owners = st.multiselect(
        "Select Owner(s):", owners, default=owners
    )

    filtered_df = df[df["Owner"].isin(selected_owners)]

    # Group by Date and sum Value
    filtered_df["Date"] = pd.to_datetime(filtered_df["Date"])

    col21, col22 = st.columns([3, 1])
    with col21:
        display_area_stack_chart(filtered_df)
    with col22:
        display_pie_chart(filtered_df)

    palettes = conf["theme_bis"]["palettes"]
    for owner, palette_name in palettes.items():
        color = getattr(plotly.colors.sequential, palette_name)[4]
        st.markdown(
            f'<span style="color:{color};font-weight:bold;">&#9632;</span> {owner}',
            unsafe_allow_html=True,
        )


if __name__ == "__main__":
    main()
