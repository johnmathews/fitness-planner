<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useSessionStore, type AuthProblem } from '@/stores/session'
import { describeProblem } from '@/lib/problems'
import AuthCard from '@/components/AuthCard.vue'
import { Button } from '@/components/ui/button'
import { InlineMessage } from '@/components/ui/inline-message'
import { TextField } from '@/components/ui/text-field'
import { TextLink } from '@/components/ui/text-link'

const emit = defineEmits<{
  /** The person left for the sign-in screen. */
  leave: []
}>()

const session = useSessionStore()
const email = ref('')
const busy = ref(false)
/** The address a link went to, once the server has taken the request. */
const sent = ref<string | null>(null)
const problem = ref<AuthProblem | null>(null)

// A badly formed email belongs to the field; anything else goes above the button.
const emailError = computed(() =>
  problem.value?.code === 'email' ? describeProblem(problem.value) : undefined,
)
const formProblem = computed(() =>
  problem.value && problem.value.code !== 'email' ? describeProblem(problem.value) : null,
)
watch(email, () => {
  if (emailError.value) problem.value = null
})

async function submit(): Promise<void> {
  if (busy.value) return
  busy.value = true
  const address = email.value.trim()
  problem.value = await session.forgot(address)
  busy.value = false
  if (!problem.value) {
    sent.value = address
    return
  }
  if (problem.value.code === 'email') {
    await nextTick()
    const input = document.getElementById('forgot-email') as HTMLInputElement | null
    input?.focus()
    input?.select()
  }
}
</script>

<template>
  <AuthCard title="Reset your password">
    <!-- The same words whether or not there is an account, so the page gives nothing away. -->
    <p v-if="sent" class="body text-ink-secondary" data-testid="forgot-sent" aria-live="polite">
      If there’s an account for <strong class="font-semibold text-ink">{{ sent }}</strong
      >, a link to choose a new password is on its way. It works for one hour.
    </p>
    <template v-else>
      <p class="body mb-6 text-ink-secondary">
        Enter the email you signed up with, and a link to choose a new password goes there.
      </p>
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <TextField
          id="forgot-email"
          v-model="email"
          label="Email"
          type="email"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          maxlength="254"
          required
          hint="Signed in with a username? Ask whoever runs this planner for a reset link."
          :error="emailError"
        />
        <InlineMessage
          v-if="formProblem"
          id="forgot-problem"
          tone="error"
          data-testid="forgot-problem"
        >
          {{ formProblem }}
        </InlineMessage>
        <Button type="submit" variant="primary" class="mt-2" :busy="busy">
          {{ busy ? 'Sending link…' : 'Send link' }}
        </Button>
      </form>
    </template>
    <p class="body mt-6">
      <TextLink href="/" @click.prevent="emit('leave')">Go to sign in</TextLink>
    </p>
  </AuthCard>
</template>
