import React, { useState } from 'react'
import { Text, Container, Layout, FontVariation, Color, Avatar, TextInput, Button } from '@harness/uicore'
import { NavButtons } from './NavButton'
import css from './CVStepper.module.scss'

interface StepInterface {
  id: string
  title: string
  panel: React.ReactElement
}
interface CVStepperInterface {
  id: string
  stepList: StepInterface[]
  onChange: (id: string) => void
  selectedTabId: string
}

export const CVStepper = (props: React.PropsWithChildren<CVStepperInterface>): React.ReactElement => {
  const { stepList } = props
  const [selectedStepIndex, setSelectedStepIndex] = useState(0)
  const [selectedStepId, setSelectedStepId] = useState(() => stepList[0].id)
  return (
    <Layout.Vertical margin="large">
      {stepList.map((step, index) => {
        return (
          <Layout.Vertical key={`${step.id}_vertical`}>
            <Layout.Horizontal key={`${step.id}_horizontal`} flex={{ alignItems: 'center', justifyContent: 'start' }}>
              {/* <Icon name="check-alt" color={Color.PRIMARY_7} /> */}
              <Avatar name={(index + 1).toString()} backgroundColor={Color.PRIMARY_7} hoverCard={false} />
              <Text font={{ variation: FontVariation.H5 }} color={Color.PRIMARY_7}>
                {step.title}
              </Text>
            </Layout.Horizontal>
            {selectedStepIndex === index && (
              <Container className={css.alignContainerRight}>
                <TextInput name={'dada'} />
                <NavButtons
                  selectedTabId={selectedStepId}
                  stepList={stepList.map((item: StepInterface) => item.id)}
                  setSelectedTabId={setSelectedStepId}
                  loading={false}
                />
                {/* <Button onClick={() => onChange(selectedStepIndex - 1, stepList.length, setSelectedStepIndex)}>
                  Cancel
                </Button>
                <Button onClick={() => onChange(selectedStepIndex + 1, stepList.length, setSelectedStepIndex)}>
                  Continue
                </Button> */}
              </Container>
            )}
          </Layout.Vertical>
        )
      })}
    </Layout.Vertical>
  )
}

export const onChange = (index: number, length: number, callback: (index: number) => void) => {
  const maxLength = length - 1
  const canUpdate = 0 <= index && index <= maxLength
  if (canUpdate) {
    callback(index)
  }
}
