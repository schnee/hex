/**
 * T013: Component test PatternGenerator form validation
 * Tests the PatternGenerator component form inputs, validation, and submission
 * Following TDD approach - these tests MUST FAIL initially
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatternGenerator } from '../../src/components/PatternGenerator'

// Mock the API service
vi.mock('../../src/services/api', () => ({
  generatePatterns: vi.fn()
}))

describe('PatternGenerator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders all required form fields', () => {
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      // Aspect ratio inputs
      expect(screen.getByLabelText(/aspect width/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/aspect height/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/aspect adherence/i)).toBeInTheDocument()
      
      // Basic pattern configuration
      expect(screen.getByLabelText(/total tiles/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/number of layouts/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/seed/i)).toBeInTheDocument()
      
      // Color configuration
      expect(screen.getByLabelText(/color mode/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/colors/i)).toBeInTheDocument()
      
      // Tendril configuration  
      expect(screen.getByLabelText(/tendrils/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/minimum tendril length/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/maximum tendril length/i)).toBeInTheDocument()
      
      // Visual configuration
      expect(screen.getByLabelText(/radius/i)).toBeInTheDocument()
      
      // Submit button
      expect(screen.getByRole('button', { name: /generate patterns/i })).toBeInTheDocument()
    })

    it('has correct default values', () => {
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      expect(screen.getByDisplayValue('16')).toBeInTheDocument() // aspect_w default
      expect(screen.getByDisplayValue('9')).toBeInTheDocument()  // aspect_h default
      expect(screen.getByDisplayValue('0.75')).toBeInTheDocument() // aspect_adherence default
      expect(screen.getByDisplayValue('50')).toBeInTheDocument() // total_tiles default
      expect(screen.getByDisplayValue('3')).toBeInTheDocument()  // tendrils default
      expect(screen.getByDisplayValue('1.0')).toBeInTheDocument() // radius default
    })
  })

  describe('Form Validation', () => {
    it('validates aspect ratio range (0.1 to 100)', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const aspectWidthInput = screen.getByLabelText(/aspect width/i)
      
      // Test invalid low value
      await user.clear(aspectWidthInput)
      await user.type(aspectWidthInput, '0.05')
      fireEvent.blur(aspectWidthInput)
      
      expect(screen.getByText(/aspect width must be between 0.1 and 100/i)).toBeInTheDocument()
      
      // Test invalid high value
      await user.clear(aspectWidthInput)
      await user.type(aspectWidthInput, '101')
      fireEvent.blur(aspectWidthInput)
      
      expect(screen.getByText(/aspect width must be between 0.1 and 100/i)).toBeInTheDocument()
      
      // Test valid value
      await user.clear(aspectWidthInput)
      await user.type(aspectWidthInput, '16')
      fireEvent.blur(aspectWidthInput)
      
      expect(screen.queryByText(/aspect width must be between 0.1 and 100/i)).not.toBeInTheDocument()
    })

    it('validates total tiles range (1 to 1000)', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const totalTilesInput = screen.getByLabelText(/total tiles/i)
      
      // Test invalid low value
      await user.clear(totalTilesInput)
      await user.type(totalTilesInput, '0')
      fireEvent.blur(totalTilesInput)
      
      expect(screen.getByText(/total tiles must be between 1 and 1000/i)).toBeInTheDocument()
      
      // Test invalid high value  
      await user.clear(totalTilesInput)
      await user.type(totalTilesInput, '1001')
      fireEvent.blur(totalTilesInput)
      
      expect(screen.getByText(/total tiles must be between 1 and 1000/i)).toBeInTheDocument()
    })

    it('validates hex color format', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const colorsInput = screen.getByLabelText(/colors/i)
      
      // Test invalid color format
      await user.clear(colorsInput)
      await user.type(colorsInput, 'red, blue, #invalid')
      fireEvent.blur(colorsInput)
      
      expect(screen.getByText(/invalid hex color format/i)).toBeInTheDocument()
      
      // Test valid color format
      await user.clear(colorsInput)
      await user.type(colorsInput, '#ff0000, #00ff00, #0000ff')
      fireEvent.blur(colorsInput)
      
      expect(screen.queryByText(/invalid hex color format/i)).not.toBeInTheDocument()
    })

    it('validates tendril length relationship (max >= min)', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const minLengthInput = screen.getByLabelText(/minimum tendril length/i)
      const maxLengthInput = screen.getByLabelText(/maximum tendril length/i)
      
      // Set min > max (invalid)
      await user.clear(minLengthInput)
      await user.type(minLengthInput, '6')
      await user.clear(maxLengthInput)
      await user.type(maxLengthInput, '3')
      fireEvent.blur(maxLengthInput)
      
      expect(screen.getByText(/maximum length must be greater than or equal to minimum/i)).toBeInTheDocument()
      
      // Set valid relationship
      await user.clear(maxLengthInput)
      await user.type(maxLengthInput, '8')
      fireEvent.blur(maxLengthInput)
      
      expect(screen.queryByText(/maximum length must be greater than or equal to minimum/i)).not.toBeInTheDocument()
    })

    it('validates seed range (0 to 1000000000)', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const seedInput = screen.getByLabelText(/seed/i)
      
      // Test negative value
      await user.clear(seedInput)
      await user.type(seedInput, '-1')
      fireEvent.blur(seedInput)
      
      expect(screen.getByText(/seed must be between 0 and 1000000000/i)).toBeInTheDocument()
      
      // Test too large value
      await user.clear(seedInput)
      await user.type(seedInput, '1000000001')
      fireEvent.blur(seedInput)
      
      expect(screen.getByText(/seed must be between 0 and 1000000000/i)).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('prevents submission when validation errors exist', async () => {
      const mockOnPatternsGenerated = vi.fn()
      const user = userEvent.setup()
      
      render(<PatternGenerator onPatternsGenerated={mockOnPatternsGenerated} />)
      
      // Set invalid value
      const totalTilesInput = screen.getByLabelText(/total tiles/i)
      await user.clear(totalTilesInput)
      await user.type(totalTilesInput, '0')
      
      // Try to submit
      const submitButton = screen.getByRole('button', { name: /generate patterns/i })
      await user.click(submitButton)
      
      expect(mockOnPatternsGenerated).not.toHaveBeenCalled()
      expect(screen.getByText(/please fix validation errors/i)).toBeInTheDocument()
    })

    it('submits with valid data and shows loading state', async () => {
      const mockOnPatternsGenerated = vi.fn()
      const user = userEvent.setup()
      
      // Mock successful API response
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockResolvedValue({
        patterns: [
          {
            id: 'test-pattern-1',
            seed: 42,
            width_inches: 10.5,
            height_inches: 5.9,
            aspect_ratio: 1.78,
            aspect_deviation: 2.1,
            png_data: 'base64data',
            hexes: [],
            colors: []
          }
        ]
      })
      
      render(<PatternGenerator onPatternsGenerated={mockOnPatternsGenerated} />)
      
      // Fill valid form data
      await user.clear(screen.getByLabelText(/total tiles/i))
      await user.type(screen.getByLabelText(/total tiles/i), '50')
      
      await user.clear(screen.getByLabelText(/colors/i))
      await user.type(screen.getByLabelText(/colors/i), '#ff0000, #00ff00')
      
      const submitButton = screen.getByRole('button', { name: /generate patterns/i })
      await user.click(submitButton)
      
      // Check loading state
      expect(screen.getByText(/generating patterns.../i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      // Wait for completion
      await waitFor(() => {
        expect(mockOnPatternsGenerated).toHaveBeenCalledWith([
          expect.objectContaining({
            id: 'test-pattern-1',
            seed: 42
          })
        ])
      })
    })

    it('handles API errors gracefully', async () => {
      const mockOnPatternsGenerated = vi.fn()
      const user = userEvent.setup()
      
      // Mock API error
      const { generatePatterns } = await import('../../src/services/api')
      vi.mocked(generatePatterns).mockRejectedValue(new Error('API Error'))
      
      render(<PatternGenerator onPatternsGenerated={mockOnPatternsGenerated} />)
      
      const submitButton = screen.getByRole('button', { name: /generate patterns/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to generate patterns/i)).toBeInTheDocument()
        expect(submitButton).not.toBeDisabled()
      })
      
      expect(mockOnPatternsGenerated).not.toHaveBeenCalled()
    })
  })

  describe('Dynamic Color Configuration', () => {
    it('shows gradient options when gradient mode is selected', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const colorModeSelect = screen.getByLabelText(/color mode/i)
      await user.selectOptions(colorModeSelect, 'gradient')
      
      expect(screen.getByLabelText(/gradient axis/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/gradient order/i)).toBeInTheDocument()
    })

    it('shows role assignments when scheme60 mode is selected', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const colorModeSelect = screen.getByLabelText(/color mode/i)
      await user.selectOptions(colorModeSelect, 'scheme60')
      
      expect(screen.getByLabelText(/primary role/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/secondary role/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/accent role/i)).toBeInTheDocument()
    })

    it('hides extra options in random mode', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      const colorModeSelect = screen.getByLabelText(/color mode/i)
      await user.selectOptions(colorModeSelect, 'random')
      
      expect(screen.queryByLabelText(/gradient axis/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/primary role/i)).not.toBeInTheDocument()
    })
  })

  describe('Color Count Management', () => {
    it('automatically adjusts color counts when colors change', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      // Change total tiles
      await user.clear(screen.getByLabelText(/total tiles/i))
      await user.type(screen.getByLabelText(/total tiles/i), '100')
      
      // Change colors to 3 colors
      await user.clear(screen.getByLabelText(/colors/i))
      await user.type(screen.getByLabelText(/colors/i), '#ff0000, #00ff00, #0000ff')
      
      // Should show 3 count inputs that sum to 100
      expect(screen.getByLabelText(/color 1 count/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/color 2 count/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/color 3 count/i)).toBeInTheDocument()
    })

    it('validates that color counts sum to total tiles', async () => {
      const user = userEvent.setup()
      render(<PatternGenerator onPatternsGenerated={() => {}} />)
      
      // Set total tiles to 50
      await user.clear(screen.getByLabelText(/total tiles/i))
      await user.type(screen.getByLabelText(/total tiles/i), '50')
      
      // Set 2 colors
      await user.clear(screen.getByLabelText(/colors/i))
      await user.type(screen.getByLabelText(/colors/i), '#ff0000, #00ff00')
      
      // Set counts that don't sum to 50
      await user.clear(screen.getByLabelText(/color 1 count/i))
      await user.type(screen.getByLabelText(/color 1 count/i), '20')
      await user.clear(screen.getByLabelText(/color 2 count/i))
      await user.type(screen.getByLabelText(/color 2 count/i), '20')
      
      fireEvent.blur(screen.getByLabelText(/color 2 count/i))
      
      expect(screen.getByText(/color counts must sum to total tiles/i)).toBeInTheDocument()
    })
  })
})