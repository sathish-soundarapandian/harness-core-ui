/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import { get } from 'lodash-es'
const generateNewKey = (): string => uuid()
const ExperimentalInput = (props: any): React.ReactElement => {
  const formikValue = get(props?.formik?.values, props.name, '')
  const ref = React.useRef()
  React.useEffect(() => {
    if (!ref?.current && ref.current !== formikValue) {
      ref.current = formikValue
    }
  }, [formikValue])
  const key = React.useMemo((): string => {
    return generateNewKey()
  }, [ref.current])
  return <FormInput.MultiTypeInput key={key} {...props} />
}

export default ExperimentalInput
