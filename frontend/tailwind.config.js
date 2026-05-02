export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        accent: '#2563eb',
        // Adding your new branding colors here
        academyGreen: '#064e3b', // Deep Emerald for Header
        academyDark: '#121212',  // Professional Black-Mix for Main
        academyCard: '#1e1e1e',  // Slightly lighter for Cards
      },
    },
  },
  plugins: [],
};
