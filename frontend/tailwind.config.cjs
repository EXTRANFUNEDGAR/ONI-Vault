// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'oni-primary': '#00bcd4',
        'oni-surface': '#1e1e2e',
        'oni-background': '#121212',
        'oni-danger': '#e53935'
      }
    }
  },
  plugins: [],
}
