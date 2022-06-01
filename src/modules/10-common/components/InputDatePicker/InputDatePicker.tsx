import React, { useState, useRef } from 'react'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { DateRange, DateRangePicker } from '@blueprintjs/datetime'
import { DynamicPopover } from '..'
import type { DynamicPopoverHandlerBinding } from '@common/exports'
import { useGlobalEventListener } from '@common/hooks'
interface InputDatePickerProps {
  name: string
  formikProps: any
}

declare global {
  interface WindowEventMap {
    CLOSE_DATE_PICKER_POPOVER: CustomEvent<string>
  }
}

export default function InputDatePicker(props: InputDatePickerProps) {
  const { getString } = useStrings()
  const ref = useRef(null)
  const { name, formikProps } = props
  const [text, setText] = useState<string>('')
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<{}> | undefined
  >()
  const getValue = (): DateRange | undefined => {
    return [new Date(chartTimeRange?.startTime || 0), new Date(chartTimeRange?.endTime || 0)]
  }
  const [chartTimeRange, setChartTimeRange] = useState<{ startTime: number; endTime: number }>()
  useGlobalEventListener('CLOSE_DATE_PICKER_POPOVER', () => {
    dynamicPopoverHandler?.hide()
  })
  const renderPopover = () => {
    return (
      <div onBlur={() => dynamicPopoverHandler?.hide()}>
        <DateRangePicker
          allowSingleDayRange={true}
          shortcuts={true}
          defaultValue={getValue()}
          minDate={new Date(0)}
          maxDate={new Date()}
          onChange={selectedDates => {
            const dateStr = `${selectedDates[0]?.toLocaleDateString()} - ${selectedDates[1]?.toLocaleDateString()}`
            formikProps?.setValues({
              ...formikProps.values,
              timeRange: {
                startTime: selectedDates[0]?.getTime(),
                endTime: selectedDates[1]?.getTime()
              }
            })
            setText(dateStr)
            setChartTimeRange?.({
              startTime: selectedDates[0]?.getTime() || 0,
              endTime: selectedDates[1]?.getTime() || 0
            })
          }}
        />
      </div>
    )
  }
  return (
    <>
      <div
        data-nodeid="inputDatePicker"
        ref={ref}
        onClick={e => {
          e.stopPropagation()
          dynamicPopoverHandler?.show(`[data-nodeid="inputDatePicker"]`, {})
        }}
      >
        <FormInput.Text label={'Timeframe'} name={name} placeholder={text || getString('common.selectTimeFrame')} />
      </div>
      <DynamicPopover render={renderPopover} bind={setDynamicPopoverHandler} />
    </>
  )
}
