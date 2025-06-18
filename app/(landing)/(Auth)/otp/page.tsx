"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { motion } from "@/lib/motion"
import { Loader2, Mail } from "lucide-react"
import { setCookie } from 'cookies-next';

export default function OTPPage() {
  const router = useRouter()

  // Wrap useSearchParams() inside Suspense
  const searchParams = useSearchParams()

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [resendDisabled, setResendDisabled] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(30)
  const [redirectTimer, setRedirectTimer] = useState<number>(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const email = searchParams.get("email") || ""

  // Handle OTP auto-submission and countdown timers
  useEffect(() => {
    if (otp.every(digit => digit !== "") && otp.length === 6) {
      handleSubmit()
    }

    // Countdown timer for resend OTP
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 30
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [otp, resendDisabled])

  // Redirect timer countdown
  useEffect(() => {
    const redirectInterval = setInterval(() => {
      setRedirectTimer(prev => {
        if (prev <= 1) {
          clearInterval(redirectInterval)
          router.back()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(redirectInterval)
  }, [router])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text/plain").slice(0, 6)
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp]
      pasteData.split("").forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
    }
  }

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/auth/verify-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Verification failed")
      }

      return data
    } catch (error) {
      throw error
    }
  }

  const resendOtp = async (email: string) => {
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP")
      }

      return data
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError("")

    try {
      const otpString = otp.join("")
      const response = await verifyOtp(email, otpString)
      
      if (response.success) {
        setCookie('token', response.token, {
          maxAge: 60 * 60 * 24,
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        router.replace("/dashboard/properties/inventory")
      } else {
        setError(response.message || "Invalid OTP. Please try again.")
        setOtp(Array(6).fill(""))
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendDisabled(true)
    setCountdown(30)
    setError("")

    try {
      const response = await resendOtp(email)
      if (!response.success) {
        throw new Error(response.message || "Failed to resend OTP")
      }
      setRedirectTimer(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP")
      setResendDisabled(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="backdrop-blur-lg p-4 bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl">
          <CardHeader className="pb-2 pt-8">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-lg"
              >
                <Mail className="text-white"/>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-2 text-center"
            >
              <h1 className="text-3xl font-bold tracking-tight text-white">Verify OTP</h1>
              <p className="text-white/80 text-sm">
                Enter the 6-digit code sent to <span className="font-medium text-blue-300">{email}</span>
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex justify-center gap-3"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    autoFocus={index === 0}
                    className="h-10 w-10 md:h-16 md:w-16 text-center text-2xl font-bold bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 focus:bg-white/15 focus:border-white/40 rounded-xl"
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-sm text-white/70">
                  Time remaining: <span className="font-medium text-blue-300">{redirectTimer}s</span>
                </p>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 text-center font-medium"
                >
                  {error}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-center"
              >
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || otp.some(digit => digit === "")}
                  className="w-full h-14 text-base transition-all relative overflow-hidden group bg-white border-none rounded-xl shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-black font-semibold">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </span>
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col pb-8 pt-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center w-full space-y-3"
            >
              <p className="text-sm text-white/70">
                Didn't receive code?{" "}
                <Button 
                  variant="link" 
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                  className="text-blue-300 hover:text-blue-200 p-0 h-auto font-medium disabled:opacity-50"
                >
                  {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Button>
              </p>
              <p className="text-sm text-white/70">
                Wrong email?{" "}
                <Link href="/sign-in" className="text-blue-300 hover:text-blue-200 underline-offset-4 hover:underline font-medium">
                  Go back
                </Link>
              </p>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export function OTPPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPPage />
    </Suspense>
  );
}
