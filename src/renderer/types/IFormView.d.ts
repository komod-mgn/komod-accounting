import IPropertyBaseView from './IPropertyBaseView';

export default interface IFormView {
    name : string
    fields : Array<IPropertyBaseView>
}
