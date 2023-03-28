/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { $ } from 'zx'
;(async () => {
  const config = await import('../configs/pre-qa-swagger.config.js')
  const services = Object.keys(config.default)

  services.sort()

  for (let i = 0; i < services.length; i++) {
    const service = services[i]
    const { output } = config.default[service]
    await $`npx restful-react import --config configs/pre-qa-swagger.config.js ${service}`
    await $`npx prettier --write ${output}`
    await $`scripts/license/stamp.sh ${output}`
  }
})()
