module.exports = {
  devServer: {
    proxy: "http://localhost:3000",
  },
  plugins: [
    {
      resolve: "@poi/plugin-typescript",
      options: {},
    },
  ],
};
