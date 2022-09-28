/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import _ from 'lodash'

import { getLayers } from './utils/HarnessModulesUtils.cjs'
import runPrettier from './utils/runPrettier.cjs'

const layers = await getLayers()
const flattenedLayers = _.flatten(layers)
const modulesPath = path.resolve(process.cwd(), 'src/modules')
const eslintConfigPath = path.resolve(process.cwd(), '.eslintrc.yml')
const eslintConfig = yaml.load(fs.readFileSync(eslintConfigPath, 'utf8'))

const noRestrictedImports = eslintConfig.rules['no-restricted-imports']

for (const { dirName, moduleName } of flattenedLayers) {
  const modulePath = path.join(modulesPath, dirName)
  const layerIndex = layers.findIndex(layer => layer.find(mod => dirName === mod.dirName))
  const restrictedLayers = layers.slice(layerIndex)
  const restrictedDirs = _.flatten(restrictedLayers).filter(mod => dirName !== mod.dirName)

  const config = {
    rules: {
      'no-restricted-imports': [
        noRestrictedImports[0],
        {
          patterns: [
            ...noRestrictedImports[1].patterns,
            ...restrictedDirs.map(mod => `modules/${mod.dirName}/*`),
            ...restrictedDirs.map(mod => `@${mod.moduleName}/*`)
          ],
          paths: [...noRestrictedImports[1].paths]
        }
      ]
    }
  }

  const customConfigFile = path.join(modulePath, 'custom.eslintrc.yml')

  if (fs.existsSync(customConfigFile)) {
    const customConfig = yaml.load(fs.readFileSync(customConfigFile), 'utf8')
    console.log('customConfig', customConfig)

    if (customConfig.rules) {
      Object.entries(customConfig.rules).forEach(([rule, ruleConfig]) => {
        console.log('rule', rule)
        if (rule === 'no-restricted-imports') {
          const patterns = _.get(ruleConfig, '[1].patterns')
          const paths = _.get(ruleConfig, '[1].paths')

          if (patterns) {
            config.rules[rule][1].patterns.push(...patterns)
          }

          if (paths) {
            config.rules[rule][1].paths.push(...paths)
          }
        } else {
          config.rules[rule] = ruleConfig
        }
      })
    }

    if (customConfig.overrides) {
      config.overrides = customConfig.overrides
    }
  }

  let content = yaml.dump(config, { noRefs: true, lineWidth: -1 })
  content = await runPrettier(content, 'yaml')

  await fs.promises.writeFile(path.join(modulePath, '.eslintrc.yml'), content, 'utf8')
  console.log(`✅  Generated '.eslintrc.yml' file for "${moduleName}"`)
}
