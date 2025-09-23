/**
 * T014: Component test OverlayViewer drag interactions  
 * Tests the OverlayViewer component drag/drop functionality, resizing, and dimension calculations
 * Following TDD approach - these tests MUST FAIL initially
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OverlayViewer } from '../../src/components/OverlayViewer'

// Mock react-draggable
vi.mock('react-draggable', () => ({
  default: ({ children, onDrag }: any) => (
    <div data-testid="draggable-wrapper" onMouseMove={onDrag}>
      {children}
    </div>
  )
}))

// Mock react-resizable  
vi.mock('react-resizable', () => ({
  Resizable: ({ children, onResize }: any) => (
    <div data-testid="resizable-wrapper" onMouseMove={onResize}>
      {children}
    </div>
  )
}))

// Mock dimension calculation hook
vi.mock('../../src/hooks/useOverlayDimensions', () => ({
  useOverlayDimensions: vi.fn(() => ({
    physicalDimensions: { width: 10.5, height: 5.9 },
    visualDimensions: { width: 315, height: 177 }
  }))
}))

const mockPattern = {
  id: 'test-pattern',
  seed: 42,
  width_inches: 10.5, 
  height_inches: 5.9,
  aspect_ratio: 1.78,
  aspect_deviation: 2.1,
  png_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  hexes: [],
  colors: []
}

const mockWallImage = {
  image_id: 'test-image',
  width: 1920,
  height: 1080,
  processed_data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA=',
  format: 'jpeg',
  original_size: { width: 2560, height: 1440 }
}

describe('OverlayViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders wall image as background', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      const wallImg = screen.getByRole('img', { name: /wall background/i })
      expect(wallImg).toBeInTheDocument()
      expect(wallImg).toHaveAttribute('src', mockWallImage.processed_data)
    })

    it('renders pattern overlay on top of wall image', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      const patternImg = screen.getByRole('img', { name: /pattern overlay/i })
      expect(patternImg).toBeInTheDocument()
      expect(patternImg).toHaveAttribute('src', mockPattern.png_data)
    })

    it('applies initial overlay transform styles', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1.5, scaleY: 1.2, rotation: 15 }}
          onOverlayChange={() => {}}
        />
      )

      const patternOverlay = screen.getByTestId('pattern-overlay')
      const styles = window.getComputedStyle(patternOverlay)
      
      expect(styles.transform).toContain('translate(100px, 50px)')
      expect(styles.transform).toContain('scale(1.5, 1.2)')
      expect(styles.transform).toContain('rotate(15deg)')
    })

    it('shows dimension display by default', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      expect(screen.getByText(/10\.5.*×.*5\.9.*inches/i)).toBeInTheDocument()
    })
  })

  describe('Drag Functionality', () => {
    it('makes pattern overlay draggable', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      expect(screen.getByTestId('draggable-wrapper')).toBeInTheDocument()
    })

    it('calls onOverlayChange when pattern is dragged', async () => {
      const mockOnOverlayChange = vi.fn()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
        />
      )

      const draggableWrapper = screen.getByTestId('draggable-wrapper')
      
      // Simulate drag event
      fireEvent.mouseMove(draggableWrapper, {
        clientX: 200,
        clientY: 150
      })

      await waitFor(() => {
        expect(mockOnOverlayChange).toHaveBeenCalledWith(
          expect.objectContaining({
            left: expect.any(Number),
            top: expect.any(Number),
            scaleX: 1,
            scaleY: 1,
            rotation: 0
          })
        )
      })
    })

    it('prevents dragging when disabled', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
          enableDrag={false}
        />
      )

      // Should not have draggable wrapper when disabled
      expect(screen.queryByTestId('draggable-wrapper')).not.toBeInTheDocument()
    })

    it('constrains dragging within bounds of wall image', async () => {
      const mockOnOverlayChange = vi.fn()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
          constrainToBounds={true}
        />
      )

      const draggableWrapper = screen.getByTestId('draggable-wrapper')
      
      // Try to drag beyond bounds (negative position)
      fireEvent.mouseMove(draggableWrapper, {
        clientX: -100,
        clientY: -100
      })

      await waitFor(() => {
        const lastCall = mockOnOverlayChange.mock.calls[mockOnOverlayChange.mock.calls.length - 1]
        expect(lastCall[0].left).toBeGreaterThanOrEqual(0)
        expect(lastCall[0].top).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Resize Functionality', () => {
    it('makes pattern overlay resizable', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      expect(screen.getByTestId('resizable-wrapper')).toBeInTheDocument()
    })

    it('calls onOverlayChange when pattern is resized', async () => {
      const mockOnOverlayChange = vi.fn()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
        />
      )

      const resizableWrapper = screen.getByTestId('resizable-wrapper')
      
      // Simulate resize event
      fireEvent.mouseMove(resizableWrapper)

      await waitFor(() => {
        expect(mockOnOverlayChange).toHaveBeenCalledWith(
          expect.objectContaining({
            scaleX: expect.any(Number),
            scaleY: expect.any(Number)
          })
        )
      })
    })

    it('maintains aspect ratio when aspect lock is enabled', async () => {
      const mockOnOverlayChange = vi.fn()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
          lockAspectRatio={true}
        />
      )

      const resizableWrapper = screen.getByTestId('resizable-wrapper')
      fireEvent.mouseMove(resizableWrapper)

      await waitFor(() => {
        const lastCall = mockOnOverlayChange.mock.calls[mockOnOverlayChange.mock.calls.length - 1]
        // When aspect is locked, scaleX and scaleY should maintain the pattern's ratio
        const expectedRatio = mockPattern.width_inches / mockPattern.height_inches
        const actualRatio = lastCall[0].scaleX / lastCall[0].scaleY
        expect(actualRatio).toBeCloseTo(expectedRatio, 2)
      })
    })

    it('allows independent scaling when aspect lock is disabled', async () => {
      const mockOnOverlayChange = vi.fn()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
          lockAspectRatio={false}
        />
      )

      const resizableWrapper = screen.getByTestId('resizable-wrapper')
      fireEvent.mouseMove(resizableWrapper)

      await waitFor(() => {
        expect(mockOnOverlayChange).toHaveBeenCalled()
        // Should allow different scaleX and scaleY values
      })
    })

    it('enforces minimum and maximum scale limits', async () => {
      const mockOnOverlayChange = vi.fn()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 0.05, scaleY: 0.05, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
          minScale={0.1}
          maxScale={10}
        />
      )

      const resizableWrapper = screen.getByTestId('resizable-wrapper')
      fireEvent.mouseMove(resizableWrapper)

      await waitFor(() => {
        const lastCall = mockOnOverlayChange.mock.calls[mockOnOverlayChange.mock.calls.length - 1]
        expect(lastCall[0].scaleX).toBeGreaterThanOrEqual(0.1)
        expect(lastCall[0].scaleY).toBeGreaterThanOrEqual(0.1)
        expect(lastCall[0].scaleX).toBeLessThanOrEqual(10)
        expect(lastCall[0].scaleY).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('Rotation Controls', () => {
    it('shows rotation handle when rotation is enabled', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
          enableRotation={true}
        />
      )

      expect(screen.getByTestId('rotation-handle')).toBeInTheDocument()
    })

    it('hides rotation handle when rotation is disabled', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
          enableRotation={false}
        />
      )

      expect(screen.queryByTestId('rotation-handle')).not.toBeInTheDocument()
    })

    it('updates rotation when handle is dragged', async () => {
      const mockOnOverlayChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
          enableRotation={true}
        />
      )

      const rotationHandle = screen.getByTestId('rotation-handle')
      
      // Simulate rotation drag
      await user.pointer({
        keys: '[MouseLeft>]',
        target: rotationHandle,
        coords: { clientX: 200, clientY: 100 }
      })
      
      await user.pointer({
        target: rotationHandle,
        coords: { clientX: 250, clientY: 150 }
      })
      
      await user.pointer('[/MouseLeft]')

      expect(mockOnOverlayChange).toHaveBeenCalledWith(
        expect.objectContaining({
          rotation: expect.any(Number)
        })
      )
    })

    it('constrains rotation to -180 to +180 degrees', async () => {
      const mockOnOverlayChange = vi.fn()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 170 }}
          onOverlayChange={mockOnOverlayChange}
          enableRotation={true}
        />
      )

      // Simulate rotation that would go over 180
      const rotationHandle = screen.getByTestId('rotation-handle')
      fireEvent.mouseDown(rotationHandle)
      fireEvent.mouseMove(document, { clientX: 300, clientY: 200 })
      fireEvent.mouseUp(document)

      await waitFor(() => {
        const lastCall = mockOnOverlayChange.mock.calls[mockOnOverlayChange.mock.calls.length - 1]
        expect(lastCall[0].rotation).toBeGreaterThanOrEqual(-180)
        expect(lastCall[0].rotation).toBeLessThanOrEqual(180)
      })
    })
  })

  describe('Dimension Display', () => {
    it('shows real-time dimension updates during interaction', async () => {
      const { useOverlayDimensions } = await import('../../src/hooks/useOverlayDimensions')
      vi.mocked(useOverlayDimensions).mockReturnValue({
        physicalDimensions: { width: 15.75, height: 8.85 },
        visualDimensions: { width: 472, height: 266 }
      })

      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1.5, scaleY: 1.5, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      expect(screen.getByText(/15\.75.*×.*8\.85.*inches/i)).toBeInTheDocument()
    })

    it('hides dimension display when configured', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
          showDimensions={false}
        />
      )

      expect(screen.queryByText(/inches/i)).not.toBeInTheDocument()
    })

    it('displays dimensions in different units when specified', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
          dimensionUnit="cm"
        />
      )

      // Should show dimensions in cm (inches * 2.54)
      const expectedWidthCm = (10.5 * 2.54).toFixed(1)
      const expectedHeightCm = (5.9 * 2.54).toFixed(1)
      expect(screen.getByText(new RegExp(`${expectedWidthCm}.*×.*${expectedHeightCm}.*cm`, 'i'))).toBeInTheDocument()
    })
  })

  describe('Loading and Error States', () => {
    it('shows loading state when pattern is not available', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={null}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      expect(screen.getByText(/loading pattern.../i)).toBeInTheDocument()
    })

    it('shows loading state when wall image is not available', () => {
      render(
        <OverlayViewer
          wallImage={null}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      expect(screen.getByText(/loading wall image.../i)).toBeInTheDocument()
    })

    it('handles image load errors gracefully', async () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      const patternImg = screen.getByRole('img', { name: /pattern overlay/i })
      
      // Simulate image load error
      fireEvent.error(patternImg)

      await waitFor(() => {
        expect(screen.getByText(/failed to load pattern image/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('provides keyboard navigation for overlay controls', async () => {
      const mockOnOverlayChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={mockOnOverlayChange}
        />
      )

      const patternOverlay = screen.getByTestId('pattern-overlay')
      
      // Should be focusable
      expect(patternOverlay).toHaveAttribute('tabindex', '0')
      
      // Test keyboard movement
      patternOverlay.focus()
      await user.keyboard('{ArrowRight}')
      
      expect(mockOnOverlayChange).toHaveBeenCalledWith(
        expect.objectContaining({
          left: expect.any(Number) // Should be moved right
        })
      )
    })

    it('provides appropriate ARIA labels and roles', () => {
      render(
        <OverlayViewer
          wallImage={mockWallImage}
          pattern={mockPattern}
          overlayState={{ left: 100, top: 50, scaleX: 1, scaleY: 1, rotation: 0 }}
          onOverlayChange={() => {}}
        />
      )

      const patternOverlay = screen.getByTestId('pattern-overlay')
      expect(patternOverlay).toHaveAttribute('role', 'img')
      expect(patternOverlay).toHaveAttribute('aria-label', expect.stringContaining('pattern overlay'))
      
      if (screen.queryByTestId('rotation-handle')) {
        const rotationHandle = screen.getByTestId('rotation-handle')
        expect(rotationHandle).toHaveAttribute('aria-label', expect.stringContaining('rotate'))
      }
    })
  })
})