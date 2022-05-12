/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  AvatarGroup,
  Layout,
  Text,
  SelectOption,
  Select,
  MultiSelect,
  MultiSelectOption,
  TextInput,
  Icon,
  Button,
  SimpleTagInput,
  Container
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { Dialog, Menu, Spinner } from '@blueprintjs/core'
import { assoc, compose, prop } from 'lodash/fp'
import { uniq } from 'lodash-es'
import cx from 'classnames'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableStateSnapshot,
  DroppableStateSnapshot
} from 'react-beautiful-dnd'
import {
  Clause,
  Feature,
  Variation,
  Serve,
  VariationMap,
  useGetAllTargets,
  ServingRule,
  TargetMap,
  GetAllTargetsQueryParams
} from 'services/cf'
import { useStrings } from 'framework/strings'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import { unescapeI18nSupportedTags, useBucketByItems } from '@cf/utils/CFUtils'
import { extraOperators, extraOperatorReference, useOperatorsFromYaml, CFVariationColors } from '@cf/constants'
import { useTargetAttributes } from '@cf/hooks/useTargetAttributes'
import { sortOptions } from '@cf/utils/sortOptions'
import { VariationWithIcon } from '../VariationWithIcon/VariationWithIcon'
import PercentageRollout from './PercentageRollout'
import css from './TabTargeting.module.scss'

export interface RuleData {
  ruleId?: string
  serve: Serve
  clauses: Clause[]
  priority: number
}

type Serving = VariationMap

interface Option<T> {
  label: string
  value: T
}

type Finder<T> = (value: T) => Option<T> | undefined

const toOption = (x: string): Option<string> => ({
  label: x,
  value: x
})
function useOptions<T>(as: T[], mapper: (a: T) => string): [Option<string>[], Finder<string>] {
  const opts = as.map(mapper).map(toOption)
  return [opts, (val: string) => opts.find(o => o.value === val)]
}

const emptyClause = (): Clause => ({
  id: '',
  op: 'starts_with',
  attribute: '',
  values: [],
  negate: false
})

const emptyRule = (priority = -1): RuleData => ({
  serve: { variation: '' },
  clauses: [emptyClause()],
  priority
})

const emptyServing = (): Serving => ({
  variation: '',
  targets: []
})

const addTargetAvatar = (onAdd: () => void) => ({
  name: '+',
  color: Color.BLUE_500,
  backgroundColor: Color.GREY_200,
  onClick: onAdd
})

const extraOps = extraOperators.customRules
const matchSegment = extraOperatorReference.customRules.matchSegment
const useCustomRulesOperators = () => useOperatorsFromYaml(extraOps)

interface ClauseRowProps {
  index: number
  label: string
  attribute: string
  operator: SelectOption
  values: string[]
  isLast: boolean
  isSingleClause: boolean
  error: boolean
  onOperatorChange: (op: string) => void
  onAttributeChange: (attr: string) => void
  onValuesChange: (values: string[]) => void
  onAddNewRow: () => void
  onRemoveRow: () => void
}

