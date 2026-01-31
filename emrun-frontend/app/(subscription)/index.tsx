/**
 * Subscription group index: redirect to pricing so the subscription flow
 * always starts at the pricing screen.
 */
import { Redirect } from 'expo-router';

export default function SubscriptionIndex() {
  return <Redirect href="/(subscription)/pricing" />;
}
