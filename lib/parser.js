const $RefParser = require('@apidevtools/json-schema-ref-parser');
const { JSONPath } = require('jsonpath-plus');
const { merge } = require('lodash');

class ExternalComponents {
    ref;
    resolvedJSON;
    constructor(ref, resolvedJSON) {
        this.ref = ref;
        this.resolvedJSON = resolvedJSON;
    }

    getKey() {
        const keys = this.ref.split('/');
        return keys[keys.length - 1]
    }

    getValue() {
        return this.resolvedJSON;
    }
}

/**
 * resolves external references and updates $refs 
 * @param {Object[]} JSONSchema 
 */
async function parse(JSONSchema) {
    const $ref = await $RefParser.resolve(JSONSchema);
    const refs = crawlChanelPropertiesForRefs(JSONSchema);
    for (let ref of refs) {
        if (isExternalReference(ref)) {
            const componentObject = await resolveExternalRefs(JSONSchema, $ref);
            if (JSONSchema.components) {
                merge(JSONSchema.components, componentObject);
            } else {
                JSONSchema.components = componentObject
            }
        }
    }
}

function crawlChanelPropertiesForRefs(JSONSchema) {
    return JSONPath({ json: JSONSchema, path: `$.channels.*.*.message['$ref']` });
}

/**
 * This function checks for external reference. 
 * @param {string} ref 
 * @returns {boolean}
 */
function isExternalReference(ref) {
    return !ref.startsWith('#')
}

module.exports = {
    parse,
}

/**
 * 
 * @param {Object[]} parsedJSON 
 * @param {$RefParser} $refs 
 * @returns {ExternalComponents}
 */
async function resolveExternalRefs(parsedJSON, $refs) {
    const componentObj = { messages: {} };
    JSONPath({ json: parsedJSON, resultType: 'all', path: '$.channels.*.*.message' }).forEach(({ parent, parentProperty }) => {
        const ref = parent[parentProperty]['$ref'];
        if (isExternalReference(ref)) {
            const value = $refs.get(ref);
            const component = new ExternalComponents(ref, value);
            componentObj.messages[String(component.getKey())] = component.getValue()
            parent[parentProperty]['$ref'] = `#/components/messages/${component.getKey()}`;
        }
    })
    return componentObj
}
