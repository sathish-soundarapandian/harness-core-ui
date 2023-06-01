/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import type { IconName } from '@harness/uicore'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AbstractStepFactory } from '../AbstractStepFactory'
import { Step, StepProps } from '../Step'
import { StepWidget } from '../StepWidget'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
}

class StepOne extends Step<Record<string, any>> {
  protected type = 'step-one' as StepType
  protected stepName = 'stepOne'
  protected referenceId = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

class StepTwo extends Step<Record<string, any>> {
  protected type = 'step-two' as StepType
  protected stepName = 'stepTwo'
  protected referenceId = 'stepTwo'
  protected description = 'step two description'
  protected stepIcon: IconName = 'cross'
  protected stepIconColor?: string | undefined = 'red'
  protected stepIconSize?: number | undefined = 20
  protected isHarnessSpecific = false
  protected isStepNonDeletable = true

  validateInputSet(): Record<string, any> {
    return {}
  }

  getDescription(): any {
    return this.description
  }

  getIconColor(): string | undefined {
    return this.stepIconColor
  }

  getIconSize(): number | undefined {
    return this.stepIconSize
  }

  getIsHarnessSpecific(): boolean {
    return this.isHarnessSpecific
  }

  getIsNonDeletable(): boolean {
    return this.isStepNonDeletable
  }

  protected defaultValues = { b: 'b' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const factory = new StepFactory()
factory.registerStep(new StepOne())
factory.registerStep(new StepTwo())

describe('StepWidget tests', () => {
  test(`shows different steps based on type`, () => {
    let { container } = render(
      <StepWidget allowableTypes={[]} type={'step-one' as StepType} factory={factory} initialValues={{}} />
    )
    expect(container).toMatchSnapshot()
    container = render(
      <StepWidget allowableTypes={[]} type={'step-two' as StepType} factory={factory} initialValues={{}} />
    ).container
    expect(container).toMatchSnapshot()
  })

  test(`shows invalid step`, () => {
    const { container } = render(
      <StepWidget allowableTypes={[]} type={'step-three' as StepType} factory={factory} initialValues={{}} />
    )
    expect(container).toMatchSnapshot()
  })

  test(`shows step and merge initial values`, () => {
    const { container } = render(
      <StepWidget type={'step-one' as StepType} allowableTypes={[]} factory={factory} initialValues={{ a: 'b' }} />
    )
    expect(container).toMatchSnapshot()
  })

  test(`should call on submit of the form`, () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <StepWidget
        type={'step-one' as StepType}
        allowableTypes={[]}
        onUpdate={onSubmit}
        factory={factory}
        initialValues={{ a: 'b' }}
      />
    )
    fireEvent.click(container.children[0])
    expect(onSubmit).toBeCalled()
  })
})

describe('Abstract Factory Tests', () => {
  test('factory getType function returns the correct factory type', () => {
    expect(factory.getType()).toBe('test-factory')
  })

  test('getDescription function returns the correct description', () => {
    // case 1 when getDescription is defined as public method in the step
    expect(factory.getStepDescription('step-two')).toBe('step two description')
    // case 2 when getDescription is not defined as public method in the step
    expect(factory.getStepDescription('step-three')).toBe(undefined)
  })

  test('getName function returns the correct name', () => {
    expect(factory.getStepName('step-two')).toBe('stepTwo')
    expect(factory.getStepName('step-three')).toBe(undefined)
  })

  test('getAdditonalInfo function returns the correct additional info', () => {
    // If no additional data is defined return undefined
    expect(factory.getStepAdditionalInfo('step-two')).toBe(undefined)
    expect(factory.getStepAdditionalInfo('step-three')).toBe(undefined)
  })

  test('getStepIcon function returns the correct icon', () => {
    expect(factory.getStepIcon('step-two')).toBe('cross')
    expect(factory.getStepIcon('step-three')).toBe('disable')
  })

  test('getStepReferenceId function returns the correct reference id ', () => {
    expect(factory.getStepReferenceId('step-two')).toBe('stepTwo')
    expect(factory.getStepReferenceId('step-three')).toBe(undefined)
  })

  test('getStepIconColor function returns the correct icon color ', () => {
    expect(factory.getStepIconColor('step-two')).toBe('red')
    expect(factory.getStepIconColor('step-three')).toBe(undefined)
  })

  test('getStepIconSize function returns the correct icon size ', () => {
    expect(factory.getStepIconSize('step-two')).toBe(20)
    expect(factory.getStepIconSize('step-three')).toBe(undefined)
  })

  test('getStepIsHarnessSpecific function returns the correct boolean ', () => {
    expect(factory.getStepIsHarnessSpecific('step-two')).toBe(false)
    expect(factory.getStepIsHarnessSpecific('step-three')).toBe(false)
  })

  test('getIsStepNonDeletable function returns the correct boolean ', () => {
    expect(factory.getIsStepNonDeletable('step-two')).toBe(true)
    expect(factory.getIsStepNonDeletable('step-thrre')).toBe(undefined)
  })

  test('getStepData function returns the correct step data ', () => {
    expect(factory.getStepData('step-two')).toStrictEqual({
      icon: 'cross',
      name: 'stepTwo',
      referenceId: 'stepTwo',
      type: 'step-two',
      visible: true
    })
  })

  test('getAllStepsDataList function returns the correct stepsData List', () => {
    expect(factory.getAllStepsDataList()).toStrictEqual([
      { icon: 'cross', name: 'stepOne', referenceId: 'stepOne', type: 'step-one', visible: true },
      { icon: 'cross', name: 'stepTwo', referenceId: 'stepTwo', type: 'step-two', visible: true }
    ])
  })

  test('deregister step function removes the step from step bank', () => {
    /***  deregister the step and check if the step is present inside the step bank
     * Do not lexically move this test as other tests depend on this step to be
     * present
     */
    factory.deregisterStep('step-two')

    expect(factory.getStep('step-two')).toBe(undefined)

    // this is to handle the optional param type of getType factory method
    expect(factory.getStep()).toBe(undefined)
  })
})
