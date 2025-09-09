# ===== FILE: app/tabs/generator.py =====
import streamlit as st
import numpy as np
import math
import matplotlib.pyplot as plt
from app.hex_tile_layouts_core import (
    LayoutParams, generate_layout, plot_layout_on_ax, transparent_png_bytes
)

def render():
    """Renders the Generator tab."""
    
    # --- Sidebar for Generator ---
    with st.sidebar:
        st.header("Generator Controls")
        
        aspect_choice = st.selectbox("Aspect Ratio", ["1:1","16:9","9:16","4:3","Custom"], index=1, key="gen_aspect")
        if aspect_choice == "1:1": aspect_w, aspect_h = 1, 1
        elif aspect_choice == "16:9": aspect_w, aspect_h = 16, 9
        elif aspect_choice == "9:16": aspect_w, aspect_h = 9, 16
        elif aspect_choice == "4:3": aspect_w, aspect_h = 4, 3
        else:
            c1,c2 = st.columns(2)
            with c1: aspect_w = st.number_input("Aspect width", 1.0, 100.0, 4.0, 0.5, key="gen_aspect_w")
            with c2: aspect_h = st.number_input("Aspect height", 1.0, 100.0, 3.0, 0.5, key="gen_aspect_h")

        adherence = st.slider("Aspect adherence", 0.0, 1.0, 0.75, key="gen_adherence", help="Higher = stricter shaping.")
        num_colors = st.slider("Number of colors", 2, 5, 3, key="gen_num_colors")
        default_hexes = ["#273c6b", "#92323d", "#bd9562", "#9ca963", "#bf925b"]
        colors, counts = [], []
        for i in range(num_colors):
            c1,c2 = st.columns([1,1])
            with c1: col_hex = st.color_picker(f"Color {i+1}", default_hexes[i], key=f"gen_color_{i}")
            with c2: cnt = st.number_input(f"Tiles for color {i+1}", 0, 500, 12, 1, key=f"gen_count_{i}")
            colors.append(col_hex); counts.append(int(cnt))
        total_tiles = sum(counts)

        color_mode = st.selectbox("Color assignment", ["random","gradient","scheme60"], index=0, key="gen_color_mode")
        gradient_axis, gradient_order, roles = "auto", list(range(num_colors)), None
        if color_mode == "gradient":
            gradient_axis = st.selectbox("Gradient axis", ["auto","x","y","principal"], index=0, key="gen_grad_axis")
            order_labels = [f"Color {i+1}" for i in range(num_colors)]
            sel = st.multiselect("Gradient order", options=list(range(num_colors)), default=list(range(num_colors)), format_func=lambda i: order_labels[i], key="gen_grad_order")
            if sel and len(sel) == num_colors: gradient_order = list(sel)
        if color_mode == "scheme60":
            opts, labels = list(range(num_colors)), [f"Color {i+1}" for i in range(num_colors)]
            dom = st.selectbox("Dominant", opts, index=0, format_func=lambda i: labels[i], key="gen_dom")
            sec = st.selectbox("Secondary", opts, index=min(1, num_colors-1), format_func=lambda i: labels[i], key="gen_sec")
            acc = st.selectbox("Accent", opts, index=min(2, num_colors-1), format_func=lambda i: labels[i], key="gen_acc")
            roles = {"dominant": dom, "secondary": sec, "accent": acc}

        tendrils = st.slider("Tendrils", 0, 8, 3, key="gen_tendrils")
        tmin, tmax = st.slider("Tendril length range", 1, 8, (2,4), key="gen_trange")
        radius = st.slider("Hex radius (visual)", 0.6, 2.0, 1.0, 0.1, key="gen_radius")
        seed = st.number_input("Random seed", 0, 10**9, 123, 1, key="gen_seed")
        layouts = st.slider("Layouts to show", 1, 12, 4, key="gen_layouts")
        show_borders = st.checkbox("Draw hex borders", True, key="gen_borders")
        st.markdown("---")
        generate = st.button("Generate Layouts")

    # --- Main content for Generator ---
    st.header("Pattern Generator")
    st.info("Define your layout parameters in the sidebar, then click 'Generate Layouts'.")
    if generate:
        if total_tiles == 0:
            st.warning("Please assign at least 1 tile.")
            st.stop()
        params = LayoutParams(
            total_tiles=total_tiles, radius=float(radius), aspect_w=float(aspect_w), aspect_h=float(aspect_h),
            tendrils=int(tendrils), tendril_len_min=int(tmin), tendril_len_max=int(tmax),
            aspect_adherence=float(adherence), compactness_bias=0.35, color_mode=color_mode, colors=colors,
            counts=counts, gradient_order=gradient_order, gradient_axis=gradient_axis, roles=roles,
        )
        N = int(layouts)
        cols = int(math.ceil(math.sqrt(N))); rows = int(math.ceil(N/cols))
        grid = [st.columns(cols) for _ in range(rows)]
        for i in range(N):
            r, c = i // cols, i % cols
            rng = np.random.default_rng(int(seed) + i)
            hexes, assigned = generate_layout(rng, params)
            fig, ax = plt.subplots(figsize=(6,5))
            w_in, h_in = plot_layout_on_ax(ax, hexes, assigned, params, title=f"Layout #{i+1} (seed={int(seed)+i})")
            ar = w_in / max(1e-6, h_in); target = params.aspect()
            dev = abs(ar - target)/target * 100.0
            with grid[r][c]:
                st.caption(f"Aspect {ar:.3f} (target {target:.3f}) — dev {dev:.1f}%")
                png = transparent_png_bytes(hexes, assigned, params)
                
                # --- THIS IS THE CORRECTED LOGIC ---
                if show_borders:
                    st.pyplot(fig)
                else:
                    st.image(png)
                # --- END OF CORRECTION ---
                
                st.download_button("Download PNG", data=png, file_name=f"layout_{i+1}_seed_{int(seed)+i}.png", mime="image/png")
                pattern_key = f"Layout #{i+1} (seed={int(seed)+i})"
                st.session_state.pattern_objects[pattern_key] = {"png_bytes": png, "width_in": w_in, "height_in": h_in}