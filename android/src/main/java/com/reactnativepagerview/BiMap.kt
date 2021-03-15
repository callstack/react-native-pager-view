package com.reactnativepagerview

class BiMap<K, V> {
    private val keyToValue = mutableMapOf<K, V>()
    private val valueToKey = mutableMapOf<V, K>()

    fun clear() {
        keyToValue.clear()
        valueToKey.clear()
    }

    fun getByKey(key: K): V? {
        return keyToValue[key]
    }

    fun getByValue(value: V): K? {
        return valueToKey[value]
    }

    fun put(key: K, value: V) {
        check(keyToValue.put(key, value) == null && valueToKey.put(value, key) == null) {
            // Note: BiMap is now in an undefined state.
            "Existing BiMap entry overwritten."
        }
    }
}
