import { Button } from '@/components/ui/button'
import { Links } from '@/components/icons'
import React from 'react'
import { toast } from 'sonner'

type Props = {
    videoId: string
    className?: string
    varient?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
}

const CopyLink = ({ videoId, className, varient }: Props) => {
    const onCopyClipboard = () => {
        navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_HOST_URL}/PREVIEW/${videoId}`
        )
        return toast('Copied', {
            description: "Link copied to clipboard",
        })
    }
    return (
        <Button
            variant={varient}
            onClick={onCopyClipboard}
            className={className}
        >
            <Links />
        </Button>
    )
}

export default CopyLink