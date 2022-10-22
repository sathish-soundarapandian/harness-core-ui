/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { zipObject, isEqual } from 'lodash-es'
import type { Distribution, PatchOperation, Prerequisite, Serve, Variation, WeightedVariation } from 'services/cf'

type PatchKind =
  | 'updateName'
  | 'updateDescription'
  | 'addPrerequisite'
  | 'updatePrerequisite'
  | 'removePrerequisite'
  | 'addVariation'
  | 'updateVariation'
  | 'deleteVariation'
  | 'setDefaultOnVariation'
  | 'setDefaultOffVariation'
  | 'addTag'
  | 'updateTag'
  | 'removeTag'
  | 'setFeatureFlagState'
  | 'addTargetsToVariationTargetMap'
  | 'removeTargetsToVariationTargetMap'
  | 'addSegmentToVariationTargetMap'
  | 'removeSegmentToVariationTargetMap'
  | 'clearVariationTargetMapping'
  | 'addRule'
  | 'removeRule'
  | 'addClause'
  | 'removeClause'
  | 'updateClause'
  | 'reorderRules'
  | 'updateDefaultServe'
  | 'updateOffVariation'
  | 'addToIncludeList'
  | 'removeFromIncludeList'
  | 'addToExcludeList'
  | 'removeFromExcludeList'
  | 'updateRule'
  | 'updatePermanent'

export type PrerequisiteFeature = Pick<Prerequisite, 'feature'>
export type VariationIdentifier = Pick<Variation, 'identifier'>[]
export interface TagParams {
  name: string
  value: any
}
export interface VariationParam {
  variation: string
}
export interface UpdateNameParams {
  name: string
}
export interface UpdateDescriptionParams {
  description: string
}
export interface SetStateParams {
  state: 'on' | 'off'
}
export interface UpdatePermanentParams {
  state: boolean
}
export interface TargetToVariationParams {
  variation: string
  targets: string[]
}
export interface SegmentToVariationParams {
  variation: string
  targetSegments: string[]
}
export interface ClauseData {
  attribute?: string
  op: string
  values: string[]
  negate?: boolean
}
export interface AddRuleParams {
  priority: number
  serve: Serve
  clauses: ClauseData[]
  uuid?: string
}
export interface RemoveRuleParams {
  ruleID: string
}
export interface AddClauseParams {
  ruleID: string
  clause: ClauseData
}
export interface RemoveClauseParams {
  ruleID: string
  clauseID: string
}
export interface UpdateClauseParams {
  ruleID: string
  clauseID: string
  clause: ClauseData[]
}
export interface ReorderRulesParams {
  rules: string[]
}
type UpdateDefaultServeParams = VariationParam | { bucketID: string; variations: WeightedVariation[] }
type TargetList = { targets: string[] }

export type UpdateRuleVariation =
  | {
      ruleID: string
      variation: string
    }
  | {
      ruleID: string
      bucketBy: string
      variations: WeightedVariation[]
    }

export type AddClauseToSegmentParams = ClauseData
export type UpdateClauseOnSegmentParams = ClauseData & {
  clauseID: string
}
export type RemoveClauseOnSegmentParams = { clauseID: string }

type ParameterType =
  | VariationParam
  | UpdateNameParams
  | UpdateDescriptionParams
  | SetStateParams
  | Distribution
  | Prerequisite
  | PrerequisiteFeature
  | Variation
  | VariationIdentifier
  | TagParams
  | TargetToVariationParams
  | SegmentToVariationParams
  | AddRuleParams
  | RemoveRuleParams
  | AddClauseParams
  | RemoveClauseParams
  | UpdateClauseParams
  | ReorderRulesParams
  | UpdateDefaultServeParams
  | TargetList
  | AddClauseToSegmentParams
  | UpdateClauseOnSegmentParams
  | RemoveClauseOnSegmentParams
  | UpdateRuleVariation
  | UpdatePermanentParams

export interface Instruction<Params extends ParameterType = ParameterType> {
  kind: PatchKind
  parameters: Params
}

