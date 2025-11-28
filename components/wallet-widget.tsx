'use client'

import { useChainSpecs } from '@/hooks/use-chain-specs'
import { cn } from '@/lib/utils'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { signOut } from 'next-auth/react'
import { Loader2, LogOut, Wallet } from 'lucide-react'

import { ChainSelectorButton } from './chain-selector'
import type { ButtonProps } from './ui/button'
import { Button } from './ui/button'

const compressAddress = (address?: string) => {
  if (!address) return '...'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export interface WalletWidgetProps extends ButtonProps {
  text?: string
  applyClassToLoading?: boolean
}

export function WalletWidget(props: WalletWidgetProps) {
  const { className, text, applyClassToLoading = true, onClick, ...rest } = props

  const { isConnected, address } = useChainSpecs()
  const { setShowAuthFlow, handleLogOut } = useDynamicContext()

  const handleConnect = () => {
    setShowAuthFlow(true)
  }

  const handleDisconnect = async () => {
    await handleLogOut()
    await signOut({ redirect: false })
  }

  if (isConnected && !address)
    return (
      <div className="inline-flex items-center gap-2">
        <ChainSelectorButton />
        <Button className={cn(applyClassToLoading && className)}>
          <Loader2 size={16} className="animate-spin" />
        </Button>
      </div>
    )

  const getStartIcon = () => {
    if (!isConnected) return <Wallet size={20} />
    return null
  }

  const getChildren = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!!text) return text
    return compressAddress(address)
  }

  if (isConnected) {
    return (
      <div className="inline-flex items-center gap-2">
        <ChainSelectorButton />
        <Button
          className={cn(className, 'leading-[unset]')}
          type={props.type ?? 'button'}
          onClick={(e) => {
            onClick?.(e)
          }}
          {...rest}
        >
          <span className="inline-flex items-center gap-2">
            <span>{getChildren()}</span>
          </span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDisconnect}
          title="Disconnect wallet"
        >
          <LogOut size={16} />
        </Button>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        className={cn(className, 'leading-[unset]')}
        type={props.type ?? 'button'}
        onClick={(e) => {
          onClick?.(e)
          handleConnect()
        }}
        {...rest}
      >
        <span className="inline-flex items-center gap-2">
          {getStartIcon()}
          <span>{getChildren()}</span>
        </span>
      </Button>
    </div>
  )
}
