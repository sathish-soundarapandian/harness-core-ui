/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { FormikProps, FormikErrors } from 'formik'
import { clone, merge } from 'lodash-es'

interface DeployStageErrorState {
  errors: FormikErrors<unknown>
  forms: { [key: string]: React.MutableRefObject<FormikProps<unknown> | null>[] }
}

interface FormProps<T = unknown> {
  tab: string
  form: React.MutableRefObject<FormikProps<T> | null>
}

export interface StageErrorContextInterface<T = unknown> {
  state: DeployStageErrorState
  subscribeForm: (formData: FormProps<T>) => void
  unSubscribeForm: (formData: FormProps<T>) => void
  submitFormsForTab: (tab: string) => void
  checkErrorsForTab: (tab: string) => Promise<void>
}

export const StageErrorContext = React.createContext<StageErrorContextInterface>({
  state: {
    errors: {},
    forms: {}
  },
  subscribeForm: () => undefined,
  unSubscribeForm: () => undefined,
  submitFormsForTab: () => undefined,
  checkErrorsForTab: () => new Promise<void>(() => undefined)
})

export interface DeployStageErrorProviderProps {
  children: React.ReactNode
}

export function DeployStageErrorProvider(props: DeployStageErrorProviderProps): React.ReactElement {
  const [state, setState] = useState<DeployStageErrorState>({ errors: {}, forms: {} })
  const subscribeForm = React.useCallback((formData: FormProps): void => {
    setState(prevState => {
      const forms = clone(prevState).forms
      const existingForms = forms[formData.tab]
      if (existingForms) {
        existingForms.push(formData.form)
      } else {
        forms[formData.tab] = [formData.form]
      }
      return { ...prevState, forms }
    })
  }, [])
  const unSubscribeForm = React.useCallback((formData: FormProps) => {
    setState(prevState => {
      const forms = clone(prevState).forms
      const existingForms = forms[formData.tab]
      if (existingForms) {
        const index = existingForms.findIndex(form => form === formData.form)
        existingForms.splice(index, 1)
        if (existingForms.length === 0) delete forms[formData.tab]
        return { ...prevState, forms }
      }
      return { ...prevState }
    })
  }, [])
  const submitFormsForTab = (tab: string) => {
    const forms = state.forms[tab]
    if (!forms) return
    const promises = []
    for (const form of forms) {
      form.current?.submitForm()
      promises.push(form.current?.validateForm())
    }
    Promise.all(promises).then(values => {
      let errors = {}
      values.forEach(value => {
        errors = merge(errors, value)
      })
      setState({ ...state, errors })
    })
  }
  const checkErrorsForTab = (tab: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const forms = state.forms[tab]
      if (!forms) resolve()
      const promises = []
      for (const form of forms) {
        form.current?.submitForm()
        promises.push(form.current?.validateForm())
      }
      Promise.all(promises).then(values => {
        let errors = {}
        let errorsCount = 0
        values.forEach(value => {
          errorsCount += Object.keys(value ?? {}).length
          errors = merge(errors, value)
        })
        setState({ ...state, errors })
        if (errorsCount === 0) resolve()
        reject()
      })
    })
  }
  return (
    <StageErrorContext.Provider value={{ state, subscribeForm, unSubscribeForm, checkErrorsForTab, submitFormsForTab }}>
      {props.children}
    </StageErrorContext.Provider>
  )
}

export function useStageErrorContext<T = unknown>(): StageErrorContextInterface<T> {
  return React.useContext(StageErrorContext) as StageErrorContextInterface<T>
}
