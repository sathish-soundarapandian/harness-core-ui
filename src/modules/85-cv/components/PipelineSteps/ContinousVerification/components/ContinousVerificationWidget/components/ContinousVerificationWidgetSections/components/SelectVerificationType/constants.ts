/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const continousVerificationTypes = [
  {
    value: 'Auto',
    label: 'Auto',
    icon: { name: 'nav-settings' }
  },
  {
    value: 'Rolling',
    label: 'Rolling Update',
    icon: { name: 'rolling' }
  },
  { value: 'Canary', label: 'Canary', icon: { name: 'canary' } },
  { value: 'Bluegreen', label: 'Blue Green', icon: { name: 'bluegreen' } },
  { value: 'LoadTest', label: 'Load Test', icon: { name: 'lab-test' } }
]
