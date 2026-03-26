export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        gilroy: [
          'Gilroy', // default font-family
          'sans-serif',
        ],
      },
    },
    fontWeight: {
      thin: '100',       // Gilroy Thin
      light: '300',      // Gilroy Light
      normal: '400',     // Gilroy Regular
      medium: '500',     // Gilroy Medium
      semibold: '600',   // Gilroy SemiBold
      bold: '700',       // Gilroy Bold
      extrabold: '800',  // Gilroy ExtraBold
      black: '900',      // Gilroy Black
    },
  },
  plugins: [],
};