export const ldapServer = {
    host : process.env.ldapServerName || 'myLdapServer',
    port : process.env.ldapServerPort || '389',
    ou: process.env.ldapServerOU || 'ou=People,o=someOrganization,o=somePlace'
};

export const authServer = {
    server : {
        host: process.env.authServer || 'localhost',
        port: process.env.authServerPort || 3000
    }
}
