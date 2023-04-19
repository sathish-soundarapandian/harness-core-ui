import React, { FC, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Background, Controls, ReactFlow, Edge, Node } from 'reactflow'
import { ModalDialog } from '@harness/uicore'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { Evaluation, Feature, Target, useGetEvaluationExplain } from 'services/cf'
import FourSidedNode from './FourSidedNode'
import { defaultNodes, defaultEdges } from './decisionFlow'

import 'reactflow/dist/style.css'

export interface FlagEvaluationExplanationModalProps {
  target: Target
  evaluationWithFlagDetails: Evaluation & { flagDetails: Feature }
  onClose: () => void
}

const FlagEvaluationExplanationModal: FC<FlagEvaluationExplanationModalProps> = ({
  target,
  evaluationWithFlagDetails,
  onClose
}) => {
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()

  const { data: explanation, loading: explanationLoading } = useGetEvaluationExplain({
    identifier: target.identifier,
    featureIdentifier: evaluationWithFlagDetails.flag,
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: target.environment
    }
  })

  const nodes = useMemo<Node[]>(() => {
    if (explanation?.nodes) {
      return defaultNodes.map(node => {
        if (explanation.nodes.find(({ id }) => id === node.id)) {
          if (node.id.startsWith('return_')) {
            return {
              ...node,
              style: { opacity: 1 },
              data: {
                ...node.data,
                label: `Return variation "${
                  evaluationWithFlagDetails.flagDetails.variations.find(
                    ({ identifier }) => identifier === evaluationWithFlagDetails.identifier
                  )?.name
                }"`
              }
            }
          }
          return { ...node, style: { opacity: 1 } }
        }

        return node
      })
    }

    return defaultNodes
  }, [explanation?.nodes])

  const edges = useMemo<Edge[]>(() => {
    if (explanation?.edges) {
      return defaultEdges.map(edge => {
        if (explanation.edges.find(({ from, to, label }) => edge.id === `${from}-${to}-${label.toLowerCase()}`)) {
          return { ...edge, animated: true, style: { opacity: 1 } }
        }
        return edge
      })
    }

    return defaultEdges
  }, [explanation?.edges])

  return (
    <ModalDialog
      isOpen
      height={800}
      width={800}
      enforceFocus={false}
      title={`Flag "${evaluationWithFlagDetails.flagDetails.name}" evaluates as "${
        evaluationWithFlagDetails.flagDetails.variations.find(
          ({ identifier }) => identifier === evaluationWithFlagDetails.identifier
        )?.name
      }"`}
      onClose={onClose}
    >
      {explanationLoading && <ContainerSpinner flex={{ align: 'center-center' }} />}
      {explanation && (
        <ReactFlow nodes={nodes} edges={edges} fitView nodeTypes={{ fourSided: FourSidedNode }}>
          <Background />
          <Controls />
        </ReactFlow>
      )}
    </ModalDialog>
  )
}

export default FlagEvaluationExplanationModal
