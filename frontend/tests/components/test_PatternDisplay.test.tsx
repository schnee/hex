/**
 * T015: Component test PatternDisplay grid layout
 * Tests the PatternDisplay component grid rendering, pattern selection, and download functionality
 * Following TDD approach - these tests MUST FAIL initially
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatternDisplay } from '../../src/components/PatternDisplay'

// Mock the API service
vi.mock('../../src/services/api', () => ({
  downloadPattern: vi.fn()
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

const mockPatterns = [
  {
    id: 'pattern-1',
    seed: 42,
    width_inches: 10.5,
    height_inches: 5.9,
    aspect_ratio: 1.78,
    aspect_deviation: 2.1,
    png_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    hexes: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }],
    colors: ['#ff0000', '#00ff00', '#0000ff']
  },
  {
    id: 'pattern-2', 
    seed: 123,
    width_inches: 8.0,
    height_inches: 6.0,
    aspect_ratio: 1.33,
    aspect_deviation: 5.2,
    png_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjPAAACAAD9auqPAAAAAElFTkSuQmCC',
    hexes: [{ q: 0, r: 0 }, { q: -1, r: 1 }],
    colors: ['#ffff00', '#ff00ff']
  },
  {
    id: 'pattern-3',
    seed: 456,
    width_inches: 12.2,
    height_inches: 4.8,
    aspect_ratio: 2.54,
    aspect_deviation: 1.3,
    png_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    hexes: [{ q: 0, r: 0 }],
    colors: ['#00ffff']
  }
]

describe('PatternDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  describe('Grid Layout', () => {
    it('renders patterns in a responsive grid', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const grid = screen.getByTestId('patterns-grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('patterns-grid') // Should have CSS grid styling
      
      // Should render all patterns
      expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(3)
    })

    it('adjusts grid columns based on screen size', () => {
      // Mock window resize to test responsive behavior
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const grid = screen.getByTestId('patterns-grid')
      const styles = window.getComputedStyle(grid)
      
      // Should have appropriate grid template columns for medium screen
      expect(styles.gridTemplateColumns).toBeDefined()
    })

    it('handles single pattern layout correctly', () => {
      render(<PatternDisplay patterns={[mockPatterns[0]]} onPatternSelect={() => {}} />)
      
      expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(1)
      expect(screen.getByTestId('pattern-card-pattern-1')).toBeInTheDocument()
    })

    it('maintains aspect ratios in grid cells', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const patternImages = screen.getAllByRole('img', { name: /pattern preview/i })
      patternImages.forEach(img => {
        expect(img).toHaveStyle('object-fit: contain')
        expect(img).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet')
      })
    })
  })

  describe('Pattern Cards', () => {
    it('renders pattern preview image', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const patternImage = screen.getByRole('img', { name: /pattern preview.*pattern-1/i })
      expect(patternImage).toBeInTheDocument()
      expect(patternImage).toHaveAttribute('src', mockPatterns[0].png_data)
    })

    it('displays pattern metadata', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      // Check dimensions
      expect(screen.getByText(/10\.5.*×.*5\.9.*inches/i)).toBeInTheDocument()
      expect(screen.getByText(/8\.0.*×.*6\.0.*inches/i)).toBeInTheDocument()
      
      // Check aspect ratios
      expect(screen.getByText(/1\.78:1/i)).toBeInTheDocument()
      expect(screen.getByText(/1\.33:1/i)).toBeInTheDocument()
      
      // Check seeds
      expect(screen.getByText(/seed.*42/i)).toBeInTheDocument()
      expect(screen.getByText(/seed.*123/i)).toBeInTheDocument()
    })

    it('shows aspect deviation with appropriate styling', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      // Low deviation (good) should have success styling
      const lowDeviation = screen.getByText(/2\.1%.*deviation/i)
      expect(lowDeviation).toHaveClass('deviation-good')
      
      // High deviation (poor) should have warning styling  
      const highDeviation = screen.getByText(/5\.2%.*deviation/i)
      expect(highDeviation).toHaveClass('deviation-poor')
    })

    it('displays color palette for each pattern', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      // Pattern 1 has 3 colors
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      const pattern1Colors = pattern1Card.querySelectorAll('.color-swatch')
      expect(pattern1Colors).toHaveLength(3)
      
      // Pattern 2 has 2 colors
      const pattern2Card = screen.getByTestId('pattern-card-pattern-2') 
      const pattern2Colors = pattern2Card.querySelectorAll('.color-swatch')
      expect(pattern2Colors).toHaveLength(2)
    })

    it('shows hex count for each pattern', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      expect(screen.getByText(/3.*hexes/i)).toBeInTheDocument()
      expect(screen.getByText(/2.*hexes/i)).toBeInTheDocument() 
      expect(screen.getByText(/1.*hex/i)).toBeInTheDocument() // Singular for 1 hex
    })
  })

  describe('Pattern Selection', () => {
    it('highlights selected pattern', async () => {
      const mockOnPatternSelect = vi.fn()
      const user = userEvent.setup()
      
      render(
        <PatternDisplay 
          patterns={mockPatterns} 
          onPatternSelect={mockOnPatternSelect}
          selectedPatternId="pattern-2"
        />
      )
      
      const pattern2Card = screen.getByTestId('pattern-card-pattern-2')
      expect(pattern2Card).toHaveClass('selected')
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      expect(pattern1Card).not.toHaveClass('selected')
    })

    it('calls onPatternSelect when pattern is clicked', async () => {
      const mockOnPatternSelect = vi.fn()
      const user = userEvent.setup()
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={mockOnPatternSelect} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      await user.click(pattern1Card)
      
      expect(mockOnPatternSelect).toHaveBeenCalledWith(mockPatterns[0])
    })

    it('supports keyboard navigation for pattern selection', async () => {
      const mockOnPatternSelect = vi.fn()
      const user = userEvent.setup()
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={mockOnPatternSelect} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      
      // Should be focusable
      expect(pattern1Card).toHaveAttribute('tabindex', '0')
      
      // Test Enter key selection
      pattern1Card.focus()
      await user.keyboard('{Enter}')
      
      expect(mockOnPatternSelect).toHaveBeenCalledWith(mockPatterns[0])
    })

    it('supports arrow key navigation between patterns', async () => {
      const mockOnPatternSelect = vi.fn()
      const user = userEvent.setup()
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={mockOnPatternSelect} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      const pattern2Card = screen.getByTestId('pattern-card-pattern-2')
      
      pattern1Card.focus()
      await user.keyboard('{ArrowRight}')
      
      expect(pattern2Card).toHaveFocus()
    })
  })

  describe('Download Functionality', () => {
    it('shows download button on pattern hover', async () => {
      const user = userEvent.setup()
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      
      // Initially hidden
      expect(screen.queryByRole('button', { name: /download.*pattern-1/i })).not.toBeInTheDocument()
      
      // Hover reveals download button
      await user.hover(pattern1Card)
      expect(screen.getByRole('button', { name: /download.*pattern-1/i })).toBeInTheDocument()
    })

    it('downloads pattern when download button is clicked', async () => {
      const user = userEvent.setup()
      const { downloadPattern } = await import('../../src/services/api')
      
      // Mock successful download
      vi.mocked(downloadPattern).mockResolvedValue(new Blob(['fake png data'], { type: 'image/png' }))
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      await user.hover(pattern1Card)
      
      const downloadButton = screen.getByRole('button', { name: /download.*pattern-1/i })
      await user.click(downloadButton)
      
      expect(downloadPattern).toHaveBeenCalledWith('pattern-1')
      
      // Should trigger file download
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled()
      })
    })

    it('shows loading state during download', async () => {
      const user = userEvent.setup()
      const { downloadPattern } = await import('../../src/services/api')
      
      // Mock slow download
      vi.mocked(downloadPattern).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      )
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      await user.hover(pattern1Card)
      
      const downloadButton = screen.getByRole('button', { name: /download.*pattern-1/i })
      await user.click(downloadButton)
      
      expect(screen.getByText(/downloading.../i)).toBeInTheDocument()
      expect(downloadButton).toBeDisabled()
    })

    it('handles download errors gracefully', async () => {
      const user = userEvent.setup()
      const { downloadPattern } = await import('../../src/services/api')
      
      // Mock download error
      vi.mocked(downloadPattern).mockRejectedValue(new Error('Download failed'))
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      await user.hover(pattern1Card)
      
      const downloadButton = screen.getByRole('button', { name: /download.*pattern-1/i })
      await user.click(downloadButton)
      
      await waitFor(() => {
        expect(screen.getByText(/download failed/i)).toBeInTheDocument()
      })
    })

    it('creates proper filename for downloaded patterns', async () => {
      const user = userEvent.setup()
      const { downloadPattern } = await import('../../src/services/api')
      
      vi.mocked(downloadPattern).mockResolvedValue(new Blob(['fake png data'], { type: 'image/png' }))
      
      // Mock document.createElement to capture download link
      const mockLink = { 
        href: '', 
        download: '', 
        click: vi.fn(),
        style: { display: '' }
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      await user.hover(pattern1Card)
      
      const downloadButton = screen.getByRole('button', { name: /download.*pattern-1/i })
      await user.click(downloadButton)
      
      await waitFor(() => {
        expect(mockLink.download).toMatch(/hex-layout.*seed-42.*\.png/)
      })
    })
  })

  describe('Empty and Loading States', () => {
    it('shows empty state when no patterns provided', () => {
      render(<PatternDisplay patterns={[]} onPatternSelect={() => {}} />)
      
      expect(screen.getByText(/no patterns available/i)).toBeInTheDocument()
      expect(screen.getByText(/generate some patterns to see them here/i)).toBeInTheDocument()
    })

    it('shows loading state when patterns are null/undefined', () => {
      render(<PatternDisplay patterns={null as any} onPatternSelect={() => {}} />)
      
      expect(screen.getByText(/loading patterns.../i)).toBeInTheDocument()
    })

    it('handles pattern with missing image data', () => {
      const patternWithoutImage = {
        ...mockPatterns[0],
        png_data: ''
      }
      
      render(<PatternDisplay patterns={[patternWithoutImage]} onPatternSelect={() => {}} />)
      
      expect(screen.getByText(/image not available/i)).toBeInTheDocument()
    })
  })

  describe('Filtering and Sorting', () => {
    it('filters patterns by aspect ratio range', () => {
      render(
        <PatternDisplay 
          patterns={mockPatterns} 
          onPatternSelect={() => {}} 
          aspectRatioFilter={{ min: 1.5, max: 2.0 }}
        />
      )
      
      // Only patterns with aspect ratio 1.5-2.0 should show
      expect(screen.getByTestId('pattern-card-pattern-1')).toBeInTheDocument() // 1.78
      expect(screen.queryByTestId('pattern-card-pattern-2')).not.toBeInTheDocument() // 1.33
      expect(screen.getByTestId('pattern-card-pattern-3')).toBeInTheDocument() // 2.54
    })

    it('sorts patterns by aspect deviation', () => {
      render(
        <PatternDisplay 
          patterns={mockPatterns} 
          onPatternSelect={() => {}} 
          sortBy="deviation"
        />
      )
      
      const patternCards = screen.getAllByTestId(/^pattern-card-/)
      // Should be sorted by deviation: pattern-3 (1.3%), pattern-1 (2.1%), pattern-2 (5.2%)
      expect(patternCards[0]).toHaveAttribute('data-testid', 'pattern-card-pattern-3')
      expect(patternCards[1]).toHaveAttribute('data-testid', 'pattern-card-pattern-1') 
      expect(patternCards[2]).toHaveAttribute('data-testid', 'pattern-card-pattern-2')
    })

    it('sorts patterns by dimensions', () => {
      render(
        <PatternDisplay 
          patterns={mockPatterns} 
          onPatternSelect={() => {}} 
          sortBy="size"
        />
      )
      
      const patternCards = screen.getAllByTestId(/^pattern-card-/)
      // Should be sorted by area (w*h): pattern-1 (62.0), pattern-3 (58.6), pattern-2 (48.0)
      expect(patternCards[0]).toHaveAttribute('data-testid', 'pattern-card-pattern-1')
      expect(patternCards[1]).toHaveAttribute('data-testid', 'pattern-card-pattern-3')
      expect(patternCards[2]).toHaveAttribute('data-testid', 'pattern-card-pattern-2')
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const grid = screen.getByTestId('patterns-grid')
      expect(grid).toHaveAttribute('role', 'grid')
      
      const patternCards = screen.getAllByTestId(/^pattern-card-/)
      patternCards.forEach(card => {
        expect(card).toHaveAttribute('role', 'gridcell')
        expect(card).toHaveAttribute('aria-label')
      })
    })

    it('provides screen reader friendly descriptions', () => {
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      expect(pattern1Card).toHaveAttribute('aria-label', expect.stringContaining('10.5 by 5.9 inches'))
      expect(pattern1Card).toHaveAttribute('aria-label', expect.stringContaining('aspect ratio 1.78'))
      expect(pattern1Card).toHaveAttribute('aria-label', expect.stringContaining('3 hexagons'))
    })

    it('supports high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        })),
      })
      
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const patternCards = screen.getAllByTestId(/^pattern-card-/)
      patternCards.forEach(card => {
        expect(card).toHaveClass('high-contrast')
      })
    })

    it('provides focus indicators for keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />)
      
      const pattern1Card = screen.getByTestId('pattern-card-pattern-1')
      
      await user.tab() // Focus first card
      expect(pattern1Card).toHaveFocus()
      expect(pattern1Card).toHaveClass('focus-visible')
    })
  })
})