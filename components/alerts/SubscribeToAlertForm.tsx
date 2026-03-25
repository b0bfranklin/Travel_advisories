'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Bell, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { AlertType } from '@/types'

const ALERT_TYPE_OPTIONS: { value: AlertType; label: string; placeholder: string; hint: string }[] =
  [
    {
      value: 'FLIGHT',
      label: 'Flight number',
      placeholder: 'QF001',
      hint: '2-letter airline code + flight number',
    },
    {
      value: 'ROUTE',
      label: 'Route',
      placeholder: 'SYD-MEL',
      hint: 'Origin and destination IATA codes',
    },
    { value: 'AIRLINE', label: 'Airline', placeholder: 'QF', hint: '2-letter airline IATA code' },
    { value: 'AIRPORT', label: 'Airport', placeholder: 'SYD', hint: '3-letter airport IATA code' },
  ]

const clientSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  alertType: z.enum(['FLIGHT', 'ROUTE', 'AIRLINE', 'AIRPORT']),
  watchValue: z.string().min(2).max(20),
})

interface SubscribeToAlertFormProps {
  defaultFlightNumber?: string
  defaultAirportIata?: string
}

export function SubscribeToAlertForm({
  defaultFlightNumber,
  defaultAirportIata,
}: SubscribeToAlertFormProps) {
  const defaultType: AlertType = defaultFlightNumber
    ? 'FLIGHT'
    : defaultAirportIata
      ? 'AIRPORT'
      : 'FLIGHT'

  const [email, setEmail] = useState('')
  const [alertType, setAlertType] = useState<AlertType>(defaultType)
  const [watchValue, setWatchValue] = useState(defaultFlightNumber ?? defaultAirportIata ?? '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const selectedOption = ALERT_TYPE_OPTIONS.find((o) => o.value === alertType)!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validation = clientSchema.safeParse({ email, alertType, watchValue })
    if (!validation.success) {
      setError(validation.error.errors[0]?.message ?? 'Please check your input')
      return
    }

    setStatus('loading')
    setError(null)

    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, alertType, watchValue }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <CheckCircle className="h-10 w-10 text-green-500" aria-hidden="true" />
          <p className="font-semibold">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to <strong>{email}</strong>. Click it to activate your alert
            for <strong>{watchValue}</strong>.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" aria-hidden="true" />
          Get disruption alerts
        </CardTitle>
        <CardDescription>
          We&apos;ll email you when disruptions are detected. No account required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="alert-type">Alert type</Label>
            <Select
              value={alertType}
              onValueChange={(v) => {
                setAlertType(v as AlertType)
                setWatchValue('')
              }}
            >
              <SelectTrigger id="alert-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="watch-value">{selectedOption.label}</Label>
            <Input
              id="watch-value"
              type="text"
              value={watchValue}
              onChange={(e) => setWatchValue(e.target.value.toUpperCase())}
              placeholder={selectedOption.placeholder}
              maxLength={20}
              required
              aria-describedby="watch-value-hint"
            />
            <p id="watch-value-hint" className="text-xs text-muted-foreground">
              {selectedOption.hint}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alert-email">Email address</Label>
            <Input
              id="alert-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              aria-describedby={error ? 'subscribe-error' : undefined}
            />
          </div>

          {error && (
            <p id="subscribe-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Setting up alert…' : 'Set up alert'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Free. We&apos;ll only email you about disruptions for your saved alert. No spam.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
