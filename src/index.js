const prefix = '_oldstyle_events$',
      broadcastPrefix = 'broadcast$',
      dispatchPrefix = 'dispatch$'

const OldstyleEvents = {
  install (Vue, options) {
    const on = Vue.prototype.$on,
          emit = Vue.prototype.$emit

    Vue.prototype.$emit = function $emit (event, ...data) {
      const cbs = this._events[event],
            transmit = !cbs || !cbs.length

      if (event.startsWith(prefix + broadcastPrefix)) {
        emit.call(this, event, ...data)

        if (transmit) {
          this.$broadcast(event.slice((prefix + broadcastPrefix).length), ...data)
        }
      } else if (event.startsWith(prefix + dispatchPrefix)) {
        emit.call(this, event, ...data)
        if (transmit) {
          this.$dispatch(event.slice((prefix + dispatchPrefix).length), ...data)
        }
      } else {
        emit.call(this, event, ...data)
      }

      return this
    }
    Vue.prototype.$on = function $on (event, cb) {
      on.call(this, event, cb)

      function broadcastCb (...args) {
        const value = cb.call(this, ...args)
        if (value) {
          this.$broadcast(event, ...args)
        }
      }
      function dispatchCb (...args) {
        const value = cb.call(this, ...args)
        if (value) {
          this.$dispatch(event, ...args)
        }
      }
      on.call(this, prefix + broadcastPrefix + event, broadcastCb)
      on.call(this, prefix + dispatchPrefix + event, dispatchCb)

      this.$initOldstyleEvents()
      if (!this._oldstyle_events[event]) {
        this._oldstyle_events[event] = []
      }
      this._oldstyle_events[event].push({
        broadcastCb,
        dispatchCb,
        emitCb: cb
      })
      return this
    }
    Vue.prototype.$off = function $off (event, cb) {
      this.$initOldstyleEvents()

      if (!arguments.length) {
        this._oldstyle_events = Object.create(null)
        this._events = Object.create(null)
        return this
      }

      if (!cb) {
        this._oldstyle_events[event] = null
        this._events[prefix + broadcastPrefix + event] = null
        this._events[prefix + dispatchPrefix + event] = null
        this._events[event] = null
        return this
      }

      const eventCbs = this._oldstyle_events[event]
      this._oldstyle_events[event] = eventCbs.filter(x => x.emitCb !== cb && x.emitCb !== cb.fn)

      eventCbs.filter(x => x.emitCb === cb || x.emitCb === cb.fn).forEach(cbs => {
        const emitCbIndex = this._events[event].indexOf(cbs.emitCb)
        this._events[event].splice(emitCbIndex, 1)

        const broadcastCbIndex = this._events[prefix + broadcastPrefix + event].indexOf(cbs.broadcastCb)
        this._events[prefix + broadcastPrefix + event].splice(broadcastCbIndex, 1)

        const dispatchCbIndex = this._events[prefix + dispatchPrefix + event].indexOf(cbs.dispatchCb)
        this._events[prefix + dispatchPrefix + event].splice(dispatchCbIndex, 1)
      })
      return this
    }
    Vue.prototype.$once = function $once (event, cb) {
      const on = () => {
        this.$off(event, on)
        return cb.apply(this, arguments)
      }
      on.fn = cb
      this.$on(event, on)
      return this
    }
    Vue.prototype.$broadcast = function $broadcast (event, ...args) {
      this.$children.forEach(child => {
        child.$emit(prefix + broadcastPrefix + event, ...args)
      })
      return this
    }
    Vue.prototype.$dispatch = function $dispatch (event, ...args) {
      if (this.$parent) {
        this.$parent.$emit(prefix + dispatchPrefix + event, ...args)
      }
      return this
    }
    Vue.prototype.$initOldstyleEvents = function $initOldstyleEvents () {
      if (!this._oldstyle_events) {
        this._oldstyle_events = Object.create(null)
      }
    }
    Vue.mixin({
      beforeCreate () {
        this.$initOldstyleEvents()
        Object.keys(this.$options.events || {}).forEach(key => {
          this.$on(key, this.$options.events[key])
        })
      }
    })
  }
}

export default OldstyleEvents

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  // Auto install in dist mode
  window.Vue.use(OldstyleEvents)
}
