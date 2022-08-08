/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import prompts from 'prompts'
import { $ } from 'zx'
import * as OpenAPI from 'openapi-typescript-codegen'
import { upperFirst, camelCase } from 'lodash-es'
import pLimit from 'p-limit'

const load = async () => {
  const config = await import('../configs/restful-react.config.js')
  const services = Object.keys(config.default)

  services.sort()

  const response = await prompts({
    type: 'multiselect',
    name: 'services',
    message: 'Please select the services you want to generate',
    choices: services.map(title => ({ title }))
  })

  if (!response.services || response.services.length === 0) {
    console.log('No services selected. Exiting...')
    process.exit(0)
  }

  const limit = pLimit(5)

  const promises = response.services.map(index => {
    const service = services[index]
    const { output, url, file, cluster } = config.default[service]

    return limit(() =>
      OpenAPI.generate({
        input: file || `https://qa.harness.io/prod1/${cluster}/swagger.json`,
        output: output.replace('src/services', 'generated').replace('/index.tsx', ''),
        useOptions: true,
        useUnionTypes: true,
        clientName: upperFirst(camelCase(`${service}Client`))
      })
        .then(() => {
          console.log(`successfully generated for service: ${service}`)
        })
        .catch(() => {
          console.error(`failed to generate for service: ${service}`)
        })
    )
  })

  await Promise.all(promises)
}

load()
