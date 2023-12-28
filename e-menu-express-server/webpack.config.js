const path = require("path")
const json5 = require("json5")

module.exports = {
    target: "node", // https://github.com/liady/webpack-node-externals
    externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc. https://github.com/liady/webpack-node-externals
    externals: [{ express: "commonjs express" }, { mongodb: "commonjs mongodb" }], // https://github.com/webpack/webpack/issues/3420
    mode: "development",
    entry: "./src/main.ts",
    devtool: "inline-source-map",
    devServer: {
        static: "./dist",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.json5$/i,
                type: "json",
                parser: {
                    parse: json5.parse,
                },
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, "./src/"),
            "@libs": path.resolve(__dirname, "../libs/"),
        },
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
}
