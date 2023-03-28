/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/**
 * Please match the config key to the directory under services.
 * This is required for the transform to work
 */
const customGenerator = require('../scripts/swagger-custom-generator.js')

module.exports = {
  'cd-ng': {
    output: 'src/services/cd-ng/index.tsx',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("ng/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('ng/api')"),
    url: 'https://stress.harness.io/ng/api/swagger.json'
  },
  'pipeline-ng': {
    output: 'src/services/pipeline-ng/index.tsx',
    url: 'https://stress.harness.io/pipeline/api/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("pipeline/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('pipeline/api')")
  },
  'template-ng': {
    output: 'src/services/template-ng/index.tsx',
    url: 'https://stress.harness.io/template/api/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("template/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('template/api')")
  }
}
