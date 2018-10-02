import IPropertyBaseView from './IPropertyBaseView'

export default interface ITablePageView {
    storeModuleName: string
    routeName: string

    hideIndex ?: boolean

    defaultSort: {
        prop: string
        order: 'ascending' | 'descending'
    }

    itemBaseProperties: Array<IPropertyBaseView>
    itemComputedTableProperties: Array<IPropertyBaseView>

    // Если нужно кастомно задавать порядок, например,
    // вычисляемые свойства не после реальных, а перед / между
    customTablePropertiesOrder ?: Array<string>
}
