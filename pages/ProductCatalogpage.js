const productCatalog = {

    Laptops: {

        search: 'Laptop',

        filters: {

            Manufacturer: "HP",

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


    Printers: {

        search: 'Printer',

        filters: {

            Manufacturer: 'HP',

            // 'Sub Category': 'Inkjet',

            // Functionality: 'Print',

            // Connectivity: 'USB'
        }
    },


    Peripherals: {

        search: 'Peripheral',

        filters: {

            Manufacturer: 'HP',

            // 'Sub Category': 'Speakers',

            // Connectivity: 'Wireless'
        }
    }
};


function normalizeCategory(category) {

    if (!category) {
        throw new Error('Category was not provided.');
    }

    const value = category.trim().toLowerCase();

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


function getProductConfiguration(category) {

    const normalizedCategory = normalizeCategory(category);

    return {
        category: normalizedCategory,
        data: productCatalog[normalizedCategory]
    };
}


module.exports = {
    productCatalog,
    normalizeCategory,
    getProductConfiguration
};