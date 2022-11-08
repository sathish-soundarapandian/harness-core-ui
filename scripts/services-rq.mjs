/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import prompts from 'prompts'
import { $ } from 'zx'
;(async () => {
  const services = ['cd-ng', 'pipeline']

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

  for (const index of response.services) {
    const service = services[index]
    await $`npx oats import --config configs/oats.config.ts --service ${service} --clean`
  }

  await $`npx prettier --write "./src/services/*-rq/**/*.{ts,tsx}"`
})()
