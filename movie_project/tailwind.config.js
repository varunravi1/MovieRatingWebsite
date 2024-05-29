/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "poly-blue": "#054793",
        uv: "#4E4187",
        crayola: "#EE4266",
        plat: "#E7E7E7",
        "dim-gray": "#7A7265",
        "yt-black": "#121212",
        "err-red": "#FF0000",
        purp: "#4F359B",
        "comp-black": "#1c1c1c",
        "purp-light": "#6344bf",
      },
      backgroundImage: {
        parallax: 'url("public/bg-again.jpg")',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-hide": {
          /* Hide scrollbar for Chrome, Safari, and Opera */
          "::-webkit-scrollbar": {
            display: "none",
          },
          /* Hide scrollbar for Internet Explorer, Edge, and Firefox */
          "-ms-overflow-style": "none", // IE and Edge
          "scrollbar-width": "none", // Firefox
        },
      };
      addUtilities(newUtilities, ["responsive"]);
    },
  ],
};
