import React, { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { defaultTo, get, isEmpty, isNil, noop } from 'lodash-es'
import YAML from 'yaml'
import { Spinner } from '@blueprintjs/core'

import { Checkbox, Container } from '@harness/uicore'

import { ExecutionElementConfig, getProvisionerExecutionStrategyYamlPromise } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import useChooseProvisioner from '../../InfraProvisioning/ChooseProvisioner'
import InfraProvisioningEntityBase from '../../InfraProvisioning/InfraProvisoningEntityBase'
import type { InfraProvisioningData, ProvisionersOptions } from '../../InfraProvisioning/InfraProvisioning'
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

  const [provisionerEnabled, setProvisionerEnabled] = useState<boolean>(
    !isProvisionerEmpty(get(initialValues, 'provisioner'))
  )
  const [provisionerSnippetLoading, setProvisionerSnippetLoading] = useState<boolean>(false)
  const [provisionerType, setProvisionerType] = useState<ProvisionersOptions>('TERRAFORM')

  const { setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()

  const { showModal } = useChooseProvisioner({
    onSubmit: (data: InfraProvisioningData) => {
      setFieldValue('provisioner', data.provisioner)
      setProvisionerType(data.selectedProvisioner as ProvisionersOptions)
      setProvisionerEnabled(true)
    },
    onClose: noop
  })

  // load and apply provisioner snippet to the stage
  useEffect(() => {
    if (
      initialValues &&
      isProvisionerEmpty(get(initialValues, 'provisioner')) &&
      provisionerEnabled &&
      provisionerType
    ) {
      setProvisionerSnippetLoading(true)
      getProvisionerExecutionStrategyYamlPromise({
        // eslint-disable-next-line
        queryParams: { provisionerType: provisionerType }
      }).then(res => {
        const provisionerSnippet = YAML.parse(defaultTo(res?.data, ''))
        if (provisionerSnippet) {
          setFieldValue('provisioner', provisionerSnippet.provisioner)
          setProvisionerSnippetLoading(false)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provisionerEnabled, provisionerType])

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

  return (
    <>
      <Checkbox
        name="provisionerEnabled"
        disabled={provisionerSnippetLoading || readonly}
        label={getString('pipelineSteps.deploy.provisioner.enableProvisionerLabel')}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          if (!event.currentTarget.checked) {
            setFieldValue('provisioner', undefined)
            setProvisionerEnabled(false)
          } else {
            showModal({
              provisioner: { steps: [], rollbackSteps: [] }
            })
          }
        }}
        checked={provisionerEnabled}
      />

      {provisionerSnippetLoading ? (
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
