export interface MetricMenuProps {
  onEdit?(): void
  onDelete?(itemName: string, index: number): void
  titleText: string
  contentText: string | JSX.Element
  confirmButtonText?: string
  deleteLabel?: string
  editLabel?: string
  itemName: string
  index: number
  metricThresholdTitleText?: string
  metricThresholdCancelButtonText?: string
  metricThresholdWarningContentText?: string
  showPromptOnDelete?: boolean
}
