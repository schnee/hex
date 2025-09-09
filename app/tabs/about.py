# ===== FILE: app/tabs/about.py =====
import streamlit as st

def render():
    """Renders the comprehensive About tab."""
    st.header("About The Hex Layout Toolkit")
    
    st.markdown("""
    This tool is designed for interior designers, architects, and DIY enthusiasts to create and visualize
    custom layouts for hexagonal wall panels, such as acoustic or decorative tiles.
                
    The tool was inspired by an installation based on the [Ekkogo Acoustic Panels](https://www.ekkogo.com/), which are popular for their
    sound-absorbing properties and aesthetic appeal.
    """)
    
    st.subheader("🎯 Purpose & Features")
    st.markdown("""
    - **Aspect-aware Shaping**: Generate organic, blob-like clusters of tiles that intelligently conform to a desired height and width, making it easy to design for specific wall spaces.
    - **Dynamic Tendrils**: Add optional "tendrils" or runners to your main cluster for a more dynamic, less rigid aesthetic that can flow across a wall.
    - **Rich Color Strategies**: Move beyond simple random layouts with sophisticated color assignment algorithms to achieve intentional design goals.
    - **Interactive Visualization**: Upload a photo of your own wall and place the generated design directly onto it. Move and scale the overlay to find the perfect position.
    """)
    
    st.subheader("🎨 Color Strategies Explained")
    st.markdown("""
    The heart of this tool is its ability to distribute colors thoughtfully.
    
    - **Random**: This is the most straightforward approach. It shuffles all the tiles of the colors you've chosen (respecting the counts you set for each) and distributes them randomly throughout the layout.
    
    - **Gradient**: This strategy assigns colors along a directional axis, creating a smooth visual flow. This is perfect for designs that need to feel like they are moving or fading across a wall. You can control the gradient's direction:
        - `auto` or `principal`: Finds the longest axis of your generated shape and creates the gradient along it.
        - `x` or `y`: Forces the gradient to flow horizontally or vertically.
    
    - **Scheme60**: This applies the classic **60-30-10 Rule** from interior design. It's a time-tested principle for creating a balanced and visually appealing color palette.
        - **60% Dominant Color**: Forms the main body of the layout, typically placed in the center.
        - **30% Secondary Color**: Complements the dominant color and is placed in a ring around it.
        - **10% Accent Color**: Used sparingly on the outer edges to add visual interest and pop.
    """)

    st.subheader("📚 Inspiration & Further Reading")
    st.markdown("""
    The concepts used in this tool are based on established principles in design and mathematics.
    
    - **Color Theory: The 60-30-10 Rule**
        - A great overview of this principle from Sherwin-Williams:
        - [Learn About the 60-30-10 Rule](https://www.sherwin-williams.com/en-us/color/color-basics/color-theory/the-60-30-10-rule)
    
    - **Hexagonal Grids**
        - The underlying math for pointy-top hex grids is complex and fascinating. The definitive guide is from Red Blob Games:
        - [Hexagonal Grids Guide](https://www.redblobgames.com/grids/hexagons/)
        
    - **Design & Composition**
        - The principles of aspect ratio and visual balance are fundamental to good design. Canva provides a good introduction to concepts like the Golden Ratio:
        - [The Golden Ratio in Design](https://www.canva.com/learn/golden-ratio-design/)
    """)
    
    st.subheader("📐 A Note on Geometry & Scaling")
    st.markdown("""
    - All tiles are modeled as **pointy-top hexagons**.
    - For the "Scaled Dimensions" display in the Overlay tool, we assume a real-world dimension for a standard acoustic panel: **12 inches from tip to tip**. This corresponds to a circumradius of 6 inches, which is used to calculate the overall size of your design.
    """)
    
    st.markdown("---")
    st.write("**Version**: 4.1 (Modular UI)")