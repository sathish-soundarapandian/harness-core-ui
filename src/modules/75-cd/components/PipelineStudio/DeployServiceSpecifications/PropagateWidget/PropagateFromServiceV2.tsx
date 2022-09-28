/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { FormInput, SelectOption, Layout, Radio, Container, HarnessDocTooltip } from '@harness/uicore'
import { noop, isEmpty } from 'lodash-es'
import { Color } from '@harness/design-system'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import css from './PropagateWidget.module.scss'

interface PropagateFromServiceV2Props {
  setupModeType: string
  isReadonly: boolean
  previousStageList: SelectOption[]
  selectedPropagatedState: SelectOption | string
  onPropogatedStageSelect: (value: SelectOption) => void
  onStageServiceChange: (value: string) => void
}

export default function PropagateFromServiceV2({
  setupModeType,
  isReadonly,
  previousStageList,
  selectedPropagatedState,
  onPropogatedStageSelect,
  onStageServiceChange
}: PropagateFromServiceV2Props): JSX.Element {
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Formik<{ setupModeType: string; selectedPropagatedState: SelectOption | string }>
      onSubmit={noop}
      validationSchema={Yup.object().shape({
        selectedPropagatedState: Yup.object().when('setupModeType', {
          is: setupMode.PROPAGATE,
          then: Yup.object().test(
            'selectedPropagatedState',
            getString('cd.pipelineSteps.infraTab.stageIsRequired'),
            propagatedState => !isEmpty(propagatedState.value)
          )
        })
      })}
      initialValues={{
        setupModeType: setupModeType,
        selectedPropagatedState: selectedPropagatedState
      }}
      enableReinitialize
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
        formikRef.current = formik as FormikProps<unknown> | null
        const { values } = formik
        return (
          <Container>
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'xxxlarge'}>
              <section onClick={() => onStageServiceChange(setupMode.PROPAGATE)} className={css.stageSelectionGrid}>
                <Layout.Horizontal flex spacing={'medium'}>
                  <Radio
                    color={Color.GREY_500}
                    font={{ weight: 'semi-bold' }}
                    label={'Propagate from:'}
                    checked={values.setupModeType === setupMode.PROPAGATE}
                    className={css.propagateFromRadio}
                  />
                  <FormInput.Select
                    className={css.stageSelectDropDown}
                    name="selectedPropagatedState"
                    placeholder={getString('pipeline.selectStagePlaceholder')}
                    disabled={values.setupModeType === setupMode.DIFFERENT || isReadonly}
                    onChange={value => {
                      formik.setFieldValue('selectedPropagatedState', value)
                      onPropogatedStageSelect(value)
                    }}
                    value={values.selectedPropagatedState as SelectOption}
                    items={previousStageList}
                  />
                  <span data-tooltip-id="stagePropogate" />
                  <HarnessDocTooltip useStandAlone={true} tooltipId="stagePropogate" />
                </Layout.Horizontal>
              </section>

              <section onClick={() => onStageServiceChange(setupMode.DIFFERENT)} className={css.stageSelectionGrid}>
                <Radio
                  color={Color.GREY_500}
                  font={{ weight: 'semi-bold' }}
                  label={getString('cd.pipelineSteps.serviceTab.differentService')}
                  checked={values.setupModeType === setupMode.DIFFERENT}
                />
              </section>
            </Layout.Horizontal>
          </Container>
        )
      }}
    </Formik>
  )
}
