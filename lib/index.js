const { toJS, validate, resolve } = require("./util");
const Document = require("./document");

/**
 *
 * @param {string[] | Object[]} files files that are to be bundled
 * @param {Object} options
 * @param {string | object} options.base base object whose prperties will be retained.
 * @param {boolean} options.referenceIntoComponents pass true value to resolve references into component 
 * 
 * @return {Document}
 * 
 * @example
 * 
 * const bundle = requrie('@asyncapi/bundler');
 * const fs = require('fs');
 * const path = requrie('path');
 * 
 * const document = await bundle(fs.readFileSync(
 *   path.resolve('./asyncapi.yaml', 'utf-8')
 * ));
 * 
 * console.log(document.yml());
 */
const bundle = async (files, options = {}) => {
  if (typeof options.base !== "undefined") {
    options.base = toJS(options.base);
  }

  const parsedJsons = files.map(file => toJS(file));
  /**
   * Bundle all external references for each files.  
   */
  const resolvedJsons = await resolve(parsedJsons, {referenceIntoComponents: options.referenceIntoComponents});

  return new Document(resolvedJsons, options.base);
};

module.exports = bundle;
