/**
 * T016: Integration test pattern generation flow
 * Tests the end-to-end pattern generation workflow from form submission to pattern display
 * Following TDD approach - these tests MUST FAIL initially
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../src/App'
import { PatternContext } from '../../src/context/PatternContext'

// Mock API service
vi.mock('../../src/services/api', () => ({
  generatePatterns: vi.fn(),
  downloadPattern: vi.fn()
}))

// Mock URL.createObjectURL for download functionality
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

const mockGenerationResponse = {
  patterns: [
    {
      id: 'generated-pattern-1',
      seed: 42,
      width_inches: 10.5,
      height_inches: 5.9,
      aspect_ratio: 1.78,
      aspect_deviation: 2.1,
      png_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      hexes: [
        { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 },
        { q: -1, r: 0 }, { q: 0, r: -1 }
      ],
      colors: ['#ff0000', '#00ff00', '#0000ff']
    },
    {
      id: 'generated-pattern-2',
      seed: 42,
      width_inches: 9.8,
      height_inches: 6.2,
      aspect_ratio: 1.58,
      aspect_deviation: 11.2,
      png_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjPAAACAAD9auqPAAAAAElFTkSuQmCC',
      hexes: [
        { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }
      ],
      colors: ['#ff0000', '#00ff00', '#0000ff']
    }
  ]
}

describe('Pattern Generation Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Generation Workflow', () => {
    it('generates patterns from form submission to display', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Step 1: Fill out pattern generation form
      await user.clear(screen.getByLabelText(/aspect width/i))
      await user.type(screen.getByLabelText(/aspect width/i), '16')
      
      await user.clear(screen.getByLabelText(/aspect height/i))
      await user.type(screen.getByLabelText(/aspect height/i), '9')
      
      await user.clear(screen.getByLabelText(/total tiles/i))
      await user.type(screen.getByLabelText(/total tiles/i), '50')
      
      await user.clear(screen.getByLabelText(/colors/i))
      await user.type(screen.getByLabelText(/colors/i), '#ff0000, #00ff00, #0000ff')
      
      await user.clear(screen.getByLabelText(/seed/i))
      await user.type(screen.getByLabelText(/seed/i), '42')
      
      // Step 2: Submit form
      const generateButton = screen.getByRole('button', { name: /generate patterns/i })
      await user.click(generateButton)
      
      // Step 3: Verify loading state
      expect(screen.getByText(/generating patterns.../i)).toBeInTheDocument()
      expect(generateButton).toBeDisabled()
      
      // Step 4: Wait for API call
      await waitFor(() => {
        expect(generatePatterns).toHaveBeenCalledWith({
          aspect_w: 16,
          aspect_h: 9,
          aspect_adherence: 0.75,
          total_tiles: 50,
          colors: ['#ff0000', '#00ff00', '#0000ff'],
          counts: expect.arrayContaining([expect.any(Number)]),
          color_mode: expect.any(String),
          tendrils: expect.any(Number),
          tendril_len_min: expect.any(Number),
          tendril_len_max: expect.any(Number),
          radius: expect.any(Number),
          seed: 42,
          num_layouts: expect.any(Number)
        })
      })
      
      // Step 5: Verify patterns are displayed
      await waitFor(() => {
        expect(screen.getByTestId('patterns-grid')).toBeInTheDocument()
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
      
      // Step 6: Verify pattern data is correctly displayed
      expect(screen.getByText(/10\.5.*×.*5\.9.*inches/i)).toBeInTheDocument()
      expect(screen.getByText(/seed.*42/i)).toBeInTheDocument()
      expect(screen.getByText(/1\.78:1/i)).toBeInTheDocument()
      expect(screen.getByText(/2\.1%.*deviation/i)).toBeInTheDocument()
    })

    it('handles different color modes and configurations', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Test gradient mode
      await user.selectOptions(screen.getByLabelText(/color mode/i), 'gradient')
      
      // Should show gradient-specific options
      expect(screen.getByLabelText(/gradient axis/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/gradient order/i)).toBeInTheDocument()
      
      await user.selectOptions(screen.getByLabelText(/gradient axis/i), 'x')
      
      // Submit with gradient configuration
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(generatePatterns).toHaveBeenCalledWith(
          expect.objectContaining({
            color_mode: 'gradient',
            gradient_axis: 'x'
          })
        )
      })
    })

    it('validates form before submission and shows errors', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Set invalid values
      await user.clear(screen.getByLabelText(/total tiles/i))
      await user.type(screen.getByLabelText(/total tiles/i), '0')
      
      await user.clear(screen.getByLabelText(/colors/i))
      await user.type(screen.getByLabelText(/colors/i), 'invalid-color')
      
      // Try to submit
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      // Should show validation errors
      expect(screen.getByText(/total tiles must be between 1 and 1000/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid hex color format/i)).toBeInTheDocument()
      expect(screen.getByText(/please fix validation errors/i)).toBeInTheDocument()
      
      // Should not call API
      const { generatePatterns } = await import('../../src/services/api')
      expect(generatePatterns).not.toHaveBeenCalled()
    })
  })

  describe('Pattern Selection and Navigation', () => {
    it('allows selecting patterns after generation', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Generate patterns first
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
      
      // Select first pattern
      const pattern1Card = screen.getByTestId('pattern-card-generated-pattern-1')
      await user.click(pattern1Card)
      
      // Should be visually selected
      expect(pattern1Card).toHaveClass('selected')
      
      // Select second pattern
      const pattern2Card = screen.getByTestId('pattern-card-generated-pattern-2')
      await user.click(pattern2Card)
      
      // Second pattern should be selected, first should not
      expect(pattern2Card).toHaveClass('selected')
      expect(pattern1Card).not.toHaveClass('selected')
    })

    it('maintains selection state during new generations', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Generate initial patterns
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
      
      // Select a pattern
      const pattern1Card = screen.getByTestId('pattern-card-generated-pattern-1')
      await user.click(pattern1Card)
      expect(pattern1Card).toHaveClass('selected')
      
      // Generate new patterns
      await user.clear(screen.getByLabelText(/seed/i))
      await user.type(screen.getByLabelText(/seed/i), '123')
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(generatePatterns).toHaveBeenCalledTimes(2)
      })
      
      // Selection should be cleared for new generation
      expect(screen.queryByTestId('pattern-card-generated-pattern-1.selected')).not.toBeInTheDocument()
    })
  })

  describe('Multiple Layout Generation', () => {
    it('generates multiple layouts with same parameters', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      const multiLayoutResponse = {
        patterns: [
          { ...mockGenerationResponse.patterns[0], id: 'layout-1' },
          { ...mockGenerationResponse.patterns[0], id: 'layout-2' },
          { ...mockGenerationResponse.patterns[0], id: 'layout-3' }
        ]
      }
      vi.mocked(generatePatterns).mockResolvedValue(multiLayoutResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Set number of layouts
      await user.clear(screen.getByLabelText(/number of layouts/i))
      await user.type(screen.getByLabelText(/number of layouts/i), '3')
      
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(3)
      })
      
      // All should have same seed but different IDs
      expect(screen.getAllByText(/seed.*42/i)).toHaveLength(3)
      expect(screen.getByTestId('pattern-card-layout-1')).toBeInTheDocument()
      expect(screen.getByTestId('pattern-card-layout-2')).toBeInTheDocument()
      expect(screen.getByTestId('pattern-card-layout-3')).toBeInTheDocument()
    })

    it('shows layout variation indicators', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      const variationResponse = {
        patterns: [
          { ...mockGenerationResponse.patterns[0], id: 'var-1', aspect_deviation: 1.2 },
          { ...mockGenerationResponse.patterns[0], id: 'var-2', aspect_deviation: 3.5 },
          { ...mockGenerationResponse.patterns[0], id: 'var-3', aspect_deviation: 8.9 }
        ]
      }
      vi.mocked(generatePatterns).mockResolvedValue(variationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(3)
      })
      
      // Should show quality indicators based on deviation
      expect(screen.getByText(/1\.2%.*deviation/i)).toHaveClass('deviation-good')
      expect(screen.getByText(/3\.5%.*deviation/i)).toHaveClass('deviation-ok')
      expect(screen.getByText(/8\.9%.*deviation/i)).toHaveClass('deviation-poor')
    })
  })

  describe('Pattern Download Integration', () => {
    it('downloads selected pattern with proper integration', async () => {
      const { generatePatterns, downloadPattern } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      vi.mocked(downloadPattern).mockResolvedValue(new Blob(['fake png data'], { type: 'image/png' }))
      
      const user = userEvent.setup()
      render(<App />)
      
      // Generate patterns first
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
      
      // Hover over pattern to reveal download button
      const pattern1Card = screen.getByTestId('pattern-card-generated-pattern-1')
      await user.hover(pattern1Card)
      
      const downloadButton = screen.getByRole('button', { name: /download.*generated-pattern-1/i })
      await user.click(downloadButton)
      
      expect(downloadPattern).toHaveBeenCalledWith('generated-pattern-1')
      
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled()
      })
    })

    it('handles download failures in the integrated flow', async () => {
      const { generatePatterns, downloadPattern } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      vi.mocked(downloadPattern).mockRejectedValue(new Error('Network error'))
      
      const user = userEvent.setup()
      render(<App />)
      
      // Generate patterns first
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
      
      // Try to download
      const pattern1Card = screen.getByTestId('pattern-card-generated-pattern-1')
      await user.hover(pattern1Card)
      
      const downloadButton = screen.getByRole('button', { name: /download.*generated-pattern-1/i })
      await user.click(downloadButton)
      
      await waitFor(() => {
        expect(screen.getByText(/download failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling and Recovery', () => {
    it('handles API errors gracefully and allows retry', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns)
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce(mockGenerationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // First attempt fails
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/failed to generate patterns/i)).toBeInTheDocument()
      })
      
      // Button should be re-enabled for retry
      const generateButton = screen.getByRole('button', { name: /generate patterns/i })
      expect(generateButton).not.toBeDisabled()
      
      // Retry should work
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
    })

    it('handles network timeout scenarios', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )
      
      const user = userEvent.setup()
      render(<App />)
      
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      // Should show loading initially
      expect(screen.getByText(/generating patterns.../i)).toBeInTheDocument()
      
      // Then show timeout error
      await waitFor(() => {
        expect(screen.getByText(/request timeout/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('preserves form state after errors', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockRejectedValue(new Error('Server error'))
      
      const user = userEvent.setup()
      render(<App />)
      
      // Fill form with custom values
      await user.clear(screen.getByLabelText(/seed/i))
      await user.type(screen.getByLabelText(/seed/i), '12345')
      
      await user.clear(screen.getByLabelText(/total tiles/i))
      await user.type(screen.getByLabelText(/total tiles/i), '75')
      
      // Submit and get error
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/failed to generate patterns/i)).toBeInTheDocument()
      })
      
      // Form values should be preserved
      expect(screen.getByDisplayValue('12345')).toBeInTheDocument()
      expect(screen.getByDisplayValue('75')).toBeInTheDocument()
    })
  })

  describe('State Management Integration', () => {
    it('properly manages pattern state across components', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      // Generate patterns
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
      
      // Select a pattern
      const pattern1Card = screen.getByTestId('pattern-card-generated-pattern-1')
      await user.click(pattern1Card)
      
      // State should be reflected in other components (if they exist)
      expect(pattern1Card).toHaveClass('selected')
      
      // Generate new patterns
      await user.clear(screen.getByLabelText(/seed/i))
      await user.type(screen.getByLabelText(/seed/i), '999')
      await user.click(screen.getByRole('button', { name: /generate patterns/i }))
      
      await waitFor(() => {
        expect(generatePatterns).toHaveBeenCalledTimes(2)
      })
      
      // New patterns should replace old ones
      expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      expect(screen.queryByTestId('pattern-card-generated-pattern-1')).toBeInTheDocument()
    })

    it('handles rapid successive generation requests', async () => {
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue(mockGenerationResponse)
      
      const user = userEvent.setup()
      render(<App />)
      
      const generateButton = screen.getByRole('button', { name: /generate patterns/i })
      
      // Rapid clicks
      await user.click(generateButton)
      await user.click(generateButton)
      await user.click(generateButton)
      
      // Should only make one API call due to disabled state
      await waitFor(() => {
        expect(generatePatterns).toHaveBeenCalledTimes(1)
      })
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^pattern-card-/)).toHaveLength(2)
      })
    })
  })
})