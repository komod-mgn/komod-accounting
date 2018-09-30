import IPropertyBaseView from "./IPropertyBaseView";

export default interface ITablePageView {
    storeModuleName: string
    routeName: string

    defaultSort: {
        prop: string
        order: 'ascending' | 'descending'
    }

    itemBaseProperties: Array<IPropertyBaseView>
    itemComputedTableProperties: Array<IPropertyBaseView>
}
