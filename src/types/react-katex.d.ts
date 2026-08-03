declare module 'react-katex' {
  import { ReactNode } from 'react'

  export interface Props {
    children: string
    errorColor?: string
    renderError?: (error: Error) => ReactNode
    math?: string
  }

  export const InlineMath: React.FC<Props>
  export const BlockMath: React.FC<Props>
}
