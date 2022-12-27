/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useRef } from 'react'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'

export default function usePercentageRolloutEqualiser(variations: string[], active = true): void {
  const { setFieldValue, values, validateForm } = useFormikContext()
  const lastValues = useRef<typeof values>(values)

  useEffect(() => {
    if (active && variations.length === 2) {
      const varA = parseInt(get(values, variations[0]) || 0)
      const varB = parseInt(get(values, variations[1]) || 0)

      if (!varA && !varB) {
        setFieldValue(variations[0], 50, false)
        setFieldValue(variations[1], 50, false)

        setTimeout(validateForm, 100)
      } else if (varA + varB !== 100) {
        const previousVarB = parseInt(get(lastValues.current, variations[1]) || 0)

        if (varB !== previousVarB) {
          setFieldValue(variations[0], 100 - varB, true)
        } else {
          setFieldValue(variations[1], 100 - varA, true)
        }
      }

      lastValues.current = values
    }
  }, [active, setFieldValue, validateForm, values, variations])
}