const ClauseRow: React.FC<ClauseRowProps> = props => {
  const {
    index,
    label,
    attribute,
    operator,
    values,
    isLast,
    isSingleClause,
    error,
    onAttributeChange,
    onOperatorChange,
    onValuesChange,
    onAddNewRow,
    onRemoveRow
  } = props
  const [operators, isSingleValued] = useCustomRulesOperators()
  const isSingleValuedOperator = isSingleValued(operator.value as string)
  const valueOpts = values.map(toOption)
  const handleOperatorChange = (data: SelectOption) => onOperatorChange(data.value as string)
  const handleValuesChange = (data: MultiSelectOption[]) => onValuesChange(data.map(x => x.value as string))
  const handleSingleValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleValuesChange([toOption(e.target.value)])
  const { bucketByItems, addBucketByItem } = useBucketByItems()
  const { targetAttributes } = useTargetAttributes()
  const bucketBySelectValue = useMemo(() => {
    return bucketByItems.find(item => item.value === attribute)
  }, [bucketByItems, attribute])

  const sortedBucketByItems = useMemo<Option<string>[]>(() => sortOptions(bucketByItems), [bucketByItems])

  useEffect(() => {
    addBucketByItem(attribute as string)
  }, [attribute, addBucketByItem])

  useEffect(() => {
    if (targetAttributes.length) {
      targetAttributes.forEach(addBucketByItem)
    }
  }, [targetAttributes, addBucketByItem])

  const actions = [
    <Icon
      key="delete"
      name="delete"
      style={{ visibility: isSingleClause ? 'hidden' : 'visible' }}
      size={18}
      color={Color.ORANGE_500}
      onClick={onRemoveRow}
    />,
    <Icon
      key="add"
      name="add"
      style={{ visibility: isSingleClause || isLast ? 'visible' : 'hidden' }}
      size={18}
      color={Color.BLUE_500}
      onClick={onAddNewRow}
    />
  ]

  if (isSingleClause) {
    actions.reverse()
  }

  const height = '36px'
  type InputEventType = { target: { value: string } }
  const onSelectEvent = (event: InputEventType): void => {
    const { value } = event.target
    onAttributeChange(value)
    addBucketByItem(value)
  }

  return (
    <Container>
      <Layout.Horizontal spacing="small">
        <Text
          font="normal"
          style={{ display: 'flex', height, alignItems: 'center', justifyContent: 'flex-end', minWidth: '80px' }}
        >
          {label}
        </Text>
        <div style={{ flex: '1' }}>
          <Select
            name="bucketBy"
            value={bucketBySelectValue}
            items={sortedBucketByItems}
            disabled={operator.value === matchSegment.value}
            onChange={({ value }) => {
              addBucketByItem(value as string)
              onAttributeChange(value as string)
            }}
            inputProps={{
              style: { height },
              onBlur: onSelectEvent,
              onKeyUp: event => {
                if (event.keyCode === 13) {
                  onSelectEvent(event as unknown as InputEventType)
                }
              }
            }}
            allowCreatingNewItems
          />
        </div>
        <div style={{ flex: '0.8' }}>
          <Select
            inputProps={{ style: { height } }}
            value={operator}
            items={operators}
            onChange={handleOperatorChange}
          />
        </div>
        <div style={{ flex: '1.5' }}>
          {isSingleValuedOperator ? (
            <TextInput
              style={{ height }}
              id={`values-${index}`}
              value={valueOpts[0]?.value}
              onChange={handleSingleValueChange}
            />
          ) : (
            <MultiSelect
              fill
              tagInputProps={{
                intent: error ? 'danger' : 'none'
              }}
              items={valueOpts}
              value={valueOpts}
              onChange={handleValuesChange}
            />
          )}
          {error && <Text intent="danger">Required</Text>}
        </div>
        <Layout.Horizontal flex={{ align: 'center-center' }} spacing="small">
          {actions}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

interface RuleEditCardProps {
  rule: RuleData
  variations: Variation[]
  errors: any
  index: number
  dropSnapshot: DroppableStateSnapshot
  onDelete: () => void
  onChange: (rule: RuleData) => void
}

const RuleEditCard: React.FC<RuleEditCardProps> = ({
  index,
  dropSnapshot,
  rule,
  variations,
  errors,
  onDelete,
  onChange
}) => {
  const [hovering, setHovering] = useState(false)
  const { getString } = useStrings()
  const [operators, isSingleValue] = useCustomRulesOperators()
  const percentageRollout = {
    label: getString('cf.featureFlags.percentageRollout'),
    value: 'percentage',
    icon: { name: 'percentage' }
  }
  const variationItems = variations
    .map<SelectOption>((elem, _index) => ({
      label: elem.name as string,
      value: elem.identifier as string,
      icon: { name: 'full-circle', style: { color: CFVariationColors[_index] } }
    }))
    .concat([percentageRollout] as SelectOption[])
  const currentServe = rule.serve.distribution
    ? percentageRollout
    : variationItems.find(item => item.value === (rule.serve.variation as string))

  const toggleDragHandler = () => setHovering(!hovering)

  const handleClauseChange = (idx: number, field: keyof Clause) => (value: any) => {
    if (field === 'op' && !isSingleValue(rule.clauses[idx].op) && isSingleValue(value)) {
      const prevClause = rule.clauses[idx]
      const newClause = {
        ...prevClause,
        values: [prevClause.values[0]].filter(Boolean),
        op: value
      }
      onChange({
        ...rule,
        clauses: assoc(idx, newClause, rule.clauses)
      })
    } else {
      onChange({
        ...rule,
        clauses: assoc(idx, assoc(field, value, rule.clauses[idx]), rule.clauses)
      })
    }
  }

  const handleServeChange = (data: SelectOption) => {
    if (data.value === 'percentage') {
      onChange({
        ...rule,
        serve: {
          distribution: {
            bucketBy: '',
            variations: []
          }
        }
      })
    } else {
      onChange({
        ...rule,
        serve: { variation: data.value as string }
      })
    }
  }

  const handleAddNewRow = () => {
    onChange({
      ...rule,
      clauses: [...rule.clauses, emptyClause()]
    })
  }

  const handleRemove = (idx: number) => () => {
    onChange({
      ...rule,
      clauses: rule.clauses.filter((_, _index) => _index !== idx)
    })
  }

  const handleRolloutChange = (data: any) => {
    onChange({
      ...rule,
      serve: { distribution: data }
    })
  }

  return (
    <Draggable key={`draggable-${index}`} draggableId={`rule-${rule.ruleId || 'new'}-${index}`} index={index}>
      {(provided, draggableSnap: DraggableStateSnapshot) => {
        const showBorder = hovering && !dropSnapshot.isDraggingOver
        const showHandle = draggableSnap.isDragging || showBorder

        return (
          <Layout.Horizontal
            className={css.onRequestRuleContainer}
            spacing="small"
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <Container
              className={cx(css.rulesContainer, css.byAttributes)}
              onMouseEnter={toggleDragHandler}
              onMouseLeave={toggleDragHandler}
              style={{
                flexGrow: 1,
                transform: draggableSnap.isDragging ? 'translate(-700px, -10px)' : 'none',
                background: 'var(--white)'
              }}
            >
              <Layout.Horizontal>
                <Container
                  {...provided.dragHandleProps}
                  style={{
                    visibility: showHandle ? 'visible' : 'hidden',
                    marginLeft: '-13px',
                    display: 'grid',
                    alignItems: 'center'
                  }}
                >
                  <Icon name="drag-handle-vertical" size={24} color={Color.GREY_300} />
                </Container>
                <Container>
                  <Layout.Vertical spacing="small">
                    {rule.clauses.map((clause, idx) => (
                      <ClauseRow
                        key={idx}
                        index={idx}
                        isLast={idx === rule.clauses.length - 1}
                        isSingleClause={rule.clauses.length === 1}
                        label={
                          idx === 0
                            ? getString('cf.featureFlags.rules.onRequest')
                            : getString('cf.clause.operators.and').toLocaleLowerCase()
                        }
                        attribute={clause?.attribute || ''}
                        operator={operators.find(x => x.value === clause.op) || operators[0]}
                        values={clause.values ?? []}
                        error={Boolean(errors?.[idx])}
                        onOperatorChange={handleClauseChange(idx, 'op')}
                        onAttributeChange={handleClauseChange(idx, 'attribute')}
                        onValuesChange={handleClauseChange(idx, 'values')}
                        onAddNewRow={handleAddNewRow}
                        onRemoveRow={handleRemove(idx)}
                      />
                    ))}
                    <Container>
                      <Layout.Horizontal spacing="small">
                        <Text
                          font="normal"
                          style={{
                            display: 'flex',
                            height: '36px',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            minWidth: '80px'
                          }}
                        >
                          {getString('cf.featureFlags.serve').toLocaleLowerCase()}
                        </Text>
                        <div style={{ flexGrow: 0 }}>
                          <Select
                            value={currentServe as SelectOption}
                            items={variationItems}
                            inputProps={{ style: { height: '36px' } }}
                            onChange={handleServeChange}
                          />
                        </div>
                      </Layout.Horizontal>
                    </Container>
                    {currentServe?.value === 'percentage' && (
                      <Container
                        style={
                          { paddingLeft: '75px', paddingRight: '56px', '--layout-spacing': 0 } as React.CSSProperties
                        }
                      >
                        <PercentageRollout
                          editing={true}
                          variations={variations}
                          bucketBy={rule.serve.distribution?.bucketBy}
                          weightedVariations={rule.serve.distribution?.variations || []}
                          onSetPercentageValues={handleRolloutChange}
                          style={{ marginLeft: 'var(--spacing-small)' }}
                        />
                      </Container>
                    )}
                  </Layout.Vertical>
                </Container>
              </Layout.Horizontal>
            </Container>
            <Icon
              name="trash"
              size={16}
              color={Color.GREY_300}
              style={{
                cursor: 'pointer',
                height: 'fit-content',
                alignSelf: 'center',
                transform: 'translateY(-10px)'
              }}
              onClick={onDelete}
            />
          </Layout.Horizontal>
        )
      }}
    </Draggable>
  )
}

interface RuleViewCardProps {
  rule: RuleData
  variations: Variation[]
}

const RuleViewCard: React.FC<RuleViewCardProps> = ({ rule, variations }) => {
  const { getString } = useStrings()
  const isPercentage = Boolean(rule.serve.distribution)
  const [operators] = useCustomRulesOperators()
  const [firstClause, ...extraClauses] = rule.clauses
  const variationIndex = variations.findIndex(v => v.identifier === rule.serve.variation)
  const bucketBy = rule?.serve?.distribution?.bucketBy

  let clausesComponent
  if (extraClauses.length > 0) {
    clausesComponent = (
      <Layout.Vertical spacing="xsmall">
        <Text style={{ fontSize: '14px', lineHeight: '24px' }}>
          <span
            dangerouslySetInnerHTML={{
              __html: unescapeI18nSupportedTags(
                getString('cf.featureFlags.ifClause', {
                  attribute: firstClause.attribute,
                  operator: operators.find(op => op.value === firstClause.op)?.label,
                  values: firstClause.values
                    .map(val => `<strong>${val}</strong>`)
                    .join(getString('cf.featureFlags.commaSeparator'))
                })
              )
            }}
          />
        </Text>
        {extraClauses.map((clause, idx) => {
          return (
            <Container key={idx}>
              <Text key={idx} style={{ fontSize: '14px', lineHeight: '24px' }}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: unescapeI18nSupportedTags(
                      getString('cf.featureFlags.andClause', {
                        attribute: clause.attribute,
                        operator: operators.find(op => op.value === clause.op)?.label,
                        values: clause.values
                          .map(val => `<strong>${val}</strong>`)
                          .join(getString('cf.featureFlags.commaSeparator'))
                      })
                    )
                  }}
                />
              </Text>
            </Container>
          )
        })}
        <Text style={{ fontSize: '14px', lineHeight: '24px' }}>
          <span
            dangerouslySetInnerHTML={{
              __html: getString(isPercentage ? 'cf.featureFlags.servePercentageRollout' : 'cf.featureFlags.serve')
            }}
          />
          {!isPercentage && (
            <VariationWithIcon
              variation={variations[variationIndex]}
              index={variationIndex}
              iconStyle={{ transform: 'translateY(1px)', margin: '0 var(--spacing-xsmall)' }}
              textStyle={{ fontWeight: 600 }}
            />
          )}
        </Text>
      </Layout.Vertical>
    )
  } else {
    clausesComponent = (
      <Layout.Horizontal spacing="xsmall">
        <Text style={{ fontSize: '14px', lineHeight: '24px' }}>
          <span
            dangerouslySetInnerHTML={{
              __html: unescapeI18nSupportedTags(
                getString(
                  isPercentage ? 'cf.featureFlags.ifClauseServePercentageRollout' : 'cf.featureFlags.ifClauseServe',
                  {
                    attribute: firstClause.attribute,
                    operator: operators.find(op => op.value === firstClause.op)?.label,
                    values: firstClause.values
                      .map(val => `<strong>${val}</strong>`)
                      .join(getString('cf.featureFlags.commaSeparator'))
                  }
                )
              )
            }}
          />
          {!isPercentage && (
            <VariationWithIcon
              variation={variations[variationIndex]}
              index={variationIndex}
              iconStyle={{ transform: 'translateY(1px)', margin: '0 var(--spacing-xsmall)' }}
              textStyle={{ fontWeight: 600 }}
            />
          )}
        </Text>
      </Layout.Horizontal>
    )
  }

  return (
    <Container className={cx(css.rulesContainer, css.custom)} style={{ width: '100%' }}>
      <Layout.Vertical spacing="small">
        {clausesComponent}
        {isPercentage && (
          <PercentageRollout
            editing={false}
            bucketBy={bucketBy as string}
            variations={variations}
            weightedVariations={rule.serve.distribution?.variations || []}
            style={{ marginLeft: 'var(--spacing-small)' }}
          />
        )}
      </Layout.Vertical>
    </Container>
  )
}