type UnaryParameterBuilder<A, B extends ParameterType> = (a: A) => B
type BinaryParameterBuilder<A, B, C extends ParameterType> = (a: A, b: B) => C
type TernaryParameterBuilder<A, B, C, D extends ParameterType> = (a: A, b: B, c: C) => D

type UnaryInstructionCreator<A, B extends ParameterType> = (a: A) => Instruction<B>
type BinaryInstructionCreator<A, B, C extends ParameterType> = (a: A, b: B) => Instruction<C>
type TernaryInstructionCreator<A, B, C, D extends ParameterType> = (a: A, b: B, c: C) => Instruction<D>

export const shape =
  <A = any>(...keys: string[]) =>
  (...values: any[]) =>
    zipObject(keys, values) as A
const identity = <T>(a: T) => a
export const unaryInstructionCreator =
  <A, B extends ParameterType>(
    kind: PatchKind,
    parameterBuilder: UnaryParameterBuilder<A, B>
  ): UnaryInstructionCreator<A, B> =>
  (arg: A) => ({
    kind,
    parameters: parameterBuilder(arg)
  })
export const binaryInstructionCreator =
  <A, B, C extends ParameterType>(
    kind: PatchKind,
    parameterBuilder: BinaryParameterBuilder<A, B, C>
  ): BinaryInstructionCreator<A, B, C> =>
  (a: A, b: B) => ({
    kind,
    parameters: parameterBuilder(a, b)
  })
export const ternaryInstructionCreator =
  <A, B, C, D extends ParameterType>(
    kind: PatchKind,
    parameterBuilder: TernaryParameterBuilder<A, B, C, D>
  ): TernaryInstructionCreator<A, B, C, D> =>
  (a: A, b: B, c: C) => ({
    kind,
    parameters: parameterBuilder(a, b, c)
  })

const updateName: (name: string) => Instruction<UpdateNameParams> = unaryInstructionCreator(
  'updateName',
  shape<UpdateNameParams>('name')
)
const updateDescription: (description: string) => Instruction<UpdateDescriptionParams> = unaryInstructionCreator(
  'updateDescription',
  shape<UpdateDescriptionParams>('description')
)
const addPrerequisite: (prerequisite: Prerequisite) => Instruction<Prerequisite> = unaryInstructionCreator(
  'addPrerequisite',
  identity
)
const updatePrequisite: (prerequisites: Prerequisite) => Instruction<Prerequisite> = unaryInstructionCreator(
  'updatePrerequisite',
  identity
)
const removePrerequisite: (prerequisiteFeature: string) => Instruction<PrerequisiteFeature> = unaryInstructionCreator(
  'removePrerequisite',
  shape('feature')
)
const addVariation: (variation: Variation) => Instruction<Variation> = unaryInstructionCreator('addVariation', identity)
const updateVariation: (variation: Variation) => Instruction<Variation> = unaryInstructionCreator(
  'updateVariation',
  identity
)
const deleteVariant: (identifier: string | undefined) => Instruction<VariationIdentifier> = unaryInstructionCreator(
  'deleteVariation',
  shape<VariationIdentifier>('identifier')
)
const setDefaultOnVariation: (identifier: string) => Instruction<VariationIdentifier> = unaryInstructionCreator(
  'setDefaultOnVariation',
  shape<VariationIdentifier>('identifier')
)
const setDefaultOffVariation: (identifier: string) => Instruction<VariationIdentifier> = unaryInstructionCreator(
  'setDefaultOffVariation',
  shape<VariationIdentifier>('identifier')
)
const addTag: (name: string, value: any) => Instruction<TagParams> = binaryInstructionCreator(
  'addTag',
  shape<TagParams>('name', 'value')
)
const updateTag: (name: string, value: any) => Instruction<TagParams> = binaryInstructionCreator(
  'updateTag',
  shape<TagParams>('name', 'value')
)
const removeTag: (name: string, value: any) => Instruction<TagParams> = binaryInstructionCreator(
  'removeTag',
  shape<TagParams>('name', 'value')
)
const setFeatureFlagState: (state: 'on' | 'off') => Instruction<SetStateParams> = unaryInstructionCreator(
  'setFeatureFlagState',
  shape<SetStateParams>('state')
)
const addTargetsToVariationTargetMap: (variation: string, targets: string[]) => Instruction<TargetToVariationParams> =
  binaryInstructionCreator('addTargetsToVariationTargetMap', shape<TargetToVariationParams>('variation', 'targets'))
