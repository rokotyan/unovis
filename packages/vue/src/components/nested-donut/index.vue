<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import { NestedDonut, NestedDonutConfigInterface, StringAccessor } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'

const accessor = inject(componentAccessorKey)

// data and required props 
type Props = NestedDonutConfigInterface<Datum>
const props = defineProps<Props & { data?: Datum[] }>()

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<NestedDonut<Datum>>()


onMounted(() => {
  nextTick(() => {
    component.value = new NestedDonut<Datum>(config.value)
    component.value?.setData(data.value)
    accessor.update(component.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
  accessor.destroy()
})

watch(config, (curr, prev) => {
  if (!arePropsEqual(curr, prev)) {
    component.value?.setConfig(config.value)
  }
})

watch(data, () => {
  component.value?.setData(data.value)
})

defineExpose({
  component
})
</script>

<script lang="ts">
export const VisNestedDonutSelectors = NestedDonut.selectors
</script>

<template>
  <div data-vis-component />
</template>


