/**
 * Accessibility ARIA attribute tests — Phase 13-04 deliverable
 *
 * Verifies that FormField, Header, and ThemeToggle expose the ARIA
 * attributes required for WCAG AA compliance as implemented in 13-04:
 *   - FormField: aria-required, aria-invalid, aria-describedby, role="alert"
 *   - Header: nav landmark with aria-label
 *   - ThemeToggle: aria-label present, button 44px (w-11 h-11 class)
 *
 * Uses plain DOM getAttribute() — @testing-library/jest-dom not installed.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider } from 'next-themes';
import { FormField } from '@/components/FormField';
import { Header } from '@/components/Header';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';

// ============================================================================
// Global mocks required by components using next-themes
// ============================================================================

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  localStorage.clear();
});

// next/link mock: render a plain anchor so we can test href
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// ============================================================================
// FormField ARIA attributes
// ============================================================================

describe('FormField accessibility attributes', () => {
  it('input has aria-required="true" when required prop is true', () => {
    render(<FormField label="Name" name="name" required={true} />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('input does not have aria-required="true" when required prop is false', () => {
    render(<FormField label="Name" name="name" required={false} />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-required')).not.toBe('true');
  });

  it('input has aria-invalid="true" when error and touched', () => {
    render(
      <FormField
        label="Email"
        name="email"
        error="Ungültige E-Mail-Adresse"
        touched={true}
      />
    );
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('input has aria-invalid="false" when no error', () => {
    render(<FormField label="Email" name="email" />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('error div has role="alert" when error and touched', () => {
    render(
      <FormField
        label="Email"
        name="email"
        error="Pflichtfeld"
        touched={true}
      />
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toBe('Pflichtfeld');
  });

  it('input has aria-describedby pointing to error element when error is visible', () => {
    render(
      <FormField
        label="Email"
        name="email"
        error="Fehler"
        touched={true}
      />
    );
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-describedby')).toBe('email-error');

    const errorEl = document.getElementById('email-error');
    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent).toBe('Fehler');
  });

  it('input has aria-describedby pointing to helper element when helper text is present and no error', () => {
    render(
      <FormField
        label="Email"
        name="email"
        helperText="Bitte geben Sie Ihre E-Mail ein"
      />
    );
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-describedby')).toBe('email-helper');
  });

  it('renders sr-only "(required)" text alongside the required indicator', () => {
    const { container } = render(
      <FormField label="Name" name="name" required={true} />
    );
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).not.toBeNull();
    expect(srOnly?.textContent).toBe('(required)');
  });

  it('textarea has aria-required="true" when type=textarea and required=true', () => {
    render(<FormField label="Notes" name="notes" type="textarea" required={true} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.getAttribute('aria-required')).toBe('true');
  });

  it('select has aria-invalid="true" when type=select, error, and touched', () => {
    render(
      <FormField
        label="Typ"
        name="typ"
        type="select"
        error="Bitte wählen"
        touched={true}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select.getAttribute('aria-invalid')).toBe('true');
  });
});

// ============================================================================
// Header nav landmark
// ============================================================================

describe('Header accessibility', () => {
  it('renders a nav element with aria-label="Hauptnavigation"', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    expect(nav).toBeDefined();
  });

  it('navigation contains a link to "/" (Wizard)', () => {
    render(<Header />);
    const wizardLink = screen.getByRole('link', { name: 'Wizard' });
    expect(wizardLink.getAttribute('href')).toBe('/');
  });

  it('navigation contains a link to "/incidents" (Incidents)', () => {
    render(<Header />);
    const incidentsLink = screen.getByRole('link', { name: 'Incidents' });
    expect(incidentsLink.getAttribute('href')).toBe('/incidents');
  });
});

// ============================================================================
// ThemeToggle: aria-label and 44px touch target
// ============================================================================

describe('ThemeToggle accessibility', () => {
  const renderWithTheme = (defaultTheme: 'light' | 'dark' = 'light') =>
    render(
      <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    );

  it('button has a non-empty aria-label attribute', async () => {
    renderWithTheme('light');
    const button = await waitFor(() => screen.getByRole('button'));
    const label = button.getAttribute('aria-label');
    expect(label).not.toBeNull();
    expect(label!.length).toBeGreaterThan(0);
  });

  it('button has w-11 and h-11 classes (44px Tailwind = minimum touch target)', async () => {
    renderWithTheme('light');
    const button = await waitFor(() => screen.getByRole('button'));
    expect(button.className).toContain('w-11');
    expect(button.className).toContain('h-11');
  });

  it('aria-label in light mode describes switching to dark mode (target state pattern)', async () => {
    renderWithTheme('light');
    const button = await waitFor(() => screen.getByRole('button'));
    const label = button.getAttribute('aria-label')!;
    // Label must mention "dunkel" or "dark" or "Design" (any variant that names the dark target)
    // Actual: "Dunkles Design aktivieren" — "Dunkl" contains D-u-n-k-l, regex: /dunkl|dark/i
    expect(label).toMatch(/dunkl|dark/i);
  });
});
