import test from 'tape'
import Vue from 'vue'
import OldstyleEventbus from '../src'

Vue.use(OldstyleEventbus)

/*
 * Some of the tests are adapted from the original
25/02/2017 -> 0.4
 * Vue 1.0 tests for $broadcast and $dispatch
 */

test("$broadcast", t => {
  t.plan(2)
  const parent = new Vue()
  const vm = new Vue({ parent })
  const child1 = new Vue({ parent: vm })
  const child2 = new Vue({ parent: vm })
  const child3 = new Vue({ parent: child1 })
  child1.$on('test', () => t.pass('Child1 should recive event'))
  child2.$on('test', () => t.pass('Child2 should recive event'))
  child3.$on('test', () => t.fail('Child3 should not recive event'))
  vm.$on('test', () => t.fail('Self should not recive event'))
  parent.$on('test', () => t.fail('Parent should not recive event'))
  vm.$broadcast('test')
})

test("$broadcast with data", t => {
  t.plan(1)
  const vm = new Vue()
  const child = new Vue({ parent: vm })
  child.$on('test', data => t.equals(data, 'test data', 'Child1 should receive event with data'))
  vm.$broadcast('test', 'test data')
})

test('$broadcast with propagation', t => {
  t.plan(3)
  const vm = new Vue()
  const child1 = new Vue({ parent: vm })
  const child2 = new Vue({ parent: vm })
  const child3 = new Vue({ parent: child1 })
  child1.$on('test', function () {
    t.pass('Child1 should recive event')
    return true
  })
  child2.$on('test', () => t.pass('Child2 should receive event'))
  child2.$on('test', () => t.pass('Child3 should receive propagated event'))
  vm.$broadcast('test')
})

test("multi-level $broadcast", t => {
  t.plan(3)
  const vm = new Vue()
  const child1 = new Vue({ parent: vm })
  const child2 = new Vue({ parent: child1 })
  const child3 = new Vue({ parent: child2 })
  child1.$on('test', () => {
    t.pass('Child1 should receive event')
    return true
  })
  child2.$on('test', () => {
    t.pass('Child2 should receive propagated event')
    return true
  })
  child3.$on('test', () => {
    t.pass('Child3 should receive propagated (twice) event')
  })
  vm.$broadcast('test')
})

test("multi-level $broadcast canceled", t => {
  t.plan(2)
  const vm = new Vue()
  const child1 = new Vue({ parent: vm })
  const child2 = new Vue({ parent: child1 })
  const child3 = new Vue({ parent: child2 })
  child1.$on('test', () => {
    t.pass('Child1 should receive event')
    return true
  })
  child2.$on('test', () => {
    t.pass('Child2 should receive propagated event')
    return false
  })
  child3.$on('test', () => {
    t.fail('Child3 should not receive propagated (twice) event')
  })
  vm.$broadcast('test')
})

test("$dispatch", t => {
  t.plan(1)
  const parent = new Vue()
  const vm = new Vue({ parent })
  const child = new Vue({ parent: vm })
  child.$on('test', () => t.fail('Child should not recive event'))
  vm.$on('test', () => t.fail('Self should not recive event'))
  parent.$on('test', () => t.pass('Parent should recive event'))
  vm.$dispatch('test')
})

test('$dispatch with propagation', t => {
  t.plan(2)
  const parent2 = new Vue()
  const parent1 = new Vue({ parent: parent2 })
  const vm = new Vue({ parent: parent1 })
  parent1.$on('test', function () {
    t.pass('Parent1 should recive event')
    return true
  })
  parent2.$on('test', () => t.pass('Parent2 should receive event'))
  vm.$dispatch('test')
})

test('multi-level $dispatch canceled', t => {
  t.plan(1)
  const parent2 = new Vue()
  const parent1 = new Vue({ parent: parent2 })
  const vm = new Vue({ parent: parent1 })
  parent1.$on('test', function () {
    t.pass('Parent1 should recive event')
    return false
  })
  parent2.$on('test', () => t.fail('Parent2 should not receive event'))
  vm.$dispatch('test')
})

test('$broadcast, $dispatch, and $emit all work together', t => {
  t.plan(3)
  const parent = new Vue()
  const vm = new Vue({ parent })
  const child = new Vue({ parent: vm})
  vm.$on('test', data => t.equals(data, 'test-data', 'Recived event with data'))
  child.$dispatch('test', 'test-data')
  parent.$broadcast('test', 'test-data')
  vm.$emit('test', 'test-data')
})


