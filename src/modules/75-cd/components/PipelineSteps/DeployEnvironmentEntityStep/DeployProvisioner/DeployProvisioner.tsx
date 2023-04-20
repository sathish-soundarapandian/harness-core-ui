/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { parse } from 'yaml'
import { useFormikContext } from 'formik'
import { defaultTo, get, isEmpty, isNil, noop } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'

import { Checkbox, Container, shouldShowError, useToaster } from '@harness/uicore'

import {
  ExecutionElementConfig,
  GetProvisionerExecutionStrategyYamlQueryParams,
  useGetProvisionerExecutionStrategyYaml
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import useChooseProvisioner from '../../InfraProvisioning/ChooseProvisioner'
import InfraProvisioningEntityBase from '../../InfraProvisioning/InfraProvisoningEntityBase'
import type { InfraProvisioningData } from '../../InfraProvisioning/InfraProvisioning'
import type { DeployEnvironmentEntityFormState } from '../types'

interface DeployProvisionerProps {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
}

const isProvisionerEmpty = (provisionerData?: ExecutionElementConfig): boolean => {
  return isEmpty(provisionerData?.steps) && isEmpty(provisionerData?.rollbackSteps)
}

export const DeployProvisioner = ({ initialValues, readonly }: DeployProvisionerProps): JSX.Element => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const [provisionerEnabled, setProvisionerEnabled] = useState<boolean>(
    !isProvisionerEmpty(get(initialValues, 'provisioner'))
  )

  const {
    data: provisionerYamlData,
    loading,
    refetch,
    error
  } = useGetProvisionerExecutionStrategyYaml({
    lazy: true
  })

  const { setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()

  const { showModal } = useChooseProvisioner({
    onSubmit: (data: { selectedProvisioner: GetProvisionerExecutionStrategyYamlQueryParams['provisionerType'] }) => {
      setProvisionerEnabled(true)
      refetch({
        queryParams: {
          provisionerType: data.selectedProvisioner
        }
      })
    },
    onClose: noop
  })

  useEffect(() => {
    if (!loading && !isEmpty(provisionerYamlData?.data)) {
      try {
        const provisionerSnippet = parse(defaultTo(provisionerYamlData?.data, ''))
        if (provisionerSnippet) {
          setFieldValue('provisioner', provisionerSnippet.provisioner)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    if (error && shouldShowError(error)) {
      showError(getRBACErrorMessage(error))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const getProvisionerData = (): Pick<InfraProvisioningData, 'provisioner' | 'originalProvisioner'> => {
    let provisioner = get(initialValues, 'provisioner')
    provisioner = isNil(provisioner)
      ? {
          steps: [],
          rollbackSteps: []
        }
      : { ...provisioner }

    if (isNil(provisioner.steps)) {
      provisioner.steps = []
    }
    if (isNil(provisioner.rollbackSteps)) {
      provisioner.rollbackSteps = []
    }

    return {
      provisioner: { ...provisioner },
      originalProvisioner: { ...provisioner }
    }
  }

  const onCheckboxChange = (event: React.FormEvent<HTMLInputElement>): void => {
    if (!event.currentTarget.checked) {
      setFieldValue('provisioner', undefined)
      setProvisionerEnabled(false)
    } else {
      showModal({
        provisioner: { steps: [], rollbackSteps: [] }
      })
    }
  }

  return (
    <>
      <Checkbox
        name="provisionerEnabled"
        disabled={loading || readonly}
        label={getString('pipelineSteps.deploy.provisioner.enableProvisionerLabel')}
        onChange={onCheckboxChange}
        checked={provisionerEnabled}
      />

      {loading ? (
        <Container>
          <Spinner />
        </Container>
      ) : (
        provisionerEnabled && (
          <InfraProvisioningEntityBase
            initialValues={getProvisionerData()}
            onUpdate={(value: InfraProvisioningData) => {
              setFieldValue('provisioner', value.provisioner)
            }}
          />
        )
      )}
    </>
  )
}
