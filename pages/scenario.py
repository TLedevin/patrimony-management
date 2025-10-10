import pandas as pd
import streamlit as st

from pages.investment.investment_management import (
    add_investment,
)  # delete_investment,
from pages.scenario.scenario_management import (
    add_scenario,
    delete_scenario,
    load_scenarios,
)


def main():
    scenarios = load_scenarios()

    col1, col2 = st.columns([3, 1])

    with col1:
        name = st.text_input(
            label="Scenario",
            placeholder="My scenario",
            label_visibility="collapsed",
        )
    with col2:
        if st.button("Add Scenario"):
            add_scenario(name)
            scenarios = load_scenarios()

    if scenarios:
        tabs = st.tabs([f"Scenario {i}" for i in scenarios.keys()])
        for i, tab in enumerate(tabs):
            with tab:
                scenario = scenarios[list(scenarios.keys())[i]]
                st.write(scenario["name"])
                if st.button("Delete scenario", key=f"delete_{i}"):
                    delete_scenario(list(scenarios.keys())[i])
                    st.rerun()
                col11, col12 = st.columns([3, 1])
                with col11:
                    name_investment = st.text_input(
                        label="Investment",
                        placeholder="My investment",
                        label_visibility="collapsed",
                        key=f"investment_name{i}",
                    )
                df_investments = pd.DataFrame.from_dict(
                    scenarios[list(scenarios.keys())[i]]["investments"],
                    orient="index",
                )

                st.data_editor(df_investments)
                with col12:
                    if st.button("Add investment", key=f"add_investment_{i}"):
                        add_investment(
                            list(scenarios.keys())[i], name_investment
                        )
                        st.rerun()


if __name__ == "__main__":
    main()
