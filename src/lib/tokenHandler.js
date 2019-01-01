import jwt from 'jsonwebtoken'
import fs from 'fs'

// https://github.com/auth0/node-jsonwebtoken
const cert= fs.readFileSync('config/secrets/cert.pem');
const key= fs.readFileSync('config/secrets/key.pem');
const exp='7d';
const issuer='https://dev-auth2.fixingthe.net/';



export default {
    sign: function(payload) {
        return jwt.sign(
            payload,
            key,
            { algorithm: 'RS256',
              expiresIn: exp,
              issuer: issuer
            }
        )
    },
    verify: function(token) {
        return jwt.verify(
            token,
            cert,
            {
                algorithm: 'RS256',
                issuer: issuer
            }
        )
    }
}
