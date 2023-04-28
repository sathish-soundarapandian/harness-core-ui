/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ServiceHook, ServiceHookWrapper } from 'services/cd-ng'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import type { KubernetesServiceHooksProps } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import serviceHookSourceBaseFactory from '@cd/factory/ServiceHookSourceFactory/ServiceHookSourceFactory'
import { fromPipelineInputTriggerTab } from '@cd/components/PipelineSteps/K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import { getManifestTriggerSetValues } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import { ServiceHooksMap } from '@pipeline/components/ServiceHooks/ServiceHooksHelper'
import css from '@cd/components/PipelineSteps/SshServiceSpec/SshServiceSpec.module.scss'

interface ServiceHookInputFieldProps extends KubernetesServiceHooksProps {
  hookData: ServiceHook
}

const ServiceHookInputField = (props: ServiceHookInputFieldProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isTemplatizedView(props.stepViewType)
  const isServiceHookRuntime = runtimeMode && !!get(props.template, 'hooks', false)

  const serviceHookSource = serviceHookSourceBaseFactory.getServiceHookSource(
    defaultTo(props?.hookData?.storeType, ServiceHooksMap.Inline)
  )
  const serviceHookDefaultObj = props.hooks?.find(
    serviceHookData => Object.values(serviceHookData)?.[0]?.identifier === props.hookData?.identifier
  ) as ServiceHookWrapper
  const serviceHookDefaultValue = serviceHookDefaultObj['preHook'] || serviceHookDefaultObj['postHook']

  useEffect(() => {
    /* instanbul ignore else */ /* istanbul ignore next */
    if (fromPipelineInputTriggerTab(props.formik, props.fromTrigger)) {
      const manifestTriggerData = getManifestTriggerSetValues(
        props.initialValues,
        props.formik,
        props.stageIdentifier,
        props.hookPath as string
      )
      !isEmpty(manifestTriggerData) &&
        props.formik.setFieldValue(`${props.path}.${props.hookPath}`, manifestTriggerData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* istanbul ignore next */
  if (!serviceHookSource) {
    return null
  }

  return (
    <div key={props.hookData?.identifier}>
      <Text className={css.inputheader} margin={{ top: 'medium' }}>
        {!props.fromTrigger && get(props.hookData, 'identifier', '')}
      </Text>
      {serviceHookSource &&
        serviceHookSource.renderContent({
          ...props,
          isServiceHookRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          hookData: serviceHookDefaultValue
        })}
    </div>
  )
}

export function ServiceHooksConfig(props: KubernetesServiceHooksProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.ServiceHooks`}>
      {!props.fromTrigger && <div className={css.subheading}> {getString('pipeline.serviceHooks.label')}</div>}
      {props.template.hooks?.map((hookObj, index) => {
        const hookData = hookObj['preHook'] || hookObj['postHook']
        const hookType = Object.keys(hookObj)[0] // preHook or postHook

        if (!hookData || !props.hooks?.length) {
          /* istanbul ignore next */ return null
        }

        const hookPath = `hooks[${index}].[${hookType}]`

        return <ServiceHookInputField {...props} hookData={hookData} hookPath={hookPath} key={hookData?.identifier} />
      })}
    </div>
  )
}
