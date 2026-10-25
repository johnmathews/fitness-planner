<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Mail } from '@lucide/vue'
import { useSessionStore, type AuthProblem } from '@/stores/session'
import { describeProblem } from '@/lib/problems'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'

const session = useSessionStore()
const busy = ref(false)
const sent = ref(false)
const problem = ref<AuthProblem | null>(null)

// A different account starts afresh.
watch(
  () => session.user,
  () => {
    sent.value = false
    problem.value = null
  },
)

const text = computed(() => {
  if (problem.value) return describeProblem(problem.value)
  if (sent.value) return `A new link is on its way to ${session.user}.`
  return `The link is in the email sent to ${session.user}.`
})

async function resend(): Promise<void> {
  if (busy.value) return
  busy.value = true
  problem.value = await session.resendConfirmation()
  busy.value = false
  sent.value = problem.value === null
}
</script>

<!-- Until the account's email is confirmed (Banner card, "Confirm your email"): neutral, since
     nothing is wrong, with the one action that helps. Once a new link is sent, the action goes. -->
<template>
  <div data-noprint aria-live="polite">
    <Banner
      v-if="session.confirmed === false"
      class="mt-4"
      :icon="Mail"
      lead="Confirm your email."
      data-testid="email-status"
    >
      {{ text }}
      <template v-if="!sent" #action>
        <Button size="sm" :busy="busy" @click="resend">
          {{ busy ? 'Sending…' : 'Send it again' }}
        </Button>
      </template>
    </Banner>
  </div>
</template>
