'use client'

import { getIconSrc, useChainSpecs } from '@/hooks/use-chain-specs'
import { cn } from 'liquidcn'
import { Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button, type ButtonProps } from 'liquidcn'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'liquidcn/client'

interface ChainSelectorDialogContentProps {
  chains: ReturnType<typeof useChainSpecs>['networkConfigurations']
  currentChainId?: number
  onSelectChain: (chainId: number) => void
  isSwitching: boolean
}

function ChainSelectorDialogContent(props: ChainSelectorDialogContentProps) {
  const { chains, currentChainId, onSelectChain, isSwitching } = props

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select Network</DialogTitle>
        <DialogDescription>Choose a network to switch to</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        {chains.map((chain) => {
          const isSelected = chain.id === currentChainId
          const iconSrc = getIconSrc(chain.id)

          return (
            <Button
              key={chain.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn('justify-start gap-3 h-auto py-3', isSelected && 'border-primary')}
              disabled={isSwitching || isSelected}
              onClick={() => onSelectChain(chain.id)}
            >
              <Image
                src={iconSrc}
                alt={chain.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="flex-1 text-left">{chain.name}</span>
              {isSwitching && isSelected && <Loader2 size={16} className="animate-spin" />}
              {!isSwitching && isSelected && <Check size={16} />}
            </Button>
          )
        })}
      </div>
    </DialogContent>
  )
}

export type ChainSelectorButtonProps = ButtonProps

export function ChainSelectorButton(props: ChainSelectorButtonProps) {
  const { className, ...rest } = props

  const { iconSrc, networkConfigurations, chainId, switchChain, isSwitchingChain, isConnected } =
    useChainSpecs()

  const handleSelectChain = (selectedChainId: number) => {
    if (switchChain && selectedChainId !== chainId) {
      switchChain({ chainId: selectedChainId })
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn('px-3', className)}
          disabled={isSwitchingChain}
          {...rest}
        >
          {isSwitchingChain ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Image src={iconSrc} alt="chain" width={20} height={20} className="rounded-full" />
          )}
        </Button>
      </DialogTrigger>

      <ChainSelectorDialogContent
        chains={networkConfigurations}
        currentChainId={chainId}
        onSelectChain={handleSelectChain}
        isSwitching={isSwitchingChain}
      />
    </Dialog>
  )
}
