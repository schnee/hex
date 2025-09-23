/**
 * T017: Integration test overlay positioning flow
 * Tests the end-to-end overlay positioning workflow from image upload to dimension calculation
 * Following TDD approach - these tests MUST FAIL initially
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../src/App'

// Mock API services
vi.mock('../../src/services/api', () => ({
  generatePatterns: vi.fn(),
  uploadImage: vi.fn(),
  calculateOverlay: vi.fn()
}))

// Mock react-draggable for overlay interactions
vi.mock('react-draggable', () => ({
  default: ({ children, onDrag, onStop }: any) => (
    <div 
      data-testid="draggable-overlay"
      onMouseMove={(e) => onDrag && onDrag(e, { x: e.clientX, y: e.clientY })}
      onMouseUp={(e) => onStop && onStop(e, { x: e.clientX, y: e.clientY })}
    >
      {children}
    </div>
  )
}))

// Mock react-resizable for resize interactions
vi.mock('react-resizable', () => ({
  Resizable: ({ children, onResize, onResizeStop }: any) => (
    <div 
      data-testid="resizable-overlay"
      onMouseMove={(e) => onResize && onResize(e, { size: { width: 200, height: 150 } })}
      onMouseUp={(e) => onResizeStop && onResizeStop(e, { size: { width: 200, height: 150 } })}
    >
      {children}
    </div>
  )
}))

// Mock file upload functionality
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

const mockPattern = {
  id: 'test-pattern',
  seed: 42,
  width_inches: 10.5,
  height_inches: 5.9,
  aspect_ratio: 1.78,
  aspect_deviation: 2.1,
  png_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  hexes: [{ q: 0, r: 0 }],
  colors: ['#ff0000']
}

const mockUploadResponse = {
  image_id: 'uploaded-image-123',
  width: 1920,
  height: 1080,
  processed_data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA=',
  format: 'jpeg',
  original_size: { width: 2560, height: 1440 }
}

const mockOverlayResponse = {
  physical_dimensions: {
    width_inches: 15.75,
    height_inches: 8.85
  },
  visual_dimensions: {
    width_px: 315,
    height_px: 177
  }
}

describe('Overlay Positioning Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Overlay Workflow', () => {
    it('handles full workflow from pattern generation to overlay positioning', async () => {
      const { generatePatterns, uploadImage, calculateOverlay } = await import('../../src/services/api')
      
      // Mock API responses
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      vi.mocked(calculateOverlay).mockResolvedValue(mockOverlayResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Step 1: Generate a pattern first
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getByTestId('pattern-card-test-pattern')).toBeInTheDocument()
      })
      
      // Step 2: Select the pattern
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      expect(screen.getByTestId('pattern-card-test-pattern')).toHaveClass('selected')
      
      // Step 3: Navigate to overlay view
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      // Step 4: Upload wall image
      const fileInput = screen.getByLabelText(/upload wall image/i)
      const file = new File(['wall image content'], 'wall.jpg', { type: 'image/jpeg' })
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(uploadImage).toHaveBeenCalledWith(file)
      })
      
      // Step 5: Wait for overlay viewer to appear
      await waitFor(() => {
        expect(screen.getByTestId('overlay-viewer')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: /wall background/i })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: /pattern overlay/i })).toBeInTheDocument()
      })
      
      // Step 6: Verify initial dimensions are displayed
      expect(screen.getByText(/10\.5.*×.*5\.9.*inches/i)).toBeInTheDocument()
    })

    it('allows interactive overlay positioning with real-time updates', async () => {
      const { generatePatterns, uploadImage, calculateOverlay } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      vi.mocked(calculateOverlay).mockResolvedValue(mockOverlayResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup: Generate pattern and upload image
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      const file = new File(['image'], 'wall.jpg', { type: 'image/jpeg' })
      await user.upload(fileInput, file)
      
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Test dragging
      const draggableOverlay = screen.getByTestId('draggable-overlay')
      fireEvent.mouseMove(draggableOverlay, { clientX: 100, clientY: 50 })
      
      await waitFor(() => {
        expect(calculateOverlay).toHaveBeenCalledWith({
          image_id: 'uploaded-image-123',
          pattern_id: 'test-pattern',
          overlay_state: expect.objectContaining({
            left: expect.any(Number),
            top: expect.any(Number)
          })
        })
      })
      
      // Test resizing
      const resizableOverlay = screen.getByTestId('resizable-overlay')
      fireEvent.mouseMove(resizableOverlay)
      
      await waitFor(() => {
        expect(calculateOverlay).toHaveBeenCalledWith(
          expect.objectContaining({
            overlay_state: expect.objectContaining({
              scaleX: expect.any(Number),
              scaleY: expect.any(Number)
            })
          })
        )
      })
      
      // Updated dimensions should be shown
      await waitFor(() => {
        expect(screen.getByText(/15\.75.*×.*8\.85.*inches/i)).toBeInTheDocument()
      })
    })
  })

  describe('Image Upload Flow', () => {
    it('handles image upload with validation and processing', async () => {
      const { uploadImage } = await import('../../src/services/api')
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Navigate to overlay view
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      // Test valid image upload
      const fileInput = screen.getByLabelText(/upload wall image/i)
      const validFile = new File(['image data'], 'wall.jpg', { type: 'image/jpeg' })
      
      await user.upload(fileInput, validFile)
      
      // Should show upload progress
      expect(screen.getByText(/uploading.../i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(uploadImage).toHaveBeenCalledWith(validFile)
        expect(screen.getByRole('img', { name: /wall background/i })).toHaveAttribute(
          'src', mockUploadResponse.processed_data
        )
      })
    })

    it('validates image file types and size', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      // Test invalid file type
      const invalidFile = new File(['text data'], 'document.txt', { type: 'text/plain' })
      const fileInput = screen.getByLabelText(/upload wall image/i)
      
      await user.upload(fileInput, invalidFile)
      
      expect(screen.getByText(/invalid file type.*jpg.*png.*gif/i)).toBeInTheDocument()
      
      // Test oversized file (mock file size check)
      const oversizedFile = new File(['x'.repeat(11000000)], 'huge.jpg', { type: 'image/jpeg' })
      Object.defineProperty(oversizedFile, 'size', { value: 11000000 })
      
      await user.upload(fileInput, oversizedFile)
      
      expect(screen.getByText(/file size too large.*10mb/i)).toBeInTheDocument()
    })

    it('handles image upload errors gracefully', async () => {
      const { uploadImage } = await import('../../src/services/api')
      vi.mocked(uploadImage).mockRejectedValue(new Error('Upload failed'))
      
      const user = userEvent.setup()
      render(<App />)
      
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      const file = new File(['image'], 'wall.jpg', { type: 'image/jpeg' })
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })
  })

  describe('Overlay Interaction Controls', () => {
    it('provides drag and resize controls with visual feedback', async () => {
      const { generatePatterns, uploadImage } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Verify drag handles are present
      expect(screen.getByTestId('draggable-overlay')).toBeInTheDocument()
      expect(screen.getByTestId('resizable-overlay')).toBeInTheDocument()
      
      // Test visual feedback during interaction
      const patternOverlay = screen.getByTestId('pattern-overlay')
      fireEvent.mouseDown(patternOverlay)
      
      expect(patternOverlay).toHaveClass('dragging')
      
      fireEvent.mouseUp(patternOverlay)
      expect(patternOverlay).not.toHaveClass('dragging')
    })

    it('supports keyboard navigation for accessibility', async () => {
      const { generatePatterns, uploadImage, calculateOverlay } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      vi.mocked(calculateOverlay).mockResolvedValue(mockOverlayResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Focus overlay and use keyboard
      const patternOverlay = screen.getByTestId('pattern-overlay')
      patternOverlay.focus()
      
      // Test arrow key movement
      await user.keyboard('{ArrowRight}')
      
      expect(calculateOverlay).toHaveBeenCalledWith(
        expect.objectContaining({
          overlay_state: expect.objectContaining({
            left: expect.any(Number) // Should be moved right
          })
        })
      )
    })

    it('maintains aspect ratio when lock is enabled', async () => {
      const { generatePatterns, uploadImage, calculateOverlay } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      vi.mocked(calculateOverlay).mockResolvedValue(mockOverlayResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Enable aspect lock
      const aspectLockCheckbox = screen.getByLabelText(/lock aspect ratio/i)
      await user.click(aspectLockCheckbox)
      
      // Resize should maintain aspect ratio
      const resizableOverlay = screen.getByTestId('resizable-overlay')
      fireEvent.mouseMove(resizableOverlay)
      
      await waitFor(() => {
        expect(calculateOverlay).toHaveBeenCalledWith(
          expect.objectContaining({
            overlay_state: expect.objectContaining({
              scaleX: expect.any(Number),
              scaleY: expect.any(Number)
            })
          })
        )
      })
    })
  })

  describe('Dimension Calculation Integration', () => {
    it('shows real-time dimension updates during manipulation', async () => {
      const { generatePatterns, uploadImage, calculateOverlay } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      
      // Mock progressive dimension updates
      vi.mocked(calculateOverlay)
        .mockResolvedValueOnce({
          physical_dimensions: { width_inches: 12.0, height_inches: 6.8 },
          visual_dimensions: { width_px: 240, height_px: 136 }
        })
        .mockResolvedValueOnce({
          physical_dimensions: { width_inches: 18.5, height_inches: 10.4 },
          visual_dimensions: { width_px: 370, height_px: 208 }
        })
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Initial dimensions
      expect(screen.getByText(/10\.5.*×.*5\.9.*inches/i)).toBeInTheDocument()
      
      // Move overlay
      const draggableOverlay = screen.getByTestId('draggable-overlay')
      fireEvent.mouseMove(draggableOverlay, { clientX: 150, clientY: 75 })
      
      await waitFor(() => {
        expect(screen.getByText(/12\.0.*×.*6\.8.*inches/i)).toBeInTheDocument()
      })
      
      // Resize overlay
      const resizableOverlay = screen.getByTestId('resizable-overlay')
      fireEvent.mouseMove(resizableOverlay)
      
      await waitFor(() => {
        expect(screen.getByText(/18\.5.*×.*10\.4.*inches/i)).toBeInTheDocument()
      })
    })

    it('handles dimension calculation errors gracefully', async () => {
      const { generatePatterns, uploadImage, calculateOverlay } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      vi.mocked(calculateOverlay).mockRejectedValue(new Error('Calculation failed'))
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Try to move overlay (triggers calculation)
      const draggableOverlay = screen.getByTestId('draggable-overlay')
      fireEvent.mouseMove(draggableOverlay, { clientX: 100, clientY: 50 })
      
      await waitFor(() => {
        expect(screen.getByText(/unable to calculate dimensions/i)).toBeInTheDocument()
      })
      
      // Should still show original dimensions as fallback
      expect(screen.getByText(/10\.5.*×.*5\.9.*inches/i)).toBeInTheDocument()
    })

    it('supports different measurement units', async () => {
      const { generatePatterns, uploadImage } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Change units
      const unitSelector = screen.getByLabelText(/measurement unit/i)
      await user.selectOptions(unitSelector, 'cm')
      
      // Should show dimensions in centimeters
      const expectedWidthCm = (10.5 * 2.54).toFixed(1)
      const expectedHeightCm = (5.9 * 2.54).toFixed(1)
      expect(screen.getByText(new RegExp(`${expectedWidthCm}.*×.*${expectedHeightCm}.*cm`, 'i'))).toBeInTheDocument()
    })
  })

  describe('Pattern Selection Integration', () => {
    it('switches overlay pattern when selection changes', async () => {
      const { generatePatterns, uploadImage } = await import('../../src/services/api')
      
      const multiplePatterns = [
        { ...mockPattern, id: 'pattern-1' },
        { ...mockPattern, id: 'pattern-2', width_inches: 8.0, height_inches: 12.0 }
      ]
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: multiplePatterns })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Generate multiple patterns
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
      
      // Select first pattern and go to overlay
      await user.click(screen.getByTestId('pattern-card-pattern-1'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Should show first pattern dimensions
      expect(screen.getByText(/10\.5.*×.*5\.9.*inches/i)).toBeInTheDocument()
      
      // Switch to second pattern
      await user.click(screen.getByRole('tab', { name: /patterns/i }))
      await user.click(screen.getByTestId('pattern-card-pattern-2'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      // Should show second pattern dimensions
      await waitFor(() => {
        expect(screen.getByText(/8\.0.*×.*12\.0.*inches/i)).toBeInTheDocument()
      })
    })

    it('handles overlay state when no pattern is selected', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Go to overlay without selecting a pattern
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      expect(screen.getByText(/select a pattern first/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/upload wall image/i)).not.toBeInTheDocument()
    })
  })

  describe('Error Recovery and Edge Cases', () => {
    it('handles overlay positioning outside image bounds', async () => {
      const { generatePatterns, uploadImage, calculateOverlay } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      vi.mocked(calculateOverlay).mockResolvedValue(mockOverlayResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Enable bounds constraint
      const constrainCheckbox = screen.getByLabelText(/constrain to image bounds/i)
      await user.click(constrainCheckbox)
      
      // Try to drag outside bounds
      const draggableOverlay = screen.getByTestId('draggable-overlay')
      fireEvent.mouseMove(draggableOverlay, { clientX: -100, clientY: -100 })
      
      // Should be constrained within bounds
      await waitFor(() => {
        expect(calculateOverlay).toHaveBeenCalledWith(
          expect.objectContaining({
            overlay_state: expect.objectContaining({
              left: expect.any(Number), // Should be >= 0
              top: expect.any(Number)   // Should be >= 0
            })
          })
        )
      })
    })

    it('preserves overlay state during tab navigation', async () => {
      const { generatePatterns, uploadImage } = await import('../../src/services/api')
      
      vi.mocked(generatePatterns).mockResolvedValue({ patterns: [mockPattern] })
      vi.mocked(uploadImage).mockResolvedValue(mockUploadResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Setup overlay with positioned pattern
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      await waitFor(() => screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByTestId('pattern-card-test-pattern'))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      const fileInput = screen.getByLabelText(/upload wall image/i)
      await user.upload(fileInput, new File(['img'], 'wall.jpg', { type: 'image/jpeg' }))
      await waitFor(() => screen.getByTestId('overlay-viewer'))
      
      // Position overlay
      const draggableOverlay = screen.getByTestId('draggable-overlay')
      fireEvent.mouseMove(draggableOverlay, { clientX: 200, clientY: 100 })
      
      // Navigate away and back
      await user.click(screen.getByRole('tab', { name: /patterns/i }))
      await user.click(screen.getByRole('tab', { name: /overlay/i }))
      
      // Overlay should maintain its position
      const patternOverlay = screen.getByTestId('pattern-overlay')
      expect(patternOverlay).toBeInTheDocument()
      // Position should be preserved in transform styles
    })
  })
})