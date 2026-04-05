/**
 * PatternGenerator Component
 * T032: Form-based pattern generation with validation and API integration
 * Implements comprehensive form validation as per T013 test requirements
 */

import React, { useState, useCallback, useMemo } from 'react';
import { apiClient } from '../services/api';
import type { GenerateRequest, Pattern } from '../types/api';

interface PatternGeneratorProps {
  onPatternsGenerated: (patterns: Pattern[]) => void;
  disabled?: boolean;
}

interface FormData {
  aspect_w: number;
  aspect_h: number;
  aspect_adherence: number;
  colors: string;
  color_mode: 'random' | 'gradient' | 'scheme60';
  gradient_axis: 'auto' | 'x' | 'y' | 'principal';
  gradient_order?: number[];
  primary_role?: number;
  secondary_role?: number;
  accent_role?: number;
  tendrils: number;
  tendril_len_min: number;
  tendril_len_max: number;
  radius: number;
  seed: number;
  num_layouts: number;
}

interface ValidationErrors {
  [key: string]: string;
}

type OperationStatus = 'idle' | 'loading' | 'success' | 'error';
type FormFieldValue = FormData[keyof FormData];

const DEFAULT_FORM_DATA: FormData = {
  aspect_w: 16,
  aspect_h: 9,
  aspect_adherence: 0.75,
  colors: '#273c6b, #92323d, #D8C03F',
  color_mode: 'random',
  gradient_axis: 'auto',
  tendrils: 3,
  tendril_len_min: 2,
  tendril_len_max: 4,
  radius: 1.0,
  seed: Math.floor(Math.random() * 1000000),
  num_layouts: 3,
};

const DEFAULT_TOTAL_TILES = 50;

