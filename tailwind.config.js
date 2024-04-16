/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      title: ['"Title"', "sans"],
      publicSans: ['"Public Sans"', "sans"],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // "opengeo": {
        //   DEFAULT: "#1440DC",
        //   100: "#E6EBFF",
        //   200: "#C3D0FD",
        //   300: "#7894F7",
        //   400: "#3D63E9",
        //   500: "#1440DC",
        //   600: "#1423DC",
        //   800: "#0B1AD9",
        // },
        opengeo: {
          DEFAULT: "hsl(var(--primary))",
          100: "hsl(var(--primary-foreground, 50%, 90%))",
          200: "hsl(var(--primary-foreground, 90%, 80%))",
          300: "hsl(var(--primary-foreground, 100%, 70%))",
          400: "hsl(var(--primary-foreground, 100%, 60%))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary, 60%))",
          700: "hsl(var(--primary, 70%))",
          800: "hsl(var(--primary, 80%))",
          900: "hsl(var(--primary, 90%))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "bounce-horizontal": {
          "0%, 100%": {
            left: "calc(0% - 1rem)",
          },
          "50%": {
            left: "calc(100% - 1.5rem)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-horizontal": "bounce-horizontal 2s ease-in-out infinite",
      },
      transitionProperty: {
        width: "width",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
