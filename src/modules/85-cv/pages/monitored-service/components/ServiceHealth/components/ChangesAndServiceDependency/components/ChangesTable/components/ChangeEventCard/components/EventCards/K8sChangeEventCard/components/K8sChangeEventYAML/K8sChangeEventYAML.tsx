/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import type { K8sChangeEventYAMLProps } from './K8sChangeEventYAML.types'

export default function K8sChangeEventYAML(props: K8sChangeEventYAMLProps): JSX.Element {
  const { yaml } = props
  const { getString } = useStrings()
  return (
    <Accordion>
      <Accordion.Panel
        id="eventYAML"
        summary={getString('cv.seeYAML')}
        details={
          <MonacoEditor
            language="yaml"
            height={500}
            width="100%"
            value={yaml}
            options={
              {
                theme: 'hc-black',
                readOnly: true,
                wordBasedSuggestions: false,
                minimap: {
                  enabled: false
                },
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 13
              } as any
            }
          />
        }
      />
    </Accordion>
  )
}
