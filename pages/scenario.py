import streamlit as st

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
                if st.button("Delete scenario", key=i):
                    delete_scenario(list(scenarios.keys())[i])
                    st.rerun()


if __name__ == "__main__":
    main()
