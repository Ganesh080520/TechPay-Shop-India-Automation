const productCatalog = {

    // =========================================================
    // LAPTOPS
    // =========================================================
    Laptops: {

        search: 'Laptop',

        filters: {

            Manufacturer: 'HP',

            'Graphics Card': 'Intel Graphics',

            // Enable these filters only when required
            // and make sure the exact option exists in the UI.

            // 'Sub Category': 'Gaming',
            // 'Ram Size': '16GB',
            // 'Ram Type': 'DDR5',
            // 'Screen Size': '15.6 inches',
            // 'Storage Size': '1TB',
            // 'Storage Type': 'SSD',
            // 'Operating System': 'Windows 11',
            // 'Display Type': 'IPS',
            // 'Resolution': '1920*1080',
            // 'Processor Type': 'Intel Core i7',
            // Touchscreen: 'No',
            // Warranty: '1 year'
        }
    },


    // =========================================================
    // DESKTOPS
    // =========================================================
    Desktops: {

        search: 'Desktop',

        filters: {

            Manufacturer: 'HP',

            // 'Sub Category': 'Business',
            // 'Ram Size': '16GB',
            // 'Storage Size': '1TB',
            // 'Storage Type': 'SSD',
            // 'Operating System': 'Windows 11'
        }
    },


    // =========================================================
    // PRINTERS
    // =========================================================
    Printers: {

        search: 'Printer',

        filters: {

            Manufacturer: 'HP',

            // 'Sub Category': 'Inkjet',
            // Functionality: 'Print',
            // Connectivity: 'USB'
        }
    },


    // =========================================================
    // PERIPHERALS
    // =========================================================
    Peripherals: {

        search: 'Peripheral',

        filters: {

            Manufacturer: 'HP',

            // 'Sub Category': 'Speakers',
            // Connectivity: 'Wireless'
        }
    }
};


// =============================================================
// NORMALIZE CATEGORY
// =============================================================

function normalizeCategory(category) {

    if (!category) {

        throw new Error(
            'Category was not provided.'
        );
    }

    const value = category
        .trim()
        .toLowerCase();


    const categoryMap = {

        laptop: 'Laptops',
        laptops: 'Laptops',

        desktop: 'Desktops',
        desktops: 'Desktops',

        printer: 'Printers',
        printers: 'Printers',

        peripheral: 'Peripherals',
        peripherals: 'Peripherals'
    };


    const normalized = categoryMap[value];


    if (!normalized) {

        throw new Error(
            `Unsupported product category: ${category}`
        );
    }


    return normalized;
}


// =============================================================
// GET PRODUCT CONFIGURATION
// =============================================================

function getProductConfiguration(category) {

    const normalizedCategory =
        normalizeCategory(category);


    return {

        category: normalizedCategory,

        data: productCatalog[
            normalizedCategory
        ]
    };
}


// =============================================================
// EXPORT
// =============================================================

module.exports = {

    productCatalog,

    normalizeCategory,

    getProductConfiguration
};