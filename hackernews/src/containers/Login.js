import { connect } from 'react-redux'
import { login } from '../actions/auth'
import Login from '../components/Login'

const mapDispatchToProps = (dispatch) => ({
  storeUserData: (token, refreshToken) => dispatch(login(token, refreshToken))
})

export default connect(null, mapDispatchToProps)(Login)