interface ServingCardRowProps {
  formikProps: CustomRulesViewProps['formikProps']
  feature: Feature
  variations: Variation[]
  targets: TargetMap[] | undefined
  index: number
  variation: string
  variationOps: Option<string>[]
  editing: boolean
  environmentIdentifier: string
  projectIdentifier: string
  targetAvatars: { name: string }[]
  error?: { variation?: string; targets?: string }
  onChangeTargets: (data: any[]) => void
  onChangeVariation: (data: any) => void
  onDelete: () => void
}

const ServingCardRow: React.FC<ServingCardRowProps> = ({
  formikProps,
  editing,
  variationOps,
  variations,
  index,
  variation,
  targetAvatars,
  environmentIdentifier,
  projectIdentifier,
  error,
  onChangeTargets,
  onChangeVariation,
  onDelete
}) => {
  const { getString } = useStrings()
  const [tagOpts] = useOptions(targetAvatars, prop(['name']))
  const { orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { data, loading } = useGetAllTargets({
    queryParams: {
      environmentIdentifier,
      projectIdentifier,
      accountIdentifier,
      orgIdentifier,
      pageSize: 1000
    } as GetAllTargetsQueryParams
  })

  const availableTargets = useMemo<Option<string>[]>(() => {
    if (!data?.targets) {
      return []
    }

    const targetIdentifiersFromForm = uniq(
      formikProps.values.variationMap
        .map((map: { targets: TargetMap[] }) => map.targets || [])
        .flat()
        .map((val: TargetMap) => val.identifier || val)
    )

    return (
      data.targets
        .filter(target => !targetIdentifiersFromForm.includes(target.identifier))
        .map(compose(toOption, prop('identifier'))) || []
    )
  }, [data?.targets, formikProps?.values?.variationMap])

  const [tempTargets, setTempTargets] = useState(tagOpts)

  const [openEditModal, hideModal] = useModalHook(() => {
    const handleTempTargetChange = (newData: (string | { label: string; value: string })[]): void => {
      const _newData = newData.map(_entry => {
        if (typeof _entry === 'string') {
          return { label: _entry, value: _entry }
        } else {
          return _entry
        }
      })

      setTempTargets(_newData)
    }

    const handleSaveTemp = () => {
      onChangeTargets(tempTargets.map(x => x.value))
      hideModal()
    }

    const handleClose = () => {
      setTempTargets(tagOpts)
      hideModal()
    }

    return (
      <Dialog enforceFocus={false} isOpen onClose={handleClose} title={`Serve ${variation} to the following`}>
        <Layout.Vertical spacing="medium" padding={{ left: 'large', right: 'medium' }}>
          {loading ? (
            <Spinner size={24} />
          ) : (
            <SimpleTagInput
              fill
              allowNewTag={false}
              selectedItems={tempTargets}
              items={availableTargets}
              onChange={handleTempTargetChange}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Button intent="primary" onClick={handleSaveTemp}>
              {getString('done')}
            </Button>
            <Button minimal onClick={handleClose}>
              {getString('cancel')}
            </Button>
            <div style={{ marginLeft: 'auto' }}>
              <Text>{`${tempTargets.length} total`}</Text>
            </div>
          </div>
        </Layout.Vertical>
      </Dialog>
    )
  }, [tagOpts, availableTargets, tempTargets, targetAvatars])

  const avatars = editing ? targetAvatars.concat([addTargetAvatar(openEditModal)]) : targetAvatars
  const selectValue = variationOps.find(v => v.value === variation)

  const component = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Text>{getString('cf.featureFlags.serve')}</Text>
      <div style={{ maxWidth: '210px', margin: `0 var(--spacing-${editing ? 'small' : 'xsmall'})` }}>
        {editing ? (
          <Select
            value={selectValue}
            items={variationOps}
            onChange={compose(onChangeVariation, prop('value'))}
            inputProps={{ intent: error?.variation ? 'danger' : 'none' }}
          />
        ) : (
          <VariationWithIcon
            variation={variations[index]}
            index={index}
            iconStyle={{
              marginRight: 'var(--spacing-xsmall)',
              transform: 'translateY(1px)',
              marginLeft: '1px'
            }}
            textStyle={{ fontWeight: 600 }}
          />
        )}
      </div>
      <Text>{getString('cf.featureFlags.toTarget')}</Text>
      <AvatarGroup overlap avatars={avatars} restrictLengthTo={10} />
      <Text>({targetAvatars.length})</Text>
      {editing && (
        <Container style={{ marginLeft: 'auto' }}>
          <Button
            minimal
            icon="Options"
            tooltip={
              <Menu style={{ minWidth: 'unset' }}>
                <Menu.Item icon="edit" text={getString('edit')} onClick={openEditModal} />
                <Menu.Item icon="trash" text={getString('delete')} onClick={onDelete} />
              </Menu>
            }
            tooltipProps={{ isDark: true, interactionKind: 'click' }}
          />
        </Container>
      )}
    </div>
  )

  const hasError = Boolean(error?.targets || error?.variation)
  const errorMsg = [error?.targets && 'Targets', error?.variation && 'Variation']
    .filter(x => Boolean(x))
    .join(' and ')
    .concat(' required')

  return editing ? (
    <>
      <Container className={css.serveCard} padding="medium">
        {component}
      </Container>
      {hasError && <Text intent="danger">{errorMsg}</Text>}
    </>
  ) : (
    component
  )
}

interface ServingCardProps {
  formikProps: CustomRulesViewProps['formikProps']
  feature: Feature
  variations: Variation[]
  servings: Serving[]
  editing: boolean
  environmentIdentifier: string
  projectIdentifier: string
  errors: any
  onAdd: () => void
  onUpdate: (idx: number, attr: 'targets' | 'variation', data: any) => void
  onRemove: (idx: number) => void
}

const ServingCard: React.FC<ServingCardProps> = ({
  formikProps,
  feature,
  servings,
  variations,
  editing,
  environmentIdentifier,
  projectIdentifier,
  errors,
  onAdd,
  onUpdate,
  onRemove
}) => {
  const { getString } = useStrings()
  const toVariationOp = (variation: Variation) => ({
    label: variation.name || variation.identifier,
    value: variation.identifier,
    icon: {
      name: 'full-circle',
      style: { color: CFVariationColors[variations.findIndex(v => v.identifier === variation.identifier)] }
    }
  })
  const handleUpdate = (idx: number, attr: 'targets' | 'variation') => (data: any) => onUpdate(idx, attr, data)
  const moreAvailable = servings.length < variations.length

  return (
    <Container className={cx(css.rulesContainer, css.custom)} width="100%">
      <Layout.Vertical spacing="small">
        <Text className={css.serveLabel}>{getString('cf.featureFlags.serveVariationToTargetLabel')}</Text>
        {servings.map(({ variation, targets }, idx) => {
          const targetAvatars = targets?.map(target => ({
            name: target?.identifier || target
          })) as { name: string }[]
          const variationOps = variations
            .filter(v => !servings.find(serving => serving.variation === v.identifier) || v.identifier === variation)
            .map(toVariationOp)
          return (
            <ServingCardRow
              key={idx}
              feature={feature}
              targets={targets}
              formikProps={formikProps}
              variations={variations}
              index={variations.findIndex(v => v.identifier === variation)}
              variation={variation}
              variationOps={variationOps}
              targetAvatars={targetAvatars ?? []}
              editing={editing}
              environmentIdentifier={environmentIdentifier}
              projectIdentifier={projectIdentifier}
              onChangeTargets={handleUpdate(idx, 'targets')}
              onChangeVariation={handleUpdate(idx, 'variation')}
              onDelete={() => onRemove(idx)}
              error={errors[idx]}
            />
          )
        })}
        {editing && moreAvailable && (
          <Button intent="primary" minimal onClick={onAdd} className={css.addBtn} text={getString('plusAdd')} />
        )}
      </Layout.Vertical>
    </Container>
  )
}

export interface CustomRulesViewProps {
  feature: Feature
  formikProps: any
  editing: boolean
  environmentIdentifier: string
  projectIdentifier: string
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  if (from < to) {
    return [...arr.slice(0, from), ...arr.slice(from + 1, to + 1), arr[from], ...arr.slice(to + 1)]
  } else {
    return [...arr.slice(0, to), arr[from], ...arr.slice(to, from), ...arr.slice(from + 1)]
  }
}

const CustomRulesView: React.FC<CustomRulesViewProps> = ({
  feature,
  formikProps,
  editing,
  environmentIdentifier,
  projectIdentifier
}) => {
  const { getString } = useStrings()
  const tempRules: ServingRule[] = formikProps.values.customRules
  const setTempRules = (data: RuleData[]) => formikProps.setFieldValue('customRules', data)
  const servings = formikProps.values.variationMap || []
  const setServings = (data: Serving[]) => formikProps.setFieldValue('variationMap', data)

  const handleAddServing = () => setServings([...servings, emptyServing()])

  const handleUpdateServing = (idx: number, attr: 'targets' | 'variation', data: any) => {
    servings[idx][attr] = data
    setServings([...servings])
  }

  const handleDeleteServing = (idx: number) => {
    setServings([...servings.slice(0, idx), ...servings.slice(idx + 1)])
  }

  const handleClearServings = () => {
    setServings([])
  }

  const getPriority = () =>
    tempRules.reduce((max: number, next: { priority: number }) => (max < next.priority ? next.priority : max), 0) + 100

  const handleOnRequest = () => {
    setTempRules([...tempRules, emptyRule(getPriority())])
  }

  const handleRuleChange = (index: number) => (newData: RuleData) => {
    setTempRules([...tempRules.slice(0, index), newData, ...tempRules.slice(index + 1)])
  }

  const handleDeleteRule = (index: number) => () => {
    setTempRules([...tempRules.slice(0, index), ...tempRules.slice(index + 1)])
  }

  const onDragEnd = (result: DropResult): void => {
    if (result.destination) {
      const from = result.source.index
      const to = result.destination.index
      const reorderedRules = arrayMove(tempRules, from, to)
      formikProps.setFieldValue('customRules', reorderedRules)
    }
  }

  return (
    <>
      <Text className={cx(css.ruleTitle, css.custom)}>
        <StringWithTooltip stringId="cf.featureFlags.rules.customRules" tooltipId="ff_ffCustomRules_heading" />
      </Text>
      <Layout.Vertical>
        {servings.length > 0 && (
          <Layout.Horizontal spacing="small">
            <ServingCard
              feature={feature}
              formikProps={formikProps}
              editing={editing}
              servings={servings}
              variations={feature.variations}
              environmentIdentifier={environmentIdentifier}
              projectIdentifier={projectIdentifier}
              onAdd={handleAddServing}
              onUpdate={handleUpdateServing}
              onRemove={handleDeleteServing}
              errors={formikProps.errors?.variationMap || []}
            />
            {editing && (
              <Icon
                name="trash"
                size={16}
                color={Color.GREY_300}
                style={{
                  cursor: 'pointer',
                  height: 'fit-content',
                  alignSelf: 'center'
                }}
                onClick={handleClearServings}
              />
            )}
          </Layout.Horizontal>
        )}

        {editing && servings.length === 0 && (
          <Container>
            <Button
              intent="primary"
              minimal
              text={getString('cf.featureFlags.serveVariationToTarget')}
              onClick={handleAddServing}
            />
          </Container>
        )}

        {tempRules.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="customRules">
              {(provided, dropSnapshot) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Layout.Vertical>
                      {tempRules.map((rule: RuleData, idx: number) => {
                        return editing ? (
                          <RuleEditCard
                            key={idx}
                            index={idx}
                            rule={rule}
                            dropSnapshot={dropSnapshot}
                            variations={feature.variations}
                            onDelete={handleDeleteRule(idx)}
                            onChange={handleRuleChange(idx)}
                            errors={formikProps.errors?.rules?.[idx] || []}
                          />
                        ) : (
                          <RuleViewCard key={idx} rule={rule} variations={feature.variations} />
                        )
                      })}
                    </Layout.Vertical>
                    {provided.placeholder}
                  </div>
                )
              }}
            </Droppable>
          </DragDropContext>
        )}
      </Layout.Vertical>

      {editing && (
        <Container>
          <Button
            intent="primary"
            minimal
            onClick={handleOnRequest}
            text={getString('cf.featureFlags.customRuleOnRequest')}
            style={{ marginTop: 'xsmall' }}
          />
        </Container>
      )}
    </>
  )
}

export default CustomRulesView
