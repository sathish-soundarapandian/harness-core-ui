/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect } from 'react'
import { pickBy, merge } from 'lodash-es'

interface SyncStepDataValuesProps {
  values: any
  listenToValues: any
  onUpdate: (val: any) => void
}

export default function SyncStepDataValues({ values, listenToValues, onUpdate }: SyncStepDataValuesProps) {
  useEffect(() => {
    const update = pickBy({ ...listenToValues }, value => !!value)
    onUpdate(merge(values, update))
  }, [listenToValues])
  return null
}
