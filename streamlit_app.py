# ===== FILE: streamlit_app.py =====
import streamlit as st
from app.tabs import generator, overlay, about

def main():
    """Main function to run the Streamlit app."""
    st.set_page_config(page_title="Hex Layout Toolkit", layout="wide")
    st.title("Hex Layout Toolkit")

    # Initialize session state keys if they don't exist
    if 'pattern_objects' not in st.session_state:
        st.session_state['pattern_objects'] = {}
    if 'overlay_state' not in st.session_state:
        st.session_state['overlay_state'] = {"left": 100, "top": 100, "scaleX": 1.0, "scaleY": 1.0}
    # --- NEW: More robust state keys for the overlay image ---
    if 'uploaded_wall_image_bytes' not in st.session_state:
        st.session_state['uploaded_wall_image_bytes'] = None
    if 'active_wall_image_bytes' not in st.session_state:
        st.session_state['active_wall_image_bytes'] = None

    selected_view = st.radio(
        "Navigation",
        ["Generator", "Overlay", "About"],
        horizontal=True,
        label_visibility="collapsed"
    )

    if selected_view == "Generator":
        generator.render()
    elif selected_view == "Overlay":
        overlay.render()
    elif selected_view == "About":
        about.render()

if __name__ == "__main__":
    main()