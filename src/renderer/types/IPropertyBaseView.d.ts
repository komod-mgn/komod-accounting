type TPropertyType = (
    'string' |
    'number' |
    'ref' |
    'enum' |
    'datetime'
)

type TPropertyOptionDescription = string | Object

interface IPropertyOptionsMap {
    [value: string] : TPropertyOptionDescription
}

export default interface IPropertyBaseView {
    name : string
    label : string
    type : TPropertyType

    // Columns
    minWidth ?: number
    fixedToSide ?: 'left' | 'right'

    // Controls
    // http://element.eleme.io/#/en-US/component/form#validation
    // https://github.com/yiminghe/async-validator#rules
    validationRules ?: Array<Object>
    triggerRevalidation ?: boolean

    // number - controls
    min ?: number
    max ?: number

    // enum, ref - controls
    optionsMap ?: IPropertyOptionsMap
    multiple ?: boolean
    controlFormatter ?: (od: TPropertyOptionDescription) => string
    // enum, ref - columns
    tableFormatter ?: (row: Object, column: Object, value: any) => string,
    // ref - columns
    hrefModuleName ?: string
    hrefQueryIdParam ?: string
}
