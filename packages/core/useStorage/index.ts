import type { Awaitable, ConfigurableEventFilter, ConfigurableFlush, MaybeRef, RemovableRef } from '@vueuse/shared'
import { watchWithFilter } from '@vueuse/shared'
import type { Ref } from 'vue-demi'
import { ref, shallowRef, unref } from 'vue-demi'
import { useEventListener } from '../useEventListener'
import type { ConfigurableWindow } from '../_configurable'
import { defaultWindow } from '../_configurable'
import { guessSerializerType } from './guess'

export type Serializer<T> = {
  read(raw: string): T
  write(value: T): string
}

export type SerializerAsync<T> = {
  read(raw: string): Awaitable<T>
  write(value: T): Awaitable<string>
}

export interface StorageLikeAsync {
  getItem(key: string): Awaitable<string | null>
  setItem(key: string, value: string): Awaitable<void>
  removeItem(key: string): Awaitable<void>
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const StorageSerializers: Record<'boolean' | 'object' | 'number' | 'any' | 'string' | 'map' | 'set', Serializer<any>> = {
  boolean: {
    read: (v: any) => v === 'true',
    write: (v: any) => String(v),
  },
  object: {
    read: (v: any) => JSON.parse(v),
    write: (v: any) => JSON.stringify(v),
  },
  number: {
    read: (v: any) => Number.parseFloat(v),
    write: (v: any) => String(v),
  },
  any: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  string: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  map: {
    read: (v: any) => new Map(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from((v as Map<any, any>).entries())),
  },
  set: {
    read: (v: any) => new Set(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from((v as Set<any>).entries())),
  },
}

export interface StorageOptions<T> extends ConfigurableEventFilter, ConfigurableWindow, ConfigurableFlush {
  /**
   * Watch for deep changes
   *
   * @default true
   */
  deep?: boolean

  /**
   * Listen to storage changes, useful for multiple tabs application
   *
   * @default true
   */
  listenToStorageChanges?: boolean

  /**
   * Write the default value to the storage when it does not existed
   *
   * @default true
   */
  writeDefaults?: boolean

  /**
   * Custom data serialization
   */
  serializer?: Serializer<T>

  /**
   * On error callback
   *
   * Default log error to `console.error`
   */
  onError?: (error: unknown) => void

  /**
   * Use shallow ref as reference
   *
   * @default false
   */
  shallow?: boolean
}

export function useStorage(key: string, initialValue: MaybeRef<string>, storage?: StorageLike, options?: StorageOptions<string>): RemovableRef<string>
export function useStorage(key: string, initialValue: MaybeRef<boolean>, storage?: StorageLike, options?: StorageOptions<boolean>): RemovableRef<boolean>
export function useStorage(key: string, initialValue: MaybeRef<number>, storage?: StorageLike, options?: StorageOptions<number>): RemovableRef<number>
export function useStorage<T> (key: string, initialValue: MaybeRef<T>, storage?: StorageLike, options?: StorageOptions<T>): RemovableRef<T>
export function useStorage<T = unknown> (key: string, initialValue: MaybeRef<null>, storage?: StorageLike, options?: StorageOptions<T>): RemovableRef<T>

/**
 * Reactive LocalStorage/SessionStorage.
 *
 * @see https://vueuse.org/useStorage
 * @param key
 * @param initialValue
 * @param storage
 * @param options
 */
export function useStorage<T extends(string|number|boolean|object|null)> (
  key: string,
  initialValue: MaybeRef<T>,
  storage: StorageLike | undefined = defaultWindow?.localStorage,
  options: StorageOptions<T> = {},
): RemovableRef<T> {
  const {
    flush = 'pre',
    deep = true,
    listenToStorageChanges = true,
    writeDefaults = true,
    shallow,
    window = defaultWindow,
    eventFilter,
    onError = (e) => {
      console.error(e)
    },
  } = options

  const rawInit: T = unref(initialValue)
  const type = guessSerializerType<T>(rawInit)

  const data = (shallow ? shallowRef : ref)(initialValue) as Ref<T>
  const serializer = options.serializer ?? StorageSerializers[type]

  function read(event?: StorageEvent) {
    if (!storage || (event && event.key !== key))
      return

    try {
      const rawValue = event ? event.newValue : storage.getItem(key)
      if (rawValue == null) {
        data.value = rawInit
        if (writeDefaults && rawInit !== null)
          storage.setItem(key, serializer.write(rawInit))
      }
      else {
        data.value = serializer.read(rawValue)
      }
    }
    catch (e) {
      onError(e)
    }
  }

  read()

  if (window && listenToStorageChanges)
    useEventListener(window, 'storage', e => setTimeout(() => read(e), 0))

  if (storage) {
    watchWithFilter(
      data,
      () => {
        try {
          if (data.value == null)
            storage.removeItem(key)
          else
            storage.setItem(key, serializer.write(data.value))
        }
        catch (e) {
          onError(e)
        }
      },
      {
        flush,
        deep,
        eventFilter,
      },
    )
  }

  return data as RemovableRef<T>
}
