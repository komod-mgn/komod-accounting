type TPropertyType = (
    'string' |
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

    // enum, ref
    optionsMap ?: IPropertyOptionsMap
    multiple ?: boolean
    controlFormatter ?: (od: TPropertyOptionDescription) => string
}
