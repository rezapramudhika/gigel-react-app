import axios from 'axios';

const request = axios.create({
    timeout: 30000,
    baseURL: 'http://128.199.85.124:9234/api/v1',
    headers: {
        Authorization: this.props.location.state.data.auth
    }
})

export default request;