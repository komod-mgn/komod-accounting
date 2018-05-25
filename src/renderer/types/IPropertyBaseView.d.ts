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

    // TODO divide field and column properties

    // Columns
    minWidth ?: number

    // number
    min ?: number
    max ?: number

    // enum, ref
    optionsMap ?: IPropertyOptionsMap
    multiple ?: boolean
    controlFormatter ?: (od: TPropertyOptionDescription) => string
}
