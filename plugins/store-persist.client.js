const persistStores = ['settings', 'tasklist']
const storeResetKey = '--reset-store'

/** Get the persistence key of the store by its ID */
const getStorePersistenceKey = id => `persist-${id}`

/** Restore store to its persisted state (if there is such a state) */
function restoreStore (store) {
  const stateToRestore = JSON.parse(localStorage.getItem(getStorePersistenceKey(store.$id)))

  if (stateToRestore !== null) {
    store.$patch(stateToRestore)
  }
}

const PiniaNuxtPersistencePlugin = ({ app, $pinia }) => {
  const PiniaPersistPlugin = ({ store }) => {
    if (persistStores.includes(store.$id)) {
      const restore = localStorage.getItem(storeResetKey) == null
      // Restore the store first
      if (restore) {
        restoreStore(store)
      }

      // `afterEach` is used as a workaround to Pinia subscribers disappearing on navigation
      app.router.afterEach(() => {
        // Subscribe to changes and persist them
        const unsubscribe = store.$subscribe(() => {
          try {
            if (store.$id === 'settings') {
              if (store.$state.reset) {
                // if the settings store is in reset state, set store reset key
                localStorage.setItem(storeResetKey, '1')
              } else {
                // otherwise remove the reset key
                localStorage.removeItem(storeResetKey)
              }
            }

            // otherwise persist store
            localStorage.setItem(
              getStorePersistenceKey(store.$id),
              JSON.stringify(store.$state)
            )
          } catch (err) {
            console.log(err)
            // Failed to write to localStorage for some reason, unsubscribe persistence
            unsubscribe()
          }
        })
      })
    }
  }

  $pinia.use(PiniaPersistPlugin)
}

export default PiniaNuxtPersistencePlugin
