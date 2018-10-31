import {
    CHANGE_PAGE,
    LOAD_INVOICE_LIST_SUCCESS,
    LOAD_INVOICE_LIST_LOADING,
    LOAD_INVOICE_LIST_ERROR
} from './page.actionTypes';
import axios from 'axios';
import swal from 'sweetalert2';

export const loadInvoiceList = (payload) => {
    // console.log(payload)
    return dispatch => {
        dispatch(loadInvoiceListLoading());
        const instance = axios.create({
            timeout: 30000,
            // baseURL: 'http://localhost:3000',
            baseURL: '',
            headers: {
                access_token: payload.access_token,
                expired_in: payload.expired_in
            }
        })
        instance.get(`/confirm-payment-v2/list?page=${payload.page}`)
            .then(data => {
                if (data.data.status === 'unauthorized') {
                    swal({
                        position: 'center',
                        type: 'error',
                        title: 'Authorization Expired!',
                        text: 'Please login to your gigel account',
                        showConfirmButton: false,
                        timer: 2000,
                        onClose: () => {
                            // window.location.href = 'http://localhost:3000/login?referer=/user/confirm-payment'
                            window.location.href = '/login?referer=/user/confirm-payment'
                        }
                    })
                }
                dispatch(loadInvoiceListSuccess({data: data.data, page: payload.page}));
            })
            .catch(err => {
                dispatch(loadInvoiceListError());
            })
    }
}

export const changePage = (payload) => {
    return {
        type: CHANGE_PAGE,
        payload
    }
}

const loadInvoiceListSuccess = (payload) => {
    return {
        type: LOAD_INVOICE_LIST_SUCCESS,
        payload
    }
}

const loadInvoiceListLoading = () => {
    return {
        type: LOAD_INVOICE_LIST_LOADING,
    }
}

const loadInvoiceListError = () => {
    return {
        type: LOAD_INVOICE_LIST_ERROR,
    }
}