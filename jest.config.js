module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: "node_modules/ts-jest-mock-import-meta", // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
              options: { metaObjectReplacement: { url: "https://www.url.com" } },
            },
          ],
        },
      },
    ],
  },
};
