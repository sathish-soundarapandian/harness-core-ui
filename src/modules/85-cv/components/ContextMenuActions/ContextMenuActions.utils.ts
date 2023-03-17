export const canTogglePopover = ({
  onEdit,
  onDelete,
  otherMenuItems
}: {
  onEdit?: () => void
  onDelete?: () => void
  otherMenuItems?: JSX.Element
}): boolean => Boolean(onEdit || onDelete || otherMenuItems)
