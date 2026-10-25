<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useSessionStore, type AuthProblem, type LinkKind } from '@/stores/session'
import { MISMATCH, describeProblem } from '@/lib/problems'
import AuthCard from '@/components/AuthCard.vue'
import { Button } from '@/components/ui/button'
import { InlineMessage } from '@/components/ui/inline-message'
import { TextField } from '@/components/ui/text-field'
import { TextLink } from '@/components/ui/text-link'

const props = defineProps<{ token: string }>()
const emit = defineEmits<{
  /** The password is set and the user signed in. */
  done: []
  /** The link can never work (used, expired, unknown), so its token can leave the address bar. */
  spent: []
  /** The person left a spent link for the sign-in screen. */
  leave: []
}>()

const MIN = 10
const session = useSessionStore()
const link = ref<{ kind: LinkKind; username: string } | null>(null)
const problem = ref<AuthProblem | null>(null)
const password = ref('')
const confirm = ref('')
const busy = ref(false)
const mismatch = ref(false)

const title = computed(() => {
  if (link.value) {
    return link.value.kind === 'invite'
      ? `Welcome, ${link.value.username}`
      : 'Choose a new password'
  }
  if (!problem.value) return 'Checking the link…'
  return problem.value.code === 'gone' ? 'Link not valid' : 'Couldn’t check the link'
})
// Offline or busy: the link may be fine, so offer to try again rather than give up on it.
const canRetry = computed(
  () => !link.value && problem.value !== null && problem.value.code !== 'gone',
)
// The server's length rule belongs to the password field; anything else goes above the button.
const tooShort = computed(() =>
  problem.value?.code === 'password' ? describeProblem(problem.value) : undefined,
)
const formProblem = computed(() =>
  problem.value && problem.value.code !== 'password' ? describeProblem(problem.value) : null,
)

// A field's error stays until its value changes.
watch([password, confirm], () => {
  mismatch.value = false
  if (tooShort.value) problem.value = null
})

async function check(): Promise<void> {
  problem.value = null
  const result = await session.lookup(props.token)
  if (!('code' in result)) {
    link.value = result
    return
  }
  problem.value = result
  if (result.code === 'gone') emit('spent')
}

onMounted(check)

async function submit(): Promise<void> {
  mismatch.value = password.value !== confirm.value
  if (mismatch.value) {
    await nextTick()
    const input = document.getElementById('confirm-password') as HTMLInputElement | null
    input?.focus()
    input?.select()
    return
  }
  if (busy.value) return
  busy.value = true
  problem.value = await session.redeem(props.token, password.value)
  busy.value = false
  if (!problem.value) emit('done')
  else if (problem.value.code === 'gone') {
    // Used in another tab meanwhile: the form can't succeed, so show the spent-link card.
    link.value = null
    emit('spent')
  }
}
</script>

<template>
  <AuthCard :title="title">
    <template v-if="link">
      <p class="body mb-6 text-ink-secondary">
        <template v-if="link.kind === 'invite'">
          Choose a password to finish setting up your account.
        </template>
        <template v-else>
          For <strong class="font-semibold text-ink">{{ link.username }}</strong
          >. This signs you out on every other device.
        </template>
      </p>
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <!-- For password managers, which save the new password against this username. It is
             `hidden`, so nobody sees or hears it and it needs no label. -->
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          type="text"
          name="username"
          autocomplete="username"
          :value="link.username"
          hidden
          readonly
        />
        <TextField
          id="new-password"
          v-model="password"
          label="Password"
          type="password"
          autocomplete="new-password"
          :minlength="MIN"
          maxlength="256"
          required
          :hint="`At least ${MIN} characters.`"
          :error="tooShort"
        />
        <TextField
          id="confirm-password"
          v-model="confirm"
          label="Repeat password"
          type="password"
          autocomplete="new-password"
          required
          :error="mismatch ? MISMATCH : undefined"
        />
        <InlineMessage v-if="formProblem" id="link-problem" tone="error" data-testid="link-problem">
          {{ formProblem }}
        </InlineMessage>
        <Button type="submit" variant="primary" class="mt-2" :busy="busy">
          {{ busy ? 'Saving…' : 'Set password' }}
        </Button>
      </form>
    </template>
    <template v-else-if="problem">
      <InlineMessage id="link-problem" tone="error" class="mt-4" data-testid="link-problem">
        {{ describeProblem(problem) }}
      </InlineMessage>
      <Button v-if="canRetry" class="mt-6" @click="check">Try again</Button>
      <p v-else class="body mt-6">
        <TextLink href="/" @click.prevent="emit('leave')">Go to sign in</TextLink>
      </p>
    </template>
  </AuthCard>
</template>
