"use client"

import { useFormStatus } from "react-dom"

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  pendingLabel?: React.ReactNode
}

/**
 * Drop-in submit button with a tactile press animation (active:scale-95)
 * and an automatic disabled / "처리 중…" state while the parent <form>'s
 * server action is in flight. Must live inside a <form>.
 */
export function SubmitButton({
  children,
  className,
  pendingLabel = "처리 중…",
  disabled,
  ...rest
}: Props) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`transition-transform duration-75 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
        className ?? ""
      }`}
      {...rest}
    >
      {pending ? pendingLabel : children}
    </button>
  )
}
