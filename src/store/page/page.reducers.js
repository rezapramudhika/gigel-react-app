import {
    CHANGE_PAGE,
    LOAD_INVOICE_LIST_SUCCESS,
    LOAD_INVOICE_LIST_LOADING,
    LOAD_INVOICE_LIST_ERROR
} from './page.actionTypes';

const initialState = {
    page: 1,
    data: [],
    loadInvoiceListLoading: false,
    loadInvoiceListError: false
}

const reducers = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_PAGE:
            return {
                ...state,
                page: action.payload
            }
        case LOAD_INVOICE_LIST_SUCCESS:
            return {
                ...state,
                data: action.payload.data,
                page: action.payload.page,
                loadInvoiceListLoading: false,
                loadInvoiceListError: false,
            }
        case LOAD_INVOICE_LIST_LOADING:
            return {
                ...state,
                loadInvoiceListLoading: true,
                loadInvoiceListError: false,
            }
        case LOAD_INVOICE_LIST_ERROR:
            return {
                ...state,
                loadInvoiceListLoading: false,
                loadInvoiceListError: true,
            }
        default:
            return state;
    }
}

export default reducers;