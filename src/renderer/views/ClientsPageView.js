import { ROUTE_NAME_CLIENTS } from '@/router'
import { KomodClientStatusEnum } from '@/types/KomodClient'
import { requiredFieldMessage } from '@/utils/validation'

/**
 * @type {ITablePageView}
 */
export default {
  storeModuleName: 'clients',
  routeName: ROUTE_NAME_CLIENTS,

  defaultSort: {
    prop: 'lastName',
    order: 'ascending',
  },

  itemBaseProperties: [
    {
      name: 'lastName',
      label: 'Фамилия',
      type: 'string',
      minWidth: 120,
      fixedToSide: 'left',
      sortable: true,
      filterable: true,
    },
    {
      name: 'firstName',
      label: 'Имя',
      type: 'string',
      minWidth: 100,
      fixedToSide: 'left',
      sortable: true,
      filterable: true,
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'multienum',
      minWidth: 150,
      optionsMap: KomodClientStatusEnum,
      tableFormatter: (row, col, vals) => vals
        .map(val => KomodClientStatusEnum[val])
        .join(', '),
      filterable: true,
      validationRules: [
        {
          required: true,
          trigger: ['blur', 'change'],
          message: requiredFieldMessage,
        },
      ],
    },
    {
      name: 'idDocument',
      label: 'Удостоверение №',
      type: 'string',
      minWidth: 170,
      sortable: true,
      filterable: true,
    },
    {
      name: 'phoneNumber',
      label: 'Телефон',
      type: 'string',
      minWidth: 100,
      filterable: true,
    },
    {
      name: 'comment',
      label: 'Комментарий',
      type: 'string',
      minWidth: 110,
      filterable: true,
    },
    {
      name: 'seasonItemsLimit',
      label: 'Норма на сезон',
      type: 'number',
      minWidth: 90,
      min: 1,
      sortable: true,
    },
  ],

  itemComputedTableProperties: [
    {
      name: 'itemsAmountCurrentSeason',
      label: 'Кол-во взятых вещей (сезон)',
      type: 'number',
      minWidth: 150,
      sortable: true,
    },
    {
      name: 'itemsAmountTotal',
      label: 'Кол-во взятых вещей (всего)',
      type: 'number',
      minWidth: 150,
      sortable: true,
    },
    {
      name: 'lastTransactionDate',
      label: 'Последнее посещение',
      type: 'datetime',
      minWidth: 220,
      sortable: true,
      filterable: true,
    },
  ],
}