test('events object catches events', t => {
  t.plan(3)
  const parent = new Vue()
  const vm = new Vue({
    parent,
    events: {
      'broadcast-test' () {
        t.pass('Recived broadcast')
      },
      'emit-test' () {
        t.pass('Recived emit')
      },
      'dispatch-test' () {
        t.pass('Recived dispatch')
      }
    }
  })
  const child = new Vue({ parent: vm})
  child.$dispatch('dispatch-test')
  vm.$emit('emit-test')
  parent.$broadcast('broadcast-test')
})


test('$off', t => {
  t.plan(18)

  function broadcastTest () {
    t.pass('Recived broadcast')
  }

  const parent = new Vue()
  const vm = new Vue({
    parent,
    events: {
      'broadcast-test': broadcastTest,
      'emit-test' () {
        t.pass('Recived emit')
      },
      'dispatch-test' () {
        t.pass('Recived dispatch')
      }
    }
  })
  const child = new Vue({ parent: vm})

  function numberOfKeys (object) {
    return Object.keys(object || {})
      .filter(key => object[key] && (object[key].length === undefined || object[key].length > 0))
      .length
  }

  vm.$on('emit-test', () => t.pass('Recived emit on manual handler'))
  vm.$on('dispatch-test', () => t.pass('Recived dispatch on manual handler'))

  t.equals(numberOfKeys(vm._oldstyle_events), 3, '3 oldstyle events registered')
  t.equals(numberOfKeys(vm._events), 9, '9 Vue events registered')

  child.$dispatch('dispatch-test')
  vm.$emit('emit-test')
  parent.$broadcast('broadcast-test')

  vm.$off('emit-test')
  t.equals(numberOfKeys(vm._oldstyle_events), 2, 'emit-test removed from oldstyle events list')
  t.equals(numberOfKeys(vm._events), 6, 'emit-test removed from events list')

  child.$dispatch('dispatch-test')
  vm.$emit('emit-test')
  parent.$broadcast('broadcast-test')

  vm.$off('broadcast-test', broadcastTest)
  t.equals(numberOfKeys(vm._oldstyle_events), 1, 'broadcast-test removed from oldstyle events list')
  t.equals(numberOfKeys(vm._events), 3, 'broadcast-test removed from events list')

  child.$dispatch('dispatch-test')
  vm.$emit('emit-test')
  parent.$broadcast('broadcast-test')

  vm.$off()
  t.equals(numberOfKeys(vm._oldstyle_events), 0, 'All oldstyle event handlers removed')
  t.equals(numberOfKeys(vm._events), 0, 'All Vue event handlers removed')

  child.$dispatch('dispatch-test')
  vm.$emit('emit-test')
  parent.$broadcast('broadcast-test')
})

test('Event registered with $once triggers only once', t => {
  t.plan(1)
  const parent = new Vue()
  const vm = new Vue({ parent })
  const child = new Vue({ parent: vm})

  vm.$once('test', () => t.pass('Event should be triggered once'))
  vm.$once('test-2', () => t.pass('Event should not be triggered'))
  child.$dispatch('test')
  vm.$emit('test')
  parent.$broadcast('test')
  parent.$broadcast('test')
  vm.$emit('test')
  child.$dispatch('test')

  vm.$off('test-2')
  child.$dispatch('test-2')
  vm.$emit('test-2')
  parent.$broadcast('test-2')
})

test("multi-level $broadcast without intermediate event handlers", t => {
  t.plan(2)
  const vm = new Vue()
  const child1 = new Vue({ parent: vm })
  const child2 = new Vue({ parent: child1 })
  const child3 = new Vue({ parent: child2 })

  const child4 = new Vue({ parent: vm })
  const child5 = new Vue({ parent: child4 })
  child5.$on('test', () => {
    t.pass('Child5 should receive propagated event')
  })
  child3.$on('test', () => {
    t.pass('Child3 should receive propagated (twice) event')
  })
  vm.$broadcast('test')
})

test("multi-level $dispatch without intermediate event handlers", t => {
  t.plan(2)
  const vm = new Vue()
  const child1 = new Vue({ parent: vm })
  const child2 = new Vue({ parent: child1 })
  const child3 = new Vue({ parent: child2 })

  const child4 = new Vue({ parent: vm })
  const child5 = new Vue({ parent: child4 })

  vm.$on('test-1', () => {
    t.pass('Self should receive propagated event')
  })
  vm.$on('test-2', () => {
    t.pass('Self should receive propagated (twice) event')
  })
  child5.$dispatch('test-1')
  child1.$dispatch('test-2')
})