const removeTargetsToVariationTargetMap: (
  variation: string,
  targets: string[]
) => Instruction<TargetToVariationParams> = binaryInstructionCreator(
  'removeTargetsToVariationTargetMap',
  shape<TargetToVariationParams>('variation', 'targets')
)
const addSegmentToVariationTargetMap: (
  variation: string,
  targetSegments: string[]
) => Instruction<TargetToVariationParams> = binaryInstructionCreator(
  'addSegmentToVariationTargetMap',
  shape<TargetToVariationParams>('variation', 'targetSegments')
)
const removeSegmentToVariationTargetMap: (
  variation: string,
  targetSegments: string[]
) => Instruction<SegmentToVariationParams> = binaryInstructionCreator(
  'removeSegmentToVariationTargetMap',
  shape<SegmentToVariationParams>('variation', 'targetSegments')
)
const clearVariationTargetMapping: (variation: string) => Instruction<VariationParam> = unaryInstructionCreator(
  'clearVariationTargetMapping',
  shape<VariationParam>('variation')
)
const addRule = (addRuleParamData: {
  uuid?: string
  priority: number
  serve: Serve
  clauses: ClauseData[]
}): Instruction<AddRuleParams> => {
  return {
    kind: 'addRule',
    parameters: addRuleParamData
  }
}

const removeRule: (ruleID: string) => Instruction<RemoveRuleParams> = unaryInstructionCreator(
  'removeRule',
  shape('ruleID')
)
const addClause: (ruleID: string, clause: ClauseData) => Instruction<AddClauseParams> = binaryInstructionCreator(
  'addClause',
  shape('ruleID', 'clause')
)
const removeClause: (ruleID: string, clauseID: string) => Instruction<RemoveClauseParams> = binaryInstructionCreator(
  'removeClause',
  shape('ruleID', 'clauseID')
)
const updateClause: (ruleID: string, clauseID: string, clause: ClauseData) => Instruction<UpdateClauseParams> =
  ternaryInstructionCreator('updateClause', shape('ruleID', 'clauseID', 'clause'))
const reorderRules: (rules: string[]) => Instruction<ReorderRulesParams> = unaryInstructionCreator(
  'reorderRules',
  shape<ReorderRulesParams>('rules')
)
const updateDefaultServeByVariation: (variation: string) => Instruction<UpdateDefaultServeParams> =
  unaryInstructionCreator('updateDefaultServe', shape<UpdateDefaultServeParams>('variation'))
const updateDefaultServeByBucket: (
  bucketBy: string,
  variations: WeightedVariation[]
) => Instruction<UpdateDefaultServeParams> = binaryInstructionCreator(
  'updateDefaultServe',
  shape<UpdateDefaultServeParams>('bucketBy', 'variations')
)
const updateOffVariation: (variation: string) => Instruction<VariationParam> = unaryInstructionCreator(
  'updateOffVariation',
  shape('variation')
)

const addToIncludeList: (targets: string[]) => Instruction<TargetList> = unaryInstructionCreator(
  'addToIncludeList',
  shape<TargetList>('targets')
)
const removeFromIncludeList: (targets: string[]) => Instruction<TargetList> = unaryInstructionCreator(
  'removeFromIncludeList',
  shape<TargetList>('targets')
)
const addToExcludeList: (targets: string[]) => Instruction<TargetList> = unaryInstructionCreator(
  'addToExcludeList',
  shape<TargetList>('targets')
)
const removeFromExcludeList: (targets: string[]) => Instruction<TargetList> = unaryInstructionCreator(
  'removeFromExcludeList',
  shape<TargetList>('targets')
)
const addClauseToSegment: (clause: ClauseData) => Instruction<AddClauseToSegmentParams> = unaryInstructionCreator(
  'addClause',
  identity
)
const updateClauseOnSegment: (clause: UpdateClauseOnSegmentParams) => Instruction<UpdateClauseOnSegmentParams> =
  unaryInstructionCreator('updateClause', identity)