export const PatternGenerator: React.FC<PatternGeneratorProps> = ({
  onPatternsGenerated,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [colorCounts, setColorCounts] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] =
    useState<OperationStatus>('idle');

  // Parse colors from string input
  const parsedColors = useMemo(() => {
    return formData.colors
      .split(',')
      .map(color => color.trim())
      .filter(color => color);
  }, [formData.colors]);

  // Update color counts when number of colors changes
  React.useEffect(() => {
    const numColors = parsedColors.length;
    if (numColors === 0) {
      setColorCounts([]);
      return;
    }

    setColorCounts(prev => {
      if (prev.length === numColors) {
        return prev;
      }

      if (prev.length === 0) {
        const baseCount = Math.floor(DEFAULT_TOTAL_TILES / numColors);
        const remainder = DEFAULT_TOTAL_TILES % numColors;
        const seededCounts = Array(numColors).fill(baseCount);

        for (let i = 0; i < remainder; i++) {
          seededCounts[i]++;
        }

        return seededCounts;
      }

      if (prev.length > numColors) {
        return prev.slice(0, numColors);
      }

      return [...prev, ...Array(numColors - prev.length).fill(0)];
    });
  }, [parsedColors.length]);

  const computedTotalTiles = useMemo(
    () => colorCounts.reduce((acc, count) => acc + count, 0),
    [colorCounts]
  );

  // Validation functions
  const validateField = useCallback(
    (field: string, value: FormFieldValue): string | null => {
      const numericValue = typeof value === 'number' ? value : Number(value);

      switch (field) {
        case 'aspect_w':
        case 'aspect_h':
          if (numericValue < 0.1 || numericValue > 100) {
            return `${field === 'aspect_w' ? 'Aspect width' : 'Aspect height'} must be between 0.1 and 100`;
          }
          break;

        case 'colors': {
          const hexPattern = /^#[0-9A-Fa-f]{6}$/;
          const colorValue = typeof value === 'string' ? value : '';
          const colors = colorValue.split(',').map(c => c.trim());
          for (const color of colors) {
            if (color && !hexPattern.test(color)) {
              return 'Invalid hex color format. Use #RRGGBB format';
            }
          }
          break;
        }

        case 'tendril_len_max':
          if (numericValue < formData.tendril_len_min) {
            return 'Maximum length must be greater than or equal to minimum';
          }
          break;

        case 'seed':
          if (numericValue < 0 || numericValue > 1000000000) {
            return 'Seed must be between 0 and 1000000000';
          }
          break;

        default:
          break;
      }
      return null;
    },
    [formData.tendril_len_min]
  );

  // Validate color counts sum
  const validateColorCounts = useCallback((): string | null => {
    if (colorCounts.length > 0) {
      const sum = colorCounts.reduce((acc, count) => acc + count, 0);
      if (sum < 1 || sum > 1000) {
        return 'Total tiles must be between 1 and 1000';
      }
    }
    return null;
  }, [colorCounts]);

  const handleFieldChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear validation error for this field
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      // Clear submit error when user starts typing
      setSubmitError(null);
    },
    []
  );

  const handleFieldBlur = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      const error = validateField(field, value);
      if (error) {
        setValidationErrors(prev => ({ ...prev, [field]: error }));
      }
    },
    [validateField]
  );

  const handleColorCountChange = useCallback((index: number, value: number) => {
    setColorCounts(prev => {
      const newCounts = [...prev];
      newCounts[index] = Math.max(0, value);
      return newCounts;
    });
  }, []);

  const handleRoleChange = useCallback(
    (
      field: 'primary_role' | 'secondary_role' | 'accent_role',
      value: string
    ) => {
      handleFieldChange(
        field,
        value === '' ? undefined : parseInt(value, 10) || 0
      );
    },
    [handleFieldChange]
  );

  React.useEffect(() => {
    setFormData(prev => {
      const maxIndex = parsedColors.length - 1;
      const nextPrimary =
        prev.primary_role !== undefined && prev.primary_role > maxIndex
          ? undefined
          : prev.primary_role;
      const nextSecondary =
        prev.secondary_role !== undefined && prev.secondary_role > maxIndex
          ? undefined
          : prev.secondary_role;
      const nextAccent =
        prev.accent_role !== undefined && prev.accent_role > maxIndex
          ? undefined
          : prev.accent_role;

      if (
        nextPrimary === prev.primary_role &&
        nextSecondary === prev.secondary_role &&
        nextAccent === prev.accent_role
      ) {
        return prev;
      }

      const rest = { ...prev };
      delete rest.primary_role;
      delete rest.secondary_role;
      delete rest.accent_role;

      return {
        ...rest,
        ...(nextPrimary !== undefined ? { primary_role: nextPrimary } : {}),
        ...(nextSecondary !== undefined
          ? { secondary_role: nextSecondary }
          : {}),
        ...(nextAccent !== undefined ? { accent_role: nextAccent } : {}),
      };
    });
  }, [parsedColors.length]);

  const roleColorOptions = useMemo(() => {
    return parsedColors.map((color, index) => {
      const count = colorCounts[index];
      const countLabel = typeof count === 'number' ? ` (${count} tiles)` : '';
      return {
        value: index,
        label: `Color ${index + 1}: ${color}${countLabel}`,
      };
    });
  }, [parsedColors, colorCounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled) {
      return;
    }

    // Run all validations
    const errors: ValidationErrors = {};

    // Field validations
    (
      Object.entries(formData) as Array<
        [keyof FormData, FormData[keyof FormData]]
      >
    ).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
      }
    });

    // Color count validation
    const colorCountError = validateColorCounts();
    if (colorCountError) {
      errors.colorCounts = colorCountError;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitError('Please fix validation errors before submitting');
      setOperationStatus('idle');
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    setOperationStatus('loading');

    try {
      // Build roles object for scheme60 mode
      let roles: GenerateRequest['roles'];
      const hasScheme60RoleOverride =
        formData.primary_role !== undefined ||
        formData.secondary_role !== undefined ||
        formData.accent_role !== undefined;

      if (formData.color_mode === 'scheme60' && hasScheme60RoleOverride) {
        const roleFallbackOrder = colorCounts
          .map((count, index) => ({ count, index }))
          .sort((left, right) => right.count - left.count)
          .map(entry => entry.index);

        const defaultDominantRole = roleFallbackOrder[0] ?? 0;
        const defaultSecondaryRole =
          roleFallbackOrder[1] ?? defaultDominantRole;
        const defaultAccentRole = roleFallbackOrder[2] ?? defaultDominantRole;

        roles = {
          dominant: formData.primary_role ?? defaultDominantRole,
          secondary: formData.secondary_role ?? defaultSecondaryRole,
          accent: formData.accent_role ?? defaultAccentRole,
        };
      }

      const request: GenerateRequest = {
        aspect_w: formData.aspect_w,
        aspect_h: formData.aspect_h,
        aspect_adherence: formData.aspect_adherence,
        total_tiles: computedTotalTiles,
        colors: parsedColors,
        counts: colorCounts.length > 0 ? colorCounts : [computedTotalTiles],
        color_mode: formData.color_mode,
        tendrils: formData.tendrils,
        tendril_len_min: formData.tendril_len_min,
        tendril_len_max: formData.tendril_len_max,
        radius: formData.radius,
        seed: formData.seed,
        num_layouts: formData.num_layouts,
      };

      if (formData.color_mode === 'gradient') {
        request.gradient_axis = formData.gradient_axis;
        if (formData.gradient_order && formData.gradient_order.length > 0) {
          request.gradient_order = formData.gradient_order;
        }
      }

      if (roles) {
        request.roles = roles;
      }

      const response = await apiClient.generatePatterns(request);

      if (response.success) {
        onPatternsGenerated(response.data.patterns);
        setOperationStatus('success');
      } else {
        setSubmitError(response.error.detail);
        setOperationStatus('error');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Network error');
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formActions = (
    <div className="form-actions form-actions-top">
      {operationStatus !== 'idle' && (
        <div className={`operation-status operation-status-${operationStatus}`}>
          {operationStatus === 'loading' && 'Generating pattern variants...'}
          {operationStatus === 'success' &&
            'Patterns generated. Pick a card below to overlay on your wall.'}
          {operationStatus === 'error' &&
            'Generation failed. Check highlighted inputs and try again.'}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || disabled}
        className={`submit-button ${isLoading ? 'loading' : ''}`}
      >
        {isLoading
          ? 'Generating patterns...'
          : disabled
            ? 'Upload Wall Image to Enable'
            : 'Generate Patterns'}
      </button>

      {submitError && (
        <div className="submit-error">
          {operationStatus === 'error'
            ? `Generation request failed: ${submitError}`
            : submitError}
        </div>
      )}

      {Object.keys(validationErrors).length > 0 && !submitError && (
        <div className="validation-summary">
          Please fix validation errors before submitting
        </div>
      )}
    </div>
  );

  return (
    <div className="pattern-generator">
      <h2>Pattern Generator</h2>

      {disabled && (
        <p className="overlay-guidance" data-testid="generator-gated-message">
          Upload a wall image above, then use Generate Patterns to create layout
          options.
        </p>
      )}

      <form onSubmit={handleSubmit} className="pattern-form">
        {formActions}

        <div className="form-layout-columns">
          <div className="form-sections-grid form-sections-grid-left">
            {/* Aspect Ratio Configuration */}
            <div className="form-section">
              <h3>Aspect Ratio</h3>

              <div className="form-group">
                <label htmlFor="aspect_w">Aspect Width:</label>
                <input
                  id="aspect_w"
                  type="number"
                  step="0.1"
                  value={formData.aspect_w}
                  onChange={e =>
                    handleFieldChange(
                      'aspect_w',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  onBlur={e =>
                    handleFieldBlur('aspect_w', parseFloat(e.target.value) || 0)
                  }
                />
                {validationErrors.aspect_w && (
                  <span className="error">{validationErrors.aspect_w}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="aspect_h">Aspect Height:</label>
                <input
                  id="aspect_h"
                  type="number"
                  step="0.1"
                  value={formData.aspect_h}
                  onChange={e =>
                    handleFieldChange(
                      'aspect_h',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  onBlur={e =>
                    handleFieldBlur('aspect_h', parseFloat(e.target.value) || 0)
                  }
                />
                {validationErrors.aspect_h && (
                  <span className="error">{validationErrors.aspect_h}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="aspect_adherence">Aspect Adherence:</label>
                <input
                  id="aspect_adherence"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.aspect_adherence}
                  onChange={e =>
                    handleFieldChange(
                      'aspect_adherence',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>

            {/* Basic Pattern Configuration */}
            <div className="form-section">
              <h3>Pattern Configuration</h3>

              <div className="form-group">
                <label htmlFor="computed_total_tiles">Total Tiles:</label>
                <output
                  className="computed-value"
                  data-testid="computed-total-tiles"
                  id="computed_total_tiles"
                >
                  {computedTotalTiles}
                </output>
                <span className="overlay-guidance">
                  Calculated from Color Distribution counts.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="num_layouts">Number of Layouts:</label>
                <input
                  id="num_layouts"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.num_layouts}
                  onChange={e =>
                    handleFieldChange(
                      'num_layouts',
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="seed">Seed:</label>
                <input
                  id="seed"
                  type="number"
                  value={formData.seed}
                  onChange={e =>
                    handleFieldChange('seed', parseInt(e.target.value) || 0)
                  }
                  onBlur={e =>
                    handleFieldBlur('seed', parseInt(e.target.value) || 0)
                  }
                />
                {validationErrors.seed && (
                  <span className="error">{validationErrors.seed}</span>
                )}
              </div>
            </div>

            {/* Tendril Configuration */}
            <div className="form-section">
              <h3>Tendril Configuration</h3>

              <div className="form-group">
                <label htmlFor="tendrils">Tendrils:</label>
                <input
                  id="tendrils"
                  type="number"
                  min="0"
                  max="8"
                  value={formData.tendrils}
                  onChange={e =>
                    handleFieldChange('tendrils', parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="tendril_len_min">Minimum Tendril Length:</label>
                <input
                  id="tendril_len_min"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.tendril_len_min}
                  onChange={e =>
                    handleFieldChange(
                      'tendril_len_min',
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="tendril_len_max">Maximum Tendril Length:</label>
                <input
                  id="tendril_len_max"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.tendril_len_max}
                  onChange={e =>
                    handleFieldChange(
                      'tendril_len_max',
                      parseInt(e.target.value) || 1
                    )
                  }
                  onBlur={e =>
                    handleFieldBlur(
                      'tendril_len_max',
                      parseInt(e.target.value) || 1
                    )
                  }
                />
                {validationErrors.tendril_len_max && (
                  <span className="error">
                    {validationErrors.tendril_len_max}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Configuration */}
            <div className="form-section">
              <h3>Visual Configuration</h3>

              <div className="form-group">
                <label htmlFor="radius">Radius:</label>
                <input
                  id="radius"
                  type="number"
                  step="0.1"
                  min="0.6"
                  max="2.0"
                  value={formData.radius}
                  onChange={e =>
                    handleFieldChange(
                      'radius',
                      parseFloat(e.target.value) || 1.0
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-section form-section-color">
            {/* Color Configuration */}
            <h3>Color Configuration</h3>

            <div className="form-group">
              <label htmlFor="color_mode">Color Mode:</label>
              <select
                id="color_mode"
                value={formData.color_mode}
                onChange={e =>
                  handleFieldChange(
                    'color_mode',
                    e.target.value as FormData['color_mode']
                  )
                }
              >
                <option value="random">Random</option>
                <option value="gradient">Gradient</option>
                <option value="scheme60">Scheme60</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="colors">
                Colors (comma-separated hex codes):
              </label>
              <input
                id="colors"
                type="text"
                value={formData.colors}
                onChange={e => handleFieldChange('colors', e.target.value)}
                onBlur={e => handleFieldBlur('colors', e.target.value)}
                placeholder="#273c6b, #92323d, #D8C03F"
              />
              {validationErrors.colors && (
                <span className="error">{validationErrors.colors}</span>
              )}
            </div>

            {/* Gradient Mode Options */}
            {formData.color_mode === 'gradient' && (
              <>
                <div className="form-group">
                  <label htmlFor="gradient_axis">Gradient Axis:</label>
                  <select
                    id="gradient_axis"
                    value={formData.gradient_axis}
                    onChange={e =>
                      handleFieldChange(
                        'gradient_axis',
                        e.target.value as FormData['gradient_axis']
                      )
                    }
                  >
                    <option value="auto">Auto</option>
                    <option value="x">X-axis</option>
                    <option value="y">Y-axis</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="gradient_order">Gradient Order:</label>
                  <input
                    id="gradient_order"
                    type="text"
                    placeholder="e.g., 0,1,2"
                    onChange={e => {
                      const order = e.target.value
                        .split(',')
                        .map(n => parseInt(n.trim()))
                        .filter(n => !isNaN(n));
                      handleFieldChange(
                        'gradient_order',
                        order.length > 0 ? order : undefined
                      );
                    }}
                  />
                </div>
              </>
            )}

            {/* Scheme60 Mode Options */}
            {formData.color_mode === 'scheme60' && (
              <>
                <div className="form-group">
                  <label htmlFor="primary_role">Primary Role:</label>
                  <select
                    id="primary_role"
                    value={
                      formData.primary_role !== undefined
                        ? String(formData.primary_role)
                        : ''
                    }
                    onChange={e =>
                      handleRoleChange('primary_role', e.target.value)
                    }
                    disabled={roleColorOptions.length === 0}
                  >
                    <option value="">Auto (largest count)</option>
                    {roleColorOptions.map(option => (
                      <option
                        key={`primary-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="secondary_role">Secondary Role:</label>
                  <select
                    id="secondary_role"
                    value={
                      formData.secondary_role !== undefined
                        ? String(formData.secondary_role)
                        : ''
                    }
                    onChange={e =>
                      handleRoleChange('secondary_role', e.target.value)
                    }
                    disabled={roleColorOptions.length === 0}
                  >
                    <option value="">Auto (second largest count)</option>
                    {roleColorOptions.map(option => (
                      <option
                        key={`secondary-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="accent_role">Accent Role:</label>
                  <select
                    id="accent_role"
                    value={
                      formData.accent_role !== undefined
                        ? String(formData.accent_role)
                        : ''
                    }
                    onChange={e =>
                      handleRoleChange('accent_role', e.target.value)
                    }
                    disabled={roleColorOptions.length === 0}
                  >
                    <option value="">Auto (third largest count)</option>
                    {roleColorOptions.map(option => (
                      <option
                        key={`accent-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Color Count Management */}
            {colorCounts.length > 0 && (
              <div className="color-counts">
                <h4>Color Distribution</h4>
                {colorCounts.map((count, index) => (
                  <div key={index} className="form-group">
                    <label htmlFor={`color_${index + 1}_count`}>
                      Color {index + 1} Count:
                    </label>
                    <input
                      id={`color_${index + 1}_count`}
                      type="number"
                      min="0"
                      value={count}
                      onChange={e =>
                        handleColorCountChange(
                          index,
                          parseInt(e.target.value) || 0
                        )
                      }
                      onBlur={() => {
                        const error = validateColorCounts();
                        if (error) {
                          setValidationErrors(prev => ({
                            ...prev,
                            colorCounts: error,
                          }));
                        } else {
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.colorCounts;
                            return newErrors;
                          });
                        }
                      }}
                    />
                  </div>
                ))}
                {validationErrors.colorCounts && (
                  <span className="error">{validationErrors.colorCounts}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
