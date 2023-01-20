<script lang="ts">
  export default defineComponent({
    name: 'ClientOnly',
    setup: (props, { slots }) => {
      const mounted = ref(false)
      onMounted(() => (mounted.value = true))

      return () => {
        return mounted.value && slots.default && slots.default({})
      }
    }
  })
</script>
