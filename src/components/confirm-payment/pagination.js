import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadInvoiceList } from '../../store/page/page.actions';
import { bindActionCreators } from 'redux';

class Pagination extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    changePagination = (page) => {
        this.props.loadInvoiceList({
            access_token: this.props.auth.access_token,
            expired_in: this.props.auth.expired_in,
            page: page
        })
    }

    render() {
        if (this.props.page.data.length !== 0 && this.props.page.data.meta.total_page > 1) {
            const data = this.props.page.data.meta;
            return (
                <nav aria-label='navigation' className='pagination-wrap'>
                    <ul className='pagination pagination-v1 justify-content-center mb-0'>
                        {
                            (function (rows, i, len, currentPage, changePagination) {
                                if (len < 6) {
                                    for (let i = 1; i <= len; i++) {
                                        if (i === currentPage) {
                                            rows.push(
                                                <li key={i}>
                                                    <a className='active' onClick={() => changePagination(i)}>{i}</a>
                                                </li>
                                            )
                                            // li.page-item
                                            //     a.page-link.active(href="/notification?page=#{i}") #{i}
                                        } else {
                                            rows.push(
                                                <li key={i}>
                                                    <a onClick={() => changePagination(i)}>{i}</a>
                                                </li>
                                            )
                                            // li.page-item
                                            //     a.page-link(href="/notification?page=#{i}") #{i}
                                        }
                                    }
                                } else {
                                    var max_num = 2;
                                    var start;
                                    if (currentPage < len) {
                                        if (currentPage === 1) {
                                            start = 1;
                                        } else {
                                            start = currentPage - 1;
                                        }
                                        max_num = parseInt(currentPage) + 2;
                                    } else {
                                        if (currentPage === len)
                                            start = currentPage - 1;
                                        else
                                            start = 1;
                                    }
                                    if (max_num > len)
                                        max_num = len

                                    if (currentPage > 2) {
                                        rows.push(
                                            <li key={'first'}>
                                                <a onClick={() => changePagination(1)}>1</a>
                                            </li>
                                            // li.page-item
                                            //     a.page-link(href="/notification?page=#{1}") 
                                        )
                                        rows.push(
                                            <li key={'prev'}>
                                                <a onClick={() => changePagination(Number(currentPage) - 1)}>{'<'}</a>
                                            </li>
                                            // li.page-item
                                            //     a.fa.fa-angle-left.page-link(href="/notification?page=#{Number(currentPage)-1}")
                                        )
                                    }
                                    if (currentPage === len) {
                                        for (let i = currentPage - 1; i < currentPage; i++) {
                                            rows.push(
                                                <li key={i}>
                                                    <a onClick={() => changePagination(i)}>{i}</a>
                                                </li>
                                                // li.page-item
                                                //    a.page-link(href="/notification?page=#{i}") #{i}
                                            )
                                        }
                                    } else {
                                        for (let i = start; i <= max_num; i++) {
                                            if (i === currentPage) {
                                                rows.push(
                                                    <li key={i}>
                                                        <a className='active' onClick={() => changePagination(i)}>{i}</a>
                                                    </li>
                                                    // li.page-item
                                                    //     a.page-link.active(href="/notification?page=#{i}") #{i}
                                                )
                                            } else {
                                                rows.push(
                                                    <li key={i}>
                                                        <a onClick={() => changePagination(i)}>{i}</a>
                                                    </li>
                                                    // li.page-item
                                                    //     a.page-link(href="/notification?page=#{i}") #{i}
                                                )
                                            }
                                        }
                                    }
                                    if (currentPage === len) {
                                        rows.push(
                                            <li key={currentPage}>
                                                <a className='active' onClick={() => changePagination(currentPage)}>{currentPage}</a>
                                            </li>
                                            // li.page-item
                                            //     a.page-link.active(href="/notification?page=#{currentPage}") #{currentPage}
                                        )
                                    } else if (len > max_num) {
                                        rows.push(
                                            <li key={'next'}>
                                                <a onClick={() => changePagination(Number(currentPage) + 1)}>{'>'}</a>
                                            </li>
                                            // li.page-item
                                            //     a.fa.fa-angle-right.page-link(href="/notification?page=#{Number(currentPage)+1}")
                                        )
                                        rows.push(
                                            <li key={'last'}>
                                                <a onClick={() => changePagination(len)}>{len}</a>
                                            </li>
                                            // li.page-item
                                            //     a.page-link(href="/notification?page=#{data.meta.total_page}") #{data.meta.total_page}
                                        )
                                    }
                                }

                                return rows;
                            })([], 0, data.total_page, this.props.page.page, this.changePagination)
                        }
                    </ul>
                </nav>
            );
        } else {
            return (
                <div></div>
            );
        }
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

export default connect(mapStateToProps, mapDispatchToProps)(Pagination)