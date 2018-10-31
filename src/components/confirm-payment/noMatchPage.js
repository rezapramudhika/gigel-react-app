import React, { Component } from 'react';

class NoMatchPage extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
        // window.location.href = 'http://localhost:3000/not-found'
        window.location.href = '/not-found'
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}

export default NoMatchPage;