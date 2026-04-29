const cssVar = (name: string) => `var(${name})`;

const readCssVar = (name: string) => {
  if (typeof document === "undefined") {
    return cssVar(name);
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || cssVar(name);
};

const hexToRgb = (value: string) => {
  const hex = value.replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((part) => part + part)
          .join("")
      : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
};

const rgbToAlpha = (value: string, alpha: number) => {
  const rgbMatch = value.match(
    /^rgb\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*\)$/i,
  );

  if (!rgbMatch) {
    return null;
  }

  return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
};

export const withAlpha = (value: string, alpha: number) => {
  if (value.startsWith("#")) {
    const rgb = hexToRgb(value);

    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
  }

  if (value.startsWith("rgb(")) {
    const rgba = rgbToAlpha(value, alpha);

    if (rgba) {
      return rgba;
    }
  }

  if (value.startsWith("var(")) {
    return `color-mix(in srgb, ${value} ${alpha * 100}%, transparent)`;
  }

  return value;
};

export const theme = {
  colors: {
    primary: {
      50: cssVar("--color-primary-50"),
      100: cssVar("--color-primary-100"),
      200: cssVar("--color-primary-200"),
      300: cssVar("--color-primary-300"),
      400: cssVar("--color-primary-400"),
      500: cssVar("--color-primary-500"),
      600: cssVar("--color-primary-600"),
      700: cssVar("--color-primary-700"),
      800: cssVar("--color-primary-800"),
      900: cssVar("--color-primary-900"),
    },
    success: {
      50: cssVar("--color-success-50"),
      100: cssVar("--color-success-100"),
      200: cssVar("--color-success-200"),
      300: cssVar("--color-success-300"),
      400: cssVar("--color-success-400"),
      500: cssVar("--color-success-500"),
      600: cssVar("--color-success-600"),
      700: cssVar("--color-success-700"),
      800: cssVar("--color-success-800"),
      900: cssVar("--color-success-900"),
    },
    danger: {
      50: cssVar("--color-danger-50"),
      100: cssVar("--color-danger-100"),
      200: cssVar("--color-danger-200"),
      300: cssVar("--color-danger-300"),
      400: cssVar("--color-danger-400"),
      500: cssVar("--color-danger-500"),
      600: cssVar("--color-danger-600"),
      700: cssVar("--color-danger-700"),
      800: cssVar("--color-danger-800"),
      900: cssVar("--color-danger-900"),
    },
    warning: {
      50: cssVar("--color-warning-50"),
      100: cssVar("--color-warning-100"),
      200: cssVar("--color-warning-200"),
      300: cssVar("--color-warning-300"),
      400: cssVar("--color-warning-400"),
      500: cssVar("--color-warning-500"),
      600: cssVar("--color-warning-600"),
      700: cssVar("--color-warning-700"),
      800: cssVar("--color-warning-800"),
      900: cssVar("--color-warning-900"),
    },
    neutral: {
      50: cssVar("--color-neutral-50"),
      100: cssVar("--color-neutral-100"),
      200: cssVar("--color-neutral-200"),
      300: cssVar("--color-neutral-300"),
      400: cssVar("--color-neutral-400"),
      500: cssVar("--color-neutral-500"),
      600: cssVar("--color-neutral-600"),
      700: cssVar("--color-neutral-700"),
      800: cssVar("--color-neutral-800"),
      900: cssVar("--color-neutral-900"),
    },
    chart: {
      bullish: cssVar("--color-chart-bullish"),
      bearish: cssVar("--color-chart-bearish"),
      volume: cssVar("--color-chart-volume"),
      gridLine: cssVar("--color-chart-grid"),
      axisLabel: cssVar("--color-chart-axis"),
      axisTitle: cssVar("--color-chart-title"),
      background: cssVar("--color-chart-bg"),
      tooltip: cssVar("--color-chart-tooltip"),
    },
    annotations: {
      rally: cssVar("--color-annotation-rally"),
      decline: cssVar("--color-annotation-decline"),
      consolidation: cssVar("--color-annotation-consolidation"),
      breakout: cssVar("--color-annotation-breakout"),
      support: cssVar("--color-annotation-support"),
      resistance: cssVar("--color-annotation-resistance"),
    },
  },
  semantic: {
    positive: cssVar("--color-success-500"),
    negative: cssVar("--color-danger-500"),
    neutral: cssVar("--color-neutral-500"),
    accent: cssVar("--color-primary-500"),
    muted: cssVar("--color-neutral-400"),
    border: cssVar("--color-neutral-200"),
    background: cssVar("--color-neutral-50"),
  },
} as const;

export const echartsTheme = {
  signals: {
    get close() {
      return readCssVar("--color-primary-500");
    },
    get volume() {
      return readCssVar("--color-success-500");
    },
  },
  annotations: {
    get rally() {
      return readCssVar("--color-annotation-rally");
    },
    get decline() {
      return readCssVar("--color-annotation-decline");
    },
    get consolidation() {
      return readCssVar("--color-annotation-consolidation");
    },
    get breakout() {
      return readCssVar("--color-annotation-breakout");
    },
    get support() {
      return readCssVar("--color-annotation-support");
    },
    get resistance() {
      return readCssVar("--color-annotation-resistance");
    },
  },
  get titleColor() {
    return readCssVar("--color-chart-title");
  },
  get axisLabelColor() {
    return readCssVar("--color-chart-axis");
  },
  get axisLineColor() {
    return readCssVar("--color-neutral-200");
  },
  get splitLineColor() {
    return readCssVar("--color-neutral-100");
  },
  get annotationLabelColor() {
    return readCssVar("--color-neutral-700");
  },
  get annotationLabelBackground() {
    return withAlpha(readCssVar("--surface-card"), 0.9);
  },
  get annotationLabelBorderColor() {
    return readCssVar("--color-neutral-300");
  },
  get brushFillColor() {
    return withAlpha(readCssVar("--color-primary-500"), 0.3);
  },
  get brushBorderColor() {
    return readCssVar("--color-primary-500");
  },
} as const;

export type ThemeColors = typeof theme.colors;
export type SemanticColors = typeof theme.semantic;
