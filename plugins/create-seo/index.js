/* eslint-disable no-console */
import siteNav from '@cmsApi/main-nav'
import Vue from 'vue'
import { createDefaultMeta, createRouteMeta, setupRoutesMeta } from './helpers'

setupRoutesMeta(siteNav)

Vue.prototype.$createSeo = function(slug, route, baseMetaArray = []) {
  // if (!siteNav[slug]) return {}
  return Object.entries(siteNav[slug].seo).reduce((acc, [key, actualValue]) => {
    const title = siteNav[slug].title === false ? null : siteNav[slug].label
    const description = siteNav[slug].description || null
    const defaultMetaArray = createDefaultMeta(
      process.env.baseUrl,
      route || this.$route.path.substr(1),
      // this.$route.path.substr(1),
      title
    )

    /**
     * If description property exists then return the array of meta objects.
     * Else return null
     */
    const metaArrayForRouteDescription = description
      ? [
          {
            hid: 'description',
            name: 'description',
            property: 'description',
            content: description
          },
          {
            hid: 'og:description',
            name: 'og:description',
            property: 'og:description',
            content: description
          }
        ]
      : null

    /**
     * Add meta for description if the property exist for the route
     */
    createRouteMeta(defaultMetaArray, metaArrayForRouteDescription)

    const valueForKey =
      key !== 'meta'
        ? actualValue
        : wrap(actualValue)
            .concat(defaultMetaArray, baseMetaArray)
            .reduce(
              (acc, metaObject) =>
                acc.concat(retrieveMetaObjectArray(metaObject)),
              []
            )

    return { ...acc, [key]: valueForKey }
  }, {})
}

const wrap = a => (Array.isArray(a) ? a : [a])

const retrieveMetaObjectArray = metaObject => {
  const wrappedName = wrap(metaObject.name)

  return wrappedName.map(n => ({
    hid: n,
    name: n,
    property: n,
    // Fix url when the meta information is og:image
    content: wrappedName.includes('og:image')
      ? process.env.baseUrl + metaObject.content.substr(1)
      : metaObject.content
  }))
}

export default (ctx, inject) => {
  ctx.$createSeo = Vue.prototype.$createSeo
}
