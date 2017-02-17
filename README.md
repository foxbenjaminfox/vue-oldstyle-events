<big><h1 align="center">vue-oldstyle-events</h1></big>

<p align="center">
  <a href="https://npmjs.org/package/vue-oldstyle-events">
    <img src="https://img.shields.io/npm/v/vue-oldstyle-events.svg?style=flat-square"
         alt="NPM Version">
  </a>

  <a href="https://coveralls.io/r/foxbenjaminfox/vue-oldstyle-events">
    <img src="https://img.shields.io/coveralls/foxbenjaminfox/vue-oldstyle-events.svg?style=flat-square"
         alt="Coverage Status">
  </a>

  <a href="https://travis-ci.org/foxbenjaminfox/vue-oldstyle-events">
    <img src="https://img.shields.io/travis/foxbenjaminfox/vue-oldstyle-events.svg?style=flat-square"
         alt="Build Status">
  </a>

  <a href="https://npmjs.org/package/vue-oldstyle-events">
    <img src="http://img.shields.io/npm/dm/vue-oldstyle-events.svg?style=flat-square"
         alt="Downloads">
  </a>

  <a href="https://david-dm.org/foxbenjaminfox/vue-oldstyle-events.svg">
    <img src="https://david-dm.org/foxbenjaminfox/vue-oldstyle-events.svg?style=flat-square"
         alt="Dependency Status">
  </a>

  <a href="https://github.com/foxbenjaminfox/vue-oldstyle-events/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/vue-oldstyle-events.svg?style=flat-square"
         alt="License">
  </a>
</p>

The biggest blocker to upgrading to Vue 2 is the fact that Vue 2 does not support
Vue 1.0's `$broadcast` and`$dispatch` methods, and Vue 2 doesn't come with a drop-in
replacement for them. This package is that replacement.

It is important to remember that there is a good reason that Vue 2 dropped these methods.
To quote the upgrade guide:

> The problem is event flows that depend on a component's tree structure can be hard to
> reason about and very brittle when the tree becomes large. It simply doesn't scale well
> and we don't want to set you up for pain later. $dispatch and $broadcast also do not solve
> communication between sibling components.

All this is true. But that doesn't solve the problem of legacy codebases which already have
a serious amount of functionality implemented this way. It's a shame for this one thing to 
block you from upgrading to the newest version of Vue.

## Install

````sh
npm install --save vue-oldstyle-events
````

## Usage

Just do:

````js
import OldstyleEvents from 'vue-oldstyle-events'

Vue.use(OldstyleEvents)
````

Now `$broadcast` and `$dispatch` work just [like they did in Vue 1.0](http://v1.vuejs.org/api/#vm-dispatch). You may also register an
events object on your Vue instance, again just [like you could in Vue 1.0](http://v1.vuejs.org/api/#events).

Once again, using this in a new project is discouraged. Use an [event hub](https://vuejs.org/v2/guide/migration.html#dispatch-and-broadcast-replaced) or [vuex](https://github.com/vuejs/vuex) instead.

But if, like me, you have a codebase that because of this feature is still stuck on Vue 1,
then this plugin can help you upgrade to Vue 2 without rewriting all of your event-based logic.

## License

MIT © [Benjamin Fox](http://github.com/foxbenjaminfox)

[npm-url]: https://npmjs.org/package/vue-oldstyle-events
[npm-image]: https://img.shields.io/npm/v/vue-oldstyle-events.svg?style=flat-square

[travis-url]: https://travis-ci.org/foxbenjaminfox/vue-oldstyle-events
[travis-image]: https://img.shields.io/travis/foxbenjaminfox/vue-oldstyle-events.svg?style=flat-square

[depstat-url]: https://david-dm.org/foxbenjaminfox/vue-oldstyle-events
[depstat-image]: https://david-dm.org/foxbenjaminfox/vue-oldstyle-events.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/vue-oldstyle-events.svg?style=flat-square
