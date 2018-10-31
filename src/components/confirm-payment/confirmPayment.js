import React, { Component } from 'react';
import './confirmPayment.css';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BarLoader } from 'react-spinners';
import swal from 'sweetalert2';

class ConfirmPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userBank: '',
            companyBank: '',
            startDate: moment(),
            kodePesanan: '',
            kodePesananError: '',
            metodePembayaran: '',
            metodePembayaranError: '',
            dariRekening: '',
            dariRekeningError: '',
            nominal: '',
            nominalError: '',
            rekeningTujuan: '',
            rekeningTujuanError: '',
            namaLengkap: '',
            namaLengkapError: '',
            buktiTransfer: '',
            formStatus: false,
            submitLoading: false
        }
    }

    componentWillMount() {
        if (!this.props.location.state) {
            // window.location.href = 'http://localhost:3000/login?referer=/user/confirm-payment'
            window.location.href = '/login?referer=/user/confirm-payment'
        }
    }

    componentDidMount() {
        // console.log(this.props.location.state.data)
        this.request().get('/confirm-payment-v2/bank')
            .then(data => {
                this.setState({
                    loading: false,
                    userBank: data.data.data
                })
            });
        this.request().get('/confirm-payment-v2/company-account')
            .then(data => {
                this.setState({
                    loading: false,
                    companyBank: data.data.data
                })
            });
        if (this.props.location.state.data.payment_method === 'CC-INSTALLMENT' || this.props.location.state.data.payment_method === 'CC') {
            this.setState({
                metodePembayaran: this.props.location.state.data.payment_method,
                kodePesanan: this.props.location.state.data.code,
                nominal: this.props.location.state.data.total_payment,
                namaLengkap: this.props.location.state.data.user_name,
                formStatus: true
            })
        } else {
            this.setState({
                metodePembayaran: this.props.location.state.data.payment_method,
                kodePesanan: this.props.location.state.data.code,
                nominal: this.props.location.state.data.total_payment,
                namaLengkap: this.props.location.state.data.user_name
            })
        }
    }

    handleChange = (date) => {
        this.setState({
            startDate: date
        });
    }

    formOnChange = (e) => {
        if (e.target.id === 'buktiTransfer') {
            this.setState({
                [e.target.id]: e.target.files[0]
            })
        } else {
            if (e.target.value.trim() === '') {
                this.setState({
                    [`${e.target.id}Error`]: 'Harus diisi',
                    formStatus: false
                })
            } else {
                this.setState({
                    [`${e.target.id}Error`]: '',
                    formStatus: true,
                    [e.target.id]: e.target.value
                })
            }
        }
    }

    request = () => {
        const request = axios.create({
            timeout: 30000,
            // baseURL: 'http://localhost:3000',
            baseURL: '',
            headers: {
                access_token: this.props.location.state.data.auth.access_token,
                expired_in: this.props.location.state.data.auth.expired_in
            }
        })
        return request;
    }

    confirmPayment = () => {
        this.setState({
            submitLoading: true
        })
        const data = {
            order_code: this.state.kodePesanan,
            payment_method: this.state.metodePembayaran,
            user_bank_id: this.state.dariRekening,
            payment_total: Number(this.state.nominal),
            bank_destination_id: this.state.rekeningTujuan || document.querySelector("#rekeningTujuan").value,
            transfer_date: moment(this.state.startDate).format('YYYY-MM-DD'),
            account_name: this.state.namaLengkap,
            document: this.state.buktiTransfer
        }

        let formData = new FormData();
        formData.append("order_code", data.order_code);
        formData.append("payment_method", data.payment_method);
        formData.append("user_bank_id", data.user_bank_id);
        formData.append("payment_total", data.payment_total);
        formData.append("bank_destination_id", data.bank_destination_id);
        formData.append("transfer_date", data.transfer_date);
        formData.append("account_name", data.account_name);
        formData.append("document", data.document);

        // console.log(data)

        this.request().post('/confirm-payment-v2/payment/confirmation', formData)
            .then(data => {
                this.setState({
                    submitLoading: false
                })
                if (data.data.status === 'success') {
                    swal({
                        position: 'center',
                        type: 'success',
                        title: 'Konfirmasi Pembayaran Berhasil Dikirim',
                        showConfirmButton: false,
                        timer: 2000,
                        onClose: () => {
                            // this.props.history.goBack();
                            window.location.href = '/user/order/sudah-dibayar'
                        }
                    })
                } else if (data.data.status === 'unauthorized') {
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
                } else if (data.data.status === 'error') {
                    swal({
                        position: 'center',
                        type: 'error',
                        title: 'Oops!',
                        text: data.data.message,
                        showConfirmButton: false,
                        timer: 2000,
                        onClose: () => {
                            // window.location.href = 'http://localhost:3000/login?referer=/user/confirm-payment'
                            // window.location.href = '/login?referer=/user/confirm-payment'
                        }
                    })
                }
                // console.log(data)
            }).catch(function (response) {
                this.setState({
                    submitLoading: false
                })
                console.log(response);
            });
    }

    render() {
        const payload = this.props.location.state.data;
        if (window.innerWidth > 575) {
            return (
                <div style={styles.container}>
                    <div className='container p-0 h-100'>
                        <div className='row h-100'>
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
                                                    <p className='m-0 text-right d-sm-none font-weight-bold'>Confirm Payment</p>
                                                    <h5 className='m-0 text-right d-sm-block d-none font-weight-bold'>Confirm Payment</h5>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body confirm-body">
                                            <form>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Kode Pesanan</label>
                                                    <div className="col-sm-8">
                                                        <input type="text" className="form-control form-control-sm" id="kodePesanan" placeholder='Kode Pesanan' value={payload.code} disabled />
                                                        <small id="kodePesananError" className="form-text text-danger ft-10">{this.state.kodePesananError}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Metode Pembayaran</label>
                                                    <div className="col-sm-8">
                                                        <select className="form-control form-control-sm" id="metodePembayaran" defaultValue={payload.payment_method} onChange={this.formOnChange}>
                                                            <option value=''>-- Pilih --</option>
                                                            <option value='TB-BCA'>Transfer Bank BCA</option>
                                                            <option value='TB-MANDIRI'>Transfer Bank MANDIRI</option>
                                                            <option value='TB-BRI'>Transfer Bank BRI</option>
                                                            <option value='CC'>Kartu Kredit</option>
                                                            <option value='CC-INSTALLMENT'>Cicilan Kartu Kredit</option>
                                                        </select>
                                                        <small id="metodePembayaranError" className="form-text text-danger ft-10">{this.state.metodePembayaranError}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Rekening Tujuan</label>
                                                    <div className="col-sm-8">
                                                        {
                                                            this.state.metodePembayaran === 'CC-INSTALLMENT' || this.state.metodePembayaran === 'CC' ?
                                                                <select className="form-control form-control-sm" id="rekeningTujuan" onChange={this.formOnChange} disabled>
                                                                    <option value=''>-</option>
                                                                    {
                                                                        this.state.companyBank &&
                                                                        this.state.companyBank.map(item =>
                                                                            <option key={'company-' + item.id} value={item.id} selected={payload.payment_method === item.type}>{item.type.split('-')[1]} - {item.account_name} - {item.account_no}</option>
                                                                        )
                                                                    }
                                                                </select> :
                                                                <select className="form-control form-control-sm" id="rekeningTujuan" onChange={this.formOnChange}>
                                                                    <option value=''>-- Pilih --</option>
                                                                    {
                                                                        this.state.companyBank &&
                                                                        this.state.companyBank.map(item =>
                                                                            <option key={'company-' + item.id} value={item.id} selected={payload.payment_method === item.type}>{item.type.split('-')[1]} - {item.account_name} - {item.account_no}</option>
                                                                        )
                                                                    }
                                                                </select>
                                                        }
                                                        <small id="rekeningTujuanError" className="form-text text-danger ft-10">{this.state.rekeningTujuanError}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Dari Rekening</label>
                                                    <div className="col-sm-8">
                                                        {
                                                            this.state.metodePembayaran === 'CC-INSTALLMENT' || this.state.metodePembayaran === 'CC' ?
                                                                <select className="form-control form-control-sm" id="dariRekening" onChange={this.formOnChange} disabled>
                                                                    <option value=''>-</option>
                                                                    {
                                                                        this.state.userBank &&
                                                                        this.state.userBank.map(item =>
                                                                            <option key={'user-' + item.id} value={item.id}>{item.bank_name.split(' ')[1]} - {item.account_name} - {item.account_no}</option>
                                                                        )
                                                                    }
                                                                </select> :
                                                                <select className="form-control form-control-sm" id="dariRekening" onChange={this.formOnChange}>
                                                                    <option value=''>-- Pilih --</option>
                                                                    {
                                                                        this.state.userBank &&
                                                                        this.state.userBank.map(item =>
                                                                            <option key={'user-' + item.id} value={item.id}>{item.bank_name.split(' ')[1]} - {item.account_name} - {item.account_no}</option>
                                                                        )
                                                                    }
                                                                </select>
                                                        }
                                                        <small className="form-text ft-10">Belum mendaftarkan rekening? daftarkan <a href='/user/profile'>disini</a></small>
                                                        <small id="dariRekeningError" className="form-text text-danger ft-10">{this.state.dariRekeningError}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Nama Lengkap</label>
                                                    <div className="col-sm-8">
                                                        <input type="text" className="form-control form-control-sm" id="namaLengkap" placeholder='Nama Lengkap' defaultValue={payload.user_name} onChange={this.formOnChange} />
                                                        <small id="namaLengkapError" className="form-text text-danger ft-10">{this.state.namaLengkapError}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Nominal</label>
                                                    <div className="col-sm-8">
                                                        <input type="text" className="form-control form-control-sm" id="nominal" placeholder='Nominal' defaultValue={payload.total_payment} onChange={this.formOnChange} />
                                                        <small id="nominalError" className="form-text text-danger ft-10">{this.state.nominalError}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Tanggal Transfer</label>
                                                    <div className="col-sm-8">
                                                        <DatePicker
                                                            dateFormat="DD MMM YYYY"
                                                            selected={this.state.startDate}
                                                            onChange={this.handleChange}
                                                            className="form-control form-control-sm" />
                                                        <small id="tanggalTransferError" className="form-text text-danger ft-10"></small>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Bukti Transfer</label>
                                                    <div className="col-sm-8">
                                                        <div className="custom-file">
                                                            <input type="file" className="form-control-file ft-12" id="buktiTransfer" accept="image/*" onChange={this.formOnChange} />
                                                            <small className="form-text ft-10">(opsional untuk mempercepat proses verifikasi)</small>
                                                            <small id="buktiTransferError" className="form-text text-danger ft-10"></small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                            {
                                                this.state.formStatus ?
                                                    this.state.submitLoading ?
                                                        <button id='submitBtn' className="btn btn-block bg-magenta mt-4" disabled>Submit</button> :
                                                        <button id='submitBtn' className="btn btn-block bg-magenta mt-4" onClick={this.confirmPayment}>Submit</button> :
                                                    <button id='submitBtn' className="btn btn-block bg-magenta mt-4" disabled>Submit</button>
                                            }
                                        </div>
                                        {
                                            this.state.submitLoading &&
                                            <BarLoader
                                                width={'100%'}
                                                color={'#007bff'}
                                            />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div style={styles.container}>
                <div className='container p-0 h-100'>
                    <div className='row'>
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
                                                <p className='m-0 text-right d-sm-none font-weight-bold'>Confirm Payment</p>
                                                <h5 className='m-0 text-right d-sm-block d-none font-weight-bold'>Confirm Payment</h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body confirm-body">
                                        <form>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Kode Pesanan</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control form-control-sm" id="kodePesanan" placeholder='Kode Pesanan' value={payload.code} disabled />
                                                    <small id="kodePesananError" className="form-text text-danger ft-10">{this.state.kodePesananError}</small>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Metode Pembayaran</label>
                                                <div className="col-sm-8">
                                                    <select className="form-control form-control-sm" id="metodePembayaran" defaultValue={payload.payment_method} onChange={this.formOnChange}>
                                                        <option value=''>-- Pilih --</option>
                                                        <option value='TB-BCA'>Transfer Bank BCA</option>
                                                        <option value='TB-MANDIRI'>Transfer Bank MANDIRI</option>
                                                        <option value='TB-BRI'>Transfer Bank BRI</option>
                                                        <option value='CC'>Kartu Kredit</option>
                                                        <option value='CC-INSTALLMENT'>Cicilan Kartu Kredit</option>
                                                    </select>
                                                    <small id="metodePembayaranError" className="form-text text-danger ft-10">{this.state.metodePembayaranError}</small>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Rekening Tujuan</label>
                                                <div className="col-sm-8">
                                                    {
                                                        this.state.metodePembayaran === 'CC-INSTALLMENT' || this.state.metodePembayaran === 'CC' ?
                                                            <select className="form-control form-control-sm" id="rekeningTujuan" onChange={this.formOnChange} disabled>
                                                                <option value=''>-</option>
                                                                {
                                                                    this.state.companyBank &&
                                                                    this.state.companyBank.map(item =>
                                                                        <option key={'company-' + item.id} value={item.id} selected={payload.payment_method === item.type}>{item.type.split('-')[1]} - {item.account_name} - {item.account_no}</option>
                                                                    )
                                                                }
                                                            </select> :
                                                            <select className="form-control form-control-sm" id="rekeningTujuan" onChange={this.formOnChange}>
                                                                <option value=''>-- Pilih --</option>
                                                                {
                                                                    this.state.companyBank &&
                                                                    this.state.companyBank.map(item =>
                                                                        <option key={'company-' + item.id} value={item.id} selected={payload.payment_method === item.type}>{item.type.split('-')[1]} - {item.account_name} - {item.account_no}</option>
                                                                    )
                                                                }
                                                            </select>
                                                    }
                                                    <small id="rekeningTujuanError" className="form-text text-danger ft-10">{this.state.rekeningTujuanError}</small>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Dari Rekening</label>
                                                <div className="col-sm-8">
                                                    {
                                                        this.state.metodePembayaran === 'CC-INSTALLMENT' || this.state.metodePembayaran === 'CC' ?
                                                            <select className="form-control form-control-sm" id="dariRekening" onChange={this.formOnChange} disabled>
                                                                <option value=''>-</option>
                                                                {
                                                                    this.state.userBank &&
                                                                    this.state.userBank.map(item =>
                                                                        <option key={'user-' + item.id} value={item.id}>{item.bank_name.split(' ')[1]} - {item.account_name} - {item.account_no}</option>
                                                                    )
                                                                }
                                                            </select> :
                                                            <select className="form-control form-control-sm" id="dariRekening" onChange={this.formOnChange}>
                                                                <option value=''>-- Pilih --</option>
                                                                {
                                                                    this.state.userBank &&
                                                                    this.state.userBank.map(item =>
                                                                        <option key={'user-' + item.id} value={item.id}>{item.bank_name.split(' ')[1]} - {item.account_name} - {item.account_no}</option>
                                                                    )
                                                                }
                                                            </select>
                                                    }
                                                    <small className="form-text ft-10">Belum mendaftarkan rekening? daftarkan <a href='/user/profile'>disini</a></small>
                                                    <small id="dariRekeningError" className="form-text text-danger ft-10">{this.state.dariRekeningError}</small>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Nama Lengkap</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control form-control-sm" id="namaLengkap" placeholder='Nama Lengkap' defaultValue={payload.user_name} onChange={this.formOnChange} />
                                                    <small id="namaLengkapError" className="form-text text-danger ft-10">{this.state.namaLengkapError}</small>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Nominal</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control form-control-sm" id="nominal" placeholder='Nominal' defaultValue={payload.total_payment} onChange={this.formOnChange} />
                                                    <small id="nominalError" className="form-text text-danger ft-10">{this.state.nominalError}</small>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Tanggal Transfer</label>
                                                <div className="col-sm-8">
                                                    <DatePicker
                                                        dateFormat="DD MMM YYYY"
                                                        selected={this.state.startDate}
                                                        onChange={this.handleChange}
                                                        className="form-control form-control-sm" />
                                                    <small id="tanggalTransferError" className="form-text text-danger ft-10"></small>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label htmlFor="colFormLabel" className="col-sm-4 col-form-label col-form-label-sm">Bukti Transfer</label>
                                                <div className="col-sm-8">
                                                    <div className="custom-file">
                                                        <input type="file" className="form-control-file ft-12" id="buktiTransfer" accept="image/*" onChange={this.formOnChange} />
                                                        <small className="form-text ft-10">(opsional untuk mempercepat proses verifikasi)</small>
                                                        <small id="buktiTransferError" className="form-text text-danger ft-10"></small>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                        {
                                            this.state.formStatus ?
                                                <button id='submitBtn' className="btn btn-block bg-magenta mt-4" onClick={this.confirmPayment}>Submit</button> :
                                                <button id='submitBtn' className="btn btn-block bg-magenta mt-4" disabled>Submit</button>
                                        }
                                    </div>
                                    {
                                        this.state.submitLoading &&
                                        <BarLoader
                                            width={'100%'}
                                            color={'#007bff'}
                                        />
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

export default withRouter(ConfirmPayment);