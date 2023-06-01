/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState, useCallback } from 'react'
import { parse } from 'yaml'
import { defaultTo, isEqual } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { InfrastructureConfig } from 'services/cd-ng'
import useDiffDialog from '@common/hooks/useDiffDialog'
import { stringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'

interface Params {
  selectedInfrastructure: string
}

interface UseInfrastructureUnsavedChangesReturnType {
  openUnsavedChangesDiffModal: () => void
  handleInfrastructureUpdate: (infraValues: InfrastructureConfig) => void
  isInfraUpdated: boolean
  updatedInfrastructure?: InfrastructureConfig
}

export function useInfrastructureUnsavedChanges(params: Params): UseInfrastructureUnsavedChangesReturnType {
  const { selectedInfrastructure } = params
  const [isInfraUpdated, setIsInfraUpdated] = useState(false)
  const [updatedInfrastructure, setUpdatedInfrastructure] = useState<InfrastructureConfig | undefined>()
  const { getString } = useStrings()

  const { open: openUnsavedChangesDiffModal } = useDiffDialog({
    originalYaml: selectedInfrastructure,
    updatedYaml: stringify(updatedInfrastructure),
    title: getString('cd.infraDefinitionDiffTitle')
  })

  useEffect(() => {
    if (selectedInfrastructure && updatedInfrastructure) {
      const originalInfrastructure = parse(defaultTo(selectedInfrastructure, '{}')) as InfrastructureConfig
      setIsInfraUpdated(!isEqual(originalInfrastructure, updatedInfrastructure))
    }
  }, [selectedInfrastructure, updatedInfrastructure])

  const handleInfrastructureUpdate = useCallback(
    (updatedInfraValues: InfrastructureConfig) => {
      sanitize(updatedInfraValues, { removeEmptyString: false, removeEmptyArray: false, removeEmptyObject: false })
      setUpdatedInfrastructure(
        prevInfra =>
          ({
            infrastructureDefinition: {
              ...prevInfra?.infrastructureDefinition,
              ...updatedInfraValues.infrastructureDefinition
            }
          } as InfrastructureConfig)
      )
    },
    [setUpdatedInfrastructure]
  )

  // Initialize
  useEffect(() => {
    if (selectedInfrastructure) {
      handleInfrastructureUpdate(parse(defaultTo(selectedInfrastructure, '{}')) as InfrastructureConfig)
    }
  }, [selectedInfrastructure])

  return {
    openUnsavedChangesDiffModal,
    handleInfrastructureUpdate,
    isInfraUpdated,
    updatedInfrastructure
  }
}
