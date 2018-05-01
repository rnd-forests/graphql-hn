import { verify } from 'jsonwebtoken'
import { APP_SECRET } from './constants'

function getUserId(context) {
    const auth = context.request.get('Authorization')
    if (auth) {
        const token = auth.replace('Bearer ', '')
        const { userId } = verify(token, APP_SECRET)
        return userId
    }

    throw new Error('Not authenticated')
}

export default {
    getUserId,
}
