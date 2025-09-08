# Hex Layout Toolkit

An interactive web application for designing and visualizing custom hexagonal tile layouts for acoustic panels, decorative walls, and other interior design applications.

![Hex Layout Toolkit Screenshot](https://i.imgur.com/gK9u3O6.png)
*(Feel free to replace this with a screenshot of your own!)*

---

## 🎯 Key Features

This tool is built to move beyond simple grid layouts and provide powerful, design-oriented features:

-   **Aspect-Aware Generation**: Create organic, blob-like clusters of tiles that intelligently conform to a desired aspect ratio (e.g., 16:9 for a TV wall).
-   **Dynamic Tendrils**: Add optional "tendrils" or runners to your main cluster for a more dynamic aesthetic that can flow across a wall.
-   **Rich Color Strategies**:
    -   **Random**: A simple, shuffled distribution of your chosen colors.
    -   **Gradient**: Assigns colors along a directional axis, creating a smooth visual flow.
    -   **Scheme60**: Applies the classic **60-30-10 Rule** from interior design for a balanced and visually appealing color palette.
-   **Interactive Overlay Visualizer**: The core feature. Upload a photo of your own wall and place the generated design directly onto it. Move and scale the overlay to find the perfect position and get a real-world preview.

---

## 🚀 Getting Started

Follow these instructions to get the application running on your local machine.

### Prerequisites

-   Python 3.10+
-   [uv](https://github.com/astral-sh/uv) (for environment and package management)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd hex-layout-toolkit
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Create the venv
    uv venv

    # Activate it (macOS/Linux)
    source .venv/bin/activate

    # Activate it (Windows PowerShell)
    # .\.venv\Scripts\Activate.ps1
    ```

3.  **Install the required dependencies:**
    The `uv pip sync` command ensures your environment exactly matches the `requirements.txt` file.
    ```bash
    uv pip sync requirements.txt
    ```

4.  **Run the Streamlit application:**
    ```bash
    streamlit run streamlit_app.py
    ```

Your browser should automatically open a new tab with the running application.

---

## 📖 How to Use

The application is organized into two main workflows, accessible via the navigation at the top of the page.

1.  **Generate Patterns (Generator View)**
    -   Use the **Generator Controls** in the sidebar to define all parameters for your design.
    -   Set the target aspect ratio, number of colors, and tile counts.
    -   Choose a color strategy (`random`, `gradient`, `scheme60`).
    -   Adjust geometric properties like tendrils and hex radius.
    -   Click **"Generate Layouts"**. Your new patterns will appear. They are now saved in the session and available in the Overlay view.

2.  **Visualize on Your Wall (Overlay View)**
    -   Use the **Overlay Controls** in the sidebar.
    -   Click **"Upload Wall Image"** to select a photo from your computer.
    -   The image will appear, and a generated pattern will be placed on it.
    -   Use the **"Select a Pattern"** dropdown to choose from any of the layouts you created in the Generator.
    -   **Click and drag** the overlay to move it.
    -   **Use the handles** on the corners and sides to resize it. The calculated real-world dimensions will update below.

---

## 🏗️ Project Structure

The project is organized with a separation of concerns in mind:

-   `streamlit_app.py`: The main entry point. A thin "shell" responsible for navigation and initializing the application state.
-   `app/hex_tile_layouts_core.py`: The engine of the application. Contains all the core mathematical logic for hex grid calculations, layout generation, and rendering, with no dependency on Streamlit.
-   `app/tabs/`: Contains the modular UI code for each view (`generator.py`, `overlay.py`, `about.py`), keeping the main app file clean.

---

## ✅ Future Development

This version is a stable "v1.0". Future development will focus on improving the user experience of the overlay tool, which is currently limited by Streamlit's server-centric model.

-   **Explore Alternative Frameworks**: To achieve a smoother, "stickier" drag-and-drop experience and a true aspect-ratio lock on resize, we will investigate client-side frameworks (like React/Vue with a FastAPI backend) or more interactive Python frameworks (like Solara or Plotly Dash).
-   **Save/Load Functionality**: Allow users to save their favorite generated layouts and their overlay placements.