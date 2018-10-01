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
}
