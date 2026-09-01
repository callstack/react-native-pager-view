package com.reactnativepagerview

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class ComposeViewLifecycleOwnerTest {
  @get:Rule
  val instantTaskExecutorRule = InstantTaskExecutorRule()

  @Test
  fun `follows the attached host lifecycle without inheriting destruction`() {
    val owner = ComposeViewLifecycleOwner()
    val host = TestLifecycleOwner()

    host.moveTo(Lifecycle.State.RESUMED)
    owner.attach(host.lifecycle)
    assertEquals(Lifecycle.State.RESUMED, owner.lifecycle.currentState)

    host.moveTo(Lifecycle.State.STARTED)
    assertEquals(Lifecycle.State.STARTED, owner.lifecycle.currentState)

    host.moveTo(Lifecycle.State.CREATED)
    assertEquals(Lifecycle.State.CREATED, owner.lifecycle.currentState)

    host.moveTo(Lifecycle.State.RESUMED)
    assertEquals(Lifecycle.State.RESUMED, owner.lifecycle.currentState)

    host.moveTo(Lifecycle.State.DESTROYED)
    assertEquals(Lifecycle.State.CREATED, owner.lifecycle.currentState)
  }

  @Test
  fun `survives host replacement and follows the replacement owner`() {
    val owner = ComposeViewLifecycleOwner()
    val oldHost = TestLifecycleOwner()
    val replacementHost = TestLifecycleOwner()

    oldHost.moveTo(Lifecycle.State.RESUMED)
    owner.attach(oldHost.lifecycle)
    oldHost.moveTo(Lifecycle.State.DESTROYED)

    owner.detach()
    owner.attach(replacementHost.lifecycle)
    assertEquals(Lifecycle.State.CREATED, owner.lifecycle.currentState)

    replacementHost.moveTo(Lifecycle.State.STARTED)
    assertEquals(Lifecycle.State.STARTED, owner.lifecycle.currentState)

    replacementHost.moveTo(Lifecycle.State.RESUMED)
    assertEquals(Lifecycle.State.RESUMED, owner.lifecycle.currentState)
  }

  @Test
  fun `detaches from the host and only destroys on explicit disposal`() {
    val owner = ComposeViewLifecycleOwner()
    val host = TestLifecycleOwner()

    host.moveTo(Lifecycle.State.RESUMED)
    owner.attach(host.lifecycle)
    owner.detach()
    assertEquals(Lifecycle.State.CREATED, owner.lifecycle.currentState)

    host.moveTo(Lifecycle.State.CREATED)
    host.moveTo(Lifecycle.State.RESUMED)
    assertEquals(Lifecycle.State.CREATED, owner.lifecycle.currentState)

    owner.destroy()
    assertEquals(Lifecycle.State.DESTROYED, owner.lifecycle.currentState)
  }

  private class TestLifecycleOwner : LifecycleOwner {
    private val registry = LifecycleRegistry(this)

    override val lifecycle: Lifecycle
      get() = registry

    fun moveTo(state: Lifecycle.State) {
      registry.currentState = state
    }
  }
}
