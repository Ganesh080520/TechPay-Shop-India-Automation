const stores = {

    payUPartnered: {
        storeName: 'PayU Partner Store',
        payment: {
            online: true,
            offline: true
        }
    },

    nonPayUPartnered: {
        storeName: 'non PayU Partner Store',
        payment: {
            online: false,
            offline: true
        }
    }
};

module.exports = {
    stores
};