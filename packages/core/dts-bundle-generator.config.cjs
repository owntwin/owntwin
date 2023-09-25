// @ts-check

/** @type import('dts-bundle-generator/config-schema').OutputOptions */
const commonOutputParams = {
  // inlineDeclareGlobals: false,
  sortNodes: true,
};

/** @type import('dts-bundle-generator/config-schema').BundlerConfig */
const config = {
  compilationOptions: {
    preferredConfigPath: "./tsconfig.json",
  },

  entries: [
    {
      filePath: "./src/index.ts",
      outFile: "./dist/index.d.ts",
      noCheck: true,
      output: commonOutputParams,
    },
    {
      filePath: "./src/components/index.ts",
      outFile: "./dist/components/index.d.ts",
      noCheck: true,
      output: commonOutputParams,
    },
  ],
};

module.exports = config;
