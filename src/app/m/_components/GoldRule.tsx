'use client'

interface GoldRuleProps {
  width?: number
}

export function GoldRule({ width = 28 }: GoldRuleProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width,
        height: 2,
        background: '#C9973F',
        flexShrink: 0,
      }}
    />
  )
}
