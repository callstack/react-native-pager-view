package com.reactnativecommunity.viewpager;

import java.util.HashMap;
import java.util.Map;

public class BiMap<K, V> {
    private final Map<K, V> keyToValue = new HashMap<>();
    private final Map<V, K> valueToKey = new HashMap<>();

    public void clear() {
        keyToValue.clear();
        valueToKey.clear();
    }

    public V getByKey(K key) {
        return keyToValue.get(key);
    }

    public K getByValue(V value) {
        return valueToKey.get(value);
    }

    public void put(K key, V value) {
        if (keyToValue.put(key, value) != null || valueToKey.put(value, key) != null) {
            // Note: BiMap is now in an undefined state.
            throw new IllegalStateException("Existing BiMap entry overwritten.");
        }
    }
}
