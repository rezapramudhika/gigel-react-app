import React, { Component } from 'react';
import './confirmPayment.css';
import { IoIosArrowForward } from "react-icons/io";
import { withRouter } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
import { MoneyConverter } from '../../helper/currency';
import aesjs from 'aes-js';
import swal from 'sweetalert2';
import Pagination from './pagination';
import { connect } from 'react-redux';
import { loadInvoiceList } from '../../store/page/page.actions';
import { bindActionCreators } from 'redux';

class ConfirmPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: '',
            auth: '',
            authorization: ''
        }
    }
    componentDidMount() {
        const key_256 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
            29, 30, 31];
        // var encryptedBytes = aesjs.utils.hex.toBytes(this.props.location.pathname.substring(1));
        var encryptedBytes = aesjs.utils.hex.toBytes(this.props.location.pathname.split('/')[4]);
        
        // The counter mode of operation maintains internal state, so to
        // decrypt a new instance must be instantiated.
        var aesCtr = new aesjs.ModeOfOperation.ctr(key_256, new aesjs.Counter(5));
        var decryptedBytes = ''
        try {
            decryptedBytes = aesCtr.decrypt(encryptedBytes);
        } catch (error) {
            this.props.history.push('/page/404');
        }

        // Convert our bytes back into text
        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        let authorization = '';
        try {
            authorization = JSON.parse(decryptedText);
            this.setState({
                authorization
            })
        } catch (error) {
            swal({
                position: 'center',
                type: 'error',
                title: 'Authorization Required!',
                text: 'Please login to your gigel account',
                showConfirmButton: false,
                timer: 2000,
                onClose: () => {
                    // window.location.href = 'http://localhost:3000/login?referer=/user/confirm-payment'
                    window.location.href = '/login?referer=/user/confirm-payment'
                }
            })
        }
        if (authorization.access_token) {

            this.props.loadInvoiceList({
                access_token: authorization.access_token,
                expired_in: authorization.expired_in,
                page: this.props.page.page
            })
        }
    }

    linkToConfirmPayment = (data) => {
        this.props.history.push({
            // pathname: '/confirm',
            pathname: '/user/confirm-payment/v2/confirm',
            state: {
                data: {
                    ...data,
                    auth: this.state.authorization
                }
            }
        })
    }

    render() {
        return (
            <div style={styles.container}>
                <div className='container p-0 container-h-100'>
                    <div className='row container-h-100 mx-3'>
                        <div className='col align-self-center p-0'>
                            <div className="row justify-content-center">
                                <div className="col-md-6 col-sm-12 p-0">
                                    <div className="card-header confirm-header">
                                        <div className='row align-items-center'>
                                            <div className='col-wrap'>
                                                <a href='/'>
                                                    <img src='/images/gigel-logo.png' alt='gigel-logo' width={80}></img>
                                                </a>
                                            </div>
                                            <div className='col'>
                                                <p className='m-0 text-right d-sm-none font-weight-bold'>Choose Invoice</p>
                                                <h5 className='m-0 text-right d-sm-block d-none font-weight-bold'>Choose Invoice</h5>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        this.props.page.loadInvoiceListLoading ?
                                            <div className="card-body confirm-body h-75">
                                                <div className='row h-100 align-items-center'>
                                                    <div className='col text-center'>
                                                        <div className='text-center align-items-center'>
                                                            <ClipLoader
                                                                color={'#3d4b63'}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> :
                                            <div className="card-body confirm-body">
                                                {
                                                    this.props.page.data.length !== 0 && this.props.page.data.data.map(item =>
                                                        moment(item.expiry_at).isAfter(moment()) ?
                                                            <div key={item.code} className="card card-active w-100 mb-2" onClick={() => this.linkToConfirmPayment(item)}>
                                                                <div className="card-body">
                                                                    <div className='row align-items-center'>
                                                                        <div className='col'>
                                                                            <h5 className="card-title font-weight-bold mb-2">{item.code}</h5>
                                                                            <p className="card-text">Total Payment : {MoneyConverter(item.total_payment)}</p>
                                                                            {
                                                                                item.payment_confirmation.length > 0 ?
                                                                                    <p className="card-text">Status : <span className='text-info font-weight-bold'>Sedang dalam proses verifikasi</span></p> :
                                                                                    <p className="card-text">Status : <span className='text-warning font-weight-bold'>{item.status_name}</span></p>
                                                                            }
                                                                            {
                                                                                moment(item.expiry_at).isAfter(moment()) ?
                                                                                    <p className="card-text">Pay before {moment(item.expiry_at).format('DD MMM YYYY HH:mm:ss')}</p> :
                                                                                    // <p className="card-text">Expires {moment(item.expiry_at).from(moment())}</p> :
                                                                                    <p className="card-text">Expired at <span className='text-danger font-weight-bold'>{moment(item.expiry_at).format('DD MMM YYYY HH:mm:ss')}</span></p>
                                                                                // <p className="card-text">Expired At : <span className='text-danger font-weight-bold'>{moment(item.expiry_at).from(moment())} (Expired)</span></p>

                                                                            }
                                                                            <p className="card-text text-muted">Created {moment(item.created_at, 'YYYY-MM-DD HH:mm:ss').fromNow()}</p>
                                                                        </div>
                                                                        <div className='col-wrap'>
                                                                            <IoIosArrowForward />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div> :
                                                            <div key={item.code} className="card card-disable w-100 mb-2">
                                                                <div className="card-body">
                                                                    <div className='row align-items-center'>
                                                                        <div className='col'>
                                                                            <h5 className="card-title font-weight-bold mb-2">{item.code}</h5>
                                                                            <p className="card-text">Total Payment : {MoneyConverter(item.total_payment)}</p>
                                                                            {
                                                                                item.payment_confirmation.length > 0 ?
                                                                                    <p className="card-text">Status : <span className='text-info font-weight-bold'>Sedang dalam proses verifikasi</span></p> :
                                                                                    <p className="card-text">Status : <span className='text-warning font-weight-bold'>{item.status_name}</span></p>
                                                                            }
                                                                            <p className="card-text">Expired at <span className='text-danger font-weight-bold'>{moment(item.expiry_at).format('DD MMM YYYY HH:mm:ss')}</span></p>
                                                                            <p className="card-text text-muted">Created {moment(item.created_at, 'YYYY-MM-DD HH:mm:ss').fromNow()}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    )
                                                }
                                                {
                                                    this.state.authorization && <Pagination auth={{ access_token: this.state.authorization.access_token, expired_in: this.state.authorization.expired_in }} />
                                                }
                                                {
                                                    this.props.page.data.length !== 0 && this.props.page.data.data.length === 0 &&
                                                    <div className='row align-items-center'>
                                                        <div className='col text-center'>
                                                            <h4>Anda belum memiliki transaksi</h4>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const styles = {
    container: {
        height: '100vh',
        backgroundImage: "url('/images/bg-memphis.jpg')"
    },
    h100vh: {
        height: '100vh',
    },
    center: {
        display: 'block',
        margin: '0 auto'
    }
}

const mapStateToProps = state => {
    return {
        page: state.page
    }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
    loadInvoiceList
}, dispatch)


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConfirmPayment));
