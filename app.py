import streamlit as st
from settings import conf

st.logo(
    f"{conf['paths']['images']}logo.svg",
    size="large",
    icon_image=f"{conf['paths']['images']}icone.svg",
)

st.set_page_config(page_title="Patrimony Management Dashboard", layout="wide")
st.markdown(
    f"""
    <style>
    html, body, [class*="css"]  {{
        font-size: {conf['text_size']}px !important;
    }}
    </style>
    """,
    unsafe_allow_html=True,
)
st.markdown(
    """
    <style>
    .block-container { padding-top: 3rem; }
    </style>
    """,
    unsafe_allow_html=True,
)

pages = {
    "Finance": [
        st.Page("pages/patrimony.py", title="Patrimony"),
        st.Page("pages/scenario.py", title="Scenario"),
    ],
    "Resources": [
        st.Page("pages/data.py", title="Data"),
    ],
}

pg = st.navigation(pages)
pg.run()
