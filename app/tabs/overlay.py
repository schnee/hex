# ===== FILE: app/tabs/overlay.py =====
import streamlit as st
from streamlit_drawable_canvas import st_canvas
from PIL import Image
import io
import json
import base64

def resize_image(image_bytes: bytes, max_dimension: int = 800) -> bytes:
    """Resizes an image to fit within a max dimension, preserving aspect ratio."""
    img = Image.open(io.BytesIO(image_bytes))
    if max(img.size) > max_dimension:
        img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img_format = img.format if img.format in ['JPEG', 'PNG'] else 'PNG'
        img.save(buf, format=img_format)
        return buf.getvalue()
    return image_bytes

def render():
    """Renders the Overlay tab."""

    with st.sidebar:
        st.header("Overlay Controls")
        uploaded_file = st.file_uploader("Upload Wall Image", type=["png", "jpg", "jpeg"])
        if uploaded_file:
            st.session_state.uploaded_wall_image_bytes = resize_image(uploaded_file.getvalue())

        pattern_keys = list(st.session_state.get('pattern_objects', {}).keys())
        if not pattern_keys:
            st.warning("Generate a layout on the 'Generator' view first.")
            st.stop()

        selected_pattern_key = st.selectbox("Select a Pattern", options=pattern_keys, key="overlay_pattern")
        st.markdown("---")
        if st.button("Reset Overlay Position/Size"):
            st.session_state.active_wall_image_bytes = None
            st.rerun()

    st.header("Overlay Visualizer")
    
    if (st.session_state.get('uploaded_wall_image_bytes') and 
        st.session_state.uploaded_wall_image_bytes != st.session_state.get('active_wall_image_bytes')):
        
        st.session_state.active_wall_image_bytes = st.session_state.uploaded_wall_image_bytes
        
        bg_image = Image.open(io.BytesIO(st.session_state.active_wall_image_bytes))
        pattern_data = st.session_state.pattern_objects[selected_pattern_key]
        pattern_img = Image.open(io.BytesIO(pattern_data["png_bytes"]))
        
        center_x, center_y = bg_image.width / 2, bg_image.height / 2
        initial_left = center_x - (pattern_img.width / 2)
        initial_top = center_y - (pattern_img.height / 2)
        
        bg_longest = max(bg_image.size); overlay_longest = max(pattern_img.size)
        initial_scale = (bg_longest * 0.50) / overlay_longest
        
        st.session_state.overlay_state = {
            "left": initial_left, "top": initial_top,
            "scaleX": initial_scale, "scaleY": initial_scale
        }
        st.rerun()

    if st.session_state.get('active_wall_image_bytes'):
        bg_image_bytes = st.session_state.active_wall_image_bytes
        bg_image = Image.open(io.BytesIO(bg_image_bytes))
        selected_pattern_data = st.session_state.pattern_objects[selected_pattern_key]
        pattern_img_bytes = selected_pattern_data["png_bytes"]
        pattern_img = Image.open(io.BytesIO(pattern_img_bytes))
        overlay_state = st.session_state.overlay_state
        
        b64_bg = base64.b64encode(bg_image_bytes).decode("utf-8")
        bg_fabric_obj = {"type": "image", "src": f"data:image/png;base64,{b64_bg}", "left": 0, "top": 0, "width": bg_image.width, "height": bg_image.height, "selectable": False, "evented": False}
        b64_pattern = base64.b64encode(pattern_img_bytes).decode("utf-8")
        overlay_fabric_obj = {"type": "image", "src": f"data:image/png;base64,{b64_pattern}", **overlay_state, "width": pattern_img.width, "height": pattern_img.height}
        
        st.markdown("Click and drag the overlay to move it. Use the handles to resize.")
        
        canvas_result = st_canvas(
            fill_color="rgba(0,0,0,0)", stroke_width=0, update_streamlit=True, height=bg_image.height, width=bg_image.width,
            drawing_mode="transform", initial_drawing={"version": "5.3.0", "objects": [bg_fabric_obj, overlay_fabric_obj]}, key="overlay_canvas"
        )

        if canvas_result.json_data and canvas_result.json_data.get("objects") and len(canvas_result.json_data["objects"]) > 1:
            new_state = canvas_result.json_data["objects"][1]
            if st.session_state.overlay_state != new_state:
                st.session_state.overlay_state.update(new_state)
                st.rerun()

        # --- THIS IS THE CORRECTED LOGIC ---
        # Display the fixed, physical dimensions of the selected layout, ignoring visual scaling.
        w_in = selected_pattern_data['width_in']
        h_in = selected_pattern_data['height_in']
        st.info(f"**Physical Layout Dimensions:** {w_in:.1f} inches wide × {h_in:.1f} inches high")
        # --- END OF CORRECTION ---

    else:
        st.info("Upload an image of a wall to begin.")