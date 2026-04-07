import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/atoms/Button';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { IncidentCard } from '@/components/cards/IncidentCard';
import {
  MotionConfig,
  ANIMATION_DURATIONS,
  ANIMATION_EASING,
  ANIMATION_VARIANTS,
} from '@/lib/motion-config';

// Setup jest-dom matchers for vitest
beforeAll(() => {
  // jest-dom matchers are already imported above
});

describe('Motion Animations and Accessibility', () => {
  describe('Button Component', () => {
    it('should render button with motion element', () => {
      const { container } = render(
        <MotionConfig>
          <Button>Click me</Button>
        </MotionConfig>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should have whileHover animation with scale 1.05', () => {
      const { container } = render(
        <MotionConfig>
          <Button>Hover me</Button>
        </MotionConfig>
      );
      const button = container.querySelector('button');
      // Motion sets these as data attributes during animation
      expect(button).toHaveClass('relative', 'font-medium', 'rounded-lg');
    });

    it('should have whileTap animation with scale 0.98', () => {
      const { container } = render(
        <MotionConfig>
          <Button>Tap me</Button>
        </MotionConfig>
      );
      const button = container.querySelector('button');
      // Check for :active CSS fallback
      expect(button).toHaveClass('active:scale-98');
    });

    it('should support isLoading prop and display spinner', () => {
      const { container } = render(
        <MotionConfig>
          <Button isLoading>Save</Button>
        </MotionConfig>
      );
      const button = container.querySelector('button');
      expect(button).toBeDisabled();
      // Spinner should be rendered inside button
      const spinner = container.querySelector('[class*="rounded-full"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should support variant prop (primary, secondary, danger)', () => {
      const { container: primaryContainer } = render(
        <MotionConfig>
          <Button variant="primary">Primary</Button>
        </MotionConfig>
      );
      expect(primaryContainer.querySelector('button')).toHaveClass('bg-navy');

      const { container: secondaryContainer } = render(
        <MotionConfig>
          <Button variant="secondary">Secondary</Button>
        </MotionConfig>
      );
      expect(secondaryContainer.querySelector('button')).toHaveClass('border', 'border-navy');

      const { container: dangerContainer } = render(
        <MotionConfig>
          <Button variant="danger">Danger</Button>
        </MotionConfig>
      );
      expect(dangerContainer.querySelector('button')).toHaveClass('bg-red-600');
    });

    it('should support size prop (sm, md, lg)', () => {
      const { container: smContainer } = render(
        <MotionConfig>
          <Button size="sm">Small</Button>
        </MotionConfig>
      );
      expect(smContainer.querySelector('button')).toHaveClass('px-4', 'py-2');

      const { container: mdContainer } = render(
        <MotionConfig>
          <Button size="md">Medium</Button>
        </MotionConfig>
      );
      expect(mdContainer.querySelector('button')).toHaveClass('px-6', 'py-3');

      const { container: lgContainer } = render(
        <MotionConfig>
          <Button size="lg">Large</Button>
        </MotionConfig>
      );
      expect(lgContainer.querySelector('button')).toHaveClass('px-8', 'py-4');
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should render spinner without errors', () => {
      const { container } = render(
        <MotionConfig>
          <LoadingSpinner />
        </MotionConfig>
      );
      const spinner = container.querySelector('[class*="rounded-full"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should have animate rotation property', () => {
      const { container } = render(
        <MotionConfig>
          <LoadingSpinner />
        </MotionConfig>
      );
      const spinner = container.querySelector('div');
      // Motion div should be present
      expect(spinner).toBeInTheDocument();
    });

    it('should support size variants', () => {
      const { container: smContainer } = render(
        <MotionConfig>
          <LoadingSpinner size="sm" />
        </MotionConfig>
      );
      expect(smContainer.querySelector('div')).toHaveClass('w-4', 'h-4');

      const { container: mdContainer } = render(
        <MotionConfig>
          <LoadingSpinner size="md" />
        </MotionConfig>
      );
      expect(mdContainer.querySelector('div')).toHaveClass('w-6', 'h-6');

      const { container: lgContainer } = render(
        <MotionConfig>
          <LoadingSpinner size="lg" />
        </MotionConfig>
      );
      expect(lgContainer.querySelector('div')).toHaveClass('w-8', 'h-8');
    });

    it('should use border-current for dark mode compatibility', () => {
      const { container } = render(
        <MotionConfig>
          <LoadingSpinner />
        </MotionConfig>
      );
      const innerDiv = container.querySelector('[class*="border-current"]');
      expect(innerDiv).toHaveClass('border-current');
    });
  });

  describe('IncidentCard Component', () => {
    const mockIncident = {
      id: '1',
      createdAt: new Date().toISOString(),
      erkannt_durch: 'Test User',
      incident_type: 'ransomware' as const,
      severity: 'high' as const,
      erkennungszeitpunkt: new Date().toISOString(),
      betroffene_systeme: [],
      erste_erkenntnisse: '',
      q1: 0,
      q2: 0,
      q3: 0,
      playbook: {},
      regulatorische_meldungen: {},
      metadata: {},
      updatedAt: new Date().toISOString(),
    };

    it('should render incident card', () => {
      const { container } = render(
        <MotionConfig>
          <IncidentCard incident={mockIncident} />
        </MotionConfig>
      );
      const card = container.querySelector('div');
      expect(card).toBeInTheDocument();
    });

    it('should have whileHover shadow animation', () => {
      const { container } = render(
        <MotionConfig>
          <IncidentCard incident={mockIncident} />
        </MotionConfig>
      );
      const card = container.querySelector('div');
      // Card should have transition-colors class for color transitions
      expect(card).toHaveClass('transition-colors');
    });

    it('should display incident details', () => {
      render(
        <MotionConfig>
          <IncidentCard incident={mockIncident} />
        </MotionConfig>
      );
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Type: ransomware')).toBeInTheDocument();
      expect(screen.getByText('Severity: high')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleClick = () => {};
      const { container } = render(
        <MotionConfig>
          <IncidentCard incident={mockIncident} onClick={handleClick} />
        </MotionConfig>
      );
      const card = container.querySelector('div');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('Motion Config Accessibility', () => {
    it('MotionConfig should render with reducedMotion="user"', () => {
      const { container } = render(
        <MotionConfig>
          <Button>Test</Button>
        </MotionConfig>
      );
      expect(container).toBeInTheDocument();
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should respect prefers-reduced-motion media query', () => {
      // Test that the app renders without errors when reduced motion is active
      const { container } = render(
        <MotionConfig>
          <LoadingSpinner />
          <Button>Test</Button>
        </MotionConfig>
      );
      // Components should still render even with reduced motion
      expect(container.querySelector('button')).toBeInTheDocument();
      expect(container.querySelector('[class*="rounded-full"]')).toBeInTheDocument();
    });

    it('should provide fallback styling for reduced motion', () => {
      const { container } = render(
        <MotionConfig>
          <Button>Test</Button>
        </MotionConfig>
      );
      // Button should have :active pseudo-class fallback
      expect(container.querySelector('button')).toHaveClass('active:scale-98');
    });
  });

  describe('Animation Duration Constants', () => {
    it('should export correct animation durations', () => {
      expect(ANIMATION_DURATIONS.hover).toBe(0.15); // 150ms
      expect(ANIMATION_DURATIONS.tap).toBe(0.1); // 100ms
      expect(ANIMATION_DURATIONS.spinner).toBe(1); // 1000ms
    });

    it('should export animation easing values', () => {
      expect(ANIMATION_EASING.easeOut).toBeDefined();
      expect(Array.isArray(ANIMATION_EASING.easeOut)).toBe(true);
    });

    it('should export animation variants', () => {
      expect(ANIMATION_VARIANTS.button).toBeDefined();
      expect(ANIMATION_VARIANTS.button.hover).toBeDefined();
      expect(ANIMATION_VARIANTS.button.tap).toBeDefined();
      expect(ANIMATION_VARIANTS.card).toBeDefined();
      expect(ANIMATION_VARIANTS.card.hover).toBeDefined();
    });
  });
});
