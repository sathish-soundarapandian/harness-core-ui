/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { RefObject, Dispatch, SetStateAction, useMemo } from 'react'
import type { FormikErrors, FormikProps } from 'formik'
import { parse } from 'yaml'
import { defaultTo, isEmpty } from 'lodash-es'

import {
  Layout,
  Button,
  ButtonVariation,
  useToaster,
  VisualYamlSelectedView as SelectedView,
  Color
} from '@harness/uicore'

import { useStrings } from 'framework/strings'

import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'

import { useTabWizardContext } from '../context/TabWizardContext'

import css from './TabWizardFooter.module.scss'

interface TabWizardFooterProps {
  selectedTabIndex: number
  onHide: () => void
  submitLabel?: string
  disableSubmit?: boolean
  lastTab: boolean
  onYamlSubmit?: (val: any) => void
  yamlObjectKey?: string
  yamlHandler?: YamlBuilderHandlerBinding
  elementsRef: { current: RefObject<HTMLSpanElement>[] }
  yamlBuilderReadOnlyModeProps?: YamlBuilderProps
  formikProps: FormikProps<any>
  loadingYamlView?: boolean
  validate?: (arg?: { latestYaml?: string }) => Promise<FormikErrors<any>> | FormikErrors<any>
  setSubmittedForm: Dispatch<SetStateAction<boolean>>
  changeTabs: (index: number) => void
}

export default function TabWizardFooter({
  selectedTabIndex,
  onHide,
  submitLabel,
  disableSubmit,
  lastTab,
  onYamlSubmit,
  yamlObjectKey,
  yamlHandler,
  elementsRef,
  formikProps,
  yamlBuilderReadOnlyModeProps,
  loadingYamlView,
  validate,
  setSubmittedForm,
  changeTabs
}: TabWizardFooterProps): JSX.Element {
  const { getString } = useStrings()
  const { showError } = useToaster()

  const { selectedView } = useTabWizardContext()
  const isYamlView = useMemo(() => selectedView === SelectedView.YAML, [selectedView])

  const invalidYamlString = getString('common.validation.invalidYamlText')

  return (
    <Layout.Horizontal
      className={css.footer}
      width={'100%'}
      padding={{ top: 'medium', right: 'xlarge', bottom: 'medium', left: 'xlarge' }}
      flex={{
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}
      spacing="medium"
      background={Color.FORM_BG}
    >
      <>
        {!isYamlView && (
          <>
            {selectedTabIndex !== 0 && (
              <Button
                text={getString('back')}
                variation={ButtonVariation.SECONDARY}
                icon="chevron-left"
                minimal
                onClick={() => {
                  changeTabs(selectedTabIndex - 1)
                  formikProps.validateForm()
                }}
              />
            )}
            {!lastTab && (
              <Button
                text={getString('continue')}
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                onClick={async () => {
                  const formErrors = await formikProps.validateForm()
                  if (!isEmpty(formErrors)) {
                    formikProps.setErrors(formErrors)
                    const newTouchedObj: { [key: string]: boolean } = {}
                    Object.keys(formErrors).forEach(k => (newTouchedObj[k] = true))
                    formikProps.setTouched({ ...formikProps.touched, ...newTouchedObj }) // required to display
                  }
                  changeTabs(selectedTabIndex + 1)
                }}
              />
            )}
            {lastTab && (
              <Button
                text={defaultTo(submitLabel, getString('submit'))}
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                type="submit"
                disabled={disableSubmit}
                onClick={async () => {
                  setSubmittedForm(true)

                  if (
                    elementsRef.current.some(
                      (element): boolean =>
                        !!element?.current?.firstElementChild?.classList?.contains('bp3-icon-warning-sign')
                    )
                  ) {
                    showError(getString('addressErrorFields'))
                  }
                  const validateErrors = await validate?.()
                  if (isEmpty(validateErrors)) {
                    // submit form if given validate is empty
                    formikProps.submitForm()
                  }
                }}
              />
            )}
          </>
        )}
        {isYamlView && yamlBuilderReadOnlyModeProps && !loadingYamlView && (
          <Button
            text={defaultTo(submitLabel, getString('submit'))}
            variation={ButtonVariation.PRIMARY}
            rightIcon="chevron-right"
            onClick={async () => {
              setSubmittedForm(true)
              const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
              const errorsYaml =
                (yamlHandler?.getYAMLValidationErrorMap() as unknown as Map<number, string>) ||
                /* istanbul ignore next */ ''
              if (errorsYaml?.size > 0) {
                showError(invalidYamlString)
                return
              }

              if (!isEmpty(await validate?.({ latestYaml }))) {
                return
              } else {
                formikProps.setSubmitting(true)
              }

              try {
                const parsedYaml = parse(latestYaml)
                const processedFormik = yamlObjectKey ? parsedYaml?.[yamlObjectKey] : parsedYaml
                if (!parsedYaml) {
                  /* istanbul ignore next */
                  showError(invalidYamlString)
                  return
                }
                formikProps.setSubmitting(true)
                onYamlSubmit?.(processedFormik)
              } catch (e) {
                /* istanbul ignore next */
                showError(invalidYamlString)
                return
              }
            }}
            disabled={disableSubmit}
          />
        )}
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onHide} />
      </>
    </Layout.Horizontal>
  )
}
