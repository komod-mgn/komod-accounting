type TPropertyType = (
    'string' |
    'number' |
    'ref' |
    'miltiref' |
    'enum' |
    'multienum' |
    'datetime' |
    'daterange'
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
    sortable ?: boolean
    filterable ?: boolean

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
    controlFormatter ?: (od: TPropertyOptionDescription) => string
    // enum, ref - columns
    tableFormatter ?: (
        {
            value,
            elUiCellScope,
            fieldView,
        } : {
            value: any,
            elUiCellScope: any, // todo найти тип
            fieldView: IPropertyBaseView,
        }
    ) => string
    // ref - columns
    hrefModuleName ?: string
    hrefQueryIdParam ?: string
}
