# app/tabs/about.py
import streamlit as st

def render():
    """Render the About tab with updated info and references."""
    st.header("About The Hex Layout Toolkit")

    st.markdown("""
    This application helps designers, architects, and DIY enthusiasts create **custom hexagonal tile layouts**
    for acoustic panels, decorative walls, and other interior design projects.

    ---
    """)

    st.subheader("🎯 Purpose & Features")
    st.markdown("""
    - **Aspect-Aware Layouts**: Generate organic, blob-like clusters that respect your target aspect ratio.
    - **Dynamic Tendrils**: Add optional tendrils for a more fluid, less rigid aesthetic.
    - **Flexible Color Strategies**:
        - **Random**: Shuffle colors while respecting your counts.
        - **Gradient**: Assign colors along a directional axis (auto, x, y, or principal).
        - **Scheme60**: Apply the 60-30-10 rule for balanced palettes.
    - **Color Picker Support**: Define up to **5 custom colors** with individual tile counts.
    - **Gradient Order Control**: Drag to reorder colors for gradient mode.
    - **Scheme60 Roles**: Assign dominant, secondary, and accent roles by index.
    - **Transparent PNG Export**: Download overlay-ready images for real-world previews.
    - **Overlay Visualizer**: Upload a wall photo, drag and scale your design interactively.
    """)

    st.subheader("📐 Geometry & Scaling")
    st.markdown("""
    - Tiles are modeled as **pointy-top hexagons**.
    - Real-world assumption: **tip-to-tip = 12 in** → circumradius = 6 in.
    - Bounding box dimensions are displayed in **inches** for practical planning.
    """)

    st.subheader("🎨 Color Theory References")
    st.markdown("""
    - **60-30-10 Rule**: A classic interior design principle for color balance.
        - https://www.sherwin-williams.com/en-us/color/color-basics/color-theory/the-60-30-10-rule
    - **Gradient Design**: Visual hierarchy and directional flow in UI and interiors.
        - https://uxdesign.cc/gradients-in-ui-design-8f8f1f4f1f4f
    """)

    st.subheader("🔍 External References")
    st.markdown("""
    - **Hexagonal Grids**:
        - [Red Blob Games: Hexagonal Grids](https://www.redblobgames.com/gridsComposition**:
        - [Canva: Golden Ratio in Design](https://www.canva.com- **Color Accessibility**:
        - https://webaim.org/resources/contrastchecker/
    """)

    st.subheader("✅ Next Steps")
    st.markdown("""
    - Add **Overlay Page** enhancements:
        - Sticky drag (no reruns while moving)
        - Save placement & Reset
        - Export at original resolution
    - Optional: **Print-ready specs** and **DXF export** for fabrication.
    """)

    st.markdown("---")
    st.write("**Version**: 4.2 (Modular + Color Picker)")
