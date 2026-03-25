import type { AlertType } from './database'

/**
 * Alert subscription — application-level representation.
 */
export interface AlertSubscription {
  id: string
  email: string
  alertType: AlertType
  watchValue: string // Flight number, route string, airline IATA, or airport IATA
  emailVerified: boolean
  isActive: boolean
  createdAt: string
}

/**
 * Input schema for creating a new alert subscription.
 */
export interface CreateAlertSubscriptionInput {
  email: string
  alertType: AlertType
  watchValue: string
}

/**
 * Email notification payload — used to format and send alerts.
 */
export interface AlertNotificationPayload {
  subscriptionId: string
  email: string
  alertType: AlertType
  watchValue: string
  disruptions: Array<{
    flightNumber: string
    route: string
    disruptionType: string
    severity: string
    reason: string | null
    updatedAt: string
  }>
}
