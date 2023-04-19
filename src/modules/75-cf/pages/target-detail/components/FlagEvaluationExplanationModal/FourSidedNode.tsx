import React, { FC } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

const FourSidedNode: FC<NodeProps> = ({ id, data }) => {
  const {
    finalDestination = false,
    includeLeft = false,
    includeRight = true,
    includeTop = true,
    includeBottom = true
  } = data

  return (
    <div
      style={{
        padding: '1rem',
        textAlign: 'center',
        width: 200,
        border: '1px solid darkgray',
        borderRadius: '5px',
        background: finalDestination ? 'lightblue' : 'lightgrey'
      }}
    >
      {data.label}

      {includeTop && <Handle type="target" position={Position.Top} id={`${id}-top`} />}
      {includeLeft && <Handle type="target" position={Position.Left} id={`${id}-left`} />}

      {includeBottom && (
        <Handle type={finalDestination ? 'target' : 'source'} position={Position.Bottom} id={`${id}-bottom`} />
      )}
      {includeRight && (
        <Handle type={finalDestination ? 'target' : 'source'} position={Position.Right} id={`${id}-right`} />
      )}
    </div>
  )
}

export default FourSidedNode
