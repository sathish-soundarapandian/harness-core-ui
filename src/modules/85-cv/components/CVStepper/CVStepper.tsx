import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import {
  Text,
  Container,
  Layout,
  FontVariation,
  Color,
  Avatar,
  Utils,
  Card,
  Icon,
  // TextInput,
  Button,
  ButtonVariation
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
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

interface StyledStepperCircleInterface {
  disabled?: boolean
}

export const StepperCircle = styled.div`
  width: var(--spacing-xxxlarge);
  height: var(--spacing-xxxlarge);
  line-height: var(--spacing-xxxlarge);
  border-radius: 50%;
  font-size: 16px;
  color: #fff;
  text-align: center;
  background-color: ${(props: StyledStepperCircleInterface) => (props.disabled ? Color.PRIMARY_10 : Color.PRIMARY_7)};
`

export const CVStepper = (props: React.PropsWithChildren<CVStepperInterface>): React.ReactElement => {
  const { stepList } = props
  const { getString } = useStrings()
  const [selectedStepIndex, setSelectedStepIndex] = useState(0)

  useEffect(() => {}, [])

  return (
    <Layout.Vertical margin="large">
      {stepList.map((step, index) => {
        return (
          <>
            <Layout.Vertical key={`${step.id}_vertical`} spacing="medium">
              <Layout.Horizontal
                style={{ cursor: 'pointer' }}
                key={`${step.id}_horizontal`}
                onClick={() => onChange(index, stepList.length, setSelectedStepIndex)}
                flex={{ alignItems: 'center', justifyContent: 'start' }}
              >
                {/* <StepperCircle
                disabled={selectedStepIndex < index}
                onClick={() => onChange(index, stepList.length, setSelectedStepIndex)}
              >
                <Icon
                  name="check-alt"
                  size={16}
                  background={selectedStepIndex > index ? Color.PRIMARY_7 : Color.PRIMARY_10}
                  color={Color.WHITE}
                />
              </StepperCircle> */}

                {/* <Avatar
                hoverCard={false}
                name={(index + 1).toString()}
                backgroundColor={Color.PRIMARY_7}
                onClick={() => onChange(index, stepList.length, setSelectedStepIndex)}
              /> */}
                <Icon
                  name={selectedStepIndex <= index ? 'ring' : 'tick-circle'}
                  size={26}
                  margin="small"
                  color={selectedStepIndex <= index ? 'primary9' : 'primary7'}
                />
                <Text
                  font={{ variation: FontVariation.H5 }}
                  onClick={() => onChange(index, stepList.length, setSelectedStepIndex)}
                  color={selectedStepIndex > index ? Color.PRIMARY_7 : Color.PRIMARY_10}
                >
                  {step.title}
                </Text>
              </Layout.Horizontal>
              {selectedStepIndex > index && (
                <Container className={css.alignContainerRight}>
                  <Text> Preview Text </Text>
                </Container>
              )}
              {selectedStepIndex === index && (
                <Container className={css.alignContainerRight}>
                  <Card className={css.card}>{'Text'}</Card>
                  <Layout.Horizontal spacing="small" padding={{ top: 'xlarge' }}>
                    <Button
                      variation={ButtonVariation.SECONDARY}
                      onClick={() => onChange(0, stepList.length, setSelectedStepIndex)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      text={selectedStepIndex === stepList.length - 1 ? getString('save') : getString('continue')}
                      onClick={() => onChange(selectedStepIndex + 1, stepList.length, setSelectedStepIndex)}
                    />
                  </Layout.Horizontal>
                </Container>
              )}
            </Layout.Vertical>
            <div className={css.divider}></div>
          </>
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

// function adjustLine(from, to, line) {
//   const fT = from.offsetTop + from.offsetHeight / 2
//   const tT = to.offsetTop + to.offsetHeight / 2
//   const fL = from.offsetLeft + from.offsetWidth / 2
//   const tL = to.offsetLeft + to.offsetWidth / 2

//   const CA = Math.abs(tT - fT)
//   const CO = Math.abs(tL - fL)
//   const H = Math.sqrt(CA * CA + CO * CO)
//   let ANG = (180 / Math.PI) * Math.acos(CA / H)

//   let top = 0
//   let left = 0
//   if (tT > fT) {
//     top = (tT - fT) / 2 + fT
//   } else {
//     top = (fT - tT) / 2 + tT
//   }
//   if (tL > fL) {
//     left = (tL - fL) / 2 + fL
//   } else {
//     left = (fL - tL) / 2 + tL
//   }

//   if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
//     ANG *= -1
//   }
//   top -= H / 2

//   line.style['-webkit-transform'] = 'rotate(' + ANG + 'deg)'
//   line.style['-moz-transform'] = 'rotate(' + ANG + 'deg)'
//   line.style['-ms-transform'] = 'rotate(' + ANG + 'deg)'
//   line.style['-o-transform'] = 'rotate(' + ANG + 'deg)'
//   line.style['-transform'] = 'rotate(' + ANG + 'deg)'
//   line.style.top = top + 'px'
//   line.style.left = left + 'px'
//   line.style.height = H + 'px'
// }
// adjustLine(document.getElementById('div1'), document.getElementById('div2'), document.getElementById('line'))