const removeClauseOnSegment: (clauseID: string) => Instruction<RemoveClauseOnSegmentParams> = unaryInstructionCreator(
  'removeClause',
  shape<RemoveClauseOnSegmentParams>('clauseID')
)

const updatePermanent: (state: boolean) => Instruction<UpdatePermanentParams> = unaryInstructionCreator(
  'updatePermanent',
  shape<UpdatePermanentParams>('permanent')
)
function updateRuleVariation(ruleID: string, variation: string): Instruction<UpdateRuleVariation>
function updateRuleVariation(
  ruleID: string,
  variation: { bucketBy: string; variations: WeightedVariation[] }
): Instruction<UpdateRuleVariation>
function updateRuleVariation(ruleID: string, variation: any): Instruction<UpdateRuleVariation> {
  if (typeof variation === 'string') {
    return {
      kind: 'updateRule',
      parameters: {
        ruleID,
        variation
      }
    }
  } else {
    return {
      kind: 'updateRule',
      parameters: {
        ruleID,
        ...variation
      }
    }
  }
}

class SemanticPatch {
  instructions: any[] = []

  addInstruction(instruction: Instruction): void {
    // logic
    this.instructions.push(instruction)
  }

  toPatchOperation(): PatchOperation {
    return {
      instructions: this.instructions
    }
  }

  addAllInstructions(instructions: Instruction[]) {
    this.instructions.push(...instructions)
  }

  onPatchAvailable(fn: (p: PatchOperation) => void): SemanticPatch {
    if (this.instructions.length !== 0) {
      fn(this.toPatchOperation())
    }
    return this
  }

  onEmptyPatch(fn: () => void): SemanticPatch {
    if (this.instructions.length === 0) {
      fn()
    }
    return this
  }

  reset(): void {
    this.instructions = []
  }
}

class FeatureSemanticPatch extends SemanticPatch {
  private static instance: FeatureSemanticPatch

  private constructor() {
    super()
  }

  public static getInstance(): FeatureSemanticPatch {
    if (!FeatureSemanticPatch.instance) {
      FeatureSemanticPatch.instance = new FeatureSemanticPatch()
    }

    return FeatureSemanticPatch.instance
  }
}

class SegmentSemanticPatch extends SemanticPatch {
  private static instance: SegmentSemanticPatch

  private constructor() {
    super()
  }

  public static getInstance(): SegmentSemanticPatch {
    if (!SegmentSemanticPatch.instance) {
      SegmentSemanticPatch.instance = new SegmentSemanticPatch()
    }

    return SegmentSemanticPatch.instance
  }
}

export const getDiff = <A, B>(initial: A[], updated: B[], eqFn: (a: A, b: B) => boolean = isEqual) => {
  const newData = updated.filter(b => !initial.find(a => eqFn(a, b)))
  const remData = initial.filter(a => !updated.find(b => eqFn(a, b)))
  return [newData, remData]
}

export default {
  feature: FeatureSemanticPatch.getInstance(),
  segment: SegmentSemanticPatch.getInstance(),
  creators: {
    updateName,
    updateDescription,
    addPrerequisite,
    updatePrequisite,
    updatePermanent,
    removePrerequisite,
    addVariation,
    updateVariation,
    deleteVariant,
    setDefaultOnVariation,
    setDefaultOffVariation,
    addTag,
    updateTag,
    removeTag,
    setFeatureFlagState,
    addTargetsToVariationTargetMap,
    removeTargetsToVariationTargetMap,
    addSegmentToVariationTargetMap,
    removeSegmentToVariationTargetMap,
    clearVariationTargetMapping,
    addRule,
    removeRule,
    addClause,
    removeClause,
    updateClause,
    reorderRules,
    updateDefaultServeByVariation,
    updateDefaultServeByBucket,
    updateOffVariation,
    addToIncludeList,
    removeFromIncludeList,
    addToExcludeList,
    removeFromExcludeList,
    addClauseToSegment,
    updateClauseOnSegment,
    removeClauseOnSegment,
    updateRuleVariation
  }
}
